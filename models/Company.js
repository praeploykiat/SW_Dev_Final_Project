const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    name : {
        type:String,
        required:[true,'Please add name'],
        unique:true,
        trim:true,
        maxlength:[50,'Name can not be more than 50 characters']
    },
    address : {
        type:String,
        required:[true,'Please add an address']
    },
    district:{
        type:String,
        required:[true,'Please add a district']
    },
    province:{
        type:String,
        required:[true,'Please add a province']
    },
    postalcode:{
        type:String,
        required:[true,'Please add a postalcode'],
        maxlength:[50,'Postal Code can not be more than 5 digits']
    },
    
    tel:{
        type:String,
    },
    // region:{
    //     type:String,
    //     required:[true,'Please add a region']
    // }
    
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

//Cascade delete appointments when a company is deleted
CompanySchema.pre('deleteOne',{document:true,query:false},async function(next){
    console.log(`Appointments being removed from company ${this._id}`);
    await this.model('Appointment').deleteMany({Company:this._id});
    next();
});

//Reverse populate with virtuals
CompanySchema.virtual('appointments',{
    ref:'Appointment',
    localField : '_id',
    foreignField: 'company',
    justOne:false
}); 

module.exports = mongoose.model('Company',CompanySchema);