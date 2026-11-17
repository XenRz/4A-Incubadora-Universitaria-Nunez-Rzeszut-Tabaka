const KEYCLOAK = 'http://localhost:8180/realms/incubadora-universitaria';
const CLIENT_ID = 'web-incubadora';
const REDIRECT_URI = 'http://localhost:3000/';

export function logout() {
    sessionStorage.removeItem('access_token');
    
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI
    });
    window.location.href = `${KEYCLOAK}/protocol/openid-connect/logout?${params.toString()}`; // el window.location.href redirige al usuario a la URL de cierre de sesión de Keycloak
}
    