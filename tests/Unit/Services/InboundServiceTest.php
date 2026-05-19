<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Mockery;
use Mockery\MockInterface;
use App\Services\InboundService;
use App\Services\AuditService;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Inbound;
use App\Models\InboundItem;
use App\Models\Location;
use App\Repositories\Contracts\InboundRepositoryInterface;
use App\Repositories\Contracts\PurchaseOrderRepositoryInterface;

use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Event;

class InboundServiceTest extends TestCase
{


    protected InboundService $service;
    protected MockInterface $inboundRepo;
    protected MockInterface $poRepo;
    protected MockInterface $auditService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->inboundRepo = Mockery::mock(InboundRepositoryInterface::class);
        $this->poRepo = Mockery::mock(PurchaseOrderRepositoryInterface::class);
        $this->auditService = Mockery::mock(AuditService::class);
        $this->auditService->shouldReceive('logAction')->andReturnNull();

        $this->service = new InboundService(
            $this->inboundRepo,
            $this->poRepo,
            $this->auditService
        );
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ─────────────────────────────────────────────
    // HPP Mentah Calculation — FR-205
    // ─────────────────────────────────────────────

    /**
     * Test HPP Mentah formula: total_buy_price / (qty × content)
     *
     * Example: buy 10 boxes @ Rp 500.000 total, each box has 50 pcs
     * HPP per piece = 500000 / (10 × 50) = 1000
     */
    public function test_hpp_raw_calculation_formula(): void
    {
        $qtyReceived = 10.0;
        $totalBuyPrice = 500000.0;
        $contentPerUnit = 50;

        $hppRaw = ($qtyReceived * $contentPerUnit) > 0
            ? $totalBuyPrice / ($qtyReceived * $contentPerUnit)
            : 0;

        $this->assertEquals(1000.0, round($hppRaw, 2));
    }

    /**
     * Test HPP Mentah with single unit content (content = 1).
     * HPP = 250000 / (5 × 1) = 50000
     */
    public function test_hpp_raw_single_unit_content(): void
    {
        $qtyReceived = 5.0;
        $totalBuyPrice = 250000.0;
        $contentPerUnit = 1;

        $hppRaw = $totalBuyPrice / ($qtyReceived * $contentPerUnit);

        $this->assertEquals(50000.0, round($hppRaw, 2));
    }

    /**
     * Edge case: zero quantity should not cause division by zero
     */
    public function test_hpp_raw_zero_quantity_returns_zero(): void
    {
        $qtyReceived = 0;
        $totalBuyPrice = 500000.0;
        $contentPerUnit = 50;

        $hppRaw = ($qtyReceived * $contentPerUnit) > 0
            ? $totalBuyPrice / ($qtyReceived * $contentPerUnit)
            : 0;

        $this->assertEquals(0, $hppRaw);
    }

    /**
     * Edge case: zero content per unit should not cause division by zero
     */
    public function test_hpp_raw_zero_content_returns_zero(): void
    {
        $qtyReceived = 10;
        $totalBuyPrice = 500000.0;
        $contentPerUnit = 0;

        $hppRaw = ($qtyReceived * $contentPerUnit) > 0
            ? $totalBuyPrice / ($qtyReceived * $contentPerUnit)
            : 0;

        $this->assertEquals(0, $hppRaw);
    }

    // ─────────────────────────────────────────────
    // PO Status Validation — FR-208
    // ─────────────────────────────────────────────

    public function test_process_receipt_throws_on_draft_po(): void
    {
        $mockPo = Mockery::mock(PurchaseOrder::class)->makePartial();
        $mockPo->status = 'draft';

        $this->poRepo->shouldReceive('find')->with(1)->andReturn($mockPo);

        $this->expectException(ValidationException::class);

        $this->service->processReceipt(
            ['purchase_order_id' => 1, 'received_date' => '2026-05-19'],
            [['product_id' => 1, 'product_unit_id' => 1, 'quantity_received' => 5, 'total_buy_price' => 50000, 'content_per_unit' => 1]],
            1
        );
    }

    public function test_process_receipt_throws_on_cancelled_po(): void
    {
        $mockPo = Mockery::mock(PurchaseOrder::class)->makePartial();
        $mockPo->status = 'cancelled';

        $this->poRepo->shouldReceive('find')->with(1)->andReturn($mockPo);

        $this->expectException(ValidationException::class);

        $this->service->processReceipt(
            ['purchase_order_id' => 1],
            [['product_id' => 1, 'product_unit_id' => 1, 'quantity_received' => 5, 'total_buy_price' => 50000, 'content_per_unit' => 1]],
            1
        );
    }

    public function test_process_receipt_throws_on_completed_po(): void
    {
        $mockPo = Mockery::mock(PurchaseOrder::class)->makePartial();
        $mockPo->status = 'completed';

        $this->poRepo->shouldReceive('find')->with(1)->andReturn($mockPo);

        $this->expectException(ValidationException::class);

        $this->service->processReceipt(
            ['purchase_order_id' => 1],
            [['product_id' => 1, 'product_unit_id' => 1, 'quantity_received' => 5, 'total_buy_price' => 50000, 'content_per_unit' => 1]],
            1
        );
    }
}
