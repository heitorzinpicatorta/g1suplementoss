-- ============================================================
-- Execute este SQL no Supabase:
-- Dashboard → SQL Editor → New query → cole e rode
-- ============================================================

create table if not exists public.orders (
  id            text        primary key,
  created_at    timestamptz not null default now(),
  email         text        not null,
  nome          text,
  cpf           text,
  address       jsonb,
  items         jsonb       not null default '[]',
  total         numeric     not null,
  status        text        not null default 'pending',
  preference_id text,
  payment_id    text
);

-- Índices para as buscas mais comuns
create index if not exists orders_preference_id_idx on public.orders (preference_id);
create index if not exists orders_created_at_idx   on public.orders (created_at desc);
create index if not exists orders_email_idx        on public.orders (email);

-- ============================================================
-- SEGURANÇA: apenas o service_role (backend) pode ler/escrever
-- O frontend nunca acessa o Supabase diretamente
-- ============================================================

-- Desativa acesso público (RLS habilitado, sem policies abertas)
alter table public.orders enable row level security;

-- Nenhuma policy de SELECT/INSERT/UPDATE para "anon" ou "authenticated"
-- → só o service_role key (usado nas API routes) passa
