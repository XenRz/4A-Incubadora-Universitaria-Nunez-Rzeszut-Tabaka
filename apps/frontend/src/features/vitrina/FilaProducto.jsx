const formatoPrecio = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })

function FilaProducto({ producto }) {
  const sinStock = producto.stock === 0

  return (
    <li>
      <div>
        <strong>{producto.nombre}</strong>
        <span className={sinStock ? 'stock sin-stock' : 'stock'}>
          {sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
        </span>
      </div>
      <span className="precio">{formatoPrecio.format(producto.precio)}</span>
    </li>
  )
}

export default FilaProducto