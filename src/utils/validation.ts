export type ValidationResult = {
  isValid: boolean;
  message: string;
};

const rules: Record<string, { regex: RegExp; message: string }> = {
  first_name: {
    regex: /^[A-ZА-ЯЁ][A-Za-zА-Яа-яЁё-]*$/,
    message: 'Имя должно начинаться с заглавной буквы и содержать только буквы или дефис',
  },
  second_name: {
    regex: /^[A-ZА-ЯЁ][A-Za-zА-Яа-яЁё-]*$/,
    message: 'Фамилия должна начинаться с заглавной буквы и содержать только буквы или дефис',
  },
  login: {
    regex: /^(?!\d+$)[A-Za-z0-9_-]{3,20}$/,
    message: 'Логин должен быть 3-20 символов, без пробелов и спецсимволов',
  },
  email: {
    regex: /^[A-Za-z0-9._-]+@[A-Za-z]+\.[A-Za-z0-9-]+$/,
    message: 'Введите корректный email',
  },
  password: {
    regex: /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,40}$/,
    message: 'Пароль 8-40 символов, минимум одна заглавная буква и цифра',
  },
  phone: {
    regex: /^\+?\d{10,15}$/,
    message: 'Телефон должен содержать 10-15 цифр и может начинаться с +',
  },
  message: {
    regex: /\S+/,
    message: 'Сообщение не должно быть пустым',
  },
};

export function validateField(name: string, value: string): ValidationResult {
  const rule = rules[name];
  if (!rule) {
    return { isValid: true, message: '' };
  }
  const isValid = rule.regex.test(value);
  return { isValid, message: isValid ? '' : rule.message };
}

export function showFieldError(input: HTMLInputElement, result: ValidationResult): void {
  const field = input.closest('.field');
  if (!field) {
    return;
  }
  const error = field.querySelector<HTMLElement>('.field__error');
  if (!error) {
    return;
  }
  error.textContent = result.message;
  field.classList.toggle('field--invalid', !result.isValid);
}

export function validateForm(form: HTMLFormElement): boolean {
  const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input'));
  const results = inputs.map((input) => {
    const result = validateField(input.name, input.value);
    showFieldError(input, result);
    return result.isValid;
  });
  return results.every(Boolean);
}
