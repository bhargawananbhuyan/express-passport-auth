require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const { connect } = require("mongoose");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/User");
const { compare } = require("bcryptjs");

(async () => {
	const app = express();
	const port = process.env.PORT || 5000;

	// set views config
	app.set("view engine", "ejs");
	app.set("views", path.join(__dirname, "views"));

	// connect to database
	try {
		await connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("connected to database...");
	} catch (error) {
		console.log(error);
	}

	// parse json
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	// set session and connect flash
	app.use(cookieParser("appcookiesecret"));
	app.use(
		session({
			secret: "appsessionsecret",
			saveUninitialized: true,
			resave: true,
			cookie: {
				maxAge: 1000 * 60 * 60,
				sameSite: "strict",
			},
		})
	);
	app.use(flash());

	// setup passport
	app.use(passport.initialize());
	app.use(passport.session());
	// set strategy for passport to use
	passport.use(
		new LocalStrategy(
			{ usernameField: "email" },
			async (email, password, done) => {
				const user = await User.findOne({ email });
				if (!user) return done(null, false, { message: "user not found" });
				const isValidPassword = await compare(password, user.password);
				if (!isValidPassword)
					return done(null, false, { message: "incorrect password" });
				return done(null, user);
			}
		)
	);
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});
	passport.deserializeUser((id, done) => {
		User.findById(id, (err, user) => {
			done(err, user);
		});
	});

	// set global vars
	app.use((req, res, next) => {
		res.locals.successMsg = req.flash("successMsg");
		res.locals.errorMsg = req.flash("errorMsg");
		res.locals.error = req.flash("error");
		next();
	});

	// routes
	app.use("/auth", require("./routes/auth"));

	app.listen(port, () => {
		console.log(`server started on port ${port}...`);
	});
})();
