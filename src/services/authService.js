module.exports.ensureAuthenticated = function (req, res, next) {
	var URL = req.originalUrl;
	res.locals.controllerName = "";
	if (URL !== "" && URL !== null){
		var temp = URL.substr(1);
		var controllerName = "";
		if (temp.indexOf('/') !== -1){
			controllerName = temp.substring(0, temp.indexOf('/'));
		}else if (temp.indexOf('?') !== -1){
			controllerName = temp.substring(0, temp.indexOf('?'));
		}else{
			controllerName = temp;
		}
		if(controllerName){
			res.locals.controllerName = controllerName;
		}
	}
	res.locals.projectId = "";
	res.locals.projectName = "";
	res.locals.projectUrl = "";
	res.locals.completionStatus = req.session.projectUrl;
	if(req.session.projectId){
		res.locals.projectId = req.session.projectId;
		res.locals.projectName = req.session.projectName;
		res.locals.projectUrl =  req.session.projectUrl;
		res.locals.projectStatus = req.session.projectStatus
	}
	res.locals.current_user = req.user;
	if(req.isAuthenticated()){
		if (req.user.status == true) {
	    next();
	  } else {
	    res.redirect("/");
	  }
	} else {
		res.redirect("/");
	}
};
