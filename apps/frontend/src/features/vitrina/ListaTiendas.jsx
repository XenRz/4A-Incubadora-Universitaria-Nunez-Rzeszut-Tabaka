import { useEffect, useState } from 'react'
import { api } from '../../shared/api-client/api.js'
import FilaTienda from './FilaTienda.jsx'

function ListaTiendas() {
  const [tiendas, setTiendas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/tiendas')
      .then(setTiendas)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <p>Cargando tiendas...</p>
  if (error) return <p role="alert">No se pudieron cargar las tiendas: {error}</p>

  return (
    <section>
      <h2>Tiendas</h2>
      <ul className="tiendas">
        {tiendas.map((tienda) => (
          <FilaTienda key={tienda.id} tienda={tienda} />
        ))}
      </ul>
    </section>
  )
}

export default ListaTiendas