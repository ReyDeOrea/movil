export const validateSignUpData = (data: {
  numUsuario: number;
  nombre: string;
  telefono: string;
  email: string;
  password: string;
  confirmPassword?: string;
}) => {
  const {
    numUsuario,
    nombre,
    telefono,
    email,
    password,
    confirmPassword,
  } = data;

  if (!numUsuario || !nombre || !telefono || !email || !password) {
    throw new Error("Todos los campos son obligatorios");
  }

  if (isNaN(numUsuario)) {
    throw new Error("El número de trabajador debe ser numérico");
  }

  if (numUsuario <= 0) {
    throw new Error("El número de trabajador no es válido");
  }

  if (nombre.trim().length < 3) {
    throw new Error("El nombre debe tener al menos 3 caracteres");
  }

  if (!/^\d{10}$/.test(telefono.trim())) {
    throw new Error("El teléfono debe tener 10 dígitos numéricos");
  }

  if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    throw new Error("Correo electrónico inválido");
  }

  if (password !== confirmPassword) {
    throw new Error("Las contraseñas no coinciden");
  }

  if (password.length < 6) {
    throw new Error("La contraseña debe tener mínimo 6 caracteres");
  }

  return true;
};