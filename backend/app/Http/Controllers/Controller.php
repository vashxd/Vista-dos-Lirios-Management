<?php

namespace App\Http\Controllers;

abstract class Controller
{
    protected function authorize(string $role, mixed $model = null): void
    {
        $user = request()->user();

        if (! $user) {
            abort(401, 'Não autenticado.');
        }

        $allowed = match ($role) {
            'sindico' => in_array($user->tipo, ['sindico', 'admin']),
            'admin'   => $user->tipo === 'admin',
            default   => false,
        };

        if (! $allowed) {
            abort(403, 'Acesso não autorizado.');
        }
    }
}
