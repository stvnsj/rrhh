const conn = require("../services/db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");
const readXlsxFile = require('read-excel-file/node');
const sqlDate = require('../utils/sqlDate');
const {RutFun,Processor} = require('../utils/utils');
const {Integer} = require ('read-excel-file/node');


const schema = {
    'RUT':          { prop : 'rut',          type : String },
    'FOLIOBOLETA':  { prop : 'folio',        type : String },
    'FECHA':        { prop : 'fecha',        type : Date },
    'MONTO':        { prop : 'valor',        type : Integer },
    'RAZON_SOCIAL': { prop : 'razon_social', type : String },
    'CATEGORIA':    { prop : 'categoria_id', type : Integer },
    'PROYECTO':     { prop : 'proyecto_id',  type : Integer },
}




const header    = {
    rut    : "RUT",
    folio  : "FOLIOBOLETA",
    fecha  : "FECHA",
    valor  : "MONTO",
    razon_social : "RAZON_SOCIAL"}

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
    let UPLOADED   = 0;
    // File path.
    readXlsxFile(`uploads/boletas/${filename}`,{schema,ignoreEmptyRows:true}).then(({rows}) => {

        // Validación de Campos
        for (let boleta of rows){
            if (test_empty(ROW_NUMBER,boleta,'rut')) return;
            if (test_empty(ROW_NUMBER,boleta,'folio')) return;
            if (test_empty(ROW_NUMBER,boleta,'fecha')) return;
            if (test_empty(ROW_NUMBER,boleta,'folio')) return;
            if (test_empty(ROW_NUMBER,boleta,'valor')) return;
            if (test_empty(ROW_NUMBER,boleta,'razon_social')) return;

            // ==================== RUT VALIDACIÓN =====================            
            if (!RutFun.validaRut(boleta.rut)) {
                res.status(400).json({status:"Error",
                                      message:`Fila ${ROW_NUMBER}: Rut ${boleta.rut} es invalido.`});
                return;}

            // ================== VALOR VALIDACIóN ======================
            if (boleta.valor <= 0)  {
                res.status(400).json({status:"Error",
                                      message:`Fila ${ROW_NUMBER}: El MONTO de la boleta debe ser positivo.`});
                return;}

            // ================= CATEGORIA VALIDACIÓN ===================
            if (boleta.categoria && !categorias.includes(boleta.categoria_id)) {
                res.status(400).json({status:"Error",
                                      message:`Fila ${ROW_NUMBER}: El campo no es una categoria valida.`});
                return;}


            
            ROW_NUMBER++;
            UPLOADED++;
            
        }

                
        if (UPLOADED == 0) {
                res.status(400).json({status:"Error",
                                      message:`0 boletas cargadas`});
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
                2
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
                    message: `${UPLOADED} boletas cargadas`,
                });
            });
        
    }).catch((err)=>{

        
        res.status(400).json({
            status: "Error",
            message: "El documento está mal estructurado",
        });
        return;
    })
}




exports.create = (req, res, next) => {
    
    if ( ! RutFun.validaRut(req.body.rut)) {
        
        res.status(400).json({
            status:"Error",
            message:"El rut de la boleta no es válido!"});
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
        2
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
                       status: "success",
                       message: "proyecto created",
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

        B.id,
        B.rut,
        B.folio,
	      DATE_FORMAT(B.fecha, "%d/%m/%Y")  as fecha,
        B.valor,
        B.razon_social,
        B.pagina,
        B.categoria_id,
        B.proyecto_id,
        B.comentario,
        B.fecha_registro,
        C.categoria,
        P.nombre AS proyecto_nombre


        FROM boletas B 
        
        LEFT JOIN proyectos P
        ON B.proyecto_id = P.id

        LEFT JOIN categorias C
        ON B.categoria_id=C.id

        WHERE B.fecha >= '${inicio}' AND B.fecha < '${termino}';
    
    `;



    conn.query(SQL, function (err, data, fields) {
	    if(err) return next(new AppError(err))
		res.status(200).json({
		    status: "success",
		    length: data?.length,
		    data: data,
		});

    });


};





