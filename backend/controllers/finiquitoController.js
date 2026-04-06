
const conn = require("../services/db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");
const sqlMonth = require("../utils/sqlMonth");


const RUT_EMPRESA = "76308765-4"

//  RutEmpresa                          DONE
//  RutTrabajador                       DONE
//  FechaInicioContrato                 DONE
//	FechaTerminoContrato                DONE
//	CausalFiniquitoId                   DONE
//	Funciones                           DONE
//	RegionTrabajoId                     DONE
//	LugarPresentacionTrabajo            DONE
//	IndemnizacionFeriado                DONE
//	remuneracionPendiente               DONE
//	Email                               DONE
//	CodigoComunaPersonal                DONE
//	CallePersonal                       DONE
//	NumeroPersonal                      DONE
//	DepartamentoBlockPersonal           DONE
//	Telefono                            DONE
//	CuentaTransferencia                 DONE
//	BancoId                             DONE
//	TipoCuentaId                        DONE




exports.getMonth = (req, res, next) => {

  let year  = req.params.year;
  let month = req.params.month;

  let inicio = year + '-';

  if(month.length===1){

    inicio = inicio + '0' + month + '-01';
  }
  else{

    inicio = inicio + month + '-01';
  }

  



  const SQL = `
  
    WITH 
    
    ultima_asistencia AS (


      SELECT C.id,MAX(A.fecha) as fecha,A.empleado_id
      FROM contratos AS C
      LEFT JOIN asistencias AS A
      ON    C.empleado_id = A.empleado_id
      AND   C.vigente     = 0
      AND   A.fecha       <= C.termino
      AND   A.registro    = 1
      GROUP BY A.empleado_id,C.id

    )

    ,ultimo_proyecto AS(

      SELECT A.proyecto_id, UA.*
      FROM ultima_asistencia UA
      LEFT JOIN asistencias A
      ON UA.empleado_id = A.empleado_id
      AND UA.fecha = A.fecha
    )


    
    ,contratos_finiquitados AS (

      SELECT
      

      C.id                                              AS contrato_id,
      '76308765-4'                                      AS RutEmpresa,
      E.rut                                             AS RutTrabajador,
      DATE_FORMAT(CONTRATO_INICIO(C.id),"%d-%m-%Y")     AS FechaInicioContrato,
      DATE_FORMAT(C.termino, "%d-%m-%Y")                AS FechaTerminoContrato,
      DT.causadt_id                                     AS CausalFiniquitoId,
      C.labor                                           AS Funciones,
      P.region_id                                       AS RegionTrabajoId,
      P.lugar                                           AS LugarPresentacionTrabajo,
      0                                                 AS IndemnizacionFeriado,
      0                                                 AS remuneracionPendiente,
      E.email                                           AS Email,
      E.comuna_id                                       AS CodigoComunaPersonal,
      E.domicilio                                       AS CallePersonal,
      E.numero_domicilio                                AS NumeroPersonal,
      E.departamento                                    AS DepartamentoBlockPersonal,
      E.telefono                                        AS Telefono,
      E.cuenta                                          AS CuentaTransferencia,
      BDT.bancodt_id                                    AS BancoId,
      CDT.cuenta_id                                     AS TipoCuentaId


      FROM contratos C 

      INNER JOIN empleados E
      ON         C.empleado_id = E.id
      AND        C.vigente     = 0
      AND        C.anexo_id    IS NULL
      AND        C.termino     >= '${inicio}'
      AND        C.termino     <= MONTH_END('${inicio}')

      LEFT JOIN causa_causadt DT
      ON        C.causal_id = DT.causa_id

      LEFT JOIN banco_bancodt BDT
      ON        E.banco_id = BDT.banco_id

      LEFT JOIN cuenta_cuentadt CDT
      ON        E.cuenta_id = CDT.cuenta_id

      LEFT JOIN ultimo_proyecto UP
      ON  C.id = UP.id

      LEFT JOIN proyectos P
      ON  UP.proyecto_id = P.id
    )


    SELECT * FROM contratos_finiquitados;
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
 
 
