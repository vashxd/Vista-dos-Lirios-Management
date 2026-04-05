<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConfirmacaoEvento extends Model
{
    protected $table = 'confirmacoes_evento';
    protected $fillable = ['evento_id', 'user_id'];
}
