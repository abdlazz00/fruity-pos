<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user !== null && $user->role === \App\Enums\Role::OWNER;
    }

    public function rules(): array
    {
        $storeId = $this->route('store') ? $this->route('store') : null;

        return [
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:10|unique:locations,code,' . $storeId,
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'opened_at' => 'nullable|date',
            'is_active' => 'boolean',
            'assigned_users' => 'nullable|array',
            'assigned_users.*' => 'exists:users,id',
        ];
    }
}
