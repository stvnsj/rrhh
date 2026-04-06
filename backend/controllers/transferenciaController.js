const conn = require("../services/db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");
const readXlsxFile = require('read-excel-file/node')
const sqlDate = require('../utils/sqlDate')
const {RutFun,Processor} = require('../utils/utils')
const {Integer} = require ('read-excel-file/node');


const schema = {

    'RUT':          {prop:'rut',          type:String},
    'CODIGO':       {prop:'codigo',       type:String},
    'FECHA':        {prop:'fecha',        type:Date},
    'MONTO':        {prop:'valor',        type:Integer},
    'DESTINATARIO': {prop:'nombre',       type:String},
    'CATEGORIA':    {prop:'categoria_id', type:Integer},
    'PROYECTO':     {prop:'proyecto_id',  type:Integer}
}


const header    = {
    rut    : "RUT",
    codigo  : "CODIGO",
    fecha  : "FECHA",
    valor  : "MONTO",
    razon_social : "DESTINATARIO"}

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
            return true;}
        
        return false;
    }


    const filename = req.file.filename;

    let ROW_NUMBER = 2;
    let UPLOADED = 0;

    readXlsxFile(`uploads/transferencias/${filename}`,{schema,ignoreEmptyRows:true}).then(({rows}) => {

        for (let transfer of rows){

            

            if (test_empty(ROW_NUMBER,transfer,'rut')) return;
            if (test_empty(ROW_NUMBER,transfer,'codigo')) return;
            if (test_empty(ROW_NUMBER,transfer,'fecha')) return;
            if (test_empty(ROW_NUMBER,transfer,'valor')) return;
            if (test_empty(ROW_NUMBER,transfer,'nombre')) return;

            // ==================== RUT VALIDACIÓN =====================            
            if (!RutFun.validaRut(transfer.rut)) {
                res.status(400).json({status:"Error",
                                      message:`Fila ${ROW_NUMBER}: Rut ${transfer.rut} es invalido.`});
                return;}

            // ================== VALOR VALIDACIóN ======================
            if (transfer.valor <= 0)  {
                res.status(400).json({status:"Error",
                                      message:`Fila ${ROW_NUMBER}: El MONTO de la transferencia debe ser positivo.`});
                return;}

            // ================= CATEGORIA VALIDACIÓN ===================
            if (transfer.categoria && !categorias.includes(transfer.categoria_id)) {
                res.status(400).json({status:"Error",
                                      message:`Fila ${ROW_NUMBER}: El campo no es una categoria valida.`});
                return;}




            console.log(ROW_NUMBER);
            console.log(transfer);
            
            ROW_NUMBER++;

            UPLOADED++;
        }


        
        if (UPLOADED == 0) {
                res.status(400).json({status:"Error",
                                      message:`0 transferencias cargadas`});
                return;}

        
        
        
        const values = rows.map( (transferencia) => {
            
            return [
                RutFun.normalize(transferencia.rut),
                Processor.normalize(transferencia.codigo),
                sqlDate(transferencia.fecha),
                transferencia.valor,
                transferencia.nombre,
                transferencia.categoria_id,
                transferencia.proyecto_id,
                null,
                3
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
                    message: `${UPLOADED} transferencias cargadas`,
                });
            });
        
    }).catch((err)=>{
        res.status(400).json({
            status: "Error",
            message: err,
        });
        return;
    })
}





exports.create = (req, res, next) => {

    if ( !RutFun.validaRut(req.body.rut)) {
        res.status(400).json({
            status:"Error",
            message:"El rut de la transferencia no es válido!"});
        return
    }

    /* Values to be inserted on database */
    const values = [

        RutFun.normalize(req.body.rut),
        Processor.normalize(req.body.codigo),
  	    req.body.fecha,
		req.body.valor,
		req.body.nombre,
		req.body.categoria_id,
		req.body.proyecto_id,
        req.body.comentario,
        3
        
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
        T.id,
	      T.rut,
	      DATE_FORMAT(T.fecha, "%d/%m/%Y")  as fecha,
	      T.valor,
	      T.nombre,
	      T.detalle,
	      T.categoria_id,
	      T.proyecto_id,
	      T.comentario,
	      T.codigo,
	      T.fecha_registro,

        C.categoria,
        P.nombre AS proyecto_nombre


        FROM transferencias T 
        
        LEFT JOIN proyectos P
        ON T.proyecto_id = P.id

        LEFT JOIN categorias C
        ON T.categoria_id=C.id

        WHERE T.fecha >= '${inicio}' AND T.fecha < '${termino}';
    
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

