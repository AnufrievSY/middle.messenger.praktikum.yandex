const express = require("express");
const handlebars = require("express-handlebars");
const path = require("path");
const fs = require("node:fs");

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

const app = express();
app.use(express.urlencoded({ extended: true }));

app.engine(
    "hbs",
    handlebars.engine({
        extname: "hbs",
        layoutsDir: path.resolve("src/layouts"),
        defaultLayout: "main",
        partialsDir: path.resolve("src/components"),
    })
);

app.set("view engine", "hbs");
app.set("views", path.resolve("src/pages"));

app.use("/js", express.static(path.resolve("src/scripts")));
app.use("/images", express.static(path.resolve("src/assets/images")));
app.use("/data", express.static(path.resolve("public/data"))); // чтобы /data/... работало

app.get("/chats", (req, res) => {
    const userId = 0;
    const chatsPath = path.resolve(`public/data/users/${userId}/chats.json`);
    const chats = fs.existsSync(chatsPath) ? readJson(chatsPath) : [];

    const chatId = req.query.chat ? String(req.query.chat) : null;

    let selectedChat = null;
    let messages = [];

    if (chatId) {
        const raw = chats.find((c) => String(c.id) === chatId) || null;
        selectedChat = raw ? { ...raw, avatar: raw.avatar || `/data/users/${raw.id}/avatar.jpg` } : null;

        const messagesPath = path.resolve(`public/data/users/${userId}/messages/${chatId}.json`);
        messages = fs.existsSync(messagesPath) ? readJson(messagesPath) : [];
    }

    res.render("chats", {
        chats,
        selectedChat,
        messages,
        userId,
    });
});

// старый вариант оставил
app.get("/chats/:id", (req, res) => {
    res.redirect(`/chats?chat=${encodeURIComponent(req.params.id)}`);
});

app.listen(3000, () => console.log("http://localhost:3000/"));
