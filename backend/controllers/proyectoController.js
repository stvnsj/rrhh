const conn = require("../services/db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");



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

    //Values to be inserted on database 
    const values = [

			req.body.fecha_inicio,
			req.body.lugar,
			req.body.nombre,
			req.body.descripcion,
			req.body.region_id,
			req.body.comuna_id,
			req.body.precio,
			req.body.expect,
			req.body.tiempo_estimado,
			req.body.tiempo_oficial,
    ];

    const SQL = `
      
      INSERT INTO proyectos (fecha_inicio,lugar,nombre,descripcion,region_id,comuna_id,precio,expect,tiempo_estimado, tiempo_oficial) 
      VALUES(?)
      
    `

    conn.query( SQL, [values],
	function (err,data,fields) {
	    if(err) return next( new AppError(err,500));
	    res.status(201).json({
		status: "success",
		message: "Message Successfully",
	    });
	});
};



exports.addEmpleado = (req, res, next) => {

  if (!req.body) return next(new AppError("No form data found", 404));

  /* Values to be inserted on database */
  const values = [


    req.body.proyecto_id,
    req.body.empleado_id,
    
  ];

    conn.query(
	"INSERT INTO proyecto_empleado (proyecto_id, empleado_id) VALUES(?)",
	[values],
	function (err,data,fields) {
	    if(err) return next( new AppError(err,500));
	    res.status(201).json({
		status: "success",
		message: "Empleado Added Successfully to Proyecto",
	    });
	});
};









/*==================================
 *       _____  _    _ _______ 
 *      |  __ \| |  | |__   __|
 *      | |__) | |  | |  | |   
 *      |  ___/| |  | |  | |   
 *      | |    | |__| |  | |   
 *      |_|     \____/   |_|   
 * 
 *==================================*/



exports.updateProyecto = (req, res, next) => {


	const newvalue     = req.body.newvalue;
	const col          = req.body.col;
	const id           = req.body.id;

    const values       = [col,newvalue,id];
    
    const SQL = `

		/*== START QUERY ==*/

		UPDATE proyectos
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
			message: "Proyecto exitosamente editado",
		    });
		}
    );
};






/*==================================
 *        _____ ______ _______ 
 *       / ____|  ____|__   __|
 *      | |  __| |__     | |   
 *      | | |_ |  __|    | |   
 *      | |__| | |____   | |   
 *       \_____|______|  |_|   
 *
 *==================================*/



exports.get = (req, res, next) => {

  const SQL = `
  
    SELECT 
    id     AS id,
    nombre AS label
    FROM proyectos
  `

  console.log(SQL);

  conn.query(SQL, function (err, data, fields) {
    if(err) return next(new AppError(err))
    res.status(200).json({
        status: "success",
        length: data?.length,
        data: data,
    });
      });
};




/* This method gets a proyecto report */
exports.getReport = (req, res, next) => {

    const year             = req.params.year;
    const month            = req.params.month;
	const proyecto_id      = req.params.proyecto_id;


    let anno_termino = parseInt(year);
    let mes_termino = parseInt(month) + 1;

    if(mes_termino>12){
        mes_termino = 1;
        anno_termino = anno_termino + 1;
    }

    const inicio  = year+'-'+month+'-1';
    const termino = anno_termino +'-'+mes_termino+'-1';

    
    const SQL = `


	WITH REPORTE AS 
	(




		-- ===============================================
		-- ============= SELECTED COLUMNS ================
		-- ===============================================

		SELECT 

		empleados.id AS empleado_id,

		CONCAT(
			empleados.nombre,' ',
			empleados.apellido_paterno,' ',
			IFNULL(empleados.apellido_materno,'')
		) AS nombre,

		IFNULL(DT,0) AS DT,

		(
			CASE
				WHEN DT IS NULL THEN 0
				WHEN DT IS NOT NULL THEN DT*costo
			END
		) AS sueldo_mensual,

		IFNULL(total_bonos,0) AS total_bonos,
		IFNULL(total_descuentos,0) AS total_descuentos,
		IFNULL(total_traslados,0) AS total_traslados,

		(IFNULL(costo_mensual,0) + IFNULL(total_bonos,0) - IFNULL(total_descuentos,0)) AS liquido


		
		-- ===============================================
		-- ==========  SELECTED COLUMNS ==================
		-- ===============================================
		
		FROM empleados 





		LEFT JOIN 
		(
	
			SELECT 
			SUM(C.costo) AS costo_mensual,
			C.empleado_id
	
			FROM contratos AS C 
			INNER JOIN (SELECT * FROM asistencias WHERE fecha < '${termino}' AND fecha>='${inicio}') AS A
	
			ON C.empleado_id =  A.empleado_id
			AND A.fecha >= C.inicio
			AND (C.vigente = 1 OR A.fecha <= C.termino)
			AND A.registro = 1
			GROUP BY C.empleado_id
	
		) AS pactado_mensual
	
		ON empleados.id = pactado_mensual.empleado_id
	
	
	
		
		LEFT JOIN
		
		-- ================= ASISTENCIA ====================
		(
		SELECT empleado_id, SUM(registro) AS DT
		FROM asistencias
		WHERE proyecto_id=${proyecto_id} AND fecha<'${termino}' AND fecha>='${inicio}'
		GROUP BY empleado_id
		) ASISTENCIA
		-- ================= ASISTENCIA ====================
		
		ON empleados.id = ASISTENCIA.empleado_id
		

		-- This JOIN was formerly INNER,
		-- but this results in the exclusion of all 
		-- empleados who have no contrato.
		-- With LEFT, all empleados are included in 
		-- report, and therefore their 'bonos', 'anticipos',
		-- 'traslados' are taken into account.
		LEFT JOIN 
		
		-- ============== CONTRATO ================
		(
			SELECT 
			contratos.costo,
			contratos.empleado_id, 
			contratos.labor,
			contratos.inicio,
			contratos.termino,
			contratos.formal
			FROM contratos
			INNER JOIN(
			-- This table contains empleado_id and the maximum fecha
			-- of his contratos.
			SELECT empleado_id, MAX(inicio) AS fecha
			FROM contratos WHERE inicio < '${termino}' AND (vigente=1 OR termino >= '${inicio}')
			GROUP BY empleado_id ) C
			ON contratos.empleado_id = C.empleado_id
			AND contratos.inicio = C.fecha
		) CONTRATO
		-- ============== CONTRATO ================
		
		ON CONTRATO.empleado_id = empleados.id
		
		JOIN
		
		-- ================ MINIMO ==================
		(
		SELECT sueldo AS sueldo_minimo FROM minimos
		INNER JOIN( 
		SELECT MAX(fecha) AS max_date 
		FROM minimos WHERE fecha < '${termino}' ) M
		ON minimos.fecha = M.max_date
		) MINIMO
		-- ================ MINIMO ==================
		
		LEFT JOIN
		
		-- ============== BONO ==================
		(
		SELECT empleado_id, SUM(bono) AS total_bonos 
		FROM bonos 
		WHERE proyecto_id=${proyecto_id} AND fecha >= '${inicio}' AND fecha < '${termino}'
		GROUP BY empleado_id
		) BONO
		-- =============== BONO ==================
		
		ON empleados.id = BONO.empleado_id
		
		LEFT JOIN
		
		-- ================== DESCUENTO ====================
		(
		SELECT empleado_id, SUM(descuento) AS total_descuentos
		FROM descuentos 
		WHERE proyecto_id=${proyecto_id} AND fecha >= '${inicio}' AND fecha < '${termino}'  
		GROUP BY empleado_id
		) DESCUENTO
		-- ================== DESCUENTO ====================
		
		ON empleados.id = DESCUENTO.empleado_id



		LEFT JOIN
			
		-- ================== TRASLADO ====================
		(
		SELECT empleado_id, SUM(traslado) AS total_traslados
		FROM traslados 
		WHERE proyecto_id=${proyecto_id} AND fecha >= '${inicio}' AND fecha < '${termino}'  
		GROUP BY empleado_id
		) TRASLADO
		-- ================== TRASLADO ====================
		
		ON empleados.id = TRASLADO.empleado_id

	),

	REPORTE_PROYECTO AS (

		SELECT 
		-1 AS empleado_id,
		'' AS nombre,
		sum(REPORTE.DT) AS DT,
		sum(REPORTE.sueldo_mensual) AS sueldo_mensual,
		sum(REPORTE.total_bonos) AS total_bonos,
		sum(REPORTE.total_descuentos) AS total_descuentos,
		sum(REPORTE.total_traslados) AS total_traslados,
		sum(REPORTE.liquido) AS liquido,
		1 AS proyecto 
		FROM REPORTE
	)

	-- Report of employees
	SELECT
	(REPORTE.liquido + REPORTE.total_traslados) AS total,
	REPORTE.empleado_id,
	REPORTE.nombre,
	REPORTE.DT,
	REPORTE.sueldo_mensual,
	REPORTE.total_bonos,
	REPORTE.total_descuentos,
	REPORTE.total_traslados,
	REPORTE.liquido, 
	0 AS proyecto 
	FROM REPORTE

	UNION 

	-- Report of proyecto
	SELECT
	( REPORTE_PROYECTO.liquido + REPORTE_PROYECTO.total_traslados ) AS total,
	REPORTE_PROYECTO.*
	FROM REPORTE_PROYECTO; 
	
    `
    


    conn.query(SQL,function (err, data, fields) {
	if(err) return next(new AppError(err))
		res.status(200).json({
		    status: "success",
		    length: data?.length,
		    data: data,
		});
    });
};




/* Get all active proyectos */
exports.getAll = (req, res, next) => {

	const SQL = `
	
		SELECT

		id,
		fecha_inicio,
		lugar,
		nombre,
		descripcion,
		region_id,
		comuna_id,
		precio,
		expect,
    tiempo_estimado,
    tiempo_oficial

		FROM  proyectos
		WHERE activo = 1
        ORDER BY id DESC

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




exports.getEmpleados = (req, res, next) => {


	const SQL = `
	
		SELECT 
		concat(E.nombre,' ',E.apellido_paterno,' ', IFNULL(apellido_materno,'')) as nombre,
		E.rut,
		E.id
		FROM empleados E
		INNER JOIN proyecto_empleado P 
		ON E.id = P.empleado_id
		AND P.proyecto_id = ${req.params.id}
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



exports.getEmpleadosComplement = (req, res, next) => {

	const proyecto_id = req.params.id;
    const filtro = req.params.filtro;

    
    let f1 = 0;
    let f2 = 0;

    if(filtro == "1" || filtro == "2")  f1 = 1;
    if(filtro == "1" || filtro == "3")  f2 = 1;
    
	const SQL = `CALL empleados_disponibles(${proyecto_id},${f1},${f2})`

    

    conn.query(SQL, function (err, data, fields) {
	if(err) return next(new AppError(err))
	res.status(200).json({
	    status: "success",
	    length: data?.length,
	    data: data,
	});

    });
};


exports.getEmpleadosAsistencia = (req, res, next) => {

    /* id of proyecto */
    const proyecto_id = req.params.proyecto_id;

    /* date of asistencia */
    const date = "\'" + req.params.year + "-" + req.params.month + "-" + req.params.day + "\'" ;
    

	const SQL = `

		SELECT 
		E.id,
		CONCAT(
			E.nombre, ' ',
			E.apellido_paterno, ' ',
			IFNULL(E.apellido_materno,'')
		) AS nombre,
		E.rut,
		A.registro,
		C.labor
		
		FROM(
		
			SELECT * FROM empleados INNER JOIN proyecto_empleado
			ON empleados.id = proyecto_empleado.empleado_id
			WHERE proyecto_empleado.proyecto_id=${proyecto_id}
		
		) E
		
		LEFT JOIN(
		
			SELECT asistencias.* FROM asistencias  WHERE asistencias.proyecto_id=${proyecto_id} and asistencias.fecha=${date}
		) A
		ON E.id = A.empleado_id


		LEFT JOIN (

			SELECT N.* FROM contratos N

			INNER JOIN (

				SELECT empleado_id, MAX(inicio) as fecha_max
				FROM contratos WHERE inicio <= ${date}
				GROUP BY empleado_id

			) M
			
			ON N.empleado_id = M.empleado_id AND N.inicio = fecha_max

		) C

		ON E.id = C.empleado_id
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



/*=====================================================
*     _____  ______ _      ______ _______ ______ 
*    |  __ \|  ____| |    |  ____|__   __|  ____|
*    | |  | | |__  | |    | |__     | |  | |__   
*    | |  | |  __| | |    |  __|    | |  |  __|  
*    | |__| | |____| |____| |____   | |  | |____ 
*    |_____/|______|______|______|  |_|  |______|
*
*=======================================================*/


exports.deleteEmpleado = (req, res, next) => {


	const proyecto_id = req.params.proyecto_id;
	const empleado_id = req.params.empleado_id;

	const SQL = `

		DELETE FROM proyecto_empleado
		WHERE proyecto_id = ${proyecto_id} AND empleado_id=${empleado_id}
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

