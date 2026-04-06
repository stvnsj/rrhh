

const conn = require("../services/db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");
const previred_service = require("../services/previredService");
const sqlMonth = require("../utils/sqlMonth");
const stringToDate = require("../utils/date")
var path = require('path');


exports.previred = (req, res, next) => {
    
    const year = req.params.year;
    const month = req.params.month;
    const SQL = `CALL aggregate_previred(build_date(${year},${month}))`
    conn.query(SQL, function (err, data, fields) {
	    if(err) return next(new AppError(err))
	    res.status(200).json({
	        status: "success",
	        length: data?.length,
	        data: data});
    });
};




exports.previredAbridged = (req, res, next) => {
    
    const year = req.params.year;
    const month = req.params.month;
    const SQL = `CALL previred_resumen(build_date(${year},${month}))`
    
    conn.query(SQL, function (err, data, fields) {
	if(err) return next(new AppError(err))
	res.status(200).json({
	    status: "success",
	    length: data?.length,
	    data: data,
	});
    });
};









