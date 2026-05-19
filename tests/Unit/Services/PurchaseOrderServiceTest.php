<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Mockery;
use Mockery\MockInterface;
use App\Services\PurchaseOrderService;
use App\Services\AuditService;
use App\Models\PurchaseOrder;
use App\Repositories\Contracts\PurchaseOrderRepositoryInterface;

use Illuminate\Validation\ValidationException;

class PurchaseOrderServiceTest extends TestCase
{


    protected PurchaseOrderService $service;
    protected MockInterface $repository;
    protected MockInterface $auditService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->repository = Mockery::mock(PurchaseOrderRepositoryInterface::class);
        $this->auditService = Mockery::mock(AuditService::class);
        $this->auditService->shouldReceive('logAction')->andReturnNull();

        $this->service = new PurchaseOrderService($this->repository, $this->auditService);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ─────────────────────────────────────────────
    // confirmPurchaseOrder() — FR-203
    // ─────────────────────────────────────────────

    public function test_confirm_throws_when_not_draft(): void
    {
        $po = $this->createMockPo('confirmed');

        $this->repository->shouldReceive('find')->with(1)->andReturn($po);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('draft');

        $this->service->confirmPurchaseOrder(1);
    }

    public function test_confirm_throws_when_no_items(): void
    {
        $po = $this->createMockPo('draft');
        $po->shouldReceive('getAttribute')->with('items')->andReturn(collect([]));

        $this->repository->shouldReceive('find')->with(1)->andReturn($po);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('minimal 1 item');

        $this->service->confirmPurchaseOrder(1);
    }

    public function test_confirm_succeeds_with_draft_and_items(): void
    {
        $po = $this->createMockPo('draft');
        $po->shouldReceive('getAttribute')->with('items')->andReturn(collect(['item1'])); // has items

        $this->repository->shouldReceive('find')->with(1)->andReturn($po);

        $confirmedPo = $this->createMockPo('confirmed');

        $this->repository->shouldReceive('update')
            ->once()
            ->with(1, ['status' => 'confirmed'])
            ->andReturn($confirmedPo);

        $result = $this->service->confirmPurchaseOrder(1);

        $this->assertTrue($result->isDraft() === false);
    }

    // ─────────────────────────────────────────────
    // cancelPurchaseOrder()
    // ─────────────────────────────────────────────

    public function test_cancel_throws_when_not_draft(): void
    {
        $po = $this->createMockPo('confirmed');

        $this->repository->shouldReceive('find')->with(1)->andReturn($po);

        $this->expectException(ValidationException::class);

        $this->service->cancelPurchaseOrder(1);
    }

    public function test_cancel_succeeds_when_draft(): void
    {
        $po = $this->createMockPo('draft');

        $this->repository->shouldReceive('find')->with(1)->andReturn($po);

        $cancelledPo = $this->createMockPo('cancelled');

        $this->repository->shouldReceive('update')
            ->once()
            ->with(1, ['status' => 'cancelled'])
            ->andReturn($cancelledPo);

        $result = $this->service->cancelPurchaseOrder(1);

        $this->assertNotNull($result);
    }

    // ─────────────────────────────────────────────
    // updatePurchaseOrder() — FR-203
    // ─────────────────────────────────────────────

    public function test_update_throws_when_confirmed(): void
    {
        $po = $this->createMockPo('confirmed');

        $this->repository->shouldReceive('find')->with(1)->andReturn($po);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('dikonfirmasi');

        $this->service->updatePurchaseOrder(1, ['notes' => 'Updated']);
    }

    // ─────────────────────────────────────────────
    // deletePurchaseOrder()
    // ─────────────────────────────────────────────

    public function test_delete_throws_when_not_draft(): void
    {
        $po = $this->createMockPo('confirmed');

        $this->repository->shouldReceive('find')->with(1)->andReturn($po);

        $this->expectException(ValidationException::class);

        $this->service->deletePurchaseOrder(1);
    }

    public function test_delete_succeeds_when_draft(): void
    {
        $po = $this->createMockPo('draft');

        $this->repository->shouldReceive('find')->with(1)->andReturn($po);
        $this->repository->shouldReceive('delete')->once()->with(1);

        $this->service->deletePurchaseOrder(1);

        $this->assertTrue(true); // No exception = success
    }

    // ─────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────

    protected function createMockPo(string $status): MockInterface
    {
        $po = Mockery::mock(PurchaseOrder::class)->makePartial();
        $po->status = $status;
        $po->po_number = 'PO-TEST-20260519-0001';
        return $po;
    }
}
