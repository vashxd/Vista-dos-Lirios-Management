<?php

namespace App\Http\Controllers;

use App\Models\Chamado;
use App\Models\RespostaChamado;
use Illuminate\Http\Request;

class ChamadoController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Chamado::with(['autor:id,name,sobrenome,bloco,apartamento'])
            ->orderByDesc('created_at');

        if (! $user->isSindico()) {
            $query->where('user_id', $user->id);
        }

        return response()->json($query->get()->map(fn($c) => $this->format($c)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'titulo'    => 'required|string|max:255',
            'descricao' => 'required|string',
            'categoria' => 'required|string',
            'prioridade' => 'required|in:baixa,media,alta,urgente',
        ]);

        $protocolo = 'CHM-' . now()->year . '-' . str_pad(Chamado::count() + 1, 4, '0', STR_PAD_LEFT);

        $chamado = Chamado::create([...$data, 'user_id' => $request->user()->id, 'protocolo' => $protocolo, 'status' => 'aberto']);
        $chamado->load('autor:id,name,sobrenome,bloco,apartamento');

        return response()->json($this->format($chamado), 201);
    }

    public function updateStatus(Request $request, Chamado $chamado)
    {
        $this->authorize('sindico', $chamado);
        $data = $request->validate(['status' => 'required|in:aberto,em_andamento,aguardando,resolvido,fechado']);
        $chamado->update($data);
        return response()->json($this->format($chamado->fresh('autor')));
    }

    public function respostas(Chamado $chamado)
    {
        return response()->json(
            $chamado->respostas()->with(['autor:id,name,sobrenome,tipo'])->orderBy('created_at')->get()
                ->map(fn($r) => [
                    'id'    => $r->id,
                    'corpo' => $r->corpo,
                    'autor' => ['id' => $r->autor->id, 'nome' => $r->autor->name, 'sobrenome' => $r->autor->sobrenome, 'tipo' => $r->autor->tipo],
                    'created_at' => $r->created_at,
                ])
        );
    }

    public function addResposta(Request $request, Chamado $chamado)
    {
        $data = $request->validate(['corpo' => 'required|string']);
        $r = RespostaChamado::create(['chamado_id' => $chamado->id, 'user_id' => $request->user()->id, 'corpo' => $data['corpo']]);
        $r->load('autor:id,name,sobrenome,tipo');

        return response()->json([
            'id'    => $r->id,
            'corpo' => $r->corpo,
            'autor' => ['id' => $r->autor->id, 'nome' => $r->autor->name, 'sobrenome' => $r->autor->sobrenome, 'tipo' => $r->autor->tipo],
            'created_at' => $r->created_at,
        ], 201);
    }

    private function format(Chamado $c): array
    {
        return [
            'id'         => $c->id,
            'protocolo'  => $c->protocolo,
            'titulo'     => $c->titulo,
            'descricao'  => $c->descricao,
            'categoria'  => $c->categoria,
            'prioridade' => $c->prioridade,
            'status'     => $c->status,
            'avaliacao'  => $c->avaliacao,
            'autor'      => ['id' => $c->autor->id, 'nome' => $c->autor->name, 'sobrenome' => $c->autor->sobrenome, 'bloco' => $c->autor->bloco, 'apartamento' => $c->autor->apartamento],
            'created_at' => $c->created_at,
            'updated_at' => $c->updated_at,
        ];
    }
}
