<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Mockery;
use Mockery\MockInterface;
use App\Services\ShiftService;
use App\Services\AuditService;
use App\Models\Shift;
use App\Models\User;
use App\Models\Location;
use App\Repositories\Contracts\ShiftRepositoryInterface;
use App\Repositories\Contracts\TransactionRepositoryInterface;

use Illuminate\Validation\ValidationException;

class ShiftServiceTest extends TestCase
{


    protected ShiftService $service;
    protected MockInterface $shiftRepo;
    protected MockInterface $transactionRepo;
    protected MockInterface $auditService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->shiftRepo = Mockery::mock(ShiftRepositoryInterface::class);
        $this->transactionRepo = Mockery::mock(TransactionRepositoryInterface::class);
        $this->auditService = Mockery::mock(AuditService::class);
        $this->auditService->shouldReceive('logAction')->andReturnNull();

        $this->service = new ShiftService(
            $this->shiftRepo,
            $this->transactionRepo,
            $this->auditService
        );
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    // ─────────────────────────────────────────────
    // openShift()
    // ─────────────────────────────────────────────

    public function test_open_shift_throws_when_active_shift_exists(): void
    {
        $existingShift = new Shift();
        $existingShift->status = 'open';

        $this->shiftRepo->shouldReceive('findActiveShift')
            ->with(1)
            ->andReturn($existingShift);

        $this->expectException(ValidationException::class);

        $this->service->openShift(1, 1, 500000);
    }

    public function test_open_shift_throws_when_negative_balance(): void
    {
        $this->shiftRepo->shouldReceive('findActiveShift')
            ->with(1)
            ->andReturnNull();

        $this->expectException(ValidationException::class);

        $this->service->openShift(1, 1, -100);
    }

    public function test_open_shift_creates_successfully(): void
    {
        $this->shiftRepo->shouldReceive('findActiveShift')
            ->with(1)
            ->andReturnNull();

        $newShift = Mockery::mock(Shift::class)->makePartial();
        $newShift->status = 'open';
        $newShift->opening_balance = 500000;
        $newShift->shouldReceive('load')->andReturnSelf();

        $this->shiftRepo->shouldReceive('openShift')
            ->once()
            ->with(Mockery::type('array'))
            ->andReturn($newShift);

        $result = $this->service->openShift(1, 1, 500000);

        $this->assertTrue($result->isOpen());
    }

    public function test_open_shift_with_zero_balance(): void
    {
        $this->shiftRepo->shouldReceive('findActiveShift')
            ->with(1)
            ->andReturnNull();

        $newShift = Mockery::mock(Shift::class)->makePartial();
        $newShift->status = 'open';
        $newShift->opening_balance = 0;
        $newShift->shouldReceive('load')->andReturnSelf();

        $this->shiftRepo->shouldReceive('openShift')
            ->once()
            ->with(Mockery::type('array'))
            ->andReturn($newShift);

        $result = $this->service->openShift(1, 1, 0);

        $this->assertTrue($result->isOpen());
    }

    // ─────────────────────────────────────────────
    // closeShift()
    // ─────────────────────────────────────────────

    public function test_close_shift_throws_when_already_closed(): void
    {
        $closedShift = new Shift();
        $closedShift->status = 'closed';

        $this->shiftRepo->shouldReceive('find')
            ->with(1)
            ->andReturn($closedShift);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('sudah ditutup');

        $this->service->closeShift(1, 600000);
    }

    /**
     * Test balance reconciliation:
     * - Opening balance: 500000
     * - Cash income during shift: 350000
     * - Expected balance: 850000
     * - Actual balance: 840000
     * - Difference: -10000 (short)
     */
    public function test_close_shift_calculates_balance_difference(): void
    {
        $openShift = new Shift();
        $openShift->status = 'open';
        $openShift->opening_balance = 500000;

        $this->shiftRepo->shouldReceive('find')
            ->with(1)
            ->andReturn($openShift);

        $this->transactionRepo->shouldReceive('sumCashByShift')
            ->with(1)
            ->andReturn(350000.0);

        $closedShift = new Shift();
        $closedShift->status = 'closed';

        $this->shiftRepo->shouldReceive('closeShift')
            ->once()
            ->with(1, Mockery::on(function ($data) {
                return $data['expected_balance'] == 850000.0
                    && $data['actual_balance'] == 840000.0
                    && $data['difference'] == -10000.0
                    && $data['status'] === 'closed';
            }))
            ->andReturn($closedShift);

        $result = $this->service->closeShift(1, 840000);

        $this->assertTrue($result->isClosed());
    }

    /**
     * Test when actual balance matches expected (no difference).
     */
    public function test_close_shift_zero_difference(): void
    {
        $openShift = new Shift();
        $openShift->status = 'open';
        $openShift->opening_balance = 200000;

        $this->shiftRepo->shouldReceive('find')->with(1)->andReturn($openShift);

        $this->transactionRepo->shouldReceive('sumCashByShift')
            ->with(1)
            ->andReturn(100000.0);

        $closedShift = new Shift();
        $closedShift->status = 'closed';

        $this->shiftRepo->shouldReceive('closeShift')
            ->once()
            ->with(1, Mockery::on(function ($data) {
                return $data['expected_balance'] == 300000.0
                    && $data['actual_balance'] == 300000.0
                    && $data['difference'] == 0.0;
            }))
            ->andReturn($closedShift);

        $result = $this->service->closeShift(1, 300000);

        $this->assertTrue($result->isClosed());
    }
}
