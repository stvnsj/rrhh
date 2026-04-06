const conn = require("../services/db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");
const sqlDay = require("../utils/sqlDay");

/********************
 *     PUT          *
 ********************/







exports.edit = (req,res,next) => {



    const contrato_id = req.body.contrato_id;
    const costo       = req.body.costo;
    const labor       = req.body.labor;

    const values = [costo,labor,contrato_id];

    const SQL = `


UPDATE 
contratos
SET
costo = ?,
labor = ?
WHERE
id = ?
`;

    console.log(SQL);
    conn.query(SQL, values,
               function(err,data,fields){
                   if(err) return next( new AppError(err,500));
                   return res.status(201).json({
                       status:  "success",
                       message: "Contrato actualizado",
                   });

               });
};

/****************
 *    PUT       *
 ****************/

/* 
   STORED PROCEDURE NEEDED !!!

   This action should be validated. A termination should not be
   possibly undone if there is already another valid contrato

 */
exports.undoTerminateContrato = (req, res, next) => {

    const contrato_id = req.body.contrato_id;

    const SQL = `


UPDATE 
contratos

SET
vigente = 1,
termino = NULL,
causal_id = NULL

WHERE
id = ${contrato_id}

`
    

    conn.query(SQL,
               function(err,data,fields){
                   if(err) return next( new AppError(err,500));
                   return res.status(201).json({
                       status:  "success",
                       message: "Despido deshecho",
                   });
               });


};


/****************
 *    PUT       *
 ****************/
exports.editContrato = (req, res, next) => {


	const field        = req.body.field;
	const newvalue     = req.body.newvalue;
	const id           = req.body.id;
	const SQL = `
		UPDATE contratos
		SET 
		??=?
		WHERE id=?
	`;
	const values=[field,newvalue,id];

	conn.query(SQL, values,
	function (err, data, fields) {
		if (err) return next(new AppError(err, 500));
		res.status(201).json({
			status: "success",
			message: "Contrato Terminado",
		});
	});
};





/****************
 *    PUT       *
 ****************/
//  This method updates the contrato to
//  change attribute 'vigente' from 1 to 0,
//  that is, terminate it.
//
//  once terminated, it remains to be 
//  payed.
exports.terminateContrato = (req, res, next) => {

	const causal       = req.body.causal;

	const id           = req.body.id;
    
	const year         = req.body.year;
	const month        = req.body.month;
	const day          = req.body.day;

	const date         = year + '-' + month + '-' + day;
	
	const SQL = `CALL TERMINATE_CONTRATO(${causal},STR_TO_DATE(CONCAT(${year}, '-', ${month}, '-', ${day}), '%Y-%m-%d'),${id});`;


    console.log(SQL);


	conn.query(SQL,
		function (err, data, fields) {
				if (err) return next(new AppError(err, 500));
				res.status(201).json({
			status: "success",
			message: "Contrato Terminado",
		});
	});
};





/****************
 *    PUT       *
 ****************/
//  This method, updates the termination
//  date of the contract.
exports.safe_edit_fire = (req, res, next) => {

	const contrato_id  = req.body.contrato_id;
    const new_date     = req.body.new_date;

	
	const SQL = `CALL safe_edit_fire(${contrato_id},"${new_date}");`;
    const message = `Se actualizó la fecha de término del contrato ${contrato_id} a ${new_date}` 

    console.log(SQL);

	conn.query(SQL,
		function (err, data, fields) {
				if (err) return next(new AppError(err, 500));
				res.status(201).json({
			status: "success",
			message: message,
		});
	});
};




exports.safe_edit_start = (req, res, next) => {

	const contrato_id  = req.body.contrato_id;
    const new_date     = req.body.start;

	
	const SQL = `CALL edit_safe_start(${contrato_id},"${new_date}");`;
    const message = `Se actualizó el inicio del contrato ${contrato_id} a ${new_date}` 

    console.log(SQL);

	conn.query(SQL,
		function (err, data, fields) {
				if (err) return next(new AppError(err, 500));
				res.status(201).json({
			status: "success",
			message: message,
		});
	});
};

exports.safe_edit_end = (req, res, next) => {

	const contrato_id  = req.body.contrato_id;
    const new_date     = req.body.end;

	
	const SQL = `CALL edit_safe_end(${contrato_id},"${new_date}");`;
    const message = `Se actualizó el término del contrato ${contrato_id} a ${new_date}` 

    console.log(SQL);

	conn.query(SQL,
		function (err, data, fields) {
				if (err) return next(new AppError(err, 500));
				res.status(201).json({
			status: "success",
			message: message,
		});
	});
};

exports.edit_finiquito = (req, res, next) => {

	const contrato_id  = req.body.contrato_id;
    const new_date     = req.body.end;
    const id = req.body.id
    const finiquito = req.body.finiquito

	
	const SQL = `UPDATE contratos SET finiquito = ${finiquito} WHERE id = ${id};`;
    const message = `Se actualizó el término del contrato ${contrato_id} a ${new_date}` 

    console.log(SQL);

	conn.query(SQL,
		function (err, data, fields) {
				if (err) return next(new AppError(err, 500));
				res.status(201).json({
			status: "success",
			message: message,
		})
	})
}


/****************
 *    PUT       *
 ****************/
//  This method updates the contrato to
//  change attribute 'vigente' from 1 to 0,
//  that is, terminate it.
//
//  once terminated, it remains to be 
//  payed.
exports.payContrato = (req, res, next) => {

	const finiquito    = req.params.finiquito;
	const contrato_id  = req.params.contrato_id;
  const proyecto_id  = req.params.proyecto_id;

    
    const SQL = `

    UPDATE contratos
    SET 
    finiquito=${finiquito},
    proyecto_id=${proyecto_id},
    finiquitado=1
    WHERE id=${contrato_id};
	`

	// we make sure we got the expected params
  // if (!req.params.contrato_id) { return next(new AppError("No se encontró el contrato", 404));}

    conn.query(SQL,
		function (err, data, fields) {
		    if (err) return next(new AppError(err, 500));
		    res.status(201).json({
			status: "success",
			message: "Contrato Terminado",
		    });
		}
  );
};




/*****************
 *     POST      *
 *****************/

exports.terminated = (req, res, next) => {


    const values = [ req.body.empleado_id ,
                     req.body.costo       ,
                     req.body.labor       ,
                     req.body.inicio      ,
                     req.body.termino     ];

    

  


    conn.query(
	    "call create_terminated(?)",
	    [values],
	    function (err,data,fields) {
	        if(err) return next( new AppError(err,500));
	        res.status(201).json({
		        status: "success",
		        message: "Contrato retroactivo creado",
	        });
	    }
    );
}


/*****************
 *     POST      *
 *****************/
exports.create_new = (req, res, next) => {


    const values = [ req.body.empleado_id ,
                     req.body.costo       ,
                     req.body.base        ,
                     req.body.labor       ,
                     req.body.minimo      ,
                     req.body.formal      ,
                     req.body.inicio
                   ]

    const SQL = "call create_new (?)";
    

  


    conn.query(SQL,	[values],
	           function (err,data,fields) {
	               if(err) return next( new AppError(err,500));
	               res.status(201).json({
		               status: "success",
		               message: "Nuevo contrato creado"});});
}



exports.create = (req, res, next) => {


    if (!req.body) return next(new AppError("No form data found", 404));

    /* Values to be inserted on database */
    const values = [

		req.body.empleado_id,
		req.body.costo,
		req.body.base,
		req.body.labor,
		req.body.minimo,
		req.body.formal,
		req.body.inicio,
    ];

    conn.query(
	    "call CREATE_CONTRATO(?)",
	[values],
	function (err,data,fields) {
	    if(err) return next( new AppError(err,500));
	    res.status(201).json({
		status: "success",
		message: "proyecto created",
	    });
	}
    );
};


/*****************
 *     POST      *
 *****************/


exports.actualizar = (req, res, next) => {


    if (!req.body) return next(new AppError("No form data found", 404));



	const SQL = `CALL UPDATE_CONTRATO(${req.body.id},${req.body.costo},'${req.body.fecha}')`;



    conn.query(SQL,
	function (err,data,fields) {
	    if(err) return next( new AppError(err,500));
	    res.status(201).json({
		status: "success",
		message: "proyecto created",
	    });
	}
    );
};




/*****************
 *     POST      *
 *****************/


exports.createTerminated = (req, res, next) => {
    
    
    
    if (!req.body) return next(new AppError("No form data found", 404));
    
    /* Values to be inserted on database */
    const values = [
        
		req.body.empleado_id,
		req.body.costo,
		req.body.base,
		req.body.labor,
		req.body.minimo,
		req.body.formal,
		req.body.inicio,
    ];
    
    conn.query(
	    "call CREATE_CONTRATO(?)",
	    [values],
	    function (err,data,fields) {
	        if(err) return next( new AppError(err,500));
	        res.status(201).json({
		        status: "success",
		        message: "proyecto created",
	        });
	    }
    );
    
}






/*****************
 *     POST      *
 *****************/
exports.crear_anexo = (req, res, next) => {
    
    if (!req.body) return next(new AppError("No form data found", 404));

    
    
    /* Values to be inserted on database */
    const values = [
		req.body.costo,
		req.body.labor,
		req.body.inicio,
        req.body.base_id ];

    const sql = "call crear_anexo(?)"
    
    conn.query(sql, [values],
	           function (err,data,fields) {
	               if(err) return next( new AppError(err,500));
	               res.status(201).json({
		               status: "success",
		               message: "proyecto created",
	               });
	           });
    
}





// GET METHOD
exports.options = (req, res, next) => {
    const empleado_id = req.params.id;
    const SQL = `

SELECT
id as id,
CONCAT(
"(" , id , ") ",
DATE_FORMAT(inicio,'%d/%m/%Y'),
IF(vigente,
" Vigente" ,
CONCAT(" " , DATE_FORMAT(termino,'%d/%m/%Y')))) as label
FROM
contratos
WHERE empleado_id = ?
ORDER BY inicio DESC
`

    conn.query(SQL, [empleado_id], function (err, data, fields) {
	console.log(err)
	if(err) return next(new AppError(err))
	res.status(200).json({
	    status: "success",
	    length: data?.length,
	    data: data,
	});
    });

}



/***********
 *   GET   *
 ***********/
exports.getEmpleadoContrato = (req, res, next) => {

    const id = req.params.id;

    const SQL = `

SELECT
id,
empleado_id,
costo,
base,
labor,
minimo,
vigente,
formal,
finiquito,
DATE_FORMAT(inicio,'%d/%m/%Y') AS inicio,

CASE
  WHEN termino is NULL THEN "Vigente"
  ELSE DATE_FORMAT(termino,'%d/%m/%Y')
END as termino,

CASE
  WHEN termino is NULL THEN (DATEDIFF(CURDATE(),inicio)+1)
  ELSE (DATEDIFF(termino, inicio)+1)
END as duracion,


causal_id,
finiquito,
finiquitado,

CASE
  WHEN base_id IS NULL THEN 1
  ELSE 0
END AS inicial,

CASE
  WHEN anexo_id IS NULL THEN 1
  ELSE 0
END AS terminal,

proyecto_id,
inicio as date,
inicio as inicio_sql,
termino as termino_sql
FROM contratos
WHERE empleado_id=?
ORDER BY date DESC

`

    values = [id]

    conn.query(SQL, values, function (err, data, fields) {
	    if(err) return next(new AppError(err))
	    res.status(200).json({
	        status: "success",
	        length: data?.length,
	        data: data,
	    });
    });



}




/***********
 *   GET   *
 ***********/
/* Empleados without a currently active contrato */
exports.getNotContrato = (req, res, next) => {

    const SQL =`

		WITH contratados AS (

			SELECT DISTINCT
			empleados.id,
			empleados.rut,
			CONCAT(
				empleados.nombre, ' ',
				empleados.apellido_paterno, ' ',
				IFNULL(empleados.apellido_materno, '')
			) AS nombre,
			C.id    AS contrato_id

			FROM empleados LEFT JOIN contratos C
			ON empleados.id = C.empleado_id
			AND C.vigente=1
		)

		SELECT 
		contratados.id,
		contratados.rut,
		contratados.nombre
		FROM contratados
		WHERE contrato_id IS NULL
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



/***********
 *   GET   *
 ***********/
exports.getProfile = (req, res, next) => {

	const id = req.params.id;

    const SQL =`

		SELECT * FROM contratos 
		WHERE id = ? 
	`
	values = [id]

    
    conn.query(SQL, values,function (err, data, fields) {
	if(err) return next(new AppError(err))
	res.status(200).json({
	    status: "success",
	    length: data?.length,
	    data: data,
	});
    });
};






/***********
 *   GET   *
 ***********/
/* empleados with an active contrato */
exports.getContrato = (req, res, next) => {

    const SQL = `

		SELECT 
		empleados.id,
		empleados.rut,
		DATE_FORMAT(CONTRATO_INICIO(C.id),'%d/%m/%Y') AS inicio,
		C.labor,
		C.formal,
		CONCAT(
			empleados.nombre , ' ',
			empleados.apellido_paterno, ' ',
			IFNULL(empleados.apellido_materno, '')
		) AS nombre,


		C.id AS contrato_id

		FROM empleados 
		INNER JOIN contratos C
		ON empleados.id = C.empleado_id
		WHERE C.vigente = 1
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

/***********
 *   GET   *
 ***********/
/* Contratos terminated but unpaid */
exports.getUnpaid = (req, res, next) => {

    const SQL =`

		SELECT

		C.id as contrato_id,
		DATE_FORMAT(C.termino,'%d/%m/%Y') AS termino,
		C.labor,
		E.id,
		E.rut,
		CONCAT(
			E.nombre, ' ',
			E.apellido_paterno, ' ',
			IFNULL(E.apellido_materno, '')
		) AS nombre

		FROM contratos C
		INNER JOIN empleados E
		ON C.empleado_id = E.id
		WHERE C.vigente=0 AND C.anexo_id IS NULL AND C.finiquitado=0 AND C.formal=1;
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


/***********
 *   GET   *
 ***********/
/* All formal contatros terminated and paid */
exports.getOld = (req, res, next) => {



	const SQL = `call contratos_terminados()`

    
    conn.query(SQL, function (err, data, fields) {
		if(err) return next(new AppError(err))
		console.log(data)
		res.status(200).json({
		    status: "success",
		    length: data?.length,
		    data: data[0],
		});
    });

};
