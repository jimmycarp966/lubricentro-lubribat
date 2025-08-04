import React from 'react'

// Importar logos del usuario
import fercolLogo from '../../assets/brands/fercol logo si.jpg'
import framLogo from '../../assets/brands/lgo fram.png'
import wegaLogo from '../../assets/brands/logo wega.png'
import fiatLogo from '../../assets/brands/lo_fiat.jpg'
import toyotaLogo from '../../assets/brands/lo_toyota.jpg'
import castrolLogo from '../../assets/brands/lo_castrol.jpg'
import chevroletLogo from '../../assets/brands/lo_chevrolet.jpg'
import audiLogo from '../../assets/brands/lo_audi.jpg'
import fordLogo from '../../assets/brands/lo_ford.jpg'
import vwLogo from '../../assets/brands/lo_vw.jpg'
import elaionLogo from '../../assets/brands/lo_elaion.jpg'
import shellLogo from '../../assets/brands/lo_shell.jpg'
import ypfLogo from '../../assets/brands/ypf.png'

const BrandLogo = ({ brand, className = "w-8 h-8 sm:w-10 sm:h-10" }) => {
  // Mapeo de marcas a logos
  const logoMap = {
    'FERCOL': fercolLogo,
    'FRAM': framLogo,
    'WEGA': wegaLogo,
    'FIAT': fiatLogo,
    'TOYOTA': toyotaLogo,
    'CASTROL': castrolLogo,
    'CHEVROLET': chevroletLogo,
    'AUDI': audiLogo,
    'FORD': fordLogo,
    'VOLKSWAGEN': vwLogo,
    'SHELL': shellLogo,
    'YPF': ypfLogo,
    'ELAION': ypfLogo // ELAION es en realidad YPF
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

  // Si no hay logo, no mostrar nada
  return null
}

export default BrandLogo 