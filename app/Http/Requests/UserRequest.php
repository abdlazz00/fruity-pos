<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use App\Enums\Role;

class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user !== null && $user->role === Role::OWNER;
    }

    public function rules(): array
    {
        $userId = $this->route('user') ? $this->route('user') : null;

        return [
            'name' => 'required|string|max:100',
            'username' => 'required|string|max:50|unique:users,username,' . $userId,
            'email' => 'nullable|email|unique:users,email,' . $userId,
            'phone' => 'nullable|string|max:20',
            'role' => ['required', new Enum(Role::class)],
            'location_id' => 'nullable|exists:locations,id',
            'password' => $userId ? 'nullable|min:8' : 'required|min:8',
        ];
    }
}
