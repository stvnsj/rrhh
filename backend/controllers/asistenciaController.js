
const conn = require("../services/db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");
const util = require('util');
const db   = require('../services/db');



const query = util.promisify(db.query).bind(db);

function multiQuery(SQL,n){

  let res = "";
  for(let i = 0; i<n; i++){res = res + SQL;}
  return res;
}


/*==============
      POST
==============*/
exports.insert = (req, res, next) => {

    if (!req.body) return next(new AppError("No form data found", 404));

    const values = [

	    req.body.proyecto_id,
	    req.body.empleado_id,
	    req.body.fecha,
    ];


    conn.query(
	"INSERT INTO asistencias (proyecto_id, empleado_id, fecha) VALUES(?)",
	[values],
	function (err,data,fields) {
	    if(err) return next( new AppError(err,500));
	    res.status(201).json({
		status: "success",
		message: "Message Successfully",
	    });
	}
    );    
};














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
/*==============
       POST
  ==============*/
exports.insertAll = (req, res, next) => {

    
    if (!req.body)
        return next(new AppError("No form data found", 404));


    let values = req.body.asistencia.map(
        empleado => [
            req.body.proyecto_id,
            empleado.id,
            req.body.fecha,
            empleado.present ? 1 : 0])

    let SQL = "START TRANSACTION;"

    values.forEach(val => {

        let APPENDIX = `CALL guardar_asistencia(?);`

        SQL = SQL + APPENDIX;
        
    });

    SQL = SQL + "COMMIT;";

    conn.query(SQL, values,
	           function (err,data,fields) {
	               if(err) return next( new AppError(err,500));
	               res.status(201).json({
		               status: "success",
		               message: "Message Successfully",
	               });
	           }); 
    
};







/*==============
       GET
  ==============*/


exports.report = (req, res, next) => {


    const year   = req.params.year;
    const month  = req.params.month.length===1? '0'+req.params.month : req.params.month;
    const day    = req.params.day.length===1?   '0'+req.params.day   : req.params.day;

    const inicio = year + '-' + month + '-' + day;


    

    const SQL = `


        -- ============================  START QUERY 1  ==================================

        
        WITH recursive dates AS (

            select 
            
            '${inicio}' as fecha, 
            DATE_ADD('${inicio}', INTERVAL 7 DAY) as fecha_limite

            union 
            
            SELECT DATE_ADD(fecha,INTERVAL 1 DAY) as fecha, fecha_limite
            FROM dates where fecha < DATE_SUB(dates.fecha_limite, interval 1 day)
        )

        SELECT DAY(fecha) AS date_label FROM dates;


        -- ============================  START QUERY 2  ==================================

        WITH asistencias_mes AS (

          SELECT * FROM asistencias
          WHERE fecha >= '${inicio}'
          AND fecha < DATE_ADD('${inicio}', INTERVAL 7 DAY)
          AND registro=1
        )

        SELECT DISTINCT

        E.id,
        CONCAT(E.nombre, ' ' , E.apellido_paterno) AS nombre

        FROM empleados AS E

        INNER JOIN asistencias_mes AS A

        ON E.id = A.empleado_id;




        -- ============================  START QUERY 3 ==================================
    
        
        WITH recursive dates AS (

            select 
            
            '${inicio}' as fecha, 
            DATE_ADD('${inicio}', INTERVAL 7 DAY) as fecha_limite

            union 
            
            SELECT DATE_ADD(fecha,INTERVAL 1 DAY) as fecha, fecha_limite
            FROM dates where fecha < DATE_SUB(dates.fecha_limite, interval 1 day)

        ),

        asistencias_mes AS (

            SELECT * FROM asistencias
            WHERE fecha >= '${inicio}' 
            AND fecha < DATE_ADD('${inicio}', INTERVAL 7 DAY)
        ),

        empleados_asistentes AS (

            SELECT DISTINCT E.* FROM empleados AS E
            INNER JOIN asistencias AS A
            ON A.registro = 1
            AND A.empleado_id = E.id
            AND A.fecha >= '${inicio}' 
            AND A.fecha < DATE_ADD('${inicio}', INTERVAL 7 DAY)
        )


        SELECT 

        E.id,
        DATE_FORMAT(D.fecha, "%d/%m") as fecha,
        IFNULL(A.registro,0) AS registro,
        C.costo,
        (TO_DAYS(D.fecha) - TO_DAYS('${inicio}')) AS date_label,
        CONCAT(P.nombre, ' (', P.id, ')') AS proyecto_nombre         

        FROM empleados_asistentes AS E

        JOIN dates AS D
        
        LEFT JOIN asistencias_mes AS A
        ON A.fecha = D.fecha
        AND A.empleado_id = E.id
        AND A.registro=1


        LEFT JOIN contratos AS C
        ON C.inicio <= D.fecha
        AND (C.vigente=1 OR C.termino >= D.fecha)
        AND C.empleado_id = E.id
        LEFT JOIN proyectos AS P
        ON A.proyecto_id = P.id
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


exports.importJSON = async (req, res, next) => {
  try {
    const body = req.body;
    const project_id = body.project.id;

    const bonos      = body.bonos ?? [];
    const anticipos  = body.adelantos ?? [];
    const descuentos = body.descuentos ?? [];

    const bonos_arr = bonos.map(bono => [
      bono.employee_id,
      project_id,
      bono.valor,
      bono.fecha,
      bono.comentario,
      bono.version,   // Edition Number
      bono.codigo     // Unique Code (UNIX Timestamp)
    ]);

    const anticipos_arr = anticipos.map(anticipo => [
      anticipo.employee_id,
      project_id,
      anticipo.valor,
      anticipo.fecha,
      anticipo.comentario,
      anticipo.version, // Edition Number
      anticipo.codigo   // Unique Code (UNIX Timestamp)
    ]);

    const descuentos_arr = descuentos.map(descuento => [
      descuento.employee_id,
      project_id,
      descuento.valor,
      descuento.fecha,
      descuento.comentario,
      descuento.version, // Edition Number
      descuento.codigo   // Unique Code (UNIX Timestamp)
    ]);

    const SQL_bonos      = `CALL upsert_bonos(?, ?, ?, ?, ?, ?, ?)`;
    const SQL_anticipos  = `CALL upsert_anticipos(?, ?, ?, ?, ?, ?, ?)`;
    const SQL_descuentos = `CALL upsert_descuentos(?, ?, ?, ?, ?, ?, ?)`;

    // ---- keep your existing per-row calls ----
    for (const bono of bonos_arr) {
      await new Promise((resolve, reject) => {
        conn.query(SQL_bonos, bono, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
    }

    for (const anticipo of anticipos_arr) {
      await new Promise((resolve, reject) => {
        conn.query(SQL_anticipos, anticipo, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
    }

    for (const descuento of descuentos_arr) {
      await new Promise((resolve, reject) => {
        conn.query(SQL_descuentos, descuento, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
    }

    // ---------- ASISTENCIAS via stored procedure (changed part) ----------
    const attendance = body.attendance ?? []; // safe default
    const asistencias = attendance.map(a => [
      project_id,
      a.employee_id,
      a.date,           // 'YYYY-MM-DD'
      a.present ?? 1
    ]);

    const SQL_asistencia = `CALL upsert_asistencia(?, ?, ?, ?)`; // NEW

    for (const row of asistencias) {
      await new Promise((resolve, reject) => {
        conn.query(SQL_asistencia, row, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
    }
    // --------------------------------------------------------------------

    res.status(201).json({
      status: 'success',
      length: asistencias.length,
      message: "Registro exitoso de asistencia y gastos"
    });
  } catch (err) {
    next(err);
  }
};




/* 

Esto es una buena base. Ahora, dada la siguiente ruta:

router
    .route("/asistencia/proyecto/:proyectoid/fecha/:fecha")
    .get(asistencia_controller.get_asistencia_proyecto)



*/
exports.get_asistencia_proyecto = (req, res, next) => {
  const proyectoId = Number(req.params.proyectoid);
  const fecha = req.params.fecha;

  const SQL = `
    SELECT
      E.proyecto_id,
      E.empleado_id,
      nombre_completo(E.empleado_id) AS nombre,
      DATE_FORMAT(A.fecha, '%Y-%m-%d') AS fecha,
      A.registro
    FROM proyecto_empleado E
    LEFT JOIN asistencias A
      ON A.proyecto_id = E.proyecto_id
     AND A.empleado_id = E.empleado_id
     AND A.fecha >= ?
     AND A.fecha <= LAST_DAY(?)
    WHERE E.proyecto_id = ?
    ORDER BY E.empleado_id, A.fecha
  `;

  conn.query(SQL, [fecha, fecha, proyectoId], (err, rows) => {
    if (err) return next(new AppError(err));

    const employeesMap = new Map();

    for (const row of rows) {
      if (!employeesMap.has(row.empleado_id)) {
        employeesMap.set(row.empleado_id, {
          employeeId: row.empleado_id,
          name: row.nombre,
          attendance: [],
        });
      }

      // Only push attendance if there is an actual asistencia row
      if (row.fecha !== null) {
        employeesMap.get(row.empleado_id).attendance.push({
          date: row.fecha,
          present: row.registro === 1,
        });
      }
    }

    res.status(200).json({
      ok: true,
      data: {
        projectId: proyectoId,
        employees: Array.from(employeesMap.values()),
      },
    });
  });
};



exports.exportJSON = async (req, res, next) => {


    try{

    proyecto_id = req.params.id

    // const proyecto_id = req.param.id;
    const SQL1 = "SELECT id, nombre as name from proyectos where id = ?"
    const SQL2 = `
        SELECT 
            empleado_id as id, 
            CONCAT(nombre, " " , apellido_paterno) as name 
        FROM proyecto_empleado PE
        JOIN empleados E
        ON PE.empleado_id = E.id
        where proyecto_id = ?`
    
    const SQL3 = `
        SELECT 
            empleado_id as employee_id, 
            DATE_FORMAT(fecha,'%Y-%m-%d') as date,
            registro as present
        FROM asistencias 
        WHERE proyecto_id = ? AND registro = 1
        `

    const SQL_bonos = `
        SELECT 
            empleado_id as employee_id,
            bono as valor,
            DATE_FORMAT(fecha,'%Y-%m-%d') as fecha,
            codigo,
            COALESCE(comentario, '') AS comentario,
            version
        FROM bonos
        WHERE proyecto_id = ?
    `

    const SQL_anticipos = `
        SELECT 
            empleado_id as employee_id,
            anticipo as valor,
            DATE_FORMAT(fecha,'%Y-%m-%d') as fecha,
            codigo,
            COALESCE(comentario, '') AS comentario,
            version
        FROM anticipos
        WHERE proyecto_id = ?
    `

    const SQL_descuentos = `
        SELECT 
            empleado_id as employee_id,
            descuento as valor,
            DATE_FORMAT(fecha,'%Y-%m-%d') as fecha,
            codigo,
            COALESCE(comentario, '') AS comentario,
            version
        FROM descuentos
        WHERE proyecto_id = ?
    `

    const rows1 = await query(SQL1 , [proyecto_id]);
    const rows2 = await query(SQL2 , [rows1[0]["id"]]);
    const rows3 = await query(SQL3 , [rows1[0]["id"]]);
    const rows4 = await query(SQL_bonos , [rows1[0]["id"]]);
    const rows5 = await query(SQL_anticipos , [rows1[0]["id"]]);
    const rows6 = await query(SQL_descuentos , [rows1[0]["id"]]);


    const rows3bool = rows3.map(r => ({ ...r, present: r.present === 1 }));

    const DATA= {
        "project" : rows1[0],
        "employees" : rows2,
        "attendance": rows3bool,
        "bonos" : rows4,
        "adelantos" : rows5,
        "descuentos" : rows6
    }


    res.setHeader('Content-Type',        'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${"XXX.json"}"`);
    res.status(200).send(JSON.stringify(DATA, null, 2));
  } catch (err) {
    next(err);
  }
};





exports.registrar_asistencia = async (req, res, next) => {
  try {
    if (!req.body) {
      return next(new AppError("No form data found", 404));
    }

    const proyecto_id = Number(req.body.proyecto_id);
    const nuevas_asistencias = Array.isArray(req.body.nuevas_asistencias)
      ? req.body.nuevas_asistencias
      : [];
    const asistencias_anuladas = Array.isArray(req.body.asistencias_anuladas)
      ? req.body.asistencias_anuladas
      : [];

    if (!proyecto_id) {
      return next(new AppError("proyecto_id es obligatorio", 400));
    }

    const movimientos = [
      ...nuevas_asistencias.map((item) => ({
        empleado_id: Number(item.empleado_id),
        fecha: item.fecha,
        registro: 1,
      })),
      ...asistencias_anuladas.map((item) => ({
        empleado_id: Number(item.empleado_id),
        fecha: item.fecha,
        registro: 0,
      })),
    ];

    if (movimientos.length === 0) {
      return res.status(200).json({
        status: "success",
        length: 0,
        data: {
          proyecto_id,
          nuevas_asistencias: 0,
          asistencias_anuladas: 0,
        },
        message: "No hay cambios por registrar",
      });
    }

    const SQL = `CALL upsert_asistencia(?, ?, ?, ?)`;

    for (const mov of movimientos) {
      if (!mov.empleado_id || !mov.fecha) {
        return next(
          new AppError(
            "Cada registro debe incluir empleado_id y fecha",
            400
          )
        );
      }

      await query(SQL, [
        proyecto_id,
        mov.empleado_id,
        mov.fecha,
        mov.registro,
      ]);
    }

    res.status(201).json({
      status: "success",
      length: movimientos.length,
      data: {
        proyecto_id,
        nuevas_asistencias: nuevas_asistencias.length,
        asistencias_anuladas: asistencias_anuladas.length,
      },
      message: "Asistencia registrada correctamente",
    });
  } catch (err) {
    next(err);
  }
};


