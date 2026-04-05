<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpcaoEnquete extends Model
{
    protected $table = 'opcoes_enquete';
    protected $fillable = ['enquete_id', 'texto'];

    public function enquete() { return $this->belongsTo(Enquete::class); }
    public function votos() { return $this->hasMany(VotoEnquete::class, 'opcao_id'); }
}
