<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Mockery;
use Mockery\MockInterface;
use App\Services\WasteService;
use App\Models\WasteRequest;
use App\Models\WasteRequestItem;
use App\Repositories\Contracts\WasteRepositoryInterface;
use App\Repositories\Contracts\InventoryRepositoryInterface;

use Illuminate\Support\Facades\Event;

class WasteServiceTest extends TestCase
{


    protected WasteService $service;
    protected MockInterface $wasteRepo;
    protected MockInterface $inventoryRepo;

    protected function setUp(): void
    {
        parent::setUp();

        $this->wasteRepo = Mockery::mock(WasteRepositoryInterface::class);
        $this->inventoryRepo = Mockery::mock(InventoryRepositoryInterface::class);

        $this->service = new WasteService($this->wasteRepo, $this->inventoryRepo);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ─────────────────────────────────────────────
    // Approve — FR-704: stok dipotong
    // ─────────────────────────────────────────────

    public function test_approve_deducts_stock_for_each_item(): void
    {
        Event::fake();

        $item1 = new WasteRequestItem(['product_id' => 1, 'quantity' => 5]);
        $item2 = new WasteRequestItem(['product_id' => 2, 'quantity' => 3]);

        $waste = $this->createMockWaste('pending');
        $waste->shouldReceive('getAttribute')->with('items')->andReturn(collect([$item1, $item2]));
        $waste->shouldReceive('getAttribute')->with('location_id')->andReturn(1);

        $this->wasteRepo->shouldReceive('findById')->with(1)->andReturn($waste);

        // Expect stock deduction for each waste item
        $this->inventoryRepo->shouldReceive('deductStock')
            ->once()->with(1, 1, 5.0);
        $this->inventoryRepo->shouldReceive('deductStock')
            ->once()->with(2, 1, 3.0);

        $approvedWaste = $this->createMockWaste('approved');
        $approvedWaste->shouldReceive('getAttribute')->with('items')->andReturn(collect([$item1, $item2]));
        $approvedWaste->shouldReceive('getAttribute')->with('location_id')->andReturn(1);
        $approvedWaste->shouldReceive('load')->andReturnSelf();

        $this->wasteRepo->shouldReceive('update')
            ->once()
            ->with(1, Mockery::on(fn($data) => $data['status'] === 'approved'))
            ->andReturn($approvedWaste);

        $result = $this->service->approve(1, 99); // Owner ID = 99

        $this->assertTrue($result->isApproved());
    }

    public function test_approve_throws_when_not_pending(): void
    {
        $waste = $this->createMockWaste('approved');
        $this->wasteRepo->shouldReceive('findById')->with(1)->andReturn($waste);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage("status 'pending'");

        $this->service->approve(1, 99);
    }

    public function test_approve_throws_when_rejected(): void
    {
        $waste = $this->createMockWaste('rejected');
        $this->wasteRepo->shouldReceive('findById')->with(1)->andReturn($waste);

        $this->expectException(\RuntimeException::class);

        $this->service->approve(1, 99);
    }

    // ─────────────────────────────────────────────
    // Reject — FR-705: stok tetap, alasan dicatat
    // ─────────────────────────────────────────────

    public function test_reject_does_not_deduct_stock(): void
    {
        $waste = $this->createMockWaste('pending');

        $this->wasteRepo->shouldReceive('findById')->with(1)->andReturn($waste);

        $rejectedWaste = $this->createMockWaste('rejected');
        $rejectedWaste->request_number = 'WST-TEST-0001';

        $this->wasteRepo->shouldReceive('update')
            ->once()
            ->with(1, Mockery::on(function ($data) {
                return $data['status'] === 'rejected'
                    && $data['rejection_reason'] === 'Foto tidak jelas';
            }))
            ->andReturn($rejectedWaste);

        // inventoryRepo->deductStock should NEVER be called
        $this->inventoryRepo->shouldNotReceive('deductStock');

        $result = $this->service->reject(1, 99, 'Foto tidak jelas');

        $this->assertTrue($result->isRejected());
    }

    public function test_reject_throws_when_not_pending(): void
    {
        $waste = $this->createMockWaste('approved');
        $this->wasteRepo->shouldReceive('findById')->with(1)->andReturn($waste);

        $this->expectException(\RuntimeException::class);

        $this->service->reject(1, 99, 'Reason');
    }

    // ─────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────

    protected function createMockWaste(string $status): MockInterface
    {
        $waste = Mockery::mock(WasteRequest::class)->makePartial();
        $waste->status = $status;
        $waste->request_number = 'WST-TEST-20260519-0001';
        return $waste;
    }
}
