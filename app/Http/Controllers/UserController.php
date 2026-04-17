<?php

namespace App\Http\Controllers;

use App\Services\UserService;
use App\Http\Requests\UserRequest;
use Illuminate\Http\Request;

class UserController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index(Request $request)
    {
        $users = $this->userService->getPaginatedUsers($request->query('location_id'));
        $locations = \App\Models\Location::where('is_active', true)->get();
        if ($request->wantsJson()) {
            return response()->json($users);
        }
        return inertia('User/Index', [
            'users' => $users,
            'locations' => $locations
        ]);
    }

    public function create()
    {
        $locations = \App\Models\Location::where('is_active', true)->get();
        return inertia('User/Form', ['locations' => $locations]);
    }

    public function store(UserRequest $request)
    {
        $this->userService->createUser($request->validated());
        return redirect()->route('users.index')->with('status', 'Pengguna berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $user = \App\Models\User::findOrFail($id);
        $locations = \App\Models\Location::where('is_active', true)->get();
        return inertia('User/Form', ['user' => $user, 'locations' => $locations]);
    }

    public function update(UserRequest $request, $id)
    {
        $this->userService->updateUser($id, $request->validated());
        return redirect()->route('users.index')->with('status', 'Pengguna berhasil diperbarui.');
    }

    public function toggle($id)
    {
        try {
            $this->userService->toggleUser($id);
            return back()->with('status', 'Status pengguna berhasil diubah.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->with('error', collect($e->errors())->flatten()->first());
        }
    }
}
