<?php

namespace App\Http\Controllers;

use App\Services\CategoryService;
use App\Http\Requests\CategoryRequest;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    protected $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    public function index(Request $request)
    {
        $categories = $this->categoryService->getPaginatedCategories();
        
        if ($request->wantsJson()) {
            return response()->json($categories);
        }

        return inertia('Category/Index', ['categories' => $categories]);
    }

    public function store(CategoryRequest $request)
    {
        $this->categoryService->createCategory($request->validated());
        return back()->with('status', 'Kategori buah berhasil ditambahkan.');
    }

    public function update(CategoryRequest $request, $id)
    {
        $this->categoryService->updateCategory($id, $request->validated());
        return back()->with('status', 'Kategori buah berhasil diperbarui.');
    }

    public function destroy($id)
    {
        try {
            $this->categoryService->deleteCategory($id);
            return back()->with('status', 'Kategori dihapus permanen.');
        } catch (\Exception $e) {
            return back()->with('error', collect([$e->getMessage()])->flatten()->first());
        }
    }
}
