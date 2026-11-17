import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../shared/api-client/api.js'

const formatoPrecio = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })

function VistaTienda() {
  const { id } = useParams()
  const [resultado, setResultado] = useState({ id: null, productos: [], error: null })

  useEffect(() => {
    let cancelado = false

    api.get(`/tiendas/${id}/productos`)
      .then((datos) => { if (!cancelado) setResultado({ id, productos: datos, error: null }) })
      .catch((e) => { if (!cancelado) setResultado({ id, productos: [], error: e }) })

    return () => { cancelado = true }
  }, [id])

  const cargando = resultado.id !== id
  const { productos, error } = resultado

  if (cargando) return <p>Cargando productos...</p>

  if (error) {
    return (
      <section>
        <Link to="/">← Volver a las tiendas</Link>
        <p>{error.status === 404 ? 'La tienda no existe.' : `No se pudieron cargar los productos: ${error.message}`}</p>
      </section>
    )
  }

  const nombreTienda = productos[0]?.tiendaNombre ?? `Tienda ${id}`

  return (
    <section>
      <Link to="/">← Volver a las tiendas</Link>
      <h2>{nombreTienda}</h2>

      {productos.length === 0
        ? <p>Esta tienda todavía no tiene productos.</p>
        : (
          <ul>
            {productos.map((producto) => (
              <li key={producto.id}>
                {producto.nombre} — {formatoPrecio.format(producto.precio)} (stock: {producto.stock})
              </li>
            ))}
          </ul>
        )}
    </section>
  )
}

export default VistaTienda