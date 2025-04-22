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
    website: {
        type: String,
        match: [
          /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/,
          'Please enter a valid URL'
        ]
      },
      description: {
        type: String,
        maxlength: [500, 'Description can not be more than 500 characters']
      },
    tel:{
        type:String,
    },
    maxSlots: {
        type: Number,
        required: [true, 'Please add the maximum number of interview slots'],
        default: 10,
        validate: {
            validator: function(val) {
                return val > 0;
            },
            message: 'Maximum slots must be a positive number'
        }
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

//Cascade delete bookings when a company is deleted
CompanySchema.pre('deleteOne',{document:true,query:false},async function(next){
    console.log(`Bookings being removed from company ${this._id}`);
    await this.model('Booking').deleteMany({Company:this._id});
    next();
});

//Reverse populate with virtuals
CompanySchema.virtual('bookings',{
    ref:'Booking',
    localField : '_id',
    foreignField: 'company',
    justOne:false
}); 

module.exports = mongoose.model('Company',CompanySchema);