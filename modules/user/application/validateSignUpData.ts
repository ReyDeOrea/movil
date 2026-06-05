export const validateSignUpData = (data: {
  numUsuario: number;
  nombre: string;
  telefono: string;
  email: string;
  password: string;
  confirmPassword?: string;
}) => {
  const { numUsuario, nombre, telefono, email, password, confirmPassword } = data;

  if (!numUsuario || !nombre || !telefono || !email || !password)
    throw new Error("Todos los campos son obligatorios");

  if (isNaN(numUsuario)) {
    throw new Error("El número de usuario debe ser numérico");
  }

  if (numUsuario <= 0) {
    throw new Error("El número de usuario no es válido");
  }
  if (nombre.trim().length < 3) {
    throw new Error("El nombre debe tener al menos 3 caracteres");
  }

  if (password !== confirmPassword)
    throw new Error("Las contraseñas no coinciden ");

  if (password.length < 6)
    throw new Error("La contraseña debe tener mínimo 6 caracteres");

  if (telefono.length !== 10) {
    throw new Error("El teléfono debe tener 10 dígitos");
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("Correo electrónico inválido");
  }

  return true;
};