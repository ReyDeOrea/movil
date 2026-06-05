import { supabase } from "@/lib/supabase";

export const checkUserExistsUpdate = async (
  email: string,
  telefono: string,
  currentUserId: number
): Promise<void> => {

  const cleanEmail = email.trim().toLowerCase();
  const cleanTelefono = telefono.trim();

  const { data: emailData, error: emailError } = await supabase
    .from("usuarios")
    .select("numusuario")
    .eq("email", cleanEmail)
    .neq("numusuario", currentUserId);

  if (emailError) throw new Error(emailError.message);

  if (emailData && emailData.length > 0) {
    throw new Error("Este correo ya está registrado");
  }


  const { data: phoneData, error: phoneError } = await supabase
    .from("usuarios")
    .select("numusuario")
    .eq("telefono", cleanTelefono)
    .neq("numusuario", currentUserId);

  if (phoneError) throw new Error(phoneError.message);

  if (phoneData && phoneData.length > 0) {
    throw new Error("Este número ya está registrado");
  }
};