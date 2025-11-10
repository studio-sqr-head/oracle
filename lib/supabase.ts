import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// Client-side client (uses anon key, respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client (uses service role, bypasses RLS) - for API routes only
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function createReport(data: {
  userId: string;
  systemKey: string;
  inputs: Record<string, any>;
  nodes: Record<string, number>;
  interpretations: Array<{
    dimensionKey: string;
    valueKey: string;
    content?: any;
  }>;
}) {
  // Use admin client to bypass RLS (server-side only)
  const { data: report, error } = await supabaseAdmin
    .from("reports")
    .insert([
      {
        user_id: data.userId,
        system_key: data.systemKey,
        inputs: data.inputs,
        nodes: data.nodes,
        interpretations: data.interpretations,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return report;
}

export async function getSynthesis(userId: string) {
  const { data, error } = await supabase
    .from("synthesis")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function createSynthesis(data: {
  userId: string;
  reportIds: string[];
  requestPayload: Record<string, any>;
  responsePayload: Record<string, any>;
  aiModel: string;
}) {
  // Use admin client to bypass RLS (server-side only)
  const { data: synthesis, error } = await supabaseAdmin
    .from("synthesis")
    .insert([
      {
        user_id: data.userId,
        report_ids: data.reportIds,
        request_payload: data.requestPayload,
        response_payload: data.responsePayload,
        ai_model: data.aiModel,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return synthesis;
}
