<?php

namespace App\Http\Controllers;

use App\Services\MutationService;
use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MutationController extends Controller
{
    protected $mutationService;

    public function __construct(MutationService $mutationService)
    {
        $this->mutationService = $mutationService;
    }

    /**
     * List mutations (Stockist sees own location's mutations).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $locationId = $user->location_id;
        $status = $request->query('status');

        // Owner can see all — filter by query param location
        if ($user->role === 'owner') {
            $locationId = $request->query('location_id') ?: null;
        }

        $mutations = $this->mutationService->getByLocation($locationId, $status);
        $locations = Location::where('is_active', true)->get();

        return Inertia::render('Inventory/MutationIndex', [
            'mutations' => $mutations,
            'locations' => $locations,
            'filters'   => [
                'status'      => $status,
                'location_id' => $locationId,
            ],
        ]);
    }

    /**
     * Show create form.
     */
    public function create(Request $request)
    {
        $user = $request->user();
        $locations = Location::where('is_active', true)
            ->where('id', '!=', $user->location_id)
            ->get();

        // Products with current stock at user's location
        $products = \App\Models\Inventory::where('location_id', $user->location_id)
            ->where('quantity', '>', 0)
            ->with('product')
            ->get()
            ->map(fn($inv) => [
                'product_id' => $inv->product_id,
                'name'       => $inv->product->name,
                'sku'        => $inv->product->sku ?? '-',
                'stock'      => $inv->quantity,
            ]);

        return Inertia::render('Inventory/MutationForm', [
            'locations' => $locations,
            'products'  => $products,
        ]);
    }

    /**
     * Store new mutation.
     */
    public function store(Request $request)
    {
        $request->validate([
            'to_location_id'          => 'required|exists:locations,id',
            'items'                   => 'required|array|min:1',
            'items.*.product_id'      => 'required|exists:products,id',
            'items.*.quantity_sent'   => 'required|numeric|min:0.01',
            'notes'                   => 'nullable|string|max:1000',
        ]);

        $user = $request->user();
        $data = $request->all();
        $data['from_location_id'] = $user->location_id;

        $mutation = $this->mutationService->create($data, $user->id);

        return redirect()->route('mutations.index')
            ->with('status', "Mutasi {$mutation->mutation_number} berhasil dibuat.");
    }

    /**
     * Show single mutation detail.
     */
    public function show(int $id)
    {
        $mutation = $this->mutationService->findById($id);

        return Inertia::render('Inventory/MutationShow', [
            'mutation' => $mutation,
        ]);
    }

    /**
     * Ship mutation (Stockist at source location).
     */
    public function ship(Request $request, int $id)
    {
        $mutation = $this->mutationService->ship($id, $request->user()->id);

        return back()->with('status', "Mutasi {$mutation->mutation_number} berhasil dikirim.");
    }

    /**
     * Receive mutation (Stockist at destination location).
     */
    public function receive(Request $request, int $id)
    {
        $request->validate([
            'items'                       => 'required|array|min:1',
            'items.*.item_id'             => 'required|integer',
            'items.*.quantity_received'   => 'required|numeric|min:0',
        ]);

        $mutation = $this->mutationService->receive(
            $id,
            $request->input('items'),
            $request->user()->id
        );

        return back()->with('status', "Mutasi {$mutation->mutation_number} berhasil diterima.");
    }

    /**
     * Complete mutation (final acknowledgment).
     */
    public function complete(int $id)
    {
        $mutation = $this->mutationService->complete($id);

        return back()->with('status', "Mutasi {$mutation->mutation_number} telah selesai.");
    }
}
