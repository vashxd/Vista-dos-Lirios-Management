<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('areas_lazer', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->string('foto')->nullable();
            $table->integer('capacidade')->default(50);
            $table->decimal('taxa', 10, 2)->default(0);
            $table->string('horario_inicio')->default('08:00');
            $table->string('horario_fim')->default('22:00');
            $table->integer('antecedencia_min')->default(24);
            $table->integer('antecedencia_max')->default(30);
            $table->integer('cancelamento_horas')->default(48);
            $table->integer('reservas_mes')->default(2);
            $table->boolean('ativa')->default(true);
            $table->timestamps();
        });

        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('area_id')->constrained('areas_lazer')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('data');
            $table->string('hora_inicio');
            $table->string('hora_fim');
            $table->enum('status', ['pendente', 'aprovada', 'rejeitada', 'cancelada'])->default('pendente');
            $table->text('motivo_rejeicao')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservas');
        Schema::dropIfExists('areas_lazer');
    }
};
