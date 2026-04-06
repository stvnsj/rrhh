
const conn = require("../services/db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");



/*********************************
 *                               *
 *  Analytics Empresa Controller *
 *                               *
 *********************************/


// ------------------------------------------------------
// Beta Implementation
// ....................
//
// Proyecto_id is left out as query parameter,
// but time interval or year must be included
// as parameters in order to determine exactly
// which projects are to be the object of analysis.
// It is yet to be defined if the time creteria shall
// be fixed or subject to some flexibility like
// specifying a free time interval.
// ------------------------------------------------------


exports.empresa_analysis = (req,res,next) => {
    
    // Format of dates to be specified.
    const date1 = req.params.proyecto_id;
    const date2 = req.params.proyecto_id;
    
    const SQL = `

    -- =======================================
    --     _____       _______       
    --    |  __ \   /\|__   __|/\    
    --    | |  | | /  \  | |  /  \   
    --    | |  | |/ /\ \ | | / /\ \  
    --    | |__| / ____ \| |/ ____ \ 
    --    |_____/_/    \_\_/_/    \_\
    --                               
    -- =======================================

 WITH

    duracion_proyecto AS (

      SELECT 
      TO_DAYS(MAX(fecha)) - TO_DAYS(MIN(fecha)) + 1 AS duracion
      FROM asistencias
      WHERE proyecto_id = ${proyecto_id} AND registro = 1

    )

    ,total_boletas AS (

      SELECT IFNULL(SUM(valor),0) AS total
      FROM boletas
      GROUP BY proyecto_id
    )

    ,total_facturas AS (

      SELECT IFNULL(SUM(valor),0) AS total
      FROM facturas 
      WHERE proyecto_id=${proyecto_id}
    )

    ,total_transferencias AS (

      SELECT IFNULL(SUM(valor),0) AS total
      FROM transferencias 
      WHERE proyecto_id=${proyecto_id}
    )

    ,total_sueldos AS (

      SELECT IFNULL(SUM(C.costo),0) AS total
      FROM asistencias A
      INNER JOIN contratos C
      ON  A.empleado_id=C.empleado_id
      AND A.registro=1
      AND A.proyecto_id=${proyecto_id}
      AND A.fecha >= C.inicio
      AND (A.fecha <= C.termino OR C.vigente=1)
    )

    ,total_bonos AS (

      SELECT IFNULL(SUM(bono),0) AS total
      FROM bonos
      WHERE proyecto_id = ${proyecto_id}
    )

    ,total_descuentos AS (

      SELECT -1 * IFNULL(SUM(descuento),0) AS total
      FROM descuentos
      WHERE proyecto_id = ${proyecto_id}
    )

    ,datos_proyecto AS (

      SELECT 
      nombre, precio, expect, tiempo_estimado, tiempo_oficial
      FROM proyectos 
      WHERE id = ${proyecto_id}
    )

    ,presupuesto_proyecto AS (

      SELECT 
      SUM(neto)      AS presupuesto_total
      FROM presupuesto
      WHERE proyecto_id = ${proyecto_id}
    )

    ,finiquitos_proyecto AS(

      SELECT 
      -- ERROR HERE 
      SUM(finiquito)  AS  total
      FROM contratos
      WHERE NOT vigente
      AND proyecto_id = ${proyecto_id}
    )

    ,previred_proyecto AS(

      SELECT
      SUM(valor)          as total
      FROM previred
      WHERE proyecto_id = ${proyecto_id}
    )

    , X AS (


      SELECT 

      P.nombre,

      IFNULL(P.tiempo_estimado, 0) AS tiempo_estimado,
      IFNULL(P.tiempo_oficial, 0)  AS tiempo_oficial,
      IFNULL(B.total,0) 
      + IFNULL(F.total,0) 
      + IFNULL(T.total,0) 
      + IFNULL(S.total,0)
      + IFNULL(Bo.total,0)
      + IFNULL(D.total,0)        
      + IFNULL(Fin.total,0)  
      + IFNULL(Pre.total,0)        AS gasto_real,
      Pr.presupuesto_total         AS presupuesto_total,
      P.precio                     AS presupuesto_oficial



      FROM 
      
      datos_proyecto              P

      JOIN total_boletas          B
      JOIN total_facturas         F
      JOIN total_transferencias   T

      JOIN total_sueldos          S
      JOIN total_bonos            Bo
      JOIN total_descuentos       D

      JOIN finiquitos_proyecto    Fin
      JOIN previred_proyecto      Pre

      JOIN presupuesto_proyecto   Pr
    )


    SELECT 
    X.nombre,
    X.tiempo_estimado,
    X.tiempo_oficial,
    X.gasto_real,
    X.presupuesto_total,
    X.presupuesto_oficial,
    100 * (X.gasto_real / X.presupuesto_total) AS gasto_porcentaje,
    100 * (X.presupuesto_oficial - X.gasto_real)/X.presupuesto_oficial AS utilidad,
    X.presupuesto_oficial - X.gasto_real                               AS ganancia,
    X.gasto_real / Y.duracion                                          AS costo_dia,
    Y.duracion                                                         AS duracion,
    X.tiempo_estimado - Y.duracion                                     AS delta_duracion,
    100 * Y.duracion/X.tiempo_estimado                                 AS porcentaje_duracion
    FROM X JOIN duracion_proyecto Y;

`
    
    conn.query(SQL, function (err, data, fields) {
        
	    if(err) return next(new AppError(err))
        res.status(200).json({
            status: "success",
            length: data?.length,
            data: data.filter(o=>Array.isArray(o)),
        }); 
    });  
};
