declare module "src/types/vite-plugin-handlebars" {
    import type { Plugin } from "vite";

    export interface HandlebarsPluginOptions {
        context?: Record<string, unknown>;
        partialDirectory?: string | string[];
        helpers?: Record<string, (...args: unknown[]) => unknown>;
        reloadOnPartialChange?: boolean;
    }

    export default function handlebars(options?: HandlebarsPluginOptions): Plugin;
}
