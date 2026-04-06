const conn = require("./db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");
const stringToDate = require("../utils/date");
const xcel     = require('../utils/xcel')
const dflt     = require('../utils/dflt') 

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

const TIPO = {
    
    0:"BOLETA",
    1:"FACTURA",
    2:"TRANSFERENCIA"
}



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




exports.CostoFull = (date1, date2, option, res, next) => {


    const SQL = `


    SELECT DISTINCT

    B.proyecto_id            AS proyecto_id,
    P.nombre                 AS proyecto_nombre

    FROM (

      SELECT DISTINCT proyecto_id,fecha FROM boletas UNION
      SELECT DISTINCT proyecto_id,fecha FROM facturas UNION
      SELECT DISTINCT proyecto_id,fecha FROM transferencias

    ) AS B INNER JOIN proyectos P

    ON    B.fecha >= string_to_date('${date1}')
    AND   B.fecha <= string_to_date('${date2}')
    AND   B.proyecto_id = P.id
    ;



    WITH 

    Bol AS (

      SELECT
      rut,
      folio             AS serie,
      fecha,
      valor,
      razon_social      AS nombre_destinatario,
      categoria_id,
      proyecto_id,
      0                 AS tipo
      FROM boletas
      WHERE fecha >= string_to_date('${date1}')  
      AND  fecha  <= string_to_date('${date2}')

    ),

    Fac AS (

      SELECT
      rut,
      folio              AS serie,
      fecha,
      valor,
      razon_social       AS nombre_destinatario,
      categoria_id,
      proyecto_id,
      1                  AS tipo
      FROM facturas
      WHERE fecha >= string_to_date('${date1}') 
      AND  fecha  <= string_to_date('${date2}')  
    ),

    Trans AS (

      SELECT
      rut,
      codigo             AS serie,
      fecha,
      valor,
      nombre             AS nombre_destinatario,
      categoria_id,
      proyecto_id,
      2                  AS tipo
      FROM transferencias
      WHERE fecha >= string_to_date('${date1}') 
      AND  fecha  <= string_to_date('${date2}')  
    ),

    Doc AS (

      SELECT * FROM Bol   UNION ALL
      SELECT * FROM Fac   UNION ALL
      SELECT * FROM Trans 
    )


    SELECT 
    *,
    P.nombre                    AS proyecto_nombre,
    C.categoria                 AS categoria_nombre

    FROM Doc B LEFT JOIN proyectos P
    ON B.proyecto_id = P.id

    INNER JOIN categorias C
    ON B.categoria_id = C.id

    WHERE B.fecha >= string_to_date('${date1}')
    AND   B.fecha <= string_to_date('${date2}')

    ORDER BY proyecto_id
    ;
  `
    
    const excel         = new xcel.XcelFile("XXX");    
    let yellow          = excel.color_style("YELLOW")
    let light_yellow    = excel.color_style("LIGHT_YELLOW")
    let blue            = excel.color_style("BLUE")    
    let light_blue      = excel.color_style("LIGHT_BLUE")
    let gray1           = excel.color_style("gray1")
    let gray2           = excel.color_style("gray2")
    let border_s        = excel.border_style()
    let date_s          = excel.date_style()
    let money_s         = excel.money_style()
    let bold_s          = excel.bold_style()

    const hr = 10;
    const rutWidth = 15;
    const folioWidth = 15;
    const fechaWidth = 15;
    const valorWidth = 15;
    const nombreWidth = 15;
    const categoriaWidth = 15;
    const proyectoWidth  = 15;
    const tipoWidth = 15

    conn.query(SQL, function (err, data, fields) {

	if(err) return next(new AppError(err));
	if(data[0].length === 0) {wb.write('Transferencias.xlsx', res);return;}
	if(data[1].length === 0)  {wb.write('Transferencias.xlsx', res);return;}


	// =============================
	//        PROYECTOS
	// =============================
	if(option === "proyecto"){

	    let sheets = {};
	    let proyectoRow = {};

	    data[0].forEach(proyecto => {

		proyectoRow[proyecto.proyecto_id] = 1;

		sheets[proyecto.proyecto_id] = excel.addWorksheet(
		    proyecto.proyecto_nombre,
		    `Costos Proyecto ${proyecto.proyecto_nombre}\n${date1}  ${date2}`
		);

		sheets[proyecto.proyecto_id].cell(hr,1).string('Rut').style(yellow).style(border_s);
		sheets[proyecto.proyecto_id].cell(hr,2).string('Folio').style(yellow).style(border_s);
		sheets[proyecto.proyecto_id].cell(hr,3).string('Fecha').style(yellow).style(border_s);
		sheets[proyecto.proyecto_id].cell(hr,4).string('Valor').style(yellow).style(border_s);
		sheets[proyecto.proyecto_id].cell(hr,5).string('Razón Social').style(yellow).style(border_s);
		sheets[proyecto.proyecto_id].cell(hr,6).string('Categoria').style(yellow).style(border_s);
		sheets[proyecto.proyecto_id].cell(hr,7).string('Proyecto').style(yellow).style(border_s);
		sheets[proyecto.proyecto_id].cell(hr,8).string('Tipo').style(yellow).style(border_s);


		sheets[proyecto.proyecto_id].column(1).setWidth(rutWidth);
		sheets[proyecto.proyecto_id].column(2).setWidth(folioWidth);
		sheets[proyecto.proyecto_id].column(3).setWidth(fechaWidth);
		sheets[proyecto.proyecto_id].column(4).setWidth(valorWidth);
		sheets[proyecto.proyecto_id].column(5).setWidth(nombreWidth);
		sheets[proyecto.proyecto_id].column(6).setWidth(categoriaWidth);
		sheets[proyecto.proyecto_id].column(7).setWidth(proyectoWidth);
		sheets[proyecto.proyecto_id].column(8).setWidth(tipoWidth);
		
	    })

	    data[1].forEach( boleta => {

		if(boleta.proyecto_id == null) return;

		sheets[boleta.proyecto_id]?.cell(hr + proyectoRow[boleta.proyecto_id], 1)
		    .string(boleta?.rut)
		    .style(gray1)
		    .style(border_s);
		
		sheets[boleta.proyecto_id]?.cell(hr + proyectoRow[boleta.proyecto_id], 2)
		    .string(boleta?.serie)
		    .style(gray2)
		    .style(border_s);
		
		sheets[boleta.proyecto_id]?.cell(hr + proyectoRow[boleta.proyecto_id], 3)
		    .date(boleta?.fecha)
		    .style(border_s)
		    .style(gray1)
		    .style(date_s);
		
		sheets[boleta.proyecto_id]?.cell(hr + proyectoRow[boleta.proyecto_id], 4)
		    .number(boleta?.valor)
		    .style(border_s)
		    .style(gray2)
		    .style(money_s);
		
		sheets[boleta.proyecto_id]?.cell(hr + proyectoRow[boleta.proyecto_id], 5)
		    .string(boleta?.nombre_destinatario)
		    .style(border_s)
		    .style(gray1);
		
		sheets[boleta.proyecto_id]?.cell(hr + proyectoRow[boleta.proyecto_id], 6)
		    .string(boleta?.categoria_nombre)
		    .style(border_s)
		    .style(gray2);
		
		sheets[boleta.proyecto_id]?.cell(hr + proyectoRow[boleta.proyecto_id], 7)
		    .string(boleta?.proyecto_nombre)
		    .style(border_s)
		    .style(gray1);
		
		sheets[boleta.proyecto_id]?.cell(hr + proyectoRow[boleta.proyecto_id], 8)
		    .string(TIPO[boleta.tipo])
		    .style(border_s)
		    .style(gray2);

		proyectoRow[boleta.proyecto_id]++;

	    })

	}




	// ============================
	//        CATEGORIAS
	// ============================
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

		1 : excel.addWorksheet("ALIMENTACION",`Costos Categoría ${categoria[1]}\n${date1}   ${date2}`),
		2 : excel.addWorksheet("ALOJAMIENTO",`Costos Categoría ${categoria[2]}\n${date1}   ${date2}`),
		3 : excel.addWorksheet("COMBUSTIBLE",`Costos Categoría ${categoria[3]}\n${date1}   ${date2}`),
		4 : excel.addWorksheet("EPP",`Costos Categoría ${categoria[4]}\n${date1}   ${date2}`),
		5 : excel.addWorksheet("CAMIONETAS",`Costos Categoría ${categoria[5]}\n${date1}   ${date2}`),
		6 : excel.addWorksheet("FERRETERIA",`Costos Categoría ${categoria[6]}\n${date1}   ${date2}`),
		7 : excel.addWorksheet("EQUIPOS",`Costos Categoría ${categoria[7]}\n${date1}   ${date2}`),
		8 : excel.addWorksheet("PEAJE ESTACIONAMIENTO PASAJES",`Costos Categoría ${categoria[8]}\n${date1}   ${date2}`),
		9 : excel.addWorksheet("OTROS",`Costos Categoría ${categoria[9]}\n${date1}   ${date2}`),
		10 : excel.addWorksheet("PERSONAL",`Costos Categoría ${categoria[10]}\n${date1}   ${date2}`),

            };

            for( let i = 1; i<=10; i++){

		sheets[i].cell(hr,1).string('Rut').style(yellow).style(border_s);
		sheets[i].cell(hr,2).string('Folio').style(yellow).style(border_s);
		sheets[i].cell(hr,3).string('Fecha').style(yellow).style(border_s);
		sheets[i].cell(hr,4).string('Valor').style(yellow).style(border_s);
		sheets[i].cell(hr,5).string('Razón Social').style(yellow).style(border_s);
		sheets[i].cell(hr,6).string('Categoria').style(yellow).style(border_s);
		sheets[i].cell(hr,7).string('Proyecto').style(yellow).style(border_s);
		sheets[i].cell(hr,8).string('Tipo').style(yellow).style(border_s);

		sheets[i].column(1).setWidth(rutWidth);
		sheets[i].column(2).setWidth(folioWidth);
		sheets[i].column(3).setWidth(fechaWidth);
		sheets[i].column(4).setWidth(valorWidth);
		sheets[i].column(5).setWidth(nombreWidth);
		sheets[i].column(6).setWidth(categoriaWidth);
		sheets[i].column(7).setWidth(proyectoWidth);
		sheets[i].column(8).setWidth(tipoWidth);
            }

	    data[1].forEach( boleta => {

		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 1)
		    .string(boleta?.rut)
		    .style(border_s)
		    .style(gray1);
		
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 2)
		    .string(boleta?.serie)
		    .style(border_s)
		    .style(gray2);
		
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 3)
		    .date(boleta?.fecha)
		    .style(date_s)
		    .style(border_s)
		    .style(gray1);
		
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 4)
		    .number(boleta?.valor)
		    .style(border_s)
		    .style(gray2)
		    .style(money_s);
		
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 5)
		    .string(boleta?.nombre_destinatario)
		    .style(gray1)
		    .style(border_s);
		
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 6)
		    .string(boleta?.categoria_nombre)
		    .style(border_s)
		    .style(gray2);
		
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 7)
		    .string(boleta?.proyecto_nombre)
		    .style(gray1)
		    .style(border_s);
		
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 8)
		    .string(TIPO[boleta.tipo])
		    .style(gray2)
		    .style(border_s);


		categoriaRow[boleta.categoria_id]++;

	    })

	}





	// ===========================
	//           TIPO
	// ===========================
	if(option === "tipo"){

	    let tipoRow = {

		0:1,
		1:1,
		2:1,

	    };

	    let sheets = {

		0 : excel.addWorksheet("BOLETAS",`Costos Tipo ${TIPO[0]}\n${date1}   ${date2}`),
		1 : excel.addWorksheet("FACTURAS",`Costos Tipo ${TIPO[1]}\n${date1}   ${date2}`),
		2 : excel.addWorksheet("TRANSFERENCIAS",`Costos Tipo ${TIPO[2]}\n${date1}   ${date2}`),

	    };

	    for( let i = 0; i<=2; i++){

		sheets[i].cell(hr,1).string('Rut').style(yellow).style(border_s);
		sheets[i].cell(hr,2).string('Folio').style(yellow).style(border_s);
		sheets[i].cell(hr,3).string('Fecha').style(yellow).style(border_s);
		sheets[i].cell(hr,4).string('Valor').style(yellow).style(border_s);
		sheets[i].cell(hr,5).string('Razón Social').style(yellow).style(border_s);
		sheets[i].cell(hr,6).string('Categoria').style(yellow).style(border_s);
		sheets[i].cell(hr,7).string('Proyecto').style(yellow).style(border_s);
		sheets[i].cell(hr,8).string('Tipo').style(yellow).style(border_s);

		sheets[i].column(1).setWidth(rutWidth);
		sheets[i].column(2).setWidth(folioWidth);
		sheets[i].column(3).setWidth(fechaWidth);
		sheets[i].column(4).setWidth(valorWidth);
		sheets[i].column(5).setWidth(nombreWidth);
		sheets[i].column(6).setWidth(categoriaWidth);
		sheets[i].column(7).setWidth(proyectoWidth);
		sheets[i].column(8).setWidth(tipoWidth);

	    }

	    data[1].forEach( boleta => {


		sheets[boleta.tipo]?.cell(hr + tipoRow[boleta.tipo], 1)
		    .string(boleta?.rut)
		    .style(gray1).style(border_s);
		
		sheets[boleta.tipo]?.cell(hr + tipoRow[boleta.tipo], 2)
		    .string(boleta?.serie)
		    .style(gray2).style(border_s);
		
		sheets[boleta.tipo]?.cell(hr + tipoRow[boleta.tipo], 3)
		    .date(boleta?.fecha)
		    .style(gray1).style(date_s).style(border_s);
		
		sheets[boleta.tipo]?.cell(hr + tipoRow[boleta.tipo], 4)
		    .number(boleta?.valor)
		    .style(border_s).style(money_s).style(gray2);
		
		sheets[boleta.tipo]?.cell(hr + tipoRow[boleta.tipo], 5)
		    .string(boleta?.nombre_destinatario)
		    .style(gray1).style(border_s);
		
		sheets[boleta.tipo]?.cell(hr + tipoRow[boleta.tipo], 6)
		    .string(boleta?.categoria_nombre)
		    .style(border_s).style(gray2);
		
		sheets[boleta.tipo]?.cell(hr + tipoRow[boleta.tipo], 7)
		    .string(boleta?.proyecto_nombre)
		    .style(border_s).style(gray1);
		
		sheets[boleta.tipo]?.cell(hr + tipoRow[boleta.tipo], 8)
		    .string(TIPO[boleta.tipo])
		    .style(gray2).style(border_s);


		tipoRow[boleta.tipo]++;

	    })
	}

	// ==========================
	//     LISTA COMPLETA
	// ==========================
	if(option === "full"){

	    sheet = excel.addWorksheet("Costos",`Costos\n${date1}   ${date2}`)

	    sheet.cell(hr,1).string('Rut').style(yellow).style(border_s);
	    sheet.cell(hr,2).string('Folio').style(yellow).style(border_s);
	    sheet.cell(hr,3).string('Fecha').style(yellow).style(border_s);
	    sheet.cell(hr,4).string('Valor').style(yellow).style(border_s);
	    sheet.cell(hr,5).string('Razón Social').style(yellow).style(border_s);
	    sheet.cell(hr,6).string('Categoria').style(yellow).style(border_s);
	    sheet.cell(hr,7).string('Proyecto').style(yellow).style(border_s);
	    sheet.cell(hr,8).string('Tipo').style(yellow).style(border_s);

	    sheet.column(1).setWidth(rutWidth);
	    sheet.column(2).setWidth(folioWidth);
	    sheet.column(3).setWidth(fechaWidth);
	    sheet.column(4).setWidth(valorWidth);
	    sheet.column(5).setWidth(nombreWidth);
	    sheet.column(6).setWidth(categoriaWidth);
	    sheet.column(7).setWidth(proyectoWidth);
	    sheet.column(8).setWidth(tipoWidth);

	    data[1].forEach( (boleta,i) => {

		sheet?.cell(hr + 1 + i, 1).string(boleta?.rut).style(border_s).style(gray1);
		sheet?.cell(hr + 1 + i, 2).string(boleta?.serie).style(border_s).style(gray2);
		sheet?.cell(hr + 1 + i, 3).date(boleta?.fecha).style(date_s).style(gray1).style(border_s);
		sheet?.cell(hr + 1 + i, 4).number(boleta?.valor).style(money_s).style(gray2).style(border_s);
		sheet?.cell(hr + 1 + i, 5).string(boleta?.nombre_destinatario).style(border_s).style(gray1);
		sheet?.cell(hr + 1 + i, 6).string(boleta?.categoria_nombre).style(gray2).style(border_s);
		sheet?.cell(hr + 1 + i, 7).string(boleta?.proyecto_nombre).style(gray1).style(border_s);
		sheet?.cell(hr + 1 + i, 8).string(TIPO[boleta.tipo]).style(gray2).style(border_s);
	    })
	}

	excel.write('Costos.xlsx', res);
	
    });
}



// REFACTORIZAR !!!
// COMBINAR METODOS
exports.boletasProyecto = (option, proyecto_id, res, next) => {

    const SQL = `

    SELECT 
    *,
    P.nombre                    AS proyecto_nombre,
    C.categoria                 AS categoria_nombre

    FROM boletas B INNER JOIN proyectos P
    ON   B.proyecto_id = P.id
    AND  B.proyecto_id = ${proyecto_id}

    INNER JOIN categorias C
    ON B.categoria_id = C.id;

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



    const hr = 10;
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
	if(data.length === 0)  {wb.write('Transferencias.xlsx', res);return;}

	// ===================================
	//           CATEGORIAS
	// ===================================
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
		10: wb.addWorksheet("PERSONAL"),

            };

	    for( let i = 1; i<=10; i++){

		sheetTitle(
		    sheets[i],
		    `Boletas Categoría ${categoria[i]}`, 
		    titleStyle
		);

		sheets[i].cell(hr,1).string('Rut').style(yellowStyle);
		sheets[i].cell(hr,2).string('Folio').style(yellowStyle);
		sheets[i].cell(hr,3).string('Fecha').style(yellowStyle);
		sheets[i].cell(hr,4).string('Valor').style(yellowStyle);
		sheets[i].cell(hr,5).string('Razón Social').style(yellowStyle);
		sheets[i].cell(hr,6).string('Categoria').style(yellowStyle);
		sheets[i].cell(hr,7).string('Proyecto').style(yellowStyle);

		sheets[i].column(1).setWidth(rutWidth);
		sheets[i].column(2).setWidth(folioWidth);
		sheets[i].column(3).setWidth(fechaWidth);
		sheets[i].column(4).setWidth(valorWidth);
		sheets[i].column(5).setWidth(nombreWidth);
		sheets[i].column(6).setWidth(categoriaWidth);
		sheets[i].column(7).setWidth(proyectoWidth);
	    }

	    data.forEach( boleta => {


		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 1).string(boleta?.rut).style(textStyle).style(lightGreyStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 2).string(boleta?.folio).style(textStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 3).date(boleta?.fecha).style(dateStyle).style(lightGreyStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 4).number(boleta?.valor).style(moneyStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 5).string(boleta?.razon_social).style(textStyle).style(lightGreyStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 6).string(boleta?.categoria_nombre).style(textStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 7).string(boleta?.proyecto_nombre).style(textStyle).style(lightGreyStyle);

		categoriaRow[boleta.categoria_id]++;

	    })

	}



	///////////////////////////////////////
	//
	//           LISTA COMPLETA
	//
	///////////////////////////////////////
	if(option === "full"){

	    ws = wb.addWorksheet("Boletas")

	    sheetTitle(
		ws,
		`Boletas`, 
		titleStyle
	    );

	    ws.cell(hr,1).string('Rut').style(yellowStyle);
	    ws.cell(hr,2).string('Folio').style(yellowStyle);
	    ws.cell(hr,3).string('Fecha').style(yellowStyle);
	    ws.cell(hr,4).string('Valor').style(yellowStyle);
	    ws.cell(hr,5).string('Razón Social').style(yellowStyle);
	    ws.cell(hr,6).string('Categoria').style(yellowStyle);
	    ws.cell(hr,7).string('Proyecto').style(yellowStyle);

	    ws.column(1).setWidth(rutWidth);
	    ws.column(2).setWidth(folioWidth);
	    ws.column(3).setWidth(fechaWidth);
	    ws.column(4).setWidth(valorWidth);
	    ws.column(5).setWidth(nombreWidth);
	    ws.column(6).setWidth(categoriaWidth);
	    ws.column(7).setWidth(proyectoWidth);


	    data.forEach( (boleta,i) => {


		ws?.cell(hr + 1 + i, 1).string(boleta?.rut).style(textStyle).style(lightGreyStyle);
		ws?.cell(hr + 1 + i, 2).string(boleta?.folio).style(textStyle);
		ws?.cell(hr + 1 + i, 3).date(boleta?.fecha).style(dateStyle).style(lightGreyStyle);
		ws?.cell(hr + 1 + i, 4).number(boleta?.valor).style(moneyStyle);
		ws?.cell(hr + 1 + i, 5).string(boleta?.razon_social).style(textStyle).style(lightGreyStyle);
		ws?.cell(hr + 1 + i, 6).string(boleta?.categoria_nombre).style(textStyle);
		ws?.cell(hr + 1 + i, 7).string(boleta?.proyecto_nombre).style(textStyle).style(lightGreyStyle);

	    })

	}


	wb.write('Previred.xlsx', res);

    });
}


// REFACTORIZAR !!!
// COMBINAR METODOS
exports.facturasProyecto = (option, proyecto_id, res, next) => {

    const SQL = `

    SELECT 
    *,
    P.nombre                    AS proyecto_nombre,
    C.categoria                 AS categoria_nombre

    FROM facturas B INNER JOIN proyectos P
    ON   B.proyecto_id = P.id
    AND  B.proyecto_id = ${proyecto_id}

    INNER JOIN categorias C
    ON B.categoria_id = C.id;

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



    const hr = 10;
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
	if(data.length === 0)  {wb.write('Facturas.xlsx', res);return;}



	//  CATEGORIAS
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
		10: wb.addWorksheet("PERSONAL"),

            };

            for( let i = 1; i<=10; i++){

		sheetTitle(
                    sheets[i],
                    `Facturas Categoría ${categoria[i]}`, 
                    titleStyle
		);

		sheets[i].cell(hr,1).string('Rut').style(yellowStyle);
		sheets[i].cell(hr,2).string('Folio').style(yellowStyle);
		sheets[i].cell(hr,3).string('Fecha').style(yellowStyle);
		sheets[i].cell(hr,4).string('Valor').style(yellowStyle);
		sheets[i].cell(hr,5).string('Razón Social').style(yellowStyle);
		sheets[i].cell(hr,6).string('Categoria').style(yellowStyle);
		sheets[i].cell(hr,7).string('Proyecto').style(yellowStyle);

		sheets[i].column(1).setWidth(rutWidth);
		sheets[i].column(2).setWidth(folioWidth);
		sheets[i].column(3).setWidth(fechaWidth);
		sheets[i].column(4).setWidth(valorWidth);
		sheets[i].column(5).setWidth(nombreWidth);
		sheets[i].column(6).setWidth(categoriaWidth);
		sheets[i].column(7).setWidth(proyectoWidth);
            }

            data.forEach( boleta => {


		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 1).string(boleta?.rut).style(textStyle).style(lightGreyStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 2).string(boleta?.folio).style(textStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 3).date(boleta?.fecha).style(dateStyle).style(lightGreyStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 4).number(boleta?.valor).style(moneyStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 5).string(boleta?.razon_social).style(textStyle).style(lightGreyStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 6).string(boleta?.categoria_nombre).style(textStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 7).string(boleta?.proyecto_nombre).style(textStyle).style(lightGreyStyle);

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
		`Facturas`, 
		titleStyle
	    );

	    ws.cell(hr,1).string('Rut').style(yellowStyle);
	    ws.cell(hr,2).string('Folio').style(yellowStyle);
	    ws.cell(hr,3).string('Fecha').style(yellowStyle);
	    ws.cell(hr,4).string('Valor').style(yellowStyle);
	    ws.cell(hr,5).string('Razón Social').style(yellowStyle);
	    ws.cell(hr,6).string('Categoria').style(yellowStyle);
	    ws.cell(hr,7).string('Proyecto').style(yellowStyle);

	    ws.column(1).setWidth(rutWidth);
	    ws.column(2).setWidth(folioWidth);
	    ws.column(3).setWidth(fechaWidth);
	    ws.column(4).setWidth(valorWidth);
	    ws.column(5).setWidth(nombreWidth);
	    ws.column(6).setWidth(categoriaWidth);
	    ws.column(7).setWidth(proyectoWidth);


	    data.forEach( (boleta,i) => {


		ws?.cell(hr + 1 + i, 1).string(boleta?.rut).style(textStyle).style(lightGreyStyle);
		ws?.cell(hr + 1 + i, 2).string(boleta?.folio).style(textStyle);
		ws?.cell(hr + 1 + i, 3).date(boleta?.fecha).style(dateStyle).style(lightGreyStyle);
		ws?.cell(hr + 1 + i, 4).number(boleta?.valor).style(moneyStyle);
		ws?.cell(hr + 1 + i, 5).string(boleta?.razon_social).style(textStyle).style(lightGreyStyle);
		ws?.cell(hr + 1 + i, 6).string(boleta?.categoria_nombre).style(textStyle);
		ws?.cell(hr + 1 + i, 7).string(boleta?.proyecto_nombre).style(textStyle).style(lightGreyStyle);

	    })

	}


	wb.write('Facturas.xlsx', res);

    });
}




exports.transferenciasProyecto = (option, proyecto_id, res, next) => {

    const SQL = `

    SELECT 
    B.rut,
    B.fecha,
    B.valor,
    B.nombre                    AS destinatario,
    B.categoria_id,
    B.proyecto_id,
    B.codigo,
    P.nombre                    AS proyecto_nombre,
    C.categoria                 AS categoria_nombre
    FROM transferencias B INNER JOIN proyectos P
    ON   B.proyecto_id = P.id
    AND  B.proyecto_id = ${proyecto_id}
    INNER JOIN categorias C
    ON B.categoria_id = C.id
    ;

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













    const hr = 10;

    const rutWidth           = 15;
    const folioWidth         = 15;
    const fechaWidth         = 15;
    const valorWidth         = 15;
    const nombreWidth        = 15;
    const categoriaWidth     = 15;
    const proyectoWidth      = 15;





    //This query returns the previred table  
    conn.query(SQL, function (err, data, fields) {

	if(err) return next(new AppError(err))
	if(data.length === 0)  {wb.write('Transferencias.xlsx', res);return;}


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
		10:1

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
		10: wb.addWorksheet("PERSONAL"),
            };

	    for( let i = 1; i<=10; i++){

		sheetTitle(
		    sheets[i],
		    `Transferencias Categoría ${categoria[i]}`, 
		    titleStyle
		);

		sheets[i].cell(hr,1).string('Rut').style(yellowStyle);
		sheets[i].cell(hr,2).string('Código').style(yellowStyle);
		sheets[i].cell(hr,3).string('Fecha').style(yellowStyle);
		sheets[i].cell(hr,4).string('Valor').style(yellowStyle);
		sheets[i].cell(hr,5).string('Nombre').style(yellowStyle);
		sheets[i].cell(hr,6).string('Categoria').style(yellowStyle);
		sheets[i].cell(hr,7).string('Proyecto').style(yellowStyle);

		sheets[i].column(1).setWidth(rutWidth);
		sheets[i].column(2).setWidth(folioWidth);
		sheets[i].column(3).setWidth(fechaWidth);
		sheets[i].column(4).setWidth(valorWidth);
		sheets[i].column(5).setWidth(nombreWidth);
		sheets[i].column(6).setWidth(categoriaWidth);
		sheets[i].column(7).setWidth(proyectoWidth);
	    }

	    data.forEach( boleta => {


		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 1).string(boleta?.rut).style(textStyle).style(lightGreyStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 2).string(boleta?.codigo).style(textStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 3).date(boleta?.fecha).style(dateStyle).style(lightGreyStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 4).number(boleta?.valor).style(moneyStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 5).string(boleta?.destinatario).style(textStyle).style(lightGreyStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 6).string(boleta?.categoria_nombre).style(textStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 7).string(boleta?.proyecto_nombre).style(textStyle).style(lightGreyStyle);

		categoriaRow[boleta.categoria_id]++;

	    })

	}



	///////////////////////////////////////
	//
	//           LISTA COMPLETA
	//
	///////////////////////////////////////
	if(option === "full"){

	    ws = wb.addWorksheet("Transferencias")

	    sheetTitle(
		ws,
		`Transferencias`, 
		titleStyle
	    );

	    ws.cell(hr,1).string('Rut').style(yellowStyle);
	    ws.cell(hr,2).string('Código').style(yellowStyle);
	    ws.cell(hr,3).string('Fecha').style(yellowStyle);
	    ws.cell(hr,4).string('Valor').style(yellowStyle);
	    ws.cell(hr,5).string('Nombre').style(yellowStyle);
	    ws.cell(hr,6).string('Categoria').style(yellowStyle);
	    ws.cell(hr,7).string('Proyecto').style(yellowStyle);

	    ws.column(1).setWidth(rutWidth);
	    ws.column(2).setWidth(folioWidth);
	    ws.column(3).setWidth(fechaWidth);
	    ws.column(4).setWidth(valorWidth);
	    ws.column(5).setWidth(nombreWidth);
	    ws.column(6).setWidth(categoriaWidth);
	    ws.column(7).setWidth(proyectoWidth);


	    data.forEach( (boleta,i) => {


		ws?.cell(hr + 1 + i, 1).string(boleta?.rut).style(textStyle).style(lightGreyStyle);
		ws?.cell(hr + 1 + i, 2).string(boleta?.codigo).style(textStyle);
		ws?.cell(hr + 1 + i, 3).date(boleta?.fecha).style(dateStyle).style(lightGreyStyle);
		ws?.cell(hr + 1 + i, 4).number(boleta?.valor).style(moneyStyle);
		ws?.cell(hr + 1 + i, 5).string(boleta?.destinatario).style(textStyle).style(lightGreyStyle);
		ws?.cell(hr + 1 + i, 6).string(boleta?.categoria_nombre).style(textStyle);
		ws?.cell(hr + 1 + i, 7).string(boleta?.proyecto_nombre).style(textStyle).style(lightGreyStyle);

	    })

	}

	wb.write('Transferencias.xlsx', res);

    });
}





exports.costosProyecto = (option, proyecto_id, res, next) => {

    const SQL = `



    WITH 

    Bol AS (

      SELECT
      rut,
      folio             AS serie,
      fecha,
      valor,
      razon_social      AS nombre_destinatario,
      categoria_id,
      proyecto_id,
      0                 AS tipo
      FROM boletas
      WHERE proyecto_id = ${proyecto_id}

    ),

    Fac AS (

      SELECT
      rut,
      folio              AS serie,
      fecha,
      valor,
      razon_social       AS nombre_destinatario,
      categoria_id,
      proyecto_id,
      1                  AS tipo
      FROM facturas
      WHERE proyecto_id = ${proyecto_id}

    ),

    Trans AS (

      SELECT
      rut,
      codigo             AS serie,
      fecha,
      valor,
      nombre             AS nombre_destinatario,
      categoria_id,
      proyecto_id,
      2                  AS tipo
      FROM transferencias
      WHERE proyecto_id = ${proyecto_id}

    ),

    Doc AS (

      SELECT * FROM Bol   UNION ALL
      SELECT * FROM Fac   UNION ALL
      SELECT * FROM Trans 
    )


    SELECT 
    *,
    P.nombre                    AS proyecto_nombre,
    C.categoria                 AS categoria_nombre

    FROM Doc B LEFT JOIN proyectos P
    ON B.proyecto_id = P.id

    INNER JOIN categorias C
    ON B.categoria_id = C.id

    ORDER BY proyecto_id
    ;






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













    const hr = 10;

    const rutWidth = 15;
    const folioWidth = 15;
    const fechaWidth = 15;
    const valorWidth = 15;
    const nombreWidth = 15;
    const categoriaWidth = 15;
    const proyectoWidth  = 15;
    const tipoWidth = 15





    //This query returns the previred table  
    conn.query(SQL, function (err, data, fields) {

	if(err) return next(new AppError(err));
	if(data.length === 0)  {wb.write('Transferencias.xlsx', res);return;}


	// ==================================
	//           CATEGORIAS
	// ==================================
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
		10: wb.addWorksheet("PERSONAL"),
		

            };

	    for( let i = 1; i<=10; i++){

		sheetTitle(
		    sheets[i],
		    `Costos Categoría ${categoria[i]}`, 
		    titleStyle
		);

		sheets[i].cell(hr,1).string('Rut').style(yellowStyle);
		sheets[i].cell(hr,2).string('Folio').style(yellowStyle);
		sheets[i].cell(hr,3).string('Fecha').style(yellowStyle);
		sheets[i].cell(hr,4).string('Valor').style(yellowStyle);
		sheets[i].cell(hr,5).string('Razón Social').style(yellowStyle);
		sheets[i].cell(hr,6).string('Categoria').style(yellowStyle);
		sheets[i].cell(hr,7).string('Proyecto').style(yellowStyle);
		sheets[i].cell(hr,8).string('Tipo').style(yellowStyle);

		sheets[i].column(1).setWidth(rutWidth);
		sheets[i].column(2).setWidth(folioWidth);
		sheets[i].column(3).setWidth(fechaWidth);
		sheets[i].column(4).setWidth(valorWidth);
		sheets[i].column(5).setWidth(nombreWidth);
		sheets[i].column(6).setWidth(categoriaWidth);
		sheets[i].column(7).setWidth(proyectoWidth);
		sheets[i].column(8).setWidth(tipoWidth);

	    }

	    data.forEach( boleta => {


		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 1).string(boleta?.rut).style(textStyle).style(lightGreyStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 2).string(boleta?.serie).style(textStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 3).date(boleta?.fecha).style(dateStyle).style(lightGreyStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 4).number(boleta?.valor).style(moneyStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 5).string(boleta?.nombre_destinatario).style(textStyle).style(lightGreyStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 6).string(boleta?.categoria_nombre).style(textStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 7).string(boleta?.proyecto_nombre).style(textStyle).style(lightGreyStyle);
		sheets[boleta.categoria_id]?.cell(hr + categoriaRow[boleta.categoria_id], 8).string(TIPO[boleta.tipo]).style(textStyle);


		categoriaRow[boleta.categoria_id]++;

	    })

	}





	///////////////////////////////////////
	//
	//           TIPO
	//
	///////////////////////////////////////


	if(option === "tipo"){

	    let tipoRow = {

		0:1,
		1:1,
		2:1,

	    };

	    let sheets = {

		0 : wb.addWorksheet("BOLETAS"),
		1 : wb.addWorksheet("FACTURAS"),
		2 : wb.addWorksheet("TRANSFERENCIAS"),

	    };

	    for( let i = 0; i<=2; i++){

		sheetTitle(
		    sheets[i],
		    `Costos Tipo ${TIPO[i]}`, 
		    titleStyle
		);

		sheets[i].cell(hr,1).string('Rut').style(yellowStyle);
		sheets[i].cell(hr,2).string('Folio').style(yellowStyle);
		sheets[i].cell(hr,3).string('Fecha').style(yellowStyle);
		sheets[i].cell(hr,4).string('Valor').style(yellowStyle);
		sheets[i].cell(hr,5).string('Razón Social').style(yellowStyle);
		sheets[i].cell(hr,6).string('Categoria').style(yellowStyle);
		sheets[i].cell(hr,7).string('Proyecto').style(yellowStyle);
		sheets[i].cell(hr,8).string('Tipo').style(yellowStyle);

		sheets[i].column(1).setWidth(rutWidth);
		sheets[i].column(2).setWidth(folioWidth);
		sheets[i].column(3).setWidth(fechaWidth);
		sheets[i].column(4).setWidth(valorWidth);
		sheets[i].column(5).setWidth(nombreWidth);
		sheets[i].column(6).setWidth(categoriaWidth);
		sheets[i].column(7).setWidth(proyectoWidth);
		sheets[i].column(8).setWidth(tipoWidth);

	    }

	    data.forEach( boleta => {


		sheets[boleta.tipo]?.cell(hr + tipoRow[boleta.tipo], 1).string(boleta?.rut).style(textStyle).style(lightGreyStyle);
		sheets[boleta.tipo]?.cell(hr + tipoRow[boleta.tipo], 2).string(boleta?.serie).style(textStyle);
		sheets[boleta.tipo]?.cell(hr + tipoRow[boleta.tipo], 3).date(boleta?.fecha).style(dateStyle).style(lightGreyStyle);
		sheets[boleta.tipo]?.cell(hr + tipoRow[boleta.tipo], 4).number(boleta?.valor).style(moneyStyle);
		sheets[boleta.tipo]?.cell(hr + tipoRow[boleta.tipo], 5).string(boleta?.nombre_destinatario).style(textStyle).style(lightGreyStyle);
		sheets[boleta.tipo]?.cell(hr + tipoRow[boleta.tipo], 6).string(boleta?.categoria_nombre).style(textStyle);
		sheets[boleta.tipo]?.cell(hr + tipoRow[boleta.tipo], 7).string(boleta?.proyecto_nombre).style(textStyle).style(lightGreyStyle);
		sheets[boleta.tipo]?.cell(hr + tipoRow[boleta.tipo], 8).string(TIPO[boleta.tipo]).style(textStyle);


		tipoRow[boleta.tipo]++;

	    })

	}



	// ==============================
	//        LISTA COMPLETA
	// ==============================
	if(option === "full"){

	    ws = wb.addWorksheet("Costos")

	    sheetTitle(
		ws,
		`Costos`, 
		titleStyle
	    );

	    ws.cell(hr,1).string('Rut').style(yellowStyle);
	    ws.cell(hr,2).string('Folio').style(yellowStyle);
	    ws.cell(hr,3).string('Fecha').style(yellowStyle);
	    ws.cell(hr,4).string('Valor').style(yellowStyle);
	    ws.cell(hr,5).string('Razón Social').style(yellowStyle);
	    ws.cell(hr,6).string('Categoria').style(yellowStyle);
	    ws.cell(hr,7).string('Proyecto').style(yellowStyle);
	    ws.cell(hr,8).string('Tipo').style(yellowStyle);


	    ws.column(1).setWidth(rutWidth);
	    ws.column(2).setWidth(folioWidth);
	    ws.column(3).setWidth(fechaWidth);
	    ws.column(4).setWidth(valorWidth);
	    ws.column(5).setWidth(nombreWidth);
	    ws.column(6).setWidth(categoriaWidth);
	    ws.column(7).setWidth(proyectoWidth);
	    ws.column(8).setWidth(tipoWidth);



	    data.forEach( (boleta,i) => {


		ws?.cell(hr + 1 + i, 1).string(boleta?.rut).style(textStyle).style(lightGreyStyle);
		ws?.cell(hr + 1 + i, 2).string(boleta?.serie).style(textStyle);
		ws?.cell(hr + 1 + i, 3).date(boleta?.fecha).style(dateStyle).style(lightGreyStyle);
		ws?.cell(hr + 1 + i, 4).number(boleta?.valor).style(moneyStyle);
		ws?.cell(hr + 1 + i, 5).string(boleta?.nombre_destinatario).style(textStyle).style(lightGreyStyle);
		ws?.cell(hr + 1 + i, 6).string(boleta?.categoria_nombre).style(textStyle);
		ws?.cell(hr + 1 + i, 7).string(boleta?.proyecto_nombre).style(textStyle).style(lightGreyStyle);
		ws?.cell(hr + 1 + i, 8).string(TIPO[boleta.tipo]).style(textStyle);


	    })
	}

	wb.write('Costos.xlsx', res);
	
    });
}





/* 
   Exporta el costo de personal
*/
exports.costo_personal = (req,res,next) => {


    const date0   = req.params.date0;
    const date1   = req.params.date1;

    const SQL = `call costo_personal(?)`

    const excel         = new xcel.XcelFile("XXX");    
    let sheet           = excel.addWorksheet("personal",`Cost Personal ${date0} ${date1}`)
    let yellow          = excel.color_style("YELLOW")
    let light_yellow    = excel.color_style("LIGHT_YELLOW")
    let blue            = excel.color_style("BLUE")    
    let light_blue      = excel.color_style("LIGHT_BLUE")
    let border_s        = excel.border_style()
    let money_s         = excel.money_style()
    let bold_s          = excel.bold_style()

    let hr = 10; // Header Row

    sheet.cell(hr,1).string('Nombre').style(border_s).style(bold_s)
    sheet.cell(hr,2).string('Rut').style(border_s).style(bold_s)
    sheet.cell(hr,3).string('Sueldo').style(yellow).style(border_s).style(bold_s)
    sheet.cell(hr,4).string('Bonos').style(yellow).style(border_s).style(bold_s)
    sheet.cell(hr,5).string('Descuentos').style(yellow).style(border_s).style(bold_s)
    sheet.cell(hr,6).string('Líquido').style(blue).style(border_s).style(bold_s)
    sheet.cell(hr,7).string('Finiquitos').style(blue).style(border_s).style(bold_s)
    sheet.cell(hr,8).string('TOTAL').style(blue).style(border_s).style(bold_s)

    sheet.column(1).setWidth(35);
    sheet.column(2).setWidth(15);
    sheet.column(3).setWidth(15);
    sheet.column(4).setWidth(15);
    sheet.column(5).setWidth(15);
    sheet.column(6).setWidth(15);
    sheet.column(7).setWidth(15);
    sheet.column(8).setWidth(15);

    hr++;

    /* This query returns the previred table  */
    conn.query(SQL, [[date0, date1]],  function (err, data, fields) {
	if(err) return next(new AppError(err))
	
	let empleados = data[0]
	let N = empleados.length

	for(let i = 0; i<N; i++){

	    sheet.cell(hr + i, 1)
		.string( empleados[i].nombre ).style(border_s)
	    
	    sheet.cell(hr + i, 2)
		.string( empleados[i].rut ).style(border_s)
	    
	    sheet.cell(hr + i, 3)
		.number( dflt.number(empleados[i].sueldo_mensual))
		.style(light_yellow)
		.style(money_s)
		.style(border_s)
	    
	    sheet.cell(hr + i, 4)
		.number( dflt.number(empleados[i].total_bonos)  )
		.style(light_yellow)
		.style(money_s)
	    	.style(border_s)
	    
	    sheet.cell(hr + i, 5)
		.number( dflt.number(empleados[i].total_descuentos)  )
	    	.style(light_yellow)
		.style(money_s)
	    	.style(border_s)
	    
	    sheet.cell(hr + i, 6)
		.number( dflt.number(empleados[i].liquido))
		.style(light_blue)
		.style(money_s)
	    	.style(border_s)
	    
	    sheet.cell(hr + i, 7)
		.number( dflt.number(empleados[i].total_finiquitos) )
		.style(light_blue)
		.style(money_s)
	    	.style(border_s)
	    
	    sheet.cell(hr + i, 8)
		.style(light_blue)
		.style(money_s)
	    	.style(border_s)
	    
	    excel.sum(sheet.cell(hr + i, 8), 6, hr + i, 7, hr + i)
	}


	
	for(let i = 3; i <= 8; i++){

	    excel.sum(
		sheet.cell(hr+N , i) ,
		i,
		hr + 1,
		i,
		hr + N -1
	    )

	    sheet.cell(hr+N, i).style(border_s).style(money_s)
	}
	
	excel.write('Previred.xlsx', res);

    })
}



