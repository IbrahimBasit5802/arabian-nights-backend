var User = require('../models/user')
var Floor = require('../models/floors')
var MenuItem = require('../models/menu_item')
var jwt = require('jwt-simple')
var config = require('../config/dbconfig')
var emailValidator = require('deep-email-validator')
const { json } = require('body-parser')



var functions = {
    // adds new user to the mongo db database
    addNew: async (req, res) => {

        // required fields validation
        if ((!req.body.name) || (!req.body.password) || (!req.body.email) || (!req.body.phone) || (!req.body.userType)) {
            return res.json({success: false, msg: "Enter the required fields"})
        }
        else {
            // check if email already exsts in the database
            let em =  await User.findOne({ email: req.body.email })
            // check if phone number already exists in the database
            let ph = await User.findOne({phone: req.body.phone})
    
            if (em) {
                res.json({success: false, msg: "Email already exists"})
                return
            }
            else if(ph) {
                res.json({success: false, msg: "Phone Number already exists"})
                return
            }
            // email validation
            var checkEmail = await emailValidator.validate(req.body.email)
            var reason = ''
            
            if (!checkEmail['valid']) {
                if (checkEmail['reason'] == 'disposable') {
                    reason = checkEmail['validators']['disposable']['reason']
                }
                else if (checkEmail['reason'] == 'typo') {
                    reason = checkEmail['validators']['typo']['reason']
                }
                else if(checkEmail['reason'] == 'regex') {
                    reason = checkEmail['validators']['regex']['reason']
                }
                else if(checkEmail['reason'] == 'mx') {
                    reason = checkEmail['validators']['mx']['reason']
                }
                else if(checkEmail['reason'] == 'smtp') {
                    reason = checkEmail['validators']['smtp']['reason']
                }
                else {
                    reason = "Invalid Email"
                }
                return res.json({success: false, msg: reason})
                
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
                    return res.json({success: false, msg: "Failed to register user"})
                }
                else {
                    return res.json({success: true, msg: "Sign Up Successful"})
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

            return res.json({success: true, name: decodedToken.name, email: decodedToken.email, phone: decodedToken.phone, userType: decodedToken.userType})
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
                    res.json({success: false, msg: "Failed to add floor"})
                }
                else {
                    res.json({success: true, msg: "Floor has been created"})
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
            return res.json({success: false, msg: "No Floors Found"})
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
                return res.json({success: false, msg: "Failed to add menu item"})
            }
            else {
                return res.json({success: true, msg: "Successfully Added Menu Item"})
            }
        })
    },

    getMenuItem: async (req, res) => {

        var cursor = await MenuItem.findOne({name: req.body.name})
        if (!cursor) {
            return res.json({success: false, msg: "Item not Found"})
        }

        return res.json({success: true, name: cursor.name, description: cursor.description, category: cursor.category, price: cursor.price, picUrl: cursor.picUrl})
    },
    getAllMenuItems: async (req, res) => {
        var cursor = await MenuItem.find()
        if (!cursor) {
            return res.json({success: false, msg: "No Items Found"})
        }
        return res.json({success: true, items: cursor})
    },

 
}

module.exports = functions