<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Location;
use App\Enums\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Owner
        User::updateOrCreate(
            ['username' => 'owner'],
            [
                'name' => 'Pak Andi',
                'password' => Hash::make('password'),
                'email' => 'posfruity@gmail.com',
                'role' => Role::OWNER,
                'location_id' => null,
                'is_active' => true,
            ]
        );

        // 2. Staff per location
        $locations = Location::all();
        foreach ($locations as $index => $location) {
            $num = $index + 1;
            
            User::updateOrCreate(
                ['username' => 'stockist' . $num],
                [
                    'name' => 'Stockist ' . $num,
                    'email' => 'stockist' . $num . '@fruity.com',
                    'password' => Hash::make('password'),
                    'role' => Role::STOCKIST,
                    'location_id' => $location->id,
                    'is_active' => true,
                ]
            );

            User::updateOrCreate(
                ['username' => 'kasir' . $num],
                [
                    'name' => 'Kasir ' . $num,
                    'email' => 'kasir' . $num . '@fruity.com',
                    'password' => Hash::make('password'),
                    'role' => Role::KASIR,
                    'location_id' => $location->id,
                    'is_active' => true,
                ]
            );

            User::updateOrCreate(
                ['username' => 'admin' . $num],
                [
                    'name' => 'Admin ' . $num,
                    'email' => 'admin' . $num . '@fruity.com',
                    'password' => Hash::make('password'),
                    'role' => Role::ADMIN,
                    'location_id' => $location->id,
                    'is_active' => true,
                ]
            );
        }
    }
}
