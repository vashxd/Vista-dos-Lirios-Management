<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Documento extends Model
{
    protected $fillable = ['titulo', 'categoria', 'descricao', 'arquivo', 'versao', 'tamanho', 'user_id'];

    public function criadoPor() { return $this->belongsTo(User::class, 'user_id'); }
}
