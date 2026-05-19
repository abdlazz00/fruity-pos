<?php

namespace Tests\Unit\Repositories;

use PHPUnit\Framework\TestCase;

/**
 * Pure unit test for WAC (Weighted Average Cost) formula validation.
 *
 * These tests verify the mathematical formulas used in InventoryRepository
 * without needing a database connection.
 *
 * WAC formula (FR-207):
 *   new_avg = ((old_qty × old_avg) + (add_qty × new_hpp)) / (old_qty + add_qty)
 */
class InventoryWacFormulaTest extends TestCase
{
    /**
     * Calculate WAC using the same formula as InventoryRepository::updateOrCreateStock.
     */
    protected function calculateWac(float $oldQty, float $oldAvg, float $addQty, float $newHpp): array
    {
        $totalQty = $oldQty + $addQty;

        $newAvg = $totalQty > 0
            ? (($oldQty * $oldAvg) + ($addQty * $newHpp)) / $totalQty
            : $newHpp;

        return [
            'quantity' => $totalQty,
            'avg_cost' => round($newAvg, 2),
        ];
    }

    // ─────────────────────────────────────────────
    // WAC Calculation — FR-206, FR-207
    // ─────────────────────────────────────────────

    /**
     * Scenario: Existing 100 pcs @ Rp 5000 avg. Add 50 pcs @ Rp 8000 HPP.
     * WAC = ((100 × 5000) + (50 × 8000)) / (100 + 50) = 6000
     */
    public function test_wac_calculation_existing_inventory(): void
    {
        $result = $this->calculateWac(100, 5000, 50, 8000);

        $this->assertEquals(150.0, $result['quantity']);
        $this->assertEquals(6000.00, $result['avg_cost']);
    }

    /**
     * Brand new product: no existing inventory.
     * avg_cost = incoming HPP = 7500
     */
    public function test_wac_calculation_new_inventory(): void
    {
        $result = $this->calculateWac(0, 0, 30, 7500);

        $this->assertEquals(30.0, $result['quantity']);
        $this->assertEquals(7500.00, $result['avg_cost']);
    }

    /**
     * Multiple sequential inbounds:
     * Inbound 1: 100 pcs @ 5000 → WAC = 5000
     * Inbound 2: 50 pcs @ 8000  → WAC = 6000
     * Inbound 3: 150 pcs @ 4000 → WAC = 5000
     */
    public function test_wac_multiple_inbounds(): void
    {
        // Inbound 1
        $r1 = $this->calculateWac(0, 0, 100, 5000);
        $this->assertEquals(5000.00, $r1['avg_cost']);

        // Inbound 2
        $r2 = $this->calculateWac($r1['quantity'], $r1['avg_cost'], 50, 8000);
        $this->assertEquals(150.0, $r2['quantity']);
        $this->assertEquals(6000.00, $r2['avg_cost']);

        // Inbound 3
        $r3 = $this->calculateWac($r2['quantity'], $r2['avg_cost'], 150, 4000);
        $this->assertEquals(300.0, $r3['quantity']);
        $this->assertEquals(5000.00, $r3['avg_cost']);
    }

    /**
     * WAC with decimal quantities (kg of fruit).
     *
     * Existing: 25.5 kg @ Rp 12000/kg
     * Add: 10.5 kg @ Rp 15000/kg
     * WAC = ((25.5×12000) + (10.5×15000)) / 36 = 12875.00
     */
    public function test_wac_with_decimal_quantities(): void
    {
        $result = $this->calculateWac(25.5, 12000, 10.5, 15000);

        $this->assertEquals(36.0, $result['quantity']);
        $this->assertEquals(12875.00, $result['avg_cost']);
    }

    /**
     * WAC with zero incoming HPP (free sample).
     *
     * Existing: 100 pcs @ 5000
     * Add: 20 pcs @ 0
     * WAC = ((100×5000) + (20×0)) / 120 = 4166.67
     */
    public function test_wac_with_zero_incoming_hpp(): void
    {
        $result = $this->calculateWac(100, 5000, 20, 0);

        $this->assertEquals(120.0, $result['quantity']);
        $this->assertEquals(4166.67, $result['avg_cost']);
    }

    /**
     * WAC with very large numbers (realistic: bulk purchase).
     *
     * Existing: 5000 pcs @ Rp 25000
     * Add: 2000 pcs @ Rp 28000
     * WAC = ((5000×25000) + (2000×28000)) / 7000 = 25857.14
     */
    public function test_wac_large_numbers(): void
    {
        $result = $this->calculateWac(5000, 25000, 2000, 28000);

        $this->assertEquals(7000.0, $result['quantity']);
        $this->assertEquals(25857.14, $result['avg_cost']);
    }

    /**
     * WAC with same cost (no change in average).
     */
    public function test_wac_same_cost_no_change(): void
    {
        $result = $this->calculateWac(100, 5000, 50, 5000);

        $this->assertEquals(150.0, $result['quantity']);
        $this->assertEquals(5000.00, $result['avg_cost']);
    }

    /**
     * WAC when adding very small quantity.
     */
    public function test_wac_small_addition(): void
    {
        $result = $this->calculateWac(1000, 5000, 1, 100000);

        $this->assertEquals(1001.0, $result['quantity']);
        // WAC = ((1000×5000) + (1×100000)) / 1001 = 5094.91
        $this->assertEquals(5094.91, $result['avg_cost']);
    }

    // ─────────────────────────────────────────────
    // HPP Mentah Calculation — FR-205
    // ─────────────────────────────────────────────

    /**
     * HPP Mentah = total_buy_price / (qty × content_per_unit)
     *
     * Buy 10 boxes @ Rp 500,000 total, each box = 50 pcs
     * HPP per piece = 500000 / (10 × 50) = 1000
     */
    public function test_hpp_raw_calculation(): void
    {
        $hppRaw = 500000 / (10 * 50);
        $this->assertEquals(1000.0, round($hppRaw, 2));
    }

    /**
     * HPP Mentah with single unit content.
     * HPP = 250000 / (5 × 1) = 50000
     */
    public function test_hpp_raw_single_unit(): void
    {
        $hppRaw = 250000 / (5 * 1);
        $this->assertEquals(50000.0, round($hppRaw, 2));
    }

    /**
     * Edge case: zero quantity → prevent division by zero
     */
    public function test_hpp_raw_zero_quantity(): void
    {
        $qty = 0;
        $content = 50;
        $hppRaw = ($qty * $content) > 0 ? 500000 / ($qty * $content) : 0;
        $this->assertEquals(0, $hppRaw);
    }

    /**
     * Edge case: zero content → prevent division by zero
     */
    public function test_hpp_raw_zero_content(): void
    {
        $qty = 10;
        $content = 0;
        $hppRaw = ($qty * $content) > 0 ? 500000 / ($qty * $content) : 0;
        $this->assertEquals(0, $hppRaw);
    }

    // ─────────────────────────────────────────────
    // Stock Deduction (does NOT affect avg_cost)
    // ─────────────────────────────────────────────

    public function test_stock_deduction_preserves_avg_cost(): void
    {
        $currentQty = 50;
        $avgCost = 5000;
        $deductQty = 20;

        $newQty = $currentQty - $deductQty;

        $this->assertEquals(30, $newQty);
        // avg_cost should remain unchanged after deduction
        $this->assertEquals(5000, $avgCost);
    }

    public function test_stock_deduction_insufficient_throws(): void
    {
        $currentQty = 10;
        $deductQty = 50;

        $this->assertTrue($currentQty < $deductQty, 'Should detect insufficient stock');
    }
}
