<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\ProductService;
use App\Http\Requests\ProductRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    protected $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    public function index(Request $request)
    {
        $categoryId = $request->query('category_id');
        $products = $this->productService->getPaginatedProducts($categoryId);
        $categories = \App\Models\Category::all();

        if ($request->wantsJson()) {
            return response()->json($products);
        }

        return inertia('Product/Index', [
            'products' => $products,
            'categories' => $categories
        ]);
    }

    public function create()
    {
        $categories = \App\Models\Category::all();
        $uoms = \App\Models\Uom::all();
        return inertia('Product/Form', [
            'categories' => $categories,
            'uoms' => $uoms,
            'product' => null
        ]);
    }

    public function edit($id)
    {
        $product = \App\Models\Product::with(['units', 'safeguard'])->findOrFail($id);
        $categories = \App\Models\Category::all();
        $uoms = \App\Models\Uom::all();
        return inertia('Product/Form', [
            'categories' => $categories,
            'uoms' => $uoms,
            'product' => $product
        ]);
    }

    public function store(ProductRequest $request)
    {
        $validated = $request->validated();
        
        // Extract units and safeguard before building product data
        $units = $validated['units'] ?? [];
        $safeguard = $validated['safeguard'] ?? null;

        // Build product data for database — SKU is auto-generated
        $productData = [
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'sku' => Product::generateSku($validated['category_id']),
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'has_sn' => $validated['has_sn'] ?? false,
            'is_active' => $validated['status'] === 'active',
            'base_uom' => $this->extractBaseUom($units),
        ];

        if ($request->hasFile('image')) {
            $productData['image_path'] = $request->file('image')->store('products', 'public');
        }

        // Map frontend unit fields to DB column names
        $unitsMapped = $this->mapUnitsForDb($units);

        $this->productService->createProduct($productData, $unitsMapped, $safeguard ?? []);
        return redirect()->route('products.index')->with('status', 'Produk berhasil ditambahkan.');
    }

    public function update(ProductRequest $request, $id)
    {
        $validated = $request->validated();
        
        $units = $validated['units'] ?? [];
        $safeguard = $validated['safeguard'] ?? null;

        // SKU tidak diubah saat update — immutable setelah dibuat
        $productData = [
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'has_sn' => $validated['has_sn'] ?? false,
            'is_active' => $validated['status'] === 'active',
            'base_uom' => $this->extractBaseUom($units),
        ];

        if ($request->hasFile('image')) {
            $productData['image_path'] = $request->file('image')->store('products', 'public');
        }

        $unitsMapped = $this->mapUnitsForDb($units);

        $this->productService->updateProduct($id, $productData, $unitsMapped, $safeguard ?? []);
        return redirect()->route('products.index')->with('status', 'Produk berhasil diperbarui.');
    }

    public function toggle($id)
    {
        $this->productService->toggleProduct($id);
        return back()->with('status', 'Status Produk berhasil diubah.');
    }

    /**
     * API: Preview SKU yang akan di-generate berdasarkan kategori.
     */
    public function previewSku(Request $request)
    {
        $categoryId = $request->query('category_id');
        return response()->json([
            'sku' => Product::generateSku($categoryId)
        ]);
    }

    /**
     * Extract the base UoM name from the default unit in the units array.
     */
    private function extractBaseUom(array $units): string
    {
        foreach ($units as $unit) {
            if (!empty($unit['is_default'])) {
                return $unit['name'] ?? 'Pcs';
            }
        }
        return $units[0]['name'] ?? 'Pcs';
    }

    /**
     * Map frontend unit field names to database column names.
     */
    private function mapUnitsForDb(array $units): array
    {
        return array_map(function ($unit) {
            return [
                'unit_name' => $unit['name'],
                'conversion_to_base' => $unit['conversion_factor'] ?? 1,
                'price_purchase' => $unit['price_purchase'] ?? 0,
                'price_sales' => $unit['price_sales'] ?? 0,
                'is_default' => $unit['is_default'] ?? false,
            ];
        }, $units);
    }
}
