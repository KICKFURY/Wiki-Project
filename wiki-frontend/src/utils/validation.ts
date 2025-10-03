import { RecursoForm, LoginForm, RegisterForm, UserProfileForm } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateLoginForm = (form: LoginForm): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!form.email?.trim()) {
    errors.email = 'El email es requerido';
  } else if (!isValidEmail(form.email)) {
    errors.email = 'Email inválido';
  }

  if (!form.password?.trim()) {
    errors.password = 'La contraseña es requerida';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateRegisterForm = (form: RegisterForm): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!form.dni?.trim()) {
    errors.dni = 'El DNI es requerido';
  }

  if (!form.username?.trim()) {
    errors.username = 'El nombre de usuario es requerido';
  } else if (form.username.length < 3) {
    errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
  }

  if (!form.email?.trim()) {
    errors.email = 'El email es requerido';
  } else if (!isValidEmail(form.email)) {
    errors.email = 'Email inválido';
  }

  if (!form.password?.trim()) {
    errors.password = 'La contraseña es requerida';
  } else if (form.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateRecursoForm = (form: RecursoForm): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!form.title?.trim()) {
    errors.title = 'El título es requerido';
  }

  if (!form.content?.trim()) {
    errors.content = 'El contenido es requerido';
  }

  if (!form.category?.trim()) {
    errors.category = 'La categoría es requerida';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateProfileForm = (form: UserProfileForm): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!form.dni?.trim()) {
    errors.dni = 'El DNI es requerido';
  }

  if (!form.username?.trim()) {
    errors.username = 'El nombre de usuario es requerido';
  } else if (form.username.length < 3) {
    errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
  }

  if (!form.email?.trim()) {
    errors.email = 'El email es requerido';
  } else if (!isValidEmail(form.email)) {
    errors.email = 'Email inválido';
  }

  if (!form.role?.trim()) {
    errors.role = 'El rol es requerido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
