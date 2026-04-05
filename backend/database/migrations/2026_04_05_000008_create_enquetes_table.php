<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enquetes', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->enum('tipo', ['multipla', 'simnao'])->default('multipla');
            $table->boolean('anonima')->default(false);
            $table->date('prazo');
            $table->integer('quorum')->default(0);
            $table->boolean('encerrada')->default(false);
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('opcoes_enquete', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enquete_id')->constrained('enquetes')->cascadeOnDelete();
            $table->string('texto');
            $table->timestamps();
        });

        Schema::create('votos_enquete', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enquete_id')->constrained('enquetes')->cascadeOnDelete();
            $table->foreignId('opcao_id')->constrained('opcoes_enquete')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['enquete_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('votos_enquete');
        Schema::dropIfExists('opcoes_enquete');
        Schema::dropIfExists('enquetes');
    }
};
