import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import Button from './ui/Button'
import Card from './ui/Card'
import Badge from './ui/Badge'
import { requestNotificationPermission, notificationManager } from '../services/notificationService'
import toast from 'react-hot-toast'

const NotificationSettings = () => {
  const [permission, setPermission] = useState('default')
  const [settings, setSettings] = useState({
    turnoConfirmations: true,
    turnoReminders: true,
    turnoCompletions: true,
    lowStockAlerts: true,
    adminNotifications: true,
    whatsappNotifications: true
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Verificar permisos al cargar
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const handleRequestPermission = async () => {
    setIsLoading(true)
    try {
      const granted = await requestNotificationPermission()
      setPermission(granted ? 'granted' : 'denied')
      
      if (granted) {
        toast.success('¡Notificaciones habilitadas!')
      }
    } catch (error) {
      console.error('Error solicitando permisos:', error)
      toast.error('Error al solicitar permisos de notificaciones')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
    
    toast.success(`Notificaciones de ${setting} ${!settings[setting] ? 'habilitadas' : 'deshabilitadas'}`)
  }

  const handleTestNotification = () => {
    notificationManager.queueNotification({
      type: 'success',
      title: '🔔 Notificación de Prueba',
      options: {
        body: 'Esta es una notificación de prueba para verificar que todo funciona correctamente.',
        tag: 'test-notification'
      }
    })
  }

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: 'Habilitadas', variant: 'success', icon: 'mdi:check-circle' }
      case 'denied':
        return { text: 'Bloqueadas', variant: 'error', icon: 'mdi:close-circle' }
      default:
        return { text: 'No configuradas', variant: 'warning', icon: 'mdi:alert-circle' }
    }
  }

  const permissionStatus = getPermissionStatus()

  const notificationTypes = [
    {
      key: 'turnoConfirmations',
      title: 'Confirmaciones de Turnos',
      description: 'Recibir notificaciones cuando se confirme tu turno',
      icon: 'mdi:calendar-check'
    },
    {
      key: 'turnoReminders',
      title: 'Recordatorios de Turnos',
      description: 'Recordatorios automáticos antes de tu turno',
      icon: 'mdi:clock-alert'
    },
    {
      key: 'turnoCompletions',
      title: 'Completado de Servicios',
      description: 'Notificaciones cuando se complete tu servicio',
      icon: 'mdi:flag-checkered'
    },
    {
      key: 'lowStockAlerts',
      title: 'Alertas de Stock Bajo',
      description: 'Notificaciones sobre productos con bajo stock',
      icon: 'mdi:package-variant-remove'
    },
    {
      key: 'adminNotifications',
      title: 'Notificaciones de Administración',
      description: 'Alertas importantes del sistema',
      icon: 'mdi:shield-alert'
    },
    {
      key: 'whatsappNotifications',
      title: 'Notificaciones de WhatsApp',
      description: 'Confirmar cuando se envíen mensajes de WhatsApp',
      icon: 'mdi:whatsapp'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Estado de Permisos */}
      <Card>
        <Card.Header>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Icon icon="mdi:bell" className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Configuración de Notificaciones</h3>
              <p className="text-sm text-gray-600">Gestiona tus preferencias de notificaciones</p>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon icon={permissionStatus.icon} className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Permisos del Navegador</p>
                <p className="text-sm text-gray-600">Estado actual de las notificaciones</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant={permissionStatus.variant}>
                {permissionStatus.text}
              </Badge>
              {permission !== 'granted' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRequestPermission}
                  loading={isLoading}
                  icon="mdi:bell"
                >
                  Habilitar
                </Button>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Tipos de Notificaciones */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Tipos de Notificaciones</h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-4">
            {notificationTypes.map((type) => (
              <div key={type.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Icon icon={type.icon} className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{type.title}</p>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={settings[type.key] ? 'success' : 'default'}>
                    {settings[type.key] ? 'Activado' : 'Desactivado'}
                  </Badge>
                  <Button
                    variant={settings[type.key] ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => handleSettingChange(type.key)}
                    icon={settings[type.key] ? 'mdi:toggle-switch' : 'mdi:toggle-switch-off'}
                  >
                    {settings[type.key] ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Prueba de Notificaciones */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Prueba de Notificaciones</h3>
        </Card.Header>
        <Card.Body>
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Prueba que las notificaciones funcionen correctamente enviando una notificación de prueba.
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleTestNotification}
              icon="mdi:bell-ring"
              disabled={permission !== 'granted'}
            >
              Enviar Notificación de Prueba
            </Button>
            {permission !== 'granted' && (
              <p className="text-sm text-red-600">
                Necesitas habilitar las notificaciones para probar esta función.
              </p>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Información Adicional */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Información</h3>
        </Card.Header>
        <Card.Body>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <Icon icon="mdi:information" className="w-4 h-4 text-blue-600 mt-0.5" />
              <p>Las notificaciones aparecerán incluso cuando la aplicación esté cerrada.</p>
            </div>
            <div className="flex items-start space-x-2">
              <Icon icon="mdi:information" className="w-4 h-4 text-blue-600 mt-0.5" />
              <p>Puedes cambiar los permisos en cualquier momento desde la configuración de tu navegador.</p>
            </div>
            <div className="flex items-start space-x-2">
              <Icon icon="mdi:information" className="w-4 h-4 text-blue-600 mt-0.5" />
              <p>Las notificaciones se sincronizan automáticamente con WhatsApp y otros servicios.</p>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default NotificationSettings 