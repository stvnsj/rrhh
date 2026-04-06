let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

/* Module dealing with Cross-Origin Request */
const cors = require('cors');


/* Port of the application */
const port = 8000;


/* Import of routes used as continuation
of routes defined in this file. */
let analyticsRouter     = require('./routes/analytics');
let asistenciaRouter    = require('./routes/asistencia');
let boletaRouter        = require('./routes/boleta');
let contratoRouter      = require('./routes/contrato');
let costoRouter         = require('./routes/costo');
let empleadoRouter      = require('./routes/empleado');
let empresaRouter       = require('./routes/empresa');
let facturaRouter       = require('./routes/factura');
let finiquitoRouter     = require('./routes/finiquito');
let gastoRouter         = require('./routes/gasto');
let minimoRouter        = require('./routes/minimo');
let plotRouter          = require('./routes/plot');
let previredRouter      = require('./routes/previred');
let proyectoRouter      = require('./routes/proyecto');
let socialRouter        = require('./routes/social');
let sueldoRouter        = require('./routes/sueldo');
let transferenciaRouter = require('./routes/transferencia');




const errorHandler = require("./utils/errorHandler");



var app = express();

app.use(cors({
  origin: '*'
}));

app.use(cors({
  methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));

app.all('/*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));






/* ROUTES */
app.use('/', analyticsRouter);
app.use('/', asistenciaRouter);
app.use('/', boletaRouter);
app.use('/', contratoRouter);
app.use('/', costoRouter);
app.use('/', empresaRouter);
app.use('/', empleadoRouter);
app.use('/', facturaRouter);
app.use('/', finiquitoRouter);
app.use('/', gastoRouter);
app.use('/', minimoRouter);
app.use('/', plotRouter);
app.use('/', proyectoRouter);
app.use('/', previredRouter);
app.use('/', socialRouter);
app.use('/', sueldoRouter);
app.use('/', transferenciaRouter);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


app.use(errorHandler);

module.exports = app;


const server = app.listen(port, () => console.log('Listening on port', server.address().port));
