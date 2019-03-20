const mysql = require('mysql');

/**
 * TODO(developer): specify SQL connection details
 */
const connectionName =
  process.env.INSTANCE_CONNECTION_NAME || 'projectid:us-central1:cloudsql-db';
const dbUser = process.env.SQL_USER || 'cloudfunction-user';
const dbPassword = process.env.SQL_PASSWORD || 'passwordgoeshere';
const dbName = process.env.SQL_NAME || 'demo_db';

const mysqlConfig = {
  connectionLimit: 1,
  user: dbUser,
  password: dbPassword,
  database: dbName,
};
if (process.env.NODE_ENV === 'production') {
  mysqlConfig.socketPath = `/cloudsql/${connectionName}`;
}

// Connection pools reuse connections between invocations,
// and handle dropped or expired connections automatically.
let mysqlPool;

exports.readContactForm = (req, res) => {
  // Initialize the pool lazily, in case SQL access isn't needed for this
  // GCF instance. Doing so minimizes the number of active SQL connections,
  // which helps keep your GCF instances under SQL connection limits.
  if (!mysqlPool) {
    mysqlPool = mysql.createPool(mysqlConfig);
  }
  
  // The actual MySQL query, feel free to change it to whatever you want
  mysqlPool.query('SELECT * FROM `demo_db`.demo_table', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);
    } else {
      res.send(JSON.stringify(results));
    }
  });

  // Close any SQL resources that were declared inside this function.
  // Keep any declared in global scope (e.g. mysqlPool) for later reuse.
};