<?php

namespace App\Http\Controllers;

use App\Models\ConfirmacaoEvento;
use App\Models\Evento;
use Illuminate\Http\Request;

class EventoController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $eventos = Evento::withCount('confirmacoes')
            ->orderBy('data_inicio')
            ->get()
            ->map(function ($e) use ($userId) {
                $fmt = $this->format($e);
                $fmt['minha_confirmacao'] = ConfirmacaoEvento::where('evento_id', $e->id)->where('user_id', $userId)->exists();
                return $fmt;
            });

        return response()->json($eventos);
    }

    public function store(Request $request)
    {
        $this->authorize('sindico');
        $data = $request->validate([
            'titulo'      => 'required|string|max:255',
            'descricao'   => 'nullable|string',
            'tipo'        => 'required|string',
            'data_inicio' => 'required|date',
            'data_fim'    => 'nullable|date|after:data_inicio',
            'local'       => 'nullable|string',
            'pauta'       => 'nullable|string',
        ]);

        $evento = Evento::create([...$data, 'user_id' => $request->user()->id]);
        $evento->loadCount('confirmacoes');

        return response()->json($this->format($evento), 201);
    }

    public function confirmar(Request $request, Evento $evento)
    {
        $userId = $request->user()->id;
        ConfirmacaoEvento::firstOrCreate(['evento_id' => $evento->id, 'user_id' => $userId]);

        return response()->json(['message' => 'Presença confirmada!']);
    }

    private function format(Evento $e): array
    {
        return [
            'id'                  => $e->id,
            'titulo'              => $e->titulo,
            'descricao'           => $e->descricao,
            'tipo'                => $e->tipo,
            'data_inicio'         => $e->data_inicio,
            'data_fim'            => $e->data_fim,
            'local'               => $e->local,
            'pauta'               => $e->pauta,
            'confirmacoes_count'  => $e->confirmacoes_count ?? 0,
            'created_at'          => $e->created_at,
        ];
    }
}
