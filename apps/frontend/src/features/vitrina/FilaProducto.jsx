import { useState } from 'react'

const formatoPrecio = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })

function FilaProducto({ producto, comprable = false }) {
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(null)
  const sinStock = producto.stock === 0

  const agregar = () => {
    setAgregado(cantidad)
    setCantidad(1)
  }

  return (
    <li>
      <div>
        <strong>{producto.nombre}</strong>
        <span className={sinStock ? 'stock sin-stock' : 'stock'}>
          {sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
        </span>
      </div>
      <span className="precio">{formatoPrecio.format(producto.precio)}</span>

      {comprable && !sinStock && (
        <div className="compra">
          {agregado && <span role="status" className="agregado">Agregaste {agregado} al carrito ✓</span>}

          <div className="cantidad">
            <button
              type="button"
              className="secundario"
              aria-label="Restar uno"
              disabled={cantidad <= 1}
              onClick={() => setCantidad((c) => c - 1)}
            >
              −
            </button>
            <span aria-live="polite">{cantidad}</span>
            <button
              type="button"
              className="secundario"
              aria-label="Sumar uno"
              disabled={cantidad >= producto.stock}
              onClick={() => setCantidad((c) => c + 1)}
            >
              +
            </button>
          </div>

          <button type="button" onClick={agregar}>Agregar al carrito</button>
        </div>
      )}
    </li>
  )
}

export default FilaProducto