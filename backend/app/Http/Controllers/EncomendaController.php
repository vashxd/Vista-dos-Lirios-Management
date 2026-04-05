<?php

namespace App\Http\Controllers;

use App\Models\Encomenda;
use Illuminate\Http\Request;

class EncomendaController extends Controller
{
    public function minhas(Request $request)
    {
        return response()->json(
            Encomenda::where('user_id', $request->user()->id)
                ->orderByDesc('created_at')
                ->get()
                ->map(fn($e) => $this->format($e))
        );
    }

    public function index(Request $request)
    {
        $this->authorize('sindico');
        return response()->json(
            Encomenda::with(['destinatario:id,name,sobrenome,bloco,apartamento'])
                ->orderByDesc('created_at')
                ->get()
                ->map(fn($e) => $this->format($e))
        );
    }

    public function store(Request $request)
    {
        $this->authorize('sindico');
        $data = $request->validate([
            'user_id'   => 'required|exists:users,id',
            'descricao' => 'required|string',
            'remetente' => 'nullable|string',
        ]);

        $e = Encomenda::create([...$data, 'registrado_por' => $request->user()->id, 'status' => 'aguardando']);
        $e->load('destinatario:id,name,sobrenome,bloco,apartamento');

        return response()->json($this->format($e), 201);
    }

    public function retirar(Request $request, Encomenda $encomenda)
    {
        if ($encomenda->user_id !== $request->user()->id && ! $request->user()->isSindico()) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $encomenda->update(['status' => 'retirada', 'retirada_em' => now()]);
        return response()->json($this->format($encomenda->fresh('destinatario')));
    }

    private function format(Encomenda $e): array
    {
        $dest = $e->destinatario;
        return [
            'id'          => $e->id,
            'descricao'   => $e->descricao,
            'remetente'   => $e->remetente,
            'status'      => $e->status,
            'retirada_em' => $e->retirada_em,
            'destinatario' => $dest ? ['id' => $dest->id, 'nome' => $dest->name, 'sobrenome' => $dest->sobrenome, 'bloco' => $dest->bloco, 'apartamento' => $dest->apartamento] : null,
            'created_at'  => $e->created_at,
        ];
    }
}
