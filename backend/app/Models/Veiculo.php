<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Veiculo extends Model
{
    protected $fillable = ['user_id', 'placa', 'modelo', 'cor', 'foto', 'vaga'];

    public function owner() { return $this->belongsTo(User::class, 'user_id'); }
}
