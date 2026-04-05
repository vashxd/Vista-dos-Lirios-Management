<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aviso extends Model
{
    protected $fillable = ['titulo', 'corpo', 'categoria', 'fixado', 'expira_em', 'user_id'];

    protected $casts = ['fixado' => 'boolean', 'expira_em' => 'datetime'];

    public function autor() { return $this->belongsTo(User::class, 'user_id'); }
    public function comentarios() { return $this->hasMany(Comentario::class); }
}
