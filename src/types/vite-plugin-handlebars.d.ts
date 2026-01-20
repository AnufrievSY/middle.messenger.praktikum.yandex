declare module "src/types/vite-plugin-handlebars" {
    import type { Plugin } from "vite";

    export interface HandlebarsPluginOptions {
        context?: Record<string, any>;
        partialDirectory?: string | string[];
        helpers?: Record<string, (...args: any[]) => any>;
        reloadOnPartialChange?: boolean;
    }

    export default function handlebars(options?: HandlebarsPluginOptions): Plugin;
}
