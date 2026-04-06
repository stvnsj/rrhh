


const conn = require("../services/db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");
const readXlsxFile = require('read-excel-file/node')




/*==================================
*        _____ ______ _______ 
*       / ____|  ____|__   __|
*      | |  __| |__     | |   
*      | | |_ |  __|    | |   
*      | |__| | |____   | |   
*       \_____|______|  |_|   
*
*===================================*/



exports.boletaDay = (req, res, next) => {

    const inicio        = req.params.y1 + '-' + req.params.m1 + '-' + req.params.d1;
    const termino       = req.params.y2 + '-' + req.params.m2 + '-' + req.params.d2;
    const delta         = req.params.delta;

    const SQL = `
    
        WITH boleta_plot AS (

            SELECT SUM(valor),DATECLASS('${inicio}',fecha,${delta}) as period
            FROM boletas WHERE fecha >= '${inicio}' AND fecha < '${termino}'
            GROUP BY period
        )

        SELECT * FROM boleta_plot;
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



exports.globalDay = (req, res, next) => {

    const inicio        = req.params.y1 + '-' + req.params.m1 + '-' + req.params.d1;
    const termino       = req.params.y2 + '-' + req.params.m2 + '-' + req.params.d2;
    const delta         = req.params.delta;

    const SQL = `
    
        WITH boleta_plot AS (

            SELECT 

            SUM(valor)                              AS total,
            DATECLASS('${inicio}',fecha,${delta})   AS period

            FROM boletas WHERE fecha >= '${inicio}' AND fecha <= '${termino}'
            GROUP BY period
        ),

        factura_plot AS (

            SELECT 

            SUM(valor)                              AS total,
            DATECLASS('${inicio}',fecha,${delta})   AS period

            FROM facturas WHERE fecha >= '${inicio}' AND fecha <= '${termino}'
            GROUP BY period
        ),

        transferencia_plot AS (

            SELECT 

            SUM(valor)                              AS total,
            DATECLASS('${inicio}',fecha,${delta})   AS period

            FROM transferencias WHERE fecha >= '${inicio}' AND fecha <= '${termino}'
            GROUP BY period
        ),

        union_plot AS (

            SELECT * FROM boleta_plot

            UNION

            SELECT * FROM factura_plot

            UNION

            SELECT * FROM transferencia_plot
        )


        SELECT 
        sum(total)          AS total,
        period              
        FROM union_plot
        GROUP BY period;
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
    






exports.proyectoDay = (req, res, next) => {

    const m1 = req.params.m1.length===1? '0'+req.params.m1 : req.params.m1;
    const m2 = req.params.m2.length===1? '0'+req.params.m2 : req.params.m2;

    const d1 = req.params.d1.length===1? '0'+req.params.d1 : req.params.d1;
    const d2 = req.params.d2.length===1? '0'+req.params.d2 : req.params.d2;


    const inicio        = req.params.y1 + '-' + m1 + '-' + d1;
    const termino       = req.params.y2 + '-' + m2 + '-' + d2;    
    const proyecto_id   = req.params.proyecto_id;
    const delta         = req.params.delta;

    

    const SQL = `


        SET @cum_boleta        =  (SELECT SUM(valor) FROM boletas        WHERE fecha <'${inicio}' AND proyecto_id=${proyecto_id});
        SET @cum_factura       =  (SELECT SUM(valor) FROM facturas       WHERE fecha <'${inicio}' AND proyecto_id=${proyecto_id});
        SET @cum_transferencia =  (SELECT SUM(valor) FROM transferencias WHERE fecha <'${inicio}' AND proyecto_id=${proyecto_id});

        -- Total cost of proyecto
        SET @cum_proyecto = (SELECT (IFNULL(@cum_boleta,0) + IFNULL(@cum_factura,0) + IFNULL(@cum_transferencia,0))); 

        WITH recursive dates AS ( 
            select 
            
            '${inicio}' as fecha , 
            0 AS total 
            union all 
            
            SELECT DATE_ADD(fecha,INTERVAL 1 DAY), 
            total 

            FROM dates where fecha < '${termino}'
        ), 

        boleta_plot AS (

            SELECT 

            SUM(valor)                              AS total,
            DATECLASS('${inicio}',fecha,${delta})   AS period

            FROM boletas WHERE fecha >= '${inicio}' AND fecha <= '${termino}' AND proyecto_id=${proyecto_id}
            GROUP BY period
        ),

        factura_plot AS (

            SELECT 

            SUM(valor)                              AS total,
            DATECLASS('${inicio}',fecha,${delta})   AS period

            FROM facturas WHERE fecha >= '${inicio}' AND fecha <= '${termino}' AND proyecto_id=${proyecto_id}
            GROUP BY period
        ),

        transferencia_plot AS (

            SELECT 

            SUM(valor)                              AS total,
            DATECLASS('${inicio}',fecha,${delta})   AS period

            FROM transferencias WHERE fecha >= '${inicio}' AND fecha <= '${termino}' AND proyecto_id=${proyecto_id}
            GROUP BY period
        ),

        union_plot AS (

            SELECT total, DATECLASS('${inicio}',fecha,${delta}) AS period FROM dates

            UNION

            SELECT * FROM boleta_plot

            UNION

            SELECT * FROM factura_plot

            UNION

            SELECT * FROM transferencia_plot
        ),

        myTable AS (
            
            SELECT 
            sum(total)          AS total,
            period          
            FROM union_plot
            GROUP BY period
        )

        SELECT 
        total,
        period,
        DATE_FORMAT(period, "%d/%m")             AS label,
        (@cum_proyecto := @cum_proyecto + total) AS cum 
        FROM myTable 
        ORDER BY period;
    `

    conn.query(SQL, function (err, data, fields) {
    if(err) return next(new AppError(err))
        res.status(200).json({
            status: "success",
            length: data?.length,
            data: data[4],
        });
    });
};


// This method generates the data for a daily plot of cost.
exports.costo_day = (req, res, next) => {


    const m1 = req.params.m1.length===1? '0'+req.params.m1 : req.params.m1;
    const m2 = req.params.m2.length===1? '0'+req.params.m2 : req.params.m2;

    const d1 = req.params.d1.length===1? '0'+req.params.d1 : req.params.d1;
    const d2 = req.params.d2.length===1? '0'+req.params.d2 : req.params.d2;


    const inicio        = req.params.y1 + '-' + m1 + '-' + d1;
    const termino       = req.params.y2 + '-' + m2 + '-' + d2;    
    const proyecto_id   = req.params.proyecto_id;
    const delta         = req.params.delta;

    const SQL = `


        SET @cum_boleta        =  (SELECT SUM(valor) FROM boletas        WHERE fecha <'${inicio}' AND proyecto_id=${proyecto_id});
        SET @cum_factura       =  (SELECT SUM(valor) FROM facturas       WHERE fecha <'${inicio}' AND proyecto_id=${proyecto_id});
        SET @cum_transferencia =  (SELECT SUM(valor) FROM transferencias WHERE fecha <'${inicio}' AND proyecto_id=${proyecto_id});
        SET @cum_proyecto      = (SELECT (IFNULL(@cum_boleta,0) + IFNULL(@cum_factura,0) + IFNULL(@cum_transferencia,0))); 

        WITH recursive dates AS ( 
            select 
            
            '${inicio}' as fecha , 
            0 AS total 
            union all 
            
            SELECT DATE_ADD(fecha,INTERVAL 1 DAY), 
            total 

            FROM dates where fecha < '${termino}'
        ), 

        boleta_plot AS (

            SELECT 

            SUM(valor)                              AS total,
            fecha                                   AS period

            FROM boletas WHERE fecha >= '${inicio}' AND fecha <= '${termino}' AND proyecto_id=${proyecto_id}
            GROUP BY period
        ),

        factura_plot AS (

            SELECT 

            SUM(valor)                              AS total,
            fecha                                   AS period

            FROM facturas WHERE fecha >= '${inicio}' AND fecha <= '${termino}' AND proyecto_id=${proyecto_id}
            GROUP BY period
        ),

        transferencia_plot AS (

            SELECT 

            SUM(valor)                              AS total,
            fecha                                   AS period

            FROM transferencias WHERE fecha >= '${inicio}' AND fecha <= '${termino}' AND proyecto_id=${proyecto_id}
            GROUP BY period
        ),

        union_plot AS (

            SELECT total, fecha AS period FROM dates

            UNION

            SELECT * FROM boleta_plot

            UNION

            SELECT * FROM factura_plot

            UNION

            SELECT * FROM transferencia_plot
        ),

        myTable AS (
            
            SELECT 
            sum(total)          AS total,
            period          
            FROM union_plot
            GROUP BY period
        )

        SELECT 
        total,
        period,
        DATE_FORMAT(period, "%d/%m")             AS label,
        (@cum_proyecto := @cum_proyecto + total) AS cum 
        FROM myTable 
        ORDER BY period;
    `

    conn.query(SQL, function (err, data, fields) {
    if(err) return next(new AppError(err))
        res.status(200).json({
            status: "success",
            length: data?.length,
            data: data[4],
        });
    });
};

// This method generates the data for a daily plot of cost.
exports.costo_day = (req, res, next) => {


    const m1 = req.params.m1.length===1? '0'+req.params.m1 : req.params.m1;
    const m2 = req.params.m2.length===1? '0'+req.params.m2 : req.params.m2;

    const d1 = req.params.d1.length===1? '0'+req.params.d1 : req.params.d1;
    const d2 = req.params.d2.length===1? '0'+req.params.d2 : req.params.d2;


    const inicio        = req.params.y1 + '-' + m1 + '-' + d1;
    const termino       = req.params.y2 + '-' + m2 + '-' + d2;    
    const proyecto_id   = req.params.proyecto_id;
    const delta         = req.params.delta;

    const SQL = `


        SET @cum_boleta          =  (SELECT SUM(valor) FROM boletas          WHERE fecha <'${inicio}' AND proyecto_id=${proyecto_id});
        SET @cum_factura         =  (SELECT SUM(valor) FROM facturas         WHERE fecha <'${inicio}' AND proyecto_id=${proyecto_id});
        SET @cum_transferencia   =  (SELECT SUM(valor) FROM transferencias   WHERE fecha <'${inicio}' AND proyecto_id=${proyecto_id});

        SET @cum_bono            =  (SELECT SUM(bono)      FROM bonos        WHERE fecha <'${inicio}' AND proyecto_id=${proyecto_id});
        SET @cum_traslado        =  (SELECT SUM(traslado)  FROM traslados    WHERE fecha <'${inicio}' AND proyecto_id=${proyecto_id});
        SET @cum_descuento       =  (SELECT SUM(descuento) FROM descuentos   WHERE fecha <'${inicio}' AND proyecto_id=${proyecto_id});
        SET @cum_labor           =  (

    
    
            SELECT

            SUM(IFNULL(C.costo,0))       AS total

            FROM asistencias A
            LEFT JOIN contratos C
            ON  A.empleado_id = C.empleado_id 
            AND A.fecha >= C.inicio
            AND (C.vigente=1 OR A.fecha <= C.termino)
            AND A.registro = 1
            AND A.proyecto_id = ${proyecto_id}
            WHERE A.fecha < '${inicio}'

        );
  
        SET @cum_costo           = (SELECT (IFNULL(@cum_boleta,0) + IFNULL(@cum_factura,0) + IFNULL(@cum_transferencia,0)));
        SET @cum_personal        = (SELECT (IFNULL(@cum_labor,0) + IFNULL(@cum_bono,0) + IFNULL(@cum_traslado,0) - IFNULL(@cum_descuento,0)));






        WITH recursive dates AS ( 
            select 
            
            '${inicio}' as fecha , 
            0 AS total 
            union all 
            
            SELECT DATE_ADD(fecha,INTERVAL 1 DAY), 
            total 

            FROM dates where fecha < '${termino}'
        ), 





        boleta_plot AS (

            SELECT 

            SUM(valor)                              AS total,
            fecha                                   AS period

            FROM boletas WHERE fecha >= '${inicio}' AND fecha <= '${termino}' AND proyecto_id=${proyecto_id}
            GROUP BY period
        ),






        factura_plot AS (

            SELECT 

            SUM(valor)                              AS total,
            fecha                                   AS period

            FROM facturas WHERE fecha >= '${inicio}' AND fecha <= '${termino}' AND proyecto_id=${proyecto_id}
            GROUP BY period
        ),






        transferencia_plot AS (

            SELECT 

            SUM(valor)                              AS total,
            fecha                                   AS period

            FROM transferencias WHERE fecha >= '${inicio}' AND fecha <= '${termino}' AND proyecto_id=${proyecto_id}
            GROUP BY period
        ),






        labor_plot AS( 

            SELECT

            SUM(IFNULL(C.costo,0))            AS total,
            A.fecha                           AS period

            FROM asistencias A
            LEFT JOIN contratos C
            ON  A.empleado_id = C.empleado_id 
            AND A.fecha >= C.inicio
            AND (C.vigente=1 OR A.fecha <= C.termino)
            AND A.registro = 1
            AND A.proyecto_id = ${proyecto_id}
            WHERE A.fecha >= '${inicio}' AND A.fecha <= '${termino}'
            GROUP BY A.fecha
        ),



        bono_plot AS(

            SELECT  
            SUM(bono)        AS total,
            fecha            AS period

            FROM bonos
            WHERE fecha >= '${inicio}'  AND fecha <= '${termino}' AND proyecto_id=${proyecto_id}
            GROUP BY fecha
        ),



        descuento_plot AS(

            SELECT  
            -1 * SUM(descuento)         AS total,
            fecha                       AS period

            FROM descuentos
            WHERE fecha >= '${inicio}'  AND fecha <= '${termino}' AND proyecto_id=${proyecto_id}
            GROUP BY fecha
        ),



        traslado_plot AS(

            SELECT  
            SUM(traslado)        AS total,
            fecha                AS period

            FROM traslados
            WHERE fecha >= '${inicio}'  AND fecha <= '${termino}' AND proyecto_id=${proyecto_id}
            GROUP BY fecha
        ),

        -- === UNION TABLES === --

        union_cost AS (

            SELECT       total, fecha AS period FROM dates   -- Recursive table of dates
            UNION ALL SELECT total, period          FROM boleta_plot
            UNION ALL SELECT total, period          FROM factura_plot
            UNION ALL SELECT total, period          FROM transferencia_plot
        ),

        union_personal AS (

            SELECT        total, fecha AS period FROM dates  -- Recursive table of dates
            UNION ALL SELECT  total, period          FROM labor_plot
            UNION ALL SELECT  total, period          FROM bono_plot
            UNION ALL SELECT  total, period          FROM descuento_plot
            UNION ALL SELECT  total, period          FROM traslado_plot
        ),


        costo_plot AS (

            SELECT SUM(total) AS total, period FROM union_cost GROUP BY period
        ),


        personal_plot AS (

            SELECT SUM(total) AS total, period FROM union_personal GROUP BY period
        ),


        full_plot AS (
            
            SELECT 

            P.period,
            P.total                  AS total_personal,
            C.total                  AS total_costo

            FROM personal_plot       AS   P
            INNER JOIN costo_plot    AS   C
            ON P.period = C.period
            GROUP BY period
        )

        SELECT     
        DATE_FORMAT(period, "%d/%m")                         AS label,
        total_costo                                          AS total_costo,
        total_personal                                       AS total_personal,
        total_costo + total_personal                         AS total_global,
        (@cum_costo    := @cum_costo    + total_costo)       AS cum_costo,
        (@cum_personal := @cum_personal + total_personal)    AS cum_personal,
        (@cum_costo + @cum_personal)                         AS cum_global

        FROM full_plot 
        ORDER BY period;



        -- DATA[5]
        SELECT 

        IFNULL(precio,0)                               AS precio,
        FLOOR(IFNULL(precio,0) * (1-IFNULL(expect,0))) AS costo_esperado
        FROM proyectos WHERE id=${proyecto_id};











        -- ============ QUERY 3 =================
        -- ============ QUERY 3 =================
        -- ============ QUERY 3 =================



    `

    

    conn.query(SQL, function (err, data, fields) {
    if(err) return next(new AppError(err))
        res.status(200).json({
            status: "success",
            length: data?.length,
            data: [data[9],data[10]],
        });
    });
};


    
    