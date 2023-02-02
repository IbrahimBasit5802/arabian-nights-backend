var mongoose = require('mongoose')
var Schema = mongoose.Schema;


var tableSchema = new Schema(
    {
        tableNumber: {
            type: Number,
            require: true,
            unique: true
        },
        tableStatus: {
            // Reserved, Occupied, Available
            type:String,
            require: true
        }

    }
)

var floorSchema = new Schema(
    {
        floorNum: {
            type: Number,
            require: true,
            unique: true
        },
        numTables: {
            type: Number,
            require: false
        },

        tables: 
            
      {
        type: [tableSchema],
      }
        
    }
)

floorSchema.pre('save', function(next) {
    var floor = this;
    return next()
})





module.exports = mongoose.model('Floor', floorSchema)