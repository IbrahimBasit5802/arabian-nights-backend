var mongoose = require('mongoose')
var Schema = mongoose.Schema;



var invoiceDetailsSchema = new Schema(
    {
        restaurantName: {
            type: String,
            require: true,
            unique: false
        },
        address: {
            type: String,
            require: true,
            unique: false
        },

        phone: {
            type: String,
            require: true,
            unique: false,
        },

        email: {
            type: String,
            require: false,

        },
        taxRate: {
            type: Number,

        },

        taxID: {
            type: String,
        },

        foodLicenseNumber: {
            type: String,
        },

        companyRegisterNumber: {
            type: String,
        },

        extraDetails: {
            type: String,
        },

        


    }
)

invoiceDetailsSchema.pre('save', function(next) {
    return next()
})





module.exports = mongoose.model('InvoiceDetails', invoiceDetailsSchema)