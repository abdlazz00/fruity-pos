<?php

namespace App\Http\Controllers;

use App\Services\StoreService;
use App\Http\Requests\StoreRequest;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    protected $storeService;

    public function __construct(StoreService $storeService)
    {
        $this->storeService = $storeService;
    }

    public function index()
    {
        // Akan dihubungkan ke UI frontend nantinya, return JSON sementara agar testable API
        $stores = $this->storeService->getPaginatedStores();
        if (request()->wantsJson()) {
            return response()->json($stores);
        }
        return inertia('Store/Index', ['stores' => $stores]);
    }

    public function create()
    {
        $unassignedUsers = \App\Models\User::whereNull('location_id')->where('role', '!=', 'owner')->get(['id', 'name', 'username', 'role']);
        return inertia('Store/Form', [
            'unassignedUsers' => $unassignedUsers
        ]);
    }

    public function store(StoreRequest $request)
    {
        $this->storeService->createStore($request->validated());
        return redirect()->route('stores.index')->with('status', 'Toko berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $store = \App\Models\Location::with(['users' => function($query) {
            $query->select('id', 'name', 'role', 'location_id');
        }])->findOrFail($id);

        $unassignedUsers = \App\Models\User::where(function($q) use($store) {
            $q->whereNull('location_id')->orWhere('location_id', $store->id);
        })->where('role', '!=', 'owner')->get(['id', 'name', 'username', 'role', 'location_id']);

        return inertia('Store/Form', [
            'store' => $store,
            'unassignedUsers' => $unassignedUsers
        ]);
    }

    public function update(StoreRequest $request, $id)
    {
        $this->storeService->updateStore($id, $request->validated());
        return redirect()->route('stores.index')->with('status', 'Toko berhasil diperbarui.');
    }

    public function toggle($id)
    {
        $this->storeService->toggleStore($id);
        return back()->with('status', 'Status toko berhasil diubah.');
    }
}
