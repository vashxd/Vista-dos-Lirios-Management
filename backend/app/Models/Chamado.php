<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chamado extends Model
{
    protected $fillable = ['protocolo', 'titulo', 'descricao', 'categoria', 'prioridade', 'status', 'avaliacao', 'user_id'];

    public function autor() { return $this->belongsTo(User::class, 'user_id'); }
    public function respostas() { return $this->hasMany(RespostaChamado::class); }
}
