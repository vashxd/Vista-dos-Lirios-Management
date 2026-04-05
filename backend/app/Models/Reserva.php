<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    protected $fillable = ['area_id', 'user_id', 'data', 'hora_inicio', 'hora_fim', 'status', 'motivo_rejeicao'];

    public function area() { return $this->belongsTo(AreaLazer::class, 'area_id'); }
    public function solicitante() { return $this->belongsTo(User::class, 'user_id'); }
}
