
const {queryAsync} = require("../services/dbv2")
const asyncHandler = require("../utils/asyncHandler");

exports.toggle_activo_controller = asyncHandler(async (req, res) => {

    const empleado_id = req.params.empleadoid
    const proyecto_id = req.params.proyectoid

    const rows = await queryAsync(
        "select toggle_activo(?,?) AS activo",
        [empleado_id,proyecto_id]
    );

    const activo = rows[0].activo;


  return res.status(200).json({ activo });

});