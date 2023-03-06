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

var invoiceSchema = new Schema(
    {

        invoiceID: {
            type: String,
            require: true,
        },
        floorNum: {
            type: Number,
            require: true,
        },
        tableNum: {
            type: Number,
            require: true,
        },
        dateOfOrder: {
            type: String,
        },
        orderedItems: [menuOrderItemSchema],
        payment_method: {
            type: String,
            require: true,
        },
        taxRate: {
            type: Number,
            require: true,
        }

    }
)


invoiceSchema.pre('save', function(next) {
    return next()
})





module.exports = mongoose.model('Invoice', invoiceSchema)