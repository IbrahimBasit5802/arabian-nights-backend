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
router.post('/updatemenuitem', actions.updateMenuItem);
router.get('/getusertype', actions.getUserType)
router.get('/getuser', actions.getUser)
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
module.exports = router