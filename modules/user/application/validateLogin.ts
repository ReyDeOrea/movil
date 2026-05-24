export const validateLoginData = (email: string, password: string) => {

  // validar email
  if (!email || email.trim().length === 0) {
    throw new Error("Correo requerido");
  }

  // validación básica de formato email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Correo inválido");
  }

  // validar password
  if (!password || password.length < 6) {
    throw new Error("Contraseña debe tener al menos 6 caracteres");
  }
};