<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AvisoController;
use App\Http\Controllers\ChamadoController;
use App\Http\Controllers\ContatoController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentoController;
use App\Http\Controllers\EncomendaController;
use App\Http\Controllers\EnqueteController;
use App\Http\Controllers\EventoController;
use App\Http\Controllers\LancamentoController;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\PetController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\VeiculoController;
use Illuminate\Support\Facades\Route;

// Auth público
Route::post('/auth/login', [AuthController::class, 'login']);

// Rotas protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/sindico/dashboard', [DashboardController::class, 'sindicoDashboard']);

    // Avisos
    Route::get('/avisos', [AvisoController::class, 'index']);
    Route::post('/avisos', [AvisoController::class, 'store']);
    Route::delete('/avisos/{aviso}', [AvisoController::class, 'destroy']);
    Route::get('/avisos/{aviso}/comentarios', [AvisoController::class, 'comentarios']);
    Route::post('/avisos/{aviso}/comentarios', [AvisoController::class, 'addComentario']);

    // Chamados
    Route::get('/chamados', [ChamadoController::class, 'index']);
    Route::post('/chamados', [ChamadoController::class, 'store']);
    Route::patch('/chamados/{chamado}/status', [ChamadoController::class, 'updateStatus']);
    Route::get('/chamados/{chamado}/respostas', [ChamadoController::class, 'respostas']);
    Route::post('/chamados/{chamado}/respostas', [ChamadoController::class, 'addResposta']);

    // Eventos / Agenda
    Route::get('/eventos', [EventoController::class, 'index']);
    Route::post('/eventos', [EventoController::class, 'store']);
    Route::post('/eventos/{evento}/confirmar', [EventoController::class, 'confirmar']);

    // Áreas de lazer e reservas
    Route::get('/areas-lazer', [ReservaController::class, 'areas']);
    Route::get('/reservas', [ReservaController::class, 'index']);
    Route::post('/reservas', [ReservaController::class, 'store']);
    Route::patch('/reservas/{reserva}/cancelar', [ReservaController::class, 'cancelar']);
    Route::get('/sindico/reservas', [ReservaController::class, 'indexAll']);
    Route::patch('/reservas/{reserva}/aprovar', [ReservaController::class, 'aprovar']);
    Route::patch('/reservas/{reserva}/rejeitar', [ReservaController::class, 'rejeitar']);

    // Financeiro
    Route::get('/lancamentos', [LancamentoController::class, 'index']);
    Route::post('/lancamentos', [LancamentoController::class, 'store']);
    Route::get('/lancamentos/resumo', [LancamentoController::class, 'resumo']);

    // Documentos
    Route::get('/documentos', [DocumentoController::class, 'index']);
    Route::post('/documentos', [DocumentoController::class, 'store']);
    Route::get('/documentos/{documento}/download', [DocumentoController::class, 'download']);

    // Enquetes
    Route::get('/enquetes', [EnqueteController::class, 'index']);
    Route::post('/enquetes', [EnqueteController::class, 'store']);
    Route::post('/enquetes/{enquete}/votar', [EnqueteController::class, 'votar']);

    // Encomendas
    Route::get('/encomendas/minhas', [EncomendaController::class, 'minhas']);
    Route::get('/sindico/encomendas', [EncomendaController::class, 'index']);
    Route::post('/encomendas', [EncomendaController::class, 'store']);
    Route::patch('/encomendas/{encomenda}/retirar', [EncomendaController::class, 'retirar']);

    // Contatos
    Route::get('/contatos', [ContatoController::class, 'index']);

    // Veículos e Pets
    Route::get('/veiculos', [VeiculoController::class, 'index']);
    Route::post('/veiculos', [VeiculoController::class, 'store']);
    Route::delete('/veiculos/{veiculo}', [VeiculoController::class, 'destroy']);
    Route::get('/pets', [PetController::class, 'index']);
    Route::post('/pets', [PetController::class, 'store']);
    Route::delete('/pets/{pet}', [PetController::class, 'destroy']);

    // Perfil
    Route::put('/perfil', [PerfilController::class, 'update']);

    // Usuários (dropdown)
    Route::get('/usuarios', [AdminController::class, 'listarUsuarios']);

    // Admin
    Route::get('/admin/usuarios', [AdminController::class, 'usuarios']);
    Route::post('/admin/usuarios', [AdminController::class, 'createUsuario']);
    Route::put('/admin/usuarios/{usuario}', [AdminController::class, 'updateUsuario']);
    Route::patch('/admin/usuarios/{usuario}/status', [AdminController::class, 'updateStatus']);
});
