var User = require('../models/user')
var Floor = require('../models/floors')
var MenuItem = require('../models/menu_item')
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


        if ((!req.body.name) || (!req.body.password) || (!req.body.email) || (!req.body.phone) || (!req.body.userType)) {
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
                phone: req.body.phone,
                userType: req.body.userType
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

    getUserType: async (req, res) => {
        let tempUser = await User.findOne({email: req.body.email})
        if (!tempUser) {
            return res.json({success: false, msg: "User not Found"})
        }

        return res.json({success: true, userType: tempUser.userType})
    },

    getFloorInfo: async (req, res) => {

        let floorInfo = await Floor.findOne({floorNum: req.body.floorNum})
        if (!floorInfo) {
            return res.json({success: false, msg: "Floor Doesn't Exist"})
        }

        return res.json({success: true, floorNum: floorInfo.floorNum, numTables: floorInfo.numTables})


    },

    getAllUsers: async (req, res) => {
        var cursor = await User.find();
        if (!cursor) {
            return res.json({success: false, msg: "No Users Found"})
        }

        return res.json({success: true, users: cursor})
    },

    getAllFloors: async (req, res) => {
        var fl = await Floor.find()
        if (!fl) {
            return res.json({success: false, msg: "No Floors"})
        } 

        return res.json({success: true, floors: fl})
    },

    addMenuItem: async (req, res) => {
        if (!req.body.name || !req.body.description || !req.body.category || !req.body.price) {
            return res.json({success: false, msg: "Enter the required fields"})
        }

        var newItem = MenuItem({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            picUrl: req.body.picUrl
        })
        newItem.save(function (e, newItem) {
            if (e) {
                return res.json({success: false, msg: "Failed to save"})
            }
            else {
                return res.json({success: true, msg: "Successfully Saved"})
            }
        })
    },

    getMenuItem: async (req, res) => {

        var cursor = await MenuItem.findOne({name: req.body.name})
        if (!cursor) {
            return res.json({success: false, msg: "Item not Found"})
        }

        return res.json({success: true, name: cursor.name, description: cursor.description, category: cursor.category, price: cursor.price, picUrl: cursor.picUrl})
    }

 
}

module.exports = functions