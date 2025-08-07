const fs = require('fs');
const path = require('path');

class DBFReader {
  constructor() {
    this.legacyPath = 'D:\\Daniel\\Visual\\Sistema';
  }

  // Leer archivo DBF de forma básica
  readDBFFile(filePath) {
    try {
      console.log(`📖 Leyendo archivo: ${filePath}`);
      
      if (!fs.existsSync(filePath)) {
        console.error(`❌ Archivo no encontrado: ${filePath}`);
        return null;
      }

      const buffer = fs.readFileSync(filePath);
      
      // Información básica del archivo
      const fileSize = buffer.length;
      console.log(`📊 Tamaño del archivo: ${fileSize} bytes`);
      
      // Leer header del DBF (primeros 32 bytes)
      const header = {
        version: buffer[0],
        year: buffer[1] + 1900,
        month: buffer[2],
        day: buffer[3],
        numRecords: buffer.readUInt32LE(4),
        headerLength: buffer.readUInt16LE(8),
        recordLength: buffer.readUInt16LE(10)
      };
      
      console.log('📋 Header del archivo DBF:');
      console.log(`  - Versión: ${header.version}`);
      console.log(`  - Fecha: ${header.day}/${header.month}/${header.year}`);
      console.log(`  - Número de registros: ${header.numRecords}`);
      console.log(`  - Longitud del header: ${header.headerLength}`);
      console.log(`  - Longitud del registro: ${header.recordLength}`);
      
      // Extraer algunos registros de ejemplo
      const records = this.extractSampleRecords(buffer, header);
      
      return {
        header,
        records,
        totalRecords: header.numRecords
      };
      
    } catch (error) {
      console.error(`❌ Error leyendo ${filePath}:`, error);
      return null;
    }
  }

  // Extraer registros de ejemplo
  extractSampleRecords(buffer, header) {
    const records = [];
    const recordStart = header.headerLength;
    
    // Leer los primeros 5 registros como ejemplo
    const maxRecords = Math.min(5, header.numRecords);
    
    for (let i = 0; i < maxRecords; i++) {
      const recordOffset = recordStart + (i * header.recordLength);
      
      if (recordOffset + header.recordLength <= buffer.length) {
        const recordBuffer = buffer.slice(recordOffset, recordOffset + header.recordLength);
        
        // Convertir a string para ver el contenido
        const recordString = recordBuffer.toString('latin1');
        
        records.push({
          index: i + 1,
          offset: recordOffset,
          length: header.recordLength,
          content: recordString,
          hex: recordBuffer.toString('hex').substring(0, 100) + '...'
        });
      }
    }
    
    return records;
  }

  // Analizar estructura de campos (basado en el header)
  analyzeFieldStructure(buffer, header) {
    const fields = [];
    let offset = 32; // Después del header principal
    
    while (offset < header.headerLength - 1) {
      const fieldName = buffer.toString('ascii', offset, offset + 11).replace(/\0/g, '');
      const fieldType = String.fromCharCode(buffer[offset + 11]);
      const fieldLength = buffer[offset + 16];
      const fieldDecimal = buffer[offset + 17];
      
      if (fieldName && fieldName.trim()) {
        fields.push({
          name: fieldName.trim(),
          type: fieldType,
          length: fieldLength,
          decimal: fieldDecimal,
          offset: offset
        });
      }
      
      offset += 32; // Tamaño del descriptor de campo
    }
    
    return fields;
  }

  // Leer archivos específicos del sistema legacy
  async readLegacyFiles() {
    const files = [
      'ARTICULO.DBF',
      'FACTURA.DBF',
      'CLIENTES.DBF',
      'RESUMEN.DBF'
    ];
    
    const results = {};
    
    for (const fileName of files) {
      const filePath = path.join(this.legacyPath, fileName);
      console.log(`\n🔍 Analizando: ${fileName}`);
      
      const fileData = this.readDBFFile(filePath);
      
      if (fileData) {
        results[fileName] = {
          header: fileData.header,
          sampleRecords: fileData.records,
          totalRecords: fileData.totalRecords
        };
        
        // Analizar estructura de campos
        const buffer = fs.readFileSync(filePath);
        const fields = this.analyzeFieldStructure(buffer, fileData.header);
        results[fileName].fields = fields;
        
        console.log(`✅ ${fileName}: ${fileData.totalRecords} registros, ${fields.length} campos`);
      } else {
        console.log(`❌ ${fileName}: No se pudo leer`);
      }
    }
    
    return results;
  }
}

module.exports = new DBFReader();
