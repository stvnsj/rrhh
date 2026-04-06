
const conn = require("./db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");
const sqlMonth = require("../utils/sqlMonth");
const stringToDate = require("../utils/date")

const red  = 'ff3838'
const yel  = 'ffed38'
const blu  = '3892ff'
const grn  = '40ad31'

const LAST = 16;

const categoria = {
    
    1: "ALIMENTACION",
    2: "ALOJAMIENTO",
    3: "COMBUSTIBLE",
    4: "EPP",
    5: "CAMIONETAS",
    6: "FERRETERIA",
    7: "EQUIPOS",
    8: "PEAJ/ESTAC/PAS",
    9: "OTROS",
    10: "PERSONAL",
}

const mes = {
    
    1: 'Enero',
    2: 'Febrero',
    3: 'Marzo',
    4: 'Abril',
    5: 'Mayo',
    6: 'Junio',
    7: 'Julio',
    8: 'Agosto',
    9: 'Septiembre',
    10: 'Octubre',
    11: 'Noviembre',
    12: 'Diciembre',
}

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








/*========================================================

  This module exports the previred excel file.

  =======================================================*/

  exports.facturaExport = (req, res, next) => {



    const year = req.params.year;
    const inicio = year + '-01-01';
  
  
    const SQL = `
  
  
      -- =============================================================
      -- data[0]
      -- Proyectos in this summary
      -- =============================================================

      WITH proyectos_anual AS (
        SELECT DISTINCT 
        IFNULL(proyecto_id,0)  AS proyecto_id
        FROM facturas AS F
        WHERE  F.fecha  >=  '${inicio}'
        AND    F.fecha  <   DATE_ADD('${inicio}', INTERVAL 1 YEAR)
      )

      SELECT
      proyectos_anual.proyecto_id                                   AS proyecto_id, 
      IFNULL(P.nombre,'Sin Proyecto')                               AS proyecto_nombre,
      ROW_NUMBER() OVER (ORDER BY proyectos_anual.proyecto_id)      AS proyecto_index
      FROM proyectos_anual LEFT JOIN proyectos AS P
      ON proyectos_anual.proyecto_id = P.id;


  
      -- ===============================================================
      -- data[1]
      -- Factura expenses from selected year, grouped
      -- into Categoria, Proyecto and Month
      -- ===============================================================
  
      WITH recursive months AS (

        SELECT 1 as month_index UNION ALL 
        SELECT (month_index + 1) from months WHERE month_index < 12
      ), 
          
      proyectos_anual AS (
        SELECT DISTINCT 
        proyecto_id
        FROM facturas AS F
        WHERE  F.fecha  >=  '${inicio}'
        AND    F.fecha  <   DATE_ADD('${inicio}', INTERVAL 1 YEAR)
      ),
          
      facturas_anual AS (

        SELECT 

        M.month_index                        AS month_index,
        C.id                                 AS categoria_id,
        F.valor                              AS valor,
        P.proyecto_id                        AS proyecto_id
        FROM months             AS M
        JOIN categorias         AS C
        JOIN proyectos_anual    AS P
        LEFT JOIN facturas      AS F

        ON  M.month_index   =   MONTH(F.fecha)
        AND C.id            =   F.categoria_id
        AND F.fecha         >=  '${inicio}'
        AND F.fecha         <   DATE_ADD('${inicio}', INTERVAL 1 YEAR)
        AND (P.proyecto_id=F.proyecto_id  OR  (P.proyecto_id IS NULL AND F.proyecto_id IS NULL))
      )




      SELECT 

      IF(valor,SUM(valor),0)                  AS total,
      categoria_id                            AS categoria_id,
      month_index                             AS month_index,
      IFNULL(proyecto_id,0)                   AS proyecto_id

      FROM facturas_anual

      GROUP BY categoria_id,month_index,proyecto_id;






    -- ===============================================================
    -- data[3]
    -- Factura expenses from selected year, grouped
    -- into Month, Proyecto
    -- ===============================================================
          
      
  
      WITH recursive months AS (

        SELECT 1 as month_index UNION ALL 
        SELECT (month_index + 1) from months WHERE month_index < 12
      ),


      proyectos_anual AS (
        SELECT DISTINCT 
        proyecto_id
        FROM facturas AS F
        WHERE  F.fecha  >=  '${inicio}'
        AND    F.fecha  <   DATE_ADD('${inicio}', INTERVAL 1 YEAR)
      ),
        
      facturas_anual AS (

        SELECT 

        M.month_index                        AS month_index,
        F.valor                              AS valor,
        P.proyecto_id                        AS proyecto_id
        
    


        FROM months                          AS M
        JOIN proyectos_anual                 AS P
        LEFT JOIN facturas                   AS F
        ON  M.month_index   =   MONTH(F.fecha)
        AND F.fecha         >=  '${inicio}'
        AND F.fecha         <   DATE_ADD('${inicio}', INTERVAL 1 YEAR)
        AND (P.proyecto_id=F.proyecto_id  OR  (P.proyecto_id IS NULL AND F.proyecto_id IS NULL))
      )

      SELECT 

      IF(valor,SUM(valor),0)                         AS total,
      month_index                                    AS month_index,
      IFNULL(proyecto_id,0)                          AS proyecto_id,
      IFNULL(P.nombre,'Sin Proyectos')               AS proyecto_nombre

      FROM facturas_anual
      LEFT JOIN proyectos AS P
      ON P.id = facturas_anual.proyecto_id

      GROUP BY month_index,facturas_anual.proyecto_id;
    `
  
  
    var xl = require('excel4node');
    var wb = new xl.Workbook();
  
  
  
  
    var bodyStyle = wb.createStyle({
      border: {
        left: { style: 'thin', color: 'black', },
        top: { style: 'thin', color: 'black', },
        bottom: { style: 'thin', color: 'black', },
        right: { style: 'thin', color: 'black', },
        outline: false
      },
  
      // 
      numberFormat: '$##,#; -$##,#; ',
  
    });
  
  
    
  
  
    var proyectoStyle = wb.createStyle({
      border: {
        left: { style: 'thin', color: 'black', },
        top: { style: 'thin', color: 'black', },
        bottom: { style: 'thin', color: 'black', },
        right: { style: 'thin', color: 'black', },
        outline: false
      },
  
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: yel,
      },
  
    });
  
    var monthStyle = wb.createStyle({
      border: {
        left: { style: 'thin', color: 'black', },
        top: { style: 'thin', color: 'black', },
        bottom: { style: 'thin', color: 'black', },
        right: { style: 'thin', color: 'black', },
        outline: false
      },
  
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: red,
      },
  
    });
  

    var sumStyle = wb.createStyle({
      border: {
        left: { style: 'thin', color: 'black', },
        top: { style: 'thin', color: 'black', },
        bottom: { style: 'thin', color: 'black', },
        right: { style: 'thin', color: 'black', },
        outline: false
      },
  
      numberFormat: '$##,#; -$##,#; ',
  
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: blu,
      },
    });

    var totalStyle = wb.createStyle({
      border: {
        left: { style: 'thin', color: 'black', },
        top: { style: 'thin', color: 'black', },
        bottom: { style: 'thin', color: 'black', },
        right: { style: 'thin', color: 'black', },
        outline: false
      },
  
      numberFormat: '$##,#; -$##,#; ',
  
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: grn,
      },
    });
  
  
  
  
  
    var titleStyle = wb.createStyle({
      font: {
        bold: true, size: 13,
      },
      alignment: {
        wrapText: true,
        horizontal: 'center',
        vertical: 'center',
      },
      border: {
        left: { style: 'medium', color: 'black', },
        top: { style: 'medium', color: 'black', },
        bottom: { style: 'medium', color: 'black', },
        right: { style: 'medium', color: 'black', },
        outline: false
      }
    });
  
    
    
    
    
    
    // Total Sheet
    ts = wb.addWorksheet(`Resumen ${year}`);

      
    const Y_OFFSET = 8;
    const X_OFFSET = 1;


    ts.addImage({
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


    ts.cell(5,2,6,5,true).string(`Resumen Facturas ${year}`).style(titleStyle)








  

  
    let sheets = [];
  
  
    /* This query returns the previred table  */
    conn.query(SQL, function (err, data, fields) {
      if (err) return next(new AppError(err))






        
        
        const PROYECTOS = data[0];
        
        
        for(let m = 1; m <= 12; m++){
            
            // Name of the month is inserted at the start of each row.
            ts.cell(m+Y_OFFSET, X_OFFSET).string(mes[m]).style(monthStyle)
            
            // At the end of proyecto names, is inserted the world "TOTAL".
            ts.cell(Y_OFFSET, X_OFFSET+1+PROYECTOS.length).string('TOTAL').style(proyectoStyle)
            
            if(PROYECTOS.length){
                
                
                ts.cell(m+Y_OFFSET, X_OFFSET+1+PROYECTOS.length).formula(
                    `SUM(${alphaIndex[X_OFFSET+1]}${m+Y_OFFSET}:${alphaIndex[X_OFFSET+PROYECTOS.length]}${m+Y_OFFSET})`
                ).style(sumStyle);
                
                if(m===12){
                    ts.cell(m+1+Y_OFFSET, X_OFFSET+1+PROYECTOS.length).formula(
                        `SUM(${alphaIndex[X_OFFSET+1]}${m+1+Y_OFFSET}:${alphaIndex[X_OFFSET+PROYECTOS.length]}${m+1+Y_OFFSET})`
                    ).style(totalStyle);
                }
            }
        }
        
        
        
        // 
        for(let proyecto_index = 1; proyecto_index <= PROYECTOS.length; proyecto_index++){
            
            
            
            ts.cell(13+Y_OFFSET, proyecto_index+X_OFFSET)
                .formula(`SUM(${alphaIndex[proyecto_index+X_OFFSET]}${1+Y_OFFSET}:${alphaIndex[proyecto_index+X_OFFSET]}${12+Y_OFFSET})`)
                .style(sumStyle)
            
            
      }
  

        
        
        data[2].forEach(boleta => {
            
            const p = PROYECTOS.find(p => p.proyecto_id === boleta.proyecto_id);
            const p_nombre = p.proyecto_nombre;
            const p_index  = p.proyecto_index;
            
            
            ts
                .cell(Y_OFFSET,p_index+X_OFFSET)
                .string(p_nombre)
                .style(proyectoStyle);
            
            // Month Total
            ts
                .cell(boleta.month_index+Y_OFFSET, p_index +X_OFFSET)
                .number(boleta.total)
                .style(bodyStyle);
            
        })
      
        /*===========================    
         *     
         *         PROYECTOS   
         *     
         *============================*/
        
        data[0].forEach(proyecto => {
            
            // workdsheet creation
            sheets[proyecto.proyecto_id] = wb.addWorksheet(`${proyecto.proyecto_nombre}`)
            
            sheets[proyecto.proyecto_id].addImage({
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
            
            
            sheets[proyecto.proyecto_id].cell(5,2,6,5,true).string(`Facturas ${proyecto.proyecto_nombre} ${year}`).style(titleStyle)
            
            
            
            
            // Category names
            for(let cat = 1; cat <= 10; cat++){
                sheets[proyecto.proyecto_id]
                    .cell(Y_OFFSET,cat+X_OFFSET)
                    .string(categoria[cat])
                    .style(proyectoStyle)
            }
            
            // Total column            
            sheets[proyecto.proyecto_id]
                .cell(Y_OFFSET,10+1+X_OFFSET)
                .string('TOTAL')
                .style(proyectoStyle)
            
            
            
            // Month headers
            for(let m = 1; m <= 12; m++){
                
                sheets[proyecto.proyecto_id]
                    .cell(m+Y_OFFSET,X_OFFSET)
                    .string(mes[m])
                    .style(monthStyle)
            }
            
            
        })
        
        
        
        data[0].forEach(proyecto => {

            const alpha1 = alphaIndex[1+X_OFFSET]
            const alpha2 = alphaIndex[10+X_OFFSET]
            
            // Month SUM 
            for(let mes = 1; mes <= 12 ; mes++){

                const num = mes + Y_OFFSET;
                
                sheets[proyecto.proyecto_id]
                    .cell(mes + Y_OFFSET, 11 + X_OFFSET)
                    .formula(
                        
                        `SUM( ${alpha1}${num} : ${alpha2}${num} )`
                        
                    )
                    .style(sumStyle)
                
                
                if(mes===12){
                    

                    
                    sheets[proyecto.proyecto_id]
                        .cell(mes + 1 + Y_OFFSET, 11 + X_OFFSET)
                        .formula(
                            
                            `SUM( ${alpha1}${num+1} : ${alpha2}${num+1} )`
                            
                        )
                        .style(totalStyle)
                    
                }
                
        }
            
            
            // Categoria SUM
            for(let cat=1; cat<=10 ; cat++){

                const alpha = alphaIndex[cat+X_OFFSET]; // Category
                const num1  = 1+Y_OFFSET;  // First month
                const num2  = 12+Y_OFFSET; // Last month
                
                
                sheets[proyecto.proyecto_id]
                    .cell(13+Y_OFFSET, cat + X_OFFSET)
                    .formula(`SUM(${alpha}${num1}:${alpha}${num2})`)
                    .style(sumStyle)
            }
            
        })
        
        
        
        data[1].forEach(boleta =>
            
            sheets[boleta.proyecto_id]
                .cell(boleta.month_index+Y_OFFSET, boleta.categoria_id+X_OFFSET)
                .number(boleta.total)
                .style(bodyStyle)
        )
        
        
        wb.write('Previred.xlsx', res);
        
    });
  }




///////////////    ////////////////     ////////////////
////      ///////////////    ////////////////     //////
///////////////    ////////////////     ////////////////
////     ///////////////    ////////////////     ///////
///////////////    ////////////////     ////////////////

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


exports.facturaDetail = (req,res,next) => {

    



    const fecha1 = req.params.date1
    const fecha2 = req.params.date2
    
    
  // option = {proyecto, categoria}
  const option  = req.params.option;


  const SQL = `


    SELECT distinct
    B.proyecto_id            AS proyecto_id,
    P.nombre                 AS proyecto_nombre
    FROM facturas B INNER JOIN proyectos P
    ON    B.fecha >= string_to_date('${fecha1}')
    AND   B.fecha <= string_to_date('${fecha2}')
    AND   B.proyecto_id = P.id
    ;


    SELECT 
    *,
    P.nombre                    AS proyecto_nombre,
    C.categoria                 AS categoria_nombre
    FROM facturas B LEFT JOIN proyectos P
    ON B.proyecto_id = P.id
    INNER JOIN categorias C
    ON B.categoria_id = C.id

    WHERE B.fecha >= string_to_date('${fecha1}')
    AND   B.fecha <= string_to_date('${fecha2}')
    
    ;


  `

    console.log(SQL)

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

  const rutWidth = 15;
  const folioWidth = 15;
  const fechaWidth = 15;
  const valorWidth = 15;
  const nombreWidth = 15;
  const categoriaWidth = 15;
  const proyectoWidth  = 15;





  //This query returns the previred table  
  conn.query(SQL, function (err, data, fields) {

    if(err) return next(new AppError(err));
    if(data[0].length === 0)  {wb.write('Transferencias.xlsx', res);return;}
    if(data[1].length === 0)  {wb.write('Transferencias.xlsx', res);return;}



    ///////////////////////////////////////
    //
    //           PROYECTOS
    //
    ///////////////////////////////////////
    if(option === "proyecto"){

      let sheets = {};
      let proyectoRow = {};


      data[0].forEach(proyecto => {

        if(proyecto.proyecto_id == null) return;


        proyectoRow[proyecto.proyecto_id] = 1;

        sheets[proyecto.proyecto_id] = wb.addWorksheet(proyecto.proyecto_nombre);

        sheetTitle(
          sheets[proyecto.proyecto_id],
          `Facturas Proyecto ${proyecto.proyecto_nombre}\n${fecha1} - ${fecha2}`, 
          titleStyle
        );

        sheets[proyecto.proyecto_id].cell(HEADER_ROW,1).string('Rut').style(yellowStyle);
        sheets[proyecto.proyecto_id].cell(HEADER_ROW,2).string('Folio').style(yellowStyle);
        sheets[proyecto.proyecto_id].cell(HEADER_ROW,3).string('Fecha').style(yellowStyle);
        sheets[proyecto.proyecto_id].cell(HEADER_ROW,4).string('Valor').style(yellowStyle);
        sheets[proyecto.proyecto_id].cell(HEADER_ROW,5).string('Razón Social').style(yellowStyle);
        sheets[proyecto.proyecto_id].cell(HEADER_ROW,6).string('Categoria').style(yellowStyle);
        sheets[proyecto.proyecto_id].cell(HEADER_ROW,7).string('Proyecto').style(yellowStyle);

        sheets[proyecto.proyecto_id].column(1).setWidth(rutWidth);
        sheets[proyecto.proyecto_id].column(2).setWidth(folioWidth);
        sheets[proyecto.proyecto_id].column(3).setWidth(fechaWidth);
        sheets[proyecto.proyecto_id].column(4).setWidth(valorWidth);
        sheets[proyecto.proyecto_id].column(5).setWidth(nombreWidth);
        sheets[proyecto.proyecto_id].column(6).setWidth(categoriaWidth);
        sheets[proyecto.proyecto_id].column(7).setWidth(proyectoWidth);

      })

      data[1].forEach( boleta => {


        if(boleta.proyecto_id == null) return;


        sheets[boleta.proyecto_id]?.cell(HEADER_ROW + proyectoRow[boleta.proyecto_id], 1).string(boleta?.rut).style(textStyle).style(lightGreyStyle);
        sheets[boleta.proyecto_id]?.cell(HEADER_ROW + proyectoRow[boleta.proyecto_id], 2).string(boleta?.folio).style(textStyle);
        sheets[boleta.proyecto_id]?.cell(HEADER_ROW + proyectoRow[boleta.proyecto_id], 3).date(boleta?.fecha).style(dateStyle).style(lightGreyStyle);
        sheets[boleta.proyecto_id]?.cell(HEADER_ROW + proyectoRow[boleta.proyecto_id], 4).number(boleta?.valor).style(moneyStyle);
        sheets[boleta.proyecto_id]?.cell(HEADER_ROW + proyectoRow[boleta.proyecto_id], 5).string(boleta?.razon_social).style(textStyle).style(lightGreyStyle);
        sheets[boleta.proyecto_id]?.cell(HEADER_ROW + proyectoRow[boleta.proyecto_id], 6).string(boleta?.categoria_nombre).style(textStyle);
        sheets[boleta.proyecto_id]?.cell(HEADER_ROW + proyectoRow[boleta.proyecto_id], 7).string(boleta?.proyecto_nombre).style(textStyle).style(lightGreyStyle);

        proyectoRow[boleta.proyecto_id]++;

      })

    }




    ///////////////////////////////////////
    //
    //           CATEGORIAS
    //
    ///////////////////////////////////////

      
      if(option === "categoria"){
          
          let categoriaRow = {
              
              1:1,
              2:1,
              3:1,
              4:1,
              5:1,
              6:1,
              7:1,
              8:1,
              9:1,
              10:1,
              
          };
          
          let sheets = {
              
              1 : wb.addWorksheet("ALIMENTACION"),
              2 : wb.addWorksheet("ALOJAMIENTO"),
              3 : wb.addWorksheet("COMBUSTIBLE"),
              4 : wb.addWorksheet("EPP"),
              5 : wb.addWorksheet("CAMIONETAS"),
              6 : wb.addWorksheet("FERRETERIA"),
              7 : wb.addWorksheet("EQUIPOS"),
              8 : wb.addWorksheet("PEAJE ESTACIONAMIENTO PASAJES"),
              9 : wb.addWorksheet("OTROS"),
              10 : wb.addWorksheet("PERSONAL"),
              
          };
          
          for( let i = 1; i<=10; i++){
              
              sheetTitle(
                  sheets[i],
                  `Facturas Categoría ${categoria[i]}\n${fecha1} - ${fecha2}`, 
                  titleStyle
              );
              
              sheets[i].cell(HEADER_ROW,1).string('Rut').style(yellowStyle);
              sheets[i].cell(HEADER_ROW,2).string('Folio').style(yellowStyle);
              sheets[i].cell(HEADER_ROW,3).string('Fecha').style(yellowStyle);
              sheets[i].cell(HEADER_ROW,4).string('Valor').style(yellowStyle);
              sheets[i].cell(HEADER_ROW,5).string('Razón Social').style(yellowStyle);
              sheets[i].cell(HEADER_ROW,6).string('Categoria').style(yellowStyle);
              sheets[i].cell(HEADER_ROW,7).string('Proyecto').style(yellowStyle);
              
              sheets[i].column(1).setWidth(rutWidth);
              sheets[i].column(2).setWidth(folioWidth);
              sheets[i].column(3).setWidth(fechaWidth);
              sheets[i].column(4).setWidth(valorWidth);
              sheets[i].column(5).setWidth(nombreWidth);
              sheets[i].column(6).setWidth(categoriaWidth);
              sheets[i].column(7).setWidth(proyectoWidth);
          }
          
          data[1].forEach( boleta => {
              
              
              sheets[boleta.categoria_id]?.cell(HEADER_ROW + categoriaRow[boleta.categoria_id], 1)
                  .string(boleta?.rut)
                  .style(textStyle)
                  .style(lightGreyStyle);
              
              sheets[boleta.categoria_id]?.cell(HEADER_ROW + categoriaRow[boleta.categoria_id], 2)
                  .string(boleta?.folio)
                  .style(textStyle);
              
              sheets[boleta.categoria_id]?.cell(HEADER_ROW + categoriaRow[boleta.categoria_id], 3)
                  .date(boleta?.fecha)
                  .style(dateStyle)
                  .style(lightGreyStyle);
              
              sheets[boleta.categoria_id]?.cell(HEADER_ROW + categoriaRow[boleta.categoria_id], 4)
                  .number(boleta?.valor)
                  .style(moneyStyle);
              
              sheets[boleta.categoria_id]?.cell(HEADER_ROW + categoriaRow[boleta.categoria_id], 5)
                  .string(boleta?.razon_social)
                  .style(textStyle)
                  .style(lightGreyStyle);
              
              sheets[boleta.categoria_id]?.cell(HEADER_ROW + categoriaRow[boleta.categoria_id], 6)
                  .string(boleta?.categoria_nombre)
                  .style(textStyle);
              
              sheets[boleta.categoria_id]?.cell(HEADER_ROW + categoriaRow[boleta.categoria_id], 7)
                  .string(boleta?.proyecto_nombre)
                  .style(textStyle)
                  .style(lightGreyStyle);
              
              categoriaRow[boleta.categoria_id]++;
              
          })
          
      }
      


    ///////////////////////////////////////
    //
    //           LISTA COMPLETA
    //
    ///////////////////////////////////////
    if(option === "full"){

      ws = wb.addWorksheet("Facturas")

      sheetTitle(
        ws,
        `Facturas\n${fecha1} - ${fecha2}`, 
        titleStyle
      );

      ws.cell(HEADER_ROW,1).string('Rut').style(yellowStyle);
      ws.cell(HEADER_ROW,2).string('Folio').style(yellowStyle);
      ws.cell(HEADER_ROW,3).string('Fecha').style(yellowStyle);
      ws.cell(HEADER_ROW,4).string('Valor').style(yellowStyle);
      ws.cell(HEADER_ROW,5).string('Razón Social').style(yellowStyle);
      ws.cell(HEADER_ROW,6).string('Categoria').style(yellowStyle);
      ws.cell(HEADER_ROW,7).string('Proyecto').style(yellowStyle);

      ws.column(1).setWidth(rutWidth);
      ws.column(2).setWidth(folioWidth);
      ws.column(3).setWidth(fechaWidth);
      ws.column(4).setWidth(valorWidth);
      ws.column(5).setWidth(nombreWidth);
      ws.column(6).setWidth(categoriaWidth);
      ws.column(7).setWidth(proyectoWidth);


      data[1].forEach( (boleta,i) => {


        ws?.cell(HEADER_ROW + 1 + i, 1).string(boleta?.rut).style(textStyle).style(lightGreyStyle);
        ws?.cell(HEADER_ROW + 1 + i, 2).string(boleta?.folio).style(textStyle);
        ws?.cell(HEADER_ROW + 1 + i, 3).date(boleta?.fecha).style(dateStyle).style(lightGreyStyle);
        ws?.cell(HEADER_ROW + 1 + i, 4).number(boleta?.valor).style(moneyStyle);
        ws?.cell(HEADER_ROW + 1 + i, 5).string(boleta?.razon_social).style(textStyle).style(lightGreyStyle);
        ws?.cell(HEADER_ROW + 1 + i, 6).string(boleta?.categoria_nombre).style(textStyle);
        ws?.cell(HEADER_ROW + 1 + i, 7).string(boleta?.proyecto_nombre).style(textStyle).style(lightGreyStyle);

      })

    }

    wb.write('Facturas.xlsx', res);

  });

}



  
  
