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

exports.writeContactForm = (req, res) => {
 
  //Calculate Date and Time (Eastern Time) of submission
  var datetime = new Date();
  var date = datetime.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) + " " + datetime.toLocaleTimeString('en-US',{timeZone:'America/New_York'}) + " ET" 
  
  // Making sure to use mysql.escape() for user inputted data to protect against SQL Injections
  var sqlinsert = "INSERT INTO `demo_db`.`demo_table` (name, email, message, date) VALUES (" + mysql.escape(req.query.name) + "," + mysql.escape(req.query.email) + "," + mysql.escape(req.query.msg) + "," + "'" + date + "')";
  
  // Initialize the pool lazily, in case SQL access isn't needed for this
  // GCF instance. Doing so minimizes the number of active SQL connections,
  // which helps keep your GCF instances under SQL connection limits.
  if (!mysqlPool) {
    mysqlPool = mysql.createPool(mysqlConfig);
  }

  mysqlPool.query(sqlinsert, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);
    } else {
       res.statusCode = 302;
  	   res.setHeader("Location", "http://www.learningautomation.io/thankyoumsg.html");
  	   res.end();
    }
  });

  // Close any SQL resources that were declared inside this function.
  // Keep any declared in global scope (e.g. mysqlPool) for later reuse.
};