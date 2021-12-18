const router = require("express").Router();
const { genSalt, hash } = require("bcryptjs");
const passport = require("passport");
const User = require("../models/User");
const { ensureAuth } = require("../utils/auth");

router.get("/register", (_, res) => {
	res.render("register", _, (err, html) => {
		err ? console.log(err) : res.send(html);
	});
});

router.post("/register", async (req, res) => {
	const { fullName, email, password } = req.body;

	const isExistingUser = await User.findOne({ email });

	if (isExistingUser) {
		req.flash("errorMsg", "user already exists");
		return res.redirect("/auth/register");
	}

	const newUser = new User({ fullName, email, password });

	try {
		const salt = await genSalt(10);
		newUser.password = await hash(password, salt);
		await newUser.save();
		req.flash("successMsg", "user registered successfully");
		return res.redirect("/auth/login");
	} catch (error) {
		req.flash("errorMsg", error.message);
		return res.redirect("/auth/register");
	}
});

router.get("/login", (_, res) => {
	res.render("login", _, (err, html) => {
		err ? console.log(err) : res.send(html);
	});
});

router.post("/login", (req, res, next) => {
	passport.authenticate("local", {
		successRedirect: "/auth/dashboard",
		failureRedirect: "/auth/login",
		failureFlash: true,
	})(req, res, next);
});

router.get("/dashboard", ensureAuth, (req, res, next) => {
	res.render("dashboard", { user: req.user }, (err, html) => {
		err ? console.log(err) : res.send(html);
	});
});

module.exports = router;
