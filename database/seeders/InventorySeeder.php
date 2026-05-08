<?php

namespace Database\Seeders;

use App\Models\Location;
use App\Models\Product;
use App\Models\Inventory;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        $locations = Location::all();
        $products = Product::all();
        foreach ($locations as $l) {
            foreach ($products as $p) {
                Inventory::create([
                    'location_id' => $l->id,
                    'product_id' => $p->id,
                    'quantity' => 100,
                    'avg_cost' => 5000
                ]);
            }
        }
    }
}
