//onst socket = io();
////////////nuevo producto/////////////////
cargarProductos();

buscarMensajes();

async function cargarProductos() {
    const plantilla = await buscarPlantilla()
    const productos = await buscarProductos()
    const html = armarHTML(plantilla, productos)
    document.getElementById('productos').innerHTML = html
}

function buscarMensajes() {
    return fetch('/api/mensajes')
        .then(response => response.json())
        .then(data => console.log(data));
}

function buscarProductos() {
    return fetch('/api/productos-test')
        .then(response => response.json())
        .then(data => {
            return data.productos;
        });
}

//---------------------------------------


function buscarPlantilla() {
    return fetch('/plantillas/producto.html')
        .then(respuesta => respuesta.text())
}

function armarHTML(plantilla, productos) {
    const render = ejs.compile(plantilla);
    const html = render({ productos })
    return html
}


/////////CHAT////////
function addMessage(e) {
    const mensaje = {
        author: {
            id: document.getElementById('id').value,
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            edad: document.getElementById('edad').value,
            alias: document.getElementById('alias').value,
            avatar: document.getElementById('avatar').value 
        },
        text: document.getElementById('text').value
    }
    socket.emit('nuevoMensaje', mensaje);
    return false;
}

function HTML(mensajes) {
    return mensajes.map((elem, index) => {
        return (`<div>
            <strong class="azul">${elem.id}</strong>:
            <strong  class="verde">${elem.author.nombre}</strong>:
            <em>${elem.text}</em>
            <img width="50px" height="50px" src="${elem.author.avatar}" alt="avatar"/> </div>`)
    }).join(" ")
}

function renderMensajes(mensajes) {
    const html = HTML(mensajes)
    document.getElementById('mensajes').innerHTML = html;
}

function addSize(normSize, denormSize) {

    document.getElementById('porc').innerHTML = `<div>
        <strong>Tamaño denormalizado ${denormSize}</strong>:
        <strong>Tamaño normalizado ${normSize}</strong>:
    </div>`;

}

// socket.on('contadorActualizado', contador => {
//     console.log(contador);

//     document.getElementById('contador').innerHTML = `contador: ${contador}`;

// })

socket.on('mensajes', mensajes => {
    console.log('mensajes...', mensajes);

    const user = new normalizr.schema.Entity('users', {}, {
        idAttribute: 'id'
    });

    const text = new normalizr.schema.Entity('texts', {
        commenter: user
    })

    const mensajeSchema = new normalizr.schema.Entity('mensajes', {
        author: user,
        texts: [text] 
    }, {
        idAttribute: 'id'
    });

    const mensajesDenormalizados = normalizr.denormalize(mensajes.result, [mensajeSchema], mensajes.entities);
    
    console.log('denormalizado: ', mensajesDenormalizados);

    addSize(JSON.stringify(mensajes).length, JSON.stringify(mensajesDenormalizados).length)

    renderMensajes(mensajesDenormalizados)
});
