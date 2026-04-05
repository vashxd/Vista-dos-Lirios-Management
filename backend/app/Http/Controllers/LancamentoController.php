<?php

namespace App\Http\Controllers;

use App\Models\Lancamento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LancamentoController extends Controller
{
    public function index(Request $request)
    {
        $query = Lancamento::with(['criadoPor:id,name,sobrenome'])
            ->orderByDesc('data');

        if ($request->tipo) {
            $query->where('tipo', $request->tipo);
        }

        if ($request->search) {
            $query->where('descricao', 'like', "%{$request->search}%");
        }

        return response()->json($query->get()->map(fn($l) => $this->format($l)));
    }

    public function store(Request $request)
    {
        $this->authorize('sindico');
        $data = $request->validate([
            'tipo'      => 'required|in:receita,despesa',
            'categoria' => 'required|string',
            'valor'     => 'required|numeric|min:0',
            'descricao' => 'required|string',
            'data'      => 'required|date',
        ]);

        $l = Lancamento::create([...$data, 'user_id' => $request->user()->id]);
        $l->load('criadoPor:id,name,sobrenome');

        return response()->json($this->format($l), 201);
    }

    public function resumo()
    {
        $data = Lancamento::selectRaw("strftime('%Y-%m', data) as mes, tipo, SUM(valor) as total")
            ->groupBy('mes', 'tipo')
            ->orderBy('mes')
            ->get();

        $result = [];
        foreach ($data as $row) {
            $result[$row->mes] ??= ['mes' => $row->mes, 'receitas' => 0, 'despesas' => 0];
            $result[$row->mes][$row->tipo === 'receita' ? 'receitas' : 'despesas'] = (float) $row->total;
        }

        return response()->json(array_values($result));
    }

    private function format(Lancamento $l): array
    {
        return [
            'id'         => $l->id,
            'tipo'       => $l->tipo,
            'categoria'  => $l->categoria,
            'valor'      => $l->valor,
            'descricao'  => $l->descricao,
            'data'       => $l->data,
            'comprovante' => $l->comprovante ? asset('storage/' . $l->comprovante) : null,
            'criado_por' => $l->criadoPor ? ['nome' => $l->criadoPor->name, 'sobrenome' => $l->criadoPor->sobrenome] : null,
            'created_at' => $l->created_at,
        ];
    }
}
