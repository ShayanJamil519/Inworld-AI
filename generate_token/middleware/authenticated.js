module.exports = function (req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.user) {
        console.log(req.user)
        next();
    }
    // if they aren't redirect them to the login page
    else {
        next()
    }
};