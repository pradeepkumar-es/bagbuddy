const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const orderModel = require("../models/order-model");

router.get("/users/login", (req, res) => {
  let error = req.flash("Error"); //exttracted Error flash message from  isLoggedIn error part by redirecting on it
  // res.render('index', { error, loggedin: false }); //sending this error message to index.ejs page
  res.render("index", { error }); //sending this error message to index.ejs page
  //sending loggedin:false show that control the visibilty of some nav link based on authentication
});

//protected route by middleware isLoggedIn
// router.get('/', isLoggedIn, async (req, res) => {
router.get("/", async (req, res) => {
  let products = await productModel.find();
  if (req.query.filter === "discounted") {
    products = products.filter((product) => product.discount > 0);
  }
  let success = req.flash("success"); //retriving flash mesage from '/addtocart/:productid'
  res.render("shop", { products, success }); //sending success flash mesage to shop.ejs
  // res.send("shop page")
});

router.get("/discounted-products", async (req, res) => {
  let products = await productModel.find();
  let productsByDiscount = products.filter((product) => product.discount > 0);
  let success = req.flash("success");
  res.render("shop", { productsByDiscount, success });
});

router.get("/addtocart/:productid", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  //only allow to add as new if that product is not added before
  let productInCart = user.cart.find((item) => {
    return item.product && item.product.toString() === req.params.productid;
    //If product is falsy (null, undefined, etc.), it immediately returns false and skips the rest.
    //null, or undefined thing may be through databse edit, or some error
  });
  //do not use here forEach bcz its keep looping even condition is met
  //forEach will also not work when we want async/await, redirect, break, return inside
  // console.log(productInCart.toString());
  //   let userInDetail = await userModel
  //     .findOne({ email: req.user.email })
  //     .populate("cart.product");
  //   // console.log("detail:", userInDetail);
  //   let productIndex = user.cart.findIndex((item) => item == productInCart);
  //   // console.log("productindex: ",productIndex)
  if (productInCart) {
    productInCart.quantity += 1;
    // console.log("quantity:",userInDetail.cart[productIndex].quantity )
    req.flash("success", "one more Added to cart");
  } else {
    user.cart.push({ product: req.params.productid, quantity: 1 });
    req.flash("success", "Added to cart");
  }
  await user.save();
  res.redirect("/"); //now we can access the value of success flash message at 'shop' ejs
  //and always redirect only once
});

router.get("/buy/:productid", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  //only allow to add as new if that product is not added before
  let productInCart = user.cart.find((item) => {
    return item.product && item.product.toString() === req.params.productid;
    //If product is falsy (null, undefined, etc.), it immediately returns false and skips the rest.
    //null, or undefined thing may be through databse edit, or some error
  });
  if (productInCart) {
    productInCart.quantity += 1;
    // console.log("quantity:",userInDetail.cart[productIndex].quantity )
    req.flash("success", "one more Added to cart");
  } else {
    user.cart.push({ product: req.params.productid, quantity: 1 });
    req.flash("success", "Added to cart");
  }
  await user.save();
  res.redirect("/cart"); //now we can access the value of success flash message at 'cart' ejs
  //and always redirect only once
});

router.get("/cart", isLoggedIn, async (req, res) => {
  let error = req.flash("Error");
  let success = req.flash("success");
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("cart.product"); //making only id of the product in cart to all details of product in cart

  let totalProductPrice = 0;
  let totalDiscount = 0;
  user.cart.forEach((item) => {
    if (item.product) {
      totalProductPrice += item.product.price * item.quantity;
      totalDiscount += item.product.discount * item.quantity;
    }
  });
  // console.log(totalProductPrice)
  //   console.log(user.cart.length);
  res.render("cart", {
    user,
    success,
    error,
    totalProductPrice,
    totalDiscount,
  });
});

router.get("/addquantity/:productid", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  let selectedItem = user.cart.find((item) => {
    return item.product.toString() == req.params.productid;
  });
  if (selectedItem) {
    selectedItem.quantity += 1;
    await user.save();
    req.flash("success", "quantity increased");
  } else {
    req.flash("Error", "something went wrong");
  }
  res.redirect("/cart");
});

router.get("/minusquantity/:productid", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  let selectedItem = user.cart.find((item) => {
    return item.product.toString() == req.params.productid;
  });
  if (selectedItem && selectedItem.quantity > 1) {
    selectedItem.quantity -= 1;
    req.flash("success", "1 quantity decreased");
  } else {
    //remove the item if quantity is 1 or 0 when this
    user.cart = user.cart.filter(
      (item) => item.product.toString() !== req.params.productid
    );
    req.flash("Error", "item is removed from cart");
  }
  await user.save();
  res.redirect("/cart");
});
router.get("/success", isLoggedIn, async (req, res) => {
  const user = await userModel
    .findOne({ email: req.user.email })
    .populate("cart.product");
  // console.log(user.cart)
  function calculateAmount(itemsArray) {
    let totalAmount = 0;
    itemsArray.forEach((item) => {
      totalAmount +=
        item.product.price * item.quantity -
        item.product.discount * item.quantity;
    });
    // console.log(totalAmount);
    return totalAmount;
  }
  const order = orderModel.create({
    user: user._id,
    orders: user.cart,
    totalAmount: calculateAmount(user.cart),
  });
  user.cart = []; //clean user's cart
  await user.save();
  req.flash("successStatus", "Payment Successfull, and Oredered placed");
  res.redirect("/users/orders");
});
router.get("/cancel", (req, res) => {
  req.flash("cancel", "Payment Failed");
  res.redirect("/cart");
});
module.exports = router;
