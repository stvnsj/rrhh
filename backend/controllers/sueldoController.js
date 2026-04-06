

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


exports.sueldos = (req, res, next) => {

  const year  = req.params.year;
  const month = req.params.month;
  let   start  = year + '-';
  if (month.length===1) start = start + '0' + month + '-01';
  else start = start + month + '-01';

  const SQL = `

    WITH sueldos_mes AS (

      SELECT SUM(costo) AS total, A.empleado_id, C.id AS contrato_id

      FROM asistencias A INNER JOIN contratos C
      
      ON    A.empleado_id = C.empleado_id
      AND   A.fecha       >= '${start}'
      AND   A.fecha       <= MONTH_END('${start}')
      AND   C.inicio      <= A.fecha
      AND   (C.vigente OR C.termino >= A.fecha)
      AND   A.registro    = 1

      GROUP BY A.empleado_id, C.id
    )


    ,bonos_mes AS (

      SELECT SUM(bono) AS total, B.empleado_id, C.id AS contrato_id
      FROM   bonos  B INNER JOIN contratos C

      ON    C.empleado_id = B.empleado_id
      AND   B.fecha       >= '${start}' 
      AND   B.fecha       <= MONTH_END('${start}')
      AND   C.inicio      <= B.fecha
      AND   (C.vigente OR C.termino >= B.fecha)

      GROUP BY B.empleado_id, C.id
    )

    ,descuentos_mes AS (

      SELECT -1*SUM(descuento) AS total, D.empleado_id, C.id AS contrato_id
      FROM descuentos D INNER JOIN contratos C

      ON     D.empleado_id =  C.empleado_id
      AND    D.fecha       >= '${start}' 
      AND    D.fecha       <= MONTH_END('${start}')
      AND    C.inicio      <= D.fecha
      AND   (C.vigente OR C.termino >= D.fecha)

      GROUP BY D.empleado_id, C.id

    )

    ,anticipos_mes AS (

      SELECT -1*SUM(anticipo) AS total, A.empleado_id, C.id AS contrato_id
      FROM anticipos A INNER JOIN contratos C

      ON     A.empleado_id = C.empleado_id
      AND    A.fecha >= '${start}' 
      AND    A.fecha <= MONTH_END('${start}')
      AND    C.inicio  <= A.fecha
      AND   (C.vigente OR C.termino >= A.fecha)
      GROUP BY empleado_id
    )

    ,pagos_mes AS (

      SELECT -1*SUM(valor) AS total, empleado_id, contrato_id
      FROM pagos
      WHERE  fecha >= '${start}' 
      AND    fecha <= MONTH_END('${start}')
      GROUP BY empleado_id, contrato_id
    )

    ,union_mes AS (

      SELECT * FROM sueldos_mes        UNION ALL
      SELECT * FROM bonos_mes          UNION ALL
      SELECT * FROM descuentos_mes     UNION ALL
      SELECT * FROM anticipos_mes      UNION ALL
      SELECT * FROM pagos_mes          
    )

    ,saldos_mes AS (

      SELECT sum(total) AS total,empleado_id,contrato_id
      FROM union_mes
      GROUP BY empleado_id, contrato_id
    )

    SELECT 

    E.id,
    CONCAT(E.nombre, ' ', E.apellido_paterno)  AS  nombre,
    saldos_mes.contrato_id                     AS  contrato_id,
    total 

    FROM saldos_mes 
    INNER JOIN empleados E
    ON saldos_mes.empleado_id = E.id;

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

exports.insertMultiple = (req, res, next) => {


  if (!req.body) return next(new AppError("No form data found", 404));


  const values = req.body.map(
    sueldo => [sueldo.id, sueldo.valor, sueldo.fecha, sueldo.contrato_id]
  );


  const SQL = `

    INSERT INTO pagos(empleado_id, valor, fecha, contrato_id) VALUES ?

  `

  conn.query(SQL,[values],
    function (err,data,fields) {
      if(err) return next( new AppError(err,500));
      res.status(201).json({
        status: "success",
        message: "",
      });
    }
  );
};


exports.insertSingle = (req, res, next) => {


  if (!req.body) return next(new AppError("No form data found", 404));

  const empleado_id = req.body.empleado_id;
  const valor       = req.body.valor;
  const fecha       = req.body.fecha;
  const contrato_id = req.body.contrato_id;

  const SQL = `

    INSERT INTO pagos(empleado_id, valor, fecha, contrato_id) 
    VALUES (${empleado_id},${valor},'${fecha}', ${contrato_id})

  `

  conn.query(SQL,
    function (err,data,fields) {
      if(err) return next( new AppError(err,500));
      res.status(201).json({
        status: "success",
        message: "",
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