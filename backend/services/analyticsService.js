const conn = require("./db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");
const sqlMonth = require("../utils/sqlMonth");
const stringToDate = require("../utils/date");
const readXlsxFile = require('read-excel-file/node')
const {XcelFile} = require("../utils/xcel");





const sheetTitle = (sht, ttl, stl) => {


  sht.addImage({
    path: './eqc.png',
    type: 'picture',
    position: {
      type: 'twoCellAnchor',
      from: {
        col: 2,
        colOff: 1,
        row: 1,
        rowOff: 0,
      },
      to: {
        col: 3,
        colOff: 1,
        row: 4,
        rowOff: 0,
      },
    },
  });

  sht.cell(5,2,6,5,true).string(ttl).style(stl)
}




exports.xxx = (req, res, next) => {
    
    let xcelFile = new XcelFile

    let sheet1 = xcelFile.addWorksheet("nombre de prueba","titulo de prueba");

    xcelFile.sum(sheet1,10,2,4,2,8,2);

    xcelFile.write("TEST",res);
}















exports.xport = (proyecto_id, res, next) => {


  const SQL =`

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
    SUM(neto)      AS presupuesto_total,
    SUM(oficial)   AS presupuesto_oficial
    FROM presupuesto
    WHERE proyecto_id = ${proyecto_id}
  )

  ,finiquitos_proyecto AS(

    SELECT 
    -- ERROR HERE 
    SUM(finiquito)  AS  total
    FROM contratos
    WHERE NOT vigente
    AND proyecto_id = ${proyecto_id}
  )

  ,previred_proyecto AS(

    SELECT
    SUM(valor)          as total
    FROM previred
    WHERE proyecto_id = ${proyecto_id}
  )

  , X AS (


    SELECT 

    P.nombre,

    IFNULL(P.tiempo_estimado, 0) AS tiempo_estimado,
    IFNULL(P.tiempo_oficial, 0) AS tiempo_oficial,

    IFNULL(B.total,0) 
    + IFNULL(F.total,0) 
    + IFNULL(T.total,0) 
    + IFNULL(S.total,0)
    + IFNULL(Bo.total,0)
    + IFNULL(D.total,0)        
    + IFNULL(Fin.total,0)  
    + IFNULL(Pre.total,0)      AS gasto_real,

    Pr.presupuesto_total       AS presupuesto_total,
    Pr.presupuesto_oficial     AS presupuesto_oficial



    FROM 
    
    datos_proyecto              P

    JOIN total_boletas          B
    JOIN total_facturas         F
    JOIN total_transferencias   T

    JOIN total_sueldos          S
    JOIN total_bonos            Bo
    JOIN total_descuentos       D

    JOIN finiquitos_proyecto    Fin
    JOIN previred_proyecto      Pre

    JOIN presupuesto_proyecto   Pr
  )


  SELECT 
  X.nombre,
  X.tiempo_estimado,
  X.tiempo_oficial,
  IFNULL(X.gasto_real,0)                                             AS gasto_real,
  IFNULL(X.presupuesto_total,0)                                      AS presupuesto_total,
  IFNULL(X.presupuesto_oficial,0)                                    AS presupuesto_oficial,
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

    SELECT id AS categoria_id , categoria AS categoria_nombre
    FROM categorias
    UNION 
    SELECT 10, 'PERSONAL'
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

  ,total_previred AS (

    SELECT 
    SUM(valor) AS categoria_total,
    10 AS categoria_id,
    ${proyecto_id} AS proyecto_id
    FROM previred
    WHERE proyecto_id = ${proyecto_id}
  )

  ,total_union AS (

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
    SELECT * FROM total_previred
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


  var xl = require('excel4node');
  var wb = new xl.Workbook();





  var textStyle = wb.createStyle({
    border: {
      left: {style: 'thin', color: 'black',},
      top: {style: 'thin', color: 'black',},
      bottom: {style: 'thin', color: 'black',},
      right: {style: 'thin', color: 'black',},
      outline: false
    },
  });




  var moneyStyle = wb.createStyle({
    border: {
      left: {style: 'thin', color: 'black',},
      top: {style: 'thin', color: 'black',},
      bottom: {style: 'thin', color: 'black',},
      right: {style: 'thin', color: 'black',},
      outline: false
    },
    numberFormat: '$##,#; -$##,#; ',
  });






  var yellowStyle = wb.createStyle({
    border: {
      left: {style: 'thin', color: 'black',},
      top: {style: 'thin', color: 'black',},
      bottom: {style: 'thin', color: 'black',},
      right: {style: 'thin', color: 'black',},
      outline: false
    },
    fill:{
      type: 'pattern',
      patternType: 'solid',
      fgColor: 'f1be00',
    },

    numberFormat: '',
  });









  var dateStyle = wb.createStyle({
    border: {
      left: {style: 'thin', color: 'black',},
      top: {style: 'thin', color: 'black',},
      bottom: {style: 'thin', color: 'black',},
      right: {style: 'thin', color: 'black',},
      outline: false
    },
    numberFormat: 'dd/mm/yyyy'
  });






  let lightGreyStyle = wb.createStyle({

    fill:{
      type: 'pattern',
      patternType: 'solid',
      fgColor: 'c7c7c7',
    },
  });




  var titleStyle = wb.createStyle({
    font: {
      size: 13,
    },
    alignment: {
      wrapText: true,
      horizontal: 'center',
      vertical: 'center',
    },
    border:{
      left: {style: 'thin', color: 'black',},
      top: {style: 'thin', color: 'black',},
      bottom: {style: 'thin', color: 'black',},
      right: {style: 'thin', color: 'black',},
      outline: false
    }
  });


  

  const HEADER_ROW = 10;

  let CURR_ROW = HEADER_ROW;
  const rutWidth = 15;
  const folioWidth = 15;
  const fechaWidth = 15;
  const valorWidth = 15;
  const nombreWidth = 15;
  const categoriaWidth = 15;


  let ws =  wb.addWorksheet("ANALISIS");

  



  //This query returns the previred table  
  conn.query(SQL, function (err, data, fields) {

    if(err) return next(new AppError(err));



    sheetTitle(
      ws,
      `ANALISIS DE PROYECTO`, 
      titleStyle
    );

    ws.cell(CURR_ROW,1).string('Gasto Real').style(yellowStyle);
    ws.cell(CURR_ROW,2).string('Presupuesto Neto').style(yellowStyle);
    ws.cell(CURR_ROW,3).string('% de Gasto').style(yellowStyle);
    ws.cell(CURR_ROW,4).string('Presupuesto Oficial').style(yellowStyle);
    ws.cell(CURR_ROW,5).string('Utilidad (%)').style(yellowStyle);
    ws.cell(CURR_ROW,6).string('Utilidad ($)').style(yellowStyle);

    ws.column(1).setWidth(rutWidth);
    ws.column(2).setWidth(folioWidth);
    ws.column(3).setWidth(fechaWidth);
    ws.column(4).setWidth(valorWidth);
    ws.column(5).setWidth(nombreWidth);
    ws.column(6).setWidth(categoriaWidth);

    CURR_ROW++;
  
    
    const proyecto = data[0][0];
    console.log(proyecto);


    ws.cell(CURR_ROW, 1).number(proyecto.gasto_real?proyecto.gasto_real:0).style(moneyStyle).style(lightGreyStyle);
    ws.cell(CURR_ROW, 2).number(proyecto.presupuesto_total?proyecto.presupuesto_total:0).style(moneyStyle);
    ws.cell(CURR_ROW, 3).number(proyecto.gasto_porcentaje?proyecto.gasto_porcentaje:0).style(moneyStyle).style(lightGreyStyle);
    ws.cell(CURR_ROW, 4).number(proyecto.presupuesto_oficial?proyecto.presupuesto_oficial:0).style(moneyStyle);
    ws.cell(CURR_ROW, 5).number(proyecto.utilidad?proyecto.utilidad:0).style(moneyStyle).style(lightGreyStyle);
    ws.cell(CURR_ROW, 6).number(proyecto.ganancia?proyecto.ganancia:0).style(moneyStyle);
    
    CURR_ROW = CURR_ROW + 5;

  
    wb.write('Costos.xlsx', res);
    
  });

}
