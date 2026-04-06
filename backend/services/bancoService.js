
const conn = require("./db");
const AppError = require("../utils/AppError");
const stringToDate = require("../utils/date");



// Este es el servicio encargado de producir 
// el documento de excel para las transferencias 
// masivas en el banco Santander.


const transfer_santander = {

  16 :  "0012" , 
  17 :  "0001" , 
  19 :  "0014" , 
  20 :  "0016" , 
  21 :  "0028" , 
  23 :  "" , 
  24 :  "0039" , 
  25 :  "0049" , 
  26 :  "0051" , 

};






const month_array = {

  1:'enero',
  2:'febrero',
  3:'marzo',
  4:'abril',
  5:'mayo',
  6:'junio',
  7:'julio',
  8:'agosto',
  9:'septiembre',
  10:'octubre',
  11:'noviembre',
  12:'diciembre'
}












exports.excel = (req,res,next) => {



  const year  = req.params.year;
  const month = req.params.month;
  const inicio  = stringToDate(year,month);

  /*

  Nombre beneficiario 
  (obligatorio solo si banco destino no es Santander)	
  
  Monto transferencia 
  (obligatorio)	
  
  Glosa personalizada transferencia
  (opcional)	
  
  Correo beneficiario 
  (opcional)	
  
  Mensaje correo beneficiario 
  (opcional)	
  
  Glosa cartola originador 
  (opcional)	
  
  Glosa cartola beneficiario 
  (opcional, solo aplica si cuenta destino es Santander)

  */

        
  const SQL = `

    WITH pactado_mensual AS (

      SELECT 
      SUM(C.costo)     AS total,
      A.empleado_id    AS empleado_id

      FROM asistencias A INNER JOIN contratos C

      ON    A.empleado_id = C.empleado_id
      AND   A.fecha       >= '${inicio}'
      AND   A.fecha       <= MONTH_END('${inicio}')
      AND   A.registro = 1
      AND   C.inicio <= A.fecha
      AND  (C.vigente OR C.termino >= A.fecha)

      GROUP BY empleado_id
    )

    ,bono_mensual AS (

      SELECT 
      SUM(bono)         AS total,
      empleado_id       AS empleado_id

      FROM bonos 
      WHERE   fecha >= '${inicio}'
      AND     fecha <= MONTH_END('${inicio}')

      GROUP BY empleado_id
    )

    ,anticipo_mensual AS (

      SELECT 
      -1*SUM(anticipo)      AS total,
      empleado_id           AS empleado_id

      FROM anticipos 
      WHERE   fecha >= '${inicio}'
      AND     fecha <= MONTH_END('${inicio}')

      GROUP BY empleado_id
    )

    ,descuento_mensual AS (

      SELECT 
      -1*SUM(descuento) AS total,
      empleado_id       AS empleado_id

      FROM descuentos 
      WHERE   fecha >= '${inicio}'
      AND     fecha <= MONTH_END('${inicio}')

      GROUP BY empleado_id
    )

    ,union_mensual AS (

      SELECT * FROM pactado_mensual    UNION ALL
      SELECT * FROM bono_mensual       UNION ALL
      SELECT * FROM descuento_mensual  UNION ALL
      SELECT * FROM anticipo_mensual   
    )

    ,saldo_mensual AS (

      SELECT 
      SUM(total)   AS saldo,
      empleado_id  AS empleado_id
      FROM union_mensual
      GROUP BY empleado_id
    )

    SELECT
    banco_id                               AS banco_id,
    cuenta                                 AS cuenta,
    email                                  AS email,
    IFNULL(rut,'')                         AS rut,
    saldo                                  AS saldo,
    CONCAT(
      nombre, ' ', 
      apellido_paterno, 
      IF(apellido_materno, CONCAT(' ', apellido_materno), '')
    )  AS nombre

    FROM 
    empleados E INNER JOIN saldo_mensual S
    ON E.id = S.empleado_id

  `



  var xl = require('excel4node');
  var wb = new xl.Workbook();
  var ws = wb.addWorksheet('TEM');


  var headerStyle = wb.createStyle({
    font: {
      name: 'Arial',
      color: '#000000',
      size: 9,
    },
    alignment: {
      wrapText: true,
      horizontal: 'center',
      vertical: 'center',
    },
  });

  var leftAlign = wb.createStyle({

    font: {
      name: 'Arial',
      color: '#000000',
      size: 9,
    },

    alignment: {
      horizontal: 'left',
    },
  });

  var emailStyle = wb.createStyle({

    font: {
      name: 'Arial',
      color: '#000000',
      size: 10,
    },

    alignment: {
      horizontal: 'left',
    },

  });

  var rightAlign = wb.createStyle({

    font: {
      name: 'Arial',
      color: '#000000',
      size: 9,
    },

    alignment: {
      horizontal: 'right',
    },
  });


  ws.column(1).setWidth(25);
  ws.column(2).setWidth(25);
  ws.column(3).setWidth(25);
  ws.column(4).setWidth(25);
  ws.column(5).setWidth(25);
  ws.column(6).setWidth(25);
  ws.column(7).setWidth(25);
  ws.column(8).setWidth(25);
  ws.column(9).setWidth(25);
  ws.column(10).setWidth(25);
  ws.column(11).setWidth(25);
  ws.column(12).setWidth(25);
  ws.column(13).setWidth(25);

  ws.row(1).setHeight(45);

  let HEADER_ROW = 1;

  ws.cell(HEADER_ROW,1)
  .string('Cuenta origen\n(obligatorio)')
  .style(headerStyle);


  ws.cell(HEADER_ROW,2)
  .string('Moneda origen\n(obligatorio)')
  .style(headerStyle);


  ws.cell(HEADER_ROW,3)
  .string('Cuenta destino\n(obligatorio)')
  .style(headerStyle);


  ws.cell(HEADER_ROW,4)
  .string('Moneda destino\n(obligatorio)')
  .style(headerStyle);


  ws.cell(HEADER_ROW,5)
  .string('Código banco destino\n(obligatorio solo si banco destino no es Santander)')
  .style(headerStyle);


  ws.cell(HEADER_ROW,6)
  .string('RUT beneficiario\n(obligatorio solo si banco destino no es Santander)')
  .style(headerStyle);


  ws.cell(HEADER_ROW,7)
  .string('Nombre beneficiario\n(obligatorio solo si banco destino no es Santander)')
  .style(headerStyle);


  ws.cell(HEADER_ROW,8)
  .string('Monto transferencia\n(obligatorio)')
  .style(headerStyle);


  ws.cell(HEADER_ROW,9)
  .string('Glosa personalizada transferencia\n(opcional)')
  .style(headerStyle);


  ws.cell(HEADER_ROW,10)
  .string('Correo beneficiario\n(opcional)')
  .style(headerStyle);


  ws.cell(HEADER_ROW,11)
  .string('Mensaje correo beneficiario\n(opcional)')
  .style(headerStyle);


  ws.cell(HEADER_ROW,12)
  .string('Glosa cartola originador\n(opcional)')
  .style(headerStyle);


  ws.cell(HEADER_ROW,13)
  .string('Glosa cartola beneficiario\n(opcional, solo aplica si cuenta destino es Santander)')
  .style(headerStyle);

  const X = 2;

  /* This query returns the previred table  */
  conn.query(SQL, function (err, data, fields) {
    if(err) return next(new AppError(err))


    data.forEach((empleado,i)=>{

      let rut    = empleado.rut;
      let cuenta = empleado.cuenta;

      if(rut?.length > 0){

        rut = rut.replace(/\D/g,'');
        rut = rut.padStart(10,"0");
      }

      if(cuenta?.length > 0){

        cuenta = cuenta.replace(/\D/g,'');
      }

      

      // Número de cuenta de EQC
      ws
      .cell(X + i, 1)
      .string("000000067505999")
      .style(rightAlign);

      // Moneda Origen
      ws
      .cell(X + i, 2)
      .string("CLP")
      .style(leftAlign);

      // Número de cuenta de Beneficiario
      ws
      .cell(X + i, 3)
      .string(cuenta)
      .style(rightAlign);


      // Moneda Destino
      ws
      .cell(X + i, 4)
      .string("CLP")
      .style(leftAlign);

      // Código de Banco
      ws
      .cell(X + i, 5)
      .string(transfer_santander[empleado.banco_id])
      .style(rightAlign);

      // RUT
      ws
      .cell(X + i, 6)
      .string(rut)
      .style(rightAlign);

      // Nombre
      ws
      .cell(X + i, 7)
      .string(empleado.nombre)
      .style(leftAlign);

      // Monto a pagar
      ws
      .cell(X + i, 8)
      .number(empleado.saldo)
      .style(rightAlign);

      // Comentario
      ws
      .cell(X + i, 9)
      .string(`sueldo ${month_array[month]}`)
      .style(leftAlign);

      // EMAIL
      ws
      .cell(X + i, 10)
      .string(empleado.email)
      .style(emailStyle);

      // Comentario
      ws
      .cell(X + i, 11)
      .string(`sueldo ${month_array[month]}`)
      .style(leftAlign);
    })

    wb.write('Previred.xlsx', res);

  });

}
