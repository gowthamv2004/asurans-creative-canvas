
-- Drop all restrictive policies on generated_images
DROP POLICY IF EXISTS "Users can view their own images" ON public.generated_images;
DROP POLICY IF EXISTS "Admins can view all images" ON public.generated_images;
DROP POLICY IF EXISTS "Users can insert their own images" ON public.generated_images;
DROP POLICY IF EXISTS "Users can update their own images" ON public.generated_images;
DROP POLICY IF EXISTS "Users can delete their own images" ON public.generated_images;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Users can view their own images"
ON public.generated_images FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all images"
ON public.generated_images FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own images"
ON public.generated_images FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own images"
ON public.generated_images FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images"
ON public.generated_images FOR DELETE
USING (auth.uid() = user_id);

-- Also fix profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Also fix user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);
