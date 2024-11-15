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
const fs = require("fs");

// Register the 'eq' helper
hbs.registerHelper("eq", function(a, b) {
    return a === b;
});

// Register the 'getTypeClass' helper
hbs.registerHelper("getTypeClass", function(typeId) {
    if (typeId === "Saber") {
        return "text-danger"; // Merah
    } else if (typeId === "Archer") {
        return "text-success"; // Hijau
    } else if (typeId === "Lancer") {
        return "text-primary"; // Biru
    } else if (typeId === "Rider") {
        return "text-warning"; // Orange
    } else if (typeId === "Caster") {
        return "text-white"; // Putih
    } else {
        return "";
    }
});

// Set view engine and middleware
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "./src/views"));
app.use("/assets", express.static(path.join(__dirname, "./src/assets")));
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));
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
app.get("/detail-hero/:id", detailHero);
app.get("/edit-hero/:id", editHero);

app.post("/add-hero", upload.single("image"), addHeroPost);
app.post("/register", registerPost);
app.post("/add-type", addTypePost);
app.post("/login", loginPost);
app.post("/logout", logout);
app.post("/delete-hero/:id", deleteHero);
app.post("/edit-hero/:id", upload.single("image"), editHeroPost);

async function home(req, res) {
    const query = `SELECT heroes_tb.*, type_tb.name AS type_id FROM heroes_tb LEFT JOIN type_tb ON heroes_tb.type_id = type_tb.id`;
    let heroes = await sequelize.query(query, { type: QueryTypes.SELECT });
    const user = req.session.user;
    res.render("home", { heroes, user });
}

async function editHero(req, res) {
    const { id } = req.params;
    const user = req.session.user;

    // Query to get the hero to be edited
    const query = `SELECT * FROM heroes_tb WHERE id = :id`;
    const hero = await sequelize.query(query, {
        replacements: { id },
        type: QueryTypes.SELECT,
    });

    // If hero not found, redirect with error message
    if (hero.length === 0) {
        req.flash("error", "Hero not found.");
        return res.redirect("/");
    }

    // Check if the logged-in user is the owner of the hero
    if (hero[0].users_id !== user.id) {
        req.flash("error", "Maaf, Tetapi kamu bukan pemilik hero ini.");
        return res.redirect("/");
    }

    // Get types for dropdown
    const types = await sequelize.query("SELECT * FROM type_tb", {
        type: QueryTypes.SELECT,
    });

    // Render edit form with hero data and types
    res.render("edit-hero", { hero: hero[0], types });
}

async function editHeroPost(req, res) {
    const { id } = req.params;
    const { name, heroType } = req.body;
    const user = req.session.user;

    // Query to get the hero
    const query = `SELECT * FROM heroes_tb WHERE id = :id`;
    const hero = await sequelize.query(query, {
        replacements: { id },
        type: QueryTypes.SELECT,
    });

    // If hero not found, redirect with error message
    if (hero.length === 0) {
        req.flash("error", "Hero not found.");
        return res.redirect("/");
    }

    // Check if the logged-in user is the owner of the hero
    if (hero[0].users_id !== user.id) {
        req.flash("error", "Maaf, Tetapi kamu bukan pemilik hero ini.");
        return res.redirect("/");
    }

    // Proceed with updating the hero
    let imagePath = req.file ? req.file.path : hero[0].photo; // Keep existing photo if no new one is uploaded

    // Ambil data blog untuk mendapatkan path gambar
    const getBlogQuery = `SELECT photo FROM heroes_tb WHERE id=${id}`;
    const heroImg = await sequelize.query(getBlogQuery, {
        type: QueryTypes.SELECT,
    });

    if (heroImg.length > 0) {
        // Hapus file gambar jika ada
        const imagePath = heroImg[0].photo;
        if (imagePath) {
            // Hapus file secara asynchronous
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.log("Error deleting image:", err);
                } else {
                    console.log("Image deleted successfully");
                }
            });
        }
    }

    const updateQuery = `UPDATE heroes_tb SET name = :name, type_id = :heroType, photo = :photo WHERE id = :id`;
    await sequelize.query(updateQuery, {
        replacements: { name, heroType, photo: imagePath, id },
        type: QueryTypes.UPDATE,
    });

    req.flash("success", "Hero updated successfully!");
    res.redirect("/"); // Redirect to the appropriate page
}

async function detailHero(req, res) {
    const { id } = req.params;
    const user = req.session.user;
    const query = `
    SELECT heroes_tb.*, type_tb.*, users_tb.*, heroes_tb.name AS servant
    FROM heroes_tb 
    LEFT JOIN type_tb ON heroes_tb.type_id = type_tb.id
    LEFT JOIN users_tb ON heroes_tb.users_id = users_tb.id
    WHERE heroes_tb.id = :id
  `;
    let hero = await sequelize.query(query, {
        replacements: { id },
        type: QueryTypes.SELECT,
    });

    if (hero.length === 0) {
        req.flash("error", "Hero not found.");
        return res.redirect("/");
    }

    res.render("detail-hero", { user, hero: hero[0] });
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

    // Menyimpan informasi pengguna dalam sesi, termasuk hak akses
    req.flash("success", "Login Berhasil");
    req.session.user = {
        id: user[0].id,
        username: user[0].username,
    };
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

async function addHero(req, res) {
    const user = req.session.user;

    // Ambil data type dari database
    const types = await sequelize.query("SELECT * FROM type_tb", {
        type: QueryTypes.SELECT,
    });

    // Kirim data ke template
    res.render("add-hero", { user, types });
}

async function addHeroPost(req, res) {
    const { name, heroType } = req.body;
    const { id } = req.session.user;

    const imagePath = req.file.path;

    const query = `
    INSERT INTO heroes_tb(name, type_id, photo, users_id) 
    VALUES('${name}', '${heroType}', '${imagePath}', '${id}')
  `;

    await sequelize.query(query, { type: QueryTypes.INSERT });
    req.flash("success", "Hero Berhasil Ditambahkan");

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

async function deleteHero(req, res) {
    const { id } = req.params;
    const user = req.session.user;

    // Log ID that will be deleted
    console.log(`Attempting to delete hero with ID: ${id}`);

    // Check if the hero exists
    const getHeroQuery = `SELECT * FROM heroes_tb WHERE id = :id`;
    const hero = await sequelize.query(getHeroQuery, {
        replacements: { id },
        type: QueryTypes.SELECT,
    });

    if (hero.length === 0) {
        req.flash("error", "Hero not found.");
        return res.redirect("/");
    }

    // Check if the logged-in user is the owner of the hero
    if (hero[0].users_id !== user.id) {
        req.flash("error", "Maaf, Tetapi kamu bukan pemilik hero ini.");
        return res.redirect("/");
    }

    // Ambil data blog untuk mendapatkan path gambar
    const getBlogQuery = `SELECT photo FROM heroes_tb WHERE id=${id}`;
    const heroImg = await sequelize.query(getBlogQuery, {
        type: QueryTypes.SELECT,
    });

    if (heroImg.length > 0) {
        // Hapus file gambar jika ada
        const imagePath = heroImg[0].photo;
        if (imagePath) {
            // Hapus file secara asynchronous
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.log("Error deleting image:", err);
                } else {
                    console.log("Image deleted successfully");
                }
            });
        }
    }

    // Proceed to delete the hero
    const deleteQuery = `DELETE FROM heroes_tb WHERE id = :id`;
    await sequelize.query(deleteQuery, {
        replacements: { id },
        type: QueryTypes.DELETE,
    });

    req.flash("success", "Hero deleted successfully!");
    res.redirect("/");
}

app.listen(port, () => {
    console.log(`Server is Running on port ${port}`);
});