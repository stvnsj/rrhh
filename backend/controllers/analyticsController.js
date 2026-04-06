
const conn = require("../services/db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");
const analytics_service = require("../services/analyticsService")



/***************************
 *                         *
 *  ANALYTICS CONTROLLER   *
 *                         *
 ***************************/



/* Get all active proyectos */
exports.general = (req, res, next) => {

  const proyecto_id = req.params.proyecto_id;
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
      WHERE proyecto_id=${proyecto_id}
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
      SUM(IFNULL(finiquito,0))  AS  total
      FROM contratos
      WHERE NOT vigente
      AND proyecto_id = ${proyecto_id}
    )



    , X AS (


      SELECT 

      P.nombre,

      IFNULL(P.tiempo_estimado, 0) AS tiempo_estimado,
      IFNULL(P.tiempo_oficial, 0)  AS tiempo_oficial,


      /* Suma de costos totales del proyecto */
      ifnull(B.total,0) + -- boletas
      ifnull(F.total,0) + -- facturas
      ifnull(T.total,0) + -- transferencias
      ifnull(S.total,0) + -- sueldos
      ifnull(Bo.total,0) + -- bonos
      ifnull(D.total,0) + -- descuentos
      ifnull(Fin.total,0) + -- finiquitos
      IFNULL(proyecto_social (${proyecto_id}), 0) -- costo social del proyecto
      AS gasto_real,
      
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


    -- =======================================
    -- =======================================
    --     _____       _______       
    --    |  __ \   /\|__   __|/\    
    --    | |  | | /  \  | |  /  \   
    --    | |  | |/ /\ \ | | / /\ \  
    --    | |__| / ____ \| |/ ____ \ 
    --    |_____/_/    \_\_/_/    \_\
    --                               
    -- =======================================
    -- =======================================


    WITH 
    

    duracion_proyecto AS (

      SELECT 
      TO_DAYS(MAX(fecha)) - TO_DAYS(MIN(fecha)) + 1 AS duracion
      FROM asistencias 
      WHERE proyecto_id = ${proyecto_id} AND registro = 1

    )

    ,lista_categorias AS (

      SELECT id AS categoria_id , 
      categoria AS categoria_nombre
      FROM categorias
      UNION 
      SELECT 10, 'PERSONAL'
    )

    ,total_minimo AS (

      SELECT 
      0 AS categoria_total, 
      lista_categorias.categoria_id as categoria_id,
      ${proyecto_id} as proyecto_id
      FROM lista_categorias
    )

    ,total_boletas AS (

      SELECT 
      SUM(valor) AS categoria_total, 
      categoria_id,
      proyecto_id 
      FROM boletas WHERE proyecto_id=${proyecto_id}
      GROUP BY categoria_id
    )

    ,total_facturas AS (

      SELECT 
      SUM(valor) AS categoria_total, 
      categoria_id,
      proyecto_id
      FROM facturas WHERE proyecto_id=${proyecto_id}
      GROUP BY categoria_id
    )

    ,total_transferencias AS (

      SELECT 
      SUM(valor) AS categoria_total, 
      categoria_id ,
      proyecto_id
      FROM transferencias WHERE proyecto_id=${proyecto_id}
      GROUP BY categoria_id
    )

    ,total_sueldos AS (

      SELECT 
      SUM(C.costo) AS categoria_total, 
      10 AS categoria_id,
      ${proyecto_id} AS  proyecto_id

      FROM asistencias A
      INNER JOIN contratos C
      ON  A.empleado_id=C.empleado_id
      AND A.registro=1
      AND A.proyecto_id=${proyecto_id}
      AND A.fecha >= C.inicio
      AND (A.fecha <= C.termino OR C.vigente=1)
    )

    ,total_social AS (

      SELECT 
      IFNULL (proyecto_social(${proyecto_id}), 0) AS categoria_total,
      10 AS categoria_id,
      ${proyecto_id} AS proyecto_id
    )
    

    ,total_bonos AS (

      SELECT 
      SUM(bono) AS categoria_total, 
      10 AS categoria_id,
      ${proyecto_id} AS  proyecto_id
      FROM bonos
      WHERE proyecto_id = ${proyecto_id}
    )

    ,total_descuentos AS (

      SELECT 
      (-1 * SUM(descuento)) AS categoria_total, 
      10 AS categoria_id,
      ${proyecto_id} AS  proyecto_id
      FROM descuentos
      WHERE proyecto_id = ${proyecto_id}
    )

    ,total_finiquitos AS (

      SELECT
      -- 
      SUM(finiquito) AS categoria_total,
      10 AS categoria_id,
      ${proyecto_id} AS proyecto_id
      FROM contratos
      WHERE NOT vigente
      AND proyecto_id = ${proyecto_id}
    )

    ,total_union AS (
      
      SELECT * FROM total_minimo
      UNION ALL
      SELECT * FROM total_boletas
      UNION ALL
      SELECT * FROM total_facturas
      UNION ALL
      SELECT * FROM total_transferencias
      UNION ALL 
      SELECT * FROM total_sueldos
      UNION ALL 
      SELECT * FROM total_bonos
      UNION ALL 
      SELECT * FROM total_descuentos
      UNION ALL
      SELECT * FROM total_finiquitos
      UNION ALL
      SELECT * FROM total_social
    )

    ,categorias_total AS (

      SELECT 

      C.categoria_id                                           AS categoria_id, 
      C.categoria_nombre                                       AS categoria_nombre,
      U.proyecto_id                                            AS proyecto_id,
      IFNULL(SUM(U.categoria_total),0)                         AS categoria_total,
      IFNULL(100 * SUM(U.categoria_total)/@total_proyecto,0)   AS categoria_porcentaje

      FROM lista_categorias C 
      LEFT JOIN total_union U
      ON C.categoria_id = U.categoria_id
      GROUP BY C.categoria_id
    )

    SELECT
    C.categoria_id, 
    C.categoria_nombre,
    C.proyecto_id,
    C.categoria_total,
    IF(P.neto,100*C.categoria_total/P.neto,0)           AS categoria_porcentaje,
    
    IFNULL(P.neto,0)                                    AS categoria_presupuesto,


    IFNULL(P.oficial,0)                                 AS categoria_oficial,
    100 * (P.oficial - C.categoria_total) / P.oficial   AS categoria_utilidad,
    C.categoria_total / Y.duracion                      AS costo_dia

    FROM categorias_total C LEFT JOIN presupuesto P
    ON   C.categoria_id = P.categoria_id
    AND  C.proyecto_id  = P.proyecto_id
    JOIN duracion_proyecto Y;




    -- =======================================
    --     _____       _______       
    --    |  __ \   /\|__   __|/\    
    --    | |  | | /  \  | |  /  \   
    --    | |  | |/ /\ \ | | / /\ \  
    --    | |__| / ____ \| |/ ____ \ 
    --    |_____/_/    \_\_/_/    \_\
    --                               
    -- =======================================




    SET @personal_acumulado = 0;
    SET @gasto_acumulado    = 0;


    SET @total_acumulado    = 0;
    SET @total_aumento      = 0;
    
    


    WITH boletas_dia AS (

      SELECT 
      SUM(valor)       AS total_dia,  fecha
      FROM boletas 
      WHERE proyecto_id=${proyecto_id}
      GROUP BY fecha
    )

    ,facturas_dia AS (

      SELECT 
      SUM(valor)       AS total_dia, fecha
      FROM facturas 
      WHERE proyecto_id=${proyecto_id}
      GROUP BY fecha
    )

    ,transferencias_dia AS (

      SELECT 
      SUM(valor)               AS total_dia, 
      fecha                    AS fecha
      FROM transferencias
      WHERE proyecto_id=${proyecto_id}
      GROUP BY fecha
    )

    ,sueldos_dia AS (

      SELECT 
      SUM(C.costo)              AS total_dia,
      A.fecha                   AS fecha
      FROM asistencias A
      INNER JOIN contratos C
      ON  A.empleado_id=C.empleado_id
      AND A.registro=1
      AND A.proyecto_id=${proyecto_id}
      AND A.fecha >= C.inicio
      AND (A.fecha <= C.termino OR C.vigente=1)
      GROUP BY A.fecha
    )

    ,bonos_dia AS (

      SELECT 
      SUM(bono)        AS total_dia,
      fecha            AS fecha
      FROM bonos 
      WHERE proyecto_id=${proyecto_id}
      GROUP BY fecha
    )

    ,descuentos_dia AS (

      SELECT
      -1 * SUM(descuento)    AS total_dia,
      fecha                  AS fecha
      FROM descuentos
      WHERE proyecto_id=${proyecto_id}
      GROUP BY fecha
    )

    ,finiquitos_dia AS (

      SELECT
      -- 
      SUM(finiquito)          AS total_dia,
      termino                 AS fecha
      FROM contratos
      WHERE NOT vigente
      AND proyecto_id = ${proyecto_id}
      GROUP BY termino
    )

    ,previred_dia AS (

      SELECT 
      SUM(valor)                    AS total_dia,
      DATE_ADD(
        DATE_ADD(
          fecha, INTERVAL 15 DAY
        ),
        INTERVAL 1 MONTH
      )                             AS fecha
      FROM previred
      WHERE proyecto_id = ${proyecto_id}
      GROUP BY fecha
    )

    ,union_dia AS (

      SELECT * FROM boletas_dia          UNION ALL
      SELECT * FROM facturas_dia         UNION ALL
      SELECT * FROM transferencias_dia   UNION ALL
      SELECT * FROM sueldos_dia          UNION ALL
      SELECT * FROM bonos_dia            UNION ALL
      SELECT * FROM descuentos_dia       UNION ALL
      SELECT * FROM finiquitos_dia       UNION ALL
      SELECT * FROM previred_dia         
    )

    ,total_dia AS (

      SELECT SUM(total_dia) as total, fecha
      FROM union_dia
      GROUP BY fecha

    )

    SELECT 
    fecha                                                                AS fecha,
    IFNULL(total,0)                                                      AS total_diario,
    (@total_acumulado:=@total_acumulado+IFNULL(total,0))                 AS total_acumulado,
    100*(@total_acumulado/(@total_acumulado-IFNULL(total,0))) - 100      AS aumento
    FROM total_dia;


    -- =======================================
    --     _____       _______       
    --    |  __ \   /\|__   __|/\    
    --    | |  | | /  \  | |  /  \   
    --    | |  | |/ /\ \ | | / /\ \  
    --    | |__| / ____ \| |/ ____ \ 
    --    |_____/_/    \_\_/_/    \_\
    --                               
    -- =======================================

    SELECT 
    IFNULL(SUM(neto),0)       AS presupuesto,
    IFNULL(SUM(oficial),0)    AS oficial
    FROM presupuesto
    WHERE proyecto_id = ${proyecto_id};

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






/*

   ____  _    _ ______ _______     __
  / __ \| |  | |  ____|  __ \ \   / /
 | |  | | |  | | |__  | |__) \ \_/ / 
 | |  | | |  | |  __| |  _  / \   /  
 | |__| | |__| | |____| | \ \  | |   
  \___\_\\____/|______|_|  \_\ |_|   

*/


/* Get all active proyectos */
exports.categoria = (req, res, next) => {

  const proyecto_id  = req.params.proyecto_id;
  const categoria_id = req.params.categoria_id;


  let SQL = '';

  if(categoria_id === '10'){

    SQL = `

    SET @total_acumulado    = 0;
    SET @total_aumento      = 0;
    

    WITH sueldos_dia AS (

      SELECT 
      SUM(C.costo)              AS total_dia,
      A.fecha                   AS fecha
      FROM asistencias A
      INNER JOIN contratos C
      ON  A.empleado_id=C.empleado_id
      AND A.registro=1
      AND A.proyecto_id=${proyecto_id}
      AND A.fecha >= C.inicio
      AND (A.fecha <= C.termino OR C.vigente=1)
      GROUP BY A.fecha
    )

    ,bonos_dia AS (

      SELECT 
      SUM(bono)        AS total_dia,
      fecha            AS fecha
      FROM bonos 
      WHERE proyecto_id=${proyecto_id}
      GROUP BY fecha
    )

    ,descuentos_dia AS (

      SELECT
      -1 * SUM(descuento)    AS total_dia,
      fecha                  AS fecha
      FROM descuentos
      WHERE proyecto_id=${proyecto_id}
      GROUP BY fecha
    )

    ,finiquitos_dia AS (

      SELECT
      -- 
      SUM(finiquito)          AS total_dia,
      termino                 AS fecha
      FROM contratos
      WHERE NOT vigente
      AND proyecto_id = ${proyecto_id}
      GROUP BY termino
    )

    ,previred_dia AS (

      SELECT 
      SUM(valor)                    AS total_dia,
      DATE_ADD(
        DATE_ADD(
          fecha, INTERVAL 15 DAY
        ),
        INTERVAL 1 MONTH
      )                             AS fecha
      FROM previred
      WHERE proyecto_id = ${proyecto_id}
      GROUP BY fecha
    )

    ,union_dia AS (

      SELECT * FROM sueldos_dia     UNION ALL
      SELECT * FROM bonos_dia       UNION ALL
      SELECT * FROM descuentos_dia  UNION ALL
      SELECT * FROM finiquitos_dia  UNION ALL
      SELECT * FROM previred_dia    
    )

    ,total_dia AS (

      SELECT SUM(total_dia) as total, fecha
      FROM union_dia
      GROUP BY fecha
    )
    

    SELECT 
    fecha                                                                AS fecha,
    IFNULL(total,0)                                                      AS total_diario,
    (@total_acumulado:=@total_acumulado+IFNULL(total,0))                 AS total_acumulado,
    100*(@total_acumulado/(@total_acumulado-IFNULL(total,0))) - 100      AS aumento
    FROM total_dia;


    SELECT 
    SUM(neto)      AS presupuesto,
    SUM(oficial)   AS oficial
    FROM presupuesto
    WHERE categoria_id = 10 AND proyecto_id = ${proyecto_id};
  `




  }

  else {

  SQL = `


    SET @total_acumulado    = 0;
    SET @total_aumento      = 0;  


    WITH boletas_dia AS (

      SELECT 
      SUM(valor)       AS total_dia,  
      fecha
      FROM boletas 
      WHERE proyecto_id=${proyecto_id} AND categoria_id=${categoria_id}
      GROUP BY fecha
    )

    ,facturas_dia AS (

      SELECT 
      SUM(valor)       AS total_dia, fecha
      FROM facturas 
      WHERE proyecto_id=${proyecto_id} AND categoria_id=${categoria_id}
      GROUP BY fecha
    )

    ,transferencias_dia AS (

      SELECT 
      SUM(valor)               AS total_dia, 
      fecha                    AS fecha
      FROM transferencias
      WHERE proyecto_id=${proyecto_id} AND categoria_id=${categoria_id}
      GROUP BY fecha
    )



    ,union_dia AS (

      SELECT * FROM boletas_dia       UNION ALL
      SELECT * FROM facturas_dia      UNION ALL
      SELECT * FROM transferencias_dia
    )

    ,total_dia AS (

      SELECT 

      SUM(total_dia) as total, 
      fecha

      FROM union_dia
      GROUP BY fecha
    )

    SELECT 
    fecha                                                                AS fecha,
    IFNULL(total,0)                                                      AS total_diario,
    (@total_acumulado:=@total_acumulado+IFNULL(total,0))                 AS total_acumulado,
    100*(@total_acumulado/(@total_acumulado-IFNULL(total,0))) - 100      AS aumento
    FROM total_dia;

    SELECT 
    SUM(neto)    AS presupuesto,
    SUM(oficial) AS oficial
    FROM presupuesto
    WHERE categoria_id = ${categoria_id} AND proyecto_id = ${proyecto_id};
  `
  }




  


  conn.query(SQL, function (err, data, fields) {

	if(err) return next(new AppError(err))
    res.status(200).json({
        status: "success",
        length: data?.length,
        data: data.filter(o=>Array.isArray(o)),
    });
  });
};



exports.xport = (req, res, next) => {

  const proyecto_id  = req.params.proyecto_id;
  const categoria_id = req.params.categoria_id;

  analytics_service.xport(proyecto_id,categoria_id,res,next);

}



