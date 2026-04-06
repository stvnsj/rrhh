const conn = require("../services/db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");


// PUT METHODS

exports.editBono = (req, res, next) => {

    const proyecto_id  = req.body.proyecto_id;
    const valor        = req.body.valor;
    const fecha        = req.body.fecha;
    const comentario   = req.body.comentario;
    const contrato_id  = req.body.contrato_id;
    const id           = req.body.id;

    const SQL = `
		UPDATE 
		bonos
		SET
		proyecto_id  = ?,
		bono         = ?,
		fecha        = ?,
		comentario   = ?,
		contrato_id  = ?
		WHERE
		id = ?
	`
    

    conn.query(SQL,[proyecto_id,valor,fecha,comentario,contrato_id, id],
               function(err,data,fields){
		   console.log("exports.editBono")
		   console.log(err)
                   if(err) return next( new AppError(err,500));
                   return res.status(201).json({
                       status:  "success",
                       message: "Bono editado",
                   });
               });


};






exports.editDescuento = (req, res, next) => {

    const proyecto_id  = req.body.proyecto_id;
    const valor        = req.body.valor;
    const fecha        = req.body.fecha;
    const comentario   = req.body.comentario;
    const contrato_id  = req.body.contrato_id;
    const id           = req.body.id;

    const SQL = `
		UPDATE 
		descuentos
		SET
		proyecto_id  = ?,
		descuento    = ?,
		fecha        = ?,
		comentario   = ?,
		contrato_id  = ?
		WHERE
		id = ?
	`
    

    conn.query(SQL,[proyecto_id,valor,fecha,comentario,contrato_id, id],
               function(err,data,fields){
		   console.log(err)
                   if(err) return next( new AppError(err,500));
                   return res.status(201).json({
                       status:  "success",
                       message: "Descuento editado",
                   });
               });


};



exports.editAnticipo = (req, res, next) => {

    const proyecto_id  = req.body.proyecto_id;
    const valor        = req.body.valor;
    const fecha        = req.body.fecha;
    const comentario   = req.body.comentario;
    const contrato_id  = req.body.contrato_id;
    const id           = req.body.id;

    const SQL = `
		UPDATE 
		anticipos
		SET
		proyecto_id  = ?,
		anticipo     = ?,
		fecha        = ?,
		comentario   = ?,
		contrato_id  = ?
		WHERE
		id = ?
	`
    

    conn.query(SQL,[proyecto_id,valor,fecha,comentario,contrato_id, id],
               function(err,data,fields){
		   			console.log(err)
                   	if(err) return next( new AppError(err,500));
                   	return res.status(201).json({
                       status:  "success",
                       message: "Anticipo editado",
                   	});
               	});
};










/*=========================*
 *      DELETE METHODS     *
 *=========================*/
exports.deleteBono = (req, res, next) => {
	
	const id = req.params.id;

	const SQL = `DELETE FROM bonos WHERE id=${id}`
    
    conn.query(
	SQL,
	function (err,data,fields) {
	    if(err) return next( new AppError(err,500));
	    res.status(201).json({
		status: "success",
		message: "Bono successfully created",
	    });
	}
    );
};


exports.deleteDescuento = (req, res, next) => {
	
	const id = req.params.id;

	const SQL = `DELETE FROM descuentos WHERE id=${id}`
    
    conn.query(
	SQL,
	function (err,data,fields) {
	    if(err) return next( new AppError(err,500));
	    res.status(201).json({
		status: "success",
		message: "Bono successfully created",
	    });
	}
    );
};

exports.deleteTraslado = (req, res, next) => {
	
	const id = req.params.id;

	const SQL = `DELETE FROM traslados WHERE id=${id}`
    
    conn.query(
	SQL,
	function (err,data,fields) {
	    if(err) return next( new AppError(err,500));
	    res.status(201).json({
		status: "success",
		message: "Bono successfully created",
	    });
	}
    );
};

exports.deleteAnticipo = (req, res, next) => {
	
	const id = req.params.id;

	const SQL = `DELETE FROM anticipos WHERE id=${id}`
    
    conn.query(
	SQL,
	function (err,data,fields) {
	    if(err) return next( new AppError(err,500));
	    res.status(201).json({
		status: "success",
		message: "Bono successfully created",
	    });
	}
    );
};






/*=======================================
* 
*           POST METHODS
*
=========================================*/

exports.createBono = (req, res, next) => {

    if (!req.body) return next(new AppError("No form data found", 404));
    
    const values = [
		
	req.body.empleado_id,
	req.body.proyecto_id,
	req.body.valor,
	req.body.fecha,
	req.body.comentario,
	req.body.contrato		
    ];

    console.log(values);
    
    conn.query(
		"INSERT INTO bonos (empleado_id,proyecto_id,bono,fecha,comentario,contrato_id) VALUES(?)",
		[values],
		function (err,data,fields) {
			if(err) return next( new AppError(err,500));
			res.status(201).json({
			status: "success",
			message: "Bono creado con éxito",
			});
		}
    );
};






exports.createAnticipo = (req, res, next) => {

	if (!req.body) return next(new AppError("No form data found", 404));
    
    const values = [
			
		req.body.empleado_id,
		req.body.proyecto_id,
		req.body.valor,
		req.body.fecha,
		req.body.comentario,
		req.body.contrato		
    ];

    console.log(values);
    
    conn.query(
		"INSERT INTO anticipos (empleado_id,proyecto_id,anticipo,fecha,comentario,contrato_id) VALUES(?)",
		[values],
		function (err,data,fields) {
			if(err) return next( new AppError(err,500));
			res.status(201).json({
			status: "success",
			message: "Anticipo creado con éxito",
			});
		}
    );
};



exports.createDescuento = (req, res, next) => {

    if (!req.body) return next(new AppError("No form data found", 404));
    
    const values = [
		
	req.body.empleado_id,
	req.body.proyecto_id,
	req.body.valor,
	req.body.fecha,
	req.body.comentario,
	req.body.contrato		
    ];

    console.log(values);
    
    conn.query(
		"INSERT INTO descuentos (empleado_id,proyecto_id,descuento,fecha,comentario,contrato_id) VALUES(?)",
		[values],
		function (err,data,fields) {
			if(err) return next( new AppError(err,500));
			res.status(201).json({
			status: "success",
			message: "Descuento creado con éxito",
			});
		}
    );
};



exports.createTraslado = (req, res, next) => {

    if (!req.body) return next(new AppError("No form data found", 404));
    
    const values = [

	req.body.empleado_id,
	req.body.proyecto_id,
	req.body.valor,
	req.body.fecha,
	req.body.comentario,
    ];

    console.log(values);
    
    conn.query(
	"INSERT INTO traslados (empleado_id,proyecto_id,traslado,fecha,comentario) VALUES(?)",
	[values],
	function (err,data,fields) {
	    if(err) return next( new AppError(err,500));
	    res.status(201).json({
		status: "success",
		message: "Traslado successfully created",
	    });
	}
    );
};




/*=======================================
 * 
 *             GET METHODS
 *
 =========================================*/


exports.getBonoEmpleado = (req, res, next) => {
    
    var empleado_id = req.params.empleado_id
    
    var SQL = `
		SELECT
		B.id          as id,
		P.nombre      as proyecto,
		B.bono        as monto,
		DATE_FORMAT(fecha,'%d/%m/%Y') as fecha,
		B.comentario  as comentario,
		B.contrato_id as contrato,
		B.contrato_id as contrato_id,
		B.proyecto_id as proyecto_id,
		B.fecha as datetime
		FROM
		bonos B JOIN proyectos P
		ON   B.proyecto_id = P.id
		AND  B.empleado_id = ${empleado_id}
		ORDER BY B.fecha DESC
	`
    
    conn.query(SQL, function (err, data, fields) {
		console.log(err)
		if(err) return next(new AppError(err))
		res.status(200).json({
			status: "success",
			length: data?.length,
			data: data,
		});
    });    
};




exports.getDescuentoEmpleado = (req, res, next) => {
    
    var empleado_id = req.params.empleado_id
    
    var SQL = `
		SELECT
		B.id          as id,
		P.nombre      as proyecto,
		B.descuento   as monto,
		DATE_FORMAT(fecha,'%d/%m/%Y') as fecha,
		B.comentario  as comentario,
		B.contrato_id as contrato,
		B.contrato_id as contrato_id,
		B.proyecto_id as proyecto_id,
		B.fecha as datetime
		FROM
		descuentos B JOIN proyectos P
		ON   B.proyecto_id = P.id
		AND  B.empleado_id = ${empleado_id}
		ORDER BY B.fecha DESC
	`
    
    conn.query(SQL, function (err, data, fields) {
		console.log(err)
		if(err) return next(new AppError(err))
		res.status(200).json({
			status: "success",
			length: data?.length,
			data: data,
		});
    });    
};




exports.getAnticipoEmpleado = (req, res, next) => {
    
    var empleado_id = req.params.empleado_id
    
    var SQL = `
		SELECT
		B.id          as id,
		P.nombre      as proyecto,
		B.anticipo        as monto,
		DATE_FORMAT(fecha,'%d/%m/%Y') as fecha,
		B.comentario  as comentario,
		B.contrato_id as contrato,
		B.contrato_id as contrato_id,
		B.proyecto_id as proyecto_id,
		B.fecha as datetime
		FROM
		anticipos B JOIN proyectos P
		ON   B.proyecto_id = P.id
		AND  B.empleado_id = ${empleado_id}
		ORDER BY B.fecha DESC
	`
    
    conn.query(SQL, function (err, data, fields) {
		console.log(err)
		if(err) return next(new AppError(err))
		res.status(200).json({
			status: "success",
			length: data?.length,
			data: data,
		});
    });    
};




exports.bonoHistory = (req, res, next) => {
        
    var SQL = `

		SELECT

		B.id          					as id,
		P.nombre      					as proyecto,
		B.bono        					as monto,
		DATE_FORMAT(fecha,'%d/%m/%Y') 	as fecha,
		B.comentario  					as comentario,
		B.contrato_id 					as contrato,
		B.contrato_id 					as contrato_id,
		B.proyecto_id 					as proyecto_id,
		B.fecha 						as datetime,
		CONCAT(E.nombre , " " , E.apellido_paterno) as empleado,
		B.empleado_id                   as empleado_id

		FROM
		bonos B

		INNER JOIN proyectos P
		ON   B.proyecto_id = P.id

		INNER JOIN empleados E
		ON   B.empleado_id = E.id

		ORDER BY B.fecha DESC
	`
    
    conn.query(SQL, function (err, data, fields) {
		console.log(err)
		if(err) return next(new AppError(err))
		res.status(200).json({
			status: "success",
			length: data?.length,
			data: data,
		});
    });    
};





exports.descuentoHistory = (req, res, next) => {
        
    var SQL = `

		SELECT

		B.id          					as id,
		P.nombre      					as proyecto,
		B.descuento    					as monto,
		DATE_FORMAT(fecha,'%d/%m/%Y') 	as fecha,
		B.comentario  					as comentario,
		B.contrato_id 					as contrato,
		B.contrato_id 					as contrato_id,
		B.proyecto_id 					as proyecto_id,
		B.fecha 						as datetime,
		CONCAT(E.nombre , " " , E.apellido_paterno) as empleado,
		B.empleado_id                   as empleado_id

		FROM
		descuentos B

		INNER JOIN proyectos P
		ON   B.proyecto_id = P.id

		INNER JOIN empleados E
		ON   B.empleado_id = E.id

		ORDER BY B.fecha DESC
	`
    
    conn.query(SQL, function (err, data, fields) {
		console.log(err)
		if(err) return next(new AppError(err))
		res.status(200).json({
			status: "success",
			length: data?.length,
			data: data,
		});
    });    
};



exports.anticipoHistory = (req, res, next) => {
        
    var SQL = `

		SELECT

		B.id          					as id,
		P.nombre      					as proyecto,
		B.anticipo     					as monto,
		DATE_FORMAT(fecha,'%d/%m/%Y') 	as fecha,
		B.comentario  					as comentario,
		B.contrato_id 					as contrato,
		B.contrato_id 					as contrato_id,
		B.proyecto_id 					as proyecto_id,
		B.fecha 						as datetime,
		CONCAT(E.nombre , " " , E.apellido_paterno) as empleado,
		B.empleado_id                   as empleado_id

		FROM
		anticipos B

		INNER JOIN proyectos P
		ON   B.proyecto_id = P.id

		INNER JOIN empleados E
		ON   B.empleado_id = E.id

		ORDER BY B.fecha DESC
	`
    
    conn.query(SQL, function (err, data, fields) {
		console.log(err)
		if(err) return next(new AppError(err))
		res.status(200).json({
			status: "success",
			length: data?.length,
			data: data,
		});
    });    
};






exports.getAllBonos = (req, res, next) => {

	var SQL = `
		SELECT
		G.id              AS gasto_id,
		G.bono            AS valor,
		G.fecha,
		G.comentario,
		E.*,
		P.id              AS proyecto_id,
		P.nombre          AS proyecto_nombre

		FROM bonos G

		INNER JOIN empleados E
		ON G.empleado_id = E.id

		LEFT JOIN proyectos P
		ON G.proyecto_id = P.id
	`

	if(req.params.empleado_id && req.params.proyecto_id) 
	SQL = SQL + ' ' + `WHERE E.id=${req.params.empleado_id} AND P.id=${req.params.proyecto_id}`

	else if (req.params.empleado_id)
	SQL = SQL + ' ' + `WHERE E.id=${req.params.empleado_id}`

	else if (req.params.proyecto_id)
	SQL = SQL + ' ' + `WHERE P.id=${req.params.proyecto_id}`


 conn.query(SQL, function (err, data, fields) {
   if(err) return next(new AppError(err))
   res.status(200).json({
     status: "success",
     length: data?.length,
     data: data,
   });
 });
};


exports.getAllAnticipos = (req, res, next) => {


	var SQL = `
	
	SELECT
	G.id              AS gasto_id,
	G.anticipo        AS valor,
	G.fecha,
	G.comentario,
	E.*,
	P.id              AS proyecto_id,
	P.nombre          AS proyecto_nombre

	FROM anticipos G

	INNER JOIN empleados E
	ON G.empleado_id = E.id

	LEFT JOIN proyectos P
	ON G.proyecto_id = P.id
	`

	if(req.params.empleado_id && req.params.proyecto_id) 
	SQL = SQL + ' ' + `WHERE E.id=${req.params.empleado_id} AND P.id=${req.params.proyecto_id}`

	else if (req.params.empleado_id) 
	SQL = SQL + ' ' + `WHERE E.id=${req.params.empleado_id}`

	else if (req.params.proyecto_id) 
	SQL = SQL + ' ' + `WHERE P.id=${req.params.proyecto_id}`


 conn.query(SQL, function (err, data, fields) {
   if(err) return next(new AppError(err))
   res.status(200).json({
     status: "success",
     length: data?.length,
     data: data,
   });
 });
};


exports.getAllDescuentos = (req, res, next) => {

	var SQL = `
	
	SELECT

	G.id              AS gasto_id,
	G.descuento       AS valor,
	G.fecha,
	G.comentario,
	E.*,
	P.id              AS proyecto_id,
	P.nombre          AS proyecto_nombre

	FROM descuentos G

	INNER JOIN empleados E
	ON G.empleado_id = E.id

	LEFT JOIN proyectos P
	ON G.proyecto_id = P.id

`

if(req.params.empleado_id && req.params.proyecto_id) 
SQL = SQL + ' ' + `WHERE E.id=${req.params.empleado_id} AND P.id=${req.params.proyecto_id}`

else if (req.params.empleado_id)
SQL = SQL + ' ' + `WHERE E.id=${req.params.empleado_id}`

else if (req.params.proyecto_id)
SQL = SQL + ' ' + `WHERE P.id=${req.params.proyecto_id}`


 conn.query(SQL, function (err, data, fields) {
   if(err) return next(new AppError(err))
   res.status(200).json({
     status: "success",
     length: data?.length,
     data: data,
   });
 });
};


exports.getAllTraslados = (req, res, next) => {

	var SQL = `
	
		SELECT
		G.id              AS gasto_id,
		G.traslado        AS valor,
		G.fecha,
		G.comentario,
		E.*,
		P.id              AS proyecto_id,
		P.nombre          AS proyecto_nombre

		FROM traslados G

		INNER JOIN empleados E
		ON G.empleado_id = E.id

		LEFT JOIN proyectos P
		ON G.proyecto_id = P.id

	`

	if(req.params.empleado_id && req.params.proyecto_id) 
	SQL = SQL + ' ' + `WHERE E.id=${req.params.empleado_id} AND P.id=${req.params.proyecto_id}`

	else if (req.params.empleado_id)
	SQL = SQL + ' ' + `WHERE E.id=${req.params.empleado_id}`

	else if (req.params.proyecto_id)
	SQL = SQL + ' ' + `WHERE P.id=${req.params.proyecto_id}`


 	conn.query(SQL, function (err, data, fields) {
 	  if(err) return next(new AppError(err))
 	  res.status(200).json({
 	    status: "success",
 	    length: data?.length,
 	    data: data,
 	  });
 	});
};




