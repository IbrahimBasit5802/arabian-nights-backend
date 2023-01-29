const express = require('express')

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

// get a specific floor info

router.get('/getfloorinfo', actions.getFloorInfo)


module.exports = router