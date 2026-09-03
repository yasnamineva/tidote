-- Photo storage.
--
-- Photos were base64 data URLs inside localStorage, which is why they had to be
-- crushed to fit a 5 MB browser budget shared with every other record. They now
-- live in object storage and the tables hold paths.
--
-- Two buckets, because they have two different audiences.

-- Private. Reference shots, the client's photos of their finished piece, note
-- attachments, wardrobe. Reached only through signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('client-photos', 'client-photos', false, 10485760,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Public. Rail photos appear on /in-stock, which strangers read.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('stock-photos', 'stock-photos', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Every client photo is filed under the owner's uuid, so the first path segment
-- is the permission: your folder is yours, and the studio can reach all of them.
create policy "read own photo folder" on storage.objects
  for select using (
    bucket_id = 'client-photos'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "write own photo folder" on storage.objects
  for insert with check (
    bucket_id = 'client-photos'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "delete own photo folder" on storage.objects
  for delete using (
    bucket_id = 'client-photos'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "anyone reads stock photos" on storage.objects
  for select using (bucket_id = 'stock-photos');

create policy "studio writes stock photos" on storage.objects
  for insert with check (bucket_id = 'stock-photos' and public.is_admin());

create policy "studio deletes stock photos" on storage.objects
  for delete using (bucket_id = 'stock-photos' and public.is_admin());
