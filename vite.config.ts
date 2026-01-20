import { defineConfig, type Plugin } from "vite";
import { resolve } from "path";
import { existsSync, readdirSync, copyFileSync, readFileSync } from "node:fs";
import handlebars from "vite-plugin-handlebars";

const TMP_DIR = resolve(__dirname, ".tmp-pages");

function readJson(p: string): unknown {
    return JSON.parse(readFileSync(p, "utf8"));
}

function getInputs() {
    const files = existsSync(TMP_DIR)
        ? readdirSync(TMP_DIR).filter((f) => f.endsWith(".html"))
        : [];

    const input: Record<string, string> = {};
    for (const f of files) {
        const name = f.replace(/\.html$/, "");
        input[name] = resolve(TMP_DIR, f);
    }
    return input;
}

function netlifyFixHtmlOutput(): Plugin {
    return {
        name: "netlify-fix-html-output",
        apply: "build",
        closeBundle() {
            const dist = resolve(__dirname, "dist");
            const from = resolve(dist, ".tmp-pages");
            if (!existsSync(from)) return;

            for (const f of readdirSync(from)) {
                if (!f.endsWith(".html")) continue;
                copyFileSync(resolve(from, f), resolve(dist, f));
            }
        },
    };
}

function tmpPagesServeAndTransform(): Plugin {
    return {
        name: "tmp-pages-serve-and-transform",
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                if (!req.url) return next();
                const url = req.url.split("?")[0];

                let route = url === "/" ? "/index.html" : url;

                if (!route.endsWith(".html") && !route.includes(".") && route.startsWith("/")) {
                    route = `${route}.html`;
                }

                const filePath = resolve(TMP_DIR, route.slice(1));
                if (!existsSync(filePath)) return next();

                const rawHtml = readFileSync(filePath, "utf8");
                const transformed = await server.transformIndexHtml(route, rawHtml);

                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html; charset=utf-8");
                res.end(transformed);
            });
        },
    };
}

export default defineConfig(() => {
    const inputs = getInputs();

    // читаем чаты пользователя 0 (из PUBLIC!)
    const userId = 0;
    const chatsPath = resolve(__dirname, `public/data/users/${userId}/chats.json`);
    const chats = existsSync(chatsPath) ? readJson(chatsPath) : [];

    return {
        server: { port: 3000 },

        // чтобы /data/... попадало в dist и работало в build/preview
        publicDir: resolve(__dirname, "public"),

        plugins: [
            tmpPagesServeAndTransform(),
            handlebars({
                partialDirectory: resolve(__dirname, "src"),

                helpers: {
                    json: (ctx: unknown) => JSON.stringify(ctx),
                },

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
                        return {
                            title: "Chats",
                            css: [...cssBase, "/src/styles/chats.scss"],
                            script: [...scripts, "/src/scripts/chats.js"],
                            userId,
                            chats,
                        };
                    }

                    return { title: "Messenger", css: cssBase, script: scripts };
                },
            }),
            netlifyFixHtmlOutput(),
        ],

        build: {
            rollupOptions: {
                input: Object.keys(inputs).length ? inputs : resolve(__dirname, "index.html"),
            },
        },
    };
});
