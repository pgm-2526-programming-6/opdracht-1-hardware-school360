-- Drop trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Drop function if it exists
drop function if exists public.handle_new_user();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, last_name, first_name)
  values (
    new.id,
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'first_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();