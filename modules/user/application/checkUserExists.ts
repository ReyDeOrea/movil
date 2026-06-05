import { supabase } from "@/lib/supabase";

export const checkUserExists = async (
    numUsuario: string,
  email: string,
   nombre: string, 
   telefono: string) => {

   numUsuario = numUsuario.trim();
  email = email.trim().toLowerCase();
  nombre = nombre.trim();
  telefono = telefono.trim();

 const { data: userById, error: idError } = await supabase
    .from("usuarios")
    .select("numusuario")
    .eq("numusuario", numUsuario)
    .maybeSingle();

  if (idError) throw new Error(idError.message);
  if (userById) throw new Error("El número de usuario ya existe");

  const { data: emailData, error: emailError } = await supabase
    .from("usuarios")
    .select("numusuario")
    .eq("email", email);

  if (emailError) throw new Error(emailError.message);
  if (emailData && emailData.length > 0) throw new Error("Este email ya está registrado");

  const { data: userData, error: userError } = await supabase
    .from("usuarios")
    .select("numusuario")
    .eq("nombre", nombre);

  if (userError) throw new Error(userError.message);
  if (userData && userData.length > 0) throw new Error("Este nombre de trabajador ya existe");

  const { data: phoneData, error: phoneError } = await supabase
    .from("usuarios")
    .select("numusuario")
    .eq("telefono", telefono);

  if (phoneError) throw new Error(phoneError.message);
  if (phoneData && phoneData.length > 0) throw new Error("Este número ya está registrado");
};

