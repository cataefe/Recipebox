-- RecipeBox · esquema de Supabase
-- Ejecútalo una vez en Supabase › SQL Editor.

create table if not exists public.recipes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade default auth.uid(),
  title           text not null check (char_length(title) > 0),
  category        text not null default 'Fondos'
                  check (category in ('Fondos', 'Entradas', 'Postres', 'Ensaladas')),
  minutes         integer not null default 0 check (minutes >= 0),
  source          text default '',
  source_detail   text default '',
  notes           text default '',
  image_url       text default '',
  hero_image_url  text default '',
  -- [{ "name": "Leche", "qty": "1 taza", "mod": "" }]
  ingredients     jsonb not null default '[]'::jsonb,
  -- [{ "text": "...", "minutes": 10, "uses": [0, 2], "mod": "" }]
  steps           jsonb not null default '[]'::jsonb,
  last_cooked_at  timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists recipes_user_created_idx on public.recipes (user_id, created_at desc);

-- Cada persona ve y edita solo sus recetas.
alter table public.recipes enable row level security;

drop policy if exists "recipes_select_own" on public.recipes;
drop policy if exists "recipes_insert_own" on public.recipes;
drop policy if exists "recipes_update_own" on public.recipes;
drop policy if exists "recipes_delete_own" on public.recipes;

create policy "recipes_select_own" on public.recipes
  for select to authenticated using (auth.uid() = user_id);
create policy "recipes_insert_own" on public.recipes
  for insert to authenticated with check (auth.uid() = user_id);
create policy "recipes_update_own" on public.recipes
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "recipes_delete_own" on public.recipes
  for delete to authenticated using (auth.uid() = user_id);

-- Fotos de portada: bucket público para leer; cada persona sube a su carpeta (<user_id>/...).
insert into storage.buckets (id, name, public)
values ('recipe-photos', 'recipe-photos', true)
on conflict (id) do nothing;

drop policy if exists "photos_insert_own" on storage.objects;
drop policy if exists "photos_delete_own" on storage.objects;

create policy "photos_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "photos_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = auth.uid()::text);
