alter table public.data_components enable row level security;
alter table public.data_components_archive enable row level security;


CREATE policy "Any user can select from data_components" on public.data_components for select using ( true );
CREATE policy "Any user can select from data_components_archive" on public.data_components_archive for select using ( true );

-- Instead of allowing insert to data_components directly,
-- we will use a function to handle inserts.
-- -- Allow any authenticated user to insert into data_components
-- -- as long as they set themselves as the editor_id
-- CREATE policy "Any authenticated user can insert normally into data_components" on public.data_components for insert with check (
--     auth.role() = 'authenticated'
--     AND data_components.editor_id = auth.uid()
-- );

-- Allow any authenticated user to delete from data_components
-- when the id is negative and a test_run_id is set (this is used for cleaning
-- up tests against DB)
CREATE policy "Any authenticated user can delete test data from data_components" on public.data_components for delete using (
    auth.role() = 'authenticated'
    AND data_components.id < 0
    AND data_components.test_run_id IS NOT NULL
);
-- Allow any authenticated user to delete from data_components_archive
-- when the id is negative and a test_run_id is set (this is used for cleaning
-- up tests against DB)
CREATE policy "Any authenticated user can delete test data from data_components_archive" on public.data_components_archive for delete using (
    auth.role() = 'authenticated'
    AND data_components_archive.id < 0
    AND data_components_archive.test_run_id IS NOT NULL
);


-- Instead of allowing updates to data_components directly,
-- we will use a function to handle updates and versioning.
-- CREATE policy "Any authenticated user can update any data_component as long as they set themselves as the editor_id" on public.data_components for update using (
--     auth.role() = 'authenticated'
-- ) with check (
--     auth.role() = 'authenticated' AND data_components.editor_id = auth.uid()
-- );
