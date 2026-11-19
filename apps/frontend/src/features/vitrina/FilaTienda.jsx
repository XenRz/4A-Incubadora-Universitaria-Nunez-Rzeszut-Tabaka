import { Link } from 'react-router-dom'

function FilaTienda({ tienda }) {
  return (
    <li>
      <Link to={`/tiendas/${tienda.id}`}>
        <span>{tienda.nombre}</span>
        <span className="flecha" aria-hidden="true">→</span>
      </Link>
    </li>
  )
}

export default FilaTienda