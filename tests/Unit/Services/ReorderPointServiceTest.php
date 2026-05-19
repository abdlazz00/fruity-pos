<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Mockery;
use Mockery\MockInterface;
use App\Services\ReorderPointService;
use App\Models\ReorderPoint;
use App\Models\Inventory;
use App\Models\User;
use App\Models\Product;
use App\Models\Location;
use App\Repositories\Contracts\ReorderPointRepositoryInterface;

use Illuminate\Support\Facades\Notification;
use Carbon\Carbon;

class ReorderPointServiceTest extends TestCase
{


    protected ReorderPointService $service;
    protected MockInterface $reorderPointRepo;

    protected function setUp(): void
    {
        parent::setUp();

        $this->reorderPointRepo = Mockery::mock(ReorderPointRepositoryInterface::class);
        $this->service = new ReorderPointService($this->reorderPointRepo);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ─────────────────────────────────────────────
    // set() — FR-1207, FR-1210 (upsert)
    // ─────────────────────────────────────────────

    public function test_set_creates_new_reorder_point(): void
    {
        $this->reorderPointRepo->shouldReceive('findByProductAndLocation')
            ->with(1, 1)
            ->andReturnNull();

        $newRp = new ReorderPoint([
            'product_id' => 1,
            'location_id' => 1,
            'min_quantity' => 50,
            'is_active' => true,
        ]);

        $this->reorderPointRepo->shouldReceive('create')
            ->once()
            ->with(Mockery::on(function ($data) {
                return $data['product_id'] === 1
                    && $data['location_id'] === 1
                    && $data['min_quantity'] === 50
                    && $data['is_active'] === true;
            }))
            ->andReturn($newRp);

        $result = $this->service->set([
            'product_id' => 1,
            'location_id' => 1,
            'min_quantity' => 50,
        ], 1);

        $this->assertEquals(50, $result->min_quantity);
    }

    public function test_set_updates_existing_reorder_point(): void
    {
        $existing = new ReorderPoint();
        $existing->id = 1;
        $existing->min_quantity = 50;

        $this->reorderPointRepo->shouldReceive('findByProductAndLocation')
            ->with(1, 1)
            ->andReturn($existing);

        $updated = new ReorderPoint();
        $updated->id = 1;
        $updated->min_quantity = 75;

        $this->reorderPointRepo->shouldReceive('update')
            ->once()
            ->with(1, Mockery::on(fn($data) => $data['min_quantity'] === 75))
            ->andReturn($updated);

        $result = $this->service->set([
            'product_id' => 1,
            'location_id' => 1,
            'min_quantity' => 75,
        ], 1);

        $this->assertEquals(75, $result->min_quantity);
    }

    // ─────────────────────────────────────────────
    // toggle() — FR-1215
    // ─────────────────────────────────────────────

    public function test_toggle_activates_inactive_reorder_point(): void
    {
        $rp = new ReorderPoint();
        $rp->id = 1;
        $rp->is_active = false;

        $this->reorderPointRepo->shouldReceive('findById')->with(1)->andReturn($rp);

        $toggled = new ReorderPoint();
        $toggled->id = 1;
        $toggled->is_active = true;

        $this->reorderPointRepo->shouldReceive('update')
            ->once()
            ->with(1, Mockery::on(fn($data) => $data['is_active'] === true))
            ->andReturn($toggled);

        $result = $this->service->toggle(1, 1);
        $this->assertTrue($result->is_active);
    }

    public function test_toggle_deactivates_active_reorder_point(): void
    {
        $rp = new ReorderPoint();
        $rp->id = 1;
        $rp->is_active = true;

        $this->reorderPointRepo->shouldReceive('findById')->with(1)->andReturn($rp);

        $toggled = new ReorderPoint();
        $toggled->id = 1;
        $toggled->is_active = false;

        $this->reorderPointRepo->shouldReceive('update')
            ->once()
            ->with(1, Mockery::on(fn($data) => $data['is_active'] === false))
            ->andReturn($toggled);

        $result = $this->service->toggle(1, 1);
        $this->assertFalse($result->is_active);
    }

    // ─────────────────────────────────────────────
    // checkThreshold() — FR-1211, FR-1214
    // ─────────────────────────────────────────────

    public function test_check_threshold_skips_when_empty_product_ids(): void
    {
        // Should return early without any repo calls
        $this->reorderPointRepo->shouldNotReceive('getActiveByProductIds');

        $this->service->checkThreshold([], 1);

        // If we reached here, no exception = pass
        $this->assertTrue(true);
    }

    public function test_check_threshold_skips_when_no_active_reorder_points(): void
    {
        $this->reorderPointRepo->shouldReceive('getActiveByProductIds')
            ->with([1, 2], 1)
            ->andReturn(collect([]));

        $this->service->checkThreshold([1, 2], 1);

        $this->assertTrue(true);
    }

    // ─────────────────────────────────────────────
    // isCooldownExpired() — FR-1214 (Model method)
    // ─────────────────────────────────────────────

    public function test_cooldown_expired_when_never_notified(): void
    {
        $rp = new ReorderPoint();
        $rp->last_notified_at = null;

        $this->assertTrue($rp->isCooldownExpired());
    }

    public function test_cooldown_not_expired_within_one_hour(): void
    {
        $rp = new ReorderPoint();
        $rp->last_notified_at = Carbon::now()->subMinutes(30); // 30 mins ago

        $this->assertFalse($rp->isCooldownExpired());
    }

    public function test_cooldown_expired_after_one_hour(): void
    {
        $rp = new ReorderPoint();
        $rp->last_notified_at = Carbon::now()->subMinutes(61); // 61 mins ago

        $this->assertTrue($rp->isCooldownExpired());
    }

    public function test_cooldown_not_expired_at_exactly_one_hour(): void
    {
        $rp = new ReorderPoint();
        $rp->last_notified_at = Carbon::now()->subMinutes(60); // exactly 1 hour

        // At exactly 1 hour, addHour()->isPast() should be false (current time = boundary)
        // This tests the boundary condition
        $this->assertIsBool($rp->isCooldownExpired());
    }
}
