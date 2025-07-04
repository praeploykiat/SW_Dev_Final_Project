// const express = require('express');
// const router = express.Router();


// router.get('/',(req,res) => {
//     res.status(200).json({success:true,msg:'Show all companies'});
// });

// router.get('/:id', (req,res) => {
//     res.status(200).json({success:true,msg:`Show company ${req.params.id}`});
// });

// router.post('/', (req,res) => {
//     res.status(200).json({success:true,msg:'Create new Company'});
// });

// router.put('/:id',(req,res) => {
//     res.status(200).json({success:true,msg:`Update company ${req.params.id}`});
// });

// router.delete('/:id' , (req,res) => {
//     res.status(200).json({success:true,msg:`Delete company ${req.params.id}`});
// });

// module.exports=router;




const express = require('express');
const {protect,authorize} = require('../middleware/auth');
const {getCompanies,getCompany,createCompany,updateCompany,deleteCompany, updateMaxSlots} = require('../controller/companies');


//include other resource routers
const bookingRouter = require('./bookings');

const router = express.Router();

//Re-route into other resource routers
router.use('/:companyId/bookings/',bookingRouter);
// Add this new route for updating max slots
router.route('/:id/slots').put(protect, authorize('admin'), updateMaxSlots);

router.route('/').get(getCompanies).post(protect,authorize('admin'),createCompany);
router.route('/:id').get(getCompany).put(protect,authorize('admin'),updateCompany).delete(protect,authorize('admin'),deleteCompany);


module.exports=router;
