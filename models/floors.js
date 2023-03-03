var mongoose = require('mongoose')
var Schema = mongoose.Schema;




var floorSchema = new Schema(
    {
        floorNum: {
            type: Number,
            require: false,
            unique: true
        },
        numTables: {
            type: Number,
            require: false,
            unique: false
        },
        


    }
)

floorSchema.pre('save', function(next) {
    var floor = this;
    return next()
})





module.exports = mongoose.model('Floor', floorSchema)