-- Allow organization_id to be NULL for public Tabeebi users
ALTER TABLE public.ai_conversations ALTER COLUMN organization_id DROP NOT NULL;

-- Add user_id index for faster history queries
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);

-- Add RLS policy so users can see their own conversations (by user_id)
CREATE POLICY "Users can view their own conversations by user_id"
  ON public.ai_conversations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own conversations"
  ON public.ai_conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own conversations"
  ON public.ai_conversations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());