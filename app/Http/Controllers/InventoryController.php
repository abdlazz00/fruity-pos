<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    /**
     * Display a listing of the real-time stock balance.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Inventory::with(['product.category', 'location'])
            ->whereHas('product', function ($q) {
                $q->where('is_active', true);
            });

        if ($user->role->value === 'stockist') {
            $query->where('location_id', $user->location_id);
            $locationId = $user->location_id;
        } else {
            $locationId = $request->query('location_id');
            if ($locationId) {
                $query->where('location_id', $locationId);
            }
        }

        $categoryId = $request->query('category_id');
        if ($categoryId) {
            $query->whereHas('product', function ($q) use ($categoryId) {
                $q->where('category_id', $categoryId);
            });
        }

        $search = $request->query('search');
        if ($search) {
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $inventories = $query->orderBy('location_id')
                             ->latest('updated_at')
                             ->paginate(15)
                             ->withQueryString();

        $locations = [];
        if ($user->role->value === 'owner') {
            $locations = Location::where('is_active', true)->get();
        }

        $categories = \App\Models\Category::all();

        return Inertia::render('Inventory/StockIndex', [
            'inventories' => $inventories,
            'locations'   => $locations,
            'categories'  => $categories,
            'filters'     => [
                'location_id' => $locationId,
                'category_id' => $categoryId,
                'search'      => $search,
            ],
        ]);
    }
}
