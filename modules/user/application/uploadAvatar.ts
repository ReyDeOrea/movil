import { API_URL } from "../../../lib/api";

const esperar = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const uploadAvatarFile = async (
  uri: string,
  mimeType?: string
): Promise<string> => {
  const fileName = uri.split("/").pop() || `avatar_${Date.now()}.jpg`;

  const extension =
    fileName.includes(".")
      ? fileName.split(".").pop()?.toLowerCase()
      : "jpg";

  const type =
    mimeType ||
    (extension === "png"
      ? "image/png"
      : extension === "webp"
      ? "image/webp"
      : "image/jpeg");

  const formData = new FormData();

  formData.append("file", {
    uri,
    name: fileName,
    type,
  } as any);

  let ultimoError: unknown = null;

  for (let intento = 1; intento <= 2; intento++) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 60000);

    try {
      const response = await fetch(`${API_URL}/uploads/avatar`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || "No se pudo subir la imagen");
      }

      const data = JSON.parse(text);

      if (!data.url) {
        throw new Error("La API no devolvió la URL de la imagen");
      }

      return data.url;
    } catch (error) {
      ultimoError = error;

      if (intento === 1) {
        await esperar(700);
        continue;
      }

      throw ultimoError;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw ultimoError;
};