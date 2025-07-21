const express = require('express')
const router = express.Router();
const {userRegistration, loginUser,logoutUser, updatePassword, updateProfile} = require('../controllers/authControllers');
const userModel = require('../models/user-model');
const orderModel = require('../models/order-model');
const isLoggedIn = require('../middlewares/isLoggedIn');
const upload = require('../config/multer-config')
router.get('/', (req, res) => {
    res.send("hey, everything is working perfectally")
})
router.get('/account',isLoggedIn, async(req,res)=>{
    let success = req.flash("success");
    let error = req.flash("Error");
    let user = await userModel.findOne({email:req.user.email})
    res.render('account',{user, success, error}) //here 2nd argument is expected as dataObject, hence passed {user} <=>{user:user}
})
router.post('/update-profile',isLoggedIn, upload.single('image'), async(req, res)=>{
    let {name, email, contact} = req.body;
    let user = await userModel.findOne({email:req.user.email});
    // console.log(user)
    // console.log(name)
    //if we do not upload any file, then multer will not set req.file at all which lead to req.file->undefined
    //so we must first check req.file before checking buffer, bcz when req.file is undefined then accessing buffer will crash it 
    if(req.file && req.file.buffer){ //if user is uploaded new photo then buffer will not be undefined, then only it will update in storage profile
        user.picture=req.file.buffer;
    }
    user.fullName=name;
    user.email = email;
    user.contact=contact;
    await user.save()
    req.flash("success", "profile updated successfully");
    res.redirect('/users/account')
} )
router.get('/orders',isLoggedIn, async(req,res)=>{
    let ordersData = await orderModel.find({user:req.user._id}).populate('orders.product')
    // console.log(ordersData[0].orders[0].product.image)
    res.render('orders',{ordersData})
})
//test this route with postman in body -> urlencoded form using post method
router.post('/register',userRegistration)
router.post('/login',loginUser)
router.get('/logout',logoutUser)
router.post('/update-password', updatePassword)
module.exports = router;