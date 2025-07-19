const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken"); //“From the exported object, give me the generateToken function.”
module.exports.userRegistration = async (req, res) => {
  // ⚠️ If a required field like `fullName` is missing in the frontend form,
  // MongoDB will still create the user with `fullName` as undefined (or blank) unless validation is enforced in the schema.
  //becaue MongoDB is Schema less , it does not care about you have send any details or not

  // ⚠️ However, if the frontend sends `fullName` and you forget to destructure it here,
  // your backend code may crash or behave unexpectedly (e.g., saving undefined or throwing an error).
  try {
    let { email, password, fullName } = req.body;

    //code tht will not allow the user to create another account based on email if already created account from that email
    let user = await userModel.findOne({ email });
    if (user) {
      req.flash("Error", "You already have account, please login");
      return res.redirect("/users/login");
    }

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        let user = await userModel.create({
          email,
          password: hash,
          fullName,
        });
        let token = generateToken(user);
        res.cookie("token", token, {
          httpOnly: true, //not accessible via JS
          secure: false, //set True in Production with HTTPS
          /*
                    httpOnly:true -> make the cookie inaccessible to javascript running in the browser(can not accessed via documen.cookie)
                    purpose: it prevent XSS attackes (cross site scripting), where attackers try to steal cookies via injected scripts
                    secure:true -> cookie is only sent over https connection (encrypted)
                    purpose: to prevent cookie theft on unencrypted (http) connections 
                    */
        });
        req.session.user = user;
        req.flash(
          "success",
          "Congratulations! Your Account Created Successfully"
        );
        res.redirect("/");
      });
    });
  } catch (err) {
    req.flash("Error", "Error creating user account");
    res.redirect("/users/login");
  }
};

module.exports.loginUser = async (req, res) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) {
    req.flash("Error", "email or password are incorrect");
    return res.redirect("/users/login");
  }
  bcrypt.compare(password, user.password, (err, result) => {
    //if result is true
    if (result) {
      let token = generateToken(user);
      res.cookie("token", token, {
        httpOnly: true, //not accessible via js
        secure: false, //update it to true when in production
      });
      // After successful authentication
      req.session.user = user; // user is the user object from DB
      // res.send("you can login")
      req.flash("success", "LoggedIn Successfully");
      res.redirect("/");
    } else {
      req.flash("Error", "email or password are incorrect");
      return res.redirect("/users/login");
    }
  });
};

module.exports.logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false, // update it to true in production
  });
  req.session.user = "";
  req.flash("success", "Logged Out Successfully");
  res.redirect("/");
};
module.exports.updatePassword = async (req, res) => {
  let { oldPassword, newPassword, confirmPassword } = req.body;
  //since, here we can not use isLoggedIn middlware, hence here we will use jwt verification to get current user detail from there local machine cookie
  try {
    let decodedinfo = jwt.verify(req.cookies.token, process.env.JWT_KEY);
    // console.log(decodedinfo);
    let user = await userModel.findOne({ email: decodedinfo.email });
    bcrypt.compare(oldPassword, user.password, (err, result) => {
      if (result) {
        // console.log("matched");
        //if result matched, then proceed for nwe password changing
        if(newPassword==confirmPassword){
            //1st change new password in the form of hash then update it to database
            bcrypt.genSalt(10, (err, salt)=>{
                bcrypt.hash(newPassword, salt, (err, hash)=>{
                    user.password=hash;
                    user.save();
                    req.flash("success", "Pasword updated successfully")
                    res.redirect('/users/account')
                })
            })
        }else{
            req.flash("Error", "new Passord is not same as confirmed Password")
            res.redirect('/users/account')
        }
      }else{
        req.flash("Error", "old password is incorrect")
        res.redirect('/users/account')
      }
    });
  } catch (e) {
    req.flash("Error", e)
    res.redirect('/users/account')
  }
};
