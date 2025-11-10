-- Create reports table
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  system_key text NOT NULL,
  inputs jsonb NOT NULL,
  nodes jsonb NOT NULL,
  interpretations jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_user_created ON public.reports (user_id, created_at DESC);

-- Create synthesis table
CREATE TABLE public.synthesis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  report_ids uuid[] NOT NULL,
  request_payload jsonb NOT NULL,
  response_payload jsonb NOT NULL,
  ai_model text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_synthesis_user_created ON public.synthesis (user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synthesis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
CREATE POLICY "reports_owner_select" ON public.reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reports_owner_insert" ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reports_owner_update" ON public.reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reports_owner_delete" ON public.reports FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for synthesis
CREATE POLICY "synthesis_owner_select" ON public.synthesis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "synthesis_owner_insert" ON public.synthesis FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "synthesis_owner_update" ON public.synthesis FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "synthesis_owner_delete" ON public.synthesis FOR DELETE USING (auth.uid() = user_id);
