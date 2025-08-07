const fs = require('fs');
const path = require('path');
const legacySync = require('./legacySync');

class FileWatcher {
  constructor() {
    this.legacyPath = 'D:\\Daniel\\Visual\\Sistema';
    this.watchedFiles = ['FACTURA.DBF', 'ARTICULO.DBF', 'CLIENTES.DBF'];
    this.lastSync = new Date();
    this.isWatching = false;
    this.syncCooldown = 30000; // 30 segundos entre sincronizaciones
  }

  startWatching() {
    if (this.isWatching) {
      console.log('👁️ El monitoreo ya está activo');
      return;
    }

    console.log('👁️ Iniciando monitoreo de archivos legacy...');
    this.isWatching = true;

    this.watchedFiles.forEach(fileName => {
      const filePath = path.join(this.legacyPath, fileName);
      
      try {
        // Verificar si el archivo existe
        if (fs.existsSync(filePath)) {
          console.log(`📁 Monitoreando: ${fileName}`);
          
          // Monitorear cambios en el archivo
          fs.watch(filePath, (eventType, filename) => {
            if (eventType === 'change') {
              console.log(`🔄 Cambio detectado en: ${filename}`);
              this.debouncedSync();
            }
          });
        } else {
          console.log(`⚠️ Archivo no encontrado: ${fileName}`);
        }
      } catch (error) {
        console.error(`❌ Error monitoreando ${fileName}:`, error);
      }
    });

    console.log('✅ Monitoreo iniciado. Los cambios se sincronizarán automáticamente.');
  }

  stopWatching() {
    this.isWatching = false;
    console.log('⏹️ Monitoreo detenido');
  }

  debouncedSync() {
    const now = new Date();
    const timeSinceLastSync = now - this.lastSync;
    
    if (timeSinceLastSync < this.syncCooldown) {
      console.log(`⏳ Esperando ${Math.ceil((this.syncCooldown - timeSinceLastSync) / 1000)}s antes de sincronizar...`);
      return;
    }

    this.lastSync = now;
    this.performSync();
  }

  async performSync() {
    console.log('🔄 Sincronización automática iniciada por cambio de archivo...');
    
    try {
      const results = await legacySync.syncAll();
      console.log('✅ Sincronización automática completada:', results);
      
      // Aquí podrías agregar notificaciones
      // await sendNotification('Sincronización automática completada', results);
      
    } catch (error) {
      console.error('❌ Error en sincronización automática:', error);
      // await sendErrorNotification(error);
    }
  }

  getStatus() {
    return {
      isWatching: this.isWatching,
      watchedFiles: this.watchedFiles,
      lastSync: this.lastSync,
      syncCooldown: this.syncCooldown
    };
  }
}

module.exports = new FileWatcher();
