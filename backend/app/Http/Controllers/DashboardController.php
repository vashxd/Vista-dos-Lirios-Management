<?php

namespace App\Http\Controllers;

use App\Models\Aviso;
use App\Models\Chamado;
use App\Models\Encomenda;
use App\Models\Enquete;
use App\Models\Evento;
use App\Models\Lancamento;
use App\Models\Reserva;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isSindico = $user->isSindico();

        $chamadosAbertos = $isSindico
            ? Chamado::whereIn('status', ['aberto', 'em_andamento'])->count()
            : Chamado::where('user_id', $user->id)->whereIn('status', ['aberto', 'em_andamento'])->count();

        $reservasPendentes = $isSindico
            ? Reserva::where('status', 'pendente')->count()
            : Reserva::where('user_id', $user->id)->where('status', 'pendente')->count();

        $encomendas = Encomenda::where('user_id', $user->id)->where('status', 'aguardando')->count();

        $enquetesAtivas = Enquete::where('encerrada', false)->where('prazo', '>=', now()->toDateString())->count();

        $avisosRecentes = Aviso::with('autor:id,name,sobrenome,tipo')
            ->withCount('comentarios')
            ->orderByDesc('fixado')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($a) => [
                'id'               => $a->id,
                'titulo'           => $a->titulo,
                'categoria'        => $a->categoria,
                'fixado'           => $a->fixado,
                'comentarios_count' => $a->comentarios_count,
                'autor'            => ['nome' => $a->autor->name, 'sobrenome' => $a->autor->sobrenome, 'tipo' => $a->autor->tipo],
                'created_at'       => $a->created_at,
            ]);

        $proximosEventos = Evento::where('data_inicio', '>=', now())
            ->orderBy('data_inicio')
            ->limit(3)
            ->get()
            ->map(fn($e) => ['id' => $e->id, 'titulo' => $e->titulo, 'data_inicio' => $e->data_inicio, 'local' => $e->local, 'tipo' => $e->tipo]);

        $result = [
            'chamados_abertos'       => $chamadosAbertos,
            'reservas_pendentes'     => $reservasPendentes,
            'enquetes_ativas'        => $enquetesAtivas,
            'encomendas_aguardando'  => $encomendas,
            'avisos_recentes'        => $avisosRecentes,
            'proximos_eventos'       => $proximosEventos,
        ];

        if ($isSindico) {
            $mesAtual = now()->format('Y-m');
            $receitas = Lancamento::where('tipo', 'receita')->whereRaw("strftime('%Y-%m', data) = ?", [$mesAtual])->sum('valor');
            $despesas = Lancamento::where('tipo', 'despesa')->whereRaw("strftime('%Y-%m', data) = ?", [$mesAtual])->sum('valor');
            $result['financeiro_resumo'] = ['receitas' => (float)$receitas, 'despesas' => (float)$despesas, 'saldo' => (float)$receitas - (float)$despesas];
        }

        return response()->json($result);
    }

    public function sindicoDashboard(Request $request)
    {
        $this->authorize('sindico');

        $chamadosAbertos = Chamado::whereIn('status', ['aberto', 'em_andamento'])->count();
        $reservasPendentes = Reserva::where('status', 'pendente')->count();
        $encoменdasPendentes = Encomenda::where('status', 'aguardando')->count();

        $mesAtual = now()->format('Y-m');
        $receitas = Lancamento::where('tipo', 'receita')->whereRaw("strftime('%Y-%m', data) = ?", [$mesAtual])->sum('valor');
        $despesas = Lancamento::where('tipo', 'despesa')->whereRaw("strftime('%Y-%m', data) = ?", [$mesAtual])->sum('valor');

        $chamadosRecentes = Chamado::with('autor:id,name,sobrenome')
            ->whereIn('status', ['aberto', 'em_andamento'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($c) => ['id' => $c->id, 'titulo' => $c->titulo, 'prioridade' => $c->prioridade, 'autor' => ['nome' => $c->autor->name], 'created_at' => $c->created_at]);

        $graficoData = Lancamento::selectRaw("strftime('%Y-%m', data) as mes, tipo, SUM(valor) as total")
            ->groupBy('mes', 'tipo')
            ->orderBy('mes')
            ->limit(12)
            ->get();

        $grafico = [];
        foreach ($graficoData as $row) {
            $grafico[$row->mes] ??= ['mes' => $row->mes, 'receitas' => 0, 'despesas' => 0];
            $grafico[$row->mes][$row->tipo === 'receita' ? 'receitas' : 'despesas'] = (float)$row->total;
        }

        $totalAvaliacoes = Chamado::whereNotNull('avaliacao')->count();
        $mediaAvaliacao = $totalAvaliacoes > 0 ? Chamado::whereNotNull('avaliacao')->avg('avaliacao') : null;

        return response()->json([
            'chamados_abertos'       => $chamadosAbertos,
            'reservas_pendentes'     => $reservasPendentes,
            'encomendas_pendentes'   => $encoменdasPendentes,
            'saldo_mensal'           => (float)$receitas - (float)$despesas,
            'chamados_recentes'      => $chamadosRecentes,
            'grafico_financeiro'     => array_values($grafico),
            'avaliacao_media'        => $mediaAvaliacao ? round($mediaAvaliacao, 1) : null,
            'total_avaliacoes'       => $totalAvaliacoes,
        ]);
    }
}
