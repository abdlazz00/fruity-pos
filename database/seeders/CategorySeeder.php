<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Buah Lokal', 'description' => 'Apel malang, jeruk pontianak, pisang, dsb.'],
            ['name' => 'Buah Import Premium', 'description' => 'Anggur muscat, cherry, apel fuji, dsb.'],
            ['name' => 'Buah Potong / Olahan', 'description' => 'Salad buah, jus, buah potong box.'],
        ];

        foreach ($categories as $data) {
            Category::updateOrCreate(['name' => $data['name']], $data);
        }
    }
}
