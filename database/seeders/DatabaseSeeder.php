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

        $locations = [
            [
                'name' => 'Toko Pusat Serpong',
                'code' => 'SRP',
                'address' => 'Jl. Serpong Raya No. 1',
                'phone' => '081234567890',
            ],
            [
                'name' => 'Toko Cabang BSD',
                'code' => 'BSD',
                'address' => 'Jl. BSD Raya Utama',
                'phone' => '081234567891',
            ],
            [
                'name' => 'Toko Cabang Bintaro',
                'code' => 'BTR',
                'address' => 'Jl. Bintaro Sektor 7',
                'phone' => '081234567892',
            ]
        ];

        foreach ($locations as $i => $locData) {
            $num = $i + 1;
            
            $location = Location::updateOrCreate(
                ['code' => $locData['code']],
                array_merge($locData, [
                    'is_active' => true,
                    'opened_at' => Carbon::parse('2025-01-0' . $num),
                ])
            );

            // 3 Staff per location
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
