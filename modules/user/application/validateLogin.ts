export const validateLoginData = (email: string, password: string) => {

  if (!email || email.trim().length === 0) {
    throw new Error("Correo requerido");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Correo inválido");
  }

};