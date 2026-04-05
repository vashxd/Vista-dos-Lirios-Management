<?php

namespace App\Http\Controllers;

use App\Models\Veiculo;
use Illuminate\Http\Request;

class VeiculoController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(Veiculo::where('user_id', $request->user()->id)->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'placa'  => 'required|string|unique:veiculos,placa',
            'modelo' => 'required|string',
            'cor'    => 'required|string',
            'vaga'   => 'nullable|string',
        ]);

        $v = Veiculo::create([...$data, 'user_id' => $request->user()->id]);
        return response()->json($v, 201);
    }

    public function destroy(Request $request, Veiculo $veiculo)
    {
        if ($veiculo->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }
        $veiculo->delete();
        return response()->json(['message' => 'Veículo removido.']);
    }
}
