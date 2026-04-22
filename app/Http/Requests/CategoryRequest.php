<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user !== null && in_array($user->role->value, ['owner', 'stockist']);
    }

    public function rules(): array
    {
        $categoryId = $this->route('category') ? $this->route('category') : null;

        return [
            'name' => 'required|string|max:100|unique:categories,name,' . $categoryId,
            'description' => 'nullable|string',
        ];
    }
}
