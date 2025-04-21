const Appointment = require('../models/Appointment');
const Company = require('../models/Company');

//get all appts
//get api/v1/appointments
//access private
exports.getAppointments = async(req,res,next)=>{
    let query;
    //General users can see only thaeir own appts!
    if(req.user.role !== 'admin'){
        query=Appointment.find({user:req.user.id}).populate({path:'company',select:'name province tel'});
    }
    else{//If you are an admin, you can see all!
        if(req.params.companyId){
            console.log(req.params.companyId);
            query = Appointment.find({company:req.params.companyId}).populate({path:'company',select:'name province tel'});
        }
        else{
            query = Appointment.find().populate({path:'company',select:'name province tel'});
        }
        
    }
    try {
        const appointments = await query;
        
        res.status(200).json({success:true,count:appointments.length,data:appointments});
    }
    catch (err){
        console.log(err.stack);
        return res.status(500).json({success:false,message:"Cannot find Appointments"});
    }
}

//get single appt
//get api/v1/appointments/:id
//access public
exports.getAppointment = async (req,res,next) => {
    try{
        const appointment = await Appointment.findById(req.params.id).populate({path:'company',select:'name description tel'});
        if(!appointment){
            return res.status(404).json({success:false,msg:`No appointment with the id of ${req.params.id}`});
        }
        res.status(200).json({success:true,data:appointment});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,message:"Cannot find Appointment"});
    }
    
};

//add single appt
//post api/v1/companies/:companyId/appointments/
//access private
exports.addAppointment = async (req,res,next) => {
    try{
        req.body.company=req.params.companyId;

        const company = await Company.findById(req.params.companyId);

        if(!company){
            return res.status(404).json({success:false,msg:`No company with the id of ${req.params.companyId}`});
        }

        //add user id to req.body
        req.body.user=req.user.id;
        //check for existed appt
        const existedAppointment = await Appointment.find({user:req.user.id});
        //if the user is not an admin,they can create only 3 appts
        if(existedAppointment.length>=3&&req.user.role !== 'admin'){
            return res.status(400).json({success:false,msg:`The user with ID ${req.user.id} has already made 3 appointments`});
        }
        const appointment = await Appointment.create(req.body);

        res.status(200).json({success:true,data:appointment});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,message:"Cannot create Appointment"});
    }
};


//update appt
//put api/v1/appointments/:id
//access private
exports.updateAppointment = async (req,res,next) => {
    try{
        let appointment = await Appointment.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success:false,msg:`No appointment with the id of ${req.params.id}`});
        }

        //make sure user is the apt owner
        if(appointment.user.toString()!==req.user.id&&req.user.role!=='admin'){
            return res.status(401).json({success:false,msg:`User ${req.user.id} is not authorized to update this appointment`});
        }
        appointment = await Appointment.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});

        res.status(200).json({success:true,data:appointment});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,message:"Cannot update Appointment"});
    }
};



//delete appt
//delete api/v1/appointments/:id
//access private
exports.deleteAppointment = async (req,res,next) => {
    try{
        const appointment = await Appointment.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success:false,msg:`No appointment with the id of ${req.params.id}`});
        }

        //make sure user is the apt owner
        if(appointment.user.toString()!==req.user.id&&req.user.role!=='admin'){
            return res.status(401).json({success:false,msg:`User ${req.user.id} is not authorized to delete this appointment`});
        }
        await appointment.deleteOne();

        res.status(200).json({success:true,data:{}});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,message:"Cannot delete Appointment"});
    }
};