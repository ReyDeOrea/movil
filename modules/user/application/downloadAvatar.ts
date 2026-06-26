import { API_URL } from "@/lib/api";

export async function downloadAvatar(path: string): Promise<string> {
  if (!path) return "";

  if (path.startsWith("http")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${API_URL}${path}`;
  }

  return `${API_URL}/${path}`;
}
