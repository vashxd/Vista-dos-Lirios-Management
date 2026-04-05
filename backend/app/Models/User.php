<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name', 'sobrenome', 'email', 'password', 'telefone', 'cpf',
        'foto', 'bloco', 'apartamento', 'tipo', 'status',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isSindico(): bool
    {
        return in_array($this->tipo, ['sindico', 'admin']);
    }

    public function isAdmin(): bool
    {
        return $this->tipo === 'admin';
    }

    public function chamados() { return $this->hasMany(Chamado::class); }
    public function reservas() { return $this->hasMany(Reserva::class); }
    public function veiculos() { return $this->hasMany(Veiculo::class); }
    public function pets() { return $this->hasMany(Pet::class); }
}
