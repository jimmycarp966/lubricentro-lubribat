const fs = require('fs');
const path = require('path');
const dbf = require('dbf');

// Función para leer archivo DBF
function readDBFFile(filePath) {
  try {
    console.log(`📖 Leyendo archivo: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Archivo no encontrado: ${filePath}`);
      return null;
    }

    const buffer = fs.readFileSync(filePath);
    const parser = new dbf(buffer);
    const records = parser.records;
    
    console.log(`✅ Archivo leído: ${records.length} registros`);
    
    // Mostrar los primeros 3 registros como ejemplo
    if (records.length > 0) {
      console.log('\n📋 Estructura del primer registro:');
      console.log(Object.keys(records[0]));
      
      console.log('\n📋 Primeros 3 registros:');
      for (let i = 0; i < Math.min(3, records.length); i++) {
        console.log(`Registro ${i + 1}:`, records[i]);
      }
    }
    
    return records;
  } catch (error) {
    console.error(`❌ Error leyendo ${filePath}:`, error);
    return null;
  }
}

// Función principal
async function testDBFReading() {
  console.log('🧪 Iniciando prueba de lectura de archivos DBF...\n');
  
  const legacyPath = 'D:\\Daniel\\Visual\\Sistema';
  
  // Archivos a probar
  const filesToTest = [
    'ARTICULO.DBF',
    'FACTURA.DBF', 
    'CLIENTES.DBF',
    'RESUMEN.DBF'
  ];
  
  for (const fileName of filesToTest) {
    const filePath = path.join(legacyPath, fileName);
    console.log(`\n🔍 Probando archivo: ${fileName}`);
    
    const records = readDBFFile(filePath);
    
    if (records) {
      console.log(`✅ ${fileName}: ${records.length} registros encontrados`);
    } else {
      console.log(`❌ ${fileName}: No se pudo leer`);
    }
  }
  
  console.log('\n🎯 Prueba completada');
}

// Ejecutar prueba
testDBFReading().catch(console.error);
