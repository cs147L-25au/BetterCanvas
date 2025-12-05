import "react-native-url-polyfill/auto";

import { createClient } from "@supabase/supabase-js";

import { Database } from "../types/database";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables: please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in an .env file at the project base!",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
