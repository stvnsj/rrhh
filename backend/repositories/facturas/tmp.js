


async function insertarFacturaSII (conn, factura) {

    const args = [
        factura.rut,
        factura.folio,
        factura.valor,
        factura.fecha,
        factura.razon_social,
        factura.tipo_doc,
        factura.fila_sii,
        factura.hoja
    ];

    const raw_query = "CALL insertar_factura_sii(?,?,?,?,?,?,?,?);";

    return conn.query(raw_query, args);
}


module.exports = {
    insertarFacturaSII
}