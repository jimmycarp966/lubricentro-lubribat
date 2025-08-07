const mongoose = require('mongoose');
const legacySync = require('./services/legacySync');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/lubricentro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error conectando a MongoDB:', err));

async function testSync() {
  console.log('🧪 Probando sincronización de datos legacy...\n');
  
  try {
    // Probar sincronización de productos
    console.log('📦 Sincronizando productos...');
    const productResults = await legacySync.syncProducts();
    console.log('✅ Productos:', productResults);
    
    // Probar sincronización de clientes
    console.log('\n👥 Sincronizando clientes...');
    const clientResults = await legacySync.syncClients();
    console.log('✅ Clientes:', clientResults);
    
    // Probar sincronización de ventas
    console.log('\n💰 Sincronizando ventas del 4 y 5 de agosto...');
    const salesResults = await legacySync.syncSales();
    console.log('✅ Ventas:', salesResults);
    
    // Obtener estadísticas
    console.log('\n📊 Estadísticas de sincronización:');
    const stats = await legacySync.getSyncStats();
    console.log('✅ Estadísticas:', stats);
    
    console.log('\n🎯 Prueba de sincronización completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en la sincronización:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Ejecutar prueba
testSync();
