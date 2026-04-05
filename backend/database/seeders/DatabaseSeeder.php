<?php

namespace Database\Seeders;

use App\Models\AreaLazer;
use App\Models\Aviso;
use App\Models\Chamado;
use App\Models\Contato;
use App\Models\Evento;
use App\Models\Lancamento;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Só roda se banco estiver vazio
        if (User::count() > 0) return;

        // Admin
        $admin = User::create([
            'name'        => 'Carlos',
            'sobrenome'   => 'Administrador',
            'email'       => 'admin@vistadoslirios.com',
            'password'    => Hash::make('admin123'),
            'cpf'         => '000.000.000-00',
            'telefone'    => '(11) 99999-0000',
            'bloco'       => 'A',
            'apartamento' => '001',
            'tipo'        => 'admin',
            'status'      => 'ativo',
        ]);

        // Síndico
        $sindico = User::create([
            'name'        => 'Maria',
            'sobrenome'   => 'Síndica',
            'email'       => 'sindico@vistadoslirios.com',
            'password'    => Hash::make('sindico123'),
            'cpf'         => '111.111.111-11',
            'telefone'    => '(11) 98888-1111',
            'bloco'       => 'A',
            'apartamento' => '101',
            'tipo'        => 'sindico',
            'status'      => 'ativo',
        ]);

        // Condôminos
        $cond1 = User::create([
            'name'        => 'João',
            'sobrenome'   => 'Silva',
            'email'       => 'joao@vistadoslirios.com',
            'password'    => Hash::make('joao123'),
            'cpf'         => '222.222.222-22',
            'telefone'    => '(11) 97777-2222',
            'bloco'       => 'B',
            'apartamento' => '201',
            'tipo'        => 'condomino',
            'status'      => 'ativo',
        ]);

        $cond2 = User::create([
            'name'        => 'Ana',
            'sobrenome'   => 'Costa',
            'email'       => 'ana@vistadoslirios.com',
            'password'    => Hash::make('ana123'),
            'cpf'         => '333.333.333-33',
            'telefone'    => '(11) 96666-3333',
            'bloco'       => 'C',
            'apartamento' => '301',
            'tipo'        => 'condomino',
            'status'      => 'ativo',
        ]);

        // Avisos
        Aviso::create(['titulo' => 'Bem-vindos ao Vista dos Lírios Management!', 'corpo' => 'Prezados condôminos, nossa nova plataforma de gestão condominial está no ar. Aqui você pode acompanhar avisos, abrir chamados, reservar áreas de lazer e muito mais!', 'categoria' => 'geral', 'fixado' => true, 'user_id' => $sindico->id]);
        Aviso::create(['titulo' => 'Manutenção do Elevador — Bloco A', 'corpo' => 'Informamos que o elevador do Bloco A passará por manutenção preventiva no próximo sábado, das 8h às 12h. Pedimos a compreensão de todos.', 'categoria' => 'manutencao', 'fixado' => false, 'user_id' => $sindico->id]);
        Aviso::create(['titulo' => 'Assembleia Geral Ordinária 2026', 'corpo' => 'Convocamos todos os condôminos para a AGO 2026 que acontecerá no dia 20/04/2026 às 19h no salão de festas. Pauta: aprovação das contas anuais e eleição do novo conselho.', 'categoria' => 'eventos', 'fixado' => false, 'user_id' => $sindico->id]);

        // Chamados
        Chamado::create(['protocolo' => 'CHM-2026-0001', 'titulo' => 'Lâmpada queimada no corredor do 2° andar', 'descricao' => 'A lâmpada do corredor do 2° andar do Bloco B está queimada há 3 dias. Fica muito escuro à noite.', 'categoria' => 'manutencao', 'prioridade' => 'media', 'status' => 'aberto', 'user_id' => $cond1->id]);
        Chamado::create(['protocolo' => 'CHM-2026-0002', 'titulo' => 'Barulho excessivo no apartamento 302', 'descricao' => 'Todos os fins de semana há muito barulho vindo do apartamento 302 após as 22h.', 'categoria' => 'barulho', 'prioridade' => 'alta', 'status' => 'em_andamento', 'user_id' => $cond2->id]);

        // Eventos
        Evento::create(['titulo' => 'Assembleia Geral Ordinária 2026', 'descricao' => 'Pauta: aprovação das contas e eleição do conselho.', 'tipo' => 'ago', 'data_inicio' => now()->addDays(15)->setTime(19, 0), 'local' => 'Salão de Festas', 'user_id' => $sindico->id]);
        Evento::create(['titulo' => 'Dedetização Geral', 'descricao' => 'Dedetização preventiva em todas as áreas comuns.', 'tipo' => 'dedetizacao', 'data_inicio' => now()->addDays(7)->setTime(8, 0), 'data_fim' => now()->addDays(7)->setTime(17, 0), 'local' => 'Todo o Condomínio', 'user_id' => $sindico->id]);

        // Áreas de lazer
        AreaLazer::create(['nome' => 'Salão de Festas', 'descricao' => 'Espaço para festas e confraternizações', 'capacidade' => 80, 'taxa' => 200.00, 'horario_inicio' => '08:00', 'horario_fim' => '23:00']);
        AreaLazer::create(['nome' => 'Churrasqueira', 'descricao' => 'Espaço Gourmet com churrasqueira', 'capacidade' => 30, 'taxa' => 100.00, 'horario_inicio' => '10:00', 'horario_fim' => '22:00']);
        AreaLazer::create(['nome' => 'Piscina', 'descricao' => 'Piscina adulto e infantil', 'capacidade' => 50, 'taxa' => 0, 'horario_inicio' => '08:00', 'horario_fim' => '20:00']);
        AreaLazer::create(['nome' => 'Quadra Poliesportiva', 'descricao' => 'Quadra para esportes variados', 'capacidade' => 20, 'taxa' => 0, 'horario_inicio' => '07:00', 'horario_fim' => '22:00']);
        AreaLazer::create(['nome' => 'Academia', 'descricao' => 'Academia equipada', 'capacidade' => 15, 'taxa' => 0, 'horario_inicio' => '06:00', 'horario_fim' => '22:00']);

        // Lançamentos financeiros
        Lancamento::create(['tipo' => 'receita', 'categoria' => 'taxa_ordinaria', 'valor' => 15000.00, 'descricao' => 'Arrecadação taxa condominial - Março/2026', 'data' => now()->subDays(5)->format('Y-m-d'), 'user_id' => $sindico->id]);
        Lancamento::create(['tipo' => 'despesa', 'categoria' => 'funcionarios', 'valor' => 8500.00, 'descricao' => 'Folha de pagamento - Março/2026', 'data' => now()->subDays(3)->format('Y-m-d'), 'user_id' => $sindico->id]);
        Lancamento::create(['tipo' => 'despesa', 'categoria' => 'consumo', 'valor' => 2100.00, 'descricao' => 'Conta de energia - Março/2026', 'data' => now()->subDays(2)->format('Y-m-d'), 'user_id' => $sindico->id]);
        Lancamento::create(['tipo' => 'despesa', 'categoria' => 'servicos', 'valor' => 1200.00, 'descricao' => 'Serviço de limpeza - Março/2026', 'data' => now()->subDays(1)->format('Y-m-d'), 'user_id' => $sindico->id]);

        // Contatos
        Contato::create(['nome' => 'SAMU', 'categoria' => 'emergencia', 'telefone' => '192', 'emergencia' => true]);
        Contato::create(['nome' => 'Bombeiros', 'categoria' => 'emergencia', 'telefone' => '193', 'emergencia' => true]);
        Contato::create(['nome' => 'Polícia Militar', 'categoria' => 'emergencia', 'telefone' => '190', 'emergencia' => true]);
        Contato::create(['nome' => 'Maria Síndica', 'categoria' => 'sindico', 'telefone' => '(11) 98888-1111', 'descricao' => 'Síndica do condomínio', 'emergencia' => false]);
        Contato::create(['nome' => 'Portaria', 'categoria' => 'portaria', 'telefone' => '(11) 3333-4444', 'descricao' => 'Plantão 24h', 'emergencia' => false]);
        Contato::create(['nome' => 'SABESP', 'categoria' => 'concessionaria', 'telefone' => '0800 055 0195', 'descricao' => 'Abastecimento de água', 'emergencia' => false]);
        Contato::create(['nome' => 'Eletropaulo', 'categoria' => 'concessionaria', 'telefone' => '0800 722 7120', 'descricao' => 'Energia elétrica', 'emergencia' => false]);
        Contato::create(['nome' => 'Encanador Roberto', 'categoria' => 'prestador', 'telefone' => '(11) 99111-2222', 'descricao' => 'Hidráulica', 'emergencia' => false]);
    }
}
