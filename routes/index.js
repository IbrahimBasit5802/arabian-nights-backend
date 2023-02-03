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

//adding floor
router.post('/addfloor', actions.addFloor)

router.post('/addmenuitem', actions.addMenuItem)

// get a specific floor info

router.get('/getfloorinfo', actions.getFloorInfo)

//

router.get('/getusertype', actions.getUserType)

router.get('/getallusers', actions.getAllUsers)

router.get('/getallfloors', actions.getAllFloors)

router.get('/getmenuitem', actions.getMenuItem)
router.get('/getallmenuitems', actions.getAllMenuItems)
router.post('/addtable', actions.addTable)

router.post('/updateitemname', actions.updateItemName)
router.post('/updateitemprice', actions.updateItemPrice)
router.post('/updateitemdescription', actions.updateItemDescription)
router.post('/updateitemimage', actions.updateItemImage)
router.post('/updateitemcategory', actions.updateItemCategory)
module.exports = router