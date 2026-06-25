/**
 * Catálogo de veículos, sub-modelos, códigos OBD e listas auxiliares.
 * Extraído verbatim do app "Prost - Diagnóstico" (Google AI Studio).
 */

export const VEHICLE_DATA: Record<string, Record<string, Record<string, string[]>>> = {
  "Toyota": {
    "Corolla": {
      "GLi": ["1.8 16V", "2.0 16V"],
      "XEi": ["2.0 16V"],
      "Altis Premium": ["2.0 16V"],
      "Altis Hybrid": ["1.8 Hybrid"],
      "GR-S": ["2.0 16V"]
    },
    "Hilux": {
      "SR": ["2.7 Flex", "2.8 Diesel"],
      "SRV": ["2.7 Flex", "2.8 Diesel"],
      "SRX": ["2.8 Diesel"],
      "GR-Sport": ["2.8 Diesel"],
      "Conquest": ["2.8 Diesel"],
      "Chassi": ["2.8 Diesel"],
      "Cabine Simples": ["2.8 Diesel"]
    },
    "SW4": {
      "SRX": ["2.8 Diesel"],
      "Diamond": ["2.8 Diesel"],
      "GR-Sport": ["2.8 Diesel"]
    },
    "Yaris": {
      "XL": ["1.3 16V", "1.5 16V"],
      "XS": ["1.5 16V"],
      "XLS": ["1.5 16V"]
    },
    "Etios": {
      "X": ["1.3 16V", "1.5 16V"],
      "XS": ["1.5 16V"],
      "XLS": ["1.5 16V"],
      "Platinum": ["1.5 16V"],
      "Cross": ["1.5 16V"]
    },
    "Rav4": {
      "S Hybrid": ["2.5 Hybrid"],
      "SX Hybrid": ["2.5 Hybrid"]
    },
    "Corolla Cross": {
      "XR": ["2.0 16V"],
      "XRE": ["2.0 16V"],
      "XRV Hybrid": ["1.8 Hybrid"],
      "XRX Hybrid": ["1.8 Hybrid"],
      "GR-S": ["2.0 16V"]
    }
  },
  "Volkswagen": {
    "Gol": {
      "Trendline": ["1.0 MPI", "1.6 MSI"],
      "Comfortline": ["1.0 MPI", "1.6 MSI"],
      "Highline": ["1.6 MSI"],
      "Track": ["1.0 MPI"],
      "Last Edition": ["1.0 MPI"],
      "G1 (Quadrado)": ["1.0", "1.3", "1.6", "1.8"],
      "G2 (Bolinha)": ["1.0", "1.6", "1.8", "2.0"],
      "G3": ["1.0", "1.6", "1.8", "2.0"],
      "G4": ["1.0", "1.6", "1.8"]
    },
    "Polo": {
      "MPI": ["1.0 MPI"],
      "TSI": ["1.0 TSI"],
      "Comfortline": ["1.0 TSI"],
      "Highline": ["1.0 TSI"],
      "GTS": ["1.4 TSI"],
      "Track": ["1.0 MPI"],
      "G3 (9N)": ["1.6", "2.0"],
      "G4 (9N3)": ["1.6", "2.0"]
    },
    "Golf": {
      "G3": ["1.8 GL", "2.0 GLX", "2.0 GTI"],
      "G4 (Sapão)": ["1.6", "2.0", "1.8 Turbo"],
      "G4.5": ["1.6", "2.0", "1.8 Turbo"],
      "G7": ["1.4 TSI", "2.0 GTI"],
      "G7.5": ["1.0 TSI", "1.4 TSI", "2.0 GTI"]
    },
    "Fusca": {
      "1300": ["1.3"],
      "1500": ["1.5"],
      "1600": ["1.6"],
      "TSI": ["2.0 TSI"]
    },
    "Kombi": {
      "Standard": ["1.5", "1.6", "1.4 Flex"],
      "Luxo": ["1.5", "1.6"],
      "Last Edition": ["1.4 Flex"]
    },
    "Santana": {
      "CL": ["1.8", "2.0"],
      "GL": ["1.8", "2.0"],
      "GLS": ["2.0"],
      "Evidence": ["2.0"],
      "Exclusiv": ["2.0"]
    },
    "Voyage": {
      "CL": ["1.6", "1.8"],
      "GL": ["1.8"],
      "GLS": ["1.8"],
      "Trend": ["1.0", "1.6"]
    },
    "Parati": {
      "CL": ["1.6", "1.8"],
      "GL": ["1.8"],
      "GLS": ["1.8", "2.0"],
      "Surf": ["1.6", "1.8"]
    },
    "Virtus": {
      "MSI": ["1.6 MSI"],
      "TSI": ["1.0 TSI"],
      "Comfortline": ["1.0 TSI"],
      "Highline": ["1.0 TSI"],
      "Exclusive": ["1.4 TSI"]
    },
    "T-Cross": {
      "Sense": ["200 TSI"],
      "200 TSI": ["200 TSI"],
      "Comfortline": ["200 TSI"],
      "Highline": ["250 TSI"]
    },
    "Nivus": {
      "Comfortline": ["200 TSI"],
      "Highline": ["200 TSI"]
    },
    "Amarok": {
      "Comfortline": ["2.0 Diesel Turbo", "3.0 V6 Diesel"],
      "Highline": ["3.0 V6 Diesel"],
      "Extreme": ["3.0 V6 Diesel"]
    },
    "Jetta": {
      "Comfortline": ["1.4 TSI", "2.0 Aspirado"],
      "Highline": ["2.0 TSI"],
      "R-Line": ["1.4 TSI"],
      "GLI": ["2.0 TSI"]
    },
    "Saveiro": {
      "Robust": ["1.6 MSI"],
      "Trendline": ["1.6 MSI"],
      "Cross": ["1.6 MSI"],
      "Extreme": ["1.6 MSI"]
    },
    "Taos": {
      "Comfortline": ["250 TSI"],
      "Highline": ["250 TSI"]
    },
    "Tiguan": {
      "2.0 TSI (G1 - Alemã)": ["2.0 TSI (200cv)", "2.0 TSI (211cv)"],
      "1.4 TSI (G1 - Alemã)": ["1.4 TSI (150cv)"],
      "Allspace 250 TSI (G2)": ["1.4 TSI Flex"],
      "Allspace Comfortline (G2)": ["250 TSI"],
      "Allspace R-Line (G2)": ["350 TSI"],
      "R-Line 350 TSI (G2)": ["2.0 TSI"],
      "Tiguan (Nova)": ["2.0 TSI (230cv)"]
    }
  },
  "Chevrolet": {
    "Onix": {
      "1.0": ["1.0 Aspirado"],
      "LT": ["1.0 Aspirado", "1.0 Turbo"],
      "LTZ": ["1.0 Turbo"],
      "RS": ["1.0 Turbo"],
      "Premier": ["1.0 Turbo"]
    },
    "Corsa": {
      "Wind": ["1.0 MPFI"],
      "Super": ["1.0 MPFI", "1.6 MPFI"],
      "GL": ["1.4 EFI", "1.6 MPFI"],
      "GLS": ["1.6 MPFI"],
      "Classic": ["1.0 VHC", "1.6 MPFI"]
    },
    "Astra": {
      "GL": ["1.8 8V", "2.0 8V"],
      "GLS": ["2.0 8V", "2.0 16V"],
      "Advantage": ["2.0 Flex"],
      "SS": ["2.0 Flex"]
    },
    "Vectra": {
      "GL": ["2.0 8V"],
      "GLS": ["2.0 8V", "2.2 8V"],
      "CD": ["2.0 16V", "2.2 16V"],
      "Elite": ["2.4 16V", "2.0 Flex"]
    },
    "Omega": {
      "GLS": ["2.0 8V", "2.2 8V"],
      "CD": ["3.0 12V", "4.1 12V", "3.8 V6", "3.6 V6"]
    },
    "Opala": {
      "Comodoro": ["2.5 4cil", "4.1 6cil"],
      "Diplomata": ["4.1 6cil"],
      "Standard": ["2.5 4cil"]
    },
    "Monza": {
      "SL": ["1.6", "1.8", "2.0"],
      "SLE": ["1.8", "2.0"],
      "Classic": ["2.0 MPFI"]
    },
    "Kadett": {
      "SL": ["1.8"],
      "SLE": ["1.8", "2.0"],
      "GS": ["2.0"],
      "GSI": ["2.0 MPFI"]
    },
    "Tracker": {
      "1.0 Turbo": ["1.0 Turbo"],
      "LT": ["1.0 Turbo"],
      "LTZ": ["1.0 Turbo"],
      "Premier": ["1.0 Turbo", "1.2 Turbo"],
      "G1 (Grand Vitara)": ["2.0 16V", "2.0 Diesel"]
    },
    "S10": {
      "LS": ["2.4 Flex", "2.8 Diesel"],
      "LT": ["2.5 Flex", "2.8 Diesel"],
      "LTZ": ["2.5 Flex", "2.8 Diesel"],
      "High Country": ["2.8 Diesel"],
      "Z71": ["2.8 Diesel"],
      "G1": ["2.2 EFI", "2.2 MPFI", "2.5 Diesel", "4.3 V6"]
    },
    "Cruze": {
      "LT": ["1.4 Turbo", "1.8 Ecotec"],
      "LTZ": ["1.4 Turbo", "1.8 Ecotec"],
      "Premier": ["1.4 Turbo"],
      "RS": ["1.4 Turbo"]
    },
    "Spin": {
      "LS": ["1.8 Econoflex"],
      "LT": ["1.8 Econoflex"],
      "LTZ": ["1.8 Econoflex"],
      "Premier": ["1.8 Econoflex"],
      "Activ": ["1.8 Econoflex"]
    },
    "Montana": {
      "1.2 Turbo": ["1.2 Turbo"],
      "LT": ["1.2 Turbo"],
      "LTZ": ["1.2 Turbo"],
      "Premier": ["1.2 Turbo"],
      "RS": ["1.2 Turbo"],
      "G1 (Frente Agile)": ["1.4 Econoflex"],
      "G2": ["1.4 Econoflex"]
    },
    "Equinox": {
      "RS": ["1.5 Turbo"],
      "Premier": ["1.5 Turbo", "2.0 Turbo"]
    },
    "Trailblazer": {
      "LTZ": ["2.8 Diesel", "3.6 V6"],
      "High Country": ["2.8 Diesel"]
    },
    "Silverado": {
      "High Country": ["5.3 V8"],
      "Conquest": ["4.1 6cil", "4.2 Diesel"]
    }
  },
  "Fiat": {
    "Uno": {
      "Mille": ["1.0 Fire", "1.0 Carb"],
      "Way": ["1.0 Fire", "1.4 Evo"],
      "Vivace": ["1.0 Evo"],
      "Attractive": ["1.4 Evo"],
      "Sporting": ["1.4 Evo"]
    },
    "Palio": {
      "Fire": ["1.0 Fire"],
      "ELX": ["1.0 Fire", "1.3 Fire", "1.4 Fire"],
      "Attractive": ["1.0 Evo", "1.4 Evo"],
      "Essence": ["1.6 E.torQ"],
      "Sporting": ["1.6 E.torQ"]
    },
    "Siena": {
      "EL": ["1.0 Fire", "1.4 Fire"],
      "ELX": ["1.0 Fire", "1.4 Fire"],
      "Essence": ["1.6 E.torQ"]
    },
    "Strada": {
      "Working": ["1.4 Fire"],
      "Endurance": ["1.4 Fire", "1.3 Firefly"],
      "Freedom": ["1.3 Firefly"],
      "Volcano": ["1.3 Firefly"],
      "Ranch": ["1.0 Turbo (T200)"],
      "Ultra": ["1.0 Turbo (T200)"]
    },
    "Argo": {
      "1.0": ["1.0 Firefly"],
      "Drive": ["1.0 Firefly", "1.3 Firefly"],
      "Trekking": ["1.3 Firefly"],
      "Precision": ["1.8 E.torQ"]
    },
    "Cronos": {
      "1.0": ["1.0 Firefly"],
      "Drive": ["1.0 Firefly", "1.3 Firefly"],
      "Precision": ["1.3 Firefly", "1.8 E.torQ"]
    },
    "Pulse": {
      "Drive": ["1.3 Firefly", "1.0 Turbo (T200)"],
      "Audace": ["1.0 Turbo (T200)"],
      "Impetus": ["1.0 Turbo (T200)"],
      "Abarth": ["1.3 Turbo (T270)"]
    },
    "Fastback": {
      "Audace": ["1.0 Turbo (T200)"],
      "Impetus": ["1.0 Turbo (T200)"],
      "Limited Edition": ["1.3 Turbo (T270)"],
      "Abarth": ["1.3 Turbo (T270)"]
    },
    "Toro": {
      "Endurance": ["1.8 E.torQ", "1.3 Turbo (T270)"],
      "Freedom": ["1.3 Turbo (T270)", "2.0 Diesel"],
      "Volcano": ["1.3 Turbo (T270)", "2.0 Diesel"],
      "Ranch": ["2.0 Diesel"],
      "Ultra": ["2.0 Diesel"]
    },
    "Mobi": {
      "Like": ["1.0 Fire"],
      "Trekking": ["1.0 Fire"]
    },
    "Fiorino": {
      "Endurance": ["1.4 Fire"]
    },
    "Titano": {
      "Endurance": ["2.2 Diesel"],
      "Volcano": ["2.2 Diesel"],
      "Ranch": ["2.2 Diesel"]
    },
    "Ducato": {
      "Cargo": ["2.2 Diesel"],
      "Multi": ["2.2 Diesel"],
      "Minibus": ["2.2 Diesel"]
    }
  },
  "Hyundai": {
    "HB20": {
      "Sense": ["1.0 Kappa"],
      "Comfort": ["1.0 Kappa", "1.0 Turbo GDI"],
      "Limited": ["1.0 Kappa"],
      "Platinum": ["1.0 Turbo GDI"],
      "Platinum Plus": ["1.0 Turbo GDI"]
    },
    "HB20S": {
      "Comfort": ["1.0 Kappa", "1.0 Turbo GDI"],
      "Limited": ["1.0 Kappa"],
      "Platinum": ["1.0 Turbo GDI"],
      "Platinum Plus": ["1.0 Turbo GDI"]
    },
    "Creta": {
      "Action": ["1.6 Gamma"],
      "Comfort": ["1.0 Turbo GDI"],
      "Limited": ["1.0 Turbo GDI"],
      "Platinum": ["1.0 Turbo GDI"],
      "Ultimate": ["2.0 Smartstream"],
      "N Line": ["1.0 Turbo GDI"]
    },
    "Tucson": {
      "GL": ["1.6 Turbo GDI"],
      "GLS": ["1.6 Turbo GDI"],
      "Limited": ["1.6 Turbo GDI"]
    },
    "IX35": {
      "GL": ["2.0 Flex"],
      "GLS": ["2.0 Flex"]
    },
    "HR": {
      "4x4": ["2.5 Diesel"],
      "Standard": ["2.5 Diesel"]
    }
  },
  "Honda": {
    "Civic": {
      "EX": ["2.0 i-VTEC"],
      "EXL": ["2.0 i-VTEC"],
      "Touring": ["1.5 Turbo"],
      "Type R": ["2.0 Turbo"],
      "Hybrid": ["2.0 Hybrid"]
    },
    "HR-V": {
      "EX": ["1.5 i-VTEC"],
      "EXL": ["1.5 i-VTEC"],
      "Advance": ["1.5 Turbo"],
      "Touring": ["1.5 Turbo"]
    },
    "City": {
      "EX": ["1.5 i-VTEC"],
      "EXL": ["1.5 i-VTEC"],
      "Touring": ["1.5 i-VTEC"]
    },
    "Fit": {
      "DX": ["1.5 i-VTEC"],
      "LX": ["1.5 i-VTEC"],
      "EX": ["1.5 i-VTEC"],
      "EXL": ["1.5 i-VTEC"],
      "Personal": ["1.5 i-VTEC"]
    },
    "CR-V": {
      "EXL": ["1.5 Turbo"],
      "Touring": ["1.5 Turbo"],
      "Advanced Hybrid": ["2.0 Hybrid"]
    },
    "ZR-V": {
      "Touring": ["2.0 i-VTEC"]
    }
  },
  "Ford": {
    "Ranger": {
      "XL": ["2.0 Diesel"],
      "XLS": ["2.0 Diesel", "3.0 V6 Diesel"],
      "XLT": ["3.0 V6 Diesel"],
      "Limited": ["3.0 V6 Diesel"],
      "Raptor": ["3.0 V6 Biturbo"],
      "G1": ["2.3 16V", "2.5 Diesel", "3.0 Diesel", "4.0 V6"]
    },
    "Ka": {
      "S": ["1.0 TiVCT"],
      "SE": ["1.0 TiVCT", "1.5 Dragon"],
      "SEL": ["1.5 Dragon"],
      "FreeStyle": ["1.5 Dragon"],
      "G1 (Baratinha)": ["1.0 Zetec Rocam", "1.6 Zetec Rocam"]
    },
    "Fiesta": {
      "Street": ["1.0 Zetec Rocam", "1.6 Zetec Rocam"],
      "Class": ["1.0 Zetec Rocam", "1.6 Zetec Rocam"],
      "Titanium": ["1.6 Sigma", "1.0 EcoBoost"]
    },
    "Focus": {
      "GL": ["1.6 Sigma", "1.6 Zetec Rocam"],
      "GLX": ["1.6 Sigma", "2.0 Duratec"],
      "Ghia": ["2.0 Duratec"],
      "Titanium": ["2.0 Duratec Direct"]
    },
    "Escort": {
      "L": ["1.6 CHT"],
      "GL": ["1.6 CHT", "1.8 AP"],
      "GLX": ["1.8 AP", "1.8 16V Zetec"],
      "XR3": ["1.8 AP", "2.0 AP"]
    },
    "EcoSport": {
      "SE": ["1.5 Dragon"],
      "FreeStyle": ["1.5 Dragon"],
      "Titanium": ["1.5 Dragon"],
      "Storm": ["2.0 Direct Flex"],
      "G1": ["1.6 Zetec Rocam", "2.0 Duratec"]
    },
    "Fusion": {
      "SEL": ["2.3 16V", "2.5 16V", "3.0 V6"],
      "Titanium": ["2.0 EcoBoost"],
      "Hybrid": ["2.5 Hybrid"]
    },
    "Territory": {
      "Titanium": ["1.5 Turbo"]
    },
    "Maverick": {
      "Lariat FX4": ["2.0 EcoBoost"],
      "Hybrid": ["2.5 Hybrid"]
    },
    "Mustang": {
      "GT Premium": ["5.0 V8"],
      "Mach 1": ["5.0 V8"]
    },
    "Transit": {
      "Furgão": ["2.0 Diesel"],
      "Chassi": ["2.0 Diesel"],
      "Minibus": ["2.0 Diesel"]
    }
  },
  "Renault": {
    "Sandero": {
      "Authentique": ["1.0 SCe"],
      "Expression": ["1.0 SCe", "1.6 SCe"],
      "Stepway": ["1.6 SCe"],
      "R.S.": ["2.0 Aspirado"]
    },
    "Logan": {
      "Life": ["1.0 SCe"],
      "Zen": ["1.0 SCe", "1.6 SCe"],
      "Intense": ["1.6 SCe"]
    },
    "Duster": {
      "Intense": ["1.6 SCe"],
      "Iconic": ["1.6 SCe", "1.3 Turbo TCe"]
    },
    "Kwid": {
      "Zen": ["1.0 SCe"],
      "Intense": ["1.0 SCe"],
      "Outsider": ["1.0 SCe"],
      "E-Tech": ["Elétrico"]
    },
    "Oroch": {
      "Pro": ["1.6 SCe"],
      "Intense": ["1.6 SCe"],
      "Outsider": ["1.3 Turbo TCe"]
    },
    "Kardian": {
      "Evolution": ["1.0 Turbo"],
      "Techno": ["1.0 Turbo"],
      "Premiere Edition": ["1.0 Turbo"]
    },
    "Master": {
      "Furgão": ["2.3 Diesel"],
      "Chassi": ["2.3 Diesel"],
      "Vitré": ["2.3 Diesel"],
      "Minibus": ["2.3 Diesel"]
    }
  },
  "Peugeot": {
    "208": {
      "Active": ["1.0 Firefly", "1.6 16V"],
      "Allure": ["1.6 16V", "1.0 Turbo (T200)"],
      "Griffe": ["1.6 16V", "1.0 Turbo (T200)"],
      "Style": ["1.0 Firefly", "1.0 Turbo (T200)"],
      "e-208 GT": ["Elétrico"]
    },
    "2008": {
      "Allure": ["1.6 16V", "1.0 Turbo (T200)"],
      "Griffe": ["1.6 Turbo THP", "1.0 Turbo (T200)"],
      "Style": ["1.6 16V"],
      "Roadtrip": ["1.6 16V"]
    },
    "3008": {
      "Griffe": ["1.6 Turbo THP"],
      "GT": ["1.6 Turbo THP"]
    },
    "5008": {
      "Griffe": ["1.6 Turbo THP"]
    },
    "Partner": {
      "Rapid Business": ["1.4 Fire"]
    },
    "Expert": {
      "Cargo": ["1.5 Diesel"],
      "Vitré": ["1.5 Diesel"],
      "Minibus": ["1.5 Diesel"]
    }
  },
  "Citroën": {
    "C3": {
      "Live": ["1.0 Firefly"],
      "Feel": ["1.0 Firefly", "1.6 16V"],
      "First Edition": ["1.0 Firefly", "1.6 16V"]
    },
    "C3 Aircross": {
      "Feel": ["1.0 Turbo (T200)"],
      "Feel Pack": ["1.0 Turbo (T200)"],
      "Shine": ["1.0 Turbo (T200)"]
    },
    "C4 Cactus": {
      "Feel": ["1.6 16V"],
      "Shine": ["1.6 Turbo THP"],
      "Noir": ["1.6 Turbo THP"]
    },
    "C4 Lounge": {
      "Origine": ["1.6 Turbo THP"],
      "Tendance": ["1.6 Turbo THP"],
      "Exclusive": ["1.6 Turbo THP"]
    },
    "Jumpy": {
      "Cargo": ["1.5 Diesel"],
      "Vitré": ["1.5 Diesel"]
    },
    "Jumper": {
      "Cargo": ["2.2 Diesel"],
      "Minibus": ["2.2 Diesel"]
    }
  },
  "Jeep": {
    "Compass": {
      "Sport": ["1.3 Turbo (T270)"],
      "Longitute": ["1.3 Turbo (T270)", "2.0 Diesel"],
      "Limited": ["1.3 Turbo (T270)", "2.0 Diesel"],
      "S": ["1.3 Turbo (T270)", "2.0 Diesel"],
      "Trailhawk": ["2.0 Diesel"]
    },
    "Renegade": {
      "1.3 Turbo": ["1.3 Turbo (T270)"],
      "Sport": ["1.3 Turbo (T270)"],
      "Longitude": ["1.3 Turbo (T270)"],
      "S": ["1.3 Turbo (T270) 4x4"],
      "Trailhawk": ["1.3 Turbo (T270) 4x4"]
    },
    "Commander": {
      "Longitude": ["1.3 Turbo (T270)"],
      "Limited": ["1.3 Turbo (T270)", "2.0 Diesel"],
      "Overland": ["1.3 Turbo (T270)", "2.0 Diesel"],
      "Blackhawk": ["2.0 Turbo Gasolina"]
    },
    "Grand Cherokee": {
      "Limited": ["3.6 V6"],
      "4xe": ["2.0 Turbo Hybrid"]
    },
    "Wrangler": {
      "Sahara": ["2.0 Turbo"],
      "Rubicon": ["2.0 Turbo"]
    }
  },
  "Nissan": {
    "Kicks": {
      "Active": ["1.6 16V"],
      "Sense": ["1.6 16V"],
      "Advance": ["1.6 16V"],
      "Exclusive": ["1.6 16V"]
    },
    "Frontier": {
      "S": ["2.3 Diesel Turbo"],
      "Attack": ["2.3 Diesel Biturbo"],
      "XE": ["2.3 Diesel Biturbo"],
      "Platinum": ["2.3 Diesel Biturbo"],
      "PRO-4X": ["2.3 Diesel Biturbo"]
    },
    "Versa": {
      "Sense": ["1.6 16V"],
      "Advance": ["1.6 16V"],
      "Exclusive": ["1.6 16V"]
    },
    "Sentra": {
      "Advance": ["2.0 16V"],
      "Exclusive": ["2.0 16V"]
    },
    "Leaf": {
      "Tekna": ["Elétrico"]
    }
  },
  "Mitsubishi": {
    "L200": {
      "GL": ["2.4 Diesel"],
      "GLS": ["2.4 Diesel"],
      "HPE": ["2.4 Diesel"],
      "HPE-S": ["2.4 Diesel"],
      "Savana": ["2.4 Diesel"]
    },
    "Pajero": {
      "HPE": ["2.4 Diesel"],
      "HPE-S": ["2.4 Diesel"],
      "Legend": ["2.4 Diesel"]
    },
    "Eclipse Cross": {
      "GLS": ["1.5 Turbo"],
      "HPE": ["1.5 Turbo"],
      "HPE-S": ["1.5 Turbo"],
      "HPE-S S-AWC": ["1.5 Turbo"]
    },
    "Outlander": {
      "HPE": ["2.0 16V", "3.0 V6"],
      "HPE-S": ["3.0 V6"]
    }
  },
  "Land Rover": {
    "Range Rover Evoque": {
      "SE": ["2.0 Turbo"],
      "R-Dynamic": ["2.0 Turbo"],
      "HSE": ["2.0 Turbo"]
    },
    "Range Rover Sport": {
      "Dynamic SE": ["3.0 Diesel", "3.0 Hybrid"],
      "Dynamic HSE": ["3.0 Diesel", "3.0 Hybrid"],
      "Autobiography": ["3.0 Diesel", "4.4 V8"]
    },
    "Discovery": {
      "S": ["3.0 Diesel"],
      "SE": ["3.0 Diesel"],
      "HSE": ["3.0 Diesel"],
      "Metropolitan": ["3.0 Diesel"]
    },
    "Defender": {
      "90": ["2.0 Turbo", "3.0 Diesel"],
      "110": ["2.0 Turbo", "3.0 Diesel"],
      "130": ["3.0 Diesel"],
      "X-Dynamic": ["3.0 Diesel"]
    },
    "Velar": {
      "S": ["2.0 Turbo"],
      "Dynamic SE": ["2.0 Turbo", "3.0 Hybrid"],
      "Dynamic HSE": ["3.0 Hybrid"]
    },
    "Freelander": {
      "S": ["1.8 16V Gasolina", "2.0 Td4 Diesel", "2.2 TD4 Diesel", "3.2 i6 Gasolina"],
      "SE": ["1.8 16V Gasolina", "2.0 Td4 Diesel", "2.5 V6 Gasolina", "2.2 SD4 Diesel", "3.2 i6 Gasolina", "2.0 Si4 Turbo"],
      "HSE": ["2.0 Td4 Diesel", "2.5 V6 Gasolina", "2.2 SD4 Diesel", "3.2 i6 Gasolina", "2.0 Si4 Turbo"],
      "Dynamic": ["2.2 SD4 Diesel", "2.0 Si4 Turbo"]
    }
  },
  "Volvo": {
    "XC40": {
      "T4": ["2.0 Turbo"],
      "T5": ["2.0 Turbo Hybrid"],
      "Recharge Plus": ["Elétrico"],
      "Recharge Ultimate": ["Elétrico"]
    },
    "XC60": {
      "T5": ["2.0 Turbo"],
      "T6": ["2.0 Turbo Hybrid"],
      "T8": ["2.0 Turbo Hybrid"],
      "Plus": ["2.0 Turbo Hybrid"],
      "Ultimate": ["2.0 Turbo Hybrid"],
      "Polestar Engineered": ["2.0 Turbo Hybrid"]
    },
    "XC90": {
      "D5": ["2.0 Diesel"],
      "T8": ["2.0 Turbo Hybrid"],
      "Plus": ["2.0 Turbo Hybrid"],
      "Ultimate": ["2.0 Turbo Hybrid"]
    },
    "C40": {
      "Recharge Plus": ["Elétrico"],
      "Recharge Ultimate": ["Elétrico"]
    },
    "EX30": {
      "Core": ["Elétrico"],
      "Plus": ["Elétrico"],
      "Ultra": ["Elétrico"]
    }
  },
  "Kia": {
    "Sportage": {
      "EX": ["1.6 Turbo Hybrid"],
      "EX Prestige": ["1.6 Turbo Hybrid"]
    },
    "Niro": {
      "EX": ["1.6 Hybrid"],
      "SX Prestige": ["1.6 Hybrid"]
    },
    "Stonic": {
      "SX": ["1.0 Turbo Hybrid"]
    },
    "Sorento": {
      "EX": ["2.5 Turbo"],
      "SX": ["2.5 Turbo"]
    },
    "Cerato": {
      "EX": ["2.0 16V"],
      "SX": ["2.0 16V"]
    },
    "Bongo": {
      "K2500": ["2.5 Diesel"]
    }
  },
  "BYD": {
    "Dolphin": {
      "Mini": ["Elétrico"],
      "Standard": ["Elétrico"],
      "Plus": ["Elétrico"]
    },
    "Seal": {
      "AWD": ["Elétrico"]
    },
    "Song Plus": {
      "DM-i": ["1.5 Hybrid"]
    },
    "Song Pro": {
      "GL": ["1.5 Hybrid"],
      "GS": ["1.5 Hybrid"]
    },
    "Yuan Plus": {
      "EV": ["Elétrico"]
    },
    "Tan": {
      "EV": ["Elétrico"]
    },
    "Han": {
      "EV": ["Elétrico"]
    },
    "King": {
      "GL": ["1.5 Hybrid"],
      "GS": ["1.5 Hybrid"]
    },
    "Shark": {
      "GS": ["1.5 Hybrid"]
    }
  },
  "GWM": {
    "Haval H6": {
      "HEV": ["1.5 Hybrid"],
      "PHEV": ["1.5 Hybrid"],
      "GT": ["1.5 Hybrid"]
    },
    "Ora 03": {
      "Skin": ["Elétrico"],
      "GT": ["Elétrico"]
    }
  },
  "Ram": {
    "Rampage": {
      "Rebel": ["2.0 Diesel", "2.0 Turbo Gasolina"],
      "Laramie": ["2.0 Diesel", "2.0 Turbo Gasolina"],
      "RT": ["2.0 Turbo Gasolina"]
    },
    "1500": {
      "Rebel": ["5.7 V8"],
      "Limited": ["5.7 V8"],
      "Night Edition": ["5.7 V8"]
    },
    "2500": {
      "Laramie": ["6.7 Diesel"]
    },
    "3500": {
      "Laramie": ["6.7 Diesel"],
      "Limited": ["6.7 Diesel"]
    }
  },
  "Porsche": {
    "911": {
      "Carrera": ["3.0 Boxer Turbo", "3.4 Boxer", "3.6 Boxer"],
      "Carrera S": ["3.0 Boxer Turbo", "3.8 Boxer"],
      "Carrera GTS": ["3.0 Boxer Turbo"],
      "Turbo": ["3.7 Boxer Turbo", "3.8 Boxer Turbo"],
      "Turbo S": ["3.8 Boxer Turbo"],
      "GT3": ["4.0 Boxer"],
      "GT3 RS": ["4.0 Boxer"],
      "GT2 RS": ["3.8 Boxer Turbo"],
      "Targa 4": ["3.0 Boxer Turbo"],
      "Targa 4S": ["3.0 Boxer Turbo"]
    },
    "Cayenne": {
      "Base": ["3.0 V6 Turbo", "3.6 V6"],
      "E-Hybrid": ["3.0 V6 Hybrid"],
      "S": ["2.9 V6 Biturbo", "4.0 V8 Turbo", "3.6 V6 Biturbo"],
      "GTS": ["4.0 V8 Turbo", "3.6 V6 Biturbo"],
      "Turbo": ["4.0 V8 Turbo", "4.8 V8 Turbo"],
      "Turbo S E-Hybrid": ["4.0 V8 Hybrid"],
      "Turbo GT": ["4.0 V8 Turbo"],
      "Coupe": ["3.0 V6 Turbo", "2.9 V6 Biturbo", "4.0 V8 Turbo"]
    },
    "Macan": {
      "Base": ["2.0 Turbo"],
      "T": ["2.0 Turbo"],
      "S": ["2.9 V6 Biturbo", "3.0 V6 Biturbo"],
      "GTS": ["2.9 V6 Biturbo", "3.0 V6 Biturbo"],
      "Turbo": ["2.9 V6 Biturbo", "3.6 V6 Biturbo"],
      "Electric": ["Elétrico"]
    },
    "Taycan": {
      "Base": ["Elétrico"],
      "4S": ["Elétrico"],
      "GTS": ["Elétrico"],
      "Turbo": ["Elétrico"],
      "Turbo S": ["Elétrico"],
      "Turbo GT": ["Elétrico"],
      "Cross Turismo": ["Elétrico"],
      "Sport Turismo": ["Elétrico"]
    },
    "Panamera": {
      "Base": ["2.9 V6 Biturbo", "3.0 V6 Turbo", "3.6 V6"],
      "4": ["2.9 V6 Biturbo", "3.0 V6 Turbo"],
      "4 E-Hybrid": ["2.9 V6 Hybrid"],
      "4S": ["2.9 V6 Biturbo", "3.0 V6 Biturbo"],
      "GTS": ["4.0 V8 Turbo", "4.8 V8"],
      "Turbo": ["4.0 V8 Turbo", "4.8 V8 Turbo"],
      "Turbo S E-Hybrid": ["4.0 V8 Hybrid"],
      "Sport Turismo": ["2.9 V6 Biturbo", "4.0 V8 Turbo"]
    },
    "718 Boxster": {
      "Base": ["2.0 Boxer Turbo"],
      "S": ["2.5 Boxer Turbo"],
      "GTS 4.0": ["4.0 Boxer"],
      "Spyder": ["4.0 Boxer"],
      "Spyder RS": ["4.0 Boxer"]
    },
    "718 Cayman": {
      "Base": ["2.0 Boxer Turbo"],
      "S": ["2.5 Boxer Turbo"],
      "GTS 4.0": ["4.0 Boxer"],
      "GT4": ["4.0 Boxer"],
      "GT4 RS": ["4.0 Boxer"]
    },
    "918 Spyder": {
      "Weissach Package": ["4.6 V8 Hybrid"]
    },
    "Carrera GT": {
      "Base": ["5.7 V10"]
    }
  },
  "Maserati": {
    "Ghibli": {
      "Modena": ["3.0 V6 Turbo"],
      "Trofeo": ["3.8 V8 Turbo"],
      "S Q4": ["3.0 V6 Biturbo"],
      "Diesel": ["3.0 V6 Diesel"]
    },
    "Levante": {
      "Modena": ["3.0 V6 Turbo"],
      "Trofeo": ["3.8 V8 Turbo"],
      "Hybrid": ["2.0 Turbo Hybrid"],
      "S": ["3.0 V6 Biturbo"],
      "GTS": ["3.8 V8 Biturbo"]
    },
    "Quattroporte": {
      "Modena": ["3.0 V6 Turbo"],
      "Trofeo": ["3.8 V8 Turbo"],
      "S": ["3.0 V6 Biturbo"],
      "GTS": ["3.8 V8 Biturbo"]
    },
    "MC20": {
      "Cielo": ["3.0 V6 Nettuno"],
      "Coupe": ["3.0 V6 Nettuno"]
    },
    "Grecale": {
      "GT": ["2.0 Turbo Hybrid"],
      "Modena": ["2.0 Turbo Hybrid"],
      "Trofeo": ["3.0 V6 Turbo"]
    },
    "GranTurismo": {
      "Modena": ["3.0 V6 Nettuno"],
      "Trofeo": ["3.0 V6 Nettuno"],
      "Folgore": ["Elétrico"],
      "Sport": ["4.7 V8"],
      "MC Stradale": ["4.7 V8"]
    },
    "GranCabrio": {
      "Trofeo": ["3.0 V6 Nettuno"],
      "Sport": ["4.7 V8"],
      "MC": ["4.7 V8"]
    },
    "Coupé": {
      "GT": ["4.2 V8"],
      "Cambiocorsa": ["4.2 V8"],
      "GranSport": ["4.2 V8"]
    },
    "Spyder": {
      "GT": ["4.2 V8"],
      "Cambiocorsa": ["4.2 V8"],
      "90th Anniversary": ["4.2 V8"]
    },
    "3200 GT": {
      "Assetto Corsa": ["3.2 V8 Biturbo"],
      "GTA": ["3.2 V8 Biturbo"]
    }
  },
  "Ferrari": {
    "296 GTB": {
      "Assetto Fiorano": ["2.9 V6 Hybrid"]
    },
    "SF90 Stradale": {
      "Assetto Fiorano": ["4.0 V8 Hybrid"]
    },
    "F8 Tributo": {
      "Spider": ["3.9 V8 Turbo"]
    },
    "Roma": {
      "Standard": ["3.9 V8 Turbo"]
    },
    "Portofino M": {
      "Standard": ["3.9 V8 Turbo"]
    },
    "Purosangue": {
      "Standard": ["6.5 V12"]
    }
  },
  "Lamborghini": {
    "Urus": {
      "Performante": ["4.0 V8 Turbo"],
      "S": ["4.0 V8 Turbo"]
    },
    "Huracán": {
      "EVO": ["5.2 V10"],
      "Tecnica": ["5.2 V10"],
      "STO": ["5.2 V10"],
      "Sterrato": ["5.2 V10"]
    },
    "Revuelto": {
      "Standard": ["6.5 V12 Hybrid"]
    }
  },
  "Jaguar": {
    "X-Type": {
      "2.0 V6": ["2.0 V6 Gasolina"],
      "2.5 V6": ["2.5 V6 Gasolina"],
      "3.0 V6": ["3.0 V6 Gasolina"],
      "2.0D": ["2.0 Diesel"],
      "2.2D": ["2.2 Diesel"]
    },
    "XF": {
      "Luxury": ["2.0 Turbo", "2.0 Diesel"],
      "Premium Luxury": ["3.0 V6", "5.0 V8"],
      "S": ["3.0 V6 Diesel"]
    },
    "F-Pace": {
      "SVR": ["5.0 V8 Supercharged"],
      "R-Dynamic": ["2.0 Turbo", "3.0 Hybrid"]
    },
    "E-Pace": {
      "SE": ["2.0 Turbo"]
    },
    "F-Type": {
      "R-Dynamic": ["2.0 Turbo", "5.0 V8"]
    },
    "I-Pace": {
      "EV400": ["Elétrico"]
    }
  },
  "Lexus": {
    "UX 250h": {
      "Luxury": ["2.0 Hybrid"]
    },
    "NX 350h": {
      "Luxury": ["2.5 Hybrid"],
      "F-Sport": ["2.5 Hybrid"]
    },
    "RX 500h": {
      "F-Sport": ["2.4 Turbo Hybrid"]
    },
    "ES 300h": {
      "Luxury": ["2.5 Hybrid"]
    },
    "LS 500h": {
      "Luxury": ["3.5 V6 Hybrid"]
    }
  },
  "Subaru": {
    "XV": {
      "S": ["2.0 Boxer"]
    },
    "Forester": {
      "S": ["2.0 Boxer Hybrid"]
    },
    "Outback": {
      "Limited": ["2.5 Boxer"]
    },
    "WRX": {
      "STI": ["2.5 Boxer Turbo"],
      "Sedan": ["2.4 Boxer Turbo"]
    }
  },
  "Suzuki": {
    "Jimny Sierra": {
      "4You": ["1.5 16V"],
      "4Style": ["1.5 16V"],
      "4Expedition": ["1.5 16V"]
    },
    "Vitara": {
      "4Style": ["1.4 Turbo"]
    },
    "S-Cross": {
      "4Style": ["1.4 Turbo"]
    }
  },
  "JAC": {
    "E-JS1": {
      "EXT": ["Elétrico"]
    },
    "E-JS4": {
      "Standard": ["Elétrico"]
    },
    "E-J7": {
      "Standard": ["Elétrico"]
    },
    "T60 Plus": {
      "Turbo": ["1.5 Turbo"]
    },
    "iEV40": {
      "Standard": ["Elétrico"]
    }
  },
  "CAOA Chery": {
    "Tiggo (G1)": {
      "2.0 16V": ["2.0 16V"]
    },
    "Tiggo 2": {
      "Look": ["1.5 16V"],
      "Smile": ["1.5 16V"],
      "ACT": ["1.5 16V"]
    },
    "Tiggo 3X": {
      "Plus": ["1.0 Turbo"],
      "Pro": ["1.0 Turbo"]
    },
    "Tiggo 5X": {
      "Pro": ["1.5 Turbo"],
      "Hybrid": ["1.5 Turbo Hybrid"],
      "TXS": ["1.5 Turbo"],
      "Sport": ["1.5 Turbo"]
    },
    "Tiggo 7": {
      "Pro": ["1.6 Turbo"],
      "Hybrid": ["1.5 Turbo Hybrid"],
      "TXS": ["1.5 Turbo"],
      "Sport": ["1.5 Turbo"]
    },
    "Tiggo 8": {
      "Pro": ["1.6 Turbo"],
      "Founder Edition": ["1.6 Turbo"],
      "Hybrid": ["1.5 Turbo Hybrid"],
      "TXS": ["1.6 Turbo"],
      "Max Drive": ["1.6 Turbo"]
    },
    "Arrizo 5": {
      "RT": ["1.5 Turbo"],
      "RTS": ["1.5 Turbo"],
      "RX": ["1.5 Turbo"]
    },
    "Arrizo 6": {
      "Pro": ["1.5 Turbo Hybrid"],
      "GSX": ["1.5 Turbo"]
    },
    "QQ": {
      "Smile": ["1.0 12V"],
      "Look": ["1.0 12V"],
      "ACT": ["1.0 12V"],
      "1.0 8V": ["1.0 8V"]
    },
    "Celer": {
      "Hatch": ["1.5 16V"],
      "Sedan": ["1.5 16V"]
    },
    "Face": {
      "1.3 16V": ["1.3 16V"]
    },
    "Cielo": {
      "Hatch": ["1.6 16V"],
      "Sedan": ["1.6 16V"]
    },
    "iCar": {
      "Standard": ["Elétrico"]
    }
  },
  "Mini": {
    "Cooper": {
      "S": ["2.0 Turbo"],
      "SE": ["Elétrico"],
      "JCW": ["2.0 Turbo"]
    },
    "Countryman": {
      "S": ["2.0 Turbo"],
      "SE": ["1.5 Turbo Hybrid"],
      "JCW": ["2.0 Turbo"]
    },
    "Clubman": {
      "JCW": ["2.0 Turbo"]
    }
  },
  "Aston Martin": {
    "DBX": {
      "Standard": ["4.0 V8 Turbo"],
      "707": ["4.0 V8 Turbo"]
    },
    "Vantage": {
      "Standard": ["4.0 V8 Turbo"],
      "F1 Edition": ["4.0 V8 Turbo"]
    },
    "DBS": {
      "Volante": ["5.2 V12 Turbo"]
    }
  },
  "McLaren": {
    "Artura": {
      "Standard": ["3.0 V6 Hybrid"]
    },
    "720S": {
      "Spider": ["4.0 V8 Turbo"]
    },
    "GT": {
      "Standard": ["4.0 V8 Turbo"]
    }
  },
  "Bentley": {
    "Bentayga": {
      "V8": ["4.0 V8 Turbo"],
      "Hybrid": ["3.0 V6 Hybrid"]
    },
    "Continental GT": {
      "V8": ["4.0 V8 Turbo"],
      "W12": ["6.0 W12 Turbo"]
    },
    "Flying Spur": {
      "V8": ["4.0 V8 Turbo"],
      "Hybrid": ["2.9 V6 Hybrid"]
    }
  },
  "Rolls-Royce": {
    "Cullinan": {
      "Black Badge": ["6.7 V12 Turbo"]
    },
    "Ghost": {
      "Extended": ["6.7 V12 Turbo"]
    },
    "Phantom": {
      "Standard": ["6.7 V12 Turbo"]
    },
    "Spectre": {
      "Standard": ["Elétrico"]
    }
  },
  "SsangYong": {
    "Korando": {
      "GLS": ["1.5 Turbo"]
    },
    "Tivoli": {
      "GLS": ["1.5 Turbo"]
    },
    "Musso": {
      "Grand": ["2.2 Diesel"]
    }
  },
  "Alfa Romeo": {
    "Giulia": {
      "Veloce": ["2.0 Turbo"],
      "Quadrifoglio": ["2.9 V6 Biturbo"]
    },
    "Stelvio": {
      "Veloce": ["2.0 Turbo"],
      "Quadrifoglio": ["2.9 V6 Biturbo"]
    },
    "Tonale": {
      "Veloce": ["1.3 Turbo Hybrid"]
    }
  },
  "DS": {
    "DS 3": {
      "Crossback": ["1.2 Turbo"]
    },
    "DS 7": {
      "Crossback": ["1.6 Turbo"]
    },
    "DS 9": {
      "E-Tense": ["1.6 Turbo Hybrid"]
    }
  },
  "Dodge": {
    "Challenger": {
      "Scat Pack": ["6.4 V8"],
      "Hellcat": ["6.2 V8 Supercharged"]
    },
    "Durango": {
      "GT": ["3.6 V6"],
      "RT": ["5.7 V8"]
    }
  },
  "Smart": {
    "Fortwo": {
      "mhd": ["1.0 Aspirado"],
      "Turbo": ["1.0 Turbo"],
      "Electric Drive": ["Elétrico"]
    }
  },
  "Lifan": {
    "X60": {
      "Talent": ["1.8 16V"],
      "VIP": ["1.8 16V"]
    },
    "530": {
      "Talent": ["1.5 16V"]
    },
    "X80": {
      "VIP": ["2.0 Turbo"]
    }
  },
  "Geely": {
    "EC7": {
      "GS": ["1.8 16V"]
    },
    "GC2": {
      "GL": ["1.0 12V"]
    }
  },
  "Jinbei": {
    "Topic": {
      "Passageiro": ["2.0 Gasolina", "2.2 Diesel"],
      "Furgão": ["2.0 Gasolina", "2.2 Diesel"]
    }
  },
  "Effa": {
    "M100": {
      "Standard": ["1.0 8V"]
    },
    "V21": {
      "Picape": ["1.3 16V"]
    },
    "V22": {
      "Cabine Dupla": ["1.3 16V"]
    }
  },
  "Shineray": {
    "T20": {
      "Picape": ["1.0 8V"]
    },
    "T22": {
      "Cabine Dupla": ["1.0 8V"]
    }
  },
  "Pagani": {
    "Huayra": {
      "Roadster": ["6.0 V12 Biturbo"]
    }
  },
  "Koenigsegg": {
    "Jesko": {
      "Absolut": ["5.0 V8 Biturbo"]
    }
  },
  "Bugatti": {
    "Chiron": {
      "Pur Sport": ["8.0 W16 Tetraturbo"]
    }
  },
  "Tesla": {
    "Model 3": {
      "Performance": ["Elétrico"],
      "Long Range": ["Elétrico"]
    },
    "Model S": {
      "Plaid": ["Elétrico"]
    },
    "Model X": {
      "Plaid": ["Elétrico"]
    },
    "Model Y": {
      "Performance": ["Elétrico"]
    },
    "Cybertruck": {
      "Cyberbeast": ["Elétrico"]
    }
  },
  "Rivian": {
    "R1T": {
      "Quad-Motor": ["Elétrico"]
    },
    "R1S": {
      "Quad-Motor": ["Elétrico"]
    }
  },
  "Lucid": {
    "Air": {
      "Sapphire": ["Elétrico"]
    }
  },
  "Polestar": {
    "Polestar 2": {
      "Long Range": ["Elétrico"]
    },
    "Polestar 3": {
      "Performance": ["Elétrico"]
    }
  },
  "Genesis": {
    "G70": {
      "Sport": ["3.3 V6 Turbo"]
    },
    "GV80": {
      "Prestige": ["3.5 V6 Turbo"]
    }
  },
  "Infiniti": {
    "QX80": {
      "Sensory": ["5.6 V8"]
    },
    "Q50": {
      "Red Sport": ["3.0 V6 Turbo"]
    }
  },
  "Acura": {
    "NSX": {
      "Type S": ["3.5 V6 Hybrid"]
    },
    "MDX": {
      "Type S": ["3.0 V6 Turbo"]
    }
  },
  "Cadillac": {
    "Escalade": {
      "V-Series": ["6.2 V8 Supercharged"]
    },
    "CT5-V": {
      "Blackwing": ["6.2 V8 Supercharged"]
    }
  },
  "Lincoln": {
    "Navigator": {
      "Black Label": ["3.5 V6 Turbo"]
    }
  },
  "GMC": {
    "Hummer EV": {
      "Edition 1": ["Elétrico"]
    },
    "Sierra": {
      "Denali Ultimate": ["6.2 V8"]
    }
  },
  "Chrysler": {
    "300C": {
      "Luxury": ["3.6 V6", "5.7 V8"]
    },
    "Pacifica": {
      "Pinnacle": ["3.6 V6 Hybrid"]
    }
  },
  "Hummer": {
    "H2": {
      "Adventure": ["6.0 V8", "6.2 V8"]
    },
    "H3": {
      "Luxury": ["3.5 L5", "3.7 L5", "5.3 V8"]
    }
  },
  "MG": {
    "MG4": {
      "Standard": ["Elétrico"]
    },
    "MG5": {
      "Standard": ["Elétrico"]
    },
    "Marvel R": {
      "Standard": ["Elétrico"]
    },
    "Cyberster": {
      "Standard": ["Elétrico"]
    }
  },
  "Zeekr": {
    "001": {
      "Standard": ["Elétrico"]
    },
    "X": {
      "Standard": ["Elétrico"]
    }
  },
  "Nio": {
    "ET7": {
      "Standard": ["Elétrico"]
    },
    "ES8": {
      "Standard": ["Elétrico"]
    }
  },
  "XPeng": {
    "P7": {
      "Standard": ["Elétrico"]
    },
    "G9": {
      "Standard": ["Elétrico"]
    }
  },
  "VinFast": {
    "VF 8": {
      "Standard": ["Elétrico"]
    },
    "VF 9": {
      "Standard": ["Elétrico"]
    }
  },
  "Chana": {
    "Star": {
      "Picape": ["1.0 8V"],
      "Van": ["1.0 8V"]
    },
    "Family": {
      "Standard": ["1.3 16V"]
    }
  },
  "Hafei": {
    "Towner": {
      "Picape": ["1.0 8V"],
      "Van": ["1.0 8V"]
    },
    "Mini": {
      "Standard": ["1.0 8V"]
    }
  },
  "Rely": {
    "Link": {
      "Standard": ["1.3 16V"]
    },
    "Pick-up": {
      "Standard": ["1.3 16V"]
    }
  },
  "Foton": {
    "Tunland": {
      "Standard": ["2.8 Diesel"]
    },
    "Gratour": {
      "Standard": ["1.2 16V"]
    }
  },
  "Higer": {
    "Azure": {
      "Bus": ["Elétrico"]
    }
  },
  "Mercedes-Benz": {
    "Classe A": {
      "A 200": ["1.3 Turbo", "1.6 Turbo"],
      "A 250": ["2.0 Turbo"]
    },
    "Classe C": {
      "C 180": ["1.6 Turbo", "1.5 Turbo Hybrid"],
      "C 200": ["1.5 Turbo Hybrid", "2.0 Turbo"],
      "C 300": ["2.0 Turbo"]
    },
    "Classe E": {
      "E 250": ["2.0 Turbo"],
      "E 300": ["2.0 Turbo"],
      "E 400": ["3.0 V6 Biturbo"]
    },
    "GLA": {
      "GLA 200": ["1.3 Turbo", "1.6 Turbo"],
      "GLA 250": ["2.0 Turbo"]
    },
    "GLC": {
      "GLC 220d": ["2.0 Diesel"],
      "GLC 250": ["2.0 Turbo"],
      "GLC 300": ["2.0 Turbo"]
    },
    "GLE": {
      "GLE 400d": ["3.0 Diesel"],
      "GLE 450": ["3.0 Turbo"]
    },
    "Sprinter": {
      "311": ["2.2 Diesel"],
      "313": ["2.2 Diesel"],
      "314": ["2.2 Diesel"],
      "415": ["2.2 Diesel"],
      "416": ["2.2 Diesel"],
      "515": ["2.2 Diesel"],
      "516": ["2.2 Diesel"]
    }
  },
  "BMW": {
    "Série 1": {
      "118i": ["1.5 Turbo"],
      "120i": ["2.0 Turbo"]
    },
    "Série 3": {
      "320i": ["2.0 Turbo"],
      "330e": ["2.0 Turbo Hybrid"],
      "328i": ["2.0 Turbo"]
    },
    "Série 5": {
      "530i": ["2.0 Turbo"],
      "540i": ["3.0 Turbo"],
      "M5": ["4.4 V8 Biturbo"]
    },
    "X1": {
      "sDrive18i": ["1.5 Turbo"],
      "sDrive20i": ["2.0 Turbo"]
    },
    "X3": {
      "xDrive20d": ["2.0 Diesel"],
      "xDrive30e": ["2.0 Turbo Hybrid"]
    },
    "X5": {
      "xDrive45e": ["3.0 Turbo Hybrid"],
      "xDrive30d": ["3.0 Diesel"]
    }
  },
  "Audi": {
    "A3": {
      "1.4 TFSI": ["1.4 Turbo"],
      "2.0 TFSI": ["2.0 Turbo"]
    },
    "A4": {
      "2.0 TFSI": ["2.0 Turbo"]
    },
    "A5": {
      "Sportback": ["2.0 TFSI"]
    },
    "Q3": {
      "1.4 TFSI": ["1.4 Turbo"],
      "2.0 TFSI": ["2.0 Turbo"]
    },
    "Q5": {
      "2.0 TFSI": ["2.0 Turbo"],
      "2.0 TDI": ["2.0 Diesel"]
    },
    "Q7": {
      "3.0 TDI": ["3.0 Diesel"]
    }
  },
  "Troller": {
    "T4": {
      "XLT": ["3.2 Diesel"],
      "TX4": ["3.2 Diesel"]
    }
  },
  "Iveco": {
    "Daily": {
      "30-130": ["3.0 Diesel"],
      "35-150": ["3.0 Diesel"],
      "45-170": ["3.0 Diesel"],
      "55-170": ["3.0 Diesel"]
    }
  }
};

export const SUB_MODELS: Record<string, string[]> = {
  "458": ["Italia", "Spider", "Speciale"],
  "488": ["GTB", "Spider", "Pista"],
  "718 Boxster": ["981", "982"],
  "718 Cayman": ["981", "982"],
  "911": ["930", "964", "993", "996", "997", "991", "992"],
  "A3": ["8L", "8P", "8V", "8Y"],
  "A4": ["B5", "B6", "B7", "B8", "B9"],
  "A5": ["Sportback", "Coupe", "Cabriolet"],
  "A6": ["C5", "C6", "C7", "C8"],
  "Aventador": ["LP700-4", "LP740-4 S", "LP770-4 SVJ", "LP780-4 Ultimae"],
  "Cayenne": ["E1 (955/957)", "E2 (958)", "E3 (9Y0)"],
  "City": ["G1 (2009-2014)", "G2 (2014-2021)", "G3 (2021+)"],
  "Civic": ["G8 (New Civic)", "G9 (2012-2016)", "G10 (2016-2021)", "G11 (2022+)"],
  "Classe A": ["W168", "W169", "W176", "W177"],
  "Classe C": ["W202", "W203", "W204", "W205", "W206"],
  "Classe E": ["W210", "W211", "W212", "W213", "W214"],
  "Compass": ["G1 (2007-2016)", "G2 (2016+)"],
  "Corolla": ["G9 (Brad Pitt)", "G10 (2008-2014)", "G11 (2014-2019)", "G12 (2019+)"],
  "Cruze": ["G1", "G2"],
  "Defender": ["Defender 90", "Defender 110", "Defender 130"],
  "Discovery": ["Discovery 3", "Discovery 4", "Discovery 5 (New Discovery)"],
  "Duster": ["G1 (2011-2020)", "G2 (2020+)"],
  "EcoSport": ["G1 (2003-2012)", "G2 (2012-2021)"],
  "F8 Tributo": ["Standard", "Spider"],
  "Fiesta": ["Street", "Class", "Titanium"],
  "Fit": ["G1 (2003-2008)", "G2 (2008-2014)", "G3 (2014-2021)"],
  "Focus": ["G1", "G2", "G3"],
  "Freelander": ["Freelander 1 (L314)", "Freelander 2 (L359)"],
  "Fusca": ["1300", "1500", "1600", "TSI"],
  "Gallardo": ["G1", "G2 (LP560-4)"],
  "Ghibli": ["G1 (AM115)", "G2 (AM336)", "G3 (M157)"],
  "Gol": ["G1 (Quadrado)", "G2 (Bolinha)", "G3", "G4", "G5", "G6", "G7", "G8"],
  "Golf": ["MK4 (Sapão)", "MK4.5", "MK7", "MK7.5", "MK8"],
  "GranTurismo": ["G1 (M147)", "G2 (M189)"],
  "HB20": ["G1 (2012-2019)", "G2 (Novo HB20)"],
  "Hilux": ["G7 (2005-2015)", "G8 (2015+)"],
  "HR-V": ["G1 (2015-2021)", "G2 (2022+)"],
  "Huracán": ["LP610-4", "LP580-2", "Performante", "EVO"],
  "Jetta": ["MK5", "MK6", "MK7"],
  "Kicks": ["G1"],
  "Kwid": ["Fase 1 (2017-2022)", "Fase 2 (2022+)"],
  "L200": ["L200 Outdoor", "L200 Triton", "L200 Triton Sport"],
  "Levante": ["M161"],
  "Logan": ["G1", "G2"],
  "Macan": ["G1 (95B)", "G2 (95B.2)", "G3 (95B.3)", "Electric"],
  "Montana": ["G1 (Frente Agile)", "G2", "G3 (Nova Montana)"],
  "Onix": ["G1 (2012-2019)", "G2 (Novo Onix)"],
  "Palio": ["G1", "G2", "G3", "G4", "Novo Palio (G5)"],
  "Panamera": ["G1 (970)", "G2 (971)", "G3 (972)"],
  "Polo": ["Polo 9N", "Polo 6R", "Polo AW (Novo Polo)"],
  "Q3": ["8U", "F3"],
  "Quattroporte": ["G1", "G2", "G3", "G4", "G5 (M139)", "G6 (M156)"],
  "Range Rover Evoque": ["G1 (L538)", "G2 (L551)"],
  "Range Rover Sport": ["G1 (L320)", "G2 (L494)", "G3 (L461)"],
  "Ranger": ["G1", "G2", "G3 (2012-2023)", "G4 (Nova Ranger)"],
  "Renegade": ["Fase 1 (2015-2022)", "Fase 2 (T270 2022+)"],
  "S10": ["G1 (1995-2012)", "G2 (2012+)"],
  "Sandero": ["G1 (2007-2014)", "G2 (2014+)"],
  "Série 1": ["F20", "F40"],
  "Série 3": ["E36", "E46", "E90", "F30", "G20"],
  "Série 5": ["E34", "E39", "E60", "F10", "G30"],
  "Spin": ["G1", "G2 (Nova Spin)"],
  "Strada": ["G1", "G2"],
  "T-Cross": ["Comfortline", "Highline"],
  "Toro": ["Fase 1 (2016-2021)", "Fase 2 (2021+)"],
  "Tracker": ["G1", "G2", "G3 (Novo Tracker)"],
  "Uno": ["Mille (Antigo)", "Novo Uno (G2)"],
  "Vectra": ["Vectra A", "Vectra B", "Vectra C"],
  "X1": ["E84", "F48", "U11"],
  "X3": ["E83", "F25", "G01"],
  "X5": ["E53", "E70", "F15", "G05"],
  "XC40": ["T4", "T5", "Recharge"],
  "XC60": ["G1", "G2"],
  "XC90": ["G1", "G2"]
};

export const COMMON_OBD_CODES = [
  { code: "P0101", desc: "Fluxo de Ar de Massa (MAF) - Faixa/Desempenho" },
  { code: "P0113", desc: "Sensor de Temperatura do Ar de Admissão 1 - Circuito Alto" },
  { code: "P0135", desc: "Circuito de Aquecimento do Sensor de O2 (Banco 1, Sensor 1)" },
  { code: "P0171", desc: "Sistema Muito Pobre (Banco 1)" },
  { code: "P0172", desc: "Sistema Muito Rico (Banco 1)" },
  { code: "P0300", desc: "Falha de Ignição Aleatória ou Múltipla Detectada" },
  { code: "P0301", desc: "Falha de Ignição no Cilindro 1" },
  { code: "P0302", desc: "Falha de Ignição no Cilindro 2" },
  { code: "P0303", desc: "Falha de Ignição no Cilindro 3" },
  { code: "P0304", desc: "Falha de Ignição no Cilindro 4" },
  { code: "P0420", desc: "Eficiência do Sistema de Catalisador Abaixo do Limite (Banco 1)" },
  { code: "P0442", desc: "Vazamento Pequeno no Sistema de Emissões Evaporativas (EVAP)" },
  { code: "P0505", desc: "Mau Funcionamento do Sistema de Controle de Marcha Lenta" },
  { code: "P0700", desc: "Sistema de Controle de Transmissão (Solicitação de MIL)" },
  { code: "U0100", desc: "Perda de Comunicação com ECM/PCM 'A'" },
];

export const anos = Array.from({ length: 2026 - 1990 + 1 }, (_, i) => (1990 + i).toString());
export const combustiveis = ["Diesel", "Elétrico", "Etanol", "Flex", "GNV", "Gasolina", "Híbrido"];
export const cambios = ["Automático", "Automatizado", "CVT", "DCT", "Manual"];
