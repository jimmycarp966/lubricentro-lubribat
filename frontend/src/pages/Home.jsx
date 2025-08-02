import logo from '../assets/logo.png'

const Home = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-16 bg-gradient-to-r from-green-50 to-yellow-50 rounded-2xl shadow-lg">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="LUBRI-BAT" className="h-28 w-28" />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-gray-900 mb-6">
          LUBRI-BAT
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed px-4">
          Tu lubricentro de confianza en Monteros y Concepción. 
          Servicios profesionales de lubricación y mantenimiento automotriz.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
          <a
            href="/turnos"
            className="bg-green-600 hover:bg-green-700 text-white px-8 sm:px-10 py-4 rounded-xl text-lg sm:text-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Reservar Turno
          </a>
          <a
            href="/mayorista/login"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 sm:px-10 py-4 rounded-xl text-lg sm:text-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Portal Mayoristas
          </a>
        </div>
      </div>

      {/* Warning Stripes */}
      <div className="bg-yellow-400 py-3 rounded-lg">
        <div className="container mx-auto text-center">
          <p className="text-yellow-900 font-bold text-lg">
            ⚠️ ATENCIÓN: Horarios de atención de Lunes a Viernes de 8:00 a 18:00 hs
          </p>
        </div>
      </div>

      {/* Servicios */}
      <section className="py-12 sm:py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-16 text-gray-900 px-4">
          Nuestros Servicios
        </h2>
        <div className="grid md:grid-cols-3 gap-6 sm:gap-10 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="text-6xl mb-6 animate-bounce">🛢️</div>
            <h3 className="text-2xl font-bold mb-4 text-green-600">Cambio de Aceite</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Cambio de aceite de motor con productos de primera calidad. 
              Incluye filtro de aceite y verificación de niveles.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="text-6xl mb-6 animate-pulse">🔧</div>
            <h3 className="text-2xl font-bold mb-4 text-green-600">Mantenimiento</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Servicios de mantenimiento preventivo y correctivo. 
              Revisión completa de sistemas y componentes.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="text-6xl mb-6 animate-spin">🛍️</div>
            <h3 className="text-2xl font-bold mb-4 text-green-600">Venta Mayorista</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Productos automotrices al por mayor. 
              Aceites, filtros, lubricantes y repuestos.
            </p>
          </div>
        </div>
      </section>

      {/* Oferta Especial */}
      <section className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 sm:p-12 shadow-lg mx-4">
        <div className="text-center">
          <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 animate-pulse">🎉</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 sm:mb-6 text-white">
            ¡OFERTA ESPECIAL!
          </h2>
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xl mb-6 sm:mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Cambio de Aceite + Filtro
            </h3>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <span className="text-3xl sm:text-4xl font-bold text-red-600 line-through">$15.000</span>
              <span className="text-4xl sm:text-5xl font-bold text-green-600">$12.000</span>
            </div>
            <p className="text-gray-600 text-base sm:text-lg mb-4 sm:mb-6">
              Incluye aceite de motor premium, filtro de aceite y verificación completa de niveles
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href="/turnos"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                Reservar Ahora
              </a>
              <a
                href="/contacto"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                Más Información
              </a>
            </div>
          </div>
          <p className="text-white text-lg font-semibold">
            ⏰ Oferta válida hasta el 31 de diciembre de 2024
          </p>
        </div>
      </section>

      {/* CTA Final */}
      <section className="text-center py-12 sm:py-16 bg-green-600 rounded-2xl shadow-xl mx-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6 px-4">
          ¿Necesitás un servicio?
        </h2>
        <p className="text-green-100 mb-8 sm:mb-10 text-lg sm:text-xl leading-relaxed px-4">
          Reservá tu turno ahora y disfrutá de nuestros servicios profesionales
        </p>
        <a
          href="/turnos"
          className="bg-white text-green-600 px-8 sm:px-12 py-4 rounded-xl text-lg sm:text-xl font-bold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
        >
          Reservar Ahora
        </a>
      </section>
    </div>
  )
}

export default Home 