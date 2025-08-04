import { Icon } from '@iconify/react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import BrandLogo from '../components/ui/BrandLogo'
import logo from '../assets/logo.png'

const Home = () => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center py-12 sm:py-16 gradient-hero rounded-2xl shadow-brand relative overflow-hidden glass">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-yellow-50/50"></div>
        <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-green-200 rounded-full -translate-x-12 -translate-y-12 sm:-translate-x-16 sm:-translate-y-16 opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-yellow-200 rounded-full translate-x-16 translate-y-16 sm:translate-x-20 sm:translate-y-20 opacity-20"></div>
        
        <div className="relative z-10 px-4 sm:px-6">
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative">
              <img src={logo} alt="LUBRI-BAT" className="h-20 w-20 sm:h-28 sm:w-28 animate-bounce-gentle" />
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full animate-pulse-slow"></div>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gradient mb-4 sm:mb-6">
            LUBRI-BAT
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-2 sm:px-4">
            Tu lubricentro de confianza en <span className="font-semibold text-green-600">Monteros</span> y <span className="font-semibold text-yellow-600">Concepción</span>. 
            Servicios profesionales de lubricación y mantenimiento automotriz.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center px-2 sm:px-4">
            <Button
              variant="success"
              size="lg"
              icon="mdi:calendar-plus"
              as="Link"
              to="/turnos"
              className="text-base sm:text-lg md:text-xl button-hover hover-glow w-full sm:w-auto"
            >
              Reservar Turno
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              icon="mdi:store"
              as="Link"
              to="/mayorista/login"
              className="text-base sm:text-lg md:text-xl button-hover hover-glow w-full sm:w-auto"
            >
              Portal Mayoristas
            </Button>
          </div>
        </div>
      </div>

      {/* Warning Stripes */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-3 sm:py-4 rounded-xl shadow-lg mx-2 sm:mx-0">
        <div className="container mx-auto text-center px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3">
            <Icon icon="mdi:alert-circle" className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-900 animate-pulse" />
            <p className="text-yellow-900 font-bold text-sm sm:text-base lg:text-lg">
              ATENCIÓN: Horarios de atención Lunes a Viernes 08:00-13:00 y 16:00-20:00, Sábados 08:30-13:00
            </p>
          </div>
        </div>
      </div>

      {/* Servicios */}
      <section className="py-8 sm:py-12 lg:py-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 lg:mb-16 text-gray-900 px-4">
          Nuestros Servicios
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-10 px-4 sm:px-6">
          <Card className="text-center group card-hover animate-slide-in-left">
            <Card.Body className="p-6 sm:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-green-200 transition-colors">
                <Icon icon="mdi:oil" className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 animate-bounce-gentle" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-green-600">Cambio de Aceite</h3>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                Cambio de aceite de motor con productos de primera calidad. 
                Incluye filtro de aceite y verificación de niveles.
              </p>
              <div className="mt-4 sm:mt-6">
                <Badge variant="success" size="lg">Desde $12.000</Badge>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="text-center group card-hover animate-zoom-in">
            <Card.Body className="p-6 sm:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-yellow-200 transition-colors">
                <Icon icon="mdi:wrench" className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600 animate-pulse-slow" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-yellow-600">Mantenimiento</h3>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                Mantenimiento preventivo y correctivo de tu vehículo. 
                Revisión completa de sistemas y componentes.
              </p>
              <div className="mt-4 sm:mt-6">
                <Badge variant="secondary" size="lg">Desde $15.000</Badge>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="text-center group card-hover animate-slide-in-right">
            <Card.Body className="p-6 sm:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-green-200 transition-colors">
                <Icon icon="mdi:car" className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 animate-bounce-gentle" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-green-600">Diagnóstico</h3>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                Diagnóstico computarizado y revisión técnica especializada. 
                Identificación precisa de problemas y soluciones.
              </p>
              <div className="mt-4 sm:mt-6">
                <Badge variant="success" size="lg">Desde $8.000</Badge>
              </div>
            </Card.Body>
          </Card>
        </div>
      </section>

      {/* Marcas */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl mx-2 sm:mx-0">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Marcas con las que Trabajamos
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
              Trabajamos con las mejores marcas del mercado para garantizar la calidad y durabilidad de tu vehículo
            </p>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-4 sm:gap-6">
            {[
              'FERCOL',
              'YPF',
              'SHELL',
              'WEGA',
              'FRAM',
              'FIAT',
              'TOYOTA',
              'CASTROL',
              'CHEVROLET',
              'AUDI',
              'FORD',
              'VOLKSWAGEN'
            ].map((brandName) => (
              <div key={brandName} className="group relative flex flex-col items-center bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-3 sm:p-4 border border-gray-100 hover:border-green-200 hover:bg-green-50">
                <div className="mb-2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                  <BrandLogo brand={brandName} className="w-full h-full object-contain" />
                </div>
                <span className="font-medium text-gray-700 text-[9px] sm:text-xs text-center group-hover:text-green-700 transition-colors leading-tight">{brandName}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8 sm:mt-10">
            <p className="text-gray-500 text-xs sm:text-sm">
              Productos originales y garantizados
            </p>
          </div>
        </div>
      </section>

      {/* Ventajas */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-green-50 to-yellow-50 rounded-2xl mx-2 sm:mx-0">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-900">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Icon icon="mdi:clock-fast" className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 text-green-600">Servicio Rápido</h3>
              <p className="text-sm sm:text-base text-gray-600">Atención eficiente en menos de 1 hora</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Icon icon="mdi:star" className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 text-yellow-600">Calidad Garantizada</h3>
              <p className="text-sm sm:text-base text-gray-600">Productos de primera marca y garantía</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Icon icon="mdi:calendar-check" className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 text-green-600">Reserva Online</h3>
              <p className="text-sm sm:text-base text-gray-600">Reserva tu turno fácilmente desde tu celular</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Icon icon="mdi:map-marker" className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 text-yellow-600">Dos Sucursales</h3>
              <p className="text-sm sm:text-base text-gray-600">Monteros y Concepción para tu comodidad</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="text-center py-8 sm:py-12 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl mx-2 sm:mx-0">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            ¿Listo para tu próximo servicio?
          </h2>
          <p className="text-white text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 opacity-90">
            Reserva tu turno ahora y obtén un servicio profesional y confiable
          </p>
          <Button
            variant="secondary"
            size="lg"
            icon="mdi:calendar-plus"
            as="Link"
            to="/turnos"
            className="text-base sm:text-lg md:text-xl button-hover hover-glow w-full sm:w-auto"
          >
            Reservar Ahora
          </Button>
        </div>
      </section>
    </div>
  )
}

export default Home 