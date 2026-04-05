<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use Illuminate\Http\Request;

class PetController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(Pet::where('user_id', $request->user()->id)->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nome'  => 'required|string',
            'raca'  => 'required|string',
            'porte' => 'required|in:pequeno,medio,grande',
        ]);

        $p = Pet::create([...$data, 'user_id' => $request->user()->id]);
        return response()->json($p, 201);
    }

    public function destroy(Request $request, Pet $pet)
    {
        if ($pet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }
        $pet->delete();
        return response()->json(['message' => 'Pet removido.']);
    }
}
