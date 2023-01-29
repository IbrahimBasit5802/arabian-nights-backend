var User = require('../models/user')
var Floor = require('../models/floors')
var jwt = require('jwt-simple')
var config = require('../config/dbconfig')
const { json } = require('body-parser')
//const JWTT = require("jsonwebtoken");
// const Token = require("../models/Token.model");
// const sendEmail = require("../utils/email/sendEmail");
// const crypto = require("crypto");
// const bcrypt = require("bcrypt");


var functions = {
    addNew: async (req, res) => {


        if ((!req.body.name) || (!req.body.password) || (!req.body.email) || (!req.body.phone)) {
            res.json({success: false, msg: "Enter the required fields"})
        }
        else {
            let em =  await User.findOne({ email: req.body.email })
            let ph = await User.findOne({phone: req.body.phone})
    
            if (em) {
                res.json({success: false, msg: "Email already exists"})
                return
            }
            else if(ph) {
                res.json({success: false, msg: "Phone Number already exists"})
                return
            }
            var newUser = User({
                name: req.body.name,
                password: req.body.password,
                email: req.body.email,
                phone: req.body.phone
            });
            newUser.save(function (e, newUser) {
                if (e) {
                    res.json({success: false, msg: "Failed to save"})
                }
                else {
                    res.json({success: true, msg: "Successfully Saved"})
                }
            })
        }
    },

    authenticate: function (req, res) {
         User.findOne({
            email: req.body.email},
            function(e, user) {
                if (e) {

                    throw e
                }
                if (!user) {

                    return res.status(403).send({success: false, msg: "User not found"})
                }
                else {

                    user.comparePassword(req.body.password, function(e, isMatch) {
                        if (isMatch && !e) {
                            console.log("Logged in")
                            var token = jwt.encode(user, config.secret)
                            return res.json({success: true, token: token})
                        }
                        else {
                            return res.status(403).send({success: false, msg: "Incorrect Password"})
                        }
                    })
                }
            }
        )
    },
    getinfo: function(req, res) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            var token = req.headers.authorization.split(' ')[1]
            var decodedToken = jwt.decode(token, config.secret)

            return res.json({success: true, msg: "Hello" + decodedToken.name})
        }
        else {
            return res.json({success: false, msg: "No Headers"})
        }
    },

    addFloor: async (req, res) => {

        if ((!req.body.floorNum) || (!req.body.numTables)) {
            res.json({success: false, msg: "Enter the required fields"})
        }
        else {
            let fl =  await Floor.findOne({ floorNum: req.body.floorNum })
            if (fl) {
                res.json({success: false, msg: "Floor already exists"})
                return
            }
            var newFloor = Floor({
                floorNum: req.body.floorNum,
                numTables: req.body.numTables
            });
            newFloor.save(function (e, newFloor) {
                if (e) {
                    res.json({success: false, msg: "Failed to save"})
                }
                else {
                    res.json({success: true, msg: "Successfully Saved"})
                }
            })
        }
    },

    getFloorInfo: async (req, res) => {

        let floorInfo = await Floor.findOne({floorNum: req.body.floorNum})
        if (!floorInfo) {
            return res.json({success: false, msg: "Floor Doesn't Exist"})
        }

        return res.json({success: true, floorNum: floorInfo.floorNum, numTables: floorInfo.numTables})


    },

    // getAllFloors: async (req, res) => {
    //     let allFloors = await Floor.find()
    //     if (!allFloors) {
    //         return res.json({success: false, msg: "No Floors have been added"})
    //     }

    //     return res.json({success: true, allFloors.toJson()})
    // }



 
}

module.exports = functions