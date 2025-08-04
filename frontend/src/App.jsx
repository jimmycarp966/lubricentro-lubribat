import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import LiveChat from './components/LiveChat'
import QuickActions from './components/QuickActions'
import StatusBar from './components/StatusBar'

import SidePanel from './components/SidePanel'
import Home from './pages/Home'
import TurnosPublic from './pages/TurnosPublic'
import Login from './pages/Login'
import Register from './pages/Register'
import LoginMayorista from './pages/LoginMayorista'
import PortalMayorista from './pages/PortalMayorista'
import AdminPanel from './pages/AdminPanel'
import SobreNosotros from './pages/SobreNosotros'
import Resenas from './pages/Resenas'
import Contacto from './pages/Contacto'
import ClienteBusqueda from './pages/ClienteBusqueda'
import { AuthProvider } from './contexts/AuthContext'
import { TurnosProvider } from './contexts/TurnosContext'
import { ProductosProvider } from './contexts/ProductosContext'

// Importar estilos globales
import './styles/globals.css'

function App() {
  return (
    <AuthProvider>
      <TurnosProvider>
        <ProductosProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Navbar />
            <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/turnos" element={<TurnosPublic />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/sobre-nosotros" element={<SobreNosotros />} />
                <Route path="/resenas" element={<Resenas />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/buscar-cliente" element={<ClienteBusqueda />} />
                <Route path="/mayorista/login" element={<LoginMayorista />} />
                <Route path="/mayorista/portal" element={<PortalMayorista />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </main>
            <LiveChat />
            <QuickActions />
            <StatusBar />
            <SidePanel />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                },
              }}
            />
          </div>
        </ProductosProvider>
      </TurnosProvider>
    </AuthProvider>
  )
}

export default App 