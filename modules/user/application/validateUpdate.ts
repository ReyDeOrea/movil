export const validateUserProfile = (
  email: string,
  phone: string
) => {

  email = email.trim();
  phone = phone.trim();

  if (!email || !phone) {
    throw new Error("Todos los campos son obligatorios");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new Error("El formato del correo no es válido");
  }

  const phoneRegex = /^[0-9]{10}$/;

  if (!phoneRegex.test(phone)) {
    throw new Error("El teléfono debe tener exactamente 10 dígitos");
  }

};