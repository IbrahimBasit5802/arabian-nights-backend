var User = require('../models/user')
var Floor = require('../models/floors')
var Category = require('../models/menu_item')
var jwt = require('jwt-simple')
var config = require('../config/dbconfig')
var emailValidator = require('deep-email-validator')
const { json } = require('body-parser')
const { parse } = require('handlebars')



var functions = {
    // adds new user to the mongo db database
    addNew: async (req, res) => {

        // required fields validation
        if ((!req.body.name) || (!req.body.password) || (!req.body.email)) {
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

                    return res.json({success: false, msg: "User not found"})
                }
                else {

                    user.comparePassword(req.body.password, function(e, isMatch) {
                        if (isMatch && !e) {
                            console.log("Logged in")
                            var token = jwt.encode(user, config.secret)
                            return res.json({success: true, token: token})
                        }
                        else {
                            return res.json({success: false, msg: "Incorrect Password"})
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
        var count = await Floor.countDocuments({})

        
            let fl =  await Floor.findOne({ floorNum: count })
            if (fl) {
                res.json({success: false, msg: "Floor already exists"})
                return
            }
            let newFloor = Floor({
                floorNum: count,
                numTables: 0,
            });
            newFloor.save(function (e) {
                if (e) {
                    res.json({success: false, msg: e.toString()})
                }
                else {
                    res.json({success: true, msg: "Floor has been created"})
                }
            })
        
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

    updateUserType: async (req, res) => {
        if (!req.body.email || !req.body.userType) {
            return res.json({success: false, msg: "Enter the required fields"})
        }

        User.updateOne({email: req.body.email}, {userType: req.body.userType}, function(e) {
            if (e) {
                return res.json({success: false, msg: e.toString()})
            }
            else {
                return res.json({success: true, msg: "User Type Updated"})
            }
        })
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

    createCategory: async (req, res) => {
        if (!req.body.categoryName) {
            return res.json({success: false, msg: "Enter the required fields"})
        }

        var newItem = Category({
            categoryName: req.body.categoryName,
            numItems: 0,
            
        })
        newItem.save(function (e, newItem) {
            if (e) {
                return res.json({success: false, msg: "Failed to add category"})
            }
            else {
                return res.json({success: true, msg: "Successfully Added category"})
            }
        })
    },

    getCategory: async (req, res) => {

        var cursor = await Category.findOne({categoryName: req.body.categoryName})
        if (!cursor) {
            return res.json({success: false, msg: "Category not Found"})
        }

        return res.json({success: true, _id: cursor._id, categoryName: cursor.categoryName, items: cursor.items, numItems: cursor.numItems})
    },
    deleteCategory: async (req, res) => {
        if (!req.body.categoryName) {
            return res.json({success: false, msg: "Enter the required fields"})
        }
        Category.deleteOne({categoryName: req.body.categoryName}, function(e) {
            if (e) {
                return res.json({success: false, msg: e.toString()})
            }
            else {
                return res.json({success: true, msg: "Category Deleted"})
            }
        })
    },
    getAllCategories: async (req, res) => {
        var cursor = await Category.find()
        if (!cursor) {
            return res.json({success: false, msg: "No Category Found"})
        }
        return res.json({success: true, categories: cursor})
    },

    addMenuItem: async (req, res) => {
        if (!req.body.categoryName || !req.body.name || !req.body.price) {
            return res.json({success: false, msg: "Enter the required fields"})
        }

        var tmpCat = await Category.findOne({categoryName: req.body.categoryName})
        if (!tmpCat) {
            return res.json({success: false, msg: "Category Doesn't Exist"})
        }

        var item_arr = tmpCat.items
        Category.updateOne({categoryName: req.body.categoryName}, {$push: {"items": {
            name: req.body.name,
            price: req.body.price,
            picUrl: req.body.picUrl,
            
        }}, numItems: item_arr.length + 1}, function (e) {
            if (e) {
                return res.json({success: false, msg: e.toString()})
            }
            else {
                return res.json({success: true, msg: "Successfully Added Item"})
            }
        });

    },

    deleteMenuItem: async (req, res) => {
        try {
            Category.updateOne({categoryName: req.body.categoryName}, {$pull: {items: {name: req.body.name}}}, function (e) {
                if (e) {
                    return res.json({success: false, msg: e.toString()})
                }
                else {
                    return res.json({success: true, msg: "Successfully Deleted Item"})
                }
            })
            Category.updateOne({categoryName: req.body.categoryName}, {$inc: {numItems: -1}}, function (e) {
                if (e) {
                    return res.json({success: false, msg: e.toString()})
                }
            }
            )
        } catch (error) {
            res.json(error)
        }

        
  
    },

    updateMenuItem: async (req, res) => {


        // delete old item:

        try {
            Category.updateOne({categoryName: req.body.categoryName}, {$pull: {items: {name: req.body.oldName}}},  {$push: {"items": {
                name: req.body.name,
                price: req.body.price,
                picUrl: req.body.picUrl,
                
            }}},  function (e) {
                if (e) {
                    return res.json({success: false, msg: e.toString()})
                }
                else {
                    return res.json({success: true, msg: "Successfully Deleted Item"})
                }
            })

        } catch (error) {
            res.json(error)
        }


    },



    addTable: async (req, res) => {
        if (!req.body.floorNum) {
            return res.json({success: false, msg: "Enter the required fields"})
        }
        var tmpFloor = await Floor.findOne({floorNum: req.body.floorNum})
        if (!tmpFloor) {
            return res.json({success: false, msg: "Floor Doesn't Exist"})
        }
        var table_arr = tmpFloor.tables
        Floor.updateOne({floorNum: req.body.floorNum}, {$inc: {numTables: 1}, $push: {"tables": {
            tableNumber: table_arr.length + 1,
            tableStatus: "Available"
        }}}, function (e) {
            if (e) {
                return res.json({success: false, msg: e.toString()})
            }
            else {
                return res.json({success: true, msg: "Successfully Added Table"})
            }
        });
    },

    updateItemName: async (req, res) => {
        if (!req.body._id || !req.body.newName) {
            return res.json({success: false, msg: "Enter the required fields"})
        }
        MenuItem.updateOne({_id: req.body._id}, {name: req.body.newName}, function (e) {
            if (e) {
                return res.json({success: false, msg: "Failed to update item name"})
            }
            else {
                return res.json({success: true, msg: "Successfully Updated Item Name"})
            }
        })
    },

    updateItemDescription: async (req, res) => {
        if (!req.body._id || !req.body.newDescription) {
            return res.json({success: false, msg: "Enter the required fields"})
        }
        MenuItem.updateOne({_id: req.body._id}, {description: req.body.newDescription}, function (e) {
            if (e) {
                return res.json({success: false, msg: "Failed to update item description"})
            }
            else {
                return res.json({success: true, msg: "Successfully Updated Item Description"})
            }
        })
    },

    updateItemCategory: async (req, res) => {
        if(!req.body._id || !req.body.newCategory) {
            return res.json({success: false, msg: "Enter the required fields"})
        }
        MenuItem.updateOne({_id: req.body._id}, {category: req.body.newCategory}, function (e) {
            if (e) {
                return res.json({success: false, msg: "Failed to update item category"})
            }
            else {
                return res.json({success: true, msg: "Successfully Updated Item Category"})
            }
        })

    },

    updateItemPrice: async (req, res) => {
        if(!req.body._id || !req.body.newPrice) {
            return res.json({success: false, msg: "Enter the required fields"})
        }

        MenuItem.updateOne({_id: req.body._id}, {price: req.body.newPrice}, function (e) {
            if (e) {
                return res.json({success: false, msg: "Failed to update item price"})
            }
            else {
                return res.json({success: true, msg: "Successfully Updated Item Price"})
            }
        })
    },

    updateItemImage: async (req, res) => {
        if(!req.body._id || !req.body.newPicUrl) {
            return res.json({success: false, msg: "Enter the required fields"})
        }

        MenuItem.updateOne({_id: req.body._id}, {picUrl: req.body.newPicUrl}, function (e) {
            if (e) {
                return res.json({success: false, msg: "Failed to update item picture"})
            }
            else {
                return res.json({success: true, msg: "Successfully Updated Item Picture"})
            }
        })
    },

    getTotalFloors: async (req, res) => {
        var cursor = await Floor.find()
        if (!cursor) {
            return res.json({success: false, msg: "No Floors Found"})
        }
        return res.json({success: true, numFloors: cursor.length})
    },

    updateNumTables: async (req, res) => {
        Floor.updateOne({floorNum: req.body.floorNum}, {numTables: req.body.numTables}, function (e) {
            if (e) {
                return res.json({success: false, msg: "Failed to update number of tables"})
            }
            else {
                return res.json({success: true, msg: "Successfully Updated Number of Tables"})
            }
        })
    },

    deleteLatestFloor: async (req, res) => {
        var toDelete = await Floor.findOne().sort('-_id')
        console.log(toDelete.floorNum)
        Floor.deleteOne({_id: toDelete._id}, function (e) {
            if (e) {
                return res.json({success: false, msg: "Failed to delete floor"})
            }
            else {
                return res.json({success: true, msg: "Successfully Deleted Floor"})
            }
        })
    }
    





 
}

module.exports = functions