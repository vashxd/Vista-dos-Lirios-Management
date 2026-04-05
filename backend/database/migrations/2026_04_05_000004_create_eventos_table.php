<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eventos', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->string('tipo')->default('social');
            $table->timestamp('data_inicio');
            $table->timestamp('data_fim')->nullable();
            $table->string('local')->nullable();
            $table->text('pauta')->nullable();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('confirmacoes_evento', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evento_id')->constrained('eventos')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['evento_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('confirmacoes_evento');
        Schema::dropIfExists('eventos');
    }
};
