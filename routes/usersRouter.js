const express = require('express')
const router = express.Router();
const {userRegistration, loginUser,logoutUser} = require('../controllers/authControllers');
const userModel = require('../models/user-model');
const orderModel = require('../models/order-model');
const isLoggedIn = require('../middlewares/isLoggedIn');
router.get('/', (req, res) => {
    res.send("hey, everything is working perfectally")
})
router.get('/account',isLoggedIn, async(req,res)=>{
    let user = await userModel.findOne({email:req.user.email})
    res.render('account',{user}) //here 2nd argument is expected as dataObject, hence passed {user} <=>{user:user}
})
router.get('/orders',isLoggedIn, async(req,res)=>{
    let ordersData = await orderModel.find({user:req.user._id}).populate('orders.product')
    // console.log(ordersData[0].orders[0].product.image)
    res.render('orders',{ordersData})
})
//test this route with postman in body -> urlencoded form using post method
router.post('/register',userRegistration)
router.post('/login',loginUser)
router.get('/logout',logoutUser)
module.exports = router;