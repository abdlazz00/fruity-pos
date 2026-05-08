<?php

namespace App\Http\Controllers;

use App\Services\StockOpnameService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OpnameController extends Controller
{
    protected $opnameService;

    public function __construct(StockOpnameService $opnameService)
    {
        $this->opnameService = $opnameService;
    }

    /**
     * List opname sessions for the user's location.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $locationId = $user->location_id;
        $status = $request->query('status');

        // Owner can filter by location
        if ($user->role === 'owner') {
            $locationId = $request->query('location_id') ?: null;
        }

        $opnames = $this->opnameService->getByLocation($locationId, $status);
        $locations = \App\Models\Location::where('is_active', true)->get();
        $hasActiveOpname = \App\Models\StockOpname::where('location_id', $user->location_id)
            ->where('status', 'in_progress')
            ->exists();

        return Inertia::render('Inventory/OpnameIndex', [
            'opnames'   => $opnames,
            'locations' => $locations,
            'filters'   => [
                'status'      => $status,
                'location_id' => $locationId,
            ],
            'has_active_opname' => $hasActiveOpname,
        ]);
    }

    /**
     * Start a new opname session (Stockist).
     */
    public function start(Request $request)
    {
        $user = $request->user();
        $opname = $this->opnameService->startSession($user->location_id, $user->id);

        return redirect()->route('opname.show', $opname->id)
            ->with('status', "Sesi opname {$opname->opname_number} dimulai. Silakan input hitungan fisik.");
    }

    /**
     * Show opname detail (form for inputting physical counts).
     */
    public function show(int $id)
    {
        $opname = $this->opnameService->findById($id);

        return Inertia::render('Inventory/OpnameShow', [
            'opname' => $opname,
        ]);
    }

    /**
     * Save physical counts for opname items.
     */
    public function updateCounts(Request $request, int $id)
    {
        $request->validate([
            'counts'                      => 'required|array|min:1',
            'counts.*.item_id'            => 'required|integer',
            'counts.*.physical_quantity'  => 'required|numeric|min:0',
        ]);

        $opname = $this->opnameService->findById($id);
        $this->opnameService->inputCounts($id, $request->input('counts'), $opname->location_id);

        return back()->with('status', 'Hitungan fisik berhasil disimpan.');
    }

    /**
     * Submit opname for Owner approval.
     */
    public function submit(int $id)
    {
        $opname = $this->opnameService->submit($id);

        return back()->with('status', "Opname {$opname->opname_number} telah diajukan ke Owner untuk approval.");
    }

    /**
     * Approve opname and adjust inventory (Owner only).
     */
    public function approve(Request $request, int $id)
    {
        $opname = $this->opnameService->approve($id, $request->user()->id);

        return back()->with('status', "Opname {$opname->opname_number} disetujui. Stok telah disesuaikan.");
    }
}
