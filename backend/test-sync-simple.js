const fs = require('fs');
const path = require('path');
const dbfReader = require('./services/dbfReader');

async function testSyncSimple() {
  console.log('🧪 Probando sincronización simple...');
  
  try {
    // Leer archivos DBF
    const articulosPath = path.join('D:\\Daniel\\Visual\\Sistema', 'ARTICULO.DBF');
    const facturasPath = path.join('D:\\Daniel\\Visual\\Sistema', 'FACTURA.DBF');
    const clientesPath = path.join('D:\\Daniel\\Visual\\Sistema', 'CLIENTES.DBF');
    
    console.log('📖 Leyendo archivos DBF...');
    
    const articulosData = dbfReader.readDBFFile(articulosPath);
    const facturasData = dbfReader.readDBFFile(facturasPath);
    const clientesData = dbfReader.readDBFFile(clientesPath);
    
    if (articulosData) {
      console.log(`✅ ARTICULO.DBF: ${articulosData.totalRecords} registros`);
      console.log('   Muestra de productos:');
      articulosData.records.slice(0, 3).forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.content.substring(0, 60).trim()}`);
      });
    }
    
    if (facturasData) {
      console.log(`✅ FACTURA.DBF: ${facturasData.totalRecords} registros`);
      
      // Filtrar por fechas objetivo (4 y 5 de agosto)
      const targetDates = ['2025-08-04', '2025-08-05'];
      let ventasObjetivo = 0;
      
      facturasData.records.forEach(record => {
        const fechaStr = record.content.substring(0, 8);
        if (fechaStr && targetDates.some(date => fechaStr.includes(date.substring(5)))) {
          ventasObjetivo++;
        }
      });
      
      console.log(`   Ventas del 4 y 5 de agosto: ${ventasObjetivo}`);
    }
    
    if (clientesData) {
      console.log(`✅ CLIENTES.DBF: ${clientesData.totalRecords} registros`);
      console.log('   Muestra de clientes:');
      clientesData.records.slice(0, 3).forEach((record, index) => {
        const nombre = record.content.substring(67, 117).trim();
        console.log(`   ${index + 1}. ${nombre}`);
      });
    }
    
    console.log('\n✅ Prueba completada exitosamente');
    console.log('📊 Resumen:');
    console.log(`   - Productos disponibles: ${articulosData?.totalRecords || 0}`);
    console.log(`   - Ventas totales: ${facturasData?.totalRecords || 0}`);
    console.log(`   - Clientes disponibles: ${clientesData?.totalRecords || 0}`);
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testSyncSimple();
