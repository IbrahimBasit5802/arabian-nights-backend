const express = require('express')
const { route } = require('express/lib/router')

const actions =  require('../methods/actions')


const router = express.Router()


router.get('/', (req, res) => {
    res.send('Hello')

})

router.get('/dashboard', (req, res) => {
    res.send('Dash')

})


// adding newUser
router.post('/adduser', actions.addNew)
// logging in user
router.post('/authenticate', actions.authenticate)
router.get('/getinfo', actions.getinfo)
router.post('/updateusertype', actions.updateUserType)
//adding floor
router.post('/addfloor', actions.addFloor)

router.post('/addmenuitem', actions.addMenuItem)
router.post('/createcategory', actions.createCategory)
// get a specific floor info

router.get('/getfloorinfo', actions.getFloorInfo)
router.get('/gettotalfloors', actions.getTotalFloors);
router.post('/updatetables', actions.updateNumTables);
//
router.post('/deletemenuitem', actions.deleteMenuItem);
router.post('/updatemenuitempull', actions.updateMenuItemPull);
router.post('/updatemenuitempush', actions.updateMenuItemPush);
router.get('/getusertype', actions.getUserType)
router.get('/getuser', actions.getUser)
router.post('/updateuser', actions.updateUser)
router.get('/getallusers', actions.getAllUsers)
router.post('/deleteuser', actions.deleteUser)
router.get('/getallfloors', actions.getAllFloors)
router.post('/deletecategory', actions.deleteCategory)
router.get('/getcategory', actions.getCategory)
router.get('/getallcategories', actions.getAllCategories)
router.post('/addtable', actions.addTable)
router.post('/deletelatestfloor', actions.deleteLatestFloor)
router.post('/updateitemname', actions.updateItemName)
router.post('/updateitemprice', actions.updateItemPrice)
router.post('/updateitemdescription', actions.updateItemDescription)
router.post('/updateitemimage', actions.updateItemImage)
router.post('/updateitemcategory', actions.updateItemCategory)
router.post('/updateusertype', actions.updateUserType)
router.post('/createorder', actions.createOrder)
router.post('/additemtoorder', actions.addItemToOrder)
router.get('/getallorders', actions.getAllOrders)
router.get('/getorder', actions.getSpecificOrder)
router.post('/saveinvoicedetails', actions.saveInvoiceDetails)
router.get('/getinvoicedetails', actions.getInvoiceDetails)
router.post('/generateinvoice', actions.generateInvoice)
router.post('/deleteorder', actions.deleteOrder)
router.post('/deleteitemfromorder', actions.removeItemFromOrder)
router.get('/checkorderexistence', actions.checkIfOrderExists)
router.post('/overwriteorder', actions.overWriteOrder)
router.post('/resetorderitems', actions.resetOrderItems)
router.get('/getinvoicesbydate', actions.getInvoicesByDateRange)

module.exports = router