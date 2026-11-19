import { Routes, Route, Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import ListaTiendas from '../features/vitrina/ListaTiendas.jsx'
import VistaTienda from '../features/vitrina/VistaTienda.jsx'
import TiendaEditable from '../features/vitrina/TiendaEditable.jsx'
import { login } from '../features/autenticacion/login.js'
import { logout } from '../features/autenticacion/logout.js'
import { handleCallback } from '../features/autenticacion/callback.js'
import { esDueno } from '../shared/utils/token.js'

import './App.css'

function App() {
  const [logueado, setLogueado] = useState(false)
  const [error, setError] = useState(null)
  const callbackProcesado = useRef(false)

  useEffect(() => {
    if (callbackProcesado.current) return
    callbackProcesado.current = true

    handleCallback()
      .then(() => setLogueado(Boolean(sessionStorage.getItem('access_token'))))
      .catch((e) => setError(e.message))
  }, [])

  return (
    <main>
      <header className="cabecera">
        <h1>Incubadora Universitaria 4A</h1>
        <div className="sesion">
          {logueado && esDueno() && <Link to="/mi-tienda">Editar mi tienda</Link>}
          {logueado
            ? <button className="secundario" onClick={logout}>Cerrar sesión</button>
            : <button onClick={login}>Iniciar sesión</button>}
        </div>
      </header>

      {error && <p role="alert">Error: {error}</p>}

      <Routes>
        <Route path="/" element={<ListaTiendas />} />
        <Route path="/tiendas/:id" element={<VistaTienda />} />
        <Route path="/mi-tienda" element={<TiendaEditable />} />
      </Routes>
    </main>
  )
}

export default App