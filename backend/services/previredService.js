
const conn = require("./db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");
const sqlMonth = require("../utils/sqlMonth");
const stringToDate = require("../utils/date")


const LAST = 16;

alphaIndex = {
  1   :'A',
  2   :'B',
  3   :'C',
  4   :'D',
  5   :'E',
  6   :'F',
  7   :'G',
  8   :'H',
  9   :'I',
  10  :'J',
  11  :'K',
  12  :'L',
  13  :'M',
  14  :'N',
  15  :'O',
  16  :'P',
  17  :'Q',
  18  :'R',
  19  :'S',
  20  :'T',
  21  :'U',
  22  :'V',
  23  :'W',
}


const prevision = {
    
  1:'Capital',
  2:'Cuprum',
  3:'Habitat',
  4:'PlanVital',
  5:'ProVida',
  6:'Modelo',
  7:'Uno',
}


const salud = {

  1:'Fonasa',
  2:'Banmédica',
  3:'Isalud',
  4:'Colmena',
  5:'Consalud',
  6:'CruzBlanca',
  7:'Cruz del Norte',
  8:'Nueva MasVida',
  9:'Vida Tres',
}

const causa = {
  7:'art 161',
  1:'art 159 Nr. 1',
  2:'art 159 Nr. 2',
  3:'art 159 Nr. 3',
  4:'art 159 Nr 4',
  5:'art 159 Nr 5',
  6:'art 160 Nr 3',
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




/*========================================================

  This module exports the previred excel file.

  =======================================================*/

exports.foo = (req,res,next) => {

    const year  = req.params.year;
    const month = req.params.month;
    const SQL = `call aggregate_previred(build_date(${year},${month}))`

    
    var xl = require('excel4node');
    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('Con Contrato');
    let ws2 = wb.addWorksheet('A Honorarios')
    

  ws.column(1).setWidth(4);
  ws.column(2).setWidth(25);
  ws.column(3).setWidth(15);
  ws.column(4).setWidth(25);
  ws.column(5).setWidth(20);
  ws.column(6).setWidth(20);
  ws.column(7).setWidth(20);
  ws.column(8).setWidth(4);
  ws.column(9).setWidth(20);
  ws.column(10).setWidth(20);
  ws.column(11).setWidth(20);
  ws.column(12).setWidth(20);
  ws.column(13).setWidth(50);
  ws.column(14).setWidth(20);
  ws.column(15).setWidth(20);
  ws.column(16).setWidth(20);


  ws2.column(1).setWidth(4);
  ws2.column(2).setWidth(25);
  ws2.column(3).setWidth(15);
  ws2.column(4).setWidth(25);
  ws2.column(5).setWidth(20);
  ws2.column(6).setWidth(20);
  ws2.column(7).setWidth(20);
  ws2.column(8).setWidth(4);
  ws2.column(9).setWidth(20);
  ws2.column(10).setWidth(20);
  ws2.column(11).setWidth(20);
  ws2.column(12).setWidth(20);
  ws2.column(13).setWidth(50);
  ws2.column(14).setWidth(20);
  ws2.column(15).setWidth(20);
  ws2.column(16).setWidth(20);





  var bodyStyle = wb.createStyle({
    border: {
      left: {style: 'thin', color: 'black',},
      top: {style: 'thin', color: 'black',},
      bottom: {style: 'thin', color: 'black',},
      right: {style: 'thin', color: 'black',},
      outline: false
    },

    // 
	  numberFormat: '$##,#; -$##,#; -',

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
  });

  var headerStyle = wb.createStyle({

    border: {
      left: {style: 'thin', color: 'black',},
      top: {style: 'thin', color: 'black',},
      bottom: {style: 'thin', color: 'black',},
      right: {style: 'thin', color: 'black',},
      outline: false
    },
    font: {
      bold: true,
      color: '000000',
    },

    fill:{
      type: 'pattern',
      patternType: 'solid',
      fgColor: 'cae6ff',
    },
  });


  var periodStyle = wb.createStyle({

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
      fgColor: '92c7f7',
    },
  });



  let borderStyle = wb.createStyle({

    border: {
      left: {style: 'thin', color: 'black',},
      top: {style: 'thin', color: 'black',},
      bottom: {style: 'thin', color: 'black',},
      right: {style: 'thin', color: 'black',},
      outline: false
    },
  })


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
      bottom: {style: 'thin', color: 'black',},
      right: {style: 'medium', color: 'black',},
      outline: false
    }
  });

  var subTitleStyle = wb.createStyle({
    font: {
      bold: true, size: 10,
    },
    alignment: {
      wrapText: true,
      horizontal: 'center',
      vertical: 'center',
    },
    border:{
      left: {style: 'medium', color: 'black',},
      top: {style: 'thin', color: 'black',},
      bottom: {style: 'medium', color: 'black',},
      right: {style: 'medium', color: 'black',},
      outline: false
    }
  });


  var companyName = wb.createStyle({
    font: {
      bold: true, size: 10,
    },
    alignment: {
      wrapText: true,
      horizontal: 'right',
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
        row: 2,
        rowOff: 0,
      },
      to: {
        col: 3,
        colOff: 1,
        row: 5,
        rowOff: 0,
      },
    },
  });

  ws2.addImage({
    path: './eqc.png',
    type: 'picture',
    position: {
      type: 'twoCellAnchor',
      from: {
        col: 2,
        colOff: 1,
        row: 2,
        rowOff: 0,
      },
      to: {
        col: 3,
        colOff: 1,
        row: 5,
        rowOff: 0,
      },
    },
  });


  ws.cell(6,2).string('Período').style(periodStyle)
  ws.cell(6,3).string(mes[req.params.month]).style(borderStyle)

  ws.cell(2, 2, 4, 4, true)
  .string('Eduardo Quezada y cia LTDA  ')
  .style(companyName);

  ws.cell(2, 5, 3, 15, true)
  .string('Detalles de Remuneraciones')
  .style(titleStyle);

  ws.cell(4, 5, 4, 15, true)
  .string('Trabajadores con Contrato, con Previred')
  .style(subTitleStyle);



  //////////////////////////////////////////

  ws2.cell(6,2).string('Período').style(periodStyle)
  ws2.cell(6,3).string(mes[req.params.month]).style(borderStyle)



  ws2.cell(2, 2, 4, 4, true)
  .string('Eduardo Quezada y cia LTDA  ')
  .style(companyName);

  ws2.cell(2, 5, 3, 15, true)
  .string('Detalles de Remuneraciones')
  .style(titleStyle);

  ws2.cell(4, 5, 4, 15, true)
  .string('Trabajadores a honorarios, sin Previred')
  .style(subTitleStyle);




  //////////////////////////////////////////

  let HEADER_ROW = 10;
  ws.cell(HEADER_ROW,1).string('N').style(headerStyle)
  ws.cell(HEADER_ROW,2).string('Nombre').style(headerStyle)
  ws.cell(HEADER_ROW,3).string('RUT').style(headerStyle)
  ws.cell(HEADER_ROW,4).string('Cargo').style(headerStyle)
  ws.cell(HEADER_ROW,5).string('Sueldo Base').style(headerStyle)
  ws.cell(HEADER_ROW,6).string('Fecha Ingreso').style(headerStyle)
  ws.cell(HEADER_ROW,7).string('Pactado Diario').style(headerStyle)
  ws.cell(HEADER_ROW,8).string('DT').style(headerStyle)
  ws.cell(HEADER_ROW,9).string('Pactado Mensual').style(headerStyle)
  ws.cell(HEADER_ROW,10).string('Líquido a Pagar').style(headerStyle)
  ws.cell(HEADER_ROW,11).string('Saldo').style(headerStyle)
  ws.cell(HEADER_ROW,12).string('Dias Previred').style(headerStyle)
  ws.cell(HEADER_ROW,13).string('Fecha Finiquito').style(headerStyle)
  ws.cell(HEADER_ROW,14).string('Causal Término de Contrato').style(headerStyle)
  ws.cell(HEADER_ROW,15).string('AFP').style(headerStyle)
  ws.cell(HEADER_ROW,16).string('Salud').style(headerStyle)


  let r2 = 10;
  ws2.cell(r2,1).string('N').style(headerStyle)
  ws2.cell(r2,2).string('Nombre').style(headerStyle)
  ws2.cell(r2,3).string('RUT').style(headerStyle)
  ws2.cell(r2,4).string('Cargo').style(headerStyle)
  ws2.cell(r2,5).string('Sueldo Base').style(headerStyle)
  ws2.cell(r2,6).string('Fecha Ingreso').style(headerStyle)
  ws2.cell(r2,7).string('Pactado Diario').style(headerStyle)
  ws2.cell(r2,8).string('DT').style(headerStyle)
  ws2.cell(r2,9).string('Pactado Mensual').style(headerStyle)
  ws2.cell(r2,10).string('Líquido a Pagar').style(headerStyle)
  ws2.cell(r2,11).string('Saldo').style(headerStyle)
  ws2.cell(r2,12).string('').style(headerStyle)
  ws2.cell(r2,13).string('Fecha Finiquito').style(headerStyle)
  ws2.cell(r2,14).string('Causal Término de Contrato').style(headerStyle)
  ws2.cell(r2,15).string('AFP').style(headerStyle)
  ws2.cell(r2,16).string('Salud').style(headerStyle)
    
    
    
    let i1=1;
    let i2=1;
    
    
    /* This query returns the previred table  */
    conn.query(SQL, function (err, data, fields) {
        if(err) return next(new AppError(err))
        
        
        data[0].forEach((empleado,i)=>{
            
            if(empleado.formal)
            {
                
                ws.cell(HEADER_ROW + i1, 1).number(i1).style(borderStyle)
                ws.cell(HEADER_ROW + i1, 2).string(empleado.nombre).style(bodyStyle);
                ws.cell(HEADER_ROW + i1, 3).string(empleado.rut).style(bodyStyle)
                ws.cell(HEADER_ROW + i1, 4).string(empleado.cargo).style(bodyStyle)
                ws.cell(HEADER_ROW + i1, 5).number(empleado.sueldo_base).style(bodyStyle).style(bodyStyle)
                
                empleado.fecha_ingreso ?
                    ws.cell(HEADER_ROW + i1, 6).date(empleado.fecha_ingreso).style(dateStyle):
                    ws.cell(HEADER_ROW + i1, 6).string('').style(bodyStyle)
                
                ws.cell(HEADER_ROW + i1, 7).number(empleado.sueldo_diario).style(bodyStyle)
                ws.cell(HEADER_ROW + i1, 8).number(empleado.DT).style(borderStyle)
                ws.cell(HEADER_ROW + i1, 9).number(empleado.sueldo_mensual).style(bodyStyle)
                ws.cell(HEADER_ROW + i1, 10).number(empleado.liquido).style(bodyStyle)
                ws.cell(HEADER_ROW + i1, 11).number(empleado.saldo).style(bodyStyle)
                
                ws.cell(HEADER_ROW + i1, 12).number(empleado.dias_previred).style(borderStyle)
                
                empleado.finiquito_fecha ?
                    ws.cell(HEADER_ROW + i1, 13).date(empleado.finiquito_fecha).style(dateStyle):
                    ws.cell(HEADER_ROW + i1, 13).string('').style(bodyStyle)
                
                ws.cell(HEADER_ROW + i1, 14).string(empleado.finiquito_causa).style(bodyStyle)
                ws.cell(HEADER_ROW + i1, 15).string(empleado.prevision).style(bodyStyle)
                ws.cell(HEADER_ROW + i1, 16).string(empleado.salud).style(bodyStyle)
                
                i1++;
                
            }
            
            else
            {
                ws2.cell(r2 + i2, 1).number(i2).style(borderStyle)
                ws2.cell(r2 + i2, 2).string(empleado.nombre).style(bodyStyle);
                ws2.cell(r2 + i2, 3).string(empleado.rut).style(bodyStyle)
                ws2.cell(r2 + i2, 4).string(empleado.cargo).style(bodyStyle)
                ws2.cell(r2 + i2, 5).number(empleado.sueldo_base).style(bodyStyle).style(bodyStyle)
                
                empleado.fecha_ingreso ?
                    ws2.cell(r2 + i2, 6).date(empleado.fecha_ingreso).style(dateStyle):
                    ws2.cell(r2 + i2, 6).string('').style(bodyStyle)
                
                ws2.cell(r2 + i2, 7).number(empleado.sueldo_diario).style(bodyStyle)
                ws2.cell(r2 + i2, 8).number(empleado.DT).style(borderStyle)
                ws2.cell(r2 + i2, 9).number(empleado.sueldo_mensual).style(bodyStyle)
                ws2.cell(r2 + i2, 10).number(empleado.liquido).style(bodyStyle)
                ws2.cell(r2 + i2, 11).number(empleado.saldo).style(bodyStyle)
                
                ws2.cell(r2 + i2, 12).string('').style(bodyStyle)
                
                empleado.finiquito_fecha ?
                    ws2.cell(r2 + i2, 13).date(empleado.finiquito_fecha).style(dateStyle):
                    ws2.cell(r2 + i2, 13).string('').style(bodyStyle)
                
                ws2.cell(r2 + i2, 14).string(empleado.finiquito_causa).style(bodyStyle)
                ws2.cell(r2 + i2, 15).string(empleado.prevision).style(bodyStyle)
                ws2.cell(r2 + i2, 16).string(empleado.salud).style(bodyStyle)
                
                i2++;
            }
            
            
            
        })
        
        wb.write('Previred.xlsx', res);
        
    });
    
}











/* ===================================================== */
//            ____  _____  _____ _____ _____  ______ _____  
//      /\   |  _ \|  __ \|_   _/ ____|  __ \|  ____|  __ \ 
//     /  \  | |_) | |__) | | || |  __| |  | | |__  | |  | |
//    / /\ \ |  _ <|  _  /  | || | |_ | |  | |  __| | |  | |
//   / ____ \| |_) | | \ \ _| || |__| | |__| | |____| |__| |
//  /_/    \_\____/|_|  \_\_____\_____|_____/|______|_____/ 
/* ===================================================== */

  exports.fooAbridged = (req,res,next) => {



      const year  = req.params.year;
      const month = req.params.month;
      
    const SQL = `CALL previred_resumen(build_date(${year},${month}))`
    
    var xl = require('excel4node');
    var wb = new xl.Workbook();
    var ws = wb.addWorksheet('Con Contrato');
    let ws2 = wb.addWorksheet('A Honorarios')
  
  
    ws.column(1).setWidth(4);
    ws.column(2).setWidth(20);
    ws.column(3).setWidth(5);
    ws.column(4).setWidth(16);
    ws.column(5).setWidth(16);
    ws.column(6).setWidth(16);
    ws.column(7).setWidth(16);
    ws.column(8).setWidth(16);
    ws.column(9).setWidth(16);

  
  
    ws2.column(1).setWidth(4);
    ws2.column(2).setWidth(20);
    ws2.column(3).setWidth(5);
    ws2.column(4).setWidth(16);
    ws2.column(5).setWidth(16);
    ws2.column(6).setWidth(16);
    ws2.column(7).setWidth(16);
    ws2.column(8).setWidth(16);
    ws2.column(9).setWidth(16);

  
  
  
  
  
    var bodyStyle = wb.createStyle({
      border: {
        left: {style: 'thin', color: 'black',},
        top: {style: 'thin', color: 'black',},
        bottom: {style: 'thin', color: 'black',},
        right: {style: 'thin', color: 'black',},
        outline: false
      },
  
      // 
      numberFormat: '$##,#; -$##,#; -',
  
    });
  

  
    var headerStyle = wb.createStyle({
  
      border: {
        left: {style: 'thin', color: 'black',},
        top: {style: 'thin', color: 'black',},
        bottom: {style: 'thin', color: 'black',},
        right: {style: 'thin', color: 'black',},
        outline: false
      },

      font: {
        bold: true,
        color: '000000',
      },
  
      fill:{
        type: 'pattern',
        patternType: 'solid',
        fgColor: 'cae6ff',
      },
    });
  
  
    var periodStyle = wb.createStyle({
  
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
        fgColor: '92c7f7',
      },
    });

    let blueColor = wb.createStyle({
      fill:{
        type: 'pattern',
        patternType: 'solid',
        fgColor: '#333333',
      },
    })

    let yellowColor = wb.createStyle({

      fill:{
        type: 'pattern',
        patternType: 'solid',
        fgColor: '#e4cf00',
      },
    });


    let borderStyle = wb.createStyle({
  
      border: {
        left: {style: 'thin', color: 'black',},
        top: {style: 'thin', color: 'black',},
        bottom: {style: 'thin', color: 'black',},
        right: {style: 'thin', color: 'black',},
        outline: false
      },
    })
  
  
    var titleStyle = wb.createStyle({
      font: {
        bold: true, size: 13,
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
        from: {col: 2,colOff: 1,row: 1,rowOff: 0,},
        to:   {col: 3,colOff: 1,row: 4,rowOff: 0,},
      },
    });


    ws.cell(5,2,6,5,true).string(`Resumen Trabajadores con Contrato`).style(titleStyle)
    ws.cell(7,2,7,5,true).string(`Periodo: ${mes[month]} ${year}`).style(periodStyle)



  

  
    //////////////////////////////////////////
  



    ws2.addImage({
      path: './eqc.png',
      type: 'picture',
      position: {
        type: 'twoCellAnchor',
        from: {col: 2,colOff: 1,row: 1,rowOff: 0,},
        to:   {col: 3,colOff: 1,row: 4,rowOff: 0,},
      },
    });


    ws2.cell(5,2,6,5,true).string(`Resumen Trabajadores a Honorarios`).style(titleStyle)
    ws2.cell(7,2,7,5,true).string(`Periodo: ${mes[month]} ${year}`).style(periodStyle)

    


  
  
  
    //////////////////////////////////////////
  
    let X = 10;

    // Headers

    ws.cell(X,1).string('ID').style(headerStyle)
    ws.cell(X,2).string('Nombre').style(headerStyle)
    ws.cell(X,3).string('DT').style(headerStyle)
    ws.cell(X,4).string('Sueldo Pactado').style(headerStyle)
    ws.cell(X,5).string('Bonos').style(headerStyle)
    ws.cell(X,6).string('Descuentos').style(headerStyle)
    ws.cell(X,7).string('Sueldo Líquido').style(headerStyle)
    ws.cell(X,8).string('Anticipos').style(headerStyle)
    ws.cell(X,9).string('Saldo').style(headerStyle)

  
  
    ws2.cell(X,1).string('ID').style(headerStyle)
    ws2.cell(X,2).string('Nombre').style(headerStyle)
    ws2.cell(X,3).string('DT').style(headerStyle)
    ws2.cell(X,4).string('Sueldo Pactado').style(headerStyle)
    ws2.cell(X,5).string('Bonos').style(headerStyle)
    ws2.cell(X,6).string('Descuentos').style(headerStyle)
    ws2.cell(X,7).string('Sueldo Líquido').style(headerStyle)
    ws2.cell(X,8).string('Anticipos').style(headerStyle)
    ws2.cell(X,9).string('Saldo').style(headerStyle)


    X++;
  
  
    let i1=0;
    let i2=0;
    
  
    /* This query returns the previred table  */
    conn.query(SQL, function (err, data, fields) {
      if(err) return next(new AppError(err))


      
        data[0].forEach((empleado,i)=>{
            
            
            // PREVIRED.empleado_id,
            // PREVIRED.nombre,
            // PREVIRED.rut,
            // PREVIRED.DT,
            // PREVIRED.sueldo_mensual,
            // PREVIRED.liquido,
            // PREVIRED.saldo,
            // PREVIRED.total_bonos,
            // PREVIRED.total_descuentos,
            // PREVIRED.total_anticipos,
            // PREVIRED.formal
            
            if(empleado.formal)
            {
                
                ws.cell(X + i1, 1).number(empleado.empleado_id).style(borderStyle);
                ws.cell(X + i1, 2).string(empleado.nombre).style(bodyStyle);
                ws.cell(X + i1, 3).number(empleado.DT).style(borderStyle);
                ws.cell(X + i1, 4).number(empleado.sueldo_mensual).style(bodyStyle);
                ws.cell(X + i1, 5).number(empleado.total_bonos).style(bodyStyle)
                ws.cell(X + i1, 6).number(empleado.total_descuentos).style(bodyStyle)
                ws.cell(X + i1, 7).number(empleado.liquido).style(bodyStyle)
                ws.cell(X + i1, 8).number(empleado.total_anticipos).style(bodyStyle)
                ws.cell(X + i1, 9).number(empleado.saldo).style(bodyStyle)
                
                i1++;
            }
            
            
            
            else
            {
                
                ws2.cell(X + i2, 1).number(empleado.empleado_id).style(borderStyle);
                ws2.cell(X + i2, 2).string(empleado.nombre).style(bodyStyle);
                ws2.cell(X + i2, 3).number(empleado.DT).style(borderStyle);
                ws2.cell(X + i2, 4).number(empleado.sueldo_mensual).style(bodyStyle);
                ws2.cell(X + i2, 5).number(empleado.total_bonos).style(bodyStyle)
                ws2.cell(X + i2, 6).number(empleado.total_descuentos).style(bodyStyle)
                ws2.cell(X + i2, 7).number(empleado.liquido).style(bodyStyle)
                ws2.cell(X + i2, 8).number(empleado.total_anticipos).style(bodyStyle)
                ws2.cell(X + i2, 9).number(empleado.saldo).style(bodyStyle)
                
                i2++;
                
            }
            
            
            
        })
        
        if(i1 > 1){
            
            ws.cell(X + i1, 4).formula(`SUM(${alphaIndex[4]}${X}:${alphaIndex[4]}${X+i1-1})`).style(bodyStyle).style(yellowColor);
            ws.cell(X + i1, 5).formula(`SUM(${alphaIndex[5]}${X}:${alphaIndex[5]}${X+i1-1})`).style(bodyStyle).style(yellowColor);
            ws.cell(X + i1, 6).formula(`SUM(${alphaIndex[6]}${X}:${alphaIndex[6]}${X+i1-1})`).style(bodyStyle).style(yellowColor);
            ws.cell(X + i1, 7).formula(`SUM(${alphaIndex[7]}${X}:${alphaIndex[7]}${X+i1-1})`).style(bodyStyle).style(yellowColor);
            ws.cell(X + i1, 8).formula(`SUM(${alphaIndex[8]}${X}:${alphaIndex[8]}${X+i1-1})`).style(bodyStyle).style(yellowColor);
            ws.cell(X + i1, 9).formula(`SUM(${alphaIndex[9]}${X}:${alphaIndex[9]}${X+i1-1})`).style(bodyStyle).style(yellowColor);
        }
        
        if(i2 > 1){
            
            ws2.cell(X + i2, 4).formula(`SUM(${alphaIndex[4]}${X}:${alphaIndex[4]}${X+i2-1})`).style(bodyStyle).style(yellowColor);
            ws2.cell(X + i2, 5).formula(`SUM(${alphaIndex[5]}${X}:${alphaIndex[5]}${X+i2-1})`).style(bodyStyle).style(yellowColor);
            ws2.cell(X + i2, 6).formula(`SUM(${alphaIndex[6]}${X}:${alphaIndex[6]}${X+i2-1})`).style(bodyStyle).style(yellowColor);
            ws2.cell(X + i2, 7).formula(`SUM(${alphaIndex[7]}${X}:${alphaIndex[7]}${X+i2-1})`).style(bodyStyle).style(yellowColor);
            ws2.cell(X + i2, 8).formula(`SUM(${alphaIndex[8]}${X}:${alphaIndex[8]}${X+i2-1})`).style(bodyStyle).style(yellowColor);
            ws2.cell(X + i2, 9).formula(`SUM(${alphaIndex[9]}${X}:${alphaIndex[9]}${X+i2-1})`).style(bodyStyle).style(yellowColor);
            
            
        }
        
        
        wb.write('Previred.xlsx', res);
        
    });
      
  }



