<?php

namespace App\Http\Controllers;

use App\Models\Enquete;
use App\Models\OpcaoEnquete;
use App\Models\VotoEnquete;
use Illuminate\Http\Request;

class EnqueteController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $enquetes = Enquete::with(['opcoes.votos', 'criadoPor:id,name,sobrenome'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($enquetes->map(function ($e) use ($userId) {
            $meuVoto = VotoEnquete::where('enquete_id', $e->id)->where('user_id', $userId)->value('opcao_id');
            return [
                'id'          => $e->id,
                'titulo'      => $e->titulo,
                'descricao'   => $e->descricao,
                'tipo'        => $e->tipo,
                'anonima'     => $e->anonima,
                'prazo'       => $e->prazo,
                'quorum'      => $e->quorum,
                'encerrada'   => $e->encerrada,
                'total_votos' => $e->votos()->count(),
                'meu_voto'    => $meuVoto,
                'opcoes'      => $e->opcoes->map(fn($o) => ['id' => $o->id, 'texto' => $o->texto, 'votos' => $o->votos->count()]),
                'criado_por'  => ['nome' => $e->criadoPor->name, 'sobrenome' => $e->criadoPor->sobrenome],
                'created_at'  => $e->created_at,
            ];
        }));
    }

    public function store(Request $request)
    {
        $this->authorize('sindico');
        $data = $request->validate([
            'titulo'   => 'required|string',
            'descricao' => 'nullable|string',
            'tipo'     => 'required|in:multipla,simnao',
            'anonima'  => 'boolean',
            'prazo'    => 'required|date',
            'quorum'   => 'integer|min:0',
            'opcoes'   => 'required|array|min:2',
            'opcoes.*' => 'required|string',
        ]);

        $enquete = Enquete::create([
            'titulo'   => $data['titulo'],
            'descricao' => $data['descricao'] ?? null,
            'tipo'     => $data['tipo'],
            'anonima'  => $data['anonima'] ?? false,
            'prazo'    => $data['prazo'],
            'quorum'   => $data['quorum'] ?? 0,
            'user_id'  => $request->user()->id,
        ]);

        foreach ($data['opcoes'] as $texto) {
            OpcaoEnquete::create(['enquete_id' => $enquete->id, 'texto' => $texto]);
        }

        return response()->json(['message' => 'Enquete criada!', 'id' => $enquete->id], 201);
    }

    public function votar(Request $request, Enquete $enquete)
    {
        $data = $request->validate(['opcao_id' => 'required|exists:opcoes_enquete,id']);
        $userId = $request->user()->id;

        if ($enquete->encerrada || $enquete->prazo < now()->toDateString()) {
            return response()->json(['message' => 'Enquete encerrada.'], 422);
        }

        if (VotoEnquete::where('enquete_id', $enquete->id)->where('user_id', $userId)->exists()) {
            return response()->json(['message' => 'Você já votou nesta enquete.'], 422);
        }

        VotoEnquete::create(['enquete_id' => $enquete->id, 'opcao_id' => $data['opcao_id'], 'user_id' => $userId]);

        return response()->json(['message' => 'Voto registrado!']);
    }
}
