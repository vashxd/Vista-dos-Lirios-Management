<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciais inválidas.'],
            ]);
        }

        if ($user->status !== 'ativo') {
            return response()->json(['message' => 'Conta inativa ou pendente.'], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user'  => $this->formatUser($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout realizado.']);
    }

    public function me(Request $request)
    {
        return response()->json($this->formatUser($request->user()));
    }

    private function formatUser(User $user): array
    {
        return [
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
        ];
    }
}
