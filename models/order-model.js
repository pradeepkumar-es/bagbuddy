const mongoose = require("mongoose");
const orderSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    orders:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'product'
            },
            quantity:Number,
        }
    ],
    totalAmount:Number,
    createdAt:{
        type:Date,
        default:Date.now()
    }
})
module.exports = mongoose.model("order",orderSchema)