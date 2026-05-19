<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Mockery;
use Mockery\MockInterface;
use App\Services\MutationService;
use App\Models\StockMutation;
use App\Models\StockMutationItem;
use App\Repositories\Contracts\MutationRepositoryInterface;
use App\Repositories\Contracts\InventoryRepositoryInterface;

use Illuminate\Support\Facades\Event;

class MutationServiceTest extends TestCase
{


    protected MutationService $service;
    protected MockInterface $mutationRepo;
    protected MockInterface $inventoryRepo;

    protected function setUp(): void
    {
        parent::setUp();

        $this->mutationRepo = Mockery::mock(MutationRepositoryInterface::class);
        $this->inventoryRepo = Mockery::mock(InventoryRepositoryInterface::class);

        $this->service = new MutationService($this->mutationRepo, $this->inventoryRepo);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ─────────────────────────────────────────────
    // Status Transition Guards — S8-B05
    // ─────────────────────────────────────────────

    public function test_ship_throws_when_not_preparing(): void
    {
        $mutation = $this->createMockMutation('shipped');

        $this->mutationRepo->shouldReceive('findById')->with(1)->andReturn($mutation);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage("status 'preparing'");

        $this->service->ship(1, 1);
    }

    public function test_receive_throws_when_not_shipped(): void
    {
        $mutation = $this->createMockMutation('preparing');

        $this->mutationRepo->shouldReceive('findById')->with(1)->andReturn($mutation);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage("status 'shipped'");

        $this->service->receive(1, [], 1);
    }

    public function test_complete_throws_when_not_received(): void
    {
        $mutation = $this->createMockMutation('shipped');

        $this->mutationRepo->shouldReceive('findById')->with(1)->andReturn($mutation);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage("status 'received'");

        $this->service->complete(1);
    }

    // ─────────────────────────────────────────────
    // Ship — FR-603
    // ─────────────────────────────────────────────

    public function test_ship_deducts_stock_from_source(): void
    {
        Event::fake();

        $item1 = new StockMutationItem(['product_id' => 1, 'quantity_sent' => 10]);
        $item2 = new StockMutationItem(['product_id' => 2, 'quantity_sent' => 5]);

        $mutation = $this->createMockMutation('preparing');
        $mutation->shouldReceive('getAttribute')->with('items')->andReturn(collect([$item1, $item2]));
        $mutation->shouldReceive('getAttribute')->with('from_location_id')->andReturn(1);

        $this->mutationRepo->shouldReceive('findById')->with(1)->andReturn($mutation);

        // Expect stock deduction for each item from source location
        $this->inventoryRepo->shouldReceive('deductStock')
            ->once()
            ->with(1, 1, 10.0);
        $this->inventoryRepo->shouldReceive('deductStock')
            ->once()
            ->with(2, 1, 5.0);

        $updatedMutation = $this->createMockMutation('shipped');
        $updatedMutation->shouldReceive('getAttribute')->with('items')->andReturn(collect([$item1, $item2]));
        $updatedMutation->shouldReceive('getAttribute')->with('from_location_id')->andReturn(1);

        $this->mutationRepo->shouldReceive('update')
            ->once()
            ->with(1, Mockery::on(fn($data) => $data['status'] === 'shipped'))
            ->andReturn($updatedMutation);

        $result = $this->service->ship(1, 1);

        $this->assertTrue($result->isShipped());
    }

    // ─────────────────────────────────────────────
    // Receive — FR-604, FR-605
    // ─────────────────────────────────────────────

    public function test_receive_calculates_loss_correctly(): void
    {
        Event::fake();

        $item = Mockery::mock(StockMutationItem::class)->makePartial();
        $item->id = 1;
        $item->product_id = 1;
        $item->quantity_sent = 10;
        $item->shouldReceive('update')->once()->with(Mockery::on(function ($data) {
            // Sent 10, received 8 → loss = 2
            return $data['quantity_received'] == 8.0
                && $data['loss_quantity'] == 2.0;
        }));

        $mutation = $this->createMockMutation('shipped');
        $mutation->shouldReceive('getAttribute')->with('items')->andReturn(collect([$item]));
        $mutation->shouldReceive('getAttribute')->with('from_location_id')->andReturn(1);
        $mutation->shouldReceive('getAttribute')->with('to_location_id')->andReturn(2);

        $this->mutationRepo->shouldReceive('findById')->with(1)->andReturn($mutation);

        // Source inventory for WAC transfer cost
        $sourceInv = (object) ['avg_cost' => 5000];
        $this->inventoryRepo->shouldReceive('getByProductAndLocation')
            ->with(1, 1) // source location
            ->andReturn($sourceInv);

        // Add stock at destination with WAC recalc (FR-604)
        $this->inventoryRepo->shouldReceive('updateOrCreateStock')
            ->once()
            ->with(1, 2, 8.0, 5000.0); // 8 received at source's avg_cost

        $updatedMutation = $this->createMockMutation('received');
        $this->mutationRepo->shouldReceive('update')
            ->once()
            ->with(1, Mockery::on(fn($data) => $data['status'] === 'received'))
            ->andReturn($updatedMutation);

        $result = $this->service->receive(1, [
            ['item_id' => 1, 'quantity_received' => 8],
        ], 2);

        $this->assertTrue($result->isReceived());
    }

    // ─────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────

    protected function createMockMutation(string $status): MockInterface
    {
        $mutation = Mockery::mock(StockMutation::class)->makePartial();
        $mutation->status = $status;
        $mutation->mutation_number = 'MUT-TEST-20260519-0001';
        return $mutation;
    }
}
