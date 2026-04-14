<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    protected $fillable = [
        'name',
        'code',
        'address',
        'phone',
        'is_active',
        'opened_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'opened_at' => 'date',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }}
