import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { 
  generateTurnosReport, 
  generateProductosReport, 
  generateFinancialReport,
  generateGeneralReport,
  exportReport,
  REPORT_TYPES,
  EXPORT_FORMATS
} from '../../services/reportsService'
import toast from 'react-hot-toast'

const ReportsManager = () => {
  const [loading, setLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState('general')
  const [selectedPeriod, setSelectedPeriod] = useState('mes')
  const [selectedFormat, setSelectedFormat] = useState(EXPORT_FORMATS.PDF)
  const [reportData, setReportData] = useState(null)
  const [showReportPreview, setShowReportPreview] = useState(false)

  // Datos simulados para reportes
  const mockTurnosData = {
    total: 45,
    confirmados: 38,
    pendientes: 5,
    cancelados: 2,
    porServicio: {
      'Cambio de aceite': 15,
      'Alineación': 8,
      'Frenos': 6,
      'Limpieza de inyectores': 4,
      'Otros': 12
    },
    porMes: {
      'Enero': 12,
      'Febrero': 15,
      'Marzo': 18
    },
    ingresos: 1250000
  }

  const mockProductosData = {
    total: 156,
    categorias: {
      'Aceites': 45,
      'Filtros': 38,
      'Repuestos': 52,
      'Lubricantes': 21
    },
    stockBajo: 12,
    stockCritico: 3,
    valorTotal: 850000,
    movimientos: {
      entradas: 89,
      salidas: 67
    }
  }

  const mockFinancialData = {
    ingresos: 1250000,
    gastos: 450000,
    ganancias: 800000,
    pagos: {
      efectivo: 600000,
      tarjeta: 400000,
      transferencia: 200000,
      mercadopago: 50000
    },
    facturas: {
      total: 89,
      pagadas: 76,
      pendientes: 13
    }
  }

  const mockGeneralData = {
    resumen: {
      turnos: mockTurnosData,
      productos: mockProductosData,
      financiero: mockFinancialData
    },
    tendencias: {
      crecimiento: '+15%',
      clientesNuevos: 23,
      clientesRecurrentes: 67
    }
  }

  const generateReport = async () => {
    setLoading(true)
    
    try {
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      let data
      switch (selectedReport) {
        case 'turnos':
          data = mockTurnosData
          break
        case 'productos':
          data = mockProductosData
          break
        case 'financiero':
          data = mockFinancialData
          break
        default:
          data = mockGeneralData
      }
      
      setReportData(data)
      setShowReportPreview(true)
      toast.success('Reporte generado exitosamente')
    } catch (error) {
      console.error('Error generando reporte:', error)
      toast.error('Error generando reporte')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!reportData) {
      toast.error('Primero genera un reporte')
      return
    }

    setLoading(true)
    
    try {
      let content = ''
      let mimeType = 'text/plain'
      let extension = selectedFormat
      
      switch (selectedFormat) {
        case 'pdf':
          // Crear contenido HTML para PDF
          content = generatePDFContent()
          mimeType = 'text/html'
          extension = 'html'
          break
        case 'excel':
          content = generateExcelContent()
          mimeType = 'text/csv'
          extension = 'csv'
          break
        case 'csv':
          content = generateCSVContent()
          mimeType = 'text/csv'
          break
        case 'json':
        default:
          content = JSON.stringify(reportData, null, 2)
          mimeType = 'application/json'
          break
      }
      
      const fileName = `reporte_${selectedReport}_${new Date().toISOString().split('T')[0]}.${extension}`
      
      // Crear y descargar archivo
      const blob = new Blob([content], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success(`Reporte exportado como ${fileName}`)
    } catch (error) {
      console.error('Error exportando reporte:', error)
      toast.error('Error exportando reporte')
    } finally {
      setLoading(false)
    }
  }

  const getReportIcon = (type) => {
    switch (type) {
      case 'turnos':
        return 'mdi:calendar'
      case 'productos':
        return 'mdi:package'
      case 'financiero':
        return 'mdi:chart-line'
      default:
        return 'mdi:chart-bar'
    }
  }

  const getReportColor = (type) => {
    switch (type) {
      case 'turnos':
        return 'blue'
      case 'productos':
        return 'green'
      case 'financiero':
        return 'purple'
      default:
        return 'gray'
    }
  }

  // Función para generar contenido HTML para PDF
  const generatePDFContent = () => {
    const reportTitle = {
      'general': 'Reporte General',
      'turnos': 'Reporte de Turnos',
      'productos': 'Reporte de Productos',
      'financiero': 'Reporte Financiero'
    }[selectedReport] || 'Reporte'

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${reportTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; color: #1f2937; }
          .subtitle { font-size: 14px; color: #6b7280; margin-top: 5px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #374151; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
          .stat-card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #059669; }
          .stat-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .table th, .table td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
          .table th { background-color: #f9fafb; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${reportTitle}</div>
          <div class="subtitle">Generado el ${new Date().toLocaleDateString('es-ES')}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Resumen</div>
          <div class="stats-grid">
            ${generateStatsHTML()}
          </div>
        </div>
        
        <div class="footer">
          <p>Reporte generado por LUBRI-BAT - Sistema de Gestión</p>
        </div>
      </body>
      </html>
    `
  }

  // Función para generar HTML de estadísticas
  const generateStatsHTML = () => {
    if (!reportData) return ''
    
    switch (selectedReport) {
      case 'turnos':
        return `
          <div class="stat-card">
            <div class="stat-value">${reportData.total}</div>
            <div class="stat-label">Total Turnos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${reportData.confirmados}</div>
            <div class="stat-label">Confirmados</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${reportData.pendientes}</div>
            <div class="stat-label">Pendientes</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">$${reportData.ingresos?.toLocaleString()}</div>
            <div class="stat-label">Ingresos</div>
          </div>
        `
      case 'productos':
        return `
          <div class="stat-card">
            <div class="stat-value">${reportData.total}</div>
            <div class="stat-label">Total Productos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${reportData.stockBajo}</div>
            <div class="stat-label">Stock Bajo</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${reportData.stockCritico}</div>
            <div class="stat-label">Stock Crítico</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">$${reportData.valorTotal?.toLocaleString()}</div>
            <div class="stat-label">Valor Total</div>
          </div>
        `
      case 'financiero':
        return `
          <div class="stat-card">
            <div class="stat-value">$${reportData.ingresos?.toLocaleString()}</div>
            <div class="stat-label">Ingresos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">$${reportData.gastos?.toLocaleString()}</div>
            <div class="stat-label">Gastos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">$${reportData.ganancias?.toLocaleString()}</div>
            <div class="stat-label">Ganancias</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${reportData.facturas?.total}</div>
            <div class="stat-label">Facturas</div>
          </div>
        `
      default:
        return `
          <div class="stat-card">
            <div class="stat-value">${reportData.resumen?.turnos?.total || 0}</div>
            <div class="stat-label">Turnos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${reportData.resumen?.productos?.total || 0}</div>
            <div class="stat-label">Productos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">$${reportData.resumen?.financiero?.ingresos?.toLocaleString() || 0}</div>
            <div class="stat-label">Ingresos</div>
          </div>
        `
    }
  }

  // Función para generar contenido CSV
  const generateCSVContent = () => {
    if (!reportData) return ''
    
    const headers = ['Métrica', 'Valor']
    const rows = []
    
    switch (selectedReport) {
      case 'turnos':
        rows.push(['Total Turnos', reportData.total])
        rows.push(['Confirmados', reportData.confirmados])
        rows.push(['Pendientes', reportData.pendientes])
        rows.push(['Cancelados', reportData.cancelados])
        rows.push(['Ingresos', `$${reportData.ingresos?.toLocaleString()}`])
        break
      case 'productos':
        rows.push(['Total Productos', reportData.total])
        rows.push(['Stock Bajo', reportData.stockBajo])
        rows.push(['Stock Crítico', reportData.stockCritico])
        rows.push(['Valor Total', `$${reportData.valorTotal?.toLocaleString()}`])
        break
      case 'financiero':
        rows.push(['Ingresos', `$${reportData.ingresos?.toLocaleString()}`])
        rows.push(['Gastos', `$${reportData.gastos?.toLocaleString()}`])
        rows.push(['Ganancias', `$${reportData.ganancias?.toLocaleString()}`])
        rows.push(['Total Facturas', reportData.facturas?.total])
        break
      default:
        rows.push(['Turnos', reportData.resumen?.turnos?.total || 0])
        rows.push(['Productos', reportData.resumen?.productos?.total || 0])
        rows.push(['Ingresos', `$${reportData.resumen?.financiero?.ingresos?.toLocaleString() || 0}`])
    }
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  // Función para generar contenido Excel (CSV)
  const generateExcelContent = () => {
    return generateCSVContent()
  }

  const renderReportPreview = () => {
    if (!reportData) return null

    switch (selectedReport) {
      case 'turnos':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <Card.Body>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Turnos</p>
                    <p className="text-2xl font-bold text-blue-600">{reportData.total}</p>
                  </div>
                </Card.Body>
              </Card>
              <Card>
                <Card.Body>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Confirmados</p>
                    <p className="text-2xl font-bold text-green-600">{reportData.confirmados}</p>
                  </div>
                </Card.Body>
              </Card>
              <Card>
                <Card.Body>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">{reportData.pendientes}</p>
                  </div>
                </Card.Body>
              </Card>
              <Card>
                <Card.Body>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Ingresos</p>
                    <p className="text-2xl font-bold text-green-600">${reportData.ingresos?.toLocaleString()}</p>
                  </div>
                </Card.Body>
              </Card>
            </div>
            
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold">Turnos por Servicio</h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-2">
                  {Object.entries(reportData.porServicio || {}).map(([servicio, cantidad]) => (
                    <div key={servicio} className="flex justify-between items-center">
                      <span className="text-sm">{servicio}</span>
                      <Badge variant="outline">{cantidad}</Badge>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </div>
        )

      case 'productos':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <Card.Body>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Productos</p>
                    <p className="text-2xl font-bold text-green-600">{reportData.total}</p>
                  </div>
                </Card.Body>
              </Card>
              <Card>
                <Card.Body>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Stock Bajo</p>
                    <p className="text-2xl font-bold text-yellow-600">{reportData.stockBajo}</p>
                  </div>
                </Card.Body>
              </Card>
              <Card>
                <Card.Body>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Stock Crítico</p>
                    <p className="text-2xl font-bold text-red-600">{reportData.stockCritico}</p>
                  </div>
                </Card.Body>
              </Card>
              <Card>
                <Card.Body>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Valor Total</p>
                    <p className="text-2xl font-bold text-green-600">${reportData.valorTotal?.toLocaleString()}</p>
                  </div>
                </Card.Body>
              </Card>
            </div>
            
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold">Productos por Categoría</h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-2">
                  {Object.entries(reportData.categorias || {}).map(([categoria, cantidad]) => (
                    <div key={categoria} className="flex justify-between items-center">
                      <span className="text-sm">{categoria}</span>
                      <Badge variant="outline">{cantidad}</Badge>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </div>
        )

      case 'financiero':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <Card.Body>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Ingresos</p>
                    <p className="text-2xl font-bold text-green-600">${reportData.ingresos?.toLocaleString()}</p>
                  </div>
                </Card.Body>
              </Card>
              <Card>
                <Card.Body>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Gastos</p>
                    <p className="text-2xl font-bold text-red-600">${reportData.gastos?.toLocaleString()}</p>
                  </div>
                </Card.Body>
              </Card>
              <Card>
                <Card.Body>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Ganancias</p>
                    <p className="text-2xl font-bold text-green-600">${reportData.ganancias?.toLocaleString()}</p>
                  </div>
                </Card.Body>
              </Card>
              <Card>
                <Card.Body>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Facturas</p>
                    <p className="text-2xl font-bold text-blue-600">{reportData.facturas?.total}</p>
                  </div>
                </Card.Body>
              </Card>
            </div>
            
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold">Pagos por Método</h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-2">
                  {Object.entries(reportData.pagos || {}).map(([metodo, monto]) => (
                    <div key={metodo} className="flex justify-between items-center">
                      <span className="text-sm capitalize">{metodo}</span>
                      <span className="text-sm font-medium">${monto?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold">Resumen General</h3>
              </Card.Header>
              <Card.Body>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <Icon icon="mdi:calendar" className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Turnos</p>
                    <p className="text-xl font-bold">{reportData.resumen?.turnos?.total}</p>
                  </div>
                  <div className="text-center">
                    <Icon icon="mdi:package" className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Productos</p>
                    <p className="text-xl font-bold">{reportData.resumen?.productos?.total}</p>
                  </div>
                  <div className="text-center">
                    <Icon icon="mdi:chart-line" className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Ingresos</p>
                    <p className="text-xl font-bold">${reportData.resumen?.financiero?.ingresos?.toLocaleString()}</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
            
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold">Tendencias</h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Crecimiento</span>
                    <Badge variant="success">{reportData.tendencias?.crecimiento}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Clientes Nuevos</span>
                    <Badge variant="outline">{reportData.tendencias?.clientesNuevos}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Clientes Recurrentes</span>
                    <Badge variant="outline">{reportData.tendencias?.clientesRecurrentes}</Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Tipos de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card 
          className={`card-hover cursor-pointer ${selectedReport === 'general' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setSelectedReport('general')}
        >
          <Card.Body>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="mdi:chart-bar" className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Reporte General</h3>
              <p className="text-gray-600 text-sm">Resumen completo del negocio</p>
            </div>
          </Card.Body>
        </Card>

        <Card 
          className={`card-hover cursor-pointer ${selectedReport === 'turnos' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setSelectedReport('turnos')}
        >
          <Card.Body>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="mdi:calendar" className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Reporte de Turnos</h3>
              <p className="text-gray-600 text-sm">Análisis de reservas y confirmaciones</p>
            </div>
          </Card.Body>
        </Card>

        <Card 
          className={`card-hover cursor-pointer ${selectedReport === 'productos' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setSelectedReport('productos')}
        >
          <Card.Body>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="mdi:package" className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Reporte de Productos</h3>
              <p className="text-gray-600 text-sm">Inventario y movimientos de stock</p>
            </div>
          </Card.Body>
        </Card>

        <Card 
          className={`card-hover cursor-pointer ${selectedReport === 'financiero' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setSelectedReport('financiero')}
        >
          <Card.Body>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="mdi:chart-line" className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Reporte Financiero</h3>
              <p className="text-gray-600 text-sm">Ingresos, pagos y facturación</p>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Filtros de reportes */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold">Configuración del Reporte</h3>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="hoy">Hoy</option>
                <option value="semana">Esta semana</option>
                <option value="mes">Este mes</option>
                <option value="trimestre">Este trimestre</option>
                <option value="año">Este año</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato de Exportación
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
              >
                <option value={EXPORT_FORMATS.PDF}>PDF</option>
                <option value={EXPORT_FORMATS.EXCEL}>Excel</option>
                <option value={EXPORT_FORMATS.CSV}>CSV</option>
                <option value={EXPORT_FORMATS.JSON}>JSON</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="primary"
                fullWidth
                onClick={generateReport}
                loading={loading}
              >
                Generar Reporte
              </Button>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                fullWidth
                onClick={handleExport}
                loading={loading}
                disabled={!reportData}
              >
                Exportar
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Vista previa del reporte */}
      {showReportPreview && reportData && (
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Vista Previa - Reporte de {selectedReport === 'general' ? 'General' :
                  selectedReport === 'turnos' ? 'Turnos' :
                  selectedReport === 'productos' ? 'Productos' :
                  selectedReport === 'financiero' ? 'Financiero' : 'General'}
              </h3>
              <Badge variant="success">Generado</Badge>
            </div>
          </Card.Header>
          <Card.Body>
            {renderReportPreview()}
          </Card.Body>
        </Card>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-hover">
          <Card.Body>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:calendar" className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Turnos Este Mes</p>
                <p className="text-2xl font-bold text-gray-900">45</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="card-hover">
          <Card.Body>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:package" className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Productos</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="card-hover">
          <Card.Body>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:cash" className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ingresos</p>
                <p className="text-2xl font-bold text-gray-900">$1.25M</p>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="card-hover">
          <Card.Body>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Icon icon="mdi:trending-up" className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Crecimiento</p>
                <p className="text-2xl font-bold text-gray-900">+15%</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default ReportsManager 