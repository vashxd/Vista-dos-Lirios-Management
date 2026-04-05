<?php

namespace App\Http\Controllers;

use App\Models\Aviso;
use App\Models\Comentario;
use Illuminate\Http\Request;

class AvisoController extends Controller
{
    public function index(Request $request)
    {
        $query = Aviso::with(['autor:id,name,sobrenome,foto,tipo'])
            ->withCount('comentarios')
            ->orderByDesc('fixado')
            ->orderByDesc('created_at');

        if ($request->search) {
            $query->where(fn($q) => $q->where('titulo', 'like', "%{$request->search}%")
                ->orWhere('corpo', 'like', "%{$request->search}%"));
        }

        if ($request->categoria) {
            $query->where('categoria', $request->categoria);
        }

        return response()->json($query->get()->map(fn($a) => $this->format($a)));
    }

    public function store(Request $request)
    {
        $this->authorize('sindico');

        $data = $request->validate([
            'titulo'    => 'required|string|max:255',
            'corpo'     => 'required|string',
            'categoria' => 'required|in:geral,manutencao,seguranca,eventos,obras,regulamento',
            'fixado'    => 'boolean',
            'expira_em' => 'nullable|date',
        ]);

        $aviso = Aviso::create([...$data, 'user_id' => $request->user()->id]);
        $aviso->load(['autor:id,name,sobrenome,foto,tipo']);
        $aviso->loadCount('comentarios');

        return response()->json($this->format($aviso), 201);
    }

    public function destroy(Request $request, Aviso $aviso)
    {
        $this->authorize('sindico');
        $aviso->delete();
        return response()->json(['message' => 'Aviso excluído.']);
    }

    public function comentarios(Aviso $aviso)
    {
        return response()->json(
            $aviso->comentarios()->with(['autor:id,name,sobrenome,foto'])->orderBy('created_at')->get()
                ->map(fn($c) => [
                    'id'    => $c->id,
                    'corpo' => $c->corpo,
                    'autor' => ['id' => $c->autor->id, 'nome' => $c->autor->name, 'sobrenome' => $c->autor->sobrenome, 'foto' => $c->autor->foto],
                    'created_at' => $c->created_at,
                ])
        );
    }

    public function addComentario(Request $request, Aviso $aviso)
    {
        $data = $request->validate(['corpo' => 'required|string|max:2000']);
        $c = Comentario::create(['aviso_id' => $aviso->id, 'user_id' => $request->user()->id, 'corpo' => $data['corpo']]);
        $c->load('autor:id,name,sobrenome,foto');

        return response()->json([
            'id'    => $c->id,
            'corpo' => $c->corpo,
            'autor' => ['id' => $c->autor->id, 'nome' => $c->autor->name, 'sobrenome' => $c->autor->sobrenome, 'foto' => $c->autor->foto],
            'created_at' => $c->created_at,
        ], 201);
    }

    private function format(Aviso $a): array
    {
        return [
            'id'               => $a->id,
            'titulo'           => $a->titulo,
            'corpo'            => $a->corpo,
            'categoria'        => $a->categoria,
            'fixado'           => $a->fixado,
            'expira_em'        => $a->expira_em,
            'autor'            => ['id' => $a->autor->id, 'nome' => $a->autor->name, 'sobrenome' => $a->autor->sobrenome, 'foto' => $a->autor->foto, 'tipo' => $a->autor->tipo],
            'comentarios_count' => $a->comentarios_count,
            'created_at'       => $a->created_at,
        ];
    }
}
