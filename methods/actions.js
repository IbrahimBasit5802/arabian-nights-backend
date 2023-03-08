var User = require('../models/user')
var Floor = require('../models/floors')
var Category = require('../models/menu_item')
var Order = require('../models/order')
var InvoiceDetails = require('../models/arabian_nights_invoice_details')
var Invoice = require('../models/invoice')
var jwt = require('jwt-simple')
var config = require('../config/dbconfig')
var emailValidator = require('deep-email-validator')
var moment = require('moment')

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

            return res.json({success: true, _id: decodedToken._id, name: decodedToken.name, email: decodedToken.email, phone: decodedToken.phone, userType: decodedToken.userType})
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

    updateUser: async (req, res) => {
        if (!req.body._id || !req.body.name || !req.body.email) {
            return res.json({success: false, msg: "Enter the required fields"})
        }

        User.updateOne({_id: req.body._id}, {name: req.body.name, email: req.body.email, phone: req.body.phone, userType: req.body.role}, function(e) {
            if (e) {
                return res.json({success: false, msg: e.toString()})
            }
            else {
                return res.json({success: true, msg: "User Updated"})
            }
        })
        
    },

    updateUserType: async (req, res) => {
        if (!req.body._id || !req.body.userType) {
            return res.json({success: false, msg: "Enter the required fields"})
        }

        User.updateOne({_id: req.body._id}, {userType: req.body.userType}, function(e) {
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

    getUser: async (req, res) => {
        if (!req.body.email) {
            return res.json({success: false, msg: "Enter the required fields"})
        }

        var tmp = await User.findOne({email: req.body.email})
        console.log(User)
        if (!tmp) {
            return res.json({success: false, msg: "User not Found"})
        }
        return res.json({success: true, _id: tmp._id, name: tmp.name, email: tmp.email, phone: tmp.phone, userType: tmp.userType})
    },

    deleteUser: async (req, res) => {
        if (!req.body.email) {
            return res.json({success: false, msg: "Enter the required fields"})
        }

        User.deleteOne({email: req.body.email}, function(e) {
            if (e) {
                return res.json({success: false, msg: e.toString()})
            }
            else {
                return res.json({success: true, msg: "User Deleted"})
            }
        })
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

    updateMenuItemPull: async (req, res) => {


        // delete old item:

        try {
            Category.updateOne({categoryName: req.body.categoryName}, {$pull: {items: {name: req.body.oldName}}},  function (e) {
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

    updateMenuItemPush: async (req, res) => {
        try {

            Category.updateOne({categoryName: req.body.categoryName},  {$push: {"items": {
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

        } catch(e) {
            return res.json({success: false, msg: e.toString()})
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
    },

    createOrder: async (req, res) => {


        var order = Order(
            {
                tableNum: req.body.tableNum,
                floorNum: req.body.floorNum,
                orderStatus: "Pending",
                extras: req.body.extras,
            }
        )

        order.save( function (e, order) {
            if (e) {
                return res.json({success: false, msg: "Failed to create order"})
            }
            else {
                return res.json({success: true, msg: "Successfully Created Order"})
            }
        })
    },

    addItemToOrder: async (req, res) => {


        Order.updateOne({floorNum: req.body.floorNum, tableNum: req.body.tableNum}, {$push: {"menuOrderItems": {
            itemName: req.body.itemName,
            rate: req.body.rate,
            quantity: req.body.quantity,
            ready: req.body.ready
           
        }}}, function (e) {
            if (e) {
                return res.json({success: false, msg: "Failed to add item to order"})
            }
            else {
                return res.json({success: true, msg: "Successfully Added Item to Order"})
            }
        })
    },

    removeItemFromOrder: async (req, res) => {
        
        Order.updateOne({floorNum: req.body.floorNum, tableNum: req.body.tableNum}, {$pull: {"menuOrderItems": {
            itemName: req.body.itemName,
        }}}, function (e) {
            if (e) {
                return res.json({success: false, msg: "Failed to remove item from order"})
            }
            else {
                return res.json({success: true, msg: "Successfully Removed Item from Order"})
            }
        })
    
    },

    checkIfOrderExists: async (req, res) => {
     Order.findOne({floorNum: req.body.floorNum, tableNum: req.body.tableNum}, function (e, order) {
            if (e) {
                return res.json({success: false, msg: "Failed to check if order exists"})
            }
            else {
                if (!order) {
                    return res.json({success: false, msg: "Order does not exist"})
                }
                else {
                    return res.json({success: true, msg: "Order exists"})
                }
            }
        })
    },

    resetOrderItems: async (req, res) => {
        Order.updateOne({floorNum: req.body.floorNum, tableNum: req.body.tableNum}, {menuOrderItems: []}, function (e) {
            if (e) {
                return res.json({success: false, msg: "Failed to reset order items"})
            }
            else {
                return res.json({success: true, msg: "Successfully Reset Order Items"})
            }
        })
    },

    overWriteOrder: async (req, res) => {
        
        Order.updateOne({floorNum: req.body.floorNum, tableNum: req.body.tableNum}, {menuOrderItems: req.body.menuOrderItems}, function (e) {
            if (e) {
                return res.json({success: false, msg: "Failed to overwrite order"})
            }
            else {
                return res.json({success: true, msg: "Successfully Overwrote Order"})
            }
        })
    
    },

    getAllOrders: async (req, res) => {
        
        var cursor = await Order.find()
        if (!cursor) {
            return res.json({success: false, msg: "No Orders Found"})
        }
        return res.json({success: true, orders: cursor})
    
    },

    getSpecificOrder: async (req, res) => {
        var order = await Order.findOne({floorNum: req.body.floorNum, tableNum: req.body.tableNum});
        if (!order) {
            return res.json({success: false, msg: "No Orders Found"})
        }
        return res.json({success: true, order: order})
    },

    saveInvoiceDetails: async (req, res) => {

        await InvoiceDetails.deleteOne();

        var invoice = InvoiceDetails(
            {
                restaurantName: req.body.restaurantName,
                address: req.body.address,
                phone: req.body.phone,
                email: req.body.email,
                taxRate: req.body.taxRate,
                taxID: req.body.taxID,
                companyRegistrationNumber: req.body.companyRegistrationNumber,
                foodLicenseNumber: req.body.foodLicenseNumber,
                extraDetails: req.body.extraDetails,
            }
        )

        invoice.save( function (e, invoice) {
            if (e) {
                return res.json({success: false, msg: "Failed to create invoice"})
            }
            else {
                return res.json({success: true, msg: "Successfully Created Invoice"})
            }
        })
    },

    getInvoiceDetails: async (req, res) => {
        var invoice = await InvoiceDetails.findOne();
        if (!invoice) {
            return res.json({success: false, msg: "No Invoice Found"})
        }
        return res.json({success: true, invoice: invoice})
    },

    generateInvoice: async (req, res) => {
    
        var invoice = Invoice(
            {
                floorNum: req.body.floorNum,
                tableNum: req.body.tableNum,
                dateOfOrder: req.body.dateOfOrder,
                orderedItems: req.body.orderedItems,
                payment_method: req.body.payment_method,
                taxRate: req.body.taxRate,
                invoiceID: req.body.invoiceID,
                created: moment().format('YYYY-MM-DD')
        
            })

        

        invoice.save( function (e, invoice) {
            if (e) {
                return res.json({success: false, msg: "Failed to generate invoice"})
            }
            else {
                return res.json({success: true, msg: "Successfully Generated Invoice"})
            }
        })
    },

    deleteOrder: async (req, res) => {
        Order.deleteOne({floorNum: req.body.floorNum, tableNum: req.body.tableNum}, function (e) {
            if (e) {
                return res.json({success: false, msg: "Failed to delete order"})
            }
            else {
                return res.json({success: true, msg: "Successfully Deleted Order"})
            }
        })
        
    },

    getInvoicesByDateRange: async (req, res) => {
        
        var invoice = await Invoice.find({created: {$gte: new Date(req.body.startDate), $lte: new Date(req.body.endDate)}})
        
        if (!invoice) {
            return res.json({success: false, msg: "No Invoice Found"})
        }
        return res.json({success: true, invoice: invoice})
    },

    getAllInvoices: async (req, res) => {
            
            var invoice = await Invoice.find()
            
            if (!invoice) {
                return res.json({success: false, msg: "No Invoice Found"})
            }
            return res.json({success: true, invoice: invoice})
        },






 
}

module.exports = functions