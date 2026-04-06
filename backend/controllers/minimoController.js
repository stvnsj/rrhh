
const conn = require("../services/db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");



/*==================================
*        _____ ______ _______ 
*       / ____|  ____|__   __|
*      | |  __| |__     | |   
*      | | |_ |  __|    | |   
*      | |__| | |____   | |   
*       \_____|______|  |_|   
*
*==================================*/


exports.getAll = (req, res, next) => {

  const SQL = `
  
      SELECT * FROM minimos ORDER BY fecha DESC;
  `

  conn.query(SQL, function (err, data, fields) {
    if(err) return next(new AppError(err))
    res.status(200).json({
      status: "success",
      length: data?.length,
      data: data,
    });
  });
};



/*==================================
*   _____   ____   _____ _______ 
*  |  __ \ / __ \ / ____|__   __|
*  | |__) | |  | | (___    | |   
*  |  ___/| |  | |\___ \   | |   
*  | |    | |__| |____) |  | |   
*  |_|     \____/|_____/   |_|   
*
*==================================*/

exports.create = (req, res, next) => {


  if (!req.body) return next(new AppError("No form data found", 404));

  /* Values to be inserted on database */
  const values = [

    req.body.sueldo,
    req.body.fecha,
  ];

  const SQL = `

    INSERT INTO minimos (sueldo,fecha) VALUES(?)
    
  `

  conn.query(SQL,[values],
    function (err,data,fields) {
      if(err) return next( new AppError(err,500));
      res.status(201).json({
        status: "success",
        message: "Sueldo minimo creado exitosamente",
      });
    }
  );
};
