const fs = require('fs');
const path = require('path');
const dbfReader = require('./services/dbfReader');

console.log('🔍 Verificando archivos del sistema legacy...');

const legacyPath = 'D:\\Daniel\\Visual\\Sistema';

// Verificar si el directorio existe
if (!fs.existsSync(legacyPath)) {
  console.log('❌ El directorio legacy no existe:', legacyPath);
  process.exit(1);
}

console.log('✅ Directorio legacy encontrado:', legacyPath);

// Listar archivos DBF
const files = fs.readdirSync(legacyPath).filter(file => file.endsWith('.DBF'));
console.log('📁 Archivos DBF encontrados:', files);

// Probar lectura de cada archivo
files.forEach(file => {
  console.log(`\n🔍 Probando archivo: ${file}`);
  const filePath = path.join(legacyPath, file);
  
  try {
    const fileData = dbfReader.readDBFFile(filePath);
    console.log(`✅ ${file} leído correctamente`);
    console.log(`   - Registros: ${fileData.records ? fileData.records.length : 0}`);
    console.log(`   - Muestra: ${fileData.sampleRecords ? fileData.sampleRecords.length : 0}`);
    
    if (fileData.records && fileData.records.length > 0) {
      console.log(`   - Primer registro: ${fileData.records[0].content.substring(0, 100)}...`);
    }
  } catch (error) {
    console.log(`❌ Error leyendo ${file}:`, error.message);
  }
});
