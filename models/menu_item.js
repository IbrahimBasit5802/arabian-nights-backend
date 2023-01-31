var mongoose = require('mongoose')

var Schema = mongoose.Schema;


var menuItemSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    category: {
        type: String,
        require: true
    },
    price: {
        type: String,
        require: true
    },
    picUrl: {
        type: String
    }
})

menuItemSchema.pre('save', function(next) {
    var floor = this;
    return next()
})

module.exports = mongoose.model('MenuItem', menuItemSchema)