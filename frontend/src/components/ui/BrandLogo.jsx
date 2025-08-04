import React from 'react'

// Importar logos del usuario
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
import elfLogo from '../../assets/brands/lo_elf.jpg'
import castrolLogo from '../../assets/brands/lo_castrol.jpg'
import totalLogo from '../../assets/brands/lo_total.jpg'
import elaionLogo from '../../assets/brands/lo_elaion.jpg'
import shellLogo from '../../assets/brands/lo_shell.jpg'

const BrandLogo = ({ brand, className = "w-12 h-12 sm:w-16 sm:h-16" }) => {
  // Mapeo de marcas a logos
  const logoMap = {
    // Logos del usuario
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
    'ELF': elfLogo,
    'CASTROL': castrolLogo,
    'TOTAL': totalLogo,
    'SHELL': shellLogo
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