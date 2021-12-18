// make sure that users are authenticated
module.exports.ensureAuth = (req, res, next) => {
	if (req.isAuthenticated()) return next();
	req.flash("errorMsg", "please login to continue");
	return res.redirect("/auth/login");
};
