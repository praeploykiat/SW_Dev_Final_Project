const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');

//load var
dotenv.config({path:'./config/config.env'});

//connect database
connectDB();

const app = express();
//BODY PARSER
app.use(express.json());
//cookieparser
app.use(cookieParser());

// app.get('/',(req,res) => {
//     //res.send('<h1>Hello from express</h1>');
//     //res.send({name:'Brad'});
//     //res.json({name:'Brad'});
//     //res.sendStatus(400);
//     //res.status(400).json({success:false});
//     res.status(200).json({success:true,data:{id:1}});
// });


// app.get('/api/v1/companies',(req,res) => {
//     res.status(200).json({success:true,msg:'Show all companies'});
// });

// app.get('/api/v1/companies/:id', (req,res) => {
//     res.status(200).json({success:true,msg:`Show company ${req.params.id}`});
// });

// app.post('/api/v1/companies/', (req,res) => {
//     res.status(200).json({success:true,msg:'Create new Company'});
// });

// app.put('/api/v1/companies/:id',(req,res) => {
//     res.status(200).json({success:true,msg:`Update company ${req.params.id}`});
// });

// app.delete('/api/v1/companies/:id' , (req,res) => {
//     res.status(200).json({success:true,msg:`Delete company ${req.params.id}`});
// });

//Rout files
const companies = require('./routes/companies');
app.use('/api/v1/companies',companies);

const auth = require('./routes/auth');
app.use('/api/v1/auth',auth);

const appointments = require('./routes/appointments');
app.use('/api/v1/appointments',appointments);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT,console.log('Server running in ',process.env.NODE_ENV,' mode on port ',PORT));

//handle unhandle promise rejections
process.on('unhandleRejection',(err,promise)=>{
    console.log(`Error:${err.message}`);
    server.close(()=>process.exit(1));
});