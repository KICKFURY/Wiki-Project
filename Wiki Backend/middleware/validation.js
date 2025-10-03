const validateUserCreation = (req, res, next) => {
  const { dni, username, email, password, role } = req.body;

  const errors = [];

  if (!dni || typeof dni !== 'string' || dni.trim().length === 0) {
    errors.push('DNI es requerido y debe ser una cadena no vacía');
  }

  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    errors.push('Username es requerido y debe ser una cadena no vacía');
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    errors.push('Email es requerido y debe ser válido');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password es requerido y debe tener al menos 6 caracteres');
  }

  if (!role || !['admin', 'user'].includes(role)) {
    errors.push('Role es requerido y debe ser "admin" o "user"');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  const errors = [];

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    errors.push('Email válido es requerido');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password es requerido');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  next();
};

const validateFollow = (req, res, next) => {
  const { followerId } = req.body;

  if (!followerId || typeof followerId !== 'string') {
    return res.status(400).json({ error: 'followerId es requerido y debe ser una cadena' });
  }

  next();
};

const validateInvite = (req, res, next) => {
  const { fromUserId, toUserIds, resourceId } = req.body;

  const errors = [];

  if (!fromUserId || typeof fromUserId !== 'string') {
    errors.push('fromUserId es requerido y debe ser una cadena');
  }

  if (!Array.isArray(toUserIds) || toUserIds.length === 0) {
    errors.push('toUserIds es requerido y debe ser un array no vacío');
  } else {
    for (const userId of toUserIds) {
      if (typeof userId !== 'string') {
        errors.push('Todos los elementos de toUserIds deben ser cadenas');
        break;
      }
    }
  }

  if (!resourceId || typeof resourceId !== 'string') {
    errors.push('resourceId es requerido y debe ser una cadena');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', ') });
  }

  next();
};

module.exports = {
  validateUserCreation,
  validateLogin,
  validateFollow,
  validateInvite,
};
