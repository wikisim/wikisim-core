alter table public.data_components enable row level security;
alter table public.data_components_archive enable row level security;


CREATE policy "Any user can select from data_components" on public.data_components for select using ( true );
CREATE policy "Any user can select from data_components_archive" on public.data_components_archive for select using ( true );

-- Allow any authenticated user to insert into data_components
-- as long as they set themselves as the editor_id
CREATE policy "Any authenticated user can insert into data_components" on public.data_components for insert with check (
    auth.role() = 'authenticated'
    AND data_components.editor_id = auth.uid()
);

-- Instead of allowing updates to data_components directly,
-- we will use a function to handle updates and versioning.
-- CREATE policy "Any authenticated user can update any data_component as long as they set themselves as the editor_id" on public.data_components for update using (
--     auth.role() = 'authenticated'
-- ) with check (
--     auth.role() = 'authenticated' AND data_components.editor_id = auth.uid()
-- );
