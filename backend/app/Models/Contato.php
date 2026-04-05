<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contato extends Model
{
    protected $fillable = ['nome', 'categoria', 'telefone', 'descricao', 'emergencia'];
    protected $casts = ['emergencia' => 'boolean'];
}
