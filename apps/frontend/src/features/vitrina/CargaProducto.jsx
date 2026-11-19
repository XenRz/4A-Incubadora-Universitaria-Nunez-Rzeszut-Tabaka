import { useState } from 'react';
import { api } from '../../shared/api-client/api.js';
import { esDueno } from '../../shared/utils/token.js';
import { login } from '../autenticacion/login.js';

const FORM_INICIAL = { nombre: '', precio: '', stock: '' };

function validar({ nombre, precio, stock }) {
  const errores = {};
  if (!nombre.trim()) errores.nombre = 'El nombre es obligatorio.';
  const p = Number(precio);
  if (precio === '' || Number.isNaN(p) || p <= 0) {
    errores.precio = 'El precio debe ser mayor a 0.';
  }
  const s = Number(stock);
  if (stock === '' || !Number.isInteger(s) || s < 0) {
    errores.stock = 'El stock debe ser un entero mayor o igual a 0.';
  }
  return errores;
}

export default function CargaProducto({ tiendaId, onCreado }) {
  const [form, setForm] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState(null);
  const [creado, setCreado] = useState(null);
  const [enviando, setEnviando] = useState(false);

  if (!esDueno()) return null;

  const cambiar = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrores((er) => ({ ...er, [name]: undefined }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    setErrorApi(null);
    setCreado(null);

    const errs = validar(form);
    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      return;
    }

    setEnviando(true);
    try {
      const producto = await api.post(`/tiendas/${tiendaId}/productos`, {
        nombre: form.nombre.trim(),
        precio: Number(form.precio),
        stock: Number(form.stock),
      });
      setCreado(producto);
      setForm(FORM_INICIAL);
      onCreado?.(producto);
    } catch (err) {
      if (err.status === 401) {
        // api.js ya borró el token vencido: volver a loguearse
        setErrorApi('Tu sesión venció. Redirigiendo al login…');
        login();
        return;
      }
      setErrorApi(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} noValidate style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
      <h2>Cargar producto</h2>

      <label>
        Nombre
        <input
          name="nombre"
          type="text"
          value={form.nombre}
          onChange={cambiar}
          placeholder="Mate de madera"
          aria-invalid={!!errores.nombre}
        />
        {errores.nombre && <small role="alert">{errores.nombre}</small>}
      </label>

      <label>
        Precio
        <input
          name="precio"
          type="number"
          min="0.01"
          step="0.01"
          value={form.precio}
          onChange={cambiar}
          placeholder="1500.50"
          aria-invalid={!!errores.precio}
        />
        {errores.precio && <small role="alert">{errores.precio}</small>}
      </label>

      <label>
        Stock
        <input
          name="stock"
          type="number"
          min="0"
          step="1"
          value={form.stock}
          onChange={cambiar}
          placeholder="10"
          aria-invalid={!!errores.stock}
        />
        {errores.stock && <small role="alert">{errores.stock}</small>}
      </label>

      <button type="submit" disabled={enviando}>
        {enviando ? 'Guardando…' : 'Guardar producto'}
      </button>

      {errorApi && <p role="alert" style={{ color: 'crimson' }}>{errorApi}</p>}
      {creado && (
        <p role="status" style={{ color: 'green' }}>
          Producto «{creado.nombre}» creado en {creado.tiendaNombre} (id {creado.id}).
        </p>
      )}
    </form>
  );
}