// ──────────────────────────────────────────────
// Phone Number
// ──────────────────────────────────────────────

export const validatePhoneNumber = (phone) => {
  if (!phone) return 'Phone number is required';
  const clean = phone.toString().replace(/\s/g, '');
  if (!/^254\d{9}$/.test(clean)) return 'Phone must be in format 254XXXXXXXXX (12 digits)';
  return null;
};

export const isValidPhoneNumber = (phone) =>
  validatePhoneNumber(phone) === null;

// ──────────────────────────────────────────────
// PIN
// ──────────────────────────────────────────────

export const validatePin = (pin) => {
  if (!pin) return 'PIN is required';
  if (!/^\d{4}$/.test(pin)) return 'PIN must be exactly 4 digits';
  // Reject obvious sequences
  if (/^(.)\1{3}$/.test(pin)) return 'PIN cannot be all the same digit (e.g. 1111)';
  if (['1234', '4321', '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999'].includes(pin)) {
    return 'PIN is too simple. Please choose a stronger PIN';
  }
  return null;
};

export const validatePinMatch = (pin, confirmPin) => {
  if (!confirmPin) return 'Please confirm your PIN';
  if (pin !== confirmPin) return 'PINs do not match';
  return null;
};

export const isValidPin = (pin) => validatePin(pin) === null;

// ──────────────────────────────────────────────
// Amount
// ──────────────────────────────────────────────

export const validateAmount = (amount, { min = 1, max = 150000, label = 'Amount' } = {}) => {
  if (!amount && amount !== 0) return `${label} is required`;
  const num = parseFloat(amount);
  if (isNaN(num))          return `${label} must be a valid number`;
  if (num < min)           return `${label} must be at least KES ${min.toLocaleString()}`;
  if (num > max)           return `${label} cannot exceed KES ${max.toLocaleString()}`;
  return null;
};

export const validateSendAmount    = (amount) => validateAmount(amount, { min: 10,  max: 150000, label: 'Send amount' });
export const validateDepositAmount = (amount) => validateAmount(amount, { min: 10,  max: 300000, label: 'Deposit amount' });
export const validateWithdrawAmount= (amount) => validateAmount(amount, { min: 10,  max: 150000, label: 'Withdrawal amount' });

// ──────────────────────────────────────────────
// Email
// ──────────────────────────────────────────────

export const validateEmail = (email, required = false) => {
  if (!email) {
    return required ? 'Email is required' : null; // optional field
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
  return null;
};

// ──────────────────────────────────────────────
// Name
// ──────────────────────────────────────────────

export const validateName = (name, label = 'Name') => {
  if (!name?.trim()) return `${label} is required`;
  if (name.trim().length < 2) return `${label} must be at least 2 characters`;
  if (name.trim().length > 100) return `${label} must be under 100 characters`;
  if (!/^[a-zA-Z\s'-]+$/.test(name)) return `${label} can only contain letters, spaces, hyphens and apostrophes`;
  return null;
};

// ──────────────────────────────────────────────
// ID Number
// ──────────────────────────────────────────────

export const validateIdNumber = (id) => {
  if (!id?.trim()) return 'ID number is required';
  if (id.trim().length < 5) return 'ID number must be at least 5 characters';
  if (id.trim().length > 20) return 'ID number is too long';
  return null;
};

// ──────────────────────────────────────────────
// Generic required
// ──────────────────────────────────────────────

export const validateRequired = (value, label = 'This field') => {
  if (!value?.toString().trim()) return `${label} is required`;
  return null;
};

// ──────────────────────────────────────────────
// Full registration form
// ──────────────────────────────────────────────

export const validateRegistrationForm = (data) => {
  const errors = {};

  const firstName = validateName(data.first_name, 'First name');
  const lastName  = validateName(data.last_name,  'Last name');
  const phone     = validatePhoneNumber(data.phone_number);
  const email     = validateEmail(data.email, false);
  const idNum     = validateIdNumber(data.id_number);
  const pin       = validatePin(data.pin);
  const pinMatch  = validatePinMatch(data.pin, data.confirm_pin);

  if (firstName) errors.first_name   = firstName;
  if (lastName)  errors.last_name    = lastName;
  if (phone)     errors.phone_number = phone;
  if (email)     errors.email        = email;
  if (idNum)     errors.id_number    = idNum;
  if (pin)       errors.pin          = pin;
  if (pinMatch)  errors.confirm_pin  = pinMatch;

  return errors;
};

export const hasErrors = (errors) => Object.keys(errors).length > 0;