var mongoose = require('mongoose')

var Schema = mongoose.Schema;

var bcrypt = require('bcrypt')

var userSchema = new Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        trim: true,
        unique: true
    },
    phone: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    }

    
})

userSchema.pre('save', function(next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function(e, salt) {
            if (e) {
                return next(e)
            }

            bcrypt.hash(user.password, salt, function(e, hash) {
                if (e) {
                    return next(e)
                }
                user.password = hash
                next()
            })  
        })
    }
    else {
        return next()
    }
} )

userSchema.methods.comparePassword = function(passw, cb) {
    bcrypt.compare(passw, this.password, function(e, isMatch) {
        if (e) {
            return cb(e)
        }

        cb(null, isMatch)
    })
}


module.exports = mongoose.model('User', userSchema)