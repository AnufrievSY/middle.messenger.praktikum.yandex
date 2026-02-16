import { BlockProps } from '../../core/Block';
import { Input } from '../Input';
import { Button } from '../Button';

export type FormValue = string | File;

export type FormProps = BlockProps & {
  title?: string;
  subtitle?: string;
  altLink?: { href: string; text: string };
  fields: Input[];
  submitButton?: Button;
  dirtySaveEnabled?: boolean;
  isDirty?: boolean;
  onSubmit?: (data: Record<string, FormValue>) => void;
};
