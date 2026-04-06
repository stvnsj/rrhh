

const {read_factura_corta} = require("./import/facturaCorta");
const {creat_factura_report} = require("./export/facturaReport");
const {read_factura_sii} = require("./import/sii_detalle")

module.exports = {
    read_factura_corta,
    creat_factura_report,
    read_factura_sii
};