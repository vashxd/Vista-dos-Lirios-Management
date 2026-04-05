<?php

namespace App\Http\Controllers;

use App\Models\Contato;
use Illuminate\Http\Request;

class ContatoController extends Controller
{
    public function index()
    {
        return response()->json(Contato::orderByDesc('emergencia')->orderBy('nome')->get());
    }
}
