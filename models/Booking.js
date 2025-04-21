const mongoose = require('mongoose');

const BookingSchema=new mongoose.Schema({
    apptDate : {
        type : Date, 
        required : true,
        validate: {
            validator: function(value) {
                const start = new Date('2022-05-10');
                const end = new Date('2022-05-13T23:59:59.999Z');
                return value >= start && value <= end;
            },
            message: 'Booking date must be between May 10 and May 13, 2022'
        }
    },
    user:{
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required : true
    },
    company : {
        type : mongoose.Schema.ObjectId,
        ref : 'Company',
        required : true
    },
    createAt : {
        type : Date,
        default : Date.now
    }
});

module.exports=mongoose.model('Booking',BookingSchema);