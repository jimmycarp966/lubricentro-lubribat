const fs = require('fs');
const path = require('path');
const dbfReader = require('./dbfReader');
const Producto = require('../models/Producto');
const Pedido = require('../models/Pedido');
const User = require('../models/User');

class LegacySyncService {
  constructor() {
    this.legacyPath = 'D:\\Daniel\\Visual\\Sistema';
    this.targetDates = ['2025-08-04', '2025-08-05'];
  }

  // Leer archivo DBF usando nuestro lector personalizado
  async readDBFFile(filePath) {
    try {
      const fileData = dbfReader.readDBFFile(filePath);
      return fileData;
    } catch (error) {
      console.error(`Error leyendo ${filePath}:`, error);
      return null;
    }
  }

  // Extraer datos de productos desde ARTICULO.DBF
  async syncProducts() {
    console.log('🔄 Sincronizando productos...');
    
    const articulosPath = path.join(this.legacyPath, 'ARTICULO.DBF');
    const fileData = await this.readDBFFile(articulosPath);
    
    if (!fileData) {
      console.log('❌ No se pudo leer ARTICULO.DBF');
      return { synced: 0, updated: 0 };
    }

    let syncedCount = 0;
    let updatedCount = 0;
    const batchSize = 100;
    const batches = [];

    // Procesar registros en lotes para mejor rendimiento
    for (let i = 0; i < fileData.records.length; i += batchSize) {
      batches.push(fileData.records.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const operations = [];
      
      for (const record of batch) {
        try {
          const productData = this.extractProductData(record);
          
          if (productData.sku) {
            operations.push({
              updateOne: {
                filter: { sku: productData.sku },
                update: { $set: productData },
                upsert: true
              }
            });
          }
        } catch (error) {
          console.error(`Error procesando producto:`, error);
        }
      }

      if (operations.length > 0) {
        try {
          const result = await Producto.bulkWrite(operations);
          syncedCount += result.upsertedCount || 0;
          updatedCount += result.modifiedCount || 0;
        } catch (error) {
          console.error('Error en operación bulk:', error);
        }
      }
    }

    console.log(`✅ Productos sincronizados: ${syncedCount} nuevos, ${updatedCount} actualizados`);
    return { synced: syncedCount, updated: updatedCount };
  }

  // Extraer datos de producto del registro DBF
  extractProductData(record) {
    const content = record.content;
    
    // Basado en la estructura que vimos en el análisis
    // Los campos están en posiciones fijas
    const productData = {
      nombre: content.substring(0, 60).trim() || 'Producto sin nombre',
      sku: content.substring(60, 66).trim() || `LEGACY-${record.index}`,
      precio: this.parseNumber(content.substring(66, 76)) || 0,
      stock: this.parseNumber(content.substring(76, 88)) || 0,
      categoria: this.mapCategory(content.substring(88, 93)),
      marca: content.substring(93, 108).trim() || 'Sin marca',
      activo: true,
      origen: 'legacy_sync'
    };

    return productData;
  }

  // Extraer datos de ventas desde FACTURA.DBF
  async syncSales() {
    console.log('🔄 Sincronizando ventas...');
    
    const facturasPath = path.join(this.legacyPath, 'FACTURA.DBF');
    const fileData = await this.readDBFFile(facturasPath);
    
    if (!fileData) {
      console.log('❌ No se pudo leer FACTURA.DBF');
      return { synced: 0 };
    }

    let syncedCount = 0;
    const targetDates = this.targetDates.map(date => new Date(date));
    const batchSize = 50;
    const batches = [];

    // Procesar registros en lotes para mejor rendimiento
    for (let i = 0; i < fileData.records.length; i += batchSize) {
      batches.push(fileData.records.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const operations = [];
      
      for (const record of batch) {
        try {
          const saleData = this.extractSaleData(record);
          
          if (saleData.fecha) {
            const fechaFactura = new Date(saleData.fecha);
            const isTargetDate = targetDates.some(targetDate => 
              fechaFactura.toDateString() === targetDate.toDateString()
            );

            if (isTargetDate) {
              const pedidoData = {
                fecha: fechaFactura,
                cliente: {
                  nombre: saleData.cliente || 'Cliente Legacy',
                  whatsapp: saleData.telefono || '',
                  email: ''
                },
                items: saleData.items || [],
                total: saleData.total || 0,
                estado: 'completado',
                metodoEntrega: 'retiro',
                origen: 'legacy_sync',
                notas: `Sincronizado desde sistema legacy - Factura: ${saleData.numero}`
              };

              operations.push({
                updateOne: {
                  filter: {
                    'origen': 'legacy_sync',
                    'notas': { $regex: saleData.numero }
                  },
                  update: { $set: pedidoData },
                  upsert: true
                }
              });
            }
          }
        } catch (error) {
          console.error(`Error procesando factura:`, error);
        }
      }

      if (operations.length > 0) {
        try {
          const result = await Pedido.bulkWrite(operations);
          syncedCount += result.upsertedCount || 0;
        } catch (error) {
          console.error('Error en operación bulk de ventas:', error);
        }
      }
    }

    console.log(`✅ Ventas sincronizadas: ${syncedCount} nuevas ventas`);
    return { synced: syncedCount };
  }

  // Extraer datos de venta del registro DBF
  extractSaleData(record) {
    const content = record.content;
    
    // Basado en la estructura de FACTURA.DBF
    const saleData = {
      fecha: this.parseDate(content.substring(0, 8)),
      punto: this.parseNumber(content.substring(8, 12)),
      codpro: this.parseNumber(content.substring(12, 17)),
      codcli: this.parseNumber(content.substring(17, 22)),
      numero: this.parseNumber(content.substring(22, 30)),
      codart: this.parseNumber(content.substring(30, 43)),
      cantidad: this.parseNumber(content.substring(43, 52)),
      precio: this.parseNumber(content.substring(52, 64)),
      importe: this.parseNumber(content.substring(64, 74)),
      detalle: content.substring(74, 154).trim(),
      cliente: 'Cliente Legacy', // Se puede extraer de CLIENTES.DBF
      total: this.parseNumber(content.substring(64, 74)) || 0
    };

    return saleData;
  }

  // Extraer datos de clientes desde CLIENTES.DBF
  async syncClients() {
    console.log('🔄 Sincronizando clientes...');
    
    const clientesPath = path.join(this.legacyPath, 'CLIENTES.DBF');
    const fileData = await this.readDBFFile(clientesPath);
    
    if (!fileData) {
      console.log('❌ No se pudo leer CLIENTES.DBF');
      return { synced: 0 };
    }

    let syncedCount = 0;

    // Procesar registros de clientes
    for (const record of fileData.records) {
      try {
        const clientData = this.extractClientData(record);
        
        if (clientData.codigo) {
          const userData = {
            nombre: clientData.nombre || `Cliente ${clientData.codigo}`,
            email: `cliente${clientData.codigo}@legacy.com`,
            telefono: clientData.telefono || '',
            direccion: clientData.domicilio || '',
            role: 'cliente',
            activo: true,
            origen: 'legacy_sync'
          };

          // Verificar si el cliente ya existe
          const existingClient = await User.findOne({ 
            email: userData.email 
          });

          if (!existingClient) {
            const user = new User(userData);
            await user.save();
            syncedCount++;
          }
        }
      } catch (error) {
        console.error(`Error procesando cliente:`, error);
      }
    }

    console.log(`✅ Clientes sincronizados: ${syncedCount} nuevos`);
    return { synced: syncedCount };
  }

  // Extraer datos de cliente del registro DBF
  extractClientData(record) {
    const content = record.content;
    
    // Basado en la estructura de CLIENTES.DBF
    const clientData = {
      codigo: this.parseNumber(content.substring(0, 4)),
      telefono: content.substring(4, 54).trim(),
      cuit: content.substring(54, 67).trim(),
      nombre: content.substring(67, 117).trim(),
      domicilio: content.substring(117, 147).trim(),
      localidad: content.substring(147, 177).trim(),
      provincia: content.substring(177, 197).trim()
    };

    return clientData;
  }

  // Utilidades para parsing
  parseNumber(str) {
    const num = parseInt(str.trim());
    return isNaN(num) ? 0 : num;
  }

  parseDate(str) {
    // Convertir fecha del formato DBF (YYYYMMDD) a Date
    if (str && str.length === 8) {
      const year = parseInt(str.substring(0, 4));
      const month = parseInt(str.substring(4, 6)) - 1;
      const day = parseInt(str.substring(6, 8));
      return new Date(year, month, day);
    }
    return null;
  }

  mapCategory(legacyCategory) {
    const categoryMap = {
      'ACEITE': 'aceite',
      'FILTRO': 'filtro',
      'LUBRICANTE': 'lubricante',
      'ACCESORIO': 'accesorio',
      'OTRO': 'otro'
    };

    return categoryMap[legacyCategory?.toUpperCase()] || 'otro';
  }

  // Sincronización completa
  async syncAll() {
    console.log('🚀 Iniciando sincronización completa...');
    
    try {
      const results = {
        products: await this.syncProducts(),
        sales: await this.syncSales(),
        clients: await this.syncClients()
      };

      console.log('✅ Sincronización completada:', results);
      return results;
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      throw error;
    }
  }

  // Obtener estadísticas de sincronización
  async getSyncStats() {
    const stats = {
      productos: await Producto.countDocuments({ origen: 'legacy_sync' }),
      pedidos: await Pedido.countDocuments({ origen: 'legacy_sync' }),
      clientes: await User.countDocuments({ origen: 'legacy_sync' })
    };

    return stats;
  }
}

module.exports = new LegacySyncService();
