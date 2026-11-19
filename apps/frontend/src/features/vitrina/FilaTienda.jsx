import { Link } from 'react-router-dom'

function FilaTienda({ tienda }) {
  return (
    <li>
      <Link to={`/tiendas/${tienda.id}`}>{tienda.nombre}</Link>
      <span className="flecha" aria-hidden="true">→</span>
    </li>
  )
}

export default FilaTienda