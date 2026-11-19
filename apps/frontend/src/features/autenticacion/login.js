import {generarCodeVerifier, calculateCodeChallenge} from './pkce.js';

const KEYCLOAK = 'http://localhost:8180/realms/incubadora-universitaria';
const CLIENT_ID = 'web-incubadora';
const REDIRECT_URI = 'http://localhost:3000/';

export async function login() {
    const codeVerifier = generarCodeVerifier();
    const codeChallenge = await calculateCodeChallenge(codeVerifier);
    const state = generarCodeVerifier(); // Generar un estado aleatorio para proteger contra ataques CSRF

    sessionStorage.setItem('pkce_verifier', codeVerifier);
    sessionStorage.setItem('pkce_state', state);

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: 'openid profile',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state: state
    });
    window.location.href = `${KEYCLOAK}/protocol/openid-connect/auth?${params}`;
}