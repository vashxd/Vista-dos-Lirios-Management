<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RespostaChamado extends Model
{
    protected $table = 'respostas_chamado';
    protected $fillable = ['chamado_id', 'user_id', 'corpo'];

    public function autor() { return $this->belongsTo(User::class, 'user_id'); }
    public function chamado() { return $this->belongsTo(Chamado::class); }
}
