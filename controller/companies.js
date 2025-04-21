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
        query = Company.find(JSON.parse(queryStr)).populate('bookings');

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
    try {
        console.log('Creating company with data:', req.body);
        
        const company = await Company.create(req.body);
        
        res.status(201).json({success:true, data:company});
    } catch (err) {
        console.error('Create company error:', err.message);
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
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
/**
 * @desc    Update maximum slots for a company
 * @route   PUT /api/companies/:id/slots
 * @access  Private/Admin
 */
exports.updateMaxSlots = async (req, res, next)=>{
    try{
        const {maxSlots} = req.body;
        //validate input
        if(!maxSlots|| !Number.isInteger(maxSlots) || maxSlots <1){
            return res.status(400).json({
                success: false,
                error : 'Please provide a valid positive integer for maximum slots'
            });
        }

        const company = await Company.findByIdAndUpdate(
            req.params.id,
            {maxSlots},
            {new: true, runValidators: true}  
        );
        if(!company){
            return res.status(404).json({
                success: false,
                error: `Company with id ${req.params.id} not found`
            });
        }
        res.status(200).json({
            success: true,
            data: company
        });
    }catch (err) {
        console.log(err.stack);
        res.status(500).json({
            success: false,
            error: 'Server error updating maximum slots'
        });
    }
};