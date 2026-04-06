


const conn           = require("../services/db");
const AppError       = require("../utils/AppError");
const errorHandler   = require("../utils/errorHandler");
const readXlsxFile   = require('read-excel-file/node')
const costo_service  = require('../services/costoService')
const ExcelJS = require('exceljs');





/*==================================
 *        _____ ______ _______ 
 *       / ____|  ____|__   __|
 *      | |  __| |__     | |   
 *      | | |_ |  __|    | |   
 *      | |__| | |____   | |   
 *       \_____|______|  |_|   
 *
 *===================================*/








exports.report = (req, res, next) => {
    
    const date1 = req.body.fecha1;
    const date2 = req.body.fecha2;
    const proyecto_arr = req.body.empresaIds;

    console.log(date1);
    console.log(date2);
    console.log(proyecto_arr);

    if (!Array.isArray(proyecto_arr) || proyecto_arr.length === 0) {
        return res.status(400).json({
            status: "error",
            message: "empresaIds debe ser un arreglo no vacío",
        });
    }

    // sanitize / force numeric ids
    const ids = proyecto_arr.map(Number).filter(Number.isInteger);

    if (ids.length !== proyecto_arr.length) {
        return res.status(400).json({
            status: "error",
            message: "Todos los ids deben ser enteros válidos",
        });
    }

    const valuesPlaceholders = ids.map(() => "(?)").join(", ");

    const sql_query = `
        DROP TEMPORARY TABLE IF EXISTS tmp_proyecto_id;
        CREATE TEMPORARY TABLE tmp_proyecto_id (id INT);
        INSERT INTO tmp_proyecto_id (id) VALUES ${valuesPlaceholders};
        CALL costo_report(?, ?);
    `;

    const params = [...ids, date1, date2];

    conn.query(sql_query, params, function (err, data, fields) {
        console.log(err);
        if (err) return next(new AppError(err));

        res.status(200).json({
            status: "success",
            length: data?.length,
            data: data,
        });
        console.log(data)
    });
};





// req.params: year, month, option
exports.fullCosto = (req,res,next) => {

    const date1      = req.params.date1;
    const date2      = req.params.date2;
    const option     = req.params.option;



    costo_service.CostoFull(date1, date2, option, res, next);  

}



// req.params: year, month, option
exports.boletasProyecto = (req,res,next) => {


    const option         = req.params.option;
    const proyecto_id    = req.params.proyecto_id;
    

    costo_service.boletasProyecto(option, proyecto_id, res, next);  

}


// req.params: year, month, option
exports.facturasProyecto = (req,res,next) => {

    const option         = req.params.option;
    const proyecto_id    = req.params.proyecto_id;
    

    costo_service.facturasProyecto(option, proyecto_id, res, next);  

}

// req.params: year, month, option
exports.transferenciasProyecto = (req,res,next) => {

    const option         = req.params.option;
    const proyecto_id    = req.params.proyecto_id;
    

    costo_service.transferenciasProyecto(option, proyecto_id, res, next);  

}


// req.params: year, month, option
exports.costosProyecto = (req,res,next) => {

    const option         = req.params.option;
    const proyecto_id    = req.params.proyecto_id;
    

    costo_service.costosProyecto(option, proyecto_id, res, next);  

}









exports.fullCostoSummary = (req,res,next) => {

  const year     = req.params.year;

  // costo_service.CostoFullSummary(year, res, next);

}










exports.summary = (req, res, next) => {

    const year = req.params.year;
    const month = req.params.month;


    let anno_termino = parseInt(year);
    let mes_termino = parseInt(month) + 1;

    if(mes_termino>12){
        mes_termino = 1;
        anno_termino = anno_termino + 1;
    }

    const inicio  = year+'-'+month+'-1';
    const termino = anno_termino +'-'+mes_termino+'-1';



    const SQL = `

        WITH 

        proyecto_costo AS (

            SELECT

            P.nombre         AS name,
            B.valor          AS total_boleta,
            F.valor          AS total_factura,
            T.valor          AS total_transferencia

            FROM proyectos AS P

            LEFT JOIN 
            (SELECT B.proyecto_id, sum(B.valor) AS valor
            FROM boletas B 
            WHERE B.fecha >= '${inicio}' AND B.fecha < '${termino}'
            GROUP BY B.proyecto_id) B 
            ON P.id = B.proyecto_id

            LEFT JOIN 
            (SELECT F.proyecto_id, sum(F.valor) AS valor 
            FROM facturas F 
            WHERE F.fecha >= '${inicio}' AND F.fecha < '${termino}'
            GROUP BY F.proyecto_id) F 
            on P.id = F.proyecto_id

            LEFT JOIN 
            (SELECT T.proyecto_id, sum(T.valor) AS valor
            FROM transferencias T 
            WHERE T.fecha >= '${inicio}' AND T.fecha < '${termino}'
            GROUP BY T.proyecto_id) T 
            on P.id = T.proyecto_id



            UNION


            SELECT

            'Sin Proyecto'    AS name,
            total_boleta,
            total_factura,
            total_transferencia


            FROM
            (
                SELECT SUM(B.valor) as total_boleta
                FROM boletas B 
                WHERE  B.fecha >= '${inicio}' AND B.fecha < '${termino}' 
                AND B.proyecto_id IS NULL
            ) AS XXX




            JOIN
            (
                SELECT SUM(F.valor) as total_factura 
                FROM facturas F
                WHERE  F.fecha >= '${inicio}' AND F.fecha < '${termino}' 
                AND F.proyecto_id IS NULL
            ) AS YYY

            


            JOIN
            (
                SELECT SUM(T.valor) as total_transferencia
                FROM transferencias T
                WHERE  T.fecha >= '${inicio}' AND T.fecha < '${termino}' 
                AND T.proyecto_id IS NULL
            ) AS ZZZ


        )

        , categoria_costo AS (

            SELECT
            C.categoria      AS name,
            B.valor          AS total_boleta,
            F.valor          AS total_factura,
            T.valor          AS total_transferencia

            FROM categorias AS C

            LEFT JOIN 
            (SELECT B.categoria_id, sum(B.valor) AS valor
            FROM boletas B 
            WHERE B.fecha >= '${inicio}' AND B.fecha < '${termino}'
            GROUP BY B.categoria_id) B 
            ON C.id = B.categoria_id

            LEFT JOIN 
            (SELECT F.categoria_id, sum(F.valor) AS valor 
            FROM facturas F 
            WHERE F.fecha >= '${inicio}' AND F.fecha < '${termino}'
            GROUP BY F.categoria_id) F 
            on C.id = F.categoria_id

            LEFT JOIN 
            (SELECT T.categoria_id, sum(T.valor) AS valor
            FROM transferencias T 
            WHERE T.fecha >= '${inicio}' AND T.fecha < '${termino}'
            GROUP BY T.categoria_id) T 
            on C.id = T.categoria_id
        ),




        -- ===================PROYECTO TOTAL====================
        proyecto_total  AS (

            SELECT 
            name,
            0                as global_type,
            1                as proyecto_type,
            0                as transferencia_type,
            total_boleta,
            total_factura,
            total_transferencia,
            (
                IFNULL(total_boleta,0) 
                + IFNULL(total_factura,0) 
                + IFNULL(total_transferencia,0) 
            ) AS total
            FROM proyecto_costo
            
        ),



        -- ===================CATEGORIA TOTAL====================
        categoria_total  AS (

            SELECT 
            name,
            0                                     AS global_type,
            0                                     AS proyecto_type,
            1                                     AS transferencia_type,
            total_boleta,
            total_factura,
            total_transferencia,
            (
                IFNULL(total_boleta,0) 
                + IFNULL(total_factura,0) 
                + IFNULL(total_transferencia,0)
            )                                     AS total
            FROM categoria_costo
            
        )



        -- ====================== QUERY ===========================
        SELECT 
        'Global'                     AS name,
        1                            AS global_type,
        0                            AS proyecto_type,
        0                            AS categoria_type,
        SUM(CT.total_boleta)         AS total_boleta,
        SUM(CT.total_factura)        AS total_factura,
        SUM(CT.total_transferencia)  AS total_transferencia,
        SUM(CT.total)                AS total
        FROM categoria_total AS CT

        UNION 

        SELECT 
        name,
        0                            AS global_type,
        1                            AS proyecto_type,
        0                            AS categoria_type,
        PT.total_boleta              AS total_boleta,
        PT.total_factura             AS total_factura,
        PT.total_transferencia       AS total_transferencia,
        PT.total                     AS total
        FROM proyecto_total AS PT

        UNION

        SELECT 
        name,
        0                            AS global_type,
        0                            AS proyecto_type,
        1                            AS categoria_type,
        CT.total_boleta              AS total_boleta,
        CT.total_factura             AS total_factura,
        CT.total_transferencia       AS total_transferencia,
        CT.total                     AS total
        FROM categoria_total AS CT


        --
        -- INTERFACE
        -- =========
        --
        -- name                  : nombre del proyecto o la categoria
        --
        -- total_boleta          : 
        -- total_factura         :
        -- total_transferencia   :
        --
        -- tipo_global           :
        -- tipo_proyecto         :
        -- tipo_categoria        :
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













// Get all boletas, facturas and transferencias in a single Excel file.




















/*==================================
*       _____  _    _ _______ 
*      |  __ \| |  | |__   __|
*      | |__) | |  | |  | |   
*      |  ___/| |  | |  | |   
*      | |    | |__| |  | |   
*      |_|     \____/   |_|   
* 
*===================================*/

exports.edit = (req, res, next) => {

  let documento           = req.body.documento;
  let field               = req.body.field;
  let value               = req.body.value;
  let id                  = req.body.id;


  const values = [documento, field, value, id]

	var SQL = `
  
    UPDATE
    ??
    SET
    ?? = ?
    WHERE id = ?
  `



  
 	conn.query(SQL, values, function (err, data, fields) {
 	  if(err) return next(new AppError(err))
 	  res.status(200).json({
 	    status: "success",
 	    length: data?.length,
 	    data: data,
 	  });
 	})

  

};




/*=====================================================
*     _____  ______ _      ______ _______ ______ 
*    |  __ \|  ____| |    |  ____|__   __|  ____|
*    | |  | | |__  | |    | |__     | |  | |__   
*    | |  | |  __| | |    |  __|    | |  |  __|  
*    | |__| | |____| |____| |____   | |  | |____ 
*    |_____/|______|______|______|  |_|  |______|
*                                                         
*======================================================*/



exports.delete = (req, res, next) => {

  let documento           = req.params.documento;
  let id                  = req.params.id;


    const values = [documento, id, documento]

    var SQL = `
  
    DELETE FROM ${documento} WHERE id = ${id};
    ALTER TABLE ${documento} ORDER BY id;

  `



  
 	conn.query(SQL, values, function (err, data, fields) {
 	  if(err) return next(new AppError(err))
 	  res.status(200).json({
 	    status: "success",
 	    length: data?.length,
 	    data: data,
 	  });
 	})
};


