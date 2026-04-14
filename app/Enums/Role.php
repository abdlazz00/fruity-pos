<?php

namespace App\Enums;

enum Role: string
{
    case OWNER = 'owner';
    case STOCKIST = 'stockist';
    case KASIR = 'kasir';
    case ADMIN = 'admin';

    public function label(): string
    {
        return match($this) {
            self::OWNER => 'Owner',
            self::STOCKIST => 'Stockist',
            self::KASIR => 'Kasir',
            self::ADMIN => 'Admin',
        };
    }
}
