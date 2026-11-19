import { api } from '../../shared/api-client/api.js'

export async function mostrarTiendas(contenedor) {
    contenedor.textContent = 'Cargando tiendas...'
    try {
        const tiendas = await api.get('/tiendas');
        contenedor.textContent = '';
        const lista = document.createElement('ul');
        for (const tienda of tiendas) {
            const item = document.createElement('li');
            item.textContent = tienda.nombre;
            lista.appendChild(item);
        } 
        contenedor.appendChild(lista);
    } catch (error) {
        contenedor.textContent = 'Hubo un error al cargar las tiendas: ' + error.message;
    }
}