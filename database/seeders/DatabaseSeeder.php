<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Location;
use App\Enums\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $location = Location::create([
            'name' => 'Toko Pusat Serpong',
            'code' => 'SRP',
            'address' => 'Jl. Serpong Raya No. 1',
            'phone' => '081234567890',
            'is_active' => true,
            'opened_at' => Carbon::parse('2025-01-01'),
        ]);

        User::create([
            'name' => 'Pak Andi',
            'username' => 'owner',
            'password' => Hash::make('password'),
            'role' => Role::OWNER,
            'location_id' => null,
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Budi Santoso',
            'username' => 'stockist1',
            'password' => Hash::make('password'),
            'role' => Role::STOCKIST,
            'location_id' => $location->id,
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Rina Permata',
            'username' => 'kasir1',
            'password' => Hash::make('password'),
            'role' => Role::KASIR,
            'location_id' => $location->id,
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Dina Ayu',
            'username' => 'admin1',
            'password' => Hash::make('password'),
            'role' => Role::ADMIN,
            'location_id' => $location->id,
            'is_active' => true,
        ]);
    }
}
