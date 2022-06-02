module.exports.ensureAuthenticated = function (req, res, next) {
	// var URL = req.originalUrl;
	// console.log(URL);
	res.locals.current_user = req.user;
	if(req.isAuthenticated()){
		if (req.user.status == true && req.user.userRole == 'basic') {
	    next();
	  } else {
		req.flash("message", "You cannot visit your profile without logging in");
	    res.redirect("/users/login");
	  }
	} else {
		req.flash("message", "You are not logged in");
		res.redirect("/users/login");
	}
};