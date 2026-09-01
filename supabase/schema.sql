create table if not exists public.disciplinas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null,
  percentual_presenca integer not null default 75
    check (percentual_presenca between 50 and 100),
  created_at timestamptz not null default now()
);

alter table public.disciplinas drop column if exists total_aulas;

create table if not exists public.semestres (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  inicio date not null,
  fim date not null,
  created_at timestamptz not null default now(),
  check (fim >= inicio)
);

create unique index if not exists semestres_user_id_uidx on public.semestres (user_id);

create table if not exists public.horarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  disciplina_id uuid not null references public.disciplinas (id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fim time not null,
  created_at timestamptz not null default now(),
  check (hora_fim > hora_inicio)
);

create table if not exists public.dias_sem_aula (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  data date not null,
  motivo text,
  created_at timestamptz not null default now(),
  unique (user_id, data)
);

create table if not exists public.faltas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  disciplina_id uuid not null references public.disciplinas (id) on delete cascade,
  data date not null,
  quantidade integer not null default 1 check (quantidade > 0),
  observacao text,
  created_at timestamptz not null default now()
);

create index if not exists disciplinas_user_id_idx on public.disciplinas (user_id);
create index if not exists horarios_disciplina_id_idx on public.horarios (disciplina_id);
create index if not exists horarios_user_id_idx on public.horarios (user_id);
create index if not exists faltas_user_id_idx on public.faltas (user_id);
create index if not exists faltas_disciplina_id_idx on public.faltas (disciplina_id);
create index if not exists dias_sem_aula_user_id_idx on public.dias_sem_aula (user_id);

alter table public.disciplinas enable row level security;
alter table public.semestres enable row level security;
alter table public.horarios enable row level security;
alter table public.dias_sem_aula enable row level security;
alter table public.faltas enable row level security;

create or replace function public.set_auth_user_id()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.user_id := auth.uid();
  return new;
end;
$$;

drop trigger if exists set_disciplinas_user_id on public.disciplinas;
create trigger set_disciplinas_user_id
  before insert on public.disciplinas
  for each row execute procedure public.set_auth_user_id();

drop trigger if exists set_semestres_user_id on public.semestres;
create trigger set_semestres_user_id
  before insert on public.semestres
  for each row execute procedure public.set_auth_user_id();

drop trigger if exists set_horarios_user_id on public.horarios;
create trigger set_horarios_user_id
  before insert on public.horarios
  for each row execute procedure public.set_auth_user_id();

drop trigger if exists set_dias_sem_aula_user_id on public.dias_sem_aula;
create trigger set_dias_sem_aula_user_id
  before insert on public.dias_sem_aula
  for each row execute procedure public.set_auth_user_id();

drop trigger if exists set_faltas_user_id on public.faltas;
create trigger set_faltas_user_id
  before insert on public.faltas
  for each row execute procedure public.set_auth_user_id();

drop policy if exists "disciplinas_select_own" on public.disciplinas;
drop policy if exists "disciplinas_insert_own" on public.disciplinas;
drop policy if exists "disciplinas_update_own" on public.disciplinas;
drop policy if exists "disciplinas_delete_own" on public.disciplinas;

create policy "disciplinas_select_own"
  on public.disciplinas for select to authenticated
  using (auth.uid() = user_id);
create policy "disciplinas_insert_own"
  on public.disciplinas for insert to authenticated
  with check (auth.uid() = user_id);
create policy "disciplinas_update_own"
  on public.disciplinas for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "disciplinas_delete_own"
  on public.disciplinas for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "semestres_select_own" on public.semestres;
drop policy if exists "semestres_insert_own" on public.semestres;
drop policy if exists "semestres_update_own" on public.semestres;
drop policy if exists "semestres_delete_own" on public.semestres;

create policy "semestres_select_own"
  on public.semestres for select to authenticated
  using (auth.uid() = user_id);
create policy "semestres_insert_own"
  on public.semestres for insert to authenticated
  with check (auth.uid() = user_id);
create policy "semestres_update_own"
  on public.semestres for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "semestres_delete_own"
  on public.semestres for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "horarios_select_own" on public.horarios;
drop policy if exists "horarios_insert_own" on public.horarios;
drop policy if exists "horarios_update_own" on public.horarios;
drop policy if exists "horarios_delete_own" on public.horarios;

create policy "horarios_select_own"
  on public.horarios for select to authenticated
  using (auth.uid() = user_id);
create policy "horarios_insert_own"
  on public.horarios for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.disciplinas d
      where d.id = disciplina_id and d.user_id = auth.uid()
    )
  );
create policy "horarios_update_own"
  on public.horarios for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "horarios_delete_own"
  on public.horarios for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "dias_sem_aula_select_own" on public.dias_sem_aula;
drop policy if exists "dias_sem_aula_insert_own" on public.dias_sem_aula;
drop policy if exists "dias_sem_aula_update_own" on public.dias_sem_aula;
drop policy if exists "dias_sem_aula_delete_own" on public.dias_sem_aula;

create policy "dias_sem_aula_select_own"
  on public.dias_sem_aula for select to authenticated
  using (auth.uid() = user_id);
create policy "dias_sem_aula_insert_own"
  on public.dias_sem_aula for insert to authenticated
  with check (auth.uid() = user_id);
create policy "dias_sem_aula_update_own"
  on public.dias_sem_aula for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dias_sem_aula_delete_own"
  on public.dias_sem_aula for delete to authenticated
  using (auth.uid() = user_id);

drop policy if exists "faltas_select_own" on public.faltas;
drop policy if exists "faltas_insert_own" on public.faltas;
drop policy if exists "faltas_update_own" on public.faltas;
drop policy if exists "faltas_delete_own" on public.faltas;

create policy "faltas_select_own"
  on public.faltas for select to authenticated
  using (auth.uid() = user_id);
create policy "faltas_insert_own"
  on public.faltas for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.disciplinas d
      where d.id = disciplina_id and d.user_id = auth.uid()
    )
  );
create policy "faltas_update_own"
  on public.faltas for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "faltas_delete_own"
  on public.faltas for delete to authenticated
  using (auth.uid() = user_id);
