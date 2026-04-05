<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VotoEnquete extends Model
{
    protected $table = 'votos_enquete';
    protected $fillable = ['enquete_id', 'opcao_id', 'user_id'];
}
