<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Mockery;
use Mockery\MockInterface;
use App\Services\PricingService;
use App\Services\AuditService;
use App\Models\ProductPrice;
use App\Repositories\Contracts\ProductPriceRepositoryInterface;
use Illuminate\Validation\ValidationException;

class PricingServiceTest extends TestCase
{
    protected PricingService $service;
    protected MockInterface $priceRepo;
    protected MockInterface $auditService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->priceRepo = Mockery::mock(ProductPriceRepositoryInterface::class);
        $this->auditService = Mockery::mock(AuditService::class);
        $this->auditService->shouldReceive('logAction')->andReturnNull();

        $this->service = new PricingService($this->priceRepo, $this->auditService);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ─────────────────────────────────────────────
    // calculateSellingPrice() — FR-302, FR-304
    // ─────────────────────────────────────────────

    public function test_calculate_selling_price_with_margin(): void
    {
        // baseline 10000, margin 20% → 12000
        $result = $this->service->calculateSellingPrice(10000, 20, 0);
        $this->assertEquals(12000.00, $result);
    }

    public function test_calculate_selling_price_with_margin_and_rounding_500(): void
    {
        // baseline 10000, margin 15% → 11500, rounded UP to nearest 500 → 11500
        $result = $this->service->calculateSellingPrice(10000, 15, 500);
        $this->assertEquals(11500.00, $result);

        // baseline 10000, margin 12% → 11200, rounded UP to nearest 500 → 11500
        $result2 = $this->service->calculateSellingPrice(10000, 12, 500);
        $this->assertEquals(11500.00, $result2);
    }

    public function test_calculate_selling_price_with_rounding_to_1000(): void
    {
        // baseline 10000, margin 12% → 11200, rounded UP to nearest 1000 → 12000
        $result = $this->service->calculateSellingPrice(10000, 12, 1000);
        $this->assertEquals(12000.00, $result);
    }

    public function test_calculate_selling_price_zero_baseline(): void
    {
        $result = $this->service->calculateSellingPrice(0, 20, 500);
        $this->assertEquals(0, $result);
    }

    public function test_calculate_selling_price_negative_baseline(): void
    {
        $result = $this->service->calculateSellingPrice(-100, 20, 0);
        $this->assertEquals(0, $result);
    }

    public function test_calculate_selling_price_zero_margin(): void
    {
        // baseline 10000, margin 0% → 10000
        $result = $this->service->calculateSellingPrice(10000, 0, 0);
        $this->assertEquals(10000.00, $result);
    }

    public function test_calculate_selling_price_fractional_margin(): void
    {
        // baseline 8500, margin 33.5% → 8500 + 2847.5 = 11347.5
        $result = $this->service->calculateSellingPrice(8500, 33.5, 0);
        $this->assertEquals(11347.5, $result);
    }

    public function test_calculate_selling_price_high_margin(): void
    {
        // baseline 5000, margin 100% → 10000
        $result = $this->service->calculateSellingPrice(5000, 100, 0);
        $this->assertEquals(10000.00, $result);
    }

    // ─────────────────────────────────────────────
    // roundHPP() — Rounding logic
    // ─────────────────────────────────────────────

    public function test_round_hpp_rounds_up_to_nearest_500(): void
    {
        $this->assertEquals(11500.0, $this->service->roundHPP(11200, 500));
        $this->assertEquals(11500.0, $this->service->roundHPP(11001, 500));
        $this->assertEquals(11500.0, $this->service->roundHPP(11500, 500)); // exact
    }

    public function test_round_hpp_rounds_up_to_nearest_1000(): void
    {
        $this->assertEquals(12000.0, $this->service->roundHPP(11001, 1000));
        $this->assertEquals(12000.0, $this->service->roundHPP(11999, 1000));
        $this->assertEquals(12000.0, $this->service->roundHPP(12000, 1000)); // exact
    }

    public function test_round_hpp_with_zero_rounding(): void
    {
        $this->assertEquals(11234.56, $this->service->roundHPP(11234.56, 0));
    }

    public function test_round_hpp_small_values(): void
    {
        // 1234 rounded to nearest 500 → 1500
        $this->assertEquals(1500.0, $this->service->roundHPP(1234, 500));
        // 501 rounded to nearest 500 → 1000
        $this->assertEquals(1000.0, $this->service->roundHPP(501, 500));
    }

    // ─────────────────────────────────────────────
    // lockPrice() — FR-306
    // ─────────────────────────────────────────────

    public function test_lock_price_throws_when_selling_price_is_zero(): void
    {
        $mockPrice = new ProductPrice();
        $mockPrice->selling_price = 0;

        $this->priceRepo->shouldReceive('find')->with(1)->andReturn($mockPrice);

        $this->expectException(ValidationException::class);
        $this->service->lockPrice(1, 1);
    }

    // ─────────────────────────────────────────────
    // unlockPrice() — FR-306
    // ─────────────────────────────────────────────

    public function test_unlock_price_sets_status_to_pending(): void
    {
        $unlockedPrice = new ProductPrice();
        $unlockedPrice->status = 'pending';

        $this->priceRepo->shouldReceive('updateStatus')
            ->with(1, 'pending', 1)
            ->andReturn($unlockedPrice);

        $result = $this->service->unlockPrice(1, 1);
        $this->assertEquals('pending', $result->status);
    }
}
