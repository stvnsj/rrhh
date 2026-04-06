
const conn = require("./db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");
const sqlMonth = require("../utils/sqlMonth");



const LAST = 16;


const red  = 'ff3838'
const yel  = 'ffed38'
const blu  = '3892ff'
const grn  = '40ad31'
const gry  = 'd4d4d4'


function alphaIndex(columnNumber) {
    
    let columnLabel = '';
    const base = 26;
    const aCode = 'A'.charCodeAt(0);
    
    while (columnNumber > 0) {
        columnNumber--; // Adjust for 1-based index (A=1, B=2, ...)
        const remainder = columnNumber % base;
        const char = String.fromCharCode(aCode + remainder);
        columnLabel = char + columnLabel;
        columnNumber = Math.floor(columnNumber / base);
    }
    
    return columnLabel;
    
}




const mes = {

  1:'Enero',
  2:'Febrero',
  3:'Marzo',
  4:'Abril',
  5:'Mayo',
  6:'Junio',
  7:'Julio',
  8:'Agosto',
  9:'Septiembre',
  10:'Octubre',
  11:'Noviembre',
  12:'Diciembre',
}





exports.lista_asistentes = (req, res, next) => {

  const year   = req.params.year;
  const month  = req.params.month.length===1? '0'+req.params.month : req.params.month;


  const inicio = year + '-' + month + '-01';

  const QUERY = `
  
    SELECT distinct

    e.rut,
    e.nombre,
    e.apellido_paterno as apellido1,
    e.apellido_materno as apellido2,
    p.nombre           as proyecto_nombre,
    p.id               as proyecto_id,
    ${year}  AS anno,
    ${month} AS mes

    FROM empleados e 

    INNER JOIN asistencias a
    ON    a.registro = 1
    AND   a.fecha >= '${inicio}'
    AND   a.fecha <= MONTH_END('${inicio}')
    AND   a.empleado_id = e.id

    INNER JOIN proyectos p
    ON    a.proyecto_id = p.id

    ORDER BY proyecto_id
  `

  var xl = require('excel4node');
  var wb = new xl.Workbook();
  var ws = wb.addWorksheet(`Trabajadores asistencias ` + mes[month] + " de " + year);


  var bodyStyle = wb.createStyle({
    border: {
      left: {style: 'thin', color: 'black',},
      top: {style: 'thin', color: 'black',},
      bottom: {style: 'thin', color: 'black',},
      right: {style: 'thin', color: 'black',},
      outline: false
    },
  });



  var blueStyle = wb.createStyle({
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
      fgColor: blu,
    }

  });

  var greyStyle = wb.createStyle({

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
      fgColor: gry,
    }
  });


  var whiteStyle = wb.createStyle({

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
      fgColor: 'ffffff',
    }
  });

 

















  var titleStyle = wb.createStyle({
    font: {
      bold: true, size: 14,
    },
    alignment: {
      wrapText: true,
      horizontal: 'center',
      vertical: 'center',
    },
    border:{
      left: {style: 'medium', color: 'black',},
      top: {style: 'medium', color: 'black',},
      bottom: {style: 'medium', color: 'black',},
      right: {style: 'medium', color: 'black',},
      outline: false
    }
  });







  ws.addImage({
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
        col: 4,
        colOff: 1,
        row: 4,
        rowOff: 0,
      },
    },
  });


  ws.cell(5,2,6,5,true).string(`Asistencia ${mes[req.params.month]} ${req.params.year}`).style(titleStyle)




  let X = 10;



  ws.column(1).setWidth(10);
  ws.column(2).setWidth(10);
  ws.column(3).setWidth(20);
  ws.column(4).setWidth(55);
  ws.column(5).setWidth(55);




  ws.cell(X,1)
  .string('MES')
  .style(blueStyle)

  ws.cell(X,2)
  .string('AÑO')
  .style(blueStyle)

  ws.cell(X,3)
  .string('RUT')
  .style(blueStyle)

  ws.cell(X,4)
  .string('NOMBRE')
  .style(blueStyle)

  ws.cell(X,5)
  .string('PROYECTO')
  .style(blueStyle)


  X++;

  let prev_proy_id = -1;

  /* This query returns the previred table  */
  conn.query(QUERY, function (err, data, fields) {
    if(err) return next(new AppError(err))
    if(data.length == 0) wb.write('lista.xlsx', res);


    data.forEach((trabajador, i)=>{

      ws
      .cell(X + i, 1)
      .string(`${trabajador.mes}`)
      .style(bodyStyle)

      ws
      .cell(X + i, 2)
      .string(`${trabajador.anno}`)
      .style(bodyStyle)


      ws
      .cell(X + i, 3)
      .string(`${trabajador.rut}`)
      .style(bodyStyle)


      ws
      .cell(X + i, 4)
      .string(`${trabajador.nombre} ${trabajador.apellido1} ${trabajador.apellido2}`)
      .style(bodyStyle)


      ws
      .cell(X +i, 5)
      .string(`${trabajador.proyecto_nombre}`)
      .style(bodyStyle)



    })

    wb.write('lista.xlsx', res);

  });
}



/*========================================================

  This module exports the previred excel file.

  =======================================================*/

exports.monthlyAsistencia = (req,res,next) => {



    const year   = req.params.year;
    const month  = req.params.month.length===1? '0'+req.params.month : req.params.month;


    const inicio = year + '-' + month + '-01';

    const SQL = `


    -- ============================  START QUERY 1  ==================================

    
    WITH recursive dates AS (

        select 
        
        '${inicio}' as fecha, 
        DATE_ADD('${inicio}', INTERVAL 1 MONTH) as fecha_limite

        union 
        
        SELECT DATE_ADD(fecha,INTERVAL 1 DAY) as fecha, fecha_limite
        FROM dates where fecha < DATE_SUB(dates.fecha_limite, interval 1 day)
    )

    SELECT fecha AS date_label FROM dates;


    -- ============================  START QUERY 2  ==================================

    SET @empleado_index=0;
    WITH asistencias_mes AS (

        SELECT * FROM asistencias
        WHERE fecha >= '${inicio}'
        AND fecha < DATE_ADD('${inicio}', INTERVAL 1 MONTH)
        AND registro=1
    )

    SELECT DISTINCT
    (@empleado_index := @empleado_index + 1) as empleado_index,
    E.id,
    CONCAT(E.nombre, ' ' , E.apellido_paterno) AS nombre

    FROM empleados AS E

    INNER JOIN asistencias_mes AS A

    ON E.id = A.empleado_id;

    -- ============================  START QUERY 3 ==================================

    
    WITH recursive dates AS (

        select 
        
        '${inicio}' as fecha, 
        DATE_ADD('${inicio}', INTERVAL 1 MONTH) as fecha_limite

        union 
        
        SELECT DATE_ADD(fecha,INTERVAL 1 DAY) as fecha, fecha_limite
        FROM dates where fecha < DATE_SUB(dates.fecha_limite, interval 1 day)

    ),

    asistencias_mes AS (

        SELECT * FROM asistencias
        WHERE fecha >= '${inicio}' 
        AND fecha < DATE_ADD('${inicio}', INTERVAL 1 MONTH)
    ),

    empleados_asistentes AS (

        SELECT DISTINCT E.* FROM empleados AS E
        INNER JOIN asistencias AS A
        ON A.registro = 1
        AND A.empleado_id = E.id
        AND A.fecha >= '${inicio}' 
        AND A.fecha < DATE_ADD('${inicio}', INTERVAL 1 MONTH)
    )


    SELECT 

    E.id,
    D.fecha as fecha,
    IFNULL(A.registro,0) AS registro,
    IFNULL(C.costo,0) as costo,
    (TO_DAYS(D.fecha) - TO_DAYS('${inicio}')) AS day_index
    

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
`


  var xl = require('excel4node');
  var wb = new xl.Workbook();
  var ws = wb.addWorksheet(`Asistencia ${mes[req.params.month]}`);


  var bodyStyle = wb.createStyle({
    border: {
      left: {style: 'thin', color: 'black',},
      top: {style: 'thin', color: 'black',},
      bottom: {style: 'thin', color: 'black',},
      right: {style: 'thin', color: 'black',},
      outline: false
    },

    // 
	  numberFormat: '$##,#; -$##,#; ',

  });



  var blueStyle = wb.createStyle({
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
      fgColor: blu,
    },

    // 
	  numberFormat: '$##,#; -$##,#; ',

  });



  var nameStyle = wb.createStyle({
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
      fgColor: 'ffd55c',
    },
  });





  var asistenciaStyle = wb.createStyle({
    border: {
      left: {style: 'thin', color: 'black',},
      top: {style: 'thin', color: 'black',},
      bottom: {style: 'thin', color: 'black',},
      outline: false
    },
    fill:{
      type: 'pattern',
      patternType: 'solid',
      fgColor: '4d8447',
    },

    numberFormat: '',
  });



  var inasistenciaStyle = wb.createStyle({
    border: {
      left: {style: 'thin', color: 'black',},
      top: {style: 'thin', color: 'black',},
      bottom: {style: 'thin', color: 'black',},
      outline: false
    },
    fill:{
      type: 'pattern',
      patternType: 'solid',
      fgColor: 'ed3f3f',
    },

    numberFormat: '',
  });




  var yellowStyle = wb.createStyle({
    border: {
      left: {style: 'thin', color: 'black',},
      top: {style: 'thin', color: 'black',},
      bottom: {style: 'thin', color: 'black',},
      outline: false
    },
    fill:{
      type: 'pattern',
      patternType: 'solid',
      fgColor: yel,
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
	  numberFormat: 'dd/mm/yyyy',
    fill:{
      type: 'pattern',
      patternType: 'solid',
      fgColor: '92c7f7',
    },
  });






  var titleStyle = wb.createStyle({
    font: {
      bold: true, size: 14,
    },
    alignment: {
      wrapText: true,
      horizontal: 'center',
      vertical: 'center',
    },
    border:{
      left: {style: 'medium', color: 'black',},
      top: {style: 'medium', color: 'black',},
      bottom: {style: 'medium', color: 'black',},
      right: {style: 'medium', color: 'black',},
      outline: false
    }
  });







  ws.addImage({
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
        col: 4,
        colOff: 1,
        row: 4,
        rowOff: 0,
      },
    },
  });


  ws.cell(5,2,6,5,true).string(`Asistencia ${mes[req.params.month]} ${req.params.year}`).style(titleStyle)




  let HEADER_ROW = 10;


  

  /* This query returns the previred table  */
  conn.query(SQL, function (err, data, fields) {
    if(err) return next(new AppError(err))






    if(data[2].length===0){


      ws.cell(8, 2 ,10, 6,true).string('Mes sin Asistencias').style(titleStyle);

    }


    else{


      const DAYS = data[0];
      const EMPLEADOS = data[2];


      DAYS.forEach((empleado,i)=>{

        ws.cell(HEADER_ROW + 1 + i, 1).date(empleado.date_label).style(dateStyle);

      })


      data[2].forEach((empleado,i)=>{

        ws.cell(HEADER_ROW, 2 + i*2 ,HEADER_ROW, 3 + i*2,true).string(empleado.nombre).style(yellowStyle);
        ws.column(2 + i*2).setWidth(5);
        ws.column(3 + i*2).setWidth(13);

        ws.cell(HEADER_ROW + DAYS.length+1, 2 + i*2)
        .formula(
          `SUM(${alphaIndex(2 + i*2)}${HEADER_ROW +1 }:${alphaIndex(2 + i*2)}${HEADER_ROW + DAYS.length})`
        )
        .style(yellowStyle);


        ws.cell(HEADER_ROW + DAYS.length+1, 3 + i*2)
        .formula(
          `SUM(${alphaIndex(3 + i*2)}${HEADER_ROW +1 }:${alphaIndex(3 + i*2)}${HEADER_ROW + DAYS.length})`
        )
        .style(blueStyle);



      })


      data[3].forEach((empleado,i)=>{

        const idx = data[2].find((e)=> empleado.id === e.id).empleado_index;

        ws.cell(HEADER_ROW + 1 + empleado.day_index, idx*2 ).number(empleado.registro).style(bodyStyle);
        ws.cell(HEADER_ROW + 1 + empleado.day_index, idx*2+1 ).number(empleado.costo).style(bodyStyle);


        if(empleado.registro){

          ws.cell(HEADER_ROW + 1 + empleado.day_index, idx*2 ).number(1).style(asistenciaStyle);
          ws.cell(HEADER_ROW + 1 + empleado.day_index, idx*2+1 ).number(empleado.costo).style(bodyStyle);
        }

        else{

          ws.cell(HEADER_ROW + 1 + empleado.day_index, idx*2 ).number(0).style(inasistenciaStyle);
          ws.cell(HEADER_ROW + 1 + empleado.day_index, idx*2+1 ).number(0).style(bodyStyle);
        }
        

      })

    }

    wb.write('Previred.xlsx', res);

  });
}


