const jwt = require('jsonwebtoken')
const userModel = require('../models/user-model')
module.exports = async (req, res, next) => {
    if (!req.cookies.token) {
        req.flash("Error", "You need to first login In")  //req.flash() is method of connect-flash middleware to store temporary messagr like Error, Success in the session so taht it cab be retrived in templating engine like ejs
        return res.redirect('/users/login') //on redirected route, we can also access flash message-> see page for ex-> '/' route of index.js 
    }
    //if tokeken exist 
    try {
        let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY)
        let user = await userModel.findOne({ email: decoded.email }).select("-password") //removing pssword info by user by .select("-password")
        req.user = user;
        next()
    }catch(err){
        req.flash("Error", "Something went wrong")
        res.redirect("/users/login")
    }
    
}