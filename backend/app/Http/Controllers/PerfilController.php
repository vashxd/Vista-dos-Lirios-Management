<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PerfilController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'nome'      => 'sometimes|string|max:255',
            'sobrenome' => 'sometimes|string|max:255',
            'telefone'  => 'sometimes|string|max:20',
        ]);

        if (isset($data['nome'])) {
            $user->name = $data['nome'];
        }
        if (isset($data['sobrenome'])) {
            $user->sobrenome = $data['sobrenome'];
        }
        if (isset($data['telefone'])) {
            $user->telefone = $data['telefone'];
        }

        $user->save();

        return response()->json([
            'user' => [
                'id'          => $user->id,
                'nome'        => $user->name,
                'sobrenome'   => $user->sobrenome,
                'email'       => $user->email,
                'telefone'    => $user->telefone,
                'cpf'         => $user->cpf,
                'foto'        => $user->foto ? asset('storage/' . $user->foto) : null,
                'bloco'       => $user->bloco,
                'apartamento' => $user->apartamento,
                'tipo'        => $user->tipo,
                'status'      => $user->status,
            ],
        ]);
    }
}
