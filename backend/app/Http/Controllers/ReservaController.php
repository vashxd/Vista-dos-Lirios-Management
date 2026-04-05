<?php

namespace App\Http\Controllers;

use App\Models\AreaLazer;
use App\Models\Reserva;
use Illuminate\Http\Request;

class ReservaController extends Controller
{
    public function areas()
    {
        return response()->json(AreaLazer::where('ativa', true)->get());
    }

    public function index(Request $request)
    {
        $reservas = Reserva::with(['area', 'solicitante:id,name,sobrenome,bloco,apartamento'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($reservas->map(fn($r) => $this->format($r)));
    }

    public function indexAll(Request $request)
    {
        $this->authorize('sindico');
        $reservas = Reserva::with(['area', 'solicitante:id,name,sobrenome,bloco,apartamento'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($reservas->map(fn($r) => $this->format($r)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'area_id'     => 'required|exists:areas_lazer,id',
            'data'        => 'required|date|after_or_equal:today',
            'hora_inicio' => 'required',
            'hora_fim'    => 'required',
        ]);

        // Verificar conflito
        $conflito = Reserva::where('area_id', $data['area_id'])
            ->where('data', $data['data'])
            ->where('status', 'aprovada')
            ->where(fn($q) => $q->whereBetween('hora_inicio', [$data['hora_inicio'], $data['hora_fim']])
                ->orWhereBetween('hora_fim', [$data['hora_inicio'], $data['hora_fim']]))
            ->exists();

        if ($conflito) {
            return response()->json(['message' => 'Horário já reservado para esta área.'], 422);
        }

        $reserva = Reserva::create([...$data, 'user_id' => $request->user()->id, 'status' => 'pendente']);
        $reserva->load(['area', 'solicitante:id,name,sobrenome,bloco,apartamento']);

        return response()->json($this->format($reserva), 201);
    }

    public function aprovar(Request $request, Reserva $reserva)
    {
        $this->authorize('sindico');
        $reserva->update(['status' => 'aprovada']);
        return response()->json($this->format($reserva->fresh(['area', 'solicitante'])));
    }

    public function rejeitar(Request $request, Reserva $reserva)
    {
        $this->authorize('sindico');
        $data = $request->validate(['motivo' => 'required|string']);
        $reserva->update(['status' => 'rejeitada', 'motivo_rejeicao' => $data['motivo']]);
        return response()->json($this->format($reserva->fresh(['area', 'solicitante'])));
    }

    public function cancelar(Request $request, Reserva $reserva)
    {
        if ($reserva->user_id !== $request->user()->id && ! $request->user()->isSindico()) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }
        $reserva->update(['status' => 'cancelada']);
        return response()->json($this->format($reserva->fresh(['area', 'solicitante'])));
    }

    private function format(Reserva $r): array
    {
        return [
            'id'               => $r->id,
            'area'             => $r->area,
            'data'             => $r->data,
            'hora_inicio'      => $r->hora_inicio,
            'hora_fim'         => $r->hora_fim,
            'status'           => $r->status,
            'motivo_rejeicao'  => $r->motivo_rejeicao,
            'solicitante'      => $r->solicitante ? ['id' => $r->solicitante->id, 'nome' => $r->solicitante->name, 'sobrenome' => $r->solicitante->sobrenome, 'bloco' => $r->solicitante->bloco, 'apartamento' => $r->solicitante->apartamento] : null,
            'created_at'       => $r->created_at,
        ];
    }
}
