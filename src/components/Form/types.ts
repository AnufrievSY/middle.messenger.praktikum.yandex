import { BlockProps } from "../../core/Block";
import Input from "../Input";
import Button from "../Button";

export type FormProps = BlockProps & {
    title: string;
    subtitle?: string;
    altLink?: { href: string; text: string };
    fields: Input[];
    submitButton: Button;
    onSubmit?: (data: Record<string, string>) => void;
};
