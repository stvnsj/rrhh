const conn = require("../services/db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");
const readXlsxFile = require('read-excel-file/node')
const sqlDate = require('../utils/sqlDate')
const {RutFun,Processor} = require('../utils/utils');
const {Integer} = require ('read-excel-file/node');



/*=================================
*   _____   ____   _____ _______ 
*  |  __ \ / __ \ / ____|__   __|
*  | |__) | |  | | (___    | |   
*  |  ___/| |  | |\___ \   | |   
*  | |    | |__| |____) |  | |   
*  |_|     \____/|_____/   |_|   
*
*==================================*/


const eqc_header    = {
    folio  : "FOLIOFACTURA",
    fecha  : "FECHA",
    valor  : "MONTO",
    proyecto_id : "PROYECTO",
    rut : "RUT_CLIENTE",
    razon_social : "RAZON_SOCIAL_CLIENTE"
}

const eqc_schema = {
    'FOLIOFACTURA'  :{ prop  : 'folio'        , type : String },
    'FECHA'         :{ prop  : 'fecha'        , type : Date },
    'MONTO'         :{ prop  : 'valor'        , type : Integer },
    'PROYECTO'      :{ prop  : 'proyecto_id'  , type : Integer  },
    'RUT_CLIENTE'   :{ prop  : 'rut'          , type : String },
    'RAZON_SOCIAL_CLIENTE' : {prop:'razon_social', type:String},
}


const header    = {
    rut    : "RUT",
    folio  : "FOLIOFACTURA",
    fecha  : "FECHA",
    valor  : "MONTO",
    razon_social : "RAZON_SOCIAL"}

const schema = {
    'RUT'           :{ prop  : 'rut'          , type : String },
    'FOLIOFACTURA'  :{ prop  : 'folio'        , type : String },
    'FECHA'         :{ prop  : 'fecha'        , type : Date },
    'MONTO'         :{ prop  : 'valor'        , type : Integer },
    'RAZON_SOCIAL'  :{ prop  : 'razon_social' , type : String },
    'CATEGORIA'     :{ prop  : 'categoria_id' , type : Integer },
    'PROYECTO'      :{ prop  : 'proyecto_id'  , type : Integer  }
}

const categorias = [1,2,3,4,5,6,7,8,9,10];


/* ···························································· */
/* :ooo        ooooo             oooo      .    o8o           : */
/* :`88.       .888'             `888    .o8    `"'           : */
/* : 888b     d'888  oooo  oooo   888  .o888oo oooo           : */
/* : 8 Y88. .P  888  `888  `888   888    888   `888           : */
/* : 8  `888'   888   888   888   888    888    888           : */
/* : 8    Y     888   888   888   888    888 .  888           : */
/* :o8o        o888o  `V88V"V8P' o888o   "888" o888o          : */
/* :                                                          : */
/* :                                                          : */
/* :                                                          : */
/* :  .oooooo.                                                : */
/* : d8P'  `Y8b                                               : */
/* :888      888    oooo  oooo   .ooooo.  oooo d8b oooo    ooo: */
/* :888      888    `888  `888  d88' `88b `888""8P  `88.  .8' : */
/* :888      888     888   888  888ooo888  888       `88..8'  : */
/* :`88b    d88b     888   888  888    .o  888        `888'   : */
/* : `Y8bood8P'Ybd'  `V88V"V8P' `Y8bod8P' d888b        .8'    : */
/* :                                               .o..P'     : */
/* :                                               `Y8P'      : */
/* ···························································· */

/* ========================
              POST 
  ========================= */
exports.upload = (req,res,next) => {

    const test_empty = function(row_number,document,field){

        if (document[field] === null || document[field] === undefined){
            res.status(400).json({
                status:"Error",
                message:`Fila ${row_number}: campo '${header[field]}' es invalido o está vacío`});
            return true;
        }
        return false;
    }

    
    const filename = req.file.filename;


    let ROW_NUMBER = 2;
    let UPLOADED = 0;



    // File path.
    readXlsxFile(`uploads/facturas/${filename}`,{schema,ignoreEmptyRows:true}).then(({rows}) => {

        // Validación de Campos
        for (let factura of rows){
            if (test_empty(ROW_NUMBER,factura,'rut')) return;
            if (test_empty(ROW_NUMBER,factura,'folio')) return;
            if (test_empty(ROW_NUMBER,factura,'fecha')) return;
            if (test_empty(ROW_NUMBER,factura,'folio')) return;
            if (test_empty(ROW_NUMBER,factura,'valor')) return;
            if (test_empty(ROW_NUMBER,factura,'razon_social')) return;

            // ==================== RUT VALIDACIÓN =====================            
            if (!RutFun.validaRut(factura.rut)) {
                res.status(400).json({status:"Error",
                                      message:`Fila ${ROW_NUMBER}: Rut ${factura.rut} es invalido.`});
                return;}

            // ================== VALOR VALIDACIóN ======================
            if (factura.valor <= 0)  {
                res.status(400).json({status:"Error",
                                      message:`Fila ${ROW_NUMBER}: El MONTO de la factura debe ser positivo.`});
                return;}

            // ================= CATEGORIA VALIDACIÓN ===================
            if (factura.categoria && !categorias.includes(factura.categoria_id)) {
                res.status(400).json({status:"Error",
                                      message:`Fila ${ROW_NUMBER}: El campo no es una categoria valida.`});
                return;}


            
            ROW_NUMBER++;
            UPLOADED++;
            
        }

                
        if (UPLOADED == 0) {
                res.status(400).json({status:"Error",
                                      message:`0 facturas cargadas`});
                return;}

        
        const values = rows.map( (boleta) => {
            return [
                RutFun.normalize( boleta.rut ),
                Processor.normalize( boleta.folio ),
                sqlDate( boleta.fecha),
                boleta.valor,
                boleta.razon_social,
                boleta.categoria_id,
                boleta.proyecto_id,
                null,
                1
            ];
        })

        let SQL = "START TRANSACTION;"
        
        values.forEach(val => {
            let APPENDIX = ` CALL guardar_costo(?);`
            SQL = SQL + APPENDIX;
        });

        SQL = SQL + "COMMIT";;

        conn.query(
            SQL ,
            values,
            function (err,data,fields) {
                if(err) return next( new AppError(err,500));
                res.status(201).json({
                    status: "success",
                    message: `${UPLOADED} facturas cargadas`,
                });
            });
        
    }).catch((err)=>{
        console.log(err);
        res.status(400).json({
            status: "Error",
            message: "El documento está mal estructurado."
        });
        return;
    })
}






exports.eqc_upload = (req,res,next) => {

    const test_empty = function(row_number,document,field){

        if (document[field] === null || document[field] === undefined){
            res.status(400).json({
                status:"Error",
                message:`Fila ${row_number}: campo '${eqc_header[field]}' es invalido o está vacío`});
            return true;
        }
        return false;
    }

    
    const filename = req.file.filename;

    let ROW_NUMBER = 2;
    let UPLOADED = 0;
const filePath = req.file.path;

    // File path.
readXlsxFile(filePath, { schema: eqc_schema, ignoreEmptyRows: true }).then(({rows}) => {

        // Validación de Campos
        for (let factura of rows){
            if (test_empty(ROW_NUMBER,factura,'folio')) return;
            if (test_empty(ROW_NUMBER,factura,'fecha')) return;
            if (test_empty(ROW_NUMBER,factura,'valor')) return;
            if (test_empty(ROW_NUMBER,factura,'rut')) return;
            if (test_empty(ROW_NUMBER,factura,'razon_social')) return;

            if (!RutFun.validaRut(factura.rut)) {
                res.status(400).json({status:"Error",
                                      message:`Fila ${ROW_NUMBER}: Rut ${factura.rut} es invalido.`});
                return;}

            // ================== VALOR VALIDACIóN ======================
            if (factura.valor <= 0)  {
                res.status(400).json({status:"Error",
                                      message:`Fila ${ROW_NUMBER}: El MONTO de la factura debe ser positivo.`});
                return;}

            // ================= CATEGORIA VALIDACIÓN ===================



            
            ROW_NUMBER++;
            UPLOADED++;
            
        }

                
        if (UPLOADED == 0) {
                res.status(400).json({status:"Error",
                                      message:`0 facturas cargadas`});
                return;}

        
        const values = rows.map( (factura) => {
            return [
                Processor.normalize( factura.folio ),
                sqlDate( factura.fecha),
                factura.valor,
                factura.proyecto_id,
                "",
                RutFun.normalize( factura.rut ),
                factura.razon_social,
            ];
        })

        let SQL = "START TRANSACTION;"
        
        values.forEach(val => {
            let APPENDIX = ` CALL guardar_factura_eqc(?);`
            SQL = SQL + APPENDIX;
        });

        SQL = SQL + "COMMIT";

        console.log(SQL)

        conn.query(
            SQL ,
            values,
            function (err,data,fields) {
                if(err) return next( new AppError(err,500));
                res.status(201).json({
                    status: "success",
                    message: `${UPLOADED} facturas cargadas`,
                });
            });
        
    }).catch((err)=>{
        console.log(err);
        res.status(400).json({
            status: "Error",
            message: "El documento está mal estructurado."
        });
        return;
    })
}


















exports.eqc_create = (req, res, next) => {




    /* Values to be inserted on database */
    const values = [

		Processor.normalize( req.body.folio ),
		req.body.fecha,
		req.body.valor,
		req.body.proyecto_id,
        req.body.comentario,
        req.body.rut,
        req.body.razon_social
    ];

    const SQL = `
        START TRANSACTION;
        CALL guardar_factura_eqc(?);
        COMMIT;

    `
    
    conn.query(SQL,[values],
        function (err,data,fields) {
            if(err) return next( new AppError(err,500));
            res.status(201).json({
            status: "Success",
            message: "Factura EQC creada",
            });
        }
    );
};








exports.create = (req, res, next) => {



    
    if ( ! RutFun.validaRut(req.body.rut)) {
        res.status(400).json({
            status:"Error",
            message:"El rut de la factura no es válido!"});
        return;
    }


    /* Values to be inserted on database */
    const values = [

		RutFun.normalize( req.body.rut ),
		Processor.normalize( req.body.folio ),
		req.body.fecha,
		req.body.valor,
		req.body.razon_social,
		req.body.categoria_id,
		req.body.proyecto_id,
        req.body.comentario,
        1
    ];

    const SQL = `
                  START TRANSACTION;
                  CALL guardar_costo(?);
                  COMMIT;

    `
    
    conn.query(SQL,[values],
        function (err,data,fields) {
            if(err) return next( new AppError(err,500));
            res.status(201).json({
            status: "Success",
            message: "Factura creada",
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
*===================================*/


/* Get all active proyectos */
exports.getMonth = (req, res, next) => {

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

        SELECT 

        
        F.id,
        F.rut,
        F.folio,
	      DATE_FORMAT(F.fecha, "%d/%m/%Y")  as fecha,
        F.valor,
        F.razon_social,
        F.pagina,
        F.categoria_id,
        F.proyecto_id,
        F.comentario,
        F.fecha_registro,
      

        C.categoria,
        P.nombre AS proyecto_nombre


        FROM facturas F 
        
        LEFT JOIN proyectos P
        ON F.proyecto_id = P.id

        LEFT JOIN categorias C
        ON F.categoria_id=C.id

        WHERE F.fecha >= '${inicio}' AND F.fecha < '${termino}';
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





exports.getMonthEQC = (req, res, next) => {

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

        SELECT 

        F.id,
        F.folio,
	    DATE_FORMAT(F.fecha, "%d/%m/%Y")  as fecha,
        F.valor,
        F.proyecto_id,
        F.comentario,
        F.fecha_registro,
        P.nombre AS proyecto_nombre

        FROM facturas_eqc F 
        
        LEFT JOIN proyectos P
        ON F.proyecto_id = P.id


        WHERE F.fecha >= '${inicio}' AND F.fecha < '${termino}';
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
//============================================================================
const {read_factura_corta, creat_factura_report} = require("../excel/index");
const {readSiiBuffer} = require("../csv/readers/sii_reader")
const { getSessionConn } = require("../services/dbv2");

exports.cargar_facturas_sii = async (req, res, next) => {



    try {
    const facturasEqc = req.files?.facturas_eqc?.[0];
    const facturasSii = req.files?.facturas_sii?.[0];

    if (!facturasEqc || !facturasSii) {
      return res.status(400).json({
        status: "error",
        message: "Debes subir ambos archivos",
      });
    }


    const cortas_data = await read_factura_corta (facturasEqc.buffer);
    const sii_data =   readSiiBuffer (facturasSii.buffer);


    const session = await getSessionConn();

    try {
        
        //await session.query("INSERT INTO tmp_ids (id) VALUES (?), (?), (?)", [1, 2, 3]);

        await session.query("call crear_tmp_facturas_cortas();");
        await session.query("call crear_tmp_facturas_sii();");


        for (const factura of cortas_data) {
            await session.query("call insertar_factura_corta(?,?,?,?);", 
                [
                    factura["rut"],
                    factura["folio"],
                    factura["categoria_id"],
                    factura["proyecto_id"]
                ]);
        }

        for (const factura of sii_data) {
            await session.query("call insertar_factura_sii(?,?,?,?,?,?)",
                [
                    factura["rut"],
                    factura["folio"],
                    factura["valor"],
                    factura["fecha"],                    
                    factura["razon_social"],
                    factura["tipo_doc"],
                ]
            )

        }

        await session.query("call crear_tmp_outer_join_facturas();");

        const carga_data = await session.query("call crear_tmp_facturas_carga();");
        const pendiente_data = await session.query("call crear_tmp_facturas_pendiente();");
        const no_encontrada_data = await session.query("call crear_tmp_facturas_no_encontrada();");
        await session.query("call tmp_facturas_carga_test();");
        await session.query("call insertar_factura_carga();");
        const workbook = creat_factura_report(carga_data,pendiente_data,no_encontrada_data);






    } finally {
        session.release();
        console.log("SESSION RELEASED")
    }


    return res.status(200).json({
      status: "success",
      message: "Ambos archivos llegaron correctamente",
    });
    
  } catch (err) {
    next(err);
  }

}
 */



const asyncHandler = require("../utils/asyncHandler");
const { buildFacturaReportBuffer } = require("../services/facturaServicio");

function makeAppError(message, statusCode = 500) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.status = "error";
  return err;
}

exports.cargar_facturas_sii = asyncHandler(async (req, res) => {
  const facturasEqc = req.files?.facturas_eqc?.[0];
  const facturasSii = req.files?.facturas_sii?.[0];

  if (!facturasEqc || !facturasSii) {
    throw makeAppError("Debes subir ambos archivos", 400);
  }

  const buffer = await buildFacturaReportBuffer(
    facturasEqc.buffer,
    facturasSii.buffer
  );

  res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="reporte_facturas.xlsx"'
  );

  return res.status(200).send(Buffer.from(buffer));
});