// In this file, the styles used in exported excel
// Sheets are defined and organized.
// The correct way to apply styles to excel sheets,
// is to define separately the color, the border, etc.
// Thus, fewer styles have to be defined, and they can
// be combined to form the same results by being applied
// successively.

let xl = require('excel4node');
let color = require('./color');


function alphaIndex(columnNumber) {
    
    let columnLabel = '';
    const base = 26;
    const aCode = 'A'.charCodeAt(0);
    
    while (columnNumber > 0) {
        columnNumber--;
        const remainder = columnNumber % base;
        const char = String.fromCharCode(aCode + remainder);
        columnLabel = char + columnLabel;
        columnNumber = Math.floor(columnNumber / base);
    }
    
    return columnLabel;
}


class XcelFile {


    constructor (name) {
	
        this.wb = new xl.Workbook();
        this.name = name;
    }

    write (name, response) {

        this.wb.write(`${name}.xlsx`,response);
    }


    border (cell){
	cell.style(this.class_border_style)
    }

    money (cell){
	cell.style(this.class_money_style)
    }
    

    addWorksheet (name,title) {

        let sheet =  this.wb.addWorksheet(name);
        
        sheet.addImage({
            path: 'eqc.png',
            type: 'picture',
            position: {
                type: 'twoCellAnchor',
                from: {col: 2,colOff:1,row:1,rowOff:0},
                to: {col: 4,colOff: 1,row: 4,rowOff: 0}}});

        
        sheet.cell(5,2,6,5,true)
            .string(title)
            .style(this.center_style())
	    .style(this.border_style("thick"))
            .style(this.bold_style());

        
        return sheet;        
    }
    
    


    border_style(s = "thin") {        
	return this.wb.createStyle({
            border: {
		left: { style: s, color: 'black' },
		top: { style: s, color: 'black' },
		bottom: { style: s, color: 'black' },
		right: { style: s, color: 'black' },
		outline: false
            }
	});
    }


    money_style () {        
        return this.wb.createStyle({numberFormat: '$##,#; -$##,#;'});
    }


    date_style () {        
        return this.wb.createStyle({numberFormat: 'dd/mm/yyyy'});
    }


    bold_style () {
        return this.wb.createStyle({font: {bold:true,size:12}});
    }

    
    center_style () {
        return this.wb.createStyle({
            alignment: {
                wrapText:true,horizontal:'center',vertical:'center'}});        
    }
				     

    

    color_style (c) {
        return this.wb.createStyle({
            fill: {
                type:        'pattern',
                patternType: 'solid',
                fgColor:     color.color[c]}});  
    }


    sum(cell,col1,row1,col2,row2){
        cell.formula(`SUM(${alphaIndex(col1)}${row1} : ${alphaIndex(col2)}${row2})`)
    }

    
    date(sheet,c,r,value,color){
        sheet.cell(r,c)
            .date(value)
            .style(this.date_style())
            .style(this.color_style('yellow'))

    }

    
    money(sheet,c,r,value,color){
        sheet.cell(r,c)
            .number(value)
            .style(this.money_style())
            .style(this.color_style('red'))
    }


    text(sheet,c,r,value,color){
        sheet.cell(r,c)
            .string(value)
            .style(this.money_style())
            .style(this.color_style('blue'))
    }
}


module.exports = {XcelFile, alphaIndex}
