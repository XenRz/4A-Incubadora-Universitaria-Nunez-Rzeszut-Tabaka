import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../shared/api-client/api.js'
import CargaProducto from './CargaProducto.jsx'
import { esDueno } from '../../shared/utils/token.js'
import FilaProducto from './FilaProducto.jsx'

const formatoPrecio = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })

function VistaTienda() {
  const { id } = useParams()
  const [resultado, setResultado] = useState({ id: null, tienda: null, productos: [], error: null })
  const [mostrarForm, setMostrarForm] = useState(false)
  const [version, setVersion] = useState(0) // al incrementarlo se vuelven a pedir los datos

  useEffect(() => {
    let cancelado = false

    Promise.all([
      api.get(`/tiendas/${id}`),
      api.get(`/tiendas/${id}/productos`),
    ])
      .then(([tienda, productos]) => { if (!cancelado) setResultado({ id, tienda, productos, error: null }) })
      .catch((e) => { if (!cancelado) setResultado({ id, tienda: null, productos: [], error: e }) })

    return () => { cancelado = true }
  }, [id, version])

  const cargando = resultado.id !== id
  const { tienda, productos, error } = resultado

  if (cargando) return <p>Cargando productos...</p>

  if (error) {
    return (
      <section>
        <Link to="/">← Volver a las tiendas</Link>
        <p>{error.status === 404 ? 'La tienda no existe.' : `No se pudieron cargar los productos: ${error.message}`}</p>
      </section>
    )
  }

  const puedeAgregar = esDueno()

  return (
    <section>
      <Link to="/">← Volver a las tiendas</Link>
      <h2>{tienda.nombre}</h2>

      {puedeAgregar && (
        <>
          <div className="acciones">
            <button
              className={mostrarForm ? 'secundario' : ''}
              onClick={() => setMostrarForm((v) => !v)}
            >
              {mostrarForm ? 'Cancelar' : 'Agregar producto'}
            </button>
          </div>

          {mostrarForm && (
            <div className="acciones">
              <CargaProducto
                tiendaId={id}
                onCreado={() => setVersion((v) => v + 1)}
              />
            </div>
          )}
        </>
      )}

  {productos.length === 0
        ? <p>Esta tienda todavía no tiene productos.</p>
        : (
          <ul className="productos">
            {productos.map((producto) => (
              <FilaProducto key={producto.id} producto={producto} />
            ))}
          </ul>
        )}
    </section>
  )
}

export default VistaTienda