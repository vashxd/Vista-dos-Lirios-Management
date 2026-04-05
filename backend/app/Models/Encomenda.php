<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Encomenda extends Model
{
    protected $fillable = ['descricao', 'foto', 'remetente', 'user_id', 'status', 'retirada_em', 'registrado_por'];
    protected $casts = ['retirada_em' => 'datetime'];

    public function destinatario() { return $this->belongsTo(User::class, 'user_id'); }
    public function registradoPor() { return $this->belongsTo(User::class, 'registrado_por'); }
}
