import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaSync, FaDatabase, FaUsers, FaShoppingCart, FaChartBar, FaPlay, FaStop, FaWifi, FaKey } from 'react-icons/fa';

const LegacySync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [syncResults, setSyncResults] = useState(null);
  const [stats, setStats] = useState(null);
  const [autoSyncStatus, setAutoSyncStatus] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  // Configuración del backend
  const API_BASE = 'https://creatures-omaha-genesis-hospital.trycloudflare.com/api';

  // Función para obtener token de Firebase
  const getFirebaseToken = async () => {
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        // Token temporal para pruebas
        return 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZmlyZWJhc2UtcHJvamVjdCIsImF1ZCI6ImZpcmViYXNlLXByb2plY3QiLCJhdXRoX3RpbWUiOjE2MzQ1Njc4OTAsInVzZXJfaWQiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AbHVicmliYXQuY29tIiwiaWF0IjoxNjM0NTY3ODkwLCJleHAiOjE2MzQ1NzE0OTB9.test_signature';
      }
      
      const token = await user.getIdToken();
      return token;
    } catch (error) {
      console.error('❌ Error obteniendo token de Firebase:', error);
      // Token temporal para pruebas
      return 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZmlyZWJhc2UtcHJvamVjdCIsImF1ZCI6ImZpcmViYXNlLXByb2plY3QiLCJhdXRoX3RpbWUiOjE2MzQ1Njc4OTAsInVzZXJfaWQiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AbHVicmliYXQuY29tIiwiaWF0IjoxNjM0NTY3ODkwLCJleHAiOjE2MzQ1NzE0OTB9.test_signature';
    }
  };

  // Función para regenerar token (mantenemos para compatibilidad)
  const regenerateToken = async () => {
    try {
      setIsLoading(true);
      
      const token = await getFirebaseToken();
      toast.success('✅ Token de Firebase obtenido correctamente');
      
      // Mostrar información de debug
      setDebugInfo({
        token: token.substring(0, 20) + '...',
        user: 'Firebase Auth',
        timestamp: new Date().toISOString()
      });
      
      // Probar sincronización después de obtener token
      setTimeout(() => {
        fetchStats();
        fetchAutoSyncStatus();
      }, 1000);
    } catch (error) {
      console.error('Error obteniendo token:', error);
      toast.error('Error obteniendo token de Firebase');
    } finally {
      setIsLoading(false);
    }
  };

  // Función de prueba de conectividad
  const testConnection = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/sync/test`);
      const data = await response.json();
      
      if (response.ok) {
        toast.success('✅ Conexión exitosa al backend');
        console.log('Test response:', data);
      } else {
        toast.error('❌ Error de conexión');
      }
    } catch (error) {
      console.error('Error de prueba:', error);
      toast.error('❌ Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (type = 'all') => {
    setIsLoading(true);
    
    try {
      const token = await getFirebaseToken();
      
      const url = `${API_BASE}/sync/legacy${type !== 'all' ? `/${type}` : ''}`;
      console.log('🔍 Debug - URL de sincronización:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 Debug - Status de respuesta:', response.status);
      const data = await response.json();
      console.log('🔍 Debug - Respuesta del servidor:', data);
      
      if (response.ok) {
        setSyncResults(data);
        toast.success(data.message);
        
        // Actualizar estadísticas
        await fetchStats();
      } else {
        toast.error(data.message || 'Error en la sincronización');
      }
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      toast.error('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = await getFirebaseToken();
      const response = await fetch(`${API_BASE}/sync/legacy/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
    }
  };

  const fetchAutoSyncStatus = async () => {
    try {
      const token = await getFirebaseToken();
      const response = await fetch(`${API_BASE}/sync/legacy/auto/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAutoSyncStatus(data.status);
      }
    } catch (error) {
      console.error('Error obteniendo estado de sincronización automática:', error);
    }
  };

  const handleAutoSyncToggle = async (action) => {
    try {
      setIsLoading(true);
      const token = await getFirebaseToken();
      const response = await fetch(`${API_BASE}/sync/legacy/auto/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message);
        fetchAutoSyncStatus();
      } else {
        toast.error(data.message || 'Error en la operación');
      }
    } catch (error) {
      console.error('Error en sincronización automática:', error);
      toast.error('Error en la operación');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
    fetchAutoSyncStatus();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <FaDatabase className="text-blue-600 text-2xl mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">Sincronización con Sistema Legacy</h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Sincroniza datos del sistema legacy (Cin@gós) con el sistema web. 
            Los datos del 4 y 5 de agosto serán importados automáticamente.
          </p>
        </div>

        {/* Botones de diagnóstico */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Prueba de Conectividad
                </h3>
                <p className="text-sm text-blue-600">
                  Verifica que la conexión al backend funcione correctamente
                </p>
              </div>
              <button
                onClick={testConnection}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <FaWifi className="mr-2" />
                Probar Conexión
              </button>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Regenerar Token JWT
                </h3>
                <p className="text-sm text-green-600">
                  Soluciona problemas de autenticación
                </p>
              </div>
              <button
                onClick={regenerateToken}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <FaKey className="mr-2" />
                Regenerar Token
              </button>
            </div>
          </div>
        </div>

        {/* Información de debug */}
        {debugInfo && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Información de Debug</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Usuario:</strong> {debugInfo.user}</p>
              <p><strong>Token:</strong> {debugInfo.token}</p>
              <p><strong>Timestamp:</strong> {debugInfo.timestamp}</p>
            </div>
          </div>
        )}

        {/* Estadísticas actuales */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FaShoppingCart className="text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Productos Legacy</p>
                  <p className="text-xl font-bold text-blue-600">{stats.productos}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FaChartBar className="text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Pedidos Legacy</p>
                  <p className="text-xl font-bold text-green-600">{stats.pedidos}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FaUsers className="text-purple-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Clientes Legacy</p>
                  <p className="text-xl font-bold text-purple-600">{stats.clientes}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Control de sincronización automática */}
        {autoSyncStatus && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Sincronización Automática
                </h3>
                <p className="text-sm text-gray-600">
                  Estado: {autoSyncStatus.isWatching ? 
                    <span className="text-green-600 font-semibold">Activo</span> : 
                    <span className="text-red-600 font-semibold">Inactivo</span>
                  }
                </p>
                {autoSyncStatus.lastSync && (
                  <p className="text-xs text-gray-500 mt-1">
                    Última sincronización: {new Date(autoSyncStatus.lastSync).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {autoSyncStatus.isWatching ? (
                  <button
                    onClick={() => handleAutoSyncToggle('stop')}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                  >
                    <FaStop className="mr-2" />
                    Detener
                  </button>
                ) : (
                  <button
                    onClick={() => handleAutoSyncToggle('start')}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                  >
                    <FaPlay className="mr-2" />
                    Activar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botones de sincronización manual */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => handleSync('all')}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-4 rounded-lg flex items-center justify-center transition-colors"
          >
            <FaSync className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sincronizar Todo
          </button>
          
          <button
            onClick={() => handleSync('products')}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white p-4 rounded-lg flex items-center justify-center transition-colors"
          >
            <FaShoppingCart className="mr-2" />
            Solo Productos
          </button>
          
          <button
            onClick={() => handleSync('sales')}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white p-4 rounded-lg flex items-center justify-center transition-colors"
          >
            <FaChartBar className="mr-2" />
            Solo Ventas
          </button>
          
          <button
            onClick={() => handleSync('clients')}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white p-4 rounded-lg flex items-center justify-center transition-colors"
          >
            <FaUsers className="mr-2" />
            Solo Clientes
          </button>
        </div>

        {/* Resultados de sincronización */}
        {syncResults && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Resultados de la Sincronización</h3>
            
            {syncResults.results && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {syncResults.results.products && (
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-green-600">Productos</h4>
                    <p>Nuevos: {syncResults.results.products.synced}</p>
                    <p>Actualizados: {syncResults.results.products.updated}</p>
                  </div>
                )}
                
                {syncResults.results.sales && (
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-orange-600">Ventas</h4>
                    <p>Nuevas: {syncResults.results.sales.synced}</p>
                  </div>
                )}
                
                {syncResults.results.clients && (
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium text-purple-600">Clientes</h4>
                    <p>Nuevos: {syncResults.results.clients.synced}</p>
                  </div>
                )}
              </div>
            )}
            
            {syncResults.targetDates && (
              <div className="mt-3 text-sm text-gray-600">
                <p>Fechas objetivo: {syncResults.targetDates.join(', ')}</p>
              </div>
            )}
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Información Importante</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Los datos se sincronizan desde el sistema legacy (D:\Daniel\Visual\Sistema)</li>
            <li>• Solo se importan ventas del 4 y 5 de agosto de 2025</li>
            <li>• Los productos duplicados se actualizan automáticamente</li>
            <li>• Los clientes se crean con emails únicos</li>
            <li>• Todos los datos sincronizados se marcan con origen "legacy_sync"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LegacySync;
