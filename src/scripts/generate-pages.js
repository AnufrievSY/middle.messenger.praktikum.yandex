const fs = require("fs");
const path = require("path");

const outDir = path.resolve(".tmp-pages");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const pages = [
    { name: "login", partial: "pages/input-form" },
    { name: "register", partial: "pages/input-form" },
    { name: "settings", partial: "pages/input-form" },
    { name: "chats", partial: "pages/chats" }, // если нет — сделай заглушку partial
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
  <ul>
    <li><a href="/login.html">login</a></li>
    <li><a href="/register.html">register</a></li>
    <li><a href="/settings.html">settings</a></li>
    <li><a href="/chats.html">chats</a></li>
    <li><a href="/404.html">404</a></li>
    <li><a href="/500.html">500</a></li>
  </ul>
</body>
</html>`;
fs.writeFileSync(path.join(outDir, "index.html"), index, "utf8");

console.log(`Generated ${pages.length} pages into ${outDir}`);
