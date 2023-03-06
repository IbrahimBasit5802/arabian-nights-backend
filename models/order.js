var mongoose = require('mongoose')
var Schema = mongoose.Schema;


var menuOrderItemSchema = new Schema(
    {
        itemName: {
            type: String,
            require: true,
            unique: false
        },
        rate: {
            type: Number,
            require: true,
            unique: false
        },
        quantity: {
            type: Number,
            require: true,
            unique: false
        },
        ready: {
            type: Boolean,
            require: false,
            unique: false,
            default: false
        },

    }
)


var orderSchema = new Schema(
    {
        floorNum: {
            type: Number,
            require: true,
            unique: false
        },
        tableNum: {
            type: Number,
            require: true,
            unique: false
        },

        orderStatus: {
            type: String,
            require: true,
            unique: false,
        },

        extras: {
            type: String,
            require: false,

        },



        menuOrderItems: [menuOrderItemSchema],

        


    }
)

orderSchema.pre('save', function(next) {
    return next()
})





module.exports = mongoose.model('Order', orderSchema)