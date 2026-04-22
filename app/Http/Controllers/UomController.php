<?php

namespace App\Http\Controllers;

use App\Models\Uom;
use Illuminate\Http\Request;

class UomController extends Controller
{
    public function index(Request $request)
    {
        $uoms = Uom::latest()->paginate(10);
        
        if ($request->wantsJson()) {
            return response()->json($uoms);
        }

        return inertia('Uom/Index', [
            'uoms' => $uoms
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:50|unique:uoms,name',
            'symbol' => 'nullable|string|max:20',
            'description' => 'nullable|string'
        ]);

        Uom::create($data);
        return back()->with('status', 'Satuan Ukur (UoM) berhasil ditambahkan.');
    }

    public function update(Request $request, Uom $uom)
    {
        $data = $request->validate([
            'name' => 'required|string|max:50|unique:uoms,name,' . $uom->id,
            'symbol' => 'nullable|string|max:20',
            'description' => 'nullable|string'
        ]);

        $uom->update($data);
        return back()->with('status', 'Satuan Ukur (UoM) berhasil diperbarui.');
    }

    public function destroy(Uom $uom)
    {
        // Add check if UoM is used in products if strictly needed
        $uom->delete();
        return back()->with('status', 'Satuan Ukur (UoM) berhasil dihapus.');
    }
}
