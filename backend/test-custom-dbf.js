const dbfReader = require('./services/dbfReader');

async function testCustomDBFReader() {
  console.log('🧪 Probando lector personalizado de DBF...\n');
  
  try {
    const results = await dbfReader.readLegacyFiles();
    
    console.log('\n📊 RESUMEN DE ANÁLISIS:');
    console.log('========================');
    
    for (const [fileName, fileData] of Object.entries(results)) {
      console.log(`\n📁 ${fileName}:`);
      console.log(`   - Registros totales: ${fileData.totalRecords}`);
      console.log(`   - Campos detectados: ${fileData.fields.length}`);
      
      if (fileData.fields.length > 0) {
        console.log('   - Campos:');
        fileData.fields.forEach(field => {
          console.log(`     * ${field.name} (${field.type}, ${field.length})`);
        });
      }
      
      if (fileData.sampleRecords.length > 0) {
        console.log(`   - Muestra de registros: ${fileData.sampleRecords.length}`);
        fileData.sampleRecords.forEach(record => {
          console.log(`     Registro ${record.index}: ${record.content.substring(0, 50)}...`);
        });
      }
    }
    
    console.log('\n✅ Análisis completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error en el análisis:', error);
  }
}

// Ejecutar prueba
testCustomDBFReader();
