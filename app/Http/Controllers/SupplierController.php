<?php

namespace App\Http\Controllers;

use App\Services\SupplierService;
use App\Http\Requests\SupplierRequest;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    protected $supplierService;

    public function __construct(SupplierService $supplierService)
    {
        $this->supplierService = $supplierService;
    }

    public function index(Request $request)
    {
        $suppliers = $this->supplierService->getPaginatedSuppliers();
        
        if ($request->wantsJson()) {
            return response()->json($suppliers);
        }

        return inertia('Supplier/Index', ['suppliers' => $suppliers]);
    }

    public function store(SupplierRequest $request)
    {
        $this->supplierService->createSupplier($request->validated());
        return back()->with('status', 'Supplier berhasil ditambahkan.');
    }

    public function update(SupplierRequest $request, $id)
    {
        $this->supplierService->updateSupplier($id, $request->validated());
        return back()->with('status', 'Supplier berhasil diperbarui.');
    }

    public function toggle($id)
    {
        $this->supplierService->toggleSupplier($id);
        return back()->with('status', 'Status Supplier berhasil diubah.');
    }
}
