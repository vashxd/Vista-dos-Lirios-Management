<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('encomendas', function (Blueprint $table) {
            $table->id();
            $table->text('descricao');
            $table->string('foto')->nullable();
            $table->string('remetente')->nullable();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['aguardando', 'retirada'])->default('aguardando');
            $table->timestamp('retirada_em')->nullable();
            $table->foreignId('registrado_por')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('veiculos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('placa')->unique();
            $table->string('modelo');
            $table->string('cor');
            $table->string('foto')->nullable();
            $table->string('vaga')->nullable();
            $table->timestamps();
        });

        Schema::create('pets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('nome');
            $table->string('raca');
            $table->enum('porte', ['pequeno', 'medio', 'grande'])->default('medio');
            $table->string('foto')->nullable();
            $table->json('vacinas')->nullable();
            $table->timestamps();
        });

        Schema::create('contatos', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('categoria');
            $table->string('telefone');
            $table->text('descricao')->nullable();
            $table->boolean('emergencia')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contatos');
        Schema::dropIfExists('pets');
        Schema::dropIfExists('veiculos');
        Schema::dropIfExists('encomendas');
    }
};
