<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enquete extends Model
{
    protected $fillable = ['titulo', 'descricao', 'tipo', 'anonima', 'prazo', 'quorum', 'encerrada', 'user_id'];
    protected $casts = ['anonima' => 'boolean', 'encerrada' => 'boolean'];

    public function criadoPor() { return $this->belongsTo(User::class, 'user_id'); }
    public function opcoes() { return $this->hasMany(OpcaoEnquete::class); }
    public function votos() { return $this->hasMany(VotoEnquete::class); }
}
