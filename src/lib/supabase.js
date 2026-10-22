import { createClient } from "@supabase/supabase-js";

// Read the Supabase project URL from the environment file.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Read the Supabase publishable key from the environment file.
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Create one reusable client for communicating with Supabase.
export const supabase = createClient(supabaseUrl, supabasePublishableKey);
