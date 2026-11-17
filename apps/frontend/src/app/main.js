import {login} from '../features/autenticacion/login.js';
import {handleCallback} from '../features/autenticacion/callback.js';
import { mostrarTiendas } from '../features/vitrina/vitrina.js';
import { logout } from '../features/autenticacion/logout.js';

const btnLogin = document.getElementById('btn-login');
const btnYo = document.getElementById('btn-yo');
const btnLogout = document.getElementById('btn-logout');
const estado = document.getElementById('estado');
const resultado = document.getElementById('resultado');
import { api } from '../shared/api-client/api.js'; 

btnLogin.addEventListener('click', login);
btnLogout.addEventListener('click', logout);

btnYo.addEventListener('click', async () => {
    try {
        const datos = await api.get('/yo');
        resultado.textContent = JSON.stringify(datos, null, 2);
    } catch (error) {
        if (error.status === 401) {
            estado.textContent = 'La sesión venció. Volvé a iniciar sesión.';
            btnLogin.hidden = false;
            btnYo.hidden = true;
            resultado.textContent = '';
            return;
        }
        resultado.textContent = `${error.status}: ${error.message}`;
}
});

async function inicializar() {
    try{
        await handleCallback();
    } catch (error) {
        estado.textContent = `Error: ${error.message}`;
        return;
    }
    if (sessionStorage.getItem('access_token')) {
        estado.textContent = 'Usuario autenticado';
        btnLogin.hidden = true;
        btnYo.hidden = false;
        btnLogout.hidden = false;
    }
}

inicializar();

mostrarTiendas(document.getElementById('vitrina'));