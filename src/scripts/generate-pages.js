const fs = require("fs");
const path = require("path");

const outDir = path.resolve(".tmp-pages");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const pages = [
    { name: "login", partial: "pages/input-form" },
    { name: "register", partial: "pages/input-form" },
    { name: "settings", partial: "pages/input-form" },
    { name: "chats", partial: "pages/chats" },
    { name: "404", partial: "pages/error-page" },
    { name: "500", partial: "pages/error-page" },
];

for (const p of pages) {
    const html = `{{#> layouts/main}}
  {{> ${p.partial} }}
{{/layouts/main}}
`;
    fs.writeFileSync(path.join(outDir, `${p.name}.html`), html, "utf8");
}

const index = `<!doctype html>
<html lang="ru">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Pages</title></head>
<body>
<nav>
  <ul>
    <li><a href="/login">login</a></li>
    <li><a href="/register">register</a></li>
    <li><a href="/settings">settings</a></li>
    <li><a href="/chats">chats</a></li>
    <li><a href="/404">404</a></li>
    <li><a href="/500">500</a></li>
  </ul>
</nav>
</body>
</html>`;
fs.writeFileSync(path.join(outDir, "index.html"), index, "utf8");

console.log("Generated " + pages.length + " pages into " + outDir);

