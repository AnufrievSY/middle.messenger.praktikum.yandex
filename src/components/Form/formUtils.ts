import { validateField, showFieldError } from '../../utils/validation';
import { FormValue } from './types';

export function collectFormValues(form: HTMLFormElement): Record<string, FormValue> {
  const data: Record<string, FormValue> = {};
  const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input'));

  inputs.forEach((input) => {
    if (input.type === 'file') {
      const file = input.files?.[0];
      if (file) {
        data[input.name] = file;
      }
      return;
    }

    data[input.name] = input.value;
  });

  return data;
}

export function validateHtmlForm(form: HTMLFormElement): boolean {
  const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input'));
  const results = inputs.map((input) => {
    const result = validateField(input.name, input.value);
    showFieldError(input, result);
    return result.isValid;
  });

  return results.every(Boolean);
}
