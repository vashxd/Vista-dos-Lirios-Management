<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lancamento extends Model
{
    protected $fillable = ['tipo', 'categoria', 'valor', 'descricao', 'data', 'comprovante', 'user_id'];
    protected $casts = ['valor' => 'float'];

    public function criadoPor() { return $this->belongsTo(User::class, 'user_id'); }
}
