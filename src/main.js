const express = require('express')
const faker = require('faker')
const { normalize, schema } = require('normalizr');
const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)


const path = require('path')
const ContenedorArchivo = require('./contenedores/ContenedorArchivo.js')//3//
const mensajesApi = new ContenedorArchivo('./DB/mensajes.txt')
app.use(express.static('public'))
app.set('views', './views')

///////////Producto///////////////////////

app.get('/mensajesEJS', async (req, res) => {
    const mensajes = await mensajesApi.listarAll()
    res.render('mensajes.ejs', { mensajes })
})

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'views/mensajes.html'))
})
// rutas de la api rest

app.get('/api/mensajes', async (req, res) => {
    const mensajes = await mensajesApi.listarAll()
    res.json(mensajes)
})

app.get('/api/productos-test', async (req, res) => {

    const productos = [];
    for (let i = 0; i < 5; i++) {
        productos.push({
            id: faker.datatype.uuid(),
            name: faker.commerce.productName(),
            price:faker.commerce.price(),
            thumbnail: faker.image.imageUrl(100, 100),
        });
    }

    res.json({ productos });
})


const mensajes = [
    {
        id: 1,
        author: {
            id: 1,
            nombre: 'Efrain',
            apellido: 'apellido del usuario',
            edad: 'edad del usuario',
            alias: 'alias del usuario',
            avatar: 'https://gravatar.com/avatar/decc54a8054cf1bec6efda1fecffcc91?s=400&d=robohash&r=x'
        },
        text: "¡Hola! ¿Que tal?"
    }
];

function normalizarMensajes(input) {
            
    const user = new schema.Entity('users');

    const text = new schema.Entity('texts');

    const mensajeSchema = new schema.Entity('mensajes', {
        author: user,
        texts: [text] 
    }, {
        idAttribute: 'id'
    });

    return normalize(input,[mensajeSchema]);
}

io.on('connection', socket => {
    console.log('Nuevo cliente conectado!')
    socket.emit('mensajes', normalizarMensajes(mensajes))
    // socket.emit('contadorActualizado', contador)
    
    socket.on('nuevoMensaje', mensaje => {
        console.log('llego nuevo mensaje.')
        console.log('mensaje.. formato => ', mensaje)
        mensaje.author.id = (mensaje.author.id);
        mensajes.push({
            id: mensajes.length > 0 ? mensajes.length+1 : 1,
            ...mensaje
        });

        console.log('mensajes array =>  ', mensajes)

        io.sockets.emit('mensajes', normalizarMensajes(mensajes))
    })
  
})

const PORT = 8080
const connectedServer = httpServer.listen(PORT, function () {
    console.log(`Servidor Http con Websockets escuchando en el puerto ${connectedServer.address().port}`)
})
connectedServer.on('error', error => console.log(`Error en servidor ${error}`) )