const GATEWAY = 'http://localhost:8000/v1';   

function errorApi(status, titulo, detalle){
    const error = new Error(detalle || titulo || `Error ${status}`);
    error.status = status;
    return error;
}

async function request(method, path, body) {
    const headers = {Accept: 'application/json'}; // esta const es para que el fetch sepa que va a recibir y enviar json
    const token = sessionStorage.getItem('access_token'); // obtenemos el token del sessionStorage
    if (token) headers.Authorization = `Bearer ${token}`; // si hay token, lo agregamos a los headers
    if (body !==undefined) headers['Content-Type'] = 'application/json'; // si hay body, agregamos el header de content-type
    let res;

    try {
        res = await fetch(`${GATEWAY}${path}`, {method, headers, body: body !== undefined ? JSON.stringify(body) : undefined});
    } catch (error) {
        throw errorApi(0, 'Sin conexión', 'No se pudo conectar con el servidor');
    }

    if (res.status === 401) sessionStorage.removeItem('access_token'); // si el status es 401, eliminamos el token del sessionStorage

    const texto = await res.text(); // obtenemos el texto de la respuesta

    const data = texto ? JSON.parse(texto) : {}; // si hay texto, lo parseamos a json, sino, data es un objeto vacio

    if (!res.ok) throw errorApi(res.status, data.title, data.detail); // si la respuesta no es ok, lanzamos un error con el status y el mensaje de error

    return data; // si todo esta bien, retornamos los datos
}


export const api = {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    delete: (path) => request('DELETE', path),
}