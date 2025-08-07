const legacySync = require('../services/legacySync');

async function autoSync() {
  console.log('🤖 Iniciando sincronización automática...');
  const startTime = new Date();
  
  try {
    const results = await legacySync.syncAll();
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    
    console.log('✅ Sincronización automática completada:');
    console.log(`   - Productos: ${results.products.synced} nuevos, ${results.products.updated} actualizados`);
    console.log(`   - Ventas: ${results.sales.synced} nuevas`);
    console.log(`   - Clientes: ${results.clients.synced} nuevos`);
    console.log(`   - Duración: ${duration} segundos`);
    console.log(`   - Fecha: ${endTime.toLocaleString()}`);
    
    // Aquí podrías agregar notificaciones por email o WhatsApp
    // await sendNotification('Sincronización completada', results);
    
  } catch (error) {
    console.error('❌ Error en sincronización automática:', error);
    // Aquí podrías agregar notificaciones de error
    // await sendErrorNotification(error);
  }
}

// Si se ejecuta directamente (no como módulo)
if (require.main === module) {
  autoSync().then(() => {
    console.log('🏁 Script de sincronización finalizado');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { autoSync };
