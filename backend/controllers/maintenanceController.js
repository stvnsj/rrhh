


const conn = require("../services/db");
const AppError = require("../utils/AppError");
const errorHandler = require("../utils/errorHandler");
const util = require('util');
const db   = require('../services/db');



const query = util.promisify(db.query).bind(db);



exports.exportJSON = async (req, res, next) => {


    try{

    // const proyecto_id = req.param.id;
    const SQL1 = "SELECT id, nombre FROM proyectos;"
    const SQL2 = `SELECT id, CONCAT(nombre, ' ', apellido_paterno, ' ', apellido_materno) as nombre FROM empleados;`
    
    
    const rows1 = await query(SQL1);
    const rows2 = await query(SQL2);

    const PROJECT = rows1.map((row, index, array) => {

        return {"project_id":row["id"] , "project_name" : row["nombre"]};

    });

    const WORKER = rows2.map((row, index, array) => {

        return {"worker_id":row["id"] , "worker_name" : row["nombre"]};

    });

    const DATA= {
        "eqc_database_name" : "EQC_WORKERS_AND_PROJECTS", 
        "project" : PROJECT,
        "worker"  : WORKER
    }


    res.setHeader('Content-Type',        'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${"eqcin_db.json"}"`);
    res.status(200).send(JSON.stringify(DATA, null, 2));
  } catch (err) {
    next(err);
  }
};