import { defineConfig, type Plugin } from "vite";
import { resolve } from "path";
import fs from "node:fs";
import handlebars from "vite-plugin-handlebars";

const TMP_DIR = resolve(__dirname, ".tmp-pages");

function getInputs() {
    const files = fs.existsSync(TMP_DIR)
        ? fs.readdirSync(TMP_DIR).filter((f) => f.endsWith(".html"))
        : [];
    const input: Record<string, string> = {};
    for (const f of files) {
        const name = f.replace(/\.html$/, "");
        input[name] = resolve(TMP_DIR, f);
    }
    return input;
}

function tmpPagesServeAndTransform(): Plugin {
    return {
        name: "tmp-pages-serve-and-transform",
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                if (!req.url) return next();
                const url = req.url.split("?")[0];

                // "/" -> index.html
                let route = url === "/" ? "/index.html" : url;

                // "/login" -> "/login.html"
                if (!route.endsWith(".html") && !route.includes(".") && route.startsWith("/")) {
                    route = `${route}.html`;
                }

                const filePath = resolve(TMP_DIR, route.slice(1));
                if (!fs.existsSync(filePath)) return next();

                const rawHtml = fs.readFileSync(filePath, "utf8");

                // ВАЖНО: прогоняем через Vite HTML pipeline,
                // чтобы отработали transformIndexHtml плагины (в т.ч. handlebars)
                const transformed = await server.transformIndexHtml(route, rawHtml);

                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html; charset=utf-8");
                res.end(transformed);
            });
        },
    };
}

export default defineConfig({
    server: { port: 3000 },
    plugins: [
        tmpPagesServeAndTransform(),
        handlebars({
            partialDirectory: resolve(__dirname, "src"),
            context: (pagePath) => {
                const cssBase = ["/src/styles/base.scss"];
                const scripts = ["/src/main.js"];

                if (pagePath.endsWith("login.html")) {
                    return {
                        css: [...cssBase, "/src/styles/input-form.scss"],
                        script: scripts,
                        action: "/login",
                        submitText: "SIGN IN",
                        altLink: { href: "/register", text: "REGISTER" },
                        fields: [
                            { name: "login", label: "login", type: "text", autocomplete: "username", required: true },
                            { name: "password", label: "password", type: "password", autocomplete: "current-password", required: true },
                        ],
                    };
                }

                if (pagePath.endsWith("register.html")) {
                    return {
                        css: [...cssBase, "/src/styles/input-form.scss"],
                        script: scripts,
                        action: "/register",
                        submitText: "REGISTER",
                        altLink: { href: "/login", text: "SIGN IN" },
                        fields: [
                            { name: "email", label: "email", type: "email", autocomplete: "email", required: true },
                            { name: "phone", label: "phone", type: "tel", autocomplete: "tel", required: true },
                            { name: "first-name", label: "first name", type: "text", autocomplete: "given-name", required: true },
                            { name: "second-name", label: "second name", type: "text", autocomplete: "family-name", required: true },
                            { name: "login", label: "login", type: "text", autocomplete: "username", required: true },
                            { name: "password", label: "password", type: "password", autocomplete: "new-password", required: true },
                            { name: "repeat-password", label: "repeat password", type: "password", autocomplete: "new-password", required: true },
                        ],
                    };
                }

                if (pagePath.endsWith("settings.html")) {
                    return {
                        css: [...cssBase, "/src/styles/input-form.scss"],
                        script: scripts,
                        action: "/settings",
                        submitText: "SAVE",
                        backHref: "/",
                        avatar: true,
                        fields: [
                            { name: "email", label: "email", type: "email", autocomplete: "email", required: true, value: "example@mail.ru" },
                            { name: "phone", label: "phone", type: "tel", autocomplete: "tel", required: true, value: "+7 (123) 456-78-90" },
                            { name: "login", label: "login", type: "text", autocomplete: "username", required: true, value: "login" },
                            { name: "first-name", label: "first name", type: "text", autocomplete: "given-name", required: true, value: "FirstName" },
                            { name: "second-name", label: "second name", type: "text", autocomplete: "family-name", required: true, value: "SecondName" },
                            { name: "password", label: "password", type: "password", autocomplete: "new-password", required: true, value: "" },
                            { name: "repeat-password", label: "repeat password", type: "password", autocomplete: "new-password", required: true, value: "" },
                        ],
                    };
                }

                if (pagePath.endsWith("404.html")) {
                    return {
                        css: [...cssBase, "/src/styles/error-page.scss"],
                        script: scripts,
                        code: 404,
                        backHref: "/",
                        line1: "Not",
                        line2: "Found",
                        line3: "",
                        message: "",
                    };
                }

                if (pagePath.endsWith("500.html")) {
                    return {
                        css: [...cssBase, "/src/styles/error-page.scss"],
                        script: scripts,
                        code: 500,
                        backHref: "/",
                        line1: "Internal",
                        line2: "Server",
                        line3: "Error",
                        message: "",
                    };
                }

                if (pagePath.endsWith("chats.html")) {
                    return { title: "Chats", css: cssBase, script: scripts };
                }

                return { title: "Messenger", css: cssBase, script: scripts };
            },
        }),
    ],
    build: {
        rollupOptions: {
            input: getInputs(),
        },
    },
});
