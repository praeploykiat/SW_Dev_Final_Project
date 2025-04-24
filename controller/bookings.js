const Booking = require('../models/Booking');
const Company = require('../models/Company');

//get all appts
//get api/v1/bookings
//access private
exports.getBookings = async(req,res,next)=>{
    let query;
    //General users can see only their own bookings!
    if(req.user.role !== 'admin'){
        query=Booking.find({user:req.user.id}).populate({path:'company',select:'name province tel'});
    }
    else{//If you are an admin, you can see all!
        if(req.params.companyId){
            console.log(req.params.companyId);
            query = Booking.find({company:req.params.companyId}).populate({path:'company',select:'name province tel'});
        }
        else{
            query = Booking.find().populate({path:'company',select:'name province tel'});
        }
        
    }
    try {
        const bookings = await query;
        
        res.status(200).json({success:true,count:bookings.length,data:bookings});
    }
    catch (err){
        console.log(err.stack);
        return res.status(500).json({success:false,message:"Cannot find Bookings"});
    }
}

//get single appt
//get api/v1/bookings/:id
//access public
exports.getBooking = async (req,res,next) => {
    try{
        const booking = await Booking.findById(req.params.id).populate({path:'company',select:'name description tel'});
        if(!booking){
            return res.status(404).json({success:false,msg:`No booking with the id of ${req.params.id}`});
        }
        res.status(200).json({success:true,data:booking});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,message:"Cannot find Booking"});
    }
    
};

//add single appt
//post api/v1/companies/:companyId/bookings/
//access private
exports.addBooking = async (req,res,next) => {
    try{
        req.body.company=req.params.companyId;

        const company = await Company.findById(req.params.companyId);

        if(!company){
            return res.status(404).json({success:false,msg:`No company with the id of ${req.params.companyId}`});
        }

        const requestedDate = new Date(req.body.apptDate);
        
        const startOfDay = new Date(requestedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(requestedDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        const bookingsOnThisDate = await Booking.countDocuments({
            company: req.params.companyId,
            apptDate: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if(bookingsOnThisDate >= company.maxSlots) {
            return res.status(400).json({
                success: false, 
                msg: `Company ${company.name} has reached its maximum number of interview slots for ${startOfDay.toDateString()}`
            });
        }

        //add user id to req.body
        req.body.user=req.user.id;
        //check for existed appt
        const existedBooking = await Booking.find({user:req.user.id});
        //if the user is not an admin,they can create only 3 appts
        if(existedBooking.length>=3&&req.user.role !== 'admin'){
            return res.status(400).json({success:false,msg:`The user with ID ${req.user.id} has already made 3 bookings`});
        }
        // //Check if the same date is already booked for this company
        // const existingAppointment = await Booking.findOne({
        //     company: req.params.companyId,
        //     apptDate: new Date(req.body.apptDate)
        // });
        
        // if(existingAppointment) {
        //     return res.status(400).json({
        //         success: false,
        //         msg: `A Booking for ${company.name} on this date already exists`
        //     });
        // }
        const booking = await Booking.create(req.body);

        res.status(200).json({success:true,data:booking});
    }
    catch (err) {
        console.log(err.stack);
    
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(err.errors).map(val => val.message).join(', ')
            });
        }
    
        return res.status(500).json({ success: false, message: "Cannot create Booking" });
    }    
};


//update appt
//put api/v1/bookings/:id
//access private
exports.updateBooking = async (req,res,next) => {
    try{
        // First, find the booking
        let booking = await Booking.findById(req.params.id);
        if(!booking){
            return res.status(404).json({success:false,msg:`No booking with the id of ${req.params.id}`});
        }

        // Check authorization - do this early
        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,msg:`User ${req.user.id} is not authorized to update this booking`});
        }

        // If we're changing the date, check for conflicts
        if(req.body.apptDate) {
            // Get the company info for this booking
            const company = await Company.findById(booking.company);
            
            if(!company) {
                return res.status(404).json({success:false, msg: 'Company not found'});
            }

            // Check if date is already booked (excluding this booking)
            const existingAppointment = await Booking.findOne({
                company: booking.company,
                apptDate: new Date(req.body.apptDate),
                _id: { $ne: req.params.id } // Exclude current booking from check
            });
            
            if(existingAppointment) {
                return res.status(400).json({
                    success: false,
                    msg: `An appointment for ${company.name} on this date and time already exists`
                });
            }
        }

        // Update the booking
        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({success: true, data: booking});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success: false, message: "Cannot update Booking"});
    }
};



//delete appt
//delete api/v1/bookings/:id
//access private
exports.deleteBooking = async (req,res,next) => {
    try{
        const booking = await Booking.findById(req.params.id);

        if(!booking){
            return res.status(404).json({success:false,msg:`No booking with the id of ${req.params.id}`});
        }

        //make sure user is the apt owner
        if(booking.user.toString()!==req.user.id&&req.user.role!=='admin'){
            return res.status(401).json({success:false,msg:`User ${req.user.id} is not authorized to delete this booking`});
        }
        await booking.deleteOne();

        res.status(200).json({success:true,data:{}});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,message:"Cannot delete Booking"});
    }
};
