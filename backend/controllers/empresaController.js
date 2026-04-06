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





/*==================================
 *        _____ ______ _______ 
 *       / ____|  ____|__   __|
 *      | |  __| |__     | |   
 *      | | |_ |  __|    | |   
 *      | |__| | |____   | |   
 *       \_____|______|  |_|   
 *
 *==================================*/



/* This method gets a proyecto report */
exports.getReport = (req, res, next) => {

    const year             = req.params.year;
    const month            = req.params.month;

    let anno_termino = parseInt(year);
    let mes_termino = parseInt(month) + 1;

    if(mes_termino>12){
        mes_termino = 1;
        anno_termino = anno_termino + 1;
    }

    const inicio  = year+'-'+month+'-1';
    const termino = anno_termino +'-'+mes_termino+'-1';


	/*===============================

	empleado_id

	=================================*/

    
    const SQL = `


		WITH REPORTE AS 
		(

			-- ============= SELECTED COLUMNS ================

			SELECT 

			empleados.id                                     AS empleado_id,
			IFNULL(DT,0)                                     AS DT,
			costo_mensual                                    AS sueldo_mensual,
			IFNULL(total_bonos,0)                            AS total_bonos,
			IFNULL(total_descuentos,0)                       AS total_descuentos,
            IFNULL(total_traslados,0)                        AS total_traslados,
			IFNULL(total_anticipos,0)                        AS total_anticipos,
			(
				IFNULL(costo_mensual,0) 
				+ IFNULL(total_bonos,0) 
				- IFNULL(total_descuentos,0)
			)                                                AS liquido,
			PE.proyecto_id                                   AS proyecto_id

			-- ==========  SELECTED COLUMNS ==================


			from empleados


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
		


			INNER JOIN 
			(SELECT empleado_id, proyecto_id FROM proyecto_empleado) PE
			ON empleados.id = PE.empleado_id

	
			LEFT JOIN
			
			-- ================= ASISTENCIA ====================
			(
			SELECT empleado_id, proyecto_id, SUM(registro) AS DT
			FROM asistencias
			WHERE fecha<'${termino}' AND fecha>='${inicio}'
			GROUP BY empleado_id, proyecto_id
			) ASISTENCIA
			-- ================= ASISTENCIA ====================
			
			ON empleados.id = ASISTENCIA.empleado_id
			AND PE.proyecto_id = ASISTENCIA.proyecto_id
			





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
			SELECT empleado_id, proyecto_id, SUM(bono) AS total_bonos 
			FROM bonos 
			WHERE fecha >= '${inicio}' AND fecha < '${termino}'
			GROUP BY empleado_id, proyecto_id
			) BONO
			-- =============== BONO ==================
			
			ON empleados.id = BONO.empleado_id
			AND PE.proyecto_id = BONO.proyecto_id
			



			LEFT JOIN
			
			-- ================== DESCUENTO ====================
			(
			SELECT empleado_id, proyecto_id, SUM(descuento) AS total_descuentos
			FROM descuentos 
			WHERE fecha >= '${inicio}' AND fecha < '${termino}'  
			GROUP BY empleado_id, proyecto_id
			) DESCUENTO
			-- ================== DESCUENTO ====================
			
			ON empleados.id = DESCUENTO.empleado_id
			AND PE.proyecto_id = DESCUENTO.proyecto_id




      		LEFT JOIN
			
			-- ================== TRASLADO ====================
			(
			SELECT empleado_id, proyecto_id, SUM(traslado) AS total_traslados
			FROM traslados 
			WHERE fecha >= '${inicio}' AND fecha < '${termino}'  
			GROUP BY empleado_id, proyecto_id
			) TRASLADO
			-- ================== TRASLADO ====================
			
			ON empleados.id = TRASLADO.empleado_id
			AND PE.proyecto_id = TRASLADO.proyecto_id



			LEFT JOIN
			
			-- ================== ANTICIPO ====================
			(
			SELECT empleado_id, proyecto_id, SUM(anticipo) AS total_anticipos
			FROM anticipos 
			WHERE fecha >= '${inicio}' AND fecha < '${termino}'  
			GROUP BY empleado_id, proyecto_id
			) ANTICIPO
			-- ================== ANTICIPO ====================
			
			ON empleados.id = ANTICIPO.empleado_id
			AND PE.proyecto_id = ANTICIPO.proyecto_id
		),








    -- =======================
    --       Binding #2
    -- =======================
		REPORTE_PROYECTO AS (

			SELECT 
			REPORTE.proyecto_id,
			sum(REPORTE.DT) AS DT,
			sum(REPORTE.sueldo_mensual) AS sueldo_mensual,
			sum(REPORTE.total_bonos) AS total_bonos,
			sum(REPORTE.total_descuentos) AS total_descuentos,
      		sum(REPORTE.total_traslados) AS total_traslados,
			sum(REPORTE.total_anticipos) AS total_anticipos,
			sum(REPORTE.liquido) AS liquido
			FROM REPORTE 
			GROUP BY REPORTE.proyecto_id
		),



    -- =======================
    --      Binding #3
    -- =======================

    REPORTE_FINIQUITO AS ( 
      SELECT sum(contratos.finiquito) AS finiquito 
      FROM contratos
      WHERE contratos.finiquitado=1
      AND contratos.termino >= '${inicio}'
      AND contratos.termino <  '${termino}'
    ),




    -- =======================
    --       Binding #4
    -- =======================

    REPORTE_EMPRESA AS ( 
      SELECT 
      0 AS total,
      -1  AS proyecto_id,
      sum(REPORTE_PROYECTO.DT) AS DT,
      sum(REPORTE_PROYECTO.sueldo_mensual) AS sueldo_mensual,
      sum(REPORTE_PROYECTO.total_bonos) AS total_bonos,
      sum(REPORTE_PROYECTO.total_descuentos) AS total_descuentos,
      sum(REPORTE_PROYECTO.total_traslados) AS total_traslados,
	  sum(REPORTE_PROYECTO.total_anticipos) AS total_anticipos,
      sum(REPORTE_PROYECTO.liquido) AS liquido,
      IFNULL(REPORTE_FINIQUITO.finiquito,0) AS finiquito,
      1   AS empresa,
      ''  AS proyecto_nombre
      FROM REPORTE_PROYECTO JOIN REPORTE_FINIQUITO
    )


    SELECT 
    (
      REPORTE_EMPRESA.liquido
      + REPORTE_EMPRESA.finiquito
      + REPORTE_EMPRESA.total_traslados
    ) AS total,
    REPORTE_EMPRESA.DT,
    REPORTE_EMPRESA.sueldo_mensual,
    REPORTE_EMPRESA.total_bonos,
    REPORTE_EMPRESA.total_descuentos,
    REPORTE_EMPRESA.total_traslados,
	REPORTE_EMPRESA.total_anticipos,
	REPORTE_EMPRESA.liquido - REPORTE_EMPRESA.total_anticipos AS total_saldos,
    REPORTE_EMPRESA.liquido,
    REPORTE_EMPRESA.finiquito
    FROM REPORTE_EMPRESA
  
    
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




/*==================================
 *       _____  _    _ _______ 
 *      |  __ \| |  | |__   __|
 *      | |__) | |  | |  | |   
 *      |  ___/| |  | |  | |   
 *      | |    | |__| |  | |   
 *      |_|     \____/   |_|   
 * 
 *==================================*/
