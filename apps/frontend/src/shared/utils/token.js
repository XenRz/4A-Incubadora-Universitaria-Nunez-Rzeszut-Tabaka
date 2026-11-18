export function esDueno() {
  try {
    const token = sessionStorage.getItem('access_token');
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    return payload.realm_access?.roles?.includes('dueno') ?? false;
  } catch {
    return false;
  }
}