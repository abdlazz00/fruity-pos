<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $catLokal = Category::where('name', 'Buah Lokal')->first()->id;
        $catImport = Category::where('name', 'Buah Import Premium')->first()->id;
        $catOlahan = Category::where('name', 'Buah Potong / Olahan')->first()->id;

        $products = [
            [
                'category_id' => $catLokal,
                'name' => 'Apel Malang Manis',
                'sku' => 'APL-MLG-001',
                'base_uom' => 'Gram',
                'units' => [
                    ['unit_name' => 'Kg', 'conversion_to_base' => 1000],
                    ['unit_name' => 'Kardus', 'conversion_to_base' => 15000],
                ],
                'safeguard' => ['min_weight_gram' => 50, 'max_weight_gram' => 20000]
            ],
            [
                'category_id' => $catLokal,
                'name' => 'Jeruk Pontianak',
                'sku' => 'JRK-PTK-002',
                'base_uom' => 'Gram',
                'units' => [
                    ['unit_name' => 'Kg', 'conversion_to_base' => 1000],
                    ['unit_name' => 'Jaring', 'conversion_to_base' => 2000],
                ],
                'safeguard' => ['min_weight_gram' => 80, 'max_weight_gram' => 15000]
            ],
            [
                'category_id' => $catLokal,
                'name' => 'Pisang Cavendish Lokal',
                'sku' => 'PSG-CAV-003',
                'base_uom' => 'Pcs',
                'units' => [
                    ['unit_name' => 'Sisir', 'conversion_to_base' => 12],
                ],
                'safeguard' => null
            ],
            [
                'category_id' => $catLokal,
                'name' => 'Manggis Purwakarta',
                'sku' => 'MGG-PWR-004',
                'base_uom' => 'Gram',
                'units' => [
                    ['unit_name' => 'Kg', 'conversion_to_base' => 1000],
                ],
                'safeguard' => ['min_weight_gram' => 50, 'max_weight_gram' => 10000]
            ],
            [
                'category_id' => $catLokal,
                'name' => 'Nanas Subang',
                'sku' => 'NNS-SBG-005',
                'base_uom' => 'Pcs',
                'units' => [
                    ['unit_name' => 'Kardus', 'conversion_to_base' => 10],
                ],
                'safeguard' => null
            ],
            [
                'category_id' => $catImport,
                'name' => 'Anggur Muscat Tipe A',
                'sku' => 'ANG-MUS-006',
                'base_uom' => 'Gram',
                'units' => [
                    ['unit_name' => 'Pack', 'conversion_to_base' => 500],
                    ['unit_name' => 'Kardus', 'conversion_to_base' => 4500],
                ],
                'safeguard' => ['min_weight_gram' => 10, 'max_weight_gram' => 5000]
            ],
            [
                'category_id' => $catImport,
                'name' => 'Cherry Import USA',
                'sku' => 'CHR-USA-007',
                'base_uom' => 'Gram',
                'units' => [
                    ['unit_name' => 'Pack', 'conversion_to_base' => 250],
                ],
                'safeguard' => ['min_weight_gram' => 5, 'max_weight_gram' => 3000]
            ],
            [
                'category_id' => $catImport,
                'name' => 'Apel Fuji Super',
                'sku' => 'APL-FUJ-008',
                'base_uom' => 'Pcs',
                'units' => [
                    ['unit_name' => 'Kardus', 'conversion_to_base' => 24],
                ],
                'safeguard' => null
            ],
            [
                'category_id' => $catImport,
                'name' => 'Kiwi Zespri Gold',
                'sku' => 'KWI-ZSP-009',
                'base_uom' => 'Pcs',
                'units' => [
                    ['unit_name' => 'Pack', 'conversion_to_base' => 4],
                ],
                'safeguard' => null
            ],
            [
                'category_id' => $catOlahan,
                'name' => 'Salad Buah Komplit (500ml)',
                'sku' => 'SLD-KMP-010',
                'base_uom' => 'Cup',
                'units' => [],
                'safeguard' => null
            ]
        ];

        foreach ($products as $data) {
            $units = $data['units'];
            $safeguard = $data['safeguard'];

            unset($data['units'], $data['safeguard']);
            
            $product = Product::updateOrCreate(
                ['sku' => $data['sku']],
                $data
            );

            if (!empty($units)) {
                $product->units()->delete();
                $product->units()->createMany($units);
            }

            if (!empty($safeguard)) {
                $product->safeguard()->updateOrCreate(
                    ['product_id' => $product->id],
                    $safeguard
                );
            }
        }
    }
}
