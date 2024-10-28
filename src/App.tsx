import React, { useState, useEffect } from 'react';
import './CondicionAtmosferica.css';

const CondicionAtmosferica = () => {
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paginaActual, setPaginaActual] = useState(1); // Página actual para la paginación
  const [totalPaginas, setTotalPaginas] = useState(99999); // Total de páginas disponibles

  const estados = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 
    'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 
    'Jalisco', 'Mexico', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 
    'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 
    'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
  ];

  const obtenerDatosPorEstado = async (estado) => {
    try {
      setLoading(true);
      setError('');
      let pagina = 1;
      let encontrado = false;
      let datosEncontrados = [];

      // Hacemos peticiones a las páginas hasta que encontremos el estado seleccionado
      while (!encontrado) {
        const respuesta = await fetch(`https://api.datos.gob.mx/v1/condiciones-atmosfericas?page=${pagina}`);
        const data = await respuesta.json();

        if (data && data.results) {
          // Buscar si el estado está en la página actual
          const resultados = data.results.filter(ciudad => ciudad.state === estado);

          if (resultados.length > 0) {
            datosEncontrados = resultados;  // Guardamos los resultados
            encontrado = true;  // Salimos del loop
          }
        }

        // Si no encontramos el estado en la página actual, aumentamos la página
        if (!encontrado) {
          pagina++;
          if (pagina > data.pagination.totalPages) {
            break;  // Si llegamos a la última página y no encontramos el estado, terminamos
          }
        }
      }

      if (datosEncontrados.length > 0) {
        setDatos(datosEncontrados);  // Guardamos los datos filtrados
        setTotalPaginas(pagina);     // Establecemos la página actual
      } else {
        setError('No se encontraron datos para el estado seleccionado.');
      }
    } catch (err) {
      setError('Error al obtener los datos de la API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (estadoSeleccionado) {
      obtenerDatosPorEstado(estadoSeleccionado);  // Llamamos a la función para obtener datos cuando se selecciona un estado
    } else {
      setDatos([]);  // Si no se selecciona ningún estado, limpiamos los datos
    }
  }, [estadoSeleccionado]);  // Solo se ejecuta cuando cambia el estado seleccionado

  return (
    <div className="contenedor">
      <h1>Estado del Tiempo en México</h1>

      <label htmlFor="estado">Selecciona un estado:</label>
      <select
        id="estado"
        value={estadoSeleccionado}
        onChange={(e) => setEstadoSeleccionado(e.target.value)}
      >
        <option value="">-- Selecciona un estado --</option>
        {estados.map((estado, index) => (
          <option key={index} value={estado}>
            {estado}
          </option>
        ))}
      </select>

      {estadoSeleccionado && (
        <>
          <h2>Estado seleccionado: {estadoSeleccionado}</h2>
          <h3>Estado del Tiempo</h3>

          {loading ? (
            <p>Cargando...</p>
          ) : error ? (
            <p>{error}</p>
          ) : datos.length > 0 ? (
            datos.map((ciudad, index) => (
              <div key={index} className="ciudad">
                <p><strong>{ciudad.name}</strong> - <i>{ciudad.skydescriptionlong || "Sin descripción"}</i></p>
                <p>Temperatura: {ciudad.temp || "No disponible"} °C</p>
                <p>Probabilidad de precipitación: {ciudad.probabilityofprecip || "No disponible"}%</p>
                <p>Humedad relativa: {ciudad.relativehumidity || "No disponible"}%</p>
                <p>Dirección del viento: {ciudad.winddirectioncardinal || "No disponible"}</p>
                <p>Velocidad del viento: {ciudad.windspeed || "No disponible"} km/h</p>
              </div>
            ))
          ) : (
            <p>No se encontraron datos para el estado seleccionado.</p>
          )}
        </>
      )}

      {datos.length > 0 && (
        <div className="paginacion">
          <span>Página {paginaActual} de {totalPaginas}</span>
        </div>
      )}
    </div>
  );
};

export default CondicionAtmosferica;
