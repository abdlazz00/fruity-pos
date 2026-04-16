<?php

namespace App\Repositories;

use App\Models\Location;
use App\Repositories\Contracts\StoreRepositoryInterface;

class StoreRepository implements StoreRepositoryInterface
{
    public function allActive()
    {
        return Location::where('is_active', true)->get();
    }

    public function paginate($perPage = 15)
    {
        // We include staff count as per SRS S2-B02: "list with staff count"
        return Location::with(['users' => function($query) {
            $query->select('id', 'name', 'role', 'location_id', 'is_active');
        }])->withCount('users')->latest()->paginate($perPage);
    }

    public function find($id)
    {
        return Location::findOrFail($id);
    }

    public function create(array $data)
    {
        return Location::create($data);
    }

    public function update($id, array $data)
    {
        $location = $this->find($id);
        $location->update($data);
        return $location;
    }

    public function toggleActive($id)
    {
        $location = $this->find($id);
        $location->is_active = !$location->is_active;
        $location->save();
        return $location;
    }
}
