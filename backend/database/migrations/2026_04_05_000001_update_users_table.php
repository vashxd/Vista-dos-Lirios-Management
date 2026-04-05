<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('sobrenome')->after('name');
            $table->string('telefone')->nullable()->after('sobrenome');
            $table->string('cpf')->unique()->nullable()->after('telefone');
            $table->string('foto')->nullable()->after('cpf');
            $table->string('bloco')->nullable()->after('foto');
            $table->string('apartamento')->nullable()->after('bloco');
            $table->enum('tipo', ['admin', 'sindico', 'condomino'])->default('condomino')->after('apartamento');
            $table->enum('status', ['ativo', 'inativo', 'pendente'])->default('ativo')->after('tipo');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['sobrenome', 'telefone', 'cpf', 'foto', 'bloco', 'apartamento', 'tipo', 'status']);
        });
    }
};
