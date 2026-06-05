import { supabase } from "@/lib/supabase";

export async function downloadAvatar(path: string): Promise<string> {
  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(path);

  return data.publicUrl;
}