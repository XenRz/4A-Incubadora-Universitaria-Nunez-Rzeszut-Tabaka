/* estas 3 constantes son necesarias para la auth con Keycloak */
const KEYCLOAK = 'http://localhost:8180/realms/incubadora-universitaria';
const CLIENT_ID = 'web-incubadora';
const REDIRECT_URI = 'http://localhost:3000/';


export async function handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) {
        return false; // No hay codigo de auth en la URL
    }

    const stateRecibido = params.get('state');
    const stateAlmacenado = sessionStorage.getItem('pkce_state');
    const codeVerifier = sessionStorage.getItem('pkce_verifier');

    if (stateRecibido !== stateAlmacenado || !codeVerifier) {
        throw new Error('Login invalido: el estado recibido no coinicide');
    }

    const respuesta = await fetch(`${KEYCLOAK}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            code: code,
            code_verifier: codeVerifier
        })
    })

    if (!respuesta.ok) {
        throw new Error('Error al obtener el token de acceso');
    }

    const {access_token} = await respuesta.json();
    sessionStorage.setItem('access_token', access_token);
    sessionStorage.removeItem('pkce_state');
    sessionStorage.removeItem('pkce_verifier');

    window.history.replaceState({}, "", REDIRECT_URI); // Limpiar la URL de la barra de direcciones

    return true; // Login exitoso
}