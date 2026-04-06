
const conn = require("../services/db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");




/*=================================
 *
 *         POST METHODS
 * 
 *=================================*/

exports.create = (req, res, next) => {


    if (!req.body) return next(new AppError("No form data found", 404));

    /* Values to be inserted on database */
    const values = [

		req.body.nombre,
		req.body.apellido_paterno,
		req.body.apellido_materno,
		req.body.telefono,
		req.body.cuenta,
		req.body.email,
		req.body.banco_id,
		req.body.cuenta_id,
		req.body.region_id,
		req.body.comuna_id,
		req.body.domicilio,
    req.body.numero_domicilio,
    req.body.departamento,
		req.body.rut,
		req.body.salud,
		req.body.prevision,
    ];

	const SQL = `
    INSERT INTO 
    empleados (
      nombre,
      apellido_paterno,
      apellido_materno,
      telefono,cuenta,
      email,banco_id,
      cuenta_id,
      region_id,
      comuna_id,
      domicilio,
      numero_domicilio,
      departamento,
      rut,
      salud,
      prevision) 

    VALUES(?)`

    conn.query(SQL,[values],
	function (err,data,fields) {
	    if(err) return next( new AppError(err,500));
	    res.status(201).json({
		status: "success",
		message: "proyecto created",
	    });
	}
    );
};


/*=================================
 *
 *         GET METHODS
 * 
 *=================================*/


/* 
This method gets all empleados from empleados table 
*/
exports.getAll = (req, res, next) => {


  const SQL = `

    SELECT
    id,              
    CONCAT(nombre, ' ', apellido_paterno) AS nombre,           
    apellido_paterno, 
    apellido_materno, 
    telefono,         
    cuenta,           
    email,            
    banco_id,         
    cuenta_id,        
    region_id,        
    comuna_id,        
    domicilio,        
    numero_domicilio, 
    departamento,     
    rut,              
    salud,            
    prevision
    
    FROM  empleados;
  
  
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


/* 
This method gets all empleados from empleados table 
*/
exports.getList = (req, res, next) => {

	const SQL = `


		SELECT 
		E.id,
		CONCAT (
			E.nombre, ' ',
			E.apellido_paterno, ' ',
			IFNULL(E.apellido_materno,'')
		) AS nombre,
		
		E.rut
		FROM empleados E;
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



exports.getProfile = (req, res, next) => {


	const id = req.params.id;

	const SQL = `

		SELECT

    
    id,              
    CONCAT(nombre, ' ', apellido_paterno) AS nombre,           
    apellido_paterno, 
    apellido_materno, 
    telefono,         
    cuenta,           
    email,            
    banco_id,         
    cuenta_id,        
    region_id,        
    comuna_id,        
    domicilio,        
    numero_domicilio, 
    departamento,     
    rut,              
    salud,            
    prevision
    
    
    FROM empleados WHERE id=${id};
	
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




// This method get all proyectos a given empleado is in.
exports.getProyectos = (req, res, next) => {

	const id = req.params.id;

	const SQL = `
	
		SELECT * FROM proyectos P
		INNER JOIN proyecto_empleado PE
		ON P.id = PE.proyecto_id
		AND PE.empleado_id = ${id};
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


/*=================================
 *
 *         PUT METHODS
 * 
 *=================================*/

exports.updateEmpleado = (req, res, next) => {


	const newvalue     = req.body.newvalue;
	const col          = req.body.col;
	const id           = req.body.id;

    const values       = [col,newvalue,id];
    
    const SQL = `

		/*== START QUERY ==*/

		UPDATE empleados
		SET 
		??=?
		WHERE id=?

		/*== END QUERY ==*/
	`




    conn.query(SQL, values,
		function (err, data, fields) {
		    if (err) return next(new AppError(err, 500));
		    res.status(201).json({
			status: "success",
			message: "Contrato Terminado",
		    });
		}
    );
};

