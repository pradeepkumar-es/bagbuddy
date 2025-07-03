const userModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../utils/generateToken') //“From the exported object, give me the generateToken function.”
module.exports.userRegistration = async (req, res) => {
    // ⚠️ If a required field like `fullName` is missing in the frontend form,
    // MongoDB will still create the user with `fullName` as undefined (or blank) unless validation is enforced in the schema.
    //becaue MongoDB is Schema less , it does not care about you have send any details or not

    // ⚠️ However, if the frontend sends `fullName` and you forget to destructure it here,
    // your backend code may crash or behave unexpectedly (e.g., saving undefined or throwing an error).
    try {
        let { email, password, fullName } = req.body

        //code tht will not allow the user to create another account based on email if already created account from that email 
        let user = await userModel.findOne({ email })
        if (user) return res.status(401).send("You already have account, please login") //401: unauthorized access //indicates that the server requires authentication but the client has not provided valid credentials

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                let user = await userModel.create({
                    email,
                    password: hash,
                    fullName
                })
                let token = generateToken(user)
                res.cookie("token", token)
                req.session.user = user;
                res.redirect("/")
            })
        })
    } catch (err) {
        console.log(err.message)
        res.status(500).send("Error creating user account")
    }

}

module.exports.loginUser = async (req, res) => {
    let { email, password } = req.body;
    let user = await userModel.findOne({ email })
    if (!user) return res.status(401).send("email or password are incorrect")
    bcrypt.compare(password, user.password, (err, result) => {
    //if result is true
    if(result){
        let token = generateToken(user)
        res.cookie('token', token)
        // After successful authentication
req.session.user = user; // user is the user object from DB
        // res.send("you can login")
        res.redirect('/')
    }else{
        return res.send("email or password are incorrect")
    }
    })
}

module.exports.logoutUser = (req, res)=>{
    res.cookie("token", " ");
    req.session.user ='';
    res.redirect('/')
}