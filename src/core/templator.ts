export type TemplateContext = Record<string, unknown>;

function toString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

export default function templator(template: string, context: TemplateContext): string {
  return template.replace(/\{\{\{?\s*(\w+)\s*\}?\}\}/g, (_, key: string) => {
    if (Object.prototype.hasOwnProperty.call(context, key)) {
      return toString(context[key]);
    }
    return '';
  });
}
