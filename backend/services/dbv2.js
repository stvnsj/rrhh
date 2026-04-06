const mysql = require("mysql");

const DB_CONFIG = {
  host: "localhost",
  user: "root",
  password: "",
  database: "rrhh",
  multipleStatements: true,
};

const pool = mysql.createPool(DB_CONFIG);

function queryAsync(sql, values = [], mapper = null) {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (err, data, fields) => {
      if (err) return reject(err);

      try {
        const result =
          typeof mapper === "function" ? mapper(data, fields) : data;
        resolve(result);
      } catch (mapErr) {
        reject(mapErr);
      }
    });
  });
}

function getSessionConn() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err);

      const wrapQuery = (sql, values = [], mapper = null) =>
        new Promise((resolve, reject) => {
          connection.query(sql, values, (err, data, fields) => {
            if (err) return reject(err);

            try {
              const result =
                typeof mapper === "function" ? mapper(data, fields) : data;
              resolve(result);
            } catch (mapErr) {
              reject(mapErr);
            }
          });
        });

      const beginTransaction = () =>
        new Promise((resolve, reject) => {
          connection.beginTransaction((err) => {
            if (err) return reject(err);
            resolve();
          });
        });

      const commit = () =>
        new Promise((resolve, reject) => {
          connection.commit((err) => {
            if (err) return reject(err);
            resolve();
          });
        });

      const rollback = () =>
        new Promise((resolve) => {
          connection.rollback(() => resolve());
        });

      resolve({
        raw: connection,
        query: wrapQuery,
        beginTransaction,
        commit,
        rollback,
        release() {
          connection.release();
        },
        destroy() {
          connection.destroy();
        },
      });
    });
  });
}

async function withTransaction(work) {
  const session = await getSessionConn();

  try {
    await session.beginTransaction();

    try {
      const result = await work(session);
      await session.commit();
      return result;
    } catch (err) {
      await session.rollback();
      throw err;
    }
  } finally {
    session.release();
  }
}

module.exports = {
  pool,
  queryAsync,
  getSessionConn,
  withTransaction,
};
/*  

USE 
====

Without a callback:
-------------------

const { queryAsync } = require("./db");

const rows = await queryAsync(
  "SELECT * FROM empleados WHERE proyecto_id = ?",
  [proyectoId]
);

// now you manipulate rows outside the callback
const first = rows[0] ?? null;


Without a callback:
-------------------
const rows = await queryAsync(
  "CALL resumen_anual()",
  [],
  (data) => extractProcedureRows(data)
);

*/




/*

USE OF SESSION PRESERVING CONNECTION
=======================================

const { getSessionConn } = require("./db");

const session = await getSessionConn();

try {
  await session.query("CREATE TEMPORARY TABLE tmp_ids (id INT)");
  await session.query("INSERT INTO tmp_ids (id) VALUES (?), (?), (?)", [1, 2, 3]);

  const rows = await session.query(
    "SELECT * FROM proyectos JOIN tmp_ids ON proyectos.id = tmp_ids.id"
  );

  // same DB session the whole time
  console.log(rows);
} finally {
  session.release();
}

*/



/* 
module.exports = {
    conn, 
    pool, 
    queryAsync,
    getSessionConn,
};
 */