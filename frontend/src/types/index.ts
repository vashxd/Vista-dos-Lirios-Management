export interface Aviso {
  id: number
  titulo: string
  corpo: string
  categoria: 'geral' | 'manutencao' | 'seguranca' | 'eventos' | 'obras' | 'regulamento'
  fixado: boolean
  expira_em?: string
  autor: { id: number; nome: string; sobrenome: string; foto?: string; tipo: string }
  comentarios_count: number
  created_at: string
}

export interface Comentario {
  id: number
  corpo: string
  autor: { id: number; nome: string; sobrenome: string; foto?: string }
  created_at: string
}

export interface Chamado {
  id: number
  protocolo: string
  titulo: string
  descricao: string
  categoria: string
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  status: 'aberto' | 'em_andamento' | 'aguardando' | 'resolvido' | 'fechado'
  avaliacao?: number
  autor: { id: number; nome: string; sobrenome: string; bloco: string; apartamento: string }
  created_at: string
  updated_at: string
}

export interface Resposta {
  id: number
  corpo: string
  autor: { id: number; nome: string; sobrenome: string; tipo: string }
  created_at: string
}

export interface Evento {
  id: number
  titulo: string
  descricao?: string
  tipo: string
  data_inicio: string
  data_fim?: string
  local?: string
  pauta?: string
  confirmacoes_count?: number
  minha_confirmacao?: boolean
  created_at: string
}

export interface AreaLazer {
  id: number
  nome: string
  descricao?: string
  foto?: string
  capacidade: number
  taxa: number
  horario_inicio: string
  horario_fim: string
  antecedencia_min: number
  antecedencia_max: number
  cancelamento_horas: number
  reservas_mes: number
  ativa: boolean
}

export interface Reserva {
  id: number
  area: AreaLazer
  data: string
  hora_inicio: string
  hora_fim: string
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'cancelada'
  motivo_rejeicao?: string
  solicitante: { id: number; nome: string; sobrenome: string; bloco: string; apartamento: string }
  created_at: string
}

export interface Lancamento {
  id: number
  tipo: 'receita' | 'despesa'
  categoria: string
  valor: number
  descricao: string
  data: string
  comprovante?: string
  criado_por: { nome: string; sobrenome: string }
  created_at: string
}

export interface Documento {
  id: number
  titulo: string
  categoria: string
  descricao?: string
  arquivo: string
  versao: number
  tamanho?: number
  criado_por: { nome: string; sobrenome: string }
  created_at: string
}

export interface Enquete {
  id: number
  titulo: string
  descricao?: string
  tipo: 'multipla' | 'simnao'
  anonima: boolean
  prazo: string
  quorum: number
  encerrada: boolean
  opcoes: { id: number; texto: string; votos: number }[]
  meu_voto?: number
  total_votos: number
  criado_por: { nome: string; sobrenome: string }
  created_at: string
}

export interface Encomenda {
  id: number
  descricao: string
  foto?: string
  remetente?: string
  status: 'aguardando' | 'retirada'
  destinatario: { id: number; nome: string; sobrenome: string; bloco: string; apartamento: string }
  retirada_em?: string
  created_at: string
}

export interface Veiculo {
  id: number
  placa: string
  modelo: string
  cor: string
  foto?: string
  vaga?: string
  owner: { nome: string; sobrenome: string; bloco: string; apartamento: string }
}

export interface Pet {
  id: number
  nome: string
  raca: string
  porte: 'pequeno' | 'medio' | 'grande'
  foto?: string
  vacinas?: { nome: string; data: string; vencimento: string }[]
  owner: { nome: string; sobrenome: string; bloco: string; apartamento: string }
}

export interface Contato {
  id: number
  nome: string
  categoria: string
  telefone: string
  descricao?: string
  emergencia: boolean
}

export interface Notificacao {
  id: number
  titulo: string
  corpo: string
  tipo: string
  lida: boolean
  link?: string
  created_at: string
}

export interface DashboardStats {
  chamados_abertos: number
  reservas_pendentes: number
  enquetes_ativas: number
  encomendas_aguardando: number
  avisos_recentes: Aviso[]
  proximos_eventos: Evento[]
  financeiro_resumo?: { receitas: number; despesas: number; saldo: number }
}
