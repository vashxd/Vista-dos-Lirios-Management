<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function usuarios(Request $request)
    {
        $this->authorize('admin');
        $query = User::orderBy('name');

        if ($request->search) {
            $query->where(fn($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('sobrenome', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%"));
        }

        return response()->json($query->get()->map(fn($u) => $this->formatUser($u)));
    }

    public function createUsuario(Request $request)
    {
        $this->authorize('admin');
        $data = $request->validate([
            'nome'        => 'required|string',
            'sobrenome'   => 'required|string',
            'email'       => 'required|email|unique:users,email',
            'cpf'         => 'required|string|unique:users,cpf',
            'telefone'    => 'required|string',
            'bloco'       => 'required|string',
            'apartamento' => 'required|string',
            'tipo'        => 'required|in:admin,sindico,condomino',
            'password'    => 'required|string|min:8',
        ]);

        $user = User::create([
            'name'        => $data['nome'],
            'sobrenome'   => $data['sobrenome'],
            'email'       => $data['email'],
            'cpf'         => $data['cpf'],
            'telefone'    => $data['telefone'],
            'bloco'       => $data['bloco'],
            'apartamento' => $data['apartamento'],
            'tipo'        => $data['tipo'],
            'password'    => Hash::make($data['password']),
            'status'      => 'ativo',
        ]);

        return response()->json($this->formatUser($user), 201);
    }

    public function updateUsuario(Request $request, User $usuario)
    {
        $this->authorize('admin');
        $data = $request->validate([
            'nome'      => 'sometimes|string',
            'sobrenome' => 'sometimes|string',
            'tipo'      => 'sometimes|in:admin,sindico,condomino',
            'status'    => 'sometimes|in:ativo,inativo,pendente',
        ]);

        if (isset($data['nome'])) $usuario->name = $data['nome'];
        if (isset($data['sobrenome'])) $usuario->sobrenome = $data['sobrenome'];
        if (isset($data['tipo'])) $usuario->tipo = $data['tipo'];
        if (isset($data['status'])) $usuario->status = $data['status'];
        $usuario->save();

        return response()->json($this->formatUser($usuario));
    }

    public function updateStatus(Request $request, User $usuario)
    {
        $this->authorize('admin');
        $data = $request->validate(['status' => 'required|in:ativo,inativo,pendente']);
        $usuario->update($data);
        return response()->json($this->formatUser($usuario));
    }

    public function listarUsuarios(Request $request)
    {
        // Para dropdown em encomendas
        return response()->json(
            User::where('status', 'ativo')
                ->orderBy('name')
                ->get()
                ->map(fn($u) => ['id' => $u->id, 'nome' => $u->name, 'sobrenome' => $u->sobrenome, 'bloco' => $u->bloco, 'apartamento' => $u->apartamento])
        );
    }

    private function formatUser(User $u): array
    {
        return [
            'id'          => $u->id,
            'nome'        => $u->name,
            'sobrenome'   => $u->sobrenome,
            'email'       => $u->email,
            'cpf'         => $u->cpf,
            'telefone'    => $u->telefone,
            'foto'        => $u->foto ? asset('storage/' . $u->foto) : null,
            'bloco'       => $u->bloco,
            'apartamento' => $u->apartamento,
            'tipo'        => $u->tipo,
            'status'      => $u->status,
        ];
    }
}
