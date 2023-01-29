var JwtStrategy = require('passport-jwt').Strategy

var ExtractJwt = require('passport-jwt').ExtractJwt

var User = require('../models/user')
const { options } = require('../routes')

var config = require('./dbconfig')

module.exports = function (passport) {
    var opts = {}
    opts.secretOrKey = config.secret
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt')

    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        User.find({
            id: jwt_payload.id,

        },
        function(e, user) {
            if (e) {
                return done(e, false)
            }

            if (user) {
                return done(null, user)
            }

            else {
                return done(null, false)
            }
        }
        )
    }))
}