<?php

namespace App\Http\Controllers;

use App\Models\Documento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentoController extends Controller
{
    public function index(Request $request)
    {
        $query = Documento::with(['criadoPor:id,name,sobrenome'])->orderByDesc('created_at');

        if ($request->search) {
            $query->where('titulo', 'like', "%{$request->search}%");
        }
        if ($request->categoria) {
            $query->where('categoria', $request->categoria);
        }

        return response()->json($query->get()->map(fn($d) => $this->format($d)));
    }

    public function store(Request $request)
    {
        $this->authorize('sindico');
        $data = $request->validate([
            'titulo'    => 'required|string',
            'categoria' => 'required|string',
            'descricao' => 'nullable|string',
            'arquivo'   => 'required|file|max:51200',
        ]);

        $path = $request->file('arquivo')->store('documentos', 'public');
        $size = $request->file('arquivo')->getSize();

        $versao = Documento::where('titulo', $data['titulo'])->where('categoria', $data['categoria'])->max('versao') ?? 0;

        $doc = Documento::create([
            'titulo'    => $data['titulo'],
            'categoria' => $data['categoria'],
            'descricao' => $data['descricao'] ?? null,
            'arquivo'   => $path,
            'versao'    => $versao + 1,
            'tamanho'   => $size,
            'user_id'   => $request->user()->id,
        ]);

        return response()->json($this->format($doc->load('criadoPor')), 201);
    }

    public function download(Documento $documento)
    {
        return Storage::disk('public')->download($documento->arquivo, $documento->titulo . '.' . pathinfo($documento->arquivo, PATHINFO_EXTENSION));
    }

    private function format(Documento $d): array
    {
        return [
            'id'         => $d->id,
            'titulo'     => $d->titulo,
            'categoria'  => $d->categoria,
            'descricao'  => $d->descricao,
            'arquivo'    => asset('storage/' . $d->arquivo),
            'versao'     => $d->versao,
            'tamanho'    => $d->tamanho,
            'criado_por' => $d->criadoPor ? ['nome' => $d->criadoPor->name, 'sobrenome' => $d->criadoPor->sobrenome] : null,
            'created_at' => $d->created_at,
        ];
    }
}
