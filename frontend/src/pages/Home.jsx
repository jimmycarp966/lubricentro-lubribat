import { Icon } from '@iconify/react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import logo from '../assets/logo.png'

const Home = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center py-16 gradient-hero rounded-2xl shadow-brand relative overflow-hidden glass">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-yellow-50/50"></div>
        <div className="absolute top-0 left-0 w-32 h-32 bg-green-200 rounded-full -translate-x-16 -translate-y-16 opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-200 rounded-full translate-x-20 translate-y-20 opacity-20"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img src={logo} alt="LUBRI-BAT" className="h-28 w-28 animate-bounce-gentle" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse-slow"></div>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-gradient mb-6">
            LUBRI-BAT
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed px-4">
            Tu lubricentro de confianza en <span className="font-semibold text-green-600">Monteros</span> y <span className="font-semibold text-yellow-600">Concepción</span>. 
            Servicios profesionales de lubricación y mantenimiento automotriz.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
            <Button
              variant="success"
              size="lg"
              icon="mdi:calendar-plus"
              as="Link"
              to="/turnos"
              className="text-lg sm:text-xl button-hover hover-glow"
            >
              Reservar Turno
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              icon="mdi:store"
              as="Link"
              to="/mayorista/login"
              className="text-lg sm:text-xl button-hover hover-glow"
            >
              Portal Mayoristas
            </Button>
          </div>
        </div>
      </div>

      {/* Warning Stripes */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-4 rounded-xl shadow-lg">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3">
            <Icon icon="mdi:alert-circle" className="w-6 h-6 text-yellow-900 animate-pulse" />
            <p className="text-yellow-900 font-bold text-lg">
              ATENCIÓN: Horarios de atención Lunes a Viernes 08:00-13:00 y 16:00-20:00, Sábados 08:30-13:00
            </p>
          </div>
        </div>
      </div>

      {/* Servicios */}
      <section className="py-12 sm:py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-16 text-gray-900 px-4">
          Nuestros Servicios
        </h2>
        <div className="grid md:grid-cols-3 gap-6 sm:gap-10 px-4">
          <Card className="text-center group card-hover animate-slide-in-left">
            <Card.Body className="p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <Icon icon="mdi:oil" className="w-10 h-10 text-green-600 animate-bounce-gentle" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-green-600">Cambio de Aceite</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Cambio de aceite de motor con productos de primera calidad. 
                Incluye filtro de aceite y verificación de niveles.
              </p>
              <div className="mt-6">
                <Badge variant="success" size="lg">Desde $12.000</Badge>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="text-center group card-hover animate-zoom-in">
            <Card.Body className="p-8">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow-200 transition-colors">
                <Icon icon="mdi:wrench" className="w-10 h-10 text-yellow-600 animate-pulse-slow" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-yellow-600">Mantenimiento</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Servicios de mantenimiento preventivo y correctivo. 
                Revisión completa de sistemas y componentes.
              </p>
              <div className="mt-6">
                <Badge variant="warning" size="lg">Servicio Completo</Badge>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="text-center group card-hover animate-slide-in-right">
            <Card.Body className="p-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Icon icon="mdi:store" className="w-10 h-10 text-blue-600 animate-bounce-gentle" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-blue-600">Venta Mayorista</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Productos automotrices al por mayor. 
                Aceites, filtros, lubricantes y repuestos.
              </p>
              <div className="mt-6">
                <Badge variant="info" size="lg">Precios Mayoristas</Badge>
              </div>
            </Card.Body>
          </Card>
        </div>
      </section>

      {/* Oferta Especial */}
      <section className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 sm:p-12 shadow-brand mx-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="text-center relative z-10">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
            <Icon icon="mdi:gift" className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-white">
            ¡OFERTA ESPECIAL!
          </h2>
          
          <Card className="max-w-2xl mx-auto">
            <Card.Body className="p-6 sm:p-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Cambio de Aceite + Filtro
              </h3>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-red-600 line-through">$15.000</span>
                <span className="text-4xl sm:text-5xl font-bold text-green-600">$12.000</span>
              </div>
              
              <p className="text-gray-600 text-base sm:text-lg mb-6">
                Incluye aceite de motor premium, filtro de aceite y verificación completa de niveles
              </p>
              
                             <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                 <Button
                   variant="primary"
                   size="lg"
                   icon="mdi:calendar-plus"
                   as="Link"
                   to="/turnos"
                 >
                   Reservar Ahora
                 </Button>
                 
                 <Button
                   variant="secondary"
                   size="lg"
                   icon="mdi:phone"
                   as="Link"
                   to="/contacto"
                 >
                   Consultar
                 </Button>
               </div>
            </Card.Body>
          </Card>
          
          <p className="text-white text-lg font-semibold mt-6 flex items-center justify-center">
            <Icon icon="mdi:clock" className="w-5 h-5 mr-2" />
            Oferta válida hasta el 31 de diciembre de 2024
          </p>
        </div>
      </section>

      {/* CTA Final */}
      <section className="text-center py-12 sm:py-16 gradient-primary rounded-2xl shadow-brand mx-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-green-700/20"></div>
        <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 translate-y-16"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 px-4">
            ¿Necesitás un servicio?
          </h2>
          <p className="text-green-100 mb-10 text-lg sm:text-xl leading-relaxed px-4 max-w-2xl mx-auto">
            Reservá tu turno ahora y disfrutá de nuestros servicios profesionales con la mejor calidad
          </p>
                     <Button
             variant="secondary"
             size="lg"
             icon="mdi:calendar-plus"
             as="Link"
             to="/turnos"
             className="text-lg sm:text-xl"
           >
             Reservar Ahora
           </Button>
        </div>
      </section>
    </div>
  )
}

export default Home 