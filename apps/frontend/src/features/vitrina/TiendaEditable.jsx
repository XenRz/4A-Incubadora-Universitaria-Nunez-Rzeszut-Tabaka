import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../shared/api-client/api.js'
import CargaProducto from './CargaProducto.jsx'
import FilaProducto from './FilaProducto.jsx'

function TiendaEditable() {
  const [estado, setEstado] = useState({ cargando: true, tienda: null, productos: [], error: null })
  const [mostrarForm, setMostrarForm] = useState(false)
  const [aviso, setAviso] = useState(null)
  const [version, setVersion] = useState(0) // al incrementarlo se vuelven a pedir los datos

  useEffect(() => {
    let cancelado = false

    api.get('/mi-tienda')
      .then(async (tienda) => {
        const productos = await api.get(`/tiendas/${tienda.id}/productos`)
        if (!cancelado) setEstado({ cargando: false, tienda, productos, error: null })
      })
      .catch((e) => { if (!cancelado) setEstado({ cargando: false, tienda: null, productos: [], error: e }) })

    return () => { cancelado = true }
  }, [version])

  const { cargando, tienda, productos, error } = estado

  if (cargando) return <p>Cargando tu tienda...</p>

  if (error) {
    return (
      <section>
        <Link to="/">← Volver a las tiendas</Link>
        <p role="alert">
          {error.status === 404 ? 'No tenés una tienda asignada.' : `No se pudo cargar tu tienda: ${error.message}`}
        </p>
      </section>
    )
  }

  return (
    <section>
      <Link to="/">← Volver a las tiendas</Link>
      <h2>{tienda.nombre}</h2>

      <div className="acciones">
        <button
          className={mostrarForm ? 'secundario' : ''}
          onClick={() => {
            setAviso(null)
            setMostrarForm((v) => !v)
          }}
        >
          {mostrarForm ? 'Cancelar' : 'Agregar producto'}
        </button>
      </div>

      {mostrarForm && (
        <div className="acciones">
          <CargaProducto
            tiendaId={tienda.id}
            onCreado={(producto) => {
              setVersion((v) => v + 1)
              setMostrarForm(false)
              setAviso(`Producto «${producto.nombre}» creado.`)
            }}
          />
        </div>
      )}

      {aviso && <p role="status" className="acciones">{aviso}</p>}

      {productos.length === 0
        ? <p>Todavía no cargaste productos.</p>
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

export default TiendaEditable