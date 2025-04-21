const { json } = require('express');
const Company = require('../models/Company');
const Company = require('../models/Company');

exports.getCompanies = async (req,res,next) => {
        let query;

        //copy req.query
        const reqQuery = {...req.query};

        //Fieldes to exclude
        const removeFields = ['select','sort','page','limit'];

        //Loop over remove fields and delete them from reqQuery
        removeFields.forEach(param=>delete reqQuery[param]);
        console.log(reqQuery);  

        //create query string
        let queryStr=JSON.stringify(reqQuery);
        //create opeators $gt/...
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`);

        //finding resourse
        query = Company.find(JSON.parse(queryStr)).populate('appointments');

        //Select fields
        if(req.query.select){
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        //sort
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }
        else{
            query = query.sort('name');
        }

        //pagination
        const page=parseInt(req.query.page,10)||1;
        const limit=parseInt(req.query.limit,10)||25;
        const StartIndex = (page-1)*limit;
        const endIndex = page*limit;
        
    try{
        const total = await Company.countDocuments();

        query = query.skip(StartIndex).limit(limit);
        //Executing query
        const companies = await query;
        //pagination result
        const pagination={};

        if(endIndex<total){
            pagination.next={
                page:page+1,limit
            };
        }
        
        if(0<StartIndex){
            pagination.prev={
                page:page-1,limit
            };
        }
        //const companies = await Company.find(req.query);
        console.log(req.query);
        res.status(200).json({success:true,count:companies.length,pagination,data:companies});
    }
    catch(err){
        res.status(400).json({success:false});
    }
};

exports.getCompany = async (req,res,next) => {
    try{
        const company = await Company.findById(req.params.id);
        if(!company){
            return res.status(400).json({success:false});
        }
        res.status(200).json({success:true,data:company});
    }
    catch(err){
        res.status(400).json({success:false});
    }
    
};

exports.createCompany = async (req,res,next) => {
    //console.log(req.body);
    const company = await Compamy.create(req.body);
    res.status(201).json({success:true,data:company});
};

exports.updateCompany = async (req,res,next) => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
        if(!company){
            return res.status(400).json({success:false});
        }
        res.status(200).json({success:true,data:company});
    } catch (err) {
        res.status(400).json({success:false});
    }
};

exports.deleteCompany = async (req,res,next) => {
    try {
        const company = await Company.findById(req.params.id);
        //const company = await Company.findByIdAndDelete(req.params.id);
        if(!company){
            return res.status(400).json({success:false,msg:`Bootcamp not found with id of ${req.params.id}`});
        }
        await company.deleteOne();
        res.status(200).json({success:true,data:{}});
        
    } catch (err) {
        res.status(400).json({success:false});
    }
};

