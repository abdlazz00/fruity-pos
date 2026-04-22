<?php

namespace App\Http\Controllers;

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

    public function store(ProductRequest $request)
    {
        $data = $request->validated();
        
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $data['image_path'] = $path;
        }

        $units = $data['units'] ?? [];
        $safeguard = $data['safeguard'] ?? [];
        
        // Bersihkan data utama sebelum diserahkan ke repository produk dasar
        unset($data['units'], $data['safeguard'], $data['image']);

        $this->productService->createProduct($data, $units, $safeguard);
        return back()->with('status', 'Produk berhasil ditambahkan.');
    }

    public function update(ProductRequest $request, $id)
    {
        $data = $request->validated();
        
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $data['image_path'] = $path;
        }

        $units = $data['units'] ?? [];
        $safeguard = $data['safeguard'] ?? [];
        unset($data['units'], $data['safeguard'], $data['image']);

        $this->productService->updateProduct($id, $data, $units, $safeguard);
        return back()->with('status', 'Produk berhasil diperbarui.');
    }

    public function toggle($id)
    {
        $this->productService->toggleProduct($id);
        return back()->with('status', 'Status Produk berhasil diubah.');
    }
}
