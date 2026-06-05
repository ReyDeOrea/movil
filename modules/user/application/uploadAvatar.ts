import { supabase } from "@/lib/supabase";

export async function uploadAvatarFile(
  uri: string,
  mimeType?: string
): Promise<string> {

  const response = await fetch(uri);
  const blob = await response.blob();

  const fileExt = mimeType?.split("/")[1] ?? "jpg";
  const fileName = `${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(fileName, blob, {
      contentType: mimeType ?? "image/jpeg",
      upsert: true,
    });

  if (error) throw error;

  return data.path;
}