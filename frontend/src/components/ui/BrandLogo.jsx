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

const BrandLogo = ({ brand, className = "w-12 h-12 sm:w-16 sm:h-16" }) => {
  // Mapeo de marcas a logos
  const logoMap = {
    'CASTROL': castrolLogo,
    'SHELL': shellLogo,
    'VALVOLINE': valvolineLogo,
    'MOTUL': motulLogo,
    'ELF': elfLogo,
    'PETRONAS': petronasLogo,
    'TOTAL': totalLogo,
    'YPF': ypfLogo
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
      'BARDAHL': 'from-green-500 to-green-600'
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