const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');


const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

app.engine('hbs', exphbs.engine({
    extname: 'hbs'
}));
app.set('view engine', 'hbs');
app.set('views', './src/views');

app.get("/login", (req, res) => {
    res.render("input-form", {
        css: "base",
        action: "/login",
        submitText: "SIGN IN",
        altLink: { href: "/register", text: "REGISTER" },
        fields: [
            { name: "login", label: "login", type: "login", autocomplete: "login", required: true },
            { name: "password", label: "password", type: "password", autocomplete: "password", required: true },
        ],
    });
});

app.post('/login', (req, res) => {
    const { login, password } = req.body;
    res.send(`Логин: ${login}, Пароль: ${password}`);
});

app.get("/register", (req, res) => {
    res.render("input-form", {
        css: "base",
        action: "/register",
        submitText: "REGISTER",
        altLink: { href: "/login", text: "SIGN IN" },
        fields: [
            { name: "email", label: "email", type: "email", autocomplete: "email", required: true },
            { name: "phone", label: "phone", type: "phone", autocomplete: "phone", required: true },
            { name: "first-name", label: "first name", type: "first-name", autocomplete: "first-name", required: true },
            { name: "second-name", label: "second name", type: "second-name", autocomplete: "second-name", required: true },
            { name: "login", label: "login", type: "login", autocomplete: "login", required: true },
            { name: "password", label: "password", type: "password", autocomplete: "password", required: true },
            { name: "repeat-password", label: "repeat password", type: "password", autocomplete: "repeat-password", required: true },
        ],
    });
});

app.get('/chats', (req, res) => {
    res.send('Тут будут чаты');
});

app.get("/settings", (req, res) => {
    const user = {
        email: "example@mail.ru",
        phone: "+7 (123) 456-78-90",
        login: "login",
        firstName: "FirstName",
        secondName: "SecondName",
    };

    res.render("input-form", {          // <-- твой шаблон формы
        css: "base",             // можно и base если не хочешь отдельный
        title: null,
        subtitle: null,
        action: "/settings",
        submitText: "SAVE",
        backHref: "/",
        avatar: true,

        fields: [
            { name: "email", label: "email", type: "email", autocomplete: "email", required: true, value: user.email},
            { name: "phone", label: "phone", type: "phone", autocomplete: "phone", required: true, value: user.phone},
            { name: "login", label: "login", type: "login", autocomplete: "login", required: true, value: user.login},
            { name: "first-name", label: "first name", type: "first-name", autocomplete: "first-name", required: true, value: user.firstName},
            { name: "second-name", label: "second name", type: "second-name", autocomplete: "second-name", required: true, value: user.secondName},
            { name: "password", label: "password", type: "password", autocomplete: "password", required: true, value: ""},
            { name: "repeat-password", label: "repeat password", type: "password", autocomplete: "repeat-password", required: true, value: ""},
        ],
    });
});

app.get("/404", (req, res) => {
    res.status(404).render("error-page", {
        css: "error-page",
        code: 404,
        title: "Not Found",
        imageUrl: "/images/errors/404.jpg",
        backHref: req.get("Referrer") || "/",
        line1: "Not",
        line2: "Found",
        line3: "",          // можно пустую строку
        message: ""         // опционально
    });
});

app.get("/500", (req, res) => {
    res.status(500).render("error-page", {
        css: "error-page",
        code: 500,
        title: "Internal Server Error",
        imageUrl: "/images/errors/500.jpg",
        backHref: req.get("Referrer") || "/",
        line1: "Internal",
        line2: "Server",
        line3: "Error",
        message: ""
    });
});


app.listen(3000, () => {
    console.log('http://localhost:3000/');
});
