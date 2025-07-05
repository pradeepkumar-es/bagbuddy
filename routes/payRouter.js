const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const isLoggedIn = require("../middlewares/isLoggedIn");
const userModel  =require('../models/user-model');
// const {fileTypeFromBuffer} = require('file-type');
//we can also do 
/*
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
*/
router.post('/payment-checkout',isLoggedIn, async (req, res)=>{
    try{
    console.log('payment checking')
    const user = await userModel.findOne({email: req.user.email}).populate("cart")
    // console.log(user.cart)//will give array of products
    const lineItems = user.cart.map((product)=>{ //lineItems is an array with all order data
    // const lineItems = user.cart.map(async(product)=>{ //lineItems is an array with all order data
        // const mime = await fileTypeFromBuffer(product.image);
        // const base64 = product.image.toString('base64') //converting buffer(binary data) into base64-encoded string which convert into text string
        // const imageUrl = `data:${mime?.mime};base64,${base64}`;////?. optional chaining used when we want to check something only if exist underwise return undefined without throwing en error
       return { //returning object, formt is of stripe format, it must be same
        price_data:{
                currency:'inr',
                product_data:{
                    name:product.name,
                    images:['https://evek.one/4432-large_default/test.jpg'] //stripe only allow publically accessable url
                },
                unit_amount:product.price*100 //(amout in paise)
            },
            quantity:1, //do the dynamic when allow multiple time addition
        }
    })
        const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items:lineItems,
        mode:'payment',
        success_url:`${req.headers.origin}/success`, //req.headers.origin represent orifin of incoming http request (ie. domain url -> https:localhost:3000)
        cancel_url:`${req.headers.origin}/cancel`
    })
    return res.redirect(303,session.url);
    }catch(err){
        req.flash("Error", "Payment Failed")
        res.redirect('/cart')
    }
})
module.exports = router