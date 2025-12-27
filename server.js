const express = require("express");
const handlebars = require("express-handlebars");
const path = require("path");

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

app.get("/login", (req, res) => {
    res.render("input-form", {
        script: ["check-input"],
        action: "/login",
        submitText: "SIGN IN",
        altLink: { href: "/register", text: "REGISTER" },
        fields: [
            { name: "login", label: "login", type: "text", autocomplete: "username", required: true },
            { name: "password", label: "password", type: "password", autocomplete: "current-password", required: true },
        ],
    });
});

app.post("/login", (req, res) => {
    const { login, password } = req.body;
    res.send(`Логин: ${login}, Пароль: ${password}`);
});

app.get("/register", (req, res) => {
    res.render("input-form", {
        script: ["check-input"],
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
    });
});

app.get("/settings", (req, res) => {
    const user = {
        email: "example@mail.ru",
        phone: "+7 (123) 456-78-90",
        login: "login",
        firstName: "FirstName",
        secondName: "SecondName",
    };

    res.render("input-form", {
        script: ["check-input"],
        action: "/settings",
        submitText: "SAVE",
        backHref: "/",
        avatar: true,
        fields: [
            { name: "email", label: "email", type: "email", autocomplete: "email", required: true, value: user.email },
            { name: "phone", label: "phone", type: "tel", autocomplete: "tel", required: true, value: user.phone },
            { name: "login", label: "login", type: "text", autocomplete: "username", required: true, value: user.login },
            { name: "first-name", label: "first name", type: "text", autocomplete: "given-name", required: true, value: user.firstName },
            { name: "second-name", label: "second name", type: "text", autocomplete: "family-name", required: true, value: user.secondName },
            { name: "password", label: "password", type: "password", autocomplete: "new-password", required: true, value: "" },
            { name: "repeat-password", label: "repeat password", type: "password", autocomplete: "new-password", required: true, value: "" },
        ],
    });
});

app.get("/404", (req, res) => {
    res.status(404).render("error-page", {
        code: 404,
        title: "Not Found",
        imageUrl: "/images/errors/404.jpg",
        backHref: req.get("Referrer") || "/",
        line1: "Not",
        line2: "Found",
        line3: "",
        message: "",
    });
});

app.get("/500", (req, res) => {
    res.status(500).render("error-page", {
        code: 500,
        title: "Internal Server Error",
        imageUrl: "/images/errors/500.jpg",
        backHref: req.get("Referrer") || "/",
        line1: "Internal",
        line2: "Server",
        line3: "Error",
        message: "",
    });
});

app.listen(3000, () => console.log("http://localhost:3000/"));
