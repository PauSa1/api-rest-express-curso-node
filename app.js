const Debug= require('debug')('app:inicio');
//const dbDebug= require('debug')('app:bd');
const express= require('express');
const config= require('config');
//const logger= require('./logger');
const morgan= require('morgan');
const Joi = require('joi');
const app = express();

app.use(express.json());//body
app.use(express.urlencoded({extended:true}));//formulario
app.use(express.static('public'));//recursos estaticos prueba.txt

//Configuración de entornos
console.log('Aplicación:' + config.get('nombre'));
console.log('BD server:' + config.get('configDB.host'));

//Uso de un middleware de tercero - Morgan
if(app.get('env')=== 'development'){
     app.use(morgan('tiny'));
    // console.log('morgan habilitado');
    Debug('Morgan esta habilitado.');

}
//Trabajos con la base de datos
Debug('Conectando con la base de datos.');


//app.use(logger);
/*
app.use(function(req, res, next){
     console.log('Autenticando...');
     next();
});
*/

const usuarios = [
     {id:1, nombre: 'Paulina'},
     {id:2, nombre: 'Fernanda'},
     {id:3, nombre: 'Ana'}
];


//----------peticiones GET
app.get('/', (req, res)=> {
     res.send('hola mundo desde express');
});

app.get('/api/usuarios', (req, res)=>{
     res.send(usuarios);
});

//Find permite hacer una búsqueda
app.get('/api/usuarios/:id', (req, res)=>{
     let usuario= validarUsuario(req.params.id);
     if(!usuario) res.status(404).send('El usuario no fue encontrado');
     res.send(usuario);
});

//---------Manejo de solicitudes por POST

app.post('/api/usuarios', (req, res)=>{
    /* -----Envío de un usuario por formularío
     let body= req.body;
     console.log(body.nombre);
     res.json({
          body
     });

     */
     const schema = Joi.object({
          nombre: Joi.string().min(3).required()
     });

     const {error, value} = validarUsuario(req.body.nombre);
     if(!error){
          const usuario= {
               id:usuarios.length + 1,
               nombre: value.nombre
          };
          usuarios.push(usuario);
          res.send(usuario);
     }else{
          const mensaje= error.details[0].message;
          res.status(400).send(mensaje);
     }
     

     /*

     if(!req.body.nombre || req.body.nombre.length <= 2){
          //400 bad Request /no es un requerimiento válido
          res.status(400).send('Debe ingresar un nombre, que tenga minimo tres letras');
          return;
     }
    
     */
});

//---------------Actualización o modificación de datos Método PUT

app.put('/api/usuarios/:id', (req, res)=>{
     //Encontrar si existe el objeto Usuario que se modificará
     //let usuario= usuarios.find(u => u.id=== parseInt(req.params.id));
     let usuario= existeUsuario(req.params.id);
     if(!usuario) {
          res.status(404).send('El usuario no fue encontrado');
          return;
     }  
     const {error, value} = validarUsuario(req.body.nombre);
     if(error){
          const mensaje= error.details[0].message;
          res.status(400).send(mensaje);
          return;                
     }
     //envio de usuario modificado
     usuario.nombre = value.nombre;
     res.send(usuario);
});

app.delete('/api/usuarios/:id', (req, res)=>{
     let usuario= existeUsuario(req.params.id);
     if(!usuario) {
          res.status(404).send('El usuario no fue encontrado');
          return;
     }  
     const index= usuarios.indexOf(usuario);
     usuarios.splice(index,1);

     res.send(usuario);
});




/*
//Parametrización
app.get('/api/usuarios/:id', (req, res)=>{
     res.send(req.params.id);
});

app.get('/api/usuarios/:year/:mes', (req, res)=>{
     res.send(req.params);
});

//Parametrizacion de tipo query string

app.get('/api/usuarios/:year/:mes', (req, res)=>{
     res.send(req.query);
});
*/

//Constante port para almacenar el puerto designado o en su defecto 3000
const port = process.env.PORT || 3000;

//Conexion en consola por en numero de puerto
app.listen(port,()=>{
     console.log(`escuchando en el puerto ${port}...`);
});

function existeUsuario(id){
     return(usuarios.find(u => u.id=== parseInt(id)));
};

function validarUsuario(nom){
     //Validar si el dato es correcto
     const schema = Joi.object({
          nombre: Joi.string().min(3).required()
     });
     return (schema.validate({nombre:nom}));
}
























