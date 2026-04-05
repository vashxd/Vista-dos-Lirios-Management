<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evento extends Model
{
    protected $fillable = ['titulo', 'descricao', 'tipo', 'data_inicio', 'data_fim', 'local', 'pauta', 'user_id'];
    protected $casts = ['data_inicio' => 'datetime', 'data_fim' => 'datetime'];

    public function criador() { return $this->belongsTo(User::class, 'user_id'); }
    public function confirmacoes() { return $this->hasMany(ConfirmacaoEvento::class); }
}
