import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../shared/api-client/api.js'

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
  if (error) return <p>No se pudieron cargar las tiendas: {error}</p>

  return (
    <section>
      <h2>Tiendas</h2>
      <ul>
        {tiendas.map((tienda) => (
          <li key={tienda.id}>
            <Link to={`/tiendas/${tienda.id}`}>{tienda.nombre}</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ListaTiendas