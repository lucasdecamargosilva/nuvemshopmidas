(function () {
    // ===============================================
    // 0. CHUMBAR A API KEY AQUI DIRETO NO CÓDIGO
    // ===============================================
    const apiKey = "pl_live_446acf54c09daeef51981e1185c528fd53edc514ef1ec001cd286ed57880832b";
    window.PROVOU_LEVOU_API_KEY = apiKey;

    const WEBHOOK_PROVA = 'https://n8n.segredosdodrop.com/webhook/quantic-materialize';
    const SIZES_TOP = ['XXP', 'XP', 'P', 'M', 'G', 'XG', 'XXG', '3XG', '4XG', '5XG'];
    const SIZES_BOTTOM = ['36/XXP', '38/XP', '40/P', '42/M', '44/G', '46/XG', '48/XXG', '50/3XG', '52/4XG', '54/5XG'];
    const SIZES_BOTTOM_SW = ['XXP', 'XP', 'P', 'M', 'G', 'XG', 'XXG', '3XG', '4XG', '5XG'];


    const GRADE = {
        regular: [49, 51, 54, 57, 61, 62, 64, 66, 70, 73],
        oversized: [58, 60, 62, 64, 66, 70, 73, 76, 79, 83],
        oversizedSS: [58, 61, 63, 67, 70, 74, 78, 82, 87, 92],
        hoodie: [50, 53, 55, 58, 62, 65, 69, 74, 79, 83],
        boxyHoodie: [61, 77, 78, 79, 80, 81, 82, 83, 84, 85],
        puffer: [53, 56, 59, 61, 70, 74, 78, 82, 86, 90],
        vest: [52, 55, 57, 59, 63, 66, 70, 72, 76, 82],
        boxyHenley: [54, 56, 58, 64, 66, 68, 70, 76, 78, 84],
        bottomTailoring: [36, 38, 40, 42, 44, 46, 48, 50, 52, 54],
        bottomSweat: [36, 38, 40, 42, 44, 46, 48, 50, 52, 54],
        underwear: [36, 38, 40, 42, 44, 46, 48, 50, 52, 54],
        quadrilTailoring: [48, 50, 52, 56, 58, 60, 62, 64, 66, 68],
        quadrilSweat: [48, 50, 52, 54, 56, 58, 60, 62, 64, 66],
        quadrilUnderwear: [50, 52, 54, 56, 58, 60, 62, 64, 66, 68],
    };


    function detectProduct(name) {
        const n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (/tailoring/.test(n) || /\d\/\d\s*short/.test(n) || /\b(1\/5|2\/5|3\/5|4\/5)\b/.test(n)) return { category: 'bottom', fit: 'tailoring' };
        if (/underwear|cueca/.test(n)) return { category: 'bottom', fit: 'underwear' };
        if (/sweatpant|sweatshort|sweat pant|sweat short|calca|bermuda/.test(n)) return { category: 'bottom', fit: 'sweat' };
        if (/henley/.test(n)) return { category: 'top', fit: 'boxyHenley' };
        if (/boxy.*(hoodie|crewneck|crew)/.test(n) || /(hoodie|crewneck|crew).*boxy/.test(n)) return { category: 'top', fit: 'boxyHoodie' };
        if (/puffer|jacket/.test(n)) return { category: 'top', fit: 'puffer' };
        if (/vest/.test(n)) return { category: 'top', fit: 'vest' };
        if (/(hoodie|hoodie zip|half zip|crewneck|crew neck)/.test(n) && !/oversized|boxy|short sleeve/.test(n)) return { category: 'top', fit: 'hoodie' };
        if (/oversized.*(hoodie|crewneck|crew|short sleeve)/.test(n) || /short sleeve.*(hoodie|crewneck)/.test(n)) return { category: 'top', fit: 'oversizedSS' };
        if (/oversized|boxy tee|2\/4/.test(n)) return { category: 'top', fit: 'oversized' };
        return { category: 'top', fit: 'regular' };
    }


    function estimarTorax(altura, peso) {
        if (altura < 3) altura *= 100;
        let circ = 0.65 * peso + 56;
        const imc = peso / Math.pow(altura / 100, 2);
        if (imc > 30) circ += 4; else if (imc > 25) circ += 2;
        return circ;
    }


    function findClosest(arr, val) {
        let idx = 0, minDiff = Infinity;
        arr.forEach((v, i) => { const d = Math.abs(v - val); if (d < minDiff) { minDiff = d; idx = i; } });
        return idx;
    }


    let recommendedSize = 'M';
    let currentProduct = { category: 'top', fit: 'regular' };

    function calculateFinalSize() {
        // Feature desativada: não faz mais cálculos de tamanho
        return;
    }


    // ─── LOCK / UNLOCK SCROLL DA PÁGINA ──────────────────────────────────────────


    let scrollY = 0;


    function lockBodyScroll() {
        scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.overflowY = 'scroll';
    }


    function unlockBodyScroll() {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflowY = '';
        window.scrollTo(0, scrollY);
    }


    // ─── ESTILOS ──────────────────────────────────────────────────────────────────


    const styles = `
        :root {
            --q-primary: #000000; --q-bg: #ffffff;
            --q-border: #000000; --q-gray: #f5f5f5;
            --q-text: #000000; --q-text-light: #666666;
        }

        /* ── BOTÃO SELO ─────────────────────────────────────────────────────────── */
        @keyframes q-shake {
            0% { transform: rotate(0deg); }
            10% { transform: rotate(-10deg); }
            20% { transform: rotate(10deg); }
            30% { transform: rotate(-10deg); }
            40% { transform: rotate(10deg); }
            50% { transform: rotate(0deg); }
            100% { transform: rotate(0deg); }
        }
        .q-btn-trigger-ia {
            position: absolute;
            top: 15px;
            right: 15px;
            z-index: 100;
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
            width: 55px;
            height: 55px;
            display: flex;
            align-items: center;
            justify-content: center;
            filter: drop-shadow(0 2px 6px rgba(0,0,0,0.18));
            animation: q-shake 3s infinite;
        }
        .q-btn-trigger-ia:hover {
            filter: drop-shadow(0 4px 12px rgba(0,0,0,0.28));
        }
        .q-btn-trigger-ia svg {
            width: 100%;
            height: 100%;
            overflow: visible;
        }

        @media (min-width: 768px) {
            .q-btn-trigger-ia {
                width: 65px;
                height: 65px;
            }
        }

        #q-modal-ia { display: none; position: fixed; inset: 0; background: rgba(255,255,255,0.98); z-index: 999999; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; }
        .q-card-ia { background: var(--q-bg); width: 100%; max-width: 480px; padding: 0; position: relative; color: var(--q-text); border: 1px solid var(--q-border); max-height: 94vh; display: flex; flex-direction: column; overflow: hidden; }
        .q-content-scroll { padding: 40px 30px; overflow-y: auto; flex: 1; text-align: center; }
        .q-close-ia { position: absolute; top: 20px; right: 20px; background: none; border: none; color: var(--q-text); cursor: pointer; font-size: 24px; z-index: 100; font-weight: 300; }
        .q-tips-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 20px 0; margin: 20px 0; border-top: 1px solid var(--q-gray); border-bottom: 1px solid var(--q-gray); }
        .q-tip-item { display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 9px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--q-text-light); }
        .q-tip-item i { color: var(--q-primary); font-size: 20px; }
        .q-lead-form { margin: 30px 0 20px; display: flex; flex-direction: column; gap: 20px; text-align: left; }
        .q-input-row { display: flex; gap: 15px; }
        .q-group { flex: 1; }
        .q-group label { display: block; font-size: 9px; font-weight: 600; letter-spacing: 1.5px; color: var(--q-text); margin-bottom: 8px; text-transform: uppercase; }
        .q-input { width: 100%; padding: 15px; border: 1px solid var(--q-border); font-size: 13px; font-family: 'Inter', sans-serif; background: transparent; color: var(--q-text); outline: none; box-sizing: border-box; }
        .q-input:focus { border-width: 2px; padding: 14px; }
        .q-input-hint { font-size: 9px; color: var(--q-text-light); letter-spacing: 0.5px; margin-top: 6px; }
        .q-btn-black { background: var(--q-primary); color: var(--q-bg); border: 1px solid var(--q-primary); width: 100%; padding: 18px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; margin-top: 20px; transition: 0.3s; }
        .q-btn-black:disabled { background: var(--q-gray); color: #999; border-color: var(--q-gray); cursor: not-allowed; }
        .q-btn-black:not(:disabled):hover { background: var(--q-bg); color: var(--q-primary); }
        .q-btn-buy { background: var(--q-primary); color: var(--q-bg); border: 1px solid var(--q-primary); width: 100%; padding: 20px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; margin-bottom: 15px; transition: 0.3s; }
        .q-btn-buy:hover { background: var(--q-bg); color: var(--q-primary); }
        .q-btn-outline { background: var(--q-bg); color: var(--q-primary); border: 1px solid var(--q-border); width: 100%; padding: 18px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: 0.3s; }
        .q-btn-outline:hover { background: var(--q-primary); color: var(--q-bg); }
        .q-powered-footer { background: var(--q-bg); padding: 20px; display: flex; align-items: center; justify-content: center; gap: 10px; flex-shrink: 0; border-top: 1px solid var(--q-gray); }
        .q-quantic-logo { height: 24px; filter: brightness(0); }
        .q-status-msg { display:none; font-size: 9px; letter-spacing: 1px; color: #ef4444; margin-top: 8px; font-weight: 600; text-align: left; text-transform: uppercase; }
        @keyframes q-slide { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
        @keyframes q-pulse-text { 0%, 100% { opacity: 0.4; transform: scale(0.98); } 50% { opacity: 1; transform: scale(1); } }
        .q-content-scroll::-webkit-scrollbar { width: 4px; }
        .q-content-scroll::-webkit-scrollbar-thumb { background: #e5e5e5; }


        /* ════════════════════════════════════════════
           LAYOUT PC — TELA DE RESULTADO
        ════════════════════════════════════════════ */
        @media (min-width: 768px) {
            .q-card-ia.is-result {
                width: 820px !important; max-width: 90vw !important;
                height: 560px !important; border-radius: 0 !important;
            }
            .q-card-ia.is-result #q-header-provador,
            .q-card-ia.is-result .q-powered-footer { display: none !important; }
            .q-card-ia.is-result .q-content-scroll {
                padding: 0 !important; height: 100% !important;
                overflow: hidden !important; display: flex !important; flex-direction: column !important;
            }
            .q-card-ia.is-result #q-step-result {
                display: flex !important; flex-direction: row !important;
                width: 100%; height: 100%; align-items: stretch;
            }
            .q-card-ia.is-result #q-result-img-col {
                width: 45% !important; height: 100% !important; margin: 0 !important;
                border: none !important; border-right: 1px solid var(--q-border) !important;
                position: relative !important; flex-shrink: 0;
            }
            .q-card-ia.is-result #q-result-img-col img {
                position: absolute !important; top: 0; left: 0;
                width: 100% !important; height: 100% !important;
                object-fit: cover !important; object-position: top center !important;
            }
            .q-card-ia.is-result #q-result-actions-col {
                width: 55% !important; height: 100% !important; padding: 40px !important;
                display: flex !important; flex-direction: column; justify-content: center;
                box-sizing: border-box; overflow-y: auto;
            }
            .q-card-ia.is-result .q-res-title {
                display: block !important; font-size: 20px; font-weight: 700;
                letter-spacing: 2px; text-transform: uppercase; color: var(--q-text); margin-bottom: 4px;
            }
            .q-card-ia.is-result .q-res-subtitle {
                display: block !important; font-size: 11px; color: var(--q-text-light);
                letter-spacing: 1px; text-transform: uppercase; margin-bottom: 30px;
            }
            .q-card-ia.is-result .q-res-note {
                display: flex !important; align-items: flex-start; gap: 8px; font-size: 10px;
                color: var(--q-text-light); font-style: italic; letter-spacing: 1px; margin-bottom: 24px; line-height: 1.5;
            }
            .q-card-ia.is-result .q-res-note i { flex-shrink: 0; margin-top: 1px; font-size: 14px; }
            .q-card-ia.is-result .q-btn-buy {
                border-radius: 0 !important; display: flex; align-items: center; justify-content: center; gap: 8px;
                font-size: 11px !important; padding: 18px !important; margin-bottom: 12px;
                font-weight: 600; letter-spacing: 2px !important; text-transform: uppercase !important;
            }
            .q-card-ia.is-result .q-btn-outline {
                border-radius: 0 !important; display: flex; align-items: center; justify-content: center;
                font-size: 11px !important; padding: 18px !important; margin-top: 0;
                font-weight: 600; letter-spacing: 2px !important; text-transform: uppercase !important;
            }
            .q-card-ia.is-result .q-res-mobile-only { display: none !important; }
            .q-card-ia.is-result .q-close-ia { top: 16px; right: 16px; color: var(--q-text); z-index: 10; }
        }
    `;


    // ─── IMAGEM DO BOTÃO (trigger) ─────────────────────────────────────────────
    const stampImageHTML = `<img src="https://cdn.shopify.com/s/files/1/0636/6334/1746/files/logo_provador.png?v=1772494793" alt="Provador Virtual" style="width:100%;height:100%;object-fit:contain;">`;



    // ─── HTML ─────────────────────────────────────────────────────────────────────


    const html = `
        <div id="q-modal-ia">
            <div class="q-card-ia">
                <button type="button" class="q-close-ia" id="q-close-btn">&times;</button>
                <div class="q-content-scroll">
                    <div id="q-header-provador">
                        <h1 style="margin:0 0 10px 0;font-size:20px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Provador Virtual</h1>
                        <div style="margin:0;text-align:center;">
  <img 
    src="https://acdn-us.mitiendanube.com/stores/004/739/314/themes/common/logo-668716748-1718371761-c5981d6dbab829bfc242001f304afdf91718371761-480-0.webp" 
    alt="MIDAS" 
    style="height:30px;width:auto;display:inline-block;filter:brightness(0);"
  />
</div>


                    </div>
                    <div id="q-step-upload">
                        <div class="q-lead-form" id="q-photo-selector-group" style="margin-top:0; margin-bottom:0; display:none;">
                            <label>Selecione a foto da peça:</label>
                            <div id="q-product-images-container" style="display:flex; gap:10px;"></div>
                            <p style="margin:8px 0 0;font-size:9px;color:#ef4444;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">⚠️ Se você escolheu a peça de costas, envie uma foto sua de costas também!</p>
                        </div>
                        <div class="q-lead-form">
                            <div class="q-group">
                                <label>Seu WhatsApp</label>
                                <input type="tel" id="q-phone" class="q-input" placeholder="(11) 99999-9999" maxlength="15">
                                <div id="q-phone-error" class="q-status-msg">Insira um número válido</div>
                            </div>
                        </div>
                        <p style="margin:10px 0 10px;font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--q-text-light);text-align:center;">Sua foto deve seguir estes requisitos:</p>
                        <div class="q-tips-grid" style="margin-top:0;">
                            <div class="q-tip-item"><i class="ph ph-t-shirt"></i><span>Com Roupa</span></div>
                            <div class="q-tip-item"><i class="ph ph-person"></i><span>Corpo Inteiro</span></div>
                            <div class="q-tip-item"><i class="ph ph-sun"></i><span>Boa Luz</span></div>
                        </div>
                        <div style="display:flex;gap:20px;justify-content:center;margin-top:30px;">
                            <div id="q-trigger-upload" style="width:120px;height:160px;border:1px solid var(--q-border);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;background:var(--q-gray);transition:0.3s;">
                                <i class="ph ph-camera-plus" style="font-size:32px;color:var(--q-primary);margin-bottom:10px;"></i>
                                <span style="font-size:9px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Enviar Foto</span>
                                <input type="file" id="q-real-input" accept="image/*" style="display:none">
                            </div>
                            <div id="q-pre-view" style="display:none;width:120px;height:160px;overflow:hidden;border:1px solid var(--q-border);">
                                <img id="q-pre-img" style="width:100%;height:100%;object-fit:cover;">
                            </div>
                        </div>
                        <button class="q-btn-black" id="q-btn-generate" disabled>Ver no meu corpo</button>
                    </div>


                    <div style="display:none;padding:60px 0;text-align:center;" id="q-loading-box">
                        <div style="font-weight:600;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-bottom:20px;animation:q-pulse-text 1.5s infinite ease-in-out;">Gerando Prova Virtual...</div>
                        <div style="height:1px;background:var(--q-gray);width:100%;position:relative;overflow:hidden;">
                            <div style="position:absolute;top:0;left:0;height:100%;width:30%;background:var(--q-primary);animation:q-slide 1.5s infinite linear;"></div>
                        </div>
                    </div>


                    <div id="q-step-result" style="display:none;flex-direction:column;align-items:center;">
                        <div id="q-result-img-col" style="width:100%;border:1px solid var(--q-border);margin-bottom:60px;background:var(--q-gray);">
                            <img id="q-final-view-img" style="width:100%;height:auto;display:block;">
                        </div>
                        <div id="q-result-actions-col" style="width:100%;">
                            <span class="q-res-title" style="display:none; margin-bottom:40px;">Provador Virtual</span>
                            
                            <div class="q-res-note" style="display:none;">
                                <i class="ph ph-info"></i>
                                <span>A simulação AI considera o caimento do tecido baseado na sua estrutura corporal informada.</span>
                            </div>
                            <button class="q-btn-outline" id="q-btn-back">Voltar ao Produto</button>
                            <p class="q-res-mobile-only" style="margin-top:30px;font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--q-text-light);cursor:pointer;text-decoration:underline;text-underline-offset:4px;" id="q-retry-btn">Tentar outra foto</p>
                        </div>
                    </div>
                </div>
                <a href="https://provoulevou.com.br" target="_blank" class="q-powered-footer" style="text-decoration:none;">
                    <span style="font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--q-text-light);">Powered by</span>
                    <img src="https://provoulevou.com.br/assets/provoulevou-logo.png" class="q-quantic-logo">
                </a>
            </div>
        </div>
    `;


    // ─── INIT ─────────────────────────────────────────────────────────────────────


    function init() {
        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);


        if (!window.phosphorIconsLoaded) {
            const ph = document.createElement('script');
            ph.src = 'https://unpkg.com/@phosphor-icons/web';
            document.head.appendChild(ph);
            window.phosphorIconsLoaded = true;
        }


        const styleTag = document.createElement('style');
        styleTag.innerHTML = styles;
        document.head.appendChild(styleTag);


        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = html;
        document.body.appendChild(modalContainer);


        // ── Botão imagem PNG ──
        const openBtn = document.createElement('button');
        openBtn.className = 'q-btn-trigger-ia';
        openBtn.id = 'q-open-ia';
        openBtn.setAttribute('aria-label', 'Abrir Provador Virtual');
        openBtn.innerHTML = stampImageHTML;


        const imgContainers = ['.js-product-slide', '.product-image-column', '.js-swiper-product', '[data-store^="product-image-"]', '.product__media-wrapper', '.product-gallery__media', '.product__media', '.product-image-main', '.product-media-container', '[data-media-id]', '.product__media-item', '.product-gallery', '.product-single__media', '.media-gallery'];
        let placed = false;
        for (const sel of imgContainers) {
            const el = document.querySelector(sel);
            if (el) {
                if (window.getComputedStyle(el).position === 'static') el.style.position = 'relative';
                el.appendChild(openBtn);
                placed = true; break;
            }
        }
        if (!placed) {
            openBtn.style.cssText = 'position:fixed;bottom:30px;right:20px;top:auto;width:55px;height:55px;';
            document.body.appendChild(openBtn);
        }


        const modal = document.getElementById('q-modal-ia');
        const genBtn = document.getElementById('q-btn-generate');
        const closeBtn = document.getElementById('q-close-btn');
        const backBtn = document.getElementById('q-btn-back');
        const retryBtn = document.getElementById('q-retry-btn');
        const realInput = document.getElementById('q-real-input');
        const triggerUpload = document.getElementById('q-trigger-upload');
        const phoneInput = document.getElementById('q-phone');


        let userPhoto = null;
        let selectedProductImgUrl = '';

        function extractImages() {
            const imgEls = Array.from(document.querySelectorAll('.js-product-slide img, .product__media img, .product-single__photo, [data-component="product.gallery"] img, .swiper-slide:not(.swiper-slide-duplicate) img, .product-image-container img'));
            let uniqueImgs = [];
            let signatures = [];
            imgEls.forEach(img => {
                let src = img.src || img.dataset?.src;
                if (!src || src.includes('data:image')) return;
                let sig = src.replace(/-\d+-\d+\.webp|\?v=\d+|_\d+x\d+/, '');
                if (!signatures.includes(sig)) {
                    signatures.push(sig);
                    uniqueImgs.push(src);
                }
            });
            if (uniqueImgs.length === 0) {
                const og = document.querySelector('meta[property="og:image"]')?.content;
                if (og) uniqueImgs.push(og);
            }
            return uniqueImgs.slice(0, 2);
        }

        function populateImageSelector() {
            const imgs = extractImages();
            const container = document.getElementById('q-product-images-container');
            const group = document.getElementById('q-photo-selector-group');
            container.innerHTML = '';

            if (imgs.length < 2) {
                group.style.display = 'none';
                selectedProductImgUrl = imgs[0] || '';
                return;
            }

            group.style.display = 'flex';
            group.style.flexDirection = 'column';
            selectedProductImgUrl = imgs[0];

            imgs.forEach((url, i) => {
                const box = document.createElement('div');
                box.style.cssText = `width:70px; height:90px; border: 2px solid ${i === 0 ? 'var(--q-primary)' : 'var(--q-gray)'}; border-radius:4px; overflow:hidden; cursor:pointer; opacity: ${i === 0 ? '1' : '0.5'}; transition: 0.3s;`;
                const img = document.createElement('img');
                img.src = url;
                img.style.cssText = 'width:100%; height:100%; object-fit:cover;';
                box.appendChild(img);

                box.onclick = () => {
                    selectedProductImgUrl = url;
                    Array.from(container.children).forEach(child => {
                        child.style.borderColor = 'var(--q-gray)';
                        child.style.opacity = '0.5';
                    });
                    box.style.borderColor = 'var(--q-primary)';
                    box.style.opacity = '1';
                };
                container.appendChild(box);
            });
        }

        function openModal() {
            modal.style.display = 'flex';
            lockBodyScroll();
        }


        function closeModal() {
            modal.style.display = 'none';
            unlockBodyScroll();
        }


        function applyProduct(product) {
            currentProduct = product;
        }


        openBtn.onclick = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            const prodName = document.querySelector('h1.product__title,.product-single__title,h1')?.innerText || document.title;
            applyProduct(detectProduct(prodName));
            populateImageSelector();
            openModal();
        };


        closeBtn.onclick = () => closeModal();
        backBtn.onclick = () => closeModal();


        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });


        retryBtn.onclick = () => {
            document.getElementById('q-step-result').style.display = 'none';
            document.getElementById('q-step-upload').style.display = 'block';
            document.querySelector('.q-card-ia').classList.remove('is-result');
            userPhoto = null;
            document.getElementById('q-pre-view').style.display = 'none';
            checkFields();
        };


        triggerUpload.onclick = () => realInput.click();


        phoneInput.addEventListener('input', function (e) {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
            checkFields();
        });


        function checkFields() {
            const nums = phoneInput.value.replace(/\D/g, '');
            const phoneOk = nums.length >= 10 && nums.length <= 11;
            document.getElementById('q-phone-error').style.display = (phoneInput.value.length > 0 && !phoneOk) ? 'block' : 'none';
            phoneInput.style.borderColor = (phoneInput.value.length > 0 && !phoneOk) ? '#ef4444' : 'var(--q-border)';
            // Medidas removidas, precisamos apenas do telefone e foto
            genBtn.disabled = !(userPhoto && phoneOk);
        }


        ['q-h-val', 'q-w-val', 'q-cin-val', 'q-quad-val'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', checkFields);
        });


        realInput.onchange = (e) => {
            userPhoto = e.target.files[0];
            if (userPhoto) {
                const rd = new FileReader();
                rd.onload = ev => {
                    document.getElementById('q-pre-img').src = ev.target.result;
                    document.getElementById('q-pre-view').style.display = 'block';
                    checkFields();
                };
                rd.readAsDataURL(userPhoto);
            }
        };


        genBtn.onclick = async () => {
            // 🚨 VALIDAÇÃO BÁSICA NO FRONT 🚨
            const keyToUse = window.PROVOU_LEVOU_API_KEY;
            if (!keyToUse || keyToUse.includes("COLOQUE_A_CHAVE_AQUI")) {
                alert("Erro: API Key não configurada neste script.");
                return;
            }

            const prodImg = selectedProductImgUrl || (document.querySelector('meta[property="og:image"]')?.content || '');
            const prodName = document.querySelector('h1.product__title,.product-single__title,h1')?.innerText || document.title;


            document.getElementById('q-step-upload').style.display = 'none';
            document.getElementById('q-loading-box').style.display = 'block';


            try {
                const fd = new FormData();
                fd.append('person_image', userPhoto);
                fd.append('whatsapp', '55' + phoneInput.value.replace(/\D/g, ''));
                fd.append('phone_raw', phoneInput.value);
                fd.append('product_name', prodName);
                fd.append('product_type', currentProduct.category);
                fd.append('product_fit', currentProduct.fit);

                // 👉 INJETA A CHAVE NO FORM DATA PRO N8N LER
                fd.append('api_key', keyToUse);


                // Para compatibilidade com o backend que pode esperar estes campos, enviamos vazio
                if (currentProduct.category === 'top') {
                    fd.append('height', '');
                    fd.append('weight', '');
                } else {
                    fd.append('cintura', '');
                    fd.append('quadril', '');
                }


                if (prodImg) {
                    try { const b = await fetch(prodImg).then(r => r.blob()); fd.append('product_image', b, 'p.png'); } catch (_) { }
                }


                calculateFinalSize();


                const res = await fetch(WEBHOOK_PROVA, { method: 'POST', body: fd });

                const contentType = res.headers.get("content-type") || "";
                if (contentType.includes("application/json")) {
                    const data = await res.json();
                    if (data.error) {
                        document.getElementById('q-loading-box').style.display = 'none';
                        document.getElementById('q-step-upload').style.display = 'block';
                        if (data.error === "Chave invalida, vencida ou inativa." || data.error.includes("vencida ou inativa")) {
                            alert("App desativado nesta loja");
                        } else {
                            alert(data.error);
                        }
                        return;
                    }
                }

                if (res.ok) {
                    const blob = await res.blob();
                    document.getElementById('q-loading-box').style.display = 'none';
                    document.getElementById('q-final-view-img').src = URL.createObjectURL(blob);


                    // Size recomendation desativado. DOM info removido da tela.


                    document.querySelector('.q-card-ia').classList.add('is-result');
                    document.getElementById('q-step-result').style.display = 'flex';


                } else if (res.status === 401 || res.status === 403) {
                    document.getElementById('q-loading-box').style.display = 'none';
                    document.getElementById('q-step-upload').style.display = 'block';
                    alert("App desativado nesta loja");
                } else { throw new Error(); }
            } catch (e) {
                document.getElementById('q-loading-box').style.display = 'none';
                document.getElementById('q-step-upload').style.display = 'block';
                alert('Ocorreu um erro ao processar sua imagem (ou chave/servidor indisponíveis). Tente novamente.');
            }
        };
    }

    // ─── EXECUTA APENAS EM PÁGINAS DE PRODUTO ────────────────────────────────────
    const isProductPage = window.location.pathname.includes('/produtos/') || window.location.pathname.includes('/produto/') || window.location.pathname.includes('/p/') || document.querySelector('meta[property="og:type"][content="product"]');

    if (isProductPage) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
        else init();
    }

})();
