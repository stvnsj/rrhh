

const readXlsxFile = require('read-excel-file/node')
const sqlDate = require("../../utils/sqlDate")
const {RutFun,Processor} = require('../../utils/utils');
const {Integer} = require ('read-excel-file/node');




const schema = {
  RUT:          { prop: "rut",          type: String },
  FOLIOFACTURA: { prop: "folio",        type: String },
  CATEGORIA:    { prop: "categoria_id", type: Number },
  PROYECTO:     { prop: "proyecto_id",  type: Number },
};

async function read_factura_corta(file) {
  const { rows } = await readXlsxFile(file, {
    schema,
    ignoreEmptyRows: true,
  });

  const result = rows.map((factura, index) => ({
    ...factura,
    fila_cortas: index + 2,
  }));

  for (const factura of result) {
    if (!RutFun.validaRut(factura.rut)) {
      throw new Error(`Fila ${factura.fila_cortas}: RUT inválido: ${factura.rut}`);
    }
  }

  return result;
}


module.exports = {
    read_factura_corta
};