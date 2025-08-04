import React from 'react'

// Importar logos disponibles
import castrolLogo from '../../assets/brands/castrol.png'
import shellLogo from '../../assets/brands/shell.png'
import valvolineLogo from '../../assets/brands/valvoline.png'
import motulLogo from '../../assets/brands/motul.png'
import elfLogo from '../../assets/brands/elf.png'
import petronasLogo from '../../assets/brands/petronas.png'
import totalLogo from '../../assets/brands/total.png'
import ypfLogo from '../../assets/brands/ypf.png'

// Importar logos nuevos del usuario
import fercolLogo from '../../assets/brands/logo fercol.webp'
import framLogo from '../../assets/brands/lgo fram.png'
import wegaLogo from '../../assets/brands/logo wega.png'
import landroverLogo from '../../assets/brands/lo_landrover.jpg'
import mitsubishiLogo from '../../assets/brands/lo_mitsubishi.jpg'
import seatLogo from '../../assets/brands/lo_seat.jpg'
import volvoLogo from '../../assets/brands/lo_volvo.jpg'
import dodgeLogo from '../../assets/brands/lo_dodge.jpg'
import miniLogo from '../../assets/brands/lo_mini.jpg'
import isuzuLogo from '../../assets/brands/lo_isuzu.jpg'
import hyundaiLogo from '../../assets/brands/lo_hyundai.jpg'
import jeepLogo from '../../assets/brands/lo_jeep.jpg'
import mazdaLogo from '../../assets/brands/lo_mazda.jpg'
import chryslerLogo from '../../assets/brands/lo_chrisler.jpg'
import audiLogo from '../../assets/brands/lo_audi.jpg'
import mercedesLogo from '../../assets/brands/lo_mercedes.jpg'
import bmwLogo from '../../assets/brands/lo_bmw.jpg'
import hondaLogo from '../../assets/brands/lo_honda.jpg'
import kiaLogo from '../../assets/brands/lo_kia.jpg'
import suzukiLogo from '../../assets/brands/lo_suzuki.jpg'
import nissanLogo from '../../assets/brands/lo_nissan.jpg'
import toyotaLogo from '../../assets/brands/lo_toyota.jpg'
import citroenLogo from '../../assets/brands/lo_citroen.jpg'
import alfaLogo from '../../assets/brands/lo_alfa.jpg'
import fordLogo from '../../assets/brands/lo_ford.jpg'
import peugeotLogo from '../../assets/brands/lo_peugeot.jpg'
import chevroletLogo from '../../assets/brands/lo_chevrolet.jpg'
import renaultLogo from '../../assets/brands/lo_renault.jpg'
import vwLogo from '../../assets/brands/lo_vw.jpg'
import fiatLogo from '../../assets/brands/lo_fiat.jpg'
import elfNewLogo from '../../assets/brands/lo_elf.jpg'
import castrolNewLogo from '../../assets/brands/lo_castrol.jpg'
import totalNewLogo from '../../assets/brands/lo_total.jpg'
import elaionLogo from '../../assets/brands/lo_elaion.jpg'
import shellNewLogo from '../../assets/brands/lo_shell.jpg'

const BrandLogo = ({ brand, className = "w-12 h-12 sm:w-16 sm:h-16" }) => {
  // Mapeo de marcas a logos
  const logoMap = {
    // Logos originales
    'CASTROL': castrolLogo,
    'SHELL': shellLogo,
    'VALVOLINE': valvolineLogo,
    'MOTUL': motulLogo,
    'ELF': elfLogo,
    'PETRONAS': petronasLogo,
    'TOTAL': totalLogo,
    'YPF': ypfLogo,
    
    // Logos nuevos del usuario
    'FERCOL': fercolLogo,
    'FRAM': framLogo,
    'WEGA': wegaLogo,
    'LAND ROVER': landroverLogo,
    'MITSUBISHI': mitsubishiLogo,
    'SEAT': seatLogo,
    'VOLVO': volvoLogo,
    'DODGE': dodgeLogo,
    'MINI': miniLogo,
    'ISUZU': isuzuLogo,
    'HYUNDAI': hyundaiLogo,
    'JEEP': jeepLogo,
    'MAZDA': mazdaLogo,
    'CHRYSLER': chryslerLogo,
    'AUDI': audiLogo,
    'MERCEDES': mercedesLogo,
    'BMW': bmwLogo,
    'HONDA': hondaLogo,
    'KIA': kiaLogo,
    'SUZUKI': suzukiLogo,
    'NISSAN': nissanLogo,
    'TOYOTA': toyotaLogo,
    'CITROËN': citroenLogo,
    'ALFA ROMEO': alfaLogo,
    'FORD': fordLogo,
    'PEUGEOT': peugeotLogo,
    'CHEVROLET': chevroletLogo,
    'RENAULT': renaultLogo,
    'VOLKSWAGEN': vwLogo,
    'FIAT': fiatLogo,
    'ELAION': elaionLogo,
    
    // Logos alternativos (usar los nuevos si están disponibles)
    'ELF_NEW': elfNewLogo,
    'CASTROL_NEW': castrolNewLogo,
    'TOTAL_NEW': totalNewLogo,
    'SHELL_NEW': shellNewLogo
  }

  const logo = logoMap[brand]

  if (logo) {
    return (
      <img 
        src={logo} 
        alt={`${brand} logo`}
        className={`${className} object-contain`}
      />
    )
  }

  // Fallback SVG para marcas sin logo
  const getBrandColor = (brandName) => {
    const colorMap = {
      'MANN FILTER': 'from-red-500 to-red-600',
      'MOURA': 'from-yellow-500 to-yellow-600',
      'WEGA': 'from-gray-500 to-gray-600',
      'BARDAHL': 'from-green-500 to-green-600',
      'PETRONAS': 'from-green-600 to-green-700'
    }
    return colorMap[brandName] || 'from-blue-500 to-blue-600'
  }

  const getBrandInitials = (brandName) => {
    const words = brandName.split(' ')
    return words.map(word => word.charAt(0)).join('')
  }

  return (
    <div className={`${className} bg-gradient-to-br ${getBrandColor(brand)} rounded-full flex items-center justify-center`}>
      <span className="text-white font-bold text-xs sm:text-sm">
        {getBrandInitials(brand)}
      </span>
    </div>
  )
}

export default BrandLogo 