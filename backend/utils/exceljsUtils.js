

exports.makeBorder = (row,i,j) => {

    var col_cur = i
    while (col_cur <= j){

        row.getCell(col_cur).border  = {
            top:    { style: 'thin', color: { argb: '000000' } },
            left:   { style: 'thin', color: { argb: '000000' } },
            bottom: { style: 'thin', color: { argb: '000000' } },
            right:  { style: 'thin', color: { argb: '000000' } },
        };
        
        col_cur++;
    }
}



exports.makeFill = (row,cell_arr,color) => {
    for (const i of cell_arr){
        row.getCell(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: color }
        };
    }
}


// cell.numFmt = '#,##0';
exports.makeColNumFmt = (sheet,col_arr,format) => {
    for (const col of col_arr){
        sheet.getColumn(col).numFmt = format;
    }
}


exports.makeColWidth = (sheet,col_arr,width) => {
    for (const col of col_arr){
        sheet.getColumn(col).width = width
    }
}

exports.makeMoneyNum = (sheet,row,col) => {
    sheet.getCell(row, col).numFmt = '"$"#,##0';
}

