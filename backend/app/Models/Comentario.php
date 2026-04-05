<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comentario extends Model
{
    protected $fillable = ['aviso_id', 'user_id', 'corpo'];

    public function autor() { return $this->belongsTo(User::class, 'user_id'); }
    public function aviso() { return $this->belongsTo(Aviso::class); }
}
