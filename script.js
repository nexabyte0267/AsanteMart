/**
 * AsanteMart Storefront Engine (ES6+ Vanilla JS)
 * Features:
 * - Self-contained SVG artwork generator (zero broken external image links)
 * - Live search, category filtering & sorting
 * - Real-time inventory validation & localStorage stock persistence
 * - Weight-tiered delivery zone fee calculator
 * - Checkout validation, stock deduction, Order ID generation & WhatsApp forwarding
 */

(() => {
  'use strict';

  /* ==========================================================================
     1. STORE CONFIGURATION & STORAGE KEYS
     ========================================================================== */
  const STORE_CONFIG = {
    name: 'AsanteMart',
    currency: 'GHS',
    whatsappNumber: '233245550194',
    displayPhone: '+233 24 555 0194',
    email: 'hello@asantemart.com',
    location: 'Ejisu & Kumasi, Ghana',
  };

  const STORAGE_KEYS = {
    CART: 'asantemart_cart_v1',
    ZONE: 'asantemart_zone_v1',
    STOCK: 'asantemart_stock_v1',
    ORDERS: 'asantemart_orders_v1',
  };

  /* ==========================================================================
     2. SVG ARTWORK HELPER
     ========================================================================== */
  function createProductArt(bgHex, accentHex, label, iconType) {
    const icons = {
      blender: `<rect x="135" y="55" width="50" height="75" rx="8" fill="#fff"/><rect x="130" y="130" width="60" height="35" rx="6" fill="${accentHex}"/><rect x="145" y="45" width="30" height="10" rx="3" fill="${accentHex}"/>`,
      kettle: `<path d="M135 65h50l10 85h-70z" fill="#fff"/><path d="M185 80c18 0 18 45 0 45" fill="none" stroke="#fff" stroke-width="8"/><rect x="122" y="150" width="76" height="12" rx="4" fill="${accentHex}"/>`,
      cookware: `<ellipse cx="160" cy="115" rx="58" ry="24" fill="#fff"/><rect x="102" y="115" width="116" height="32" rx="10" fill="${accentHex}"/><rect x="215" y="118" width="35" height="10" rx="5" fill="#fff"/>`,
      flask: `<rect x="142" y="52" width="36" height="112" rx="14" fill="#fff"/><rect x="148" y="40" width="24" height="14" rx="4" fill="${accentHex}"/><rect x="142" y="95" width="36" height="24" fill="${accentHex}"/>`,
      earbuds: `<rect x="122" y="65" width="76" height="84" rx="22" fill="#fff"/><line x1="122" y1="98" x2="198" y2="98" stroke="${bgHex}" stroke-width="3"/><circle cx="160" cy="118" r="6" fill="${accentHex}"/>`,
      powerbank: `<rect x="130" y="48" width="60" height="118" rx="12" fill="#fff"/><rect x="142" y="64" width="36" height="12" rx="4" fill="${accentHex}"/><circle cx="150" cy="145" r="4" fill="${accentHex}"/><circle cx="160" cy="145" r="4" fill="${accentHex}"/><circle cx="170" cy="145" r="4" fill="${accentHex}"/>`,
      watch: `<rect x="146" y="42" width="28" height="130" rx="6" fill="${accentHex}"/><rect x="134" y="75" width="52" height="64" rx="14" fill="#fff"/><circle cx="160" cy="107" r="16" fill="none" stroke="${bgHex}" stroke-width="4"/>`,
      charger: `<rect x="136" y="68" width="48" height="72" rx="10" fill="#fff"/><rect x="146" y="48" width="8" height="20" fill="${accentHex}"/><rect x="166" y="48" width="8" height="20" fill="${accentHex}"/>`,
      backpack: `<rect x="126" y="56" width="68" height="104" rx="20" fill="#fff"/><rect x="136" y="102" width="48" height="44" rx="10" fill="${accentHex}"/><path d="M144 56v-10h32v10" fill="none" stroke="#fff" stroke-width="6"/>`,
      sunglasses: `<rect x="110" y="88" width="42" height="30" rx="8" fill="#fff"/><rect x="168" y="88" width="42" height="30" rx="8" fill="#fff"/><line x1="152" y1="96" x2="168" y2="96" stroke="${accentHex}" stroke-width="6"/>`,
      sneakers: `<path d="M110 132h100v18H110z" fill="${accentHex}"/><path d="M115 132c8-28 32-34 55-22l35 12v10H115z" fill="#fff"/>`,
      skincare: `<rect x="138" y="64" width="44" height="98" rx="10" fill="#fff"/><rect x="150" y="46" width="20" height="18" rx="4" fill="${accentHex}"/><circle cx="160" cy="112" r="14" fill="${accentHex}"/>`,
      shea: `<rect x="124" y="82" width="72" height="72" rx="16" fill="#fff"/><rect x="120" y="68" width="80" height="18" rx="6" fill="${accentHex}"/>`,
      grooming: `<rect x="144" y="52" width="32" height="110" rx="10" fill="#fff"/><rect x="138" y="42" width="44" height="16" rx="4" fill="${accentHex}"/><circle cx="160" cy="105" r="8" fill="${accentHex}"/>`,
    };

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" width="320" height="220">
      <rect width="320" height="220" fill="${bgHex}"/>
      <circle cx="275" cy="35" r="55" fill="rgba(255,255,255,0.08)"/>
      <circle cx="40" cy="190" r="65" fill="rgba(0,0,0,0.08)"/>
      ${icons[iconType] || icons.blender}
      <text x="160" y="198" text-anchor="middle" fill="rgba(255,255,255,0.88)" font-family="system-ui,sans-serif" font-size="11" font-weight="700" letter-spacing="1">${label.toUpperCase()}</text>
    </svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  /* ==========================================================================
     3. STARTER PRODUCT CATALOG
     ========================================================================== */
  const INITIAL_PRODUCTS = [
    { id:'hk-01', title:'Binatone Heavy-Duty 1.5L Smoothie & Spice Blender', category:'Home & Kitchen', sku:'AM-HK-101', price:460.00, compareAtPrice:520.00, stock:11, weightTier:'heavy', variants:['Silver / Black','Matte White'], shortDesc:'450W copper motor with unbreakable 1.5L jar and dry mill attachment for fufu flour, ginger & smoothies.', fullDesc:'Engineered for Ghanaian kitchens, this 450W heavy-duty blender crushes ice, blends tiger nuts, and grinds dry spices effortlessly using its dedicated stainless-steel dry mill.', specs:['450W Pure Copper Motor','1.5L Unbreakable Polycarbonate Jar','Includes Dry Spice & Pepper Mill','2 Speeds + Pulse Control','1-Year Local Warranty'], image:createProductArt('#0f766e','#f59e0b','Home & Kitchen','blender') },
    { id:'hk-02', title:'2.0L Cordless Stainless Steel Electric Kettle', category:'Home & Kitchen', sku:'AM-HK-102', price:185.00, compareAtPrice:220.00, stock:4, weightTier:'medium', variants:['Brushed Steel','Matte Black'], shortDesc:'Rapid-boil 1800W concealed heating element with automatic boil-dry shutoff.', fullDesc:'Boil 2 litres of water in under 5 minutes. Built with food-grade 304 stainless steel interior, 360-degree swivel base, and cool-touch ergonomic handle.', specs:['2.0 Litre Capacity','1800W Fast-Boil Element','304 Food-Grade Stainless Steel','Auto Shut-Off Safety'], image:createProductArt('#115e59','#fbbf24','Home & Kitchen','kettle') },
    { id:'hk-03', title:'Granite Non-Stick 5-Piece Cookware Set', category:'Home & Kitchen', sku:'AM-HK-103', price:680.00, compareAtPrice:760.00, stock:6, weightTier:'heavy', variants:['Charcoal Granite','Burgundy Red'], shortDesc:'PFOA-free die-cast aluminum pots and frypan with tempered glass lids for gas & electric stoves.', fullDesc:'Cook jollof, stews, and sauces with minimal oil and zero sticking. Thick induction-compatible base distributes heat evenly without hot spots.', specs:['24cm Casserole + Lid','20cm Saucepan + Lid','24cm Deep Frypan','PFOA & Lead-Free Coating'], image:createProductArt('#1e293b','#d97706','Home & Kitchen','cookware') },
    { id:'hk-04', title:'750ml Double-Wall Vacuum Insulated Flask', category:'Home & Kitchen', sku:'AM-HK-104', price:110.00, compareAtPrice:null, stock:18, weightTier:'light', variants:['Teal','Midnight Black','Sand'], shortDesc:'Keeps water ice-cold for 24 hours or tea piping hot for 12 hours on the go.', fullDesc:'Leak-proof screw cap with carry loop, sweat-free powder-coated exterior, and wide mouth for easy ice-cube filling.', specs:['750ml Capacity','24h Cold / 12h Hot Retention','BPA-Free Leakproof Lid','Powder-Coated Grip'], image:createProductArt('#0d9488','#fef3c7','Home & Kitchen','flask') },
    { id:'el-01', title:'Oraimo FreePods Neo True Wireless Earbuds', category:'Electronics & Accessories', sku:'AM-EL-201', price:245.00, compareAtPrice:290.00, stock:15, weightTier:'light', variants:['Obsidian Black','Pearl White'], shortDesc:'36-hour total playtime, deep bass drivers, and ENC dual-mic clear voice calls.', fullDesc:'Designed for noisy commutes and workouts. Features IPX4 splash resistance, USB-C fast charging (10 mins = 90 mins play), and instant Bluetooth 5.3 pairing.', specs:['36-Hour Battery with Case','Environmental Noise Cancellation','Bluetooth 5.3 Low-Latency','IPX4 Sweat & Splash Resistant'], image:createProductArt('#1e3a8a','#38bdf8','Electronics','earbuds') },
    { id:'el-02', title:'20,000mAh 22.5W Fast-Charge Power Bank', category:'Electronics & Accessories', sku:'AM-EL-202', price:295.00, compareAtPrice:340.00, stock:3, weightTier:'medium', variants:['Black','Navy Blue'], shortDesc:'High-density lithium polymer battery with LED percentage display and dual USB-C/USB-A outputs.', fullDesc:'Reliable backup power for Dumsor or long intercity trips. Charges iPhones and Android flagships up to 50% in 30 minutes with built-in surge protection.', specs:['20,000mAh True Capacity','22.5W PD + QC 3.0 Fast Charge','Digital LED Battery Indicator','3 Output Ports (2x USB-A, 1x USB-C)'], image:createProductArt('#0f172a','#22c55e','Electronics','powerbank') },
    { id:'el-03', title:'AM-Fit Pro AMOLED Smart Watch', category:'Electronics & Accessories', sku:'AM-EL-203', price:380.00, compareAtPrice:430.00, stock:9, weightTier:'light', variants:['Black Silicone','Silver Mesh'], shortDesc:'1.85" HD display, Bluetooth calling, heart-rate/SpO2 tracking, and 10-day battery life.', fullDesc:'Answer calls directly from your wrist, receive WhatsApp alerts, and track over 100 workout modes with IP68 dust and water resistance.', specs:['1.85" Sunlight-Readable Display','Bluetooth Calls & WhatsApp Alerts','24/7 Heart Rate & Sleep Monitor','10-Day Typical Battery Life'], image:createProductArt('#312e81','#f59e0b','Electronics','watch') },
    { id:'el-04', title:'35W Dual USB-C GaN Fast Wall Charger + Cable', category:'Electronics & Accessories', sku:'AM-EL-204', price:135.00, compareAtPrice:null, stock:22, weightTier:'light', variants:['UK 3-Pin White'], shortDesc:'Compact Ghana/UK 3-pin GaN adapter with braided 1.5m USB-C to USB-C fast cable.', fullDesc:'Runs cooler and charges faster than standard bricks. Safely powers two devices simultaneously with voltage fluctuation protection.', specs:['35W Max Power Delivery','UK/Ghana 3-Pin Plug','Includes 1.5m Braided USB-C Cable','Over-Voltage Surge Protection'], image:createProductArt('#1d4ed8','#fbbf24','Electronics','charger') },
    { id:'fl-01', title:'Water-Resistant 15.6" Anti-Theft Laptop Backpack', category:'Fashion & Lifestyle', sku:'AM-FL-301', price:260.00, compareAtPrice:310.00, stock:8, weightTier:'medium', variants:['Charcoal Grey','Jet Black'], shortDesc:'Padded laptop sleeve, external USB charging port, and hidden back passport pocket.', fullDesc:'Built for students, professionals, and commuters in Kumasi and Accra. Repels sudden rain showers while keeping tech gear organized and cushioned.', specs:['Fits up to 15.6" Laptops','Water-Repellent Oxford Fabric','External USB Pass-Through Port','Breathable Padded Back Straps'], image:createProductArt('#374151','#f59e0b','Fashion & Lifestyle','backpack') },
    { id:'fl-02', title:'Polarized UV400 Classic Wayfarer Sunglasses', category:'Fashion & Lifestyle', sku:'AM-FL-302', price:95.00, compareAtPrice:120.00, stock:14, weightTier:'light', variants:['Matte Black / Smoke','Tortoise / Amber'], shortDesc:'Anti-glare polarized lenses with lightweight acetate frame and hard protective case.', fullDesc:'Cuts harsh tropical road glare while driving or walking outdoors. Blocks 100% of UVA and UVB rays.', specs:['100% UV400 Polarized Protection','Scratch-Resistant TAC Lenses','Includes Hard Case & Microfiber Cloth'], image:createProductArt('#78350f','#fcd34d','Fashion & Lifestyle','sunglasses') },
    { id:'fl-03', title:'Breathable Knit Everyday Walking Sneakers', category:'Fashion & Lifestyle', sku:'AM-FL-303', price:320.00, compareAtPrice:null, stock:0, weightTier:'medium', variants:['EU 41','EU 42','EU 43','EU 44'], shortDesc:'Featherweight mesh upper with shock-absorbing EVA outsole for all-day comfort.', fullDesc:'Versatile minimalist sneakers engineered for warm weather breathability and cushioned arch support.', specs:['Breathable Fly-Knit Upper','High-Rebound EVA Cushion Sole','Slip-Resistant Rubber Tread'], image:createProductArt('#4b5563','#10b981','Fashion & Lifestyle','sneakers') },
    { id:'bp-01', title:'Pure Northern Unrefined Whipped Shea Butter (350g)', category:'Beauty & Personal Care', sku:'AM-BP-401', price:75.00, compareAtPrice:90.00, stock:25, weightTier:'light', variants:['Unscented Pure','Lemongrass Infused','Coconut & Vanilla'], shortDesc:'100% Grade-A Tamale shea butter whipped for smooth, non-greasy skin & hair hydration.', fullDesc:'Ethically sourced from women-led cooperatives in Northern Ghana and cold-whipped for effortless absorption without heavy residue.', specs:['350g Reusable Jar','100% Organic Grade-A Shea','Zero Parabens or Mineral Oil','For Skin, Lips & Natural Hair'], image:createProductArt('#92400e','#fde68a','Beauty & Care','shea') },
    { id:'bp-02', title:'Vitamin C + Niacinamide Daily Glow Serum (30ml)', category:'Beauty & Personal Care', sku:'AM-BP-402', price:130.00, compareAtPrice:155.00, stock:10, weightTier:'light', variants:['30ml Dropper Bottle'], shortDesc:'Brightens dark spots, evens skin tone, and boosts hydration without clogging pores.', fullDesc:'Formulated with 10% stabilized Vitamin C, 5% Niacinamide, and Hyaluronic Acid to fade hyperpigmentation and protect against daily UV stress.', specs:['10% Vitamin C + 5% Niacinamide','Fragrance-Free & Non-Comedogenic','Suitable for All Melanin-Rich Skin Tones'], image:createProductArt('#b45309','#fef08a','Beauty & Care','skincare') },
    { id:'bp-03', title:'Cordless Rechargeable Beard & Hair Trimmer Kit', category:'Beauty & Personal Care', sku:'AM-BP-403', price:210.00, compareAtPrice:250.00, stock:7, weightTier:'light', variants:['Metallic Gold','Graphite Grey'], shortDesc:'Zero-gap T-blade precision trimmer with 4 guide combs and USB-C fast charging.', fullDesc:'Achieve crisp line-ups and smooth trims at home. Whisper-quiet rotary motor delivers 150 minutes of cordless runtime per charge.', specs:['Carbon-Steel Zero-Gap T-Blade','150-Min Cordless Runtime','4 Guide Combs (1.5mm–6mm)','USB-C Charging Cable Included'], image:createProductArt('#4c1d95','#f59e0b','Beauty & Care','grooming') },
  ];

  /* ==========================================================================
     4. DELIVERY RULES ENGINE
     ========================================================================== */
  const DELIVERY_ZONES = {
    pickup:   { id:'pickup',   label:'Store Pickup (Ejisu Hub / Adum Point)',                              baseFee:0,  heavySurcharge:0,  regionalPerItem:0, description:'Free pickup within 2 hours of order confirmation.' },
    local:    { id:'local',    label:'Same-City Rider (Ejisu & Greater Kumasi)',                            baseFee:25, heavySurcharge:15, regionalPerItem:0, description:'GHS 25 flat rider fee (+GHS 15 handling if heavy appliance/cookware is included).' },
    regional: { id:'regional', label:'Regional / Intercity Dispatch (Accra, Takoradi, Tamale & Nationwide)', baseFee:55, heavySurcharge:25, regionalPerItem:8, description:'GHS 55 base parcel rate + GHS 8 per extra item (+GHS 25 for heavy cargo).' },
  };

  function calculateDelivery(cartItems, productsMap, zoneId) {
    const zone = DELIVERY_ZONES[zoneId] || DELIVERY_ZONES.pickup;
    if (!cartItems.length || zone.id === 'pickup') {
      return { fee: 0, note: zone.description, hasHeavy: false };
    }
    let totalUnits = 0, hasHeavy = false;
    cartItems.forEach((item) => {
      totalUnits += item.qty;
      const prod = productsMap.get(item.productId);
      if (prod && prod.weightTier === 'heavy') hasHeavy = true;
    });
    let fee = zone.baseFee;
    const notes = [`Base: ${formatMoney(zone.baseFee)}`];
    if (zone.id === 'regional' && totalUnits > 1) {
      const extraFee = (totalUnits - 1) * zone.regionalPerItem;
      fee += extraFee;
      notes.push(`+${formatMoney(extraFee)} (${totalUnits - 1} extra item${totalUnits - 1 > 1 ? 's' : ''})`);
    }
    if (hasHeavy && zone.heavySurcharge > 0) {
      fee += zone.heavySurcharge;
      notes.push(`+${formatMoney(zone.heavySurcharge)} heavy item handling`);
    }
    return { fee, note: notes.join(' • '), hasHeavy };
  }

  /* ==========================================================================
     5. STATE & PERSISTENCE
     ========================================================================== */
  const state = {
    products: [],
    cart: [],
    deliveryZone: 'local',
    filters: { category: 'All', search: '', sort: 'featured' },
    lastOrder: null,
  };

  function loadPersistedState() {
    let savedStock = {};
    try { savedStock = JSON.parse(localStorage.getItem(STORAGE_KEYS.STOCK)) || {}; } catch { savedStock = {}; }
    state.products = INITIAL_PRODUCTS.map((p) => ({
      ...p,
      stock: typeof savedStock[p.id] === 'number' ? savedStock[p.id] : p.stock,
    }));

    const savedZone = localStorage.getItem(STORAGE_KEYS.ZONE);
    if (savedZone && DELIVERY_ZONES[savedZone]) state.deliveryZone = savedZone;

    try {
      const rawCart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || [];
      const prodMap = getProductsMap();
      state.cart = rawCart
        .filter((item) => prodMap.has(item.productId) && item.qty > 0)
        .map((item) => {
          const maxStock = prodMap.get(item.productId).stock;
          return { productId: item.productId, variant: item.variant, qty: Math.min(item.qty, maxStock) };
        })
        .filter((item) => item.qty > 0);
    } catch { state.cart = []; }
  }

  function saveCart() { localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(state.cart)); }
  function saveZone() { localStorage.setItem(STORAGE_KEYS.ZONE, state.deliveryZone); }
  function saveStock() {
    const stockMap = {};
    state.products.forEach((p) => { stockMap[p.id] = p.stock; });
    localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(stockMap));
  }
  function getProductsMap() { return new Map(state.products.map((p) => [p.id, p])); }

  /* ==========================================================================
     6. FORMATTING & UI HELPERS
     ========================================================================== */
  function formatMoney(amount) { return `${STORE_CONFIG.currency} ${Number(amount || 0).toFixed(2)}`; }

  function getStockBadge(stock) {
    if (stock <= 0) return { text: 'Out of Stock', className: 'stock-pill stock-out' };
    if (stock <= 5) return { text: `Low Stock – ${stock} left`, className: 'stock-pill stock-low' };
    return { text: 'In Stock', className: 'stock-pill stock-in' };
  }

  let toastTimer = null;
  function showToast(message) {
    const toastEl = document.getElementById('toast');
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* Modal open/close helpers + body scroll lock */
  function syncBodyScrollLock() {
    const anyModalOpen = document.querySelector('.modal:not(.hidden)');
    const cartOpen = document.querySelector('.cart-drawer:not([hidden])');
    document.body.style.overflow = (anyModalOpen || cartOpen) ? 'hidden' : '';
  }
  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('hidden');
    syncBodyScrollLock();
  }
  function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('hidden');
    syncBodyScrollLock();
  }

  /* ==========================================================================
     7. CATALOG RENDERING
     ========================================================================== */
  function getFilteredProducts() {
    const { category, search, sort } = state.filters;
    const query = search.trim().toLowerCase();
    const filtered = state.products.filter((prod) => {
      const matchesCat = category === 'All' || prod.category === category;
      if (!matchesCat) return false;
      if (!query) return true;
      const haystack = [prod.title, prod.category, prod.sku, prod.shortDesc, prod.fullDesc, ...(prod.specs || [])]
        .join(' ').toLowerCase();
      return haystack.includes(query);
    });
    if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else if (sort === 'name-asc') filtered.sort((a, b) => a.title.localeCompare(b.title));
    return filtered;
  }

  function renderCatalog() {
    const grid = document.getElementById('productGrid');
    const counter = document.getElementById('resultsCounter');
    const emptyState = document.getElementById('emptyCatalogState');
    if (!grid) return;

    const items = getFilteredProducts();
    if (counter) counter.textContent = `Showing ${items.length} product${items.length === 1 ? '' : 's'}`;

    if (!items.length) {
      grid.innerHTML = '';
      emptyState?.classList.remove('hidden');
      return;
    }
    emptyState?.classList.add('hidden');

    grid.innerHTML = items.map((prod) => {
      const badge = getStockBadge(prod.stock);
      const isOut = prod.stock <= 0;
      return `
        <article class="product-card" data-product-id="${prod.id}">
          <div class="card-media" data-action="view-detail" data-id="${prod.id}">
            <img src="${prod.image}" alt="${escapeHTML(prod.title)}" loading="lazy" />
            <span class="${badge.className}">${badge.text}</span>
            <span class="weight-pill">${prod.weightTier} tier</span>
          </div>
          <div class="card-body">
            <div class="card-cat">${escapeHTML(prod.category)}</div>
            <h3 class="card-title" data-action="view-detail" data-id="${prod.id}">${escapeHTML(prod.title)}</h3>
            <p class="card-desc">${escapeHTML(prod.shortDesc)}</p>
            <div class="card-price-row">
              <span class="price-current">${formatMoney(prod.price)}</span>
              ${prod.compareAtPrice ? `<span class="price-compare">${formatMoney(prod.compareAtPrice)}</span>` : ''}
            </div>
            <div class="card-actions">
              <button type="button" class="btn btn-outline" data-action="view-detail" data-id="${prod.id}">Details</button>
              <button type="button" class="btn btn-primary" data-action="quick-add" data-id="${prod.id}" ${isOut ? 'disabled' : ''}>
                ${isOut ? 'Sold Out' : '+ Add to Cart'}
              </button>
            </div>
          </div>
        </article>`;
    }).join('');
  }

  /* ==========================================================================
     8. PRODUCT DETAIL MODAL
     ========================================================================== */
  function openProductDetail(productId) {
    const prod = getProductsMap().get(productId);
    if (!prod) return;
    const body = document.getElementById('productModalBody');
    const badge = getStockBadge(prod.stock);
    const isOut = prod.stock <= 0;
    let selectedVariant = prod.variants[0] || 'Standard';
    let selectedQty = 1;

    body.innerHTML = `
      <div class="detail-visual">
        <img src="${prod.image}" alt="${escapeHTML(prod.title)}" />
      </div>
      <div>
        <div class="card-cat">${escapeHTML(prod.category)} • SKU: ${escapeHTML(prod.sku)}</div>
        <h2 id="modalProductTitle" style="margin:0.25rem 0 0.6rem;">${escapeHTML(prod.title)}</h2>
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.85rem;">
          <span class="${badge.className}" style="position:static;">${badge.text}</span>
          <span class="muted-text">Shipping Weight: <strong>${prod.weightTier.toUpperCase()}</strong></span>
        </div>
        <div class="card-price-row">
          <span class="price-current" style="font-size:1.45rem;">${formatMoney(prod.price)}</span>
          ${prod.compareAtPrice ? `<span class="price-compare">${formatMoney(prod.compareAtPrice)}</span>` : ''}
        </div>
        <p>${escapeHTML(prod.fullDesc)}</p>
        <h4 style="margin:1rem 0 0.35rem;font-size:0.92rem;">Key Specifications:</h4>
        <ul class="detail-specs">${prod.specs.map((s) => `<li>${escapeHTML(s)}</li>`).join('')}</ul>
        <div class="form-group">
          <label>Select Option / Variant:</label>
          <div class="variant-pills" id="detailVariants">
            ${prod.variants.map((v, i) => `<button type="button" class="variant-btn ${i === 0 ? 'active' : ''}" data-variant="${escapeHTML(v)}">${escapeHTML(v)}</button>`).join('')}
          </div>
        </div>
        <div class="detail-buy-row">
          <div class="qty-stepper" aria-label="Quantity selector">
            <button type="button" id="detailQtyDec" ${isOut ? 'disabled' : ''}>−</button>
            <span id="detailQtyVal">${isOut ? 0 : 1}</span>
            <button type="button" id="detailQtyInc" ${isOut ? 'disabled' : ''}>+</button>
          </div>
          <button type="button" id="detailAddBtn" class="btn btn-primary" style="flex:1;" ${isOut ? 'disabled' : ''}>
            ${isOut ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>`;

    body.querySelectorAll('.variant-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        body.querySelectorAll('.variant-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        selectedVariant = btn.dataset.variant;
      });
    });

    const qtyValEl = document.getElementById('detailQtyVal');
    document.getElementById('detailQtyDec')?.addEventListener('click', () => {
      if (selectedQty > 1) { selectedQty -= 1; qtyValEl.textContent = selectedQty; }
    });
    document.getElementById('detailQtyInc')?.addEventListener('click', () => {
      if (selectedQty < prod.stock) { selectedQty += 1; qtyValEl.textContent = selectedQty; }
      else showToast(`Only ${prod.stock} unit(s) available in stock`);
    });
    document.getElementById('detailAddBtn')?.addEventListener('click', () => {
      if (addToCart(prod.id, selectedVariant, selectedQty)) {
        closeModal('productModal');
        openCartDrawer();
      }
    });

    openModal('productModal');
  }

  /* ==========================================================================
     9. CART
     ========================================================================== */
  function getCartTotalUnits() { return state.cart.reduce((s, i) => s + i.qty, 0); }

  function getCartSubtotal() {
    const prodMap = getProductsMap();
    return state.cart.reduce((sum, item) => {
      const prod = prodMap.get(item.productId);
      return sum + (prod ? prod.price * item.qty : 0);
    }, 0);
  }

  function addToCart(productId, variant, qtyToAdd = 1) {
    const prod = getProductsMap().get(productId);
    if (!prod || prod.stock <= 0) { showToast('Sorry, this item is currently out of stock.'); return false; }
    const chosenVariant = variant || prod.variants[0] || 'Standard';
    const existingTotalForProd = state.cart.filter((i) => i.productId === productId).reduce((s, i) => s + i.qty, 0);
    if (existingTotalForProd + qtyToAdd > prod.stock) {
      showToast(`Stock limit reached: only ${prod.stock} unit(s) available.`);
      return false;
    }
    const existingLine = state.cart.find((i) => i.productId === productId && i.variant === chosenVariant);
    if (existingLine) existingLine.qty += qtyToAdd;
    else state.cart.push({ productId, variant: chosenVariant, qty: qtyToAdd });

    saveCart();
    renderCart();
    showToast(`Added "${prod.title}" to cart`);
    return true;
  }

  function updateCartItemQty(index, delta) {
    const item = state.cart[index];
    if (!item) return;
    const prod = getProductsMap().get(item.productId);
    if (!prod) return;
    if (delta > 0) {
      const totalForProd = state.cart.filter((i) => i.productId === item.productId).reduce((s, i) => s + i.qty, 0);
      if (totalForProd + delta > prod.stock) { showToast(`Maximum available stock (${prod.stock}) reached.`); return; }
      item.qty += delta;
    } else {
      item.qty += delta;
      if (item.qty <= 0) state.cart.splice(index, 1);
    }
    saveCart();
    renderCart();
  }

  function removeCartItem(index) { state.cart.splice(index, 1); saveCart(); renderCart(); }

  function renderCart() {
    const totalUnits = getCartTotalUnits();
    document.getElementById('headerCartBadge').textContent = totalUnits;
    document.getElementById('drawerItemCount').textContent = totalUnits;

    const container = document.getElementById('cartItemsContainer');
    const footer = document.getElementById('cartFooter');
    const zoneSelect = document.getElementById('deliveryZoneSelect');
    if (zoneSelect) zoneSelect.value = state.deliveryZone;

    if (!state.cart.length) {
      container.innerHTML = `
        <div class="empty-state" style="margin-top:1.5rem;">
          <h3>Your cart is empty</h3>
          <p class="muted-text">Add everyday essentials, gadgets, or home picks to get started.</p>
          <button type="button" id="emptyCartBrowseBtn" class="btn btn-primary">Browse Products</button>
        </div>`;
      document.getElementById('emptyCartBrowseBtn')?.addEventListener('click', closeCartDrawer);
      footer.classList.add('hidden');
      return;
    }

    footer.classList.remove('hidden');
    const prodMap = getProductsMap();

    container.innerHTML = state.cart.map((item, idx) => {
      const prod = prodMap.get(item.productId);
      if (!prod) return '';
      const lineTotal = prod.price * item.qty;
      return `
        <div class="cart-item">
          <div class="cart-item-thumb"><img src="${prod.image}" alt="${escapeHTML(prod.title)}" /></div>
          <div>
            <h4 class="cart-item-title">${escapeHTML(prod.title)}</h4>
            <div class="cart-item-meta">Option: ${escapeHTML(item.variant)} • ${formatMoney(prod.price)} each</div>
            <div class="cart-item-controls">
              <div class="qty-stepper">
                <button type="button" data-cart-dec="${idx}" aria-label="Decrease quantity">−</button>
                <span>${item.qty}</span>
                <button type="button" data-cart-inc="${idx}" aria-label="Increase quantity">+</button>
              </div>
              <strong>${formatMoney(lineTotal)}</strong>
              <button type="button" class="remove-item-btn" data-cart-del="${idx}">Remove</button>
            </div>
          </div>
        </div>`;
    }).join('');

    const subtotal = getCartSubtotal();
    const delivery = calculateDelivery(state.cart, prodMap, state.deliveryZone);
    document.getElementById('deliveryRuleHint').textContent = delivery.note;
    document.getElementById('cartSubtotal').textContent = formatMoney(subtotal);
    document.getElementById('cartDeliveryFee').textContent = delivery.fee === 0 ? 'FREE (GHS 0.00)' : formatMoney(delivery.fee);
    document.getElementById('cartGrandTotal').textContent = formatMoney(subtotal + delivery.fee);
  }

  function openCartDrawer() {
    document.getElementById('cartDrawer').hidden = false;
    document.getElementById('drawerBackdrop').classList.remove('hidden');
    document.getElementById('openCartBtn').setAttribute('aria-expanded', 'true');
    syncBodyScrollLock();
  }
  function closeCartDrawer() {
    document.getElementById('cartDrawer').hidden = true;
    document.getElementById('drawerBackdrop').classList.add('hidden');
    document.getElementById('openCartBtn').setAttribute('aria-expanded', 'false');
    syncBodyScrollLock();
  }

  /* ==========================================================================
     10. CHECKOUT
     ========================================================================== */
  function openCheckoutModal() {
    if (!state.cart.length) { showToast('Your cart is empty.'); return; }
    closeCartDrawer();
    document.getElementById('checkoutFormView').classList.remove('hidden');
    document.getElementById('orderConfirmationView').classList.add('hidden');
    document.getElementById('checkoutZoneSelect').value = state.deliveryZone;
    syncCheckoutSummary();
    openModal('checkoutModal');
  }

  function syncCheckoutSummary() {
    const prodMap = getProductsMap();
    const summaryContainer = document.getElementById('checkoutItemsSummary');
    summaryContainer.innerHTML = state.cart.map((item) => {
      const prod = prodMap.get(item.productId);
      return `
        <div class="summary-line">
          <span>${item.qty}&times; ${escapeHTML(prod.title)} <small class="muted-text">(${escapeHTML(item.variant)})</small></span>
          <strong>${formatMoney(prod.price * item.qty)}</strong>
        </div>`;
    }).join('');

    const subtotal = getCartSubtotal();
    const delivery = calculateDelivery(state.cart, prodMap, state.deliveryZone);
    document.getElementById('checkoutSubtotal').textContent = formatMoney(subtotal);
    document.getElementById('checkoutDelivery').textContent = delivery.fee === 0 ? 'FREE' : formatMoney(delivery.fee);
    document.getElementById('checkoutTotal').textContent = formatMoney(subtotal + delivery.fee);
  }

  function generateOrderReference() {
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randPart = Math.floor(1000 + Math.random() * 9000);
    return `AM-${datePart}-${randPart}`;
  }

  function handleCheckoutSubmit(event) {
    event.preventDefault();
    ['custName', 'custPhone', 'custEmail', 'custAddress'].forEach((id) => {
      const el = document.getElementById(`err-${id}`);
      if (el) el.textContent = '';
    });

    const fullName = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const email = document.getElementById('custEmail').value.trim();
    let address = document.getElementById('custAddress').value.trim();
    const notes = document.getElementById('custNotes').value.trim();
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Mobile Money';
    let isValid = true;

    if (fullName.length < 2) { document.getElementById('err-custName').textContent = 'Please enter your full name.'; isValid = false; }
    const cleanDigits = phone.replace(/[\s\-()+]/g, '');
    if (cleanDigits.length < 9) { document.getElementById('err-custPhone').textContent = 'Enter a valid Ghana or international phone/WhatsApp number.'; isValid = false; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { document.getElementById('err-custEmail').textContent = 'Please enter a valid email address or leave blank.'; isValid = false; }

    if (state.deliveryZone !== 'pickup' && address.length < 4) {
      document.getElementById('err-custAddress').textContent = 'Please provide a delivery area, landmark, or GhanaPost GPS.';
      isValid = false;
    } else if (state.deliveryZone === 'pickup' && !address) {
      address = 'Store Pickup — Ejisu / Adum Hub';
      document.getElementById('custAddress').value = address;
    }
    if (!isValid) return;

    const prodMap = getProductsMap();
    for (const item of state.cart) {
      const prod = prodMap.get(item.productId);
      if (!prod || prod.stock < item.qty) {
        showToast(`Insufficient stock for "${prod ? prod.title : 'an item'}". Please review your cart.`);
        return;
      }
    }

    const subtotal = getCartSubtotal();
    const delivery = calculateDelivery(state.cart, prodMap, state.deliveryZone);
    const grandTotal = subtotal + delivery.fee;
    const orderId = generateOrderReference();

    const orderRecord = {
      orderId,
      createdAt: new Date().toLocaleString('en-GH', { dateStyle: 'medium', timeStyle: 'short' }),
      customer: { fullName, phone, email, address, notes },
      zoneLabel: DELIVERY_ZONES[state.deliveryZone].label,
      paymentMethod,
      items: state.cart.map((item) => {
        const prod = prodMap.get(item.productId);
        return { title: prod.title, sku: prod.sku, variant: item.variant, qty: item.qty, unitPrice: prod.price, lineTotal: prod.price * item.qty };
      }),
      subtotal,
      deliveryFee: delivery.fee,
      grandTotal,
    };

    /* PRODUCTION HOOK: integrate Paystack here (see original comment) */
    finalizeLocalOrder(orderRecord);
  }

  function finalizeLocalOrder(orderRecord) {
    orderRecord.items.forEach((orderedItem) => {
      const product = state.products.find((p) => p.sku === orderedItem.sku);
      if (product) product.stock = Math.max(0, product.stock - orderedItem.qty);
    });
    saveStock();

    try {
      const existingOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)) || [];
      existingOrders.unshift(orderRecord);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(existingOrders.slice(0, 20)));
    } catch { /* ignore quota */ }

    state.cart = [];
    saveCart();
    state.lastOrder = orderRecord;

    renderCatalog();
    renderCart();

    const whatsappLines = [
      `*NEW ORDER — ${STORE_CONFIG.name}*`,
      `Order Ref: *${orderRecord.orderId}*`,
      `Customer: ${orderRecord.customer.fullName} (${orderRecord.customer.phone})`,
      `Delivery: ${orderRecord.zoneLabel}`,
      `Address: ${orderRecord.customer.address}`,
      `Payment: ${orderRecord.paymentMethod}`,
      `---`,
      ...orderRecord.items.map((i) => `• ${i.qty}x ${i.title} [${i.variant}] = ${formatMoney(i.lineTotal)}`),
      `---`,
      `Subtotal: ${formatMoney(orderRecord.subtotal)}`,
      `Delivery: ${formatMoney(orderRecord.deliveryFee)}`,
      `*Total Payable: ${formatMoney(orderRecord.grandTotal)}*`,
    ];
    if (orderRecord.customer.notes) whatsappLines.push(`Note: ${orderRecord.customer.notes}`);

    const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsappLines.join('\n'))}`;

    document.getElementById('checkoutFormView').classList.add('hidden');
    const confirmView = document.getElementById('orderConfirmationView');
    confirmView.classList.remove('hidden');
    confirmView.innerHTML = `
      <div class="receipt-badge" aria-hidden="true">✓</div>
      <h2>Order Confirmed!</h2>
      <p class="muted-text">Thank you, ${escapeHTML(orderRecord.customer.fullName)}. Your order has been received and is being prepared for dispatch.</p>
      <div class="receipt-card">
        <div class="summary-line"><span>Order Reference</span><strong>${escapeHTML(orderRecord.orderId)}</strong></div>
        <div class="summary-line"><span>Date</span><span>${escapeHTML(orderRecord.createdAt)}</span></div>
        <div class="summary-line"><span>Delivery</span><span>${escapeHTML(orderRecord.zoneLabel)}</span></div>
        <div class="summary-line"><span>Payment</span><span>${escapeHTML(orderRecord.paymentMethod)}</span></div>
        <hr style="border:none;border-top:1px solid var(--color-border);margin:0.5rem 0;" />
        ${orderRecord.items.map((i) => `
          <div class="summary-line">
            <span>${i.qty}× ${escapeHTML(i.title)} <small class="muted-text">(${escapeHTML(i.variant)})</small></span>
            <strong>${formatMoney(i.lineTotal)}</strong>
          </div>`).join('')}
        <hr style="border:none;border-top:1px solid var(--color-border);margin:0.5rem 0;" />
        <div class="summary-line"><span>Subtotal</span><span>${formatMoney(orderRecord.subtotal)}</span></div>
        <div class="summary-line"><span>Delivery</span><span>${orderRecord.deliveryFee === 0 ? 'FREE' : formatMoney(orderRecord.deliveryFee)}</span></div>
        <div class="total-row grand-total"><span>Total</span><span>${formatMoney(orderRecord.grandTotal)}</span></div>
      </div>
      <div class="receipt-actions">
        <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp">Send Order via WhatsApp</a>
        <button type="button" class="btn btn-outline" id="newOrderBtn">Continue Shopping</button>
      </div>`;

    document.getElementById('newOrderBtn')?.addEventListener('click', () => {
      closeModal('checkoutModal');
      document.getElementById('checkoutForm')?.reset();
      ['custName', 'custPhone', 'custEmail', 'custAddress'].forEach((id) => {
        const el = document.getElementById(`err-${id}`);
        if (el) el.textContent = '';
      });
    });
  }

  /* ==========================================================================
     11. POLICIES
     ========================================================================== */
  const POLICY_CONTENT = {
    shipping: `
      <h3>Shipping &amp; Delivery</h3>
      <p>Orders placed before 3:00 PM GMT on business days are dispatched the same day.</p>
      <ul>
        <li><strong>Store Pickup (Free):</strong> Ready within 2 hours at Ejisu Hub or Adum point.</li>
        <li><strong>Same-City Rider (GHS 25):</strong> Ejisu &amp; Greater Kumasi — usually 1–4 hours after dispatch. Heavy appliances add GHS 15 handling.</li>
        <li><strong>Regional / Intercity (from GHS 55):</strong> Accra, Takoradi, Tamale and other regions — 24 to 48 hours via partner couriers. Extra items add GHS 8 each; heavy cargo adds GHS 25.</li>
      </ul>`,
    returns: `
      <h3>Returns &amp; Refunds</h3>
      <p>We accept returns within 7 days of delivery for unopened items and defective products.</p>
      <ul>
        <li>Items must be in original packaging with all accessories.</li>
        <li>Defective electronics are replaced or refunded after inspection.</li>
        <li>Refunds are processed via the original payment method within 3–5 business days.</li>
        <li>Perishables and opened personal-care items are non-returnable for hygiene reasons.</li>
      </ul>`,
    privacy: `
      <h3>Privacy Policy</h3>
      <p>AsanteMart collects only the information needed to fulfil your order: name, phone number, delivery address, and (optionally) email.</p>
      <ul>
        <li>Your data is used to process orders, coordinate deliveries, and provide customer support.</li>
        <li>We never sell or rent your personal data to third parties.</li>
        <li>Payment details are handled by licensed payment processors — we do not store card numbers.</li>
        <li>You may request deletion of your data by emailing hello@asantemart.com.</li>
      </ul>`,
    terms: `
      <h3>Terms of Service</h3>
      <p>By placing an order on AsanteMart you agree to the following terms:</p>
      <ul>
        <li>Prices are shown in Ghana Cedis (GHS) and include applicable taxes.</li>
        <li>Stock counts are live; in rare cases where an item sells out before dispatch, we will contact you to arrange a substitute or refund.</li>
        <li>Delivery timelines are estimates and may vary during peak periods or public holidays.</li>
        <li>Abusive behaviour toward dispatch riders or staff will result in order cancellation.</li>
      </ul>`,
  };

  function renderPolicy(key) {
    const content = document.getElementById('policyContent');
    if (!content) return;
    content.innerHTML = POLICY_CONTENT[key] || POLICY_CONTENT.shipping;
    document.querySelectorAll('.policy-tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.policyTab === key);
    });
  }
  function openPolicy(key = 'shipping') {
    renderPolicy(key);
    openModal('policyModal');
  }

  /* ==========================================================================
     12. ROUTING
     ========================================================================== */
  const VIEWS = ['shop', 'about', 'contact'];
  function routeTo(route) {
    if (!VIEWS.includes(route)) route = 'shop';
    VIEWS.forEach((v) => document.getElementById(`view-${v}`)?.classList.toggle('active', v === route));
    document.querySelectorAll('[data-route]').forEach((el) => {
      el.classList.toggle('active', el.dataset.route === route);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.location.hash !== `#${route}`) history.replaceState(null, '', `#${route}`);
  }

  /* ==========================================================================
     13. EVENT WIRING
     ========================================================================== */
  function initRouting() {
    document.querySelectorAll('[data-route]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        routeTo(el.dataset.route);
      });
    });
    const initial = (window.location.hash || '#shop').slice(1);
    routeTo(VIEWS.includes(initial) ? initial : 'shop');
  }

  function initCatalogEvents() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    const sortSelect = document.getElementById('sortSelect');
    const resetBtn = document.getElementById('resetFiltersBtn');
    const grid = document.getElementById('productGrid');

    searchInput?.addEventListener('input', () => {
      state.filters.search = searchInput.value;
      clearBtn.classList.toggle('hidden', !searchInput.value);
      renderCatalog();
    });
    clearBtn?.addEventListener('click', () => {
      searchInput.value = '';
      state.filters.search = '';
      clearBtn.classList.add('hidden');
      renderCatalog();
      searchInput.focus();
    });
    sortSelect?.addEventListener('change', () => {
      state.filters.sort = sortSelect.value;
      renderCatalog();
    });

    document.querySelectorAll('.tab-btn[data-category]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn[data-category]').forEach((b) => {
          const active = b === btn;
          b.classList.toggle('active', active);
          b.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        state.filters.category = btn.dataset.category;
        renderCatalog();
      });
    });

    resetBtn?.addEventListener('click', () => {
      state.filters = { category: 'All', search: '', sort: 'featured' };
      searchInput.value = '';
      sortSelect.value = 'featured';
      clearBtn.classList.add('hidden');
      document.querySelectorAll('.tab-btn[data-category]').forEach((b) => {
        const active = b.dataset.category === 'All';
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      renderCatalog();
    });

    grid?.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;
      const id = target.dataset.id;
      if (target.dataset.action === 'view-detail') openProductDetail(id);
      else if (target.dataset.action === 'quick-add') {
        const prod = getProductsMap().get(id);
        if (!prod) return;
        if (addToCart(id, prod.variants[0] || 'Standard', 1)) openCartDrawer();
      }
    });
  }

  function initCartEvents() {
    document.getElementById('openCartBtn').addEventListener('click', openCartDrawer);
    document.getElementById('closeCartBtn').addEventListener('click', closeCartDrawer);
    document.getElementById('drawerBackdrop').addEventListener('click', closeCartDrawer);

    document.getElementById('cartItemsContainer').addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.cartDec !== undefined) updateCartItemQty(Number(btn.dataset.cartDec), -1);
      else if (btn.dataset.cartInc !== undefined) updateCartItemQty(Number(btn.dataset.cartInc), 1);
      else if (btn.dataset.cartDel !== undefined) removeCartItem(Number(btn.dataset.cartDel));
    });

    document.getElementById('deliveryZoneSelect').addEventListener('change', (e) => {
      state.deliveryZone = e.target.value;
      saveZone();
      renderCart();
    });

    document.getElementById('proceedCheckoutBtn').addEventListener('click', openCheckoutModal);
  }

  function initCheckoutEvents() {
    document.getElementById('checkoutForm').addEventListener('submit', handleCheckoutSubmit);
    document.getElementById('checkoutZoneSelect').addEventListener('change', (e) => {
      state.deliveryZone = e.target.value;
      saveZone();
      syncCheckoutSummary();
      document.getElementById('deliveryZoneSelect').value = state.deliveryZone;
    });
  }

  function initPolicyEvents() {
    document.querySelectorAll('[data-open-policy]').forEach((btn) => {
      btn.addEventListener('click', () => openPolicy(btn.dataset.openPolicy));
    });
    document.querySelectorAll('.policy-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => renderPolicy(btn.dataset.policyTab));
    });
  }

  function initModalEvents() {
    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
    });
    document.querySelectorAll('.modal').forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal.id);
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('.modal:not(.hidden)').forEach((m) => closeModal(m.id));
      closeCartDrawer();
    });
  }

  function initContactForm() {
    const form = document.getElementById('contactForm');
    const feedback = document.getElementById('contactFeedback');
    if (!form || !feedback) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName').value.trim();
      const phone = document.getElementById('contactPhone').value.trim();
      const message = document.getElementById('contactMessage').value.trim();
      if (name.length < 2 || phone.replace(/\D/g, '').length < 9 || message.length < 4) {
        feedback.textContent = 'Please complete all fields with valid details.';
        feedback.style.color = 'var(--color-danger)';
        return;
      }
      feedback.textContent = `Thanks, ${name}! We've received your message and will reply on WhatsApp shortly.`;
      feedback.style.color = 'var(--color-success)';
      form.reset();
    });
  }

  /* ==========================================================================
     14. BOOT
     ========================================================================== */
  function init() {
    loadPersistedState();
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    renderCatalog();
    renderCart();
    initRouting();
    initCatalogEvents();
    initCartEvents();
    initCheckoutEvents();
    initPolicyEvents();
    initModalEvents();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
