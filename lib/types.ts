export type Receita = {
  id: string;
  user_id: string;
  data: string;
  cliente: string;
  tipo: "varejo" | "varejo_desc" | "atacado" | "evento";
  qtd: number;
  preco: number;
  total: number;
  pag: "pix" | "dinheiro" | "cartao" | "prazo";
  obs?: string;
  created_at: string;
};

export type Despesa = {
  id: string;
  user_id: string;
  data: string;
  cat: string;
  descricao: string;
  val: number;
  forn?: string;
  created_at: string;
};

export type Fornada = {
  id: string;
  user_id: string;
  data: string;
  num: string;
  qtd: number;
  custo: number;
  resp: string;
  sabores?: string;
  obs?: string;
  created_at: string;
};

export type EstoqueItem = {
  id: string;
  user_id: string;
  item: string;
  qty: number;
  min_qty: number;
  updated_at: string;
};

export type Cliente = {
  id: string;
  user_id: string;
  nome: string;
  tipo: string;
  cidade: string;
  tel: string;
  endereco?: string;
  qtd: number;
  preco: number;
  dia: "quarta" | "sexta" | "sabado" | "variavel" | "retirada";
  ref?: string;
  obs?: string;
  nota: "nao" | "sim";
  cnpj?: string;
  created_at: string;
};

export type Conta = {
  id: string;
  user_id: string;
  cli: string;
  val: number;
  data: string;
  venc: string;
  descricao?: string;
  pago: boolean;
  created_at: string;
};

export type Evento = {
  id: string;
  user_id: string;
  nome: string;
  data: string;
  local?: string;
  plan: number;
  vend: number;
  fat: number;
  obs?: string;
  created_at: string;
};

export type Meta = {
  id: string;
  user_id: string;
  mes: string;
  rec: number;
  potes: number;
  forn: number;
  cli: number;
  created_at: string;
};

export type Pessoal = {
  id: string;
  user_id: string;
  data: string;
  cat: string;
  descricao: string;
  val: number;
  created_at: string;
};

export type Config = {
  id: string;
  user_id: string;
  leite: number;
  acucar: number;
  gas: number;
  embalagem: number;
  conservante: number;
  potes_fornada: number;
  p_varejo: number;
  p_desc: number;
  p_atac: number;
  p_ev: number;
  consultor?: string;
  pct_consultor?: number;
};
