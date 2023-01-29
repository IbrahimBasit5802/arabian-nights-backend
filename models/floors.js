var mongoose = require('mongoose')

var Schema = mongoose.Schema;


var floorSchema = new Schema(
    {
        floorNum: {
            type: String,
            require: true,
            unique: true
        },
        numTables: {
            type: String,
            require: true
        }
    }
)

floorSchema.pre('save', function(next) {
    var floor = this;
    return next()
})





module.exports = mongoose.model('Floor', floorSchema)