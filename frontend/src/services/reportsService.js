import { ref, get, query, orderByChild } from 'firebase/database'
import { database } from '../firebase/config'
import toast from 'react-hot-toast'

// Tipos de reportes
export const REPORT_TYPES = {
  TURNOS: 'turnos',
  PRODUCTOS: 'productos',
  PAGOS: 'pagos',
  INVENTARIO: 'inventario',
  FINANCIERO: 'financiero',
  GENERAL: 'general'
}

// Formatos de exportación
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  JSON: 'json'
}

// Función para generar reporte de turnos
export const generateTurnosReport = async (filters = {}) => {
  try {
    const turnosRef = ref(database, 'turnos')
    let turnosQuery = query(turnosRef, orderByChild('fecha'))

    const snapshot = await get(turnosQuery)
    const turnos = []

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const turno = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        }
        
        // Aplicar filtros
        if (filters.estado && turno.estado !== filters.estado) return
        if (filters.servicio && turno.servicio !== filters.servicio) return
        if (filters.fechaDesde && new Date(turno.fecha) < new Date(filters.fechaDesde)) return
        if (filters.fechaHasta && new Date(turno.fecha) > new Date(filters.fechaHasta)) return
        
        turnos.push(turno)
      })
    }

    // Estadísticas del reporte
    const stats = {
      total: turnos.length,
      confirmados: turnos.filter(t => t.estado === 'confirmado').length,
      pendientes: turnos.filter(t => t.estado === 'pendiente').length,
      cancelados: turnos.filter(t => t.estado === 'cancelado').length,
      completados: turnos.filter(t => t.estado === 'completado').length,
      porServicio: {},
      porDia: {},
      ingresosEstimados: turnos
        .filter(t => t.estado === 'confirmado' || t.estado === 'completado')
        .reduce((sum, t) => sum + (t.precio || 0), 0)
    }

    // Estadísticas por servicio
    turnos.forEach(turno => {
      const servicio = turno.servicio || 'Sin servicio'
      if (!stats.porServicio[servicio]) {
        stats.porServicio[servicio] = {
          cantidad: 0,
          ingresos: 0
        }
      }
      stats.porServicio[servicio].cantidad++
      stats.porServicio[servicio].ingresos += turno.precio || 0
    })

    // Estadísticas por día
    turnos.forEach(turno => {
      const fecha = new Date(turno.fecha).toLocaleDateString()
      if (!stats.porDia[fecha]) {
        stats.porDia[fecha] = {
          cantidad: 0,
          ingresos: 0
        }
      }
      stats.porDia[fecha].cantidad++
      stats.porDia[fecha].ingresos += turno.precio || 0
    })

    return {
      data: turnos,
      stats: stats,
      filters: filters
    }
  } catch (error) {
    console.error('Error generando reporte de turnos:', error)
    throw error
  }
}

// Función para generar reporte de productos
export const generateProductosReport = async (filters = {}) => {
  try {
    const productosRef = ref(database, 'productos')
    const snapshot = await get(productosRef)
    const productos = []

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const producto = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        }
        
        // Aplicar filtros
        if (filters.categoria && producto.categoria !== filters.categoria) return
        if (filters.stockMin && producto.stock < filters.stockMin) return
        if (filters.stockMax && producto.stock > filters.stockMax) return
        if (filters.precioMin && producto.precio < filters.precioMin) return
        if (filters.precioMax && producto.precio > filters.precioMax) return
        
        productos.push(producto)
      })
    }

    // Estadísticas del reporte
    const stats = {
      total: productos.length,
      stockCritico: productos.filter(p => p.stock <= 5).length,
      stockBajo: productos.filter(p => p.stock <= 15 && p.stock > 5).length,
      stockNormal: productos.filter(p => p.stock > 15).length,
      valorTotal: productos.reduce((sum, p) => sum + (p.precio * p.stock), 0),
      porCategoria: {}
    }

    // Estadísticas por categoría
    productos.forEach(producto => {
      const categoria = producto.categoria || 'Sin categoría'
      if (!stats.porCategoria[categoria]) {
        stats.porCategoria[categoria] = {
          cantidad: 0,
          stockTotal: 0,
          valorTotal: 0
        }
      }
      stats.porCategoria[categoria].cantidad++
      stats.porCategoria[categoria].stockTotal += producto.stock
      stats.porCategoria[categoria].valorTotal += producto.precio * producto.stock
    })

    return {
      data: productos,
      stats: stats,
      filters: filters
    }
  } catch (error) {
    console.error('Error generando reporte de productos:', error)
    throw error
  }
}

// Función para generar reporte financiero
export const generateFinancialReport = async (filters = {}) => {
  try {
    // Obtener datos de pagos y facturas
    const paymentsRef = ref(database, 'payments')
    const invoicesRef = ref(database, 'invoices')
    
    const paymentsSnapshot = await get(paymentsRef)
    const invoicesSnapshot = await get(invoicesRef)
    
    const payments = []
    const invoices = []

    if (paymentsSnapshot.exists()) {
      paymentsSnapshot.forEach((childSnapshot) => {
        const payment = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        }
        
        // Aplicar filtros
        if (filters.fechaDesde && payment.createdAt < filters.fechaDesde) return
        if (filters.fechaHasta && payment.createdAt > filters.fechaHasta) return
        
        payments.push(payment)
      })
    }

    if (invoicesSnapshot.exists()) {
      invoicesSnapshot.forEach((childSnapshot) => {
        const invoice = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        }
        
        // Aplicar filtros
        if (filters.fechaDesde && invoice.createdAt < filters.fechaDesde) return
        if (filters.fechaHasta && invoice.createdAt > filters.fechaHasta) return
        
        invoices.push(invoice)
      })
    }

    // Estadísticas financieras
    const stats = {
      totalIngresos: payments
        .filter(p => p.status === 'approved')
        .reduce((sum, p) => sum + (p.amount || 0), 0),
      totalFacturas: invoices.length,
      facturasPagadas: invoices.filter(i => i.status === 'paid').length,
      facturasPendientes: invoices.filter(i => i.status === 'pending').length,
      porTipoPago: {},
      porMes: {},
      promedioTicket: 0
    }

    // Calcular promedio de ticket
    const pagosAprobados = payments.filter(p => p.status === 'approved')
    if (pagosAprobados.length > 0) {
      stats.promedioTicket = stats.totalIngresos / pagosAprobados.length
    }

    // Estadísticas por tipo de pago
    payments.forEach(payment => {
      const tipo = payment.type || 'unknown'
      if (!stats.porTipoPago[tipo]) {
        stats.porTipoPago[tipo] = {
          cantidad: 0,
          monto: 0
        }
      }
      stats.porTipoPago[tipo].cantidad++
      stats.porTipoPago[tipo].monto += payment.amount || 0
    })

    // Estadísticas por mes
    payments.forEach(payment => {
      const fecha = new Date(payment.createdAt)
      const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
      
      if (!stats.porMes[mes]) {
        stats.porMes[mes] = {
          cantidad: 0,
          monto: 0
        }
      }
      stats.porMes[mes].cantidad++
      stats.porMes[mes].monto += payment.amount || 0
    })

    return {
      payments: payments,
      invoices: invoices,
      stats: stats,
      filters: filters
    }
  } catch (error) {
    console.error('Error generando reporte financiero:', error)
    throw error
  }
}

// Función para exportar reporte
export const exportReport = async (reportData, format = EXPORT_FORMATS.JSON) => {
  try {
    let exportData = ''

    switch (format) {
      case EXPORT_FORMATS.JSON:
        exportData = JSON.stringify(reportData, null, 2)
        break
        
      case EXPORT_FORMATS.CSV:
        exportData = convertToCSV(reportData.data)
        break
        
      case EXPORT_FORMATS.EXCEL:
        // Simulación de exportación a Excel
        exportData = 'Excel data would be generated here'
        break
        
      case EXPORT_FORMATS.PDF:
        // Simulación de exportación a PDF
        exportData = 'PDF data would be generated here'
        break
        
      default:
        throw new Error('Formato de exportación no soportado')
    }

    // Crear y descargar archivo
    const blob = new Blob([exportData], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_${Date.now()}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success(`Reporte exportado exitosamente`)
    return { success: true }
  } catch (error) {
    console.error('Error exportando reporte:', error)
    toast.error('Error exportando reporte')
    throw error
  }
}

// Función auxiliar para convertir a CSV
const convertToCSV = (data) => {
  if (!data || data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvRows = [headers.join(',')]
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header]
      return typeof value === 'string' ? `"${value}"` : value
    })
    csvRows.push(values.join(','))
  })
  
  return csvRows.join('\n')
}

// Función para generar reporte general
export const generateGeneralReport = async (filters = {}) => {
  try {
    const [turnosReport, productosReport, financialReport] = await Promise.all([
      generateTurnosReport(filters),
      generateProductosReport(filters),
      generateFinancialReport(filters)
    ])

    const generalStats = {
      turnos: turnosReport.stats,
      productos: productosReport.stats,
      financiero: financialReport.stats,
      resumen: {
        totalTurnos: turnosReport.stats.total,
        totalProductos: productosReport.stats.total,
        totalIngresos: financialReport.stats.totalIngresos,
        ingresosPromedio: financialReport.stats.promedioTicket
      }
    }

    return {
      turnos: turnosReport,
      productos: productosReport,
      financiero: financialReport,
      stats: generalStats
    }
  } catch (error) {
    console.error('Error generando reporte general:', error)
    throw error
  }
} 