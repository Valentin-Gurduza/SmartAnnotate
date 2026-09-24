// High-fidelity vector SVG data scenes for computer vision annotation benchmarks

export const urbanStreetSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#bae6fd"/>
      <stop offset="100%" stop-color="#f0f9ff"/>
    </linearGradient>
    <linearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>

  <!-- Sky -->
  <rect width="1280" height="420" fill="url(#skyGrad)"/>

  <!-- City Skyline / Buildings in Background -->
  <rect x="40" y="160" width="140" height="260" fill="#64748b"/>
  <rect x="200" y="120" width="180" height="300" fill="#475569"/>
  <rect x="400" y="200" width="120" height="220" fill="#94a3b8"/>
  <rect x="540" y="140" width="220" height="280" fill="#64748b"/>
  <rect x="780" y="100" width="160" height="320" fill="#334155"/>
  <rect x="960" y="180" width="150" height="240" fill="#475569"/>
  <rect x="1130" y="150" width="120" height="270" fill="#64748b"/>

  <!-- Building Windows -->
  <g fill="#fef08a" opacity="0.6">
    <rect x="60" y="180" width="15" height="20"/><rect x="90" y="180" width="15" height="20"/>
    <rect x="60" y="220" width="15" height="20"/><rect x="90" y="220" width="15" height="20"/>
    <rect x="220" y="140" width="20" height="25"/><rect x="260" y="140" width="20" height="25"/>
    <rect x="220" y="180" width="20" height="25"/><rect x="260" y="180" width="20" height="25"/>
    <rect x="810" y="130" width="20" height="20"/><rect x="850" y="130" width="20" height="20"/>
    <rect x="810" y="170" width="20" height="20"/><rect x="850" y="170" width="20" height="20"/>
  </g>

  <!-- Sidewalk -->
  <rect x="0" y="400" width="1280" height="50" fill="#cbd5e1"/>
  <line x1="0" y1="445" x2="1280" y2="445" stroke="#94a3b8" stroke-width="4"/>

  <!-- Road -->
  <rect x="0" y="450" width="1280" height="270" fill="url(#roadGrad)"/>

  <!-- Crosswalk zebra stripes -->
  <g fill="#f8fafc">
    <rect x="820" y="470" width="30" height="230"/>
    <rect x="870" y="470" width="30" height="230"/>
    <rect x="920" y="470" width="30" height="230"/>
    <rect x="970" y="470" width="30" height="230"/>
    <rect x="1020" y="470" width="30" height="230"/>
  </g>

  <!-- Road Lane Markings -->
  <line x1="0" y1="580" x2="800" y2="580" stroke="#facc15" stroke-width="6" stroke-dasharray="30 20"/>
  <line x1="1060" y1="580" x2="1280" y2="580" stroke="#facc15" stroke-width="6" stroke-dasharray="30 20"/>

  <!-- Traffic Light Post -->
  <rect x="760" y="240" width="12" height="210" fill="#1e293b"/>
  <rect x="748" y="180" width="36" height="85" rx="6" fill="#0f172a"/>
  <!-- Lights: Red, Yellow, Green -->
  <circle cx="766" cy="195" r="10" fill="#ef4444"/>
  <circle cx="766" cy="222" r="10" fill="#475569"/>
  <circle cx="766" cy="250" r="10" fill="#475569"/>

  <!-- Traffic Sign: Speed Limit 35 -->
  <rect x="140" y="310" width="8" height="135" fill="#475569"/>
  <rect x="120" y="270" width="48" height="60" rx="4" fill="#ffffff" stroke="#000000" stroke-width="3"/>
  <text x="144" y="295" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="#000">SPEED</text>
  <text x="144" y="318" font-family="sans-serif" font-size="20" font-weight="900" text-anchor="middle" fill="#000">35</text>

  <!-- Vehicle 1: Blue Sedan Car -->
  <g id="car-blue">
    <!-- Body -->
    <path d="M 280 540 L 330 490 L 460 490 L 510 540 L 540 550 L 540 590 L 260 590 L 260 550 Z" fill="#2563eb"/>
    <!-- Windows -->
    <path d="M 335 495 L 385 495 L 385 535 L 305 535 Z" fill="#93c5fd" opacity="0.8"/>
    <path d="M 395 495 L 455 495 L 495 535 L 395 535 Z" fill="#93c5fd" opacity="0.8"/>
    <!-- Wheels -->
    <circle cx="320" cy="590" r="26" fill="#0f172a"/>
    <circle cx="320" cy="590" r="12" fill="#cbd5e1"/>
    <circle cx="480" cy="590" r="26" fill="#0f172a"/>
    <circle cx="480" cy="590" r="12" fill="#cbd5e1"/>
    <!-- Headlight -->
    <polygon points="535,555 542,558 542,568 535,565" fill="#fef08a"/>
    <!-- Taillight -->
    <polygon points="262,555 258,558 258,568 262,565" fill="#ef4444"/>
  </g>

  <!-- Vehicle 2: Red SUV Car -->
  <g id="car-red">
    <path d="M 60 560 L 90 520 L 190 520 L 220 560 L 230 570 L 230 610 L 50 610 L 50 570 Z" fill="#dc2626"/>
    <path d="M 95 525 L 140 525 L 140 555 L 75 555 Z" fill="#fca5a5" opacity="0.8"/>
    <path d="M 148 525 L 185 525 L 210 555 L 148 555 Z" fill="#fca5a5" opacity="0.8"/>
    <circle cx="95" cy="610" r="24" fill="#0f172a"/>
    <circle cx="95" cy="610" r="10" fill="#e2e8f0"/>
    <circle cx="185" cy="610" r="24" fill="#0f172a"/>
    <circle cx="185" cy="610" r="10" fill="#e2e8f0"/>
  </g>

  <!-- Pedestrian 1: Walking across crosswalk -->
  <g id="pedestrian-1">
    <!-- Head -->
    <circle cx="890" cy="460" r="12" fill="#fcd34d"/>
    <!-- Body/Torso in emerald jacket -->
    <rect x="880" y="475" width="20" height="38" rx="4" fill="#059669"/>
    <!-- Legs -->
    <line x1="886" y1="513" x2="876" y2="550" stroke="#1e293b" stroke-width="7" stroke-linecap="round"/>
    <line x1="894" y1="513" x2="904" y2="550" stroke="#1e293b" stroke-width="7" stroke-linecap="round"/>
    <!-- Arms -->
    <line x1="880" y1="485" x2="870" y2="510" stroke="#059669" stroke-width="5" stroke-linecap="round"/>
    <line x1="900" y1="485" x2="910" y2="505" stroke="#059669" stroke-width="5" stroke-linecap="round"/>
  </g>

  <!-- Pedestrian 2: Person with backpack waiting on sidewalk -->
  <g id="pedestrian-2">
    <circle cx="1080" cy="380" r="10" fill="#fcd34d"/>
    <rect x="1072" y="392" width="16" height="30" rx="3" fill="#6366f1"/>
    <!-- Backpack -->
    <rect x="1066" y="396" width="7" height="20" rx="2" fill="#d97706"/>
    <!-- Legs -->
    <line x1="1076" y1="422" x2="1076" y2="450" stroke="#0f172a" stroke-width="5" stroke-linecap="round"/>
    <line x1="1084" y1="422" x2="1084" y2="450" stroke="#0f172a" stroke-width="5" stroke-linecap="round"/>
  </g>

  <!-- Bicycle on sidewalk / curb -->
  <g id="bicycle">
    <!-- Wheels -->
    <circle cx="610" cy="455" r="18" fill="none" stroke="#0f172a" stroke-width="4"/>
    <circle cx="660" cy="455" r="18" fill="none" stroke="#0f172a" stroke-width="4"/>
    <!-- Frame -->
    <line x1="610" y1="455" x2="635" y2="455" stroke="#e11d48" stroke-width="4"/>
    <line x1="635" y1="455" x2="650" y2="430" stroke="#e11d48" stroke-width="4"/>
    <line x1="650" y1="430" x2="625" y2="430" stroke="#e11d48" stroke-width="4"/>
    <line x1="625" y1="430" x2="610" y2="455" stroke="#e11d48" stroke-width="4"/>
    <line x1="635" y1="455" x2="660" y2="455" stroke="#e11d48" stroke-width="4"/>
    <line x1="660" y1="455" x2="650" y2="430" stroke="#e11d48" stroke-width="4"/>
    <!-- Handlebar & Seat -->
    <line x1="648" y1="430" x2="646" y2="418" stroke="#0f172a" stroke-width="3"/>
    <line x1="640" y1="418" x2="652" y2="418" stroke="#0f172a" stroke-width="4"/>
    <line x1="625" y1="430" x2="623" y2="422" stroke="#0f172a" stroke-width="3"/>
    <ellipse cx="623" cy="420" rx="6" ry="2" fill="#0f172a"/>
  </g>

  <!-- Large Delivery Truck -->
  <g id="truck">
    <!-- Cargo Box -->
    <rect x="630" y="470" width="130" height="90" rx="4" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
    <!-- Cab -->
    <path d="M 760 500 L 785 500 L 795 530 L 795 560 L 760 560 Z" fill="#f59e0b"/>
    <!-- Window -->
    <polygon points="765,505 780,505 788,528 765,528" fill="#bae6fd"/>
    <!-- Wheels -->
    <circle cx="660" cy="565" r="18" fill="#0f172a"/>
    <circle cx="700" cy="565" r="18" fill="#0f172a"/>
    <circle cx="780" cy="565" r="18" fill="#0f172a"/>
  </g>
</svg>
`)}`;

export const warehouseLogisticsSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <defs>
    <linearGradient id="whGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="floorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
  </defs>

  <!-- Warehouse Walls & Ceiling -->
  <rect width="1280" height="720" fill="url(#whGrad)"/>

  <!-- Industrial Ceiling Beams -->
  <line x1="0" y1="80" x2="1280" y2="80" stroke="#334155" stroke-width="12"/>
  <line x1="0" y1="140" x2="1280" y2="140" stroke="#334155" stroke-width="8"/>
  <line x1="200" y1="0" x2="200" y2="350" stroke="#334155" stroke-width="16"/>
  <line x1="600" y1="0" x2="600" y2="350" stroke="#334155" stroke-width="16"/>
  <line x1="1000" y1="0" x2="1000" y2="350" stroke="#334155" stroke-width="16"/>

  <!-- High-Bay LED Lights -->
  <g fill="#fef08a" opacity="0.9">
    <ellipse cx="400" cy="85" rx="35" ry="8"/>
    <ellipse cx="800" cy="85" rx="35" ry="8"/>
    <polygon points="365,85 435,85 480,250 320,250" fill="#fef08a" opacity="0.08"/>
    <polygon points="765,85 835,85 880,250 720,250" fill="#fef08a" opacity="0.08"/>
  </g>

  <!-- Polished Concrete Floor -->
  <polygon points="0,350 1280,350 1280,720 0,720" fill="url(#floorGrad)"/>

  <!-- Floor Safety Yellow Boundary Line -->
  <line x1="100" y1="520" x2="1200" y2="520" stroke="#facc15" stroke-width="8" stroke-dasharray="24 16"/>

  <!-- Storage Racks (Shelving System Left) -->
  <g id="storage-rack-left">
    <!-- Uprights -->
    <rect x="80" y="160" width="16" height="380" fill="#2563eb"/>
    <rect x="260" y="160" width="16" height="380" fill="#2563eb"/>
    <rect x="440" y="160" width="16" height="380" fill="#2563eb"/>
    <!-- Orange Shelf Beams -->
    <rect x="80" y="240" width="376" height="14" fill="#ea580c"/>
    <rect x="80" y="340" width="376" height="14" fill="#ea580c"/>
    <rect x="80" y="440" width="376" height="14" fill="#ea580c"/>

    <!-- Pallets & Cargo Boxes on Shelves -->
    <!-- Shelf 1 (top) -->
    <rect x="110" y="180" width="120" height="58" fill="#d97706" rx="3"/>
    <text x="170" y="215" fill="#78350f" font-weight="bold" font-size="12" text-anchor="middle">SKU-A99</text>
    <rect x="290" y="190" width="130" height="48" fill="#b45309" rx="3"/>

    <!-- Shelf 2 (mid) -->
    <rect x="105" y="270" width="70" height="68" fill="#78350f" rx="3"/>
    <rect x="185" y="260" width="60" height="78" fill="#d97706" rx="3"/>
    <rect x="295" y="275" width="125" height="63" fill="#92400e" rx="3"/>

    <!-- Shelf 3 (bottom) -->
    <rect x="100" y="380" width="140" height="58" fill="#b45309" rx="3"/>
    <rect x="280" y="370" width="150" height="68" fill="#d97706" rx="3"/>
  </g>

  <!-- Heavy Pallet Stack on Floor -->
  <g id="pallet-stack">
    <!-- Wooden Pallet Base -->
    <rect x="940" y="480" width="180" height="18" fill="#78350f"/>
    <rect x="955" y="498" width="20" height="14" fill="#451a03"/>
    <rect x="1020" y="498" width="20" height="14" fill="#451a03"/>
    <rect x="1085" y="498" width="20" height="14" fill="#451a03"/>
    <!-- Boxes stacked -->
    <rect x="945" y="410" width="85" height="70" fill="#d97706" rx="2"/>
    <rect x="1035" y="390" width="80" height="90" fill="#b45309" rx="2"/>
    <rect x="950" y="340" width="80" height="70" fill="#92400e" rx="2"/>
  </g>

  <!-- Industrial Forklift -->
  <g id="forklift">
    <!-- Chassis Body -->
    <rect x="520" y="480" width="170" height="95" rx="8" fill="#eab308"/>
    <!-- Counterweight -->
    <rect x="500" y="500" width="30" height="65" rx="6" fill="#ca8a04"/>
    <!-- Overhead Guard / Cabin Cage -->
    <rect x="550" y="390" width="90" height="90" rx="4" fill="none" stroke="#1e293b" stroke-width="8"/>
    <line x1="595" y1="390" x2="595" y2="480" stroke="#1e293b" stroke-width="6"/>
    <!-- Mast (Vertical Lift Rail) -->
    <rect x="685" y="370" width="14" height="200" fill="#334155"/>
    <!-- Fork Carriage & Prongs -->
    <rect x="695" y="525" width="16" height="40" fill="#0f172a"/>
    <line x1="705" y1="565" x2="785" y2="565" stroke="#0f172a" stroke-width="8"/>
    <!-- Wheels -->
    <circle cx="545" cy="575" r="26" fill="#0f172a"/>
    <circle cx="545" cy="575" r="10" fill="#cbd5e1"/>
    <circle cx="660" cy="575" r="26" fill="#0f172a"/>
    <circle cx="660" cy="575" r="10" fill="#cbd5e1"/>
    <!-- Operator in Cabin -->
    <circle cx="585" cy="425" r="12" fill="#fcd34d"/>
    <rect x="575" y="440" width="22" height="35" rx="3" fill="#0284c7"/>
    <!-- Safety Hardhat -->
    <path d="M 570 422 Q 585 410 600 422 Z" fill="#f97316"/>
  </g>

  <!-- Warehouse Personnel (Walking Inspector) -->
  <g id="worker">
    <circle cx="850" cy="460" r="11" fill="#fcd34d"/>
    <!-- Hardhat -->
    <path d="M 837 458 Q 850 446 863 458 Z" fill="#eab308"/>
    <!-- Hi-Vis Safety Vest -->
    <rect x="840" y="473" width="20" height="38" rx="3" fill="#84cc16"/>
    <!-- Reflective Stripes -->
    <line x1="840" y1="488" x2="860" y2="488" stroke="#f8fafc" stroke-width="4"/>
    <line x1="840" y1="500" x2="860" y2="500" stroke="#f8fafc" stroke-width="4"/>
    <!-- Clipboard in Hand -->
    <rect x="856" y="482" width="14" height="20" rx="2" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
    <!-- Legs -->
    <line x1="845" y1="511" x2="840" y2="555" stroke="#1e293b" stroke-width="6" stroke-linecap="round"/>
    <line x1="855" y1="511" x2="860" y2="555" stroke="#1e293b" stroke-width="6" stroke-linecap="round"/>
  </g>

  <!-- Safety Warning Sign on Wall -->
  <g id="safety-sign">
    <polygon points="800,240 840,310 760,310" fill="#eab308" stroke="#000" stroke-width="4"/>
    <text x="800" y="295" font-family="sans-serif" font-weight="900" font-size="28" text-anchor="middle" fill="#000">!</text>
  </g>
</svg>
`)}`;

export const retailShelfSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <!-- Supermarket Retail Aisle Background -->
  <rect width="1280" height="720" fill="#f1f5f9"/>

  <!-- Metal Shelving Backplate -->
  <rect x="60" y="60" width="1160" height="600" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="4"/>

  <!-- Top Shelf Unit -->
  <rect x="60" y="220" width="1160" height="24" fill="#94a3b8"/>
  <rect x="60" y="244" width="1160" height="12" fill="#64748b"/>
  <!-- Middle Shelf Unit -->
  <rect x="60" y="420" width="1160" height="24" fill="#94a3b8"/>
  <rect x="60" y="444" width="1160" height="12" fill="#64748b"/>
  <!-- Bottom Shelf Unit -->
  <rect x="60" y="620" width="1160" height="24" fill="#94a3b8"/>
  <rect x="60" y="644" width="1160" height="12" fill="#64748b"/>

  <!-- TOP SHELF: Beverage Bottles (Cans & Organic Juices) -->
  <!-- Product 1: Green Tea Bottle -->
  <g id="bottle-green-1">
    <rect x="120" y="110" width="46" height="110" rx="8" fill="#10b981"/>
    <rect x="133" y="90" width="20" height="20" rx="2" fill="#059669"/>
    <rect x="124" y="140" width="38" height="45" fill="#ecfdf5"/>
    <text x="143" y="165" font-family="sans-serif" font-size="9" font-weight="bold" fill="#047857" text-anchor="middle">MATCHA</text>
  </g>
  <g id="bottle-green-2">
    <rect x="175" y="110" width="46" height="110" rx="8" fill="#10b981"/>
    <rect x="188" y="90" width="20" height="20" rx="2" fill="#059669"/>
    <rect x="179" y="140" width="38" height="45" fill="#ecfdf5"/>
    <text x="198" y="165" font-family="sans-serif" font-size="9" font-weight="bold" fill="#047857" text-anchor="middle">MATCHA</text>
  </g>

  <!-- Product 2: Orange Juice Bottles -->
  <g id="bottle-orange-1">
    <rect x="250" y="100" width="52" height="120" rx="10" fill="#f97316"/>
    <rect x="266" y="80" width="20" height="20" rx="3" fill="#ea580c"/>
    <circle cx="276" cy="150" r="16" fill="#ffedd5"/>
    <text x="276" y="154" font-family="sans-serif" font-size="9" font-weight="bold" fill="#c2410c" text-anchor="middle">CITRUS</text>
  </g>
  <g id="bottle-orange-2">
    <rect x="310" y="100" width="52" height="120" rx="10" fill="#f97316"/>
    <rect x="326" y="80" width="20" height="20" rx="3" fill="#ea580c"/>
    <circle cx="336" cy="150" r="16" fill="#ffedd5"/>
    <text x="336" y="154" font-family="sans-serif" font-size="9" font-weight="bold" fill="#c2410c" text-anchor="middle">CITRUS</text>
  </g>

  <!-- Product 3: Sparkling Soda Cans -->
  <g id="can-soda-1">
    <rect x="400" y="125" width="40" height="95" rx="5" fill="#ef4444"/>
    <ellipse cx="420" cy="125" rx="18" ry="4" fill="#cbd5e1"/>
    <text x="420" y="175" font-family="sans-serif" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">COLA</text>
  </g>
  <g id="can-soda-2">
    <rect x="448" y="125" width="40" height="95" rx="5" fill="#ef4444"/>
    <ellipse cx="468" cy="125" rx="18" ry="4" fill="#cbd5e1"/>
    <text x="468" y="175" font-family="sans-serif" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">COLA</text>
  </g>
  <g id="can-soda-3">
    <rect x="496" y="125" width="40" height="95" rx="5" fill="#3b82f6"/>
    <ellipse cx="516" cy="125" rx="18" ry="4" fill="#cbd5e1"/>
    <text x="516" y="175" font-family="sans-serif" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">ZERO</text>
  </g>

  <!-- MIDDLE SHELF: Breakfast Cereals & Pasta Boxes -->
  <!-- Product 4: Honey Oat Cereal Box -->
  <g id="cereal-honey">
    <rect x="120" y="270" width="90" height="150" rx="4" fill="#f59e0b"/>
    <rect x="130" y="300" width="70" height="60" rx="4" fill="#fef3c7"/>
    <text x="165" y="335" font-family="sans-serif" font-size="14" font-weight="bold" fill="#b45309" text-anchor="middle">CRUNCH</text>
  </g>
  <g id="cereal-honey-2">
    <rect x="220" y="270" width="90" height="150" rx="4" fill="#f59e0b"/>
    <rect x="230" y="300" width="70" height="60" rx="4" fill="#fef3c7"/>
    <text x="265" y="335" font-family="sans-serif" font-size="14" font-weight="bold" fill="#b45309" text-anchor="middle">CRUNCH</text>
  </g>

  <!-- Product 5: Chocolate Flakes Box -->
  <g id="cereal-choco">
    <rect x="330" y="260" width="95" height="160" rx="4" fill="#78350f"/>
    <rect x="340" y="290" width="75" height="70" rx="4" fill="#451a03"/>
    <text x="377" y="330" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fcd34d" text-anchor="middle">CHOCO</text>
  </g>
  <g id="cereal-choco-2">
    <rect x="435" y="260" width="95" height="160" rx="4" fill="#78350f"/>
    <rect x="445" y="290" width="75" height="70" rx="4" fill="#451a03"/>
    <text x="482" y="330" font-family="sans-serif" font-size="13" font-weight="bold" fill="#fcd34d" text-anchor="middle">CHOCO</text>
  </g>

  <!-- Product 6: Italian Spaghetti Box -->
  <g id="pasta-spaghetti">
    <rect x="550" y="310" width="130" height="110" rx="3" fill="#0284c7"/>
    <rect x="560" y="330" width="110" height="40" fill="#bae6fd"/>
    <text x="615" y="355" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0369a1" text-anchor="middle">PASTA NO.5</text>
  </g>

  <!-- BOTTOM SHELF: Organic Olive Oil & Canned Soups -->
  <g id="olive-oil-1">
    <rect x="140" y="470" width="55" height="150" rx="6" fill="#65a30d"/>
    <rect x="157" y="450" width="20" height="20" rx="2" fill="#4d7c0f"/>
    <text x="167" y="540" font-family="sans-serif" font-size="11" font-weight="bold" fill="#f7fee7" text-anchor="middle">EXTRA</text>
    <text x="167" y="555" font-family="sans-serif" font-size="10" font-weight="bold" fill="#f7fee7" text-anchor="middle">VIRGIN</text>
  </g>
  <g id="olive-oil-2">
    <rect x="205" y="470" width="55" height="150" rx="6" fill="#65a30d"/>
    <rect x="222" y="450" width="20" height="20" rx="2" fill="#4d7c0f"/>
    <text x="232" y="540" font-family="sans-serif" font-size="11" font-weight="bold" fill="#f7fee7" text-anchor="middle">EXTRA</text>
    <text x="232" y="555" font-family="sans-serif" font-size="10" font-weight="bold" fill="#f7fee7" text-anchor="middle">VIRGIN</text>
  </g>

  <!-- Canned Tomato Soup Cans -->
  <g id="can-soup-1">
    <rect x="300" y="520" width="60" height="100" rx="4" fill="#dc2626"/>
    <ellipse cx="330" cy="520" rx="28" ry="6" fill="#e2e8f0"/>
    <rect x="305" y="545" width="50" height="40" fill="#fef2f2"/>
    <text x="330" y="570" font-family="sans-serif" font-size="10" font-weight="bold" fill="#991b1b" text-anchor="middle">TOMATO</text>
  </g>
  <g id="can-soup-2">
    <rect x="370" y="520" width="60" height="100" rx="4" fill="#dc2626"/>
    <ellipse cx="400" cy="520" rx="28" ry="6" fill="#e2e8f0"/>
    <rect x="375" y="545" width="50" height="40" fill="#fef2f2"/>
    <text x="400" y="570" font-family="sans-serif" font-size="10" font-weight="bold" fill="#991b1b" text-anchor="middle">TOMATO</text>
  </g>

  <!-- Shelf Price Tags (Plastic Channel on edge of shelves) -->
  <rect x="130" y="246" width="35" height="18" fill="#ffffff" stroke="#94a3b8" rx="2"/>
  <text x="147" y="260" font-family="monospace" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">$3.49</text>

  <rect x="260" y="246" width="35" height="18" fill="#ffffff" stroke="#94a3b8" rx="2"/>
  <text x="277" y="260" font-family="monospace" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">$4.19</text>

  <rect x="410" y="246" width="35" height="18" fill="#ffffff" stroke="#94a3b8" rx="2"/>
  <text x="427" y="260" font-family="monospace" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">$1.89</text>

  <rect x="150" y="446" width="35" height="18" fill="#ffffff" stroke="#94a3b8" rx="2"/>
  <text x="167" y="460" font-family="monospace" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">$4.99</text>

  <rect x="350" y="446" width="35" height="18" fill="#ffffff" stroke="#94a3b8" rx="2"/>
  <text x="367" y="460" font-family="monospace" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">$5.49</text>

  <rect x="150" y="646" width="35" height="18" fill="#ffffff" stroke="#94a3b8" rx="2"/>
  <text x="167" y="660" font-family="monospace" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">$8.99</text>
</svg>
`)}`;
