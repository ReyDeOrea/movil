export const validateUser = (
  nombre: string,
  email: string,
  phone: string
) => {

  nombre = nombre.trim();
   email = email.trim().toLowerCase();
  phone = phone.trim();

  if (!nombre || !email || !phone) {
    throw new Error("Todos los campos son obligatorios");
  }

  if (nombre.length < 3) {
    throw new Error("El nombre debe tener al menos 3 caracteres");
  }

  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
  if (!emailRegex.test(email)) {
    throw new Error("El formato del correo no es válido");
  }

  const phoneRegex = /^[0-9]{10}$/;

  if (!phoneRegex.test(phone)) {
    throw new Error("El teléfono debe tener exactamente 10 dígitos");
  }
};