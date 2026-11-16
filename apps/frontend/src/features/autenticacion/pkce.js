function base64URLEncode(bytes) { /* esta funcion permite codificar un array de bytes en una cadena base64  */
    return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

export function generarCodeVerifier() { /* esta funcion genera un code verifier aleatorio de 128 bytes y lo codifica en base64url */
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return base64URLEncode(array);
}

export async function calculateCodeChallenge(codeVerifier) { /* esta funcion calcula el code challenge a partir del code verifier usando SHA-256 y lo codifica en base64url */
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    return base64URLEncode(new Uint8Array(hash));
}