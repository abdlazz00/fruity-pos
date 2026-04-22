<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = [
            [
                'name' => 'PT Agro Buah Nusantara',
                'contact_person' => 'Bapak Joko',
                'phone' => '087711223344',
                'address' => 'Kawasan Industri Cikupa, Tangerang',
                'is_active' => true,
            ],
            [
                'name' => 'CV Bumi Segar Importa',
                'contact_person' => 'Ibu Maria',
                'phone' => '081199887766',
                'address' => 'Kelapa Gading Barat, Jakarta Utara',
                'is_active' => true,
            ],
        ];

        foreach ($suppliers as $data) {
            Supplier::updateOrCreate(['name' => $data['name']], $data);
        }
    }
}
