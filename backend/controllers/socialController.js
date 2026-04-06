
const conn = require("../services/db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");





/*==================================
*        _____ ______ _______ 
*       / ____|  ____|__   __|
*      | |  __| |__     | |   
*      | | |_ |  __|    | |   
*      | |__| | |____   | |   
*       \_____|______|  |_|   
*
*==================================*/


exports.social = (req, res, next) => {


  const year  = req.params.year;
  const month = req.params.month;
  let   start  = year + '-';
  if (month.length===1) start = start + '0' + month + '-01';
  else start = start + month + '-01';


  const SQL = `
  
    WITH contratos_vigentes AS (

      SELECT * FROM contratos
      WHERE inicio <= MONTH_END('${start}')
      AND (vigente OR termino >= '${start}')
      AND (anexo_id IS NULL OR (NOT anexo_id IS NOT NULL AND termino > MONTH_END('${start}')))
    )

    SELECT

    E.id                                         AS id,
    CONCAT(E.nombre, ' ', E.apellido_paterno)    AS nombre,
    IFNULL(P.valor,0)                            AS total,
    C.id                                         AS contrato_id

    FROM empleados E

    INNER JOIN contratos_vigentes C
    ON E.id = C.empleado_id


    LEFT JOIN previred P
    ON   E.id = P.empleado_id 
    AND  P.fecha >= '${start}'
    AND  P.fecha <= MONTH_END('${start}')
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

  const empleado_id    =   req.body.empleado_id;
  const proyecto_id    =   req.body.proyecto_id;
  const valor          =   req.body.valor;
  const fecha          =   req.body.fecha;
  const contrato_id    =   req.body.contrato_id;

  const SQL = `

    INSERT INTO previred(empleado_id, valor, fecha, contrato_id, proyecto_id) 
    VALUES (${empleado_id}, ${valor}, '${fecha}', ${contrato_id}, ${proyecto_id})
    ON DUPLICATE KEY UPDATE valor=${valor};
  `

  conn.query(SQL,
    function (err,data,fields) {
      if(err) return next( new AppError(err,500));
      res.status(201).json({
        status: "success",
        message: "Sueldo minimo creado exitosamente",
      });
    }
  );
};


exports.new = (req, res, next) => {

  if (!req.body) return next(new AppError("No form data found", 404));

  const valor          =   req.body.valor;
  const comentario     =   req.body.comentario;
  const fecha          =   req.body.fecha;

  
  const SQL = `
    INSERT INTO social(valor,comentario,fecha) VALUES (?,?,?)
  `

  conn.query(SQL,[valor,comentario,fecha],
    function (err,data,fields) {
      console.log(err)
      if(err) return next( new AppError(err,500));
      res.status(201).json({
        status: "success",
        message: "Valor ingresado exitosamente",
      });
    }
  );
};


exports.get = (req, res, next) => {

  const SQL = `
  SELECT 
    DATE_FORMAT(fecha, "%m/%Y") AS fecha,
    valor,
    comentario

  FROM social ORDER BY fecha DESC
  `

  conn.query(SQL,
    function (err,data,fields) {
      if(err) return next( new AppError(err,500));
      res.status(201).json({
        data: data,
        status: "success",
        message: "Valor ingresado exitosamente",
      });
    }
  );
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
