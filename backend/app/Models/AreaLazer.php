<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AreaLazer extends Model
{
    protected $table = 'areas_lazer';
    protected $fillable = ['nome', 'descricao', 'foto', 'capacidade', 'taxa', 'horario_inicio', 'horario_fim', 'antecedencia_min', 'antecedencia_max', 'cancelamento_horas', 'reservas_mes', 'ativa'];
    protected $casts = ['ativa' => 'boolean', 'taxa' => 'float'];

    public function reservas() { return $this->hasMany(Reserva::class, 'area_id'); }
}
