const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const hbs = require("hbs");

// Set view engine and middleware
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "./src/views"));
app.use("/assets", express.static(path.join(__dirname, "./src/assets")));
app.use(express.urlencoded({ extended: true }));

app.get("/", home);
app.get("/add-hero", addHero);
app.get("/add-type", addType);
app.get("/register", register);
app.get("/login", login);

function home(req, res) {
    res.render("home");
}

function addHero(req, res) {
    res.render("add-hero");
}

function addType(req, res) {
    res.render("add-type");
}

function register(req, res) {
    res.render("register");
}

function login(req, res) {
    res.render("login");
}

app.listen(port, () => {
    console.log(`Server is Running on port ${port}`);
});