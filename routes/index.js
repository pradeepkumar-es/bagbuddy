const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middlewares/isLoggedIn');
const productModel = require('../models/product-model');
const userModel = require('../models/user-model');

router.get('/users/login', (req, res) => {
    let error = req.flash("Error"); //exttracted Error flash message from  isLoggedIn error part by redirecting on it
    // res.render('index', { error, loggedin: false }); //sending this error message to index.ejs page
    res.render('index', { error }); //sending this error message to index.ejs page
    //sending loggedin:false show that control the visibilty of some nav link based on authentication
})

//protected route by middleware isLoggedIn
// router.get('/', isLoggedIn, async (req, res) => {
router.get('/', async (req, res) => {
    let products = await productModel.find();
    let success = req.flash('success') //retriving flash mesage from '/addtocart/:productid'
    res.render('shop', { products, success }); //sending success flash mesage to shop.ejs
    // res.send("shop page")
})

router.get('/addtocart/:productid', isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email })
    //only allow to add as new if that product is not added before
    let productInCart = user.cart.find(product => {
        return product && product.toString() === req.params.productid;
        //If product is falsy (null, undefined, etc.), it immediately returns false and skips the rest.
        //null, or undefined thing may be through databse edit, or some error
    })
    //do not use here forEach bcz its keep looping even condition is met
    //forEach will also not work when we want async/await, redirect, break, return inside

    if (productInCart) {
        req.flash("success", "already Added to cart");
    } else {
        user.cart.push(req.params.productid)
        await user.save();
        req.flash("success", "Added to cart");
    }
    res.redirect('/') //now we can access the value of success flash message at '/shop'
    //and always redirect only once 
})

router.get('/cart', isLoggedIn, async (req, res) => {
    let user = await userModel
        .findOne({ email: req.user.email })
        .populate("cart") //making only id of the product in cart to all details of product in cart

    let totalProductPrice = 0;
    let totalDiscount = 0;
    user.cart.forEach((item) => {
        totalProductPrice += item.price
        totalDiscount += item.discount
    })
    // console.log(totalProductPrice)
    console.log(user.cart.length)
    res.render('cart', { user, totalProductPrice, totalDiscount })
})
module.exports = router