-- Drop trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Drop function if it exists
drop function if exists public.handle_new_user();

-- Create Profile table if it doesn't exist
create table if not exists public.Profile (
  id uuid references auth.users on delete cascade primary key,
  first_name text,
  last_name text,
  email text,
  birth_date date,
  role text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.Profile enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own profile" on public.Profile;
drop policy if exists "Users can update their own profile" on public.Profile;

-- Create policy to allow users to read their own profile
create policy "Users can view their own profile"
  on public.Profile for select
  using (auth.uid() = id);

-- Create policy to allow users to update their own profile
create policy "Users can update their own profile"
  on public.Profile for update
  using (auth.uid() = id);

-- Create trigger function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.Profile (id, first_name, last_name, email, birth_date, role)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.email,
    (new.raw_user_meta_data->>'birth_date')::date,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Drop trigger for settings if it exists
drop trigger if exists on_profile_created on public.Profile;

-- Drop function if it exists
drop function if exists public.handle_new_profile();

-- Update Settings table to use profile_id instead of user_id (if needed)
-- Run this only if your Settings table still has user_id
-- alter table public.Settings rename column user_id to profile_id;
-- alter table public.Settings alter column profile_id type uuid using profile_id::uuid;
-- alter table public.Settings add constraint Settings_profile_id_fkey foreign key (profile_id) references public.Profile(id) on delete cascade;

-- Or create Settings table if it doesn't exist
create table if not exists public.Settings (
  id serial primary key,
  profile_id uuid references public.Profile(id) on delete cascade not null unique,
  sounds boolean default true,
  vibrations boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.Settings enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own settings" on public.Settings;
drop policy if exists "Users can update their own settings" on public.Settings;

-- Create policy to allow users to read their own settings
create policy "Users can view their own settings"
  on public.Settings for select
  using (auth.uid() = profile_id);

-- Create policy to allow users to update their own settings
create policy "Users can update their own settings"
  on public.Settings for update
  using (auth.uid() = profile_id);

-- Create trigger function for settings
create or replace function public.handle_new_profile()
returns trigger as $$
begin
  insert into public.Settings (profile_id, sounds, vibrations)
  values (
    new.id,
    true,
    true
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to create settings when profile is created
create trigger on_profile_created
after insert on public.Profile
for each row execute procedure public.handle_new_profile();
