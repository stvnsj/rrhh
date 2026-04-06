
const conn = require("../services/db");
const AppError = require("../utils/AppError");
const readXlsxFile = require('read-excel-file/node')


/*=================================
*   _____   ____   _____ _______ 
*  |  __ \ / __ \ / ____|__   __|
*  | |__) | |  | | (___    | |   
*  |  ___/| |  | |\___ \   | |   
*  | |    | |__| |____) |  | |   
*  |_|     \____/|_____/   |_|   
*
*==================================*/


const schema1 = {


  'NETO':{

    prop   : 'neto',
    type   : Number
  },

  'OFICIAL':{

    prop    : 'oficial',
    type    : Number

  },

  'CATEGORIA':{

    prop   : 'categoria_id',
    type   : Number
  },

}



exports.upload = (req,res,next) => {

    


  const filename = req.file.filename;


  let proyecto_id = req.body.proyecto_id;



  let SQL1 = `
    INSERT INTO presupuesto(categoria_id, proyecto_id, neto) VALUES ?
    ON DUPLICATE KEY UPDATE neto=VALUES(neto);
  `

  let SQL2 = `
    UPDATE proyectos
    SET precio = ?
    WHERE id = ?
  `


  readXlsxFile(`uploads/presupuesto/${filename}`,{schema: schema1,ignoreEmptyRows:true}).then(({rows,errors}) => {


    let presupuesto = {
      1  :  {neto:0},
      2  :  {neto:0},
      3  :  {neto:0},
      4  :  {neto:0},
      5  :  {neto:0},
      6  :  {neto:0},
      7  :  {neto:0},
      8  :  {neto:0},
      9  :  {neto:0},
      10 :  {neto:0}
    }

    let oficial = 0;



    rows.forEach((row) => {
      
      if(row.categoria_id && row.neto)
      presupuesto[row.categoria_id].neto = presupuesto[row.categoria_id].neto + row.neto;

      if(row.oficial) oficial = row.oficial;

    })

    let values = [1,2,3,4,5,6,7,8,9,10].map(categoria => [

      categoria, 
      proyecto_id, 
      presupuesto[categoria].neto,
    
    ]);



    conn.query(
      SQL1, [values],
      function (err,data,fields) {
        if(err) return next( new AppError(err,500));
        conn.query(
          SQL2, [oficial,proyecto_id],
          function (err) {
            if(err) return next( new AppError(err,500));
            res.status(201).json({
              status: "success",
            });
          }
        );
      }
    );
  })
}



/*==================================
*        _____ ______ _______ 
*       / ____|  ____|__   __|
*      | |  __| |__     | |   
*      | | |_ |  __|    | |   
*      | |__| | |____   | |   
*       \_____|______|  |_|   
*
*==================================*/





/* Get all active proyectos */
exports.getPresupuesto = (req, res, next) => {

  const proyecto_id = req.params.proyecto_id

  const SQL = `

    SELECT 
    'TOTAL' as nombre,
    SUM(neto) AS valor 
    FROM presupuesto WHERE proyecto_id = ${proyecto_id}
    UNION ALL 
    SELECT 
    categorias.categoria AS nombre,
    total_cat AS valor
    FROM(

      SELECT SUM(neto) AS total_cat, categoria_id FROM presupuesto WHERE proyecto_id = ${proyecto_id}
      GROUP BY categoria_id
    ) AS X INNER JOIN categorias 
    ON X.categoria_id = id;
  `

  conn.query(SQL, function (err, data, fields) {
    if(err) return next(new AppError(err))
    res.status(200).json({
        status: "success",
        length: data?.length,
        data: data,
    });
  });


};