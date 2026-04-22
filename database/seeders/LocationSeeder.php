<?php

namespace Database\Seeders;

use App\Models\Location;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
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
            Location::updateOrCreate(
                ['code' => $locData['code']],
                array_merge($locData, [
                    'is_active' => true,
                    'opened_at' => Carbon::parse('2025-01-0' . $num),
                ])
            );
        }
    }
}
