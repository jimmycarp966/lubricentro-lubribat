import React from 'react'
import { Link } from 'react-router-dom'

const SobreNosotros = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">Sobre LUBRI-BAT</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Más de 23 años de experiencia en el cuidado de tu vehículo, 
            ofreciendo servicios de calidad y atención personalizada.
          </p>
        </div>
      </div>

      {/* Historia */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Nuestra Historia</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-green-600">Desde 2000</h3>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  LUBRI-BAT nació de la pasión por los automóviles y el compromiso con la excelencia. 
                  Fundado por Fernando Safatle, nuestro lubricentro se ha convertido 
                  en un referente de confianza en la comunidad.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Comenzamos como un pequeño taller y hoy somos reconocidos por nuestra calidad, 
                  honestidad y atención al detalle. Cada vehículo que llega a nuestras manos 
                  recibe el mismo cuidado que daríamos al nuestro propio.
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-blue-100 p-8 rounded-2xl">
                <div className="text-center">
                  <div className="text-6xl font-bold text-green-600 mb-4">23+</div>
                  <div className="text-xl text-gray-700">Años de Experiencia</div>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Más de 10,000 servicios realizados</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Certificaciones técnicas</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">Tecnología de vanguardia</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Misión y Valores */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Misión y Valores</h2>
            <div className="grid md:grid-cols-2 gap-12">
              {/* Misión */}
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800">Nuestra Misión</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Proporcionar servicios de lubricación y mantenimiento automotriz de la más alta calidad, 
                  utilizando tecnología avanzada y personal capacitado, para garantizar la seguridad y 
                  durabilidad de tu vehículo.
                </p>
              </div>

              {/* Visión */}
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800">Nuestra Visión</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Ser el lubricentro líder en la región, reconocido por la excelencia en el servicio, 
                  la innovación tecnológica y el compromiso con la satisfacción total del cliente.
                </p>
              </div>
            </div>

            {/* Valores */}
            <div className="mt-12 grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-2 text-gray-800">Calidad</h4>
                <p className="text-gray-600">Utilizamos los mejores productos y técnicas para garantizar resultados excepcionales.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-2 text-gray-800">Confianza</h4>
                <p className="text-gray-600">Construimos relaciones duraderas basadas en la honestidad y transparencia.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-2 text-gray-800">Innovación</h4>
                <p className="text-gray-600">Mantenemos tecnología de vanguardia para ofrecer el mejor servicio.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Nuestro Equipo</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">FS</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Fernando Safatle</h3>
                <p className="text-green-600 font-medium mb-2">Fundador y Propietario</p>
                <p className="text-gray-600 text-sm">23 años de experiencia en el sector automotriz</p>
              </div>

              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">RS</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Rosela Safatle</h3>
                <p className="text-green-600 font-medium mb-2">Gerente</p>
                <p className="text-gray-600 text-sm">Especialista en gestión y atención al cliente</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios Destacados */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Servicios Destacados</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Cambio de Aceite</h3>
                </div>
                <p className="text-gray-600">Servicio completo con aceites de alta calidad y filtros originales.</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Diagnóstico Computarizado</h3>
                </div>
                <p className="text-gray-600">Análisis completo del sistema electrónico de tu vehículo.</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Mantenimiento Preventivo</h3>
                </div>
                <p className="text-gray-600">Revisión completa para prevenir problemas futuros.</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Atención Personalizada</h3>
                </div>
                <p className="text-gray-600">Cada cliente recibe atención individualizada y asesoramiento experto.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">¿Listo para cuidar tu vehículo?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Agenda tu turno hoy mismo y descubre por qué somos la elección preferida 
            de miles de conductores en la región.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/turnos"
              className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Reservar Turno
            </Link>
            <Link
              to="/"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-green-600 transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SobreNosotros 