import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaCashRegister, FaPlay, FaStop, FaChartBar, FaCalendar, FaClock, FaUser, FaMoneyBillWave } from 'react-icons/fa';

const CajasManager = () => {
  const [cajas, setCajas] = useState([]);
  const [cajaActual, setCajaActual] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [resumen, setResumen] = useState(null);
  const [showAbrirCaja, setShowAbrirCaja] = useState(false);
  const [showCerrarCaja, setShowCerrarCaja] = useState(false);
  const [formData, setFormData] = useState({
    turno: 'mañana',
    montoApertura: 0,
    montoCierre: 0,
    observaciones: ''
  });

  const API_BASE = 'https://writings-contrary-los-scored.trycloudflare.com/api';

  // Función para obtener token de Firebase
  const getFirebaseToken = async () => {
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }
      
      return await user.getIdToken();
    } catch (error) {
      console.error('Error obteniendo token:', error);
      throw error;
    }
  };

  // Cargar cajas
  const cargarCajas = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE}/cajas?fecha=${selectedDate}`);

      if (response.ok) {
        const data = await response.json();
        setCajas(data.cajas);
      }
    } catch (error) {
      console.error('Error cargando cajas:', error);
      toast.error('Error cargando cajas');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar caja actual
  const cargarCajaActual = async () => {
    try {
      const response = await fetch(`${API_BASE}/cajas/actual?turno=${formData.turno}`);

      if (response.ok) {
        const data = await response.json();
        setCajaActual(data.caja);
      }
    } catch (error) {
      console.error('Error cargando caja actual:', error);
    }
  };

  // Cargar resumen
  const cargarResumen = async () => {
    try {
      const response = await fetch(`${API_BASE}/cajas/resumen/${selectedDate}`);

      if (response.ok) {
        const data = await response.json();
        setResumen(data.resumen);
      }
    } catch (error) {
      console.error('Error cargando resumen:', error);
    }
  };

  // Abrir caja
  const abrirCaja = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE}/cajas/abrir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          turno: formData.turno,
          montoApertura: parseFloat(formData.montoApertura)
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Caja abierta exitosamente');
        setShowAbrirCaja(false);
        setFormData({ turno: 'mañana', montoApertura: 0, montoCierre: 0, observaciones: '' });
        await cargarCajas();
        await cargarCajaActual();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error abriendo caja');
      }
    } catch (error) {
      console.error('Error abriendo caja:', error);
      toast.error('Error abriendo caja');
    } finally {
      setIsLoading(false);
    }
  };

  // Cerrar caja
  const cerrarCaja = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE}/cajas/cerrar/${cajaActual._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          montoCierre: parseFloat(formData.montoCierre),
          observaciones: formData.observaciones
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Caja cerrada exitosamente');
        setShowCerrarCaja(false);
        setFormData({ turno: 'mañana', montoApertura: 0, montoCierre: 0, observaciones: '' });
        await cargarCajas();
        await cargarCajaActual();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error cerrando caja');
      }
    } catch (error) {
      console.error('Error cerrando caja:', error);
      toast.error('Error cerrando caja');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarCajas();
    cargarResumen();
  }, [selectedDate]);

  useEffect(() => {
    cargarCajaActual();
  }, [formData.turno]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FaCashRegister className="text-green-600 text-2xl mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Cajas</h2>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Caja Actual */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Caja Actual</h3>
          {cajaActual ? (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Turno: <span className="font-semibold text-green-700">{cajaActual.turno}</span></p>
                  <p className="text-sm text-gray-600">Apertura: <span className="font-semibold">${cajaActual.apertura.monto}</span></p>
                  <p className="text-sm text-gray-600">Ventas: <span className="font-semibold text-green-600">${cajaActual.ventas.total}</span></p>
                </div>
                <button
                  onClick={() => setShowCerrarCaja(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <FaStop className="mr-2" />
                  Cerrar Caja
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">No hay caja abierta para el turno: <span className="font-semibold">{formData.turno}</span></p>
                </div>
                <button
                  onClick={() => setShowAbrirCaja(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <FaPlay className="mr-2" />
                  Abrir Caja
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resumen del Día */}
        {resumen && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Resumen del Día</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaMoneyBillWave className="text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Total Ventas</p>
                    <p className="text-xl font-bold text-blue-600">${resumen.totalVentas}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaCashRegister className="text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Efectivo</p>
                    <p className="text-xl font-bold text-green-600">${resumen.totalEfectivo}</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaChartBar className="text-purple-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Tarjeta</p>
                    <p className="text-xl font-bold text-purple-600">${resumen.totalTarjeta}</p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaMoneyBillWave className="text-orange-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Transferencia</p>
                    <p className="text-xl font-bold text-orange-600">${resumen.totalTransferencia}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cajas del Día */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Cajas del Día</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cajas.map((caja) => (
              <div key={caja._id} className={`p-4 rounded-lg border ${
                caja.estado === 'abierta' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">Turno {caja.turno}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    caja.estado === 'abierta' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {caja.estado}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Apertura:</span> ${caja.apertura.monto}</p>
                  {caja.cierre && (
                    <>
                      <p><span className="font-medium">Cierre:</span> ${caja.cierre.monto}</p>
                      <p><span className="font-medium">Diferencia:</span> ${caja.cierre.diferencia}</p>
                    </>
                  )}
                  <p><span className="font-medium">Ventas:</span> ${caja.ventas.total}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Abrir Caja */}
        {showAbrirCaja && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-semibold mb-4">Abrir Caja</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
                  <select
                    value={formData.turno}
                    onChange={(e) => setFormData({...formData, turno: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="mañana">Mañana</option>
                    <option value="tarde">Tarde</option>
                    <option value="noche">Noche</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto de Apertura</label>
                  <input
                    type="number"
                    value={formData.montoApertura}
                    onChange={(e) => setFormData({...formData, montoApertura: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowAbrirCaja(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={abrirCaja}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                >
                  {isLoading ? 'Abriendo...' : 'Abrir Caja'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Cerrar Caja */}
        {showCerrarCaja && cajaActual && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-semibold mb-4">Cerrar Caja</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto de Cierre</label>
                  <input
                    type="number"
                    value={formData.montoCierre}
                    onChange={(e) => setFormData({...formData, montoCierre: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows="3"
                    placeholder="Observaciones opcionales..."
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowCerrarCaja(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={cerrarCaja}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                >
                  {isLoading ? 'Cerrando...' : 'Cerrar Caja'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CajasManager;
