-- ══════════════════════════════════════════════════════════════
-- Doces 3 Irmãos · Schema Supabase
-- Colar e executar no: Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── CONFIG (1 linha por usuário) ────────────────────────────────
create table if not exists config (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  leite numeric default 84,
  acucar numeric default 21,
  gas numeric default 25,
  embalagem numeric default 60,
  conservante numeric default 5,
  potes_fornada int default 110,
  p_varejo numeric default 6.50,
  p_desc numeric default 6.30,
  p_atac numeric default 6.00,
  p_ev numeric default 6.50,
  consultor text default 'Júlio Rafael',
  pct_consultor numeric default 10
);

-- ── RECEITAS ────────────────────────────────────────────────────
create table if not exists receitas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  data date not null,
  cliente text not null,
  tipo text not null,
  qtd int not null,
  preco numeric not null,
  total numeric not null,
  pag text not null,
  obs text,
  created_at timestamptz default now()
);

-- ── DESPESAS ────────────────────────────────────────────────────
create table if not exists despesas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  data date not null,
  cat text not null,
  descricao text not null,
  val numeric not null,
  forn text,
  created_at timestamptz default now()
);

-- ── FORNADAS ────────────────────────────────────────────────────
create table if not exists fornadas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  data date not null,
  num text not null,
  qtd int not null,
  custo numeric not null,
  resp text not null,
  sabores text,
  obs text,
  created_at timestamptz default now()
);

-- ── ESTOQUE ─────────────────────────────────────────────────────
create table if not exists estoque (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  item text not null,
  qty numeric default 0,
  min_qty numeric default 0,
  updated_at timestamptz default now(),
  unique(user_id, item)
);

-- ── CLIENTES ────────────────────────────────────────────────────
create table if not exists clientes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  nome text not null,
  tipo text not null,
  cidade text not null,
  tel text not null,
  endereco text,
  qtd int default 0,
  preco numeric default 6.50,
  dia text not null,
  ref text,
  obs text,
  nota text default 'nao',
  cnpj text,
  created_at timestamptz default now()
);

-- ── CONTAS ──────────────────────────────────────────────────────
create table if not exists contas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  cli text not null,
  val numeric not null,
  data date not null,
  venc date not null,
  descricao text,
  pago boolean default false,
  created_at timestamptz default now()
);

-- ── EVENTOS ─────────────────────────────────────────────────────
create table if not exists eventos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  nome text not null,
  data date not null,
  local text,
  plan int default 0,
  vend int default 0,
  fat numeric default 0,
  obs text,
  created_at timestamptz default now()
);

-- ── METAS ───────────────────────────────────────────────────────
create table if not exists metas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  mes text not null,
  rec numeric not null,
  potes int default 0,
  forn int default 0,
  cli int default 0,
  created_at timestamptz default now(),
  unique(user_id, mes)
);

-- ── PESSOAL ─────────────────────────────────────────────────────
create table if not exists pessoal (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  data date not null,
  cat text not null,
  descricao text not null,
  val numeric not null,
  created_at timestamptz default now()
);

-- ══ RLS — Segurança por Linha ════════════════════════════════════
alter table config enable row level security;
alter table receitas enable row level security;
alter table despesas enable row level security;
alter table fornadas enable row level security;
alter table estoque enable row level security;
alter table clientes enable row level security;
alter table contas enable row level security;
alter table eventos enable row level security;
alter table metas enable row level security;
alter table pessoal enable row level security;

-- Políticas: cada usuário vê apenas seus próprios dados
create policy "own_config"   on config   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_receitas" on receitas for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_despesas" on despesas for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_fornadas" on fornadas for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_estoque"  on estoque  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_clientes" on clientes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_contas"   on contas   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_eventos"  on eventos  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_metas"    on metas    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_pessoal"  on pessoal  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
