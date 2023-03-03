var mongoose = require('mongoose')

var Schema = mongoose.Schema;


var menuItemSchema = new Schema({
    name: {
        type: String,
        require: true
    },

    price: {
        type: Number,
        require: true
    },
    picUrl: {
        type: String
    }
})

var categorySchema = new Schema({
    categoryName: {
        type: String,
        require: true
    },
    numItems: {
        type: Number,
    },
    items: [menuItemSchema]
})

categorySchema.pre('save', function(next) {
    return next()
})

module.exports = mongoose.model('Category', categorySchema)