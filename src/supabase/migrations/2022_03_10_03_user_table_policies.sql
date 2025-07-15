


alter table public.users enable row level security;


CREATE policy "User can insert their own user entry" on public.users for insert with check ( users.id = auth.uid() );
CREATE policy "User can update their own user entry" on public.users for update using ( users.id = auth.uid() ) with check ( users.id = auth.uid() );
