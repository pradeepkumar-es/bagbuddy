const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const db = require("./config/mongoose-connection");
const ownersRouter = require("./routes/ownersRouter");
const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");
const indexRouter = require("./routes/index");
const payRouter = require("./routes/payRouter")
const expressSession = require("express-session");
const flash = require("connect-flash");
const jwt = require("jsonwebtoken");
require("dotenv").config(); //it loads .env file contents(envirnomental variable) in process.env

// Middleware to parse incoming request bodies (JSON and form data) so they are readable by the server
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Middleware to serve static files from the 'public' directory by joining it with the current directory path
app.use(express.static(path.join(__dirname, "public")));

//middleware to parse to cookies
app.use(cookieParser());

//middleware to create session for user- must be **before** routes and flash
app.use(
  expressSession({
    secret: process.env.EXPRESS_SESSION_SECRET, //Used to sign session ID cookie for security.
    // secret:'secret', //Used to sign session ID cookie for security. //recommended to always use .env variable as above
    resave: false, //do not save again and again if session is not modified to avoid unnecessary writes to database/memory
    saveUninitialized: false, //This only saves the session if you store something in it (e.g., user logs in).
    /*
    saveUninitialized: true
    This saves every new session, even if it's empty (not used yet).
    That means a cookie is sent to the user's browser immediately, even before they log in or do anything.
     */
    cookie:{
      secure:false //must be false for HTTP dev
    }
  })
);

//Flash middleware — must be **after** session
//This line adds the flash message middleware to your Express app using the connect-flash package.
app.use(flash());

//one-time configuration to tell express to use EJS for rendering views
app.set("view engine", "ejs");

//now no need of 

app.use((req, res, next) => {
  res.locals.loggedin = !!req.session.user; //to set loggedin variable status as boolean value to all ejs file automatically
  res.locals.successStatus = req.flash("successStatus"); //make variable available in all ejs file to avoid undefined without waiting to pass through res.send() after certain information
  res.locals.cancel = req.flash("cancel");
  // res.locals.success = req.flash("success")
  next();
});

//middleware to mounts (organize) a router module (ex. ownersRouter) at the path /owners.
app.use("/owners", ownersRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/", indexRouter);
app.use("/", payRouter);
//we can also use: app.use('/api',payRouter) instead of app.use('/',payRouter)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

