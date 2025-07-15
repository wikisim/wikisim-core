
-- All users and non-auth'd users to read the public users info including the trusted flag
-- SECURITY
CREATE POLICY "User can read all users" ON public.users FOR SELECT USING ( true );
