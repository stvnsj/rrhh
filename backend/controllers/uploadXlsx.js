const ExcelJS = require('exceljs');


const conn = require("../services/db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");
const util = require('util');
const db   = require('../services/db');
const {RutFun,Processor,DateModule} = require('../utils/utils');
const {Integer} = require ('read-excel-file/node');
const xlsxUtils = require("../utils/exceljsUtils")






const header_row = [
    'RUT', // 1
    'FOLIOFACTURA', // 2
    'FECHA', // 3
    'MONTO',  // 4
    'RAZON_SOCIAL', // 5
    'CATEGORIA', // 6
    'PROYECTO', // 7
    'STATUS', // 8
    'NRO', // 9
    'PROYECTOS' // 10
]


exports.compare = async (req, res, next) => {

    const stats = {
        totalRows: 0,
        faltantes: 0,       // STATUS = FALTANTE
        valorDiferente: 0,  // STATUS = VALOR
        processedSheets: 0
    };

    const filename  = req.file.filename;
    const file_path = `uploads/facturas/${filename}`;

    // Read input workbook
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file_path);

    // Output workbook
    const res_workbook = new ExcelJS.Workbook();

    // Header row of the result file


    // Process all sheets synchronously with await
    for (const worksheet of workbook.worksheets) {
        const sheet = res_workbook.addWorksheet(worksheet.name);
        xlsxUtils.makeColWidth(sheet,[1,2,3,4,5,6,7,8,9,10],15)
        xlsxUtils.makeColWidth(sheet,[1,2,3,4,6,7,8,9,10],15)
        xlsxUtils.makeColWidth(sheet,[5],25)


        
        newRow = sheet.addRow(header_row);
        xlsxUtils.makeBorder(newRow,1,10)
        const headerRow = worksheet.getRow(1);

        for (let rowNumber = 2; rowNumber <= worksheet.actualRowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);

            const rowData = {};
            row.eachCell((cell, colNumber) => {
                const header = headerRow.getCell(colNumber).value;
                rowData[header] = cell.value;
            });

            const jsDate = new Date(rowData["Fecha Docto"]); // you create this
            const folio = Processor.normalize(String(rowData["Folio"] ?? ""));
            const rut   = RutFun.normalize(String(rowData["RUT Proveedor"] ?? ""));
            const rawValor = rowData["Monto Total"];
            const valor =
            rawValor == null
                ? null
                : parseInt(String(rawValor).replace(/\D/g, ''), 10);  // keep only digits


            /* SQL query */
            const SQL = 'SELECT factura_exists(?, ?, ?) AS factura_exists_result,'+
            'proyecto_id_seq(?,15) AS proyecto_seq';

            const fila   = rowData["Nro"]

            const result = await new Promise((resolve, reject) => {
                conn.query(SQL, [rut,folio,valor,jsDate], (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows);
                });
            });

            const exists = result[0].factura_exists_result; // 1 or 0
            const proyecto_seq = result[0].proyecto_seq;


            if (exists === 1) {

                newRow = sheet.addRow([
                    rut,
                    folio,
                    jsDate,
                    rowData["Monto Total"],
                    rowData["Razon Social"],
                    9,
                    4,
                    "FALTANTE",
                    `${fila}`,
                    proyecto_seq
                    
                ])

                newRow.getCell(3).numFmt = 'yyyy-mm-dd';
                xlsxUtils.makeFill(newRow, [8], 'F76D52')
                xlsxUtils.makeFill(newRow, [10], 'B8E8A9')
                xlsxUtils.makeBorder(newRow,1,10)




            } else if (exists) {
                newRow = sheet.addRow([
                    rut,
                    folio,
                    jsDate,
                    rowData["Monto Total"],
                    rowData["Razon Social"],
                    9,
                    4,
                    "VALOR",
                    `${fila}`,
                    proyecto_seq
                ])



                newRow.getCell(3).numFmt = 'yyyy-mm-dd';
                xlsxUtils.makeFill(newRow, [8], 'FFF285')
                xlsxUtils.makeFill(newRow, [10], 'B8E8A9')
                xlsxUtils.makeBorder(newRow,1,10)



            } else {}

            
        }
    }


    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=facturas_faltantes.xlsx"
    );
    res.setHeader("X-Report-Stats", JSON.stringify(stats));
    await res_workbook.xlsx.write(res);
    res.end();
};




