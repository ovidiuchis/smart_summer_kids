
-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('parent', 'child')) DEFAULT 'parent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create children table
CREATE TABLE public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '👧',
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table (configurable by parents)
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '⭐',
  points INTEGER NOT NULL DEFAULT 10,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create completed activities table (tracks daily completions)
CREATE TABLE public.completed_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  points_earned INTEGER NOT NULL,
  approved_by_parent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate completions for same activity on same day
  UNIQUE(child_id, activity_id, completed_date)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for children
CREATE POLICY "Parents can manage their children" ON public.children
  FOR ALL USING (
    parent_id IN (
      SELECT id FROM public.profiles 
      WHERE id = auth.uid() AND role = 'parent'
    )
  );

-- RLS Policies for activities
CREATE POLICY "Parents can manage their activities" ON public.activities
  FOR ALL USING (
    parent_id IN (
      SELECT id FROM public.profiles 
      WHERE id = auth.uid() AND role = 'parent'
    )
  );

CREATE POLICY "Children can view activities from their parent" ON public.activities
  FOR SELECT USING (
    parent_id IN (
      SELECT parent_id FROM public.children 
      WHERE id = ANY(
        SELECT id FROM public.children 
        WHERE parent_id IN (
          SELECT id FROM public.profiles WHERE id = auth.uid()
        )
      )
    ) OR 
    parent_id IN (
      SELECT id FROM public.profiles WHERE id = auth.uid() AND role = 'parent'
    )
  );

-- RLS Policies for completed activities
CREATE POLICY "Parents can view their children's completed activities" ON public.completed_activities
  FOR SELECT USING (
    child_id IN (
      SELECT id FROM public.children 
      WHERE parent_id IN (
        SELECT id FROM public.profiles WHERE id = auth.uid() AND role = 'parent'
      )
    )
  );

CREATE POLICY "Parents can approve completed activities" ON public.completed_activities
  FOR UPDATE USING (
    child_id IN (
      SELECT id FROM public.children 
      WHERE parent_id IN (
        SELECT id FROM public.profiles WHERE id = auth.uid() AND role = 'parent'
      )
    )
  );

CREATE POLICY "Children can complete activities" ON public.completed_activities
  FOR INSERT WITH CHECK (
    child_id IN (
      SELECT c.id FROM public.children c
      JOIN public.profiles p ON c.parent_id = p.id
      WHERE p.id = auth.uid() AND p.role = 'parent'
    ) OR
    EXISTS (
      SELECT 1 FROM public.children 
      WHERE id = child_id AND parent_id IN (
        SELECT id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Children can view their own completed activities" ON public.completed_activities
  FOR SELECT USING (
    child_id IN (
      SELECT c.id FROM public.children c
      JOIN public.profiles p ON c.parent_id = p.id
      WHERE p.id = auth.uid()
    )
  );

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'parent'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update total points when activities are completed
CREATE OR REPLACE FUNCTION public.update_child_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.children 
    SET total_points = total_points + NEW.points_earned,
        updated_at = NOW()
    WHERE id = NEW.child_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.children 
    SET total_points = total_points - OLD.points_earned,
        updated_at = NOW()
    WHERE id = OLD.child_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger to update points when activities are completed/removed
CREATE TRIGGER on_activity_completed
  AFTER INSERT OR DELETE ON public.completed_activities
  FOR EACH ROW EXECUTE FUNCTION public.update_child_points();
