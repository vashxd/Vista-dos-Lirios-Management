<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pet extends Model
{
    protected $fillable = ['user_id', 'nome', 'raca', 'porte', 'foto', 'vacinas'];
    protected $casts = ['vacinas' => 'array'];

    public function owner() { return $this->belongsTo(User::class, 'user_id'); }
}
