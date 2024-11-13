const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const hbs = require("hbs");
const config = require("./config/config.json");
const { Sequelize, QueryTypes } = require("sequelize");
const upload = require("./src/middlewares/upload-file");
const sequelize = new Sequelize(config.development);
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");

// Set view engine and middleware
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "./src/views"));
app.use("/assets", express.static(path.join(__dirname, "./src/assets")));
app.use(express.urlencoded({ extended: true }));

app.use(flash());
app.use(
    session({
        name: "my-session",
        secret: "rahasiabangetdehjangansampaiadayangtahu",
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 60 * 24, // 1 hari
        },
    })
);

app.get("/", home);
app.get("/add-hero", addHero);
app.get("/add-type", addType);
app.get("/register", register);
app.get("/login", login);

app.post("/add-hero", addHeroPost);
app.post("/register", registerPost);
app.post("/add-type", addTypePost);
app.post("/login", loginPost);
app.post("/logout", logout);

function home(req, res) {
    const user = req.session.user;
    res.render("home", { user });
}

function login(req, res) {
    res.render("login");
}

async function loginPost(req, res) {
    const { email, password } = req.body;

    // Verifikasi Email
    const query = `SELECT * FROM users_tb WHERE email='${email}'`;
    const user = await sequelize.query(query, { type: QueryTypes.SELECT });

    if (!user.length) {
        req.flash("error", "Email / Password Salah");
        return res.redirect("/login");
    }

    // Verifikasi Password
    const isPasswrodMatch = await bcrypt.compare(password, user[0].password);
    if (!isPasswrodMatch) {
        req.flash("error", "Email / Password Salah");
        return res.redirect("/login");
    }

    req.flash("success", "Login Berhasil");
    req.session.user = user[0];
    res.redirect("/");
}

function register(req, res) {
    res.render("register");
}

async function registerPost(req, res) {
    const { username, email, password } = req.body;
    const salt = 10;
    const hashPassword = await bcrypt.hash(password, salt);

    const query = `INSERT INTO users_tb(username,email,password) VALUES('${username}','${email}','${hashPassword}') `;
    await sequelize.query(query, { type: QueryTypes.INSERT });

    res.redirect("login");
}

function logout(req, res) {
    req.session.destroy((err) => {
        if (err) return console.log("Logout Gagal");
        console.log("Logout Berhasil");
        res.redirect("/");
    });
}

function addHero(req, res) {
    const user = req.session.user;
    res.render("add-hero", { user });
}

async function addHeroPost(req, res) {
    const { name } = req.body;

    const query = `INSERT INTO heroes_tb(name,type_id,photo,users_id) VALUES('${name}', '6', 'https://static.wikia.nocookie.net/fategrandorder/images/2/23/S002A3Icon.webp/revision/latest?cb=20221103085314','5') `;
    await sequelize.query(query, { type: QueryTypes.INSERT });

    res.redirect("/add-hero");
}

function addType(req, res) {
    const user = req.session.user;
    res.render("add-type", { user });
}

async function addTypePost(req, res) {
    const { type } = req.body;

    const query = `INSERT INTO type_tb(name) VALUES('${type}') `;
    await sequelize.query(query, { type: QueryTypes.INSERT });

    res.redirect("add-type");
}

app.listen(port, () => {
    console.log(`Server is Running on port ${port}`);
});