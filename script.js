/* === MYLOVE - Script Principal Refactorizado === */
/* === Estado centralizado para evitar bugs de ejecución múltiple === */

const AppState = {
    // Control de flujo principal
    giftOpened: false,           // Evita múltiples aperturas del regalo
    experienciaIniciada: false,  // Evita iniciar la experiencia múltiples veces
    typewriterRunning: false,    // Evita múltiples efectos de escritura
    arbolAnimating: false,       // Evita múltiples animaciones del árbol

    // Control de clicks
    giftClickCount: 0,

    // Audio
    audioUnlocked: false,
    currentAudio: null,

    // Intervalos para limpieza
    decoracionInterval: null
};

/* === UTILIDADES ASYNC === */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Reproducción segura de audio (no rompe si el navegador bloquea)
async function safePlayAudio(audioElement) {
    if (!audioElement) return false;
    try {
        await audioElement.play();
        AppState.audioUnlocked = true;
        return true;
    } catch (e) {
        console.warn('Audio bloqueado por el navegador:', e.message);
        return false;
    }
}

// Fade out de elemento con Promise
function fadeOutElement(element, duration = 1000) {
    return new Promise(resolve => {
        if (!element) {
            resolve();
            return;
        }
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';
        setTimeout(resolve, duration);
    });
}

/* === CAJA DE REGALO - EXPERIENCIA BRIDGERTON === */
// Variables legacy para compatibilidad
let giftClickCount = 0; // Mantener por compatibilidad, pero usar AppState
let decoracionInterval = null;
// Ocultar decoraciones al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    // Ocultar esquinas decorativas
    const corners = document.getElementById('corners');
    if (corners) corners.style.display = 'none';

    // Limpiar fondo dinámico
    const bg = document.getElementById('dynamic-bg');
    if (bg) bg.innerHTML = '';

    // Detener cualquier intervalo de decoraciones
    if (decoracionInterval) {
        clearInterval(decoracionInterval);
        decoracionInterval = null;
    }

    // Generar flores orgánicas con exclusión del camino nupcial
    generateOrganicFlowers();

    // Iniciar lluvia de hojas
    createFallingLeaves();
});

/* === GENERADOR DE FLORES ORGÁNICAS CON PROFUNDIDAD Y PASTO === */
function generateOrganicFlowers() {
    const container = document.getElementById('flowers-container');
    if (!container) return;

    // Limpiar flores existentes
    container.innerHTML = '';

    // Paleta de colores pasteles románticos
    const COLORS = {
        white: ['#fff8f5', '#fff0eb', '#ffe8e0'],
        pink: ['#f5c0c0', '#e8a0a8', '#d88898'],
        peach: ['#f5d0c0', '#e8b8a0', '#d8a088'],
        yellow: ['#fff8d0', '#f5e8a8', '#e8d888'],
        lavender: ['#d8c8e8', '#c8b8d8', '#b8a0c8']
    };

    // Templates SVG de flores orgánicas
    const flowerTemplates = {
        // Margarita con 8 pétalos
        daisy: (size, petalColor, centerColor) => `
            <svg width="${size}" height="${size * 1.4}" viewBox="0 0 24 34" class="organic-flower flower-daisy">
                <g transform="translate(12, 28)">
                    <!-- Tallo -->
                    <path d="M0,0 Q-1,-8 0,-16 Q1,-24 0,-28" stroke="#5a8048" stroke-width="1.5" fill="none"/>
                    <!-- Pétalos -->
                    <g transform="translate(0, -28)">
                        ${[0, 45, 90, 135, 180, 225, 270, 315].map(angle =>
            `<ellipse cx="0" cy="-5" rx="2.5" ry="6" fill="${petalColor}" transform="rotate(${angle})"/>`
        ).join('')}
                        <!-- Centro -->
                        <circle cx="0" cy="0" r="3" fill="${centerColor}"/>
                    </g>
                </g>
            </svg>`,

        // Tulipán elegante
        tulip: (size, color1, color2) => `
            <svg width="${size * 0.8}" height="${size * 1.5}" viewBox="0 0 20 36" class="organic-flower flower-tulip">
                <g transform="translate(10, 32)">
                    <!-- Tallo -->
                    <path d="M0,0 Q1,-10 0,-20" stroke="#4a7038" stroke-width="2" fill="none"/>
                    <!-- Hoja -->
                    <path d="M0,-8 Q8,-12 4,-18 Q0,-14 0,-8" fill="#5a8048"/>
                    <!-- Pétalos del tulipán -->
                    <g transform="translate(0, -28)">
                        <ellipse cx="-3" cy="2" rx="5" ry="10" fill="${color1}"/>
                        <ellipse cx="3" cy="2" rx="5" ry="10" fill="${color1}"/>
                        <ellipse cx="0" cy="0" rx="4" ry="8" fill="${color2}"/>
                    </g>
                </g>
            </svg>`,

        // Rosa con pétalos en espiral
        rose: (size, color1, color2, color3) => `
            <svg width="${size}" height="${size * 1.3}" viewBox="0 0 26 34" class="organic-flower flower-rose">
                <g transform="translate(13, 30)">
                    <!-- Tallo -->
                    <path d="M0,0 Q2,-8 0,-18" stroke="#4a6838" stroke-width="1.8" fill="none"/>
                    <!-- Rosa -->
                    <g transform="translate(0, -24)">
                        <circle cx="0" cy="0" r="8" fill="${color1}"/>
                        <circle cx="0" cy="0" r="5.5" fill="${color2}"/>
                        <circle cx="0" cy="0" r="3" fill="${color3}"/>
                        <circle cx="0" cy="0" r="1.5" fill="${color1}"/>
                    </g>
                </g>
            </svg>`,

        // Lavanda (múltiples florecitas)
        lavender: (size, color) => `
            <svg width="${size * 0.5}" height="${size * 1.8}" viewBox="0 0 12 44" class="organic-flower flower-lavender">
                <g transform="translate(6, 40)">
                    <!-- Tallo -->
                    <path d="M0,0 Q0,-15 0,-35" stroke="#5a7848" stroke-width="1.2" fill="none"/>
                    <!-- Florecitas -->
                    ${[-28, -25, -22, -19, -16, -13].map((y, i) =>
            `<ellipse cx="${i % 2 === 0 ? -1.5 : 1.5}" cy="${y}" rx="2" ry="2.5" fill="${color}" opacity="${0.7 + i * 0.05}"/>`
        ).join('')}
                </g>
            </svg>`,

        // Flor silvestre simple
        wildflower: (size, color, centerColor) => `
            <svg width="${size}" height="${size * 1.2}" viewBox="0 0 18 22" class="organic-flower flower-wild">
                <g transform="translate(9, 20)">
                    <!-- Tallo -->
                    <path d="M0,0 Q-0.5,-6 0,-14" stroke="#6a8858" stroke-width="1" fill="none"/>
                    <!-- Pétalos simples (5) -->
                    <g transform="translate(0, -17)">
                        ${[0, 72, 144, 216, 288].map(angle =>
            `<ellipse cx="0" cy="-3" rx="2" ry="4" fill="${color}" transform="rotate(${angle})"/>`
        ).join('')}
                        <circle cx="0" cy="0" r="2" fill="${centerColor}"/>
                    </g>
                </g>
            </svg>`
    };

    // Función para obtener color aleatorio de paleta
    const randomColor = (palette) => palette[Math.floor(Math.random() * palette.length)];

    // Función para verificar si posición X está en el camino nupcial (EXCLUSIÓN ESTRICTA)
    const isInBridalPath = (xPercent) => xPercent > 35 && xPercent < 65;

    // Seleccionar tipo de flor aleatoriamente y crear su SVG
    function createFlowerSVG(size) {
        const flowerTypes = ['daisy', 'tulip', 'rose', 'lavender', 'wildflower'];
        const type = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];

        switch (type) {
            case 'daisy':
                return flowerTemplates.daisy(size, randomColor(COLORS.white), randomColor(COLORS.yellow));
            case 'tulip':
                const tulipPalette = Math.random() < 0.5 ? COLORS.pink : COLORS.peach;
                return flowerTemplates.tulip(size, randomColor(tulipPalette), randomColor(COLORS.white));
            case 'rose':
                return flowerTemplates.rose(size, randomColor(COLORS.pink), randomColor(COLORS.peach), randomColor(COLORS.white));
            case 'lavender':
                return flowerTemplates.lavender(size, randomColor(COLORS.lavender));
            case 'wildflower':
                const wildPalette = [COLORS.white, COLORS.pink, COLORS.yellow][Math.floor(Math.random() * 3)];
                return flowerTemplates.wildflower(size, randomColor(wildPalette), randomColor(COLORS.yellow));
        }
    }

    // Crear brizna de pasto SVG
    function createGrassSVG(size) {
        const grassColors = ['#4a7838', '#5a8848', '#4a8040', '#3a6830', '#5a9050'];
        const color = grassColors[Math.floor(Math.random() * grassColors.length)];
        const lean = -4 + Math.random() * 8; // inclinación aleatoria
        return `<svg width="${size * 0.3}" height="${size}" viewBox="0 0 8 24" class="organic-flower grass-blade">
            <path d="M4,24 Q${4 + lean},-2 ${4 + lean * 0.5},0" stroke="${color}" stroke-width="${1 + Math.random()}" fill="none" stroke-linecap="round"/>
        </svg>`;
    }

    // === CONFIGURACIÓN DE 3 BANDAS DE PROFUNDIDAD (con solapamiento del 5%) ===
    const depthBands = [
        { name: 'back', flowers: 55, grass: 40, yMin: 38, yMax: 58, sizeMin: 6, sizeMax: 10, opacity: 0.5, blur: 0.5, zBase: 1, cssClass: 'flower-distant' },
        { name: 'mid', flowers: 90, grass: 50, yMin: 52, yMax: 78, sizeMin: 14, sizeMax: 22, opacity: 0.8, blur: 0, zBase: 4, cssClass: '' },
        { name: 'front', flowers: 70, grass: 35, yMin: 73, yMax: 100, sizeMin: 28, sizeMax: 42, opacity: 1.0, blur: 1, zBase: 7, cssClass: 'flower-close' }
    ];

    depthBands.forEach(band => {
        // --- Generar FLORES para esta banda ---
        for (let i = 0; i < band.flowers; i++) {
            let xPercent = Math.random() * 100;

            // Camino nupcial exclusion
            if (isInBridalPath(xPercent)) {
                xPercent = Math.random() < 0.5
                    ? Math.random() * 35
                    : 65 + Math.random() * 35;
            }

            const yPercent = band.yMin + Math.random() * (band.yMax - band.yMin);
            const size = band.sizeMin + Math.random() * (band.sizeMax - band.sizeMin);
            const swayDuration = 3 + Math.random() * 3; // 3s - 6s aleatorio
            const swayDelay = Math.random() * 4;
            const depthInBand = (yPercent - band.yMin) / (band.yMax - band.yMin);

            const flowerSVG = createFlowerSVG(size);
            const flowerEl = document.createElement('div');
            flowerEl.innerHTML = flowerSVG;

            const bottomPercent = (yPercent - 38) * 1.6; // Mapear a posición en campo
            const filterStr = band.blur > 0 ? `filter: blur(${band.blur}px);` : '';

            flowerEl.style.cssText = `
                position: absolute;
                left: ${xPercent}%;
                bottom: ${Math.max(0, Math.min(90, bottomPercent))}%;
                transform: translateX(-50%);
                --sway-duration: ${swayDuration}s;
                --sway-delay: ${swayDelay}s;
                opacity: ${band.opacity - 0.1 + depthInBand * 0.2};
                z-index: ${band.zBase + Math.floor(depthInBand * 3)};
                ${filterStr}
                animation: flowerSway ${swayDuration}s ease-in-out ${swayDelay}s infinite;
            `;

            if (band.cssClass && flowerEl.firstElementChild) {
                flowerEl.firstElementChild.classList.add(band.cssClass);
            }

            container.appendChild(flowerEl);
        }

        // --- Generar BRIZNAS DE PASTO para esta banda ---
        for (let i = 0; i < band.grass; i++) {
            let xPercent = Math.random() * 100;
            const yPercent = band.yMin + Math.random() * (band.yMax - band.yMin);
            const grassSize = band.sizeMin * 0.8 + Math.random() * (band.sizeMax - band.sizeMin) * 0.5;
            const swayDuration = 2.5 + Math.random() * 3;
            const swayDelay = Math.random() * 3;
            const bottomPercent = (yPercent - 38) * 1.6;
            const depthInBand = (yPercent - band.yMin) / (band.yMax - band.yMin);

            const grassSVG = createGrassSVG(grassSize);
            const grassEl = document.createElement('div');
            grassEl.innerHTML = grassSVG;

            const filterStr = band.blur > 0 ? `filter: blur(${band.blur * 0.5}px);` : '';

            grassEl.style.cssText = `
                position: absolute;
                left: ${xPercent}%;
                bottom: ${Math.max(0, Math.min(90, bottomPercent))}%;
                transform: translateX(-50%);
                opacity: ${band.opacity * 0.7};
                z-index: ${band.zBase + Math.floor(depthInBand * 3)};
                ${filterStr}
                animation: grassSway ${swayDuration}s ease-in-out ${swayDelay}s infinite;
            `;

            container.appendChild(grassEl);
        }
    });

    console.log('Flores orgánicas con profundidad generadas: 215 flores + 125 briznas de pasto');
}


/* === SISTEMA DE LLUVIA DE HOJAS (Partículas Infinitas con requestAnimationFrame) === */
function createFallingLeaves() {
    const container = document.getElementById('falling-leaves-container');
    if (!container) return;

    const LEAF_COLORS = ['#D95204', '#FF9F1C', '#C75B12', '#E87C3F', '#B8450A', '#FFB347'];
    const MAX_LEAVES = 30;    // Máximo en pantalla (rendimiento)
    const SPAWN_INTERVAL = 800; // ms entre cada hoja nueva
    let activeLeaves = [];
    let lastSpawnTime = 0;
    let animationId;

    // SVG de hoja orgánica
    function createLeafSVG(color) {
        const size = 10 + Math.random() * 14; // 10-24px
        return {
            size,
            html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
                <path d="M12,2 Q18,6 20,12 Q18,18 12,22 Q6,18 4,12 Q6,6 12,2 Z" fill="${color}" opacity="0.85"/>
                <path d="M12,4 Q12,12 12,20" stroke="${color}" stroke-width="0.8" opacity="0.5" stroke-dasharray="2 1"/>
            </svg>`
        };
    }

    // Crear nueva partícula de hoja
    function spawnLeaf() {
        if (activeLeaves.length >= MAX_LEAVES) return;

        const color = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];
        const { size, html } = createLeafSVG(color);

        const leafEl = document.createElement('div');
        leafEl.className = 'falling-leaf';
        leafEl.innerHTML = html;
        leafEl.style.width = size + 'px';
        leafEl.style.height = size + 'px';

        const leaf = {
            el: leafEl,
            x: Math.random() * window.innerWidth,
            y: -size - 20,
            speedY: 0.5 + Math.random() * 1.5,   // Velocidad vertical
            amplitude: 30 + Math.random() * 60,    // Amplitud sinusoidal horizontal
            frequency: 0.008 + Math.random() * 0.015, // Frecuencia de oscilación
            rotateSpeed: (Math.random() - 0.5) * 3, // Velocidad de rotación
            rotation: Math.random() * 360,
            phase: Math.random() * Math.PI * 2,      // Fase inicial
            opacity: 0.6 + Math.random() * 0.4,
            size
        };

        container.appendChild(leafEl);
        activeLeaves.push(leaf);
    }

    // Loop de animación con requestAnimationFrame
    function animate(timestamp) {
        // Spawn periódico
        if (timestamp - lastSpawnTime > SPAWN_INTERVAL) {
            spawnLeaf();
            lastSpawnTime = timestamp;
        }

        // Actualizar cada hoja
        for (let i = activeLeaves.length - 1; i >= 0; i--) {
            const leaf = activeLeaves[i];

            // Movimiento sinusoidal horizontal
            leaf.y += leaf.speedY;
            const sinOffset = Math.sin(leaf.y * leaf.frequency + leaf.phase) * leaf.amplitude;
            const currentX = leaf.x + sinOffset;
            leaf.rotation += leaf.rotateSpeed;

            // Aplicar transformación
            leaf.el.style.transform = `translate(${currentX}px, ${leaf.y}px) rotate(${leaf.rotation}deg)`;
            leaf.el.style.opacity = leaf.opacity;

            // Limpiar hojas que salen de pantalla
            if (leaf.y > window.innerHeight + leaf.size + 20) {
                leaf.el.remove();
                activeLeaves.splice(i, 1);
            }
        }

        animationId = requestAnimationFrame(animate);
    }

    // Iniciar
    animationId = requestAnimationFrame(animate);

    // Limpiar al cerrar
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationId);
    });

    console.log('Sistema de lluvia de hojas iniciado');
}


const giftMessages = [
    "Haz click para que crezca...",
    "¡Sigue así! Algo especial está por revelarse...",
    "¡Algo se mueve adentro!",
    "¡Ya casi se abre!",
    "¡SORPRESA!"
];

function clickGiftBox() {
    // GUARD: Evitar múltiples ejecuciones después de abrir el regalo
    if (AppState.giftOpened) return;

    const giftBox = document.getElementById('gift-box');
    const message = document.getElementById('gift-message');

    AppState.giftClickCount++;
    giftClickCount = AppState.giftClickCount; // Sincronizar variable legacy

    // Remover clases anteriores
    giftBox.classList.remove('shake-1', 'shake-2', 'shake-3', 'grow-1', 'grow-2', 'grow-3', 'opening');

    if (AppState.giftClickCount === 1) {
        // Primer click: crece un poco, moño se afloja, temblor suave
        giftBox.classList.add('grow-1', 'shake-1');
        if (message) message.textContent = giftMessages[1];

        // Pequeño confeti dorado elegante
        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: 25,
                spread: 40,
                origin: { y: 0.6 },
                colors: ['#d4af37', '#f5e6d3', '#8b4513']
            });
        }

    } else if (AppState.giftClickCount === 2) {
        // Segundo click: crece más, moño 66% desatado, temblor medio
        giftBox.classList.add('grow-2', 'shake-2');
        if (message) message.textContent = giftMessages[2];

        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.6 },
                colors: ['#d4af37', '#f5e6d3', '#8b4513', '#c9a959']
            });
        }

    } else if (AppState.giftClickCount >= 3) {
        // MARCAR COMO ABIERTO para evitar más clicks
        AppState.giftOpened = true;

        // Tercer click: EXPLOSIÓN DRAMÁTICA
        giftBox.classList.add('grow-3', 'shake-3');
        if (message) message.textContent = giftMessages[3];

        // Animación de apertura dramática después del temblor
        setTimeout(() => {
            giftBox.classList.add('opening');
        }, 1200);


        // Explosión masiva de confeti estilo celebración elegante
        setTimeout(() => {
            if (typeof confetti !== 'undefined') {
                // Explosión central
                confetti({
                    particleCount: 250,
                    spread: 140,
                    origin: { y: 0.5, x: 0.5 },
                    colors: ['#d4af37', '#f5e6d3', '#8b4513', '#c9a959', '#fff5e6', '#e8c547']
                });

                // Ráfagas laterales
                confetti({
                    particleCount: 120,
                    angle: 60,
                    spread: 100,
                    origin: { x: 0 },
                    colors: ['#d4af37', '#c9a959', '#fff5e6']
                });
                confetti({
                    particleCount: 120,
                    angle: 120,
                    spread: 100,
                    origin: { x: 1 },
                    colors: ['#d4af37', '#c9a959', '#fff5e6']
                });

                // Lluvia de confeti continua
                setTimeout(() => {
                    confetti({
                        particleCount: 80,
                        spread: 160,
                        origin: { y: 0 },
                        colors: ['#d4af37', '#f5e6d3', '#fff5e6']
                    });
                }, 300);
            }
        }, 800);

        // Transición a escena final
        setTimeout(() => {
            iniciarExperienciaBridgerton();
        }, 3000);
    }
}

/* === EFECTO MÁQUINA DE ESCRIBIR BRIDGERTON === */
function typewriterEffect(element, text, speed = 50, callback) {
    element.textContent = '';
    element.style.visibility = 'visible';
    element.style.opacity = '1';
    let i = 0;

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }
    type();
}

async function iniciarExperienciaBridgerton() {
    // GUARD: Evitar múltiples ejecuciones
    if (AppState.experienciaIniciada) return;
    AppState.experienciaIniciada = true;

    const intro = document.getElementById("pantalla-intro");
    const giftContainer = document.querySelector('.gift-intro-container');

    // Paso 1: Fade out de la pantalla de regalo
    await fadeOutElement(giftContainer, 1500);

    // Paso 2: Ocultar completamente el intro
    if (giftContainer) {
        giftContainer.style.display = 'none';
    }
    intro.classList.remove("activa");
    intro.classList.add("hidden");

    // Paso 3: Mostrar pantalla final
    const pantallaFinal = document.getElementById("pantalla-final");
    pantallaFinal.classList.remove("hidden");
    pantallaFinal.classList.add("activa");

    // Limpiar decoraciones
    const bg = document.getElementById('dynamic-bg');
    if (bg) bg.innerHTML = "";
    const corners = document.getElementById('corners');
    if (corners) corners.style.display = 'none';

    // 🎵 PAPER RINGS — suena SOLO cuando se ve el paisaje (NO en intro)
    const musicaFondo = document.getElementById('musica-fondo');
    if (musicaFondo) {
        musicaFondo.src = './assets/audio/paper_rings.mp3';
        musicaFondo.volume = 0.5;
        musicaFondo.loop = true;
        safePlayAudio(musicaFondo);
    }

    // Iniciar gaviotas ahora (no antes, ya que eran invisibles en intro)
    generarGaviotasIrregulares();

    // Paso 4: Ocultar la carta inicialmente
    const mensajeAmor = document.querySelector('.mensaje-amor');
    if (mensajeAmor) {
        mensajeAmor.style.opacity = '0';
        mensajeAmor.style.visibility = 'hidden';
    }

    // Paso 5: Esperar un poco antes de iniciar el árbol
    await delay(800);

    // Paso 6: Iniciar animación del árbol
    if (typeof iniciarAnimacionArbol === 'function') {
        iniciarAnimacionArbol();
    }

    // Paso 7: Esperar 8 segundos para que el árbol crezca
    await delay(8000);

    // Paso 8: Mostrar la carta con fade in
    if (mensajeAmor) {
        mensajeAmor.style.visibility = 'visible';
        mensajeAmor.style.transition = 'opacity 1s ease';
        mensajeAmor.style.opacity = '1';

        // Paso 9: Esperar que la carta aparezca completamente
        await delay(500);

        // Paso 10: Iniciar efecto de escritura
        iniciarEscrituraFantasma();

        // Paso 11: Avión escribiendo "TE AMO" en el cielo (3s después)
        setTimeout(() => {
            if (typeof startSkywriting === 'function') startSkywriting();
        }, 3000);
    }
}


// Textos predefinidos para evitar problemas de parsing del DOM
const cartaTextos = [
    "Me gustaría mucho saber cantar para poder cantarte con todo mi corazón y decirte lo que siento con una linda canción. Pero, aunque no sé cantar, lo que sí sé es hablar. Y, pues, te voy a abrir mi corazón para que escuches todo mi amor, el cual nació aquel día que te conocí. Y de saber que viviría todo esto, volvería a hacer absolutamente todo otra vez para volver a sentir todo lo que hemos vivido.",
    "Me volviste un adicto a ti, un preso de tu querer y la compañía que siempre deseo tener. Aunque aún nos falta vivir mucho tiempo, espero que siempre estés a mi lado y hacer que mi soledad conozca a tu soledad, y siempre estar acompañado. Porque siempre seremos tú y yo, yo y tú, hasta el fin del amanecer. Te amo, mi osita."
];
const firmaTexto = "Con el más profundo afecto y devoción eterna, Vuestro fiel enamorado que en cada suspiro pronuncia vuestro nombre";

// Efecto de escritura fantasma - texto aparece caracter por caracter
function iniciarEscrituraFantasma() {
    // GUARD: Evitar múltiples ejecuciones del typewriter (FIX CRÍTICO)
    if (AppState.typewriterRunning) {
        console.warn('Typewriter ya está ejecutándose, ignorando llamada duplicada');
        return;
    }
    AppState.typewriterRunning = true;

    const mensajeAmor = document.querySelector('.mensaje-amor');
    if (!mensajeAmor) return;


    const parrafos = mensajeAmor.querySelectorAll('p:not(.firma-amor)');
    const firma = mensajeAmor.querySelector('.firma-amor');

    const textoParrafo1 = "Me gustaría mucho saber cantar para poder cantarte con todo mi corazón y decirte lo que siento con una linda canción. Pero, aunque no sé cantar, lo que sí sé es hablar. Y, pues, te voy a abrir mi corazón para que escuches todo mi amor, el cual nació aquel día que te conocí. Y de saber que viviría todo esto, volvería a hacer absolutamente todo otra vez para volver a sentir todo lo que hemos vivido.";

    const textoParrafo2 = "Me volviste un adicto a ti, un preso de tu querer y la compañía que siempre deseo tener. Aunque aún nos falta vivir mucho tiempo, espero que siempre estés a mi lado y hacer que mi soledad conozca a tu soledad, y siempre estar acompañado. Porque siempre seremos tú y yo, yo y tú, hasta el fin del amanecer. Te amo, mi osita.";

    const textoFirma = "Con el más profundo afecto y devoción eterna, Vuestro fiel enamorado";

    // Iniciar escritura fantasma secuencial
    escribirTextoFantasma(parrafos[0], textoParrafo1, 25, () => {
        escribirTextoFantasma(parrafos[1], textoParrafo2, 25, () => {
            escribirTextoFantasma(firma, textoFirma, 35);
        });
    });
}

// Función de efecto typewriter fantasma
function escribirTextoFantasma(elemento, texto, velocidad = 30, callback) {
    if (!elemento) {
        if (callback) callback();
        return;
    }

    elemento.textContent = '';
    elemento.style.visibility = 'visible';
    elemento.style.opacity = '1';

    let i = 0;

    function escribir() {
        if (i < texto.length) {
            elemento.textContent += texto.charAt(i);
            i++;
            setTimeout(escribir, velocidad);
        } else if (callback) {
            callback();
        }
    }
    escribir();
}

/* === CONFIGURACIÓN === */
const preguntas = [
    {
        pregunta: "¿Qué es lo que más me gusta de tu cara? 🙈❤️",
        imagen: "./assets/img/foto1.jpg",
        audio: "./assets/audio/nonsense.mp3",
        segundoInicio: 36, duracion: 18,
        opciones: ["Mis ojos ✨", "Mi sonrisa 😊", "Todo es perfecto 💫"],
        correcta: 2,
        tematica: ["❤️", "🌷", "✨", "🌸"],
        mensajeCorrecto: "¡Exacto! Todo tú me encanta ❤️"
    },
    {
        pregunta: "¿Dónde fue nuestra primera cita perfecta? 🍜",
        imagen: "./assets/img/foto2.jpg",
        audio: "./assets/audio/just_one_day.mp3",
        segundoInicio: 66, duracion: 12,
        opciones: ["En el cine 🎬", "En el parque 🌳", "Comiendo juntos 🍝"],
        correcta: 2,
        tematica: ["🍜", "❤️", "💑", "🌷"],
        mensajeCorrecto: "¡Los fideos siempre nos unen! 🍜"
    },
    {
        pregunta: "¿Qué planes tengo para nuestro futuro? 💍",
        imagen: "./assets/img/foto3.jpg",
        audio: "./assets/audio/paper_rings.mp3",
        segundoInicio: 36, duracion: 16,
        opciones: ["Viajar por el mundo ✈️", "Tener gatitos 🐱", "Casarnos algún día 💒"],
        correcta: 2,
        tematica: ["💍", "❤️", "🏠", "✨"],
        mensajeCorrecto: "Paper Rings 💍 - Taylor lo sabía"
    },
    {
        pregunta: "¿Qué siento cuando estoy contigo? 🌅",
        imagen: "./assets/img/foto4.jpg",
        audio: "./assets/audio/iris.mp3",
        segundoInicio: 61, duracion: 14,
        opciones: ["Paz infinita 🕊️", "Que el mundo desaparece 💫", "Mariposas 🦋"],
        correcta: 1,
        tematica: ["❤️", "✨", "🌙", "💫"],
        mensajeCorrecto: "Cuando estamos juntos, solo existimos tú y yo ❤️"
    },
    {
        pregunta: "¿Qué soy yo para ti? ❤️",
        imagen: "./assets/img/foto5.jpg",
        audio: "./assets/audio/magic_shop.mp3",
        segundoInicio: 65, duracion: 15,
        opciones: ["Tu mejor amigo 👫", "Tu Magic Shop 🔮", "Tu fan #1 de K-pop 🎤"],
        correcta: 1,
        tematica: ["🔮", "❤️", "🗝️", "✨"],
        mensajeCorrecto: "Siempre seré tu Magic Shop 🔮❤️"
    }
];

const fotosFinales = ["./assets/img/foto_final.png"];

let indiceActual = 0;
let audioPlayer = document.getElementById('musica-fondo') || new Audio();
let fadeInterval;

/* === INICIO === */
preguntas.forEach(p => {
    let a = new Audio();
    a.src = p.audio;
    a.preload = "auto";
});

// Generar estrellas aleatorias al cargar
generarEstrellasAleatorias();
// Las gaviotas se inician en iniciarExperienciaBridgerton() (NO aquí)

actualizarFondoDinamico(["❤️", "🌷", "✨", "💖"]);

/* === CORAZONCITOS BRILLANTES (reemplazo de estrellas) === */
function generarEstrellasAleatorias() {
    const container = document.getElementById('stars-container');
    if (!container) return;
    container.innerHTML = '';

    const numCorazones = 20 + Math.floor(Math.random() * 12); // 20-32 corazoncitos

    for (let i = 0; i < numCorazones; i++) {
        const size = 3 + Math.random() * 5; // 3-8px (mismo rango visual que las estrellas)
        const heart = document.createElement('div');
        heart.className = 'star heart-star';
        heart.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="white">
            <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
        </svg>`;
        heart.style.left = Math.random() * 100 + '%';
        heart.style.top = Math.random() * 40 + '%';
        heart.style.animationDelay = Math.random() * 4 + 's';
        heart.style.animationDuration = (2 + Math.random() * 3) + 's';
        container.appendChild(heart);
    }

    // Regenerar cada 40 segundos, SOLO si la pantalla final está activa
    setTimeout(() => {
        const finalActiva = document.querySelector('#pantalla-final.activa');
        if (finalActiva) generarEstrellasAleatorias();
    }, 40000);
}

/* === GAVIOTAS CON MOVIMIENTO IRREGULAR === */
function generarGaviotasIrregulares() {
    const container = document.getElementById('seagulls-container');
    if (!container) return;

    function crearGaviota() {
        const gaviota = document.createElement('span');
        gaviota.className = 'seagull';
        gaviota.textContent = '⌒'; // Forma de gaviota

        // Posición inicial aleatoria
        const startFromLeft = Math.random() > 0.5;
        gaviota.style.left = startFromLeft ? '-5%' : '105%';
        gaviota.style.top = (5 + Math.random() * 30) + '%';
        gaviota.style.fontSize = (0.8 + Math.random() * 0.8) + 'rem';
        gaviota.style.transform = startFromLeft ? 'scaleX(1)' : 'scaleX(-1)';

        container.appendChild(gaviota);

        // Animación manual con dirección variable
        const direccion = startFromLeft ? 1 : -1;
        const velocidad = 0.05 + Math.random() * 0.1;
        const amplitud = 10 + Math.random() * 20;
        let posX = startFromLeft ? -5 : 105;
        let tiempo = 0;

        function mover() {
            tiempo += 0.02;
            posX += velocidad * direccion;
            const posY = parseFloat(gaviota.style.top) + Math.sin(tiempo * 2) * 0.1;

            gaviota.style.left = posX + '%';
            gaviota.style.top = posY + '%';

            // Pequeño aleteo
            const aleteo = Math.sin(tiempo * 10) * 5;
            gaviota.style.transform = `scaleX(${direccion}) rotate(${aleteo}deg)`;

            if (posX > -10 && posX < 110) {
                requestAnimationFrame(mover);
            } else {
                gaviota.remove();
            }
        }

        mover();
    }

    // Crear gaviotas a intervalos irregulares
    function programarGaviota() {
        crearGaviota();
        const siguiente = 3000 + Math.random() * 5000; // 3-8 segundos
        setTimeout(programarGaviota, siguiente);
    }

    // Iniciar con algunas gaviotas
    programarGaviota();
    setTimeout(programarGaviota, 2000);
}

/* iniciarExperiencia() REMOVIDA — se usa iniciarExperienciaBridgerton() */

function cargarPregunta() {
    if (indiceActual >= preguntas.length) {
        mostrarFinal();
        return;
    }

    const data = preguntas[indiceActual];

    const preguntaTexto = document.getElementById("pregunta-texto");
    preguntaTexto.style.opacity = "0";
    preguntaTexto.style.transform = "translateY(-20px)";

    setTimeout(() => {
        preguntaTexto.innerText = data.pregunta;
        preguntaTexto.style.transition = "all 0.5s ease";
        preguntaTexto.style.opacity = "1";
        preguntaTexto.style.transform = "translateY(0)";
    }, 100);

    document.getElementById("pregunta-imagen").src = data.imagen;

    const contenedor = document.getElementById("opciones-container");
    contenedor.innerHTML = "";

    data.opciones.forEach((op, i) => {
        const btn = document.createElement("button");
        btn.classList.add("btn-opcion");
        btn.style.opacity = "0";
        btn.style.transform = "translateX(-30px)";
        btn.innerText = op;
        btn.onclick = () => verificarRespuesta(i, data.correcta, btn, data.mensajeCorrecto);
        contenedor.appendChild(btn);

        setTimeout(() => {
            btn.style.transition = "all 0.4s ease";
            btn.style.opacity = "1";
            btn.style.transform = "translateX(0)";
        }, 200 + (i * 150));
    });

    gestionarCambioDeAudio(data.audio, data.segundoInicio);
    iniciarBarraTiempo(data.duracion);
    actualizarFondoDinamico(data.tematica);
}

function verificarRespuesta(elegida, correcta, btn, mensajeCorrecto) {
    if (elegida === correcta) {
        btn.classList.add("correct");
        lanzarConfetiCelebracion();

        const toast = crearToastMensaje(mensajeCorrecto || "¡Correcto! ❤️");
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);

        setTimeout(() => {
            hacerFadeOut(() => {
                indiceActual++;
                cargarPregunta();
            });
        }, 1500);
    } else {
        btn.classList.add("wrong");
        const t = btn.innerText;
        btn.innerText = "¡Intenta otra vez! 🙈";

        if (navigator.vibrate) navigator.vibrate(100);

        setTimeout(() => {
            btn.classList.remove("wrong");
            btn.innerText = t;
        }, 1200);
    }
}

function crearToastMensaje(mensaje) {
    const toast = document.createElement("div");
    toast.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, rgba(220, 20, 60, 0.95), rgba(232, 125, 78, 0.9));
        color: white;
        padding: 20px 30px;
        border-radius: 30px;
        font-size: 1.2rem;
        font-weight: 600;
        z-index: 9999;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        animation: toastIn 0.5s ease forwards;
        border: 2px solid rgba(255,255,255,0.3);
    `;
    toast.innerText = mensaje;

    if (!document.getElementById('toast-keyframes')) {
        const style = document.createElement("style");
        style.id = 'toast-keyframes';
        style.textContent = `
            @keyframes toastIn {
                0% { opacity: 0; transform: translateX(-50%) translateY(-30px) scale(0.8); }
                100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    return toast;
}

function actualizarFondoDinamico(emojis) {
    const bg = document.getElementById('dynamic-bg');
    if (!bg) return;
    clearInterval(decoracionInterval);

    const tulipanes = ["🌷", "💐", "🌸", "🌺"];
    const corazones = ["❤️", "💖", "💕", "💗"];
    const estrellas = ["✨", "⭐", "💫", "🌟"];

    const crearElemento = () => {
        const div = document.createElement('div');
        div.classList.add('floating-item');

        const rand = Math.random();

        if (rand > 0.7) {
            div.innerText = tulipanes[Math.floor(Math.random() * tulipanes.length)];
            div.classList.add('anim-bouquet');
            div.style.fontSize = (2 + Math.random() * 1.5) + "rem";
        } else if (rand > 0.45) {
            div.innerText = corazones[Math.floor(Math.random() * corazones.length)];
            div.classList.add('anim-heart');
            div.style.fontSize = (1.8 + Math.random() * 1.2) + "rem";
        } else if (rand > 0.25) {
            const todosEmojis = [...emojis];
            div.innerText = todosEmojis[Math.floor(Math.random() * todosEmojis.length)];
            div.classList.add('anim-float');
        } else {
            div.innerText = estrellas[Math.floor(Math.random() * estrellas.length)];
            div.classList.add('anim-sparkle');
            div.style.fontSize = (1.5 + Math.random()) + "rem";
        }

        div.style.left = Math.random() * 100 + "vw";
        div.style.animationDuration = (10 + Math.random() * 8) + "s";
        bg.appendChild(div);
        setTimeout(() => div.remove(), 18000);
    };

    decoracionInterval = setInterval(crearElemento, 700);
    for (let i = 0; i < 10; i++) crearElemento();
}

/* === PANTALLA FINAL === */
function mostrarFinal() {
    const quiz = document.getElementById("pantalla-quiz");
    quiz.style.opacity = "0";

    setTimeout(() => {
        quiz.classList.remove("activa");
        quiz.classList.add("hidden");
        document.getElementById("pantalla-final").classList.remove("hidden");
        document.getElementById("pantalla-final").classList.add("activa");

        clearInterval(decoracionInterval);
        const bg = document.getElementById('dynamic-bg');
        if (bg) bg.innerHTML = "";
        const corners = document.getElementById('corners');
        if (corners) corners.style.display = 'none';

        setTimeout(() => {
            iniciarAnimacionArbol();
        }, 300);

        audioPlayer.src = "./assets/audio/love_story.mp3";
        audioPlayer.currentTime = 98;
        audioPlayer.volume = 0;

        let playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                hacerFadeInLento();
                setTimeout(revelarPropuesta, 10000);
            })
                .catch(e => {
                    console.log("Audio autoplay prevented");
                    setTimeout(revelarPropuesta, 5000);
                });
        } else {
            setTimeout(revelarPropuesta, 5000);
        }
    }, 500);
}

function revelarPropuesta() {
    const caja = document.getElementById("propuesta-container");
    if (caja) {
        lanzarConfetiCelebracion();
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 200]);
        }
    }
}

function aceptarPropuesta() {
    lanzarConfetiGigante();
    audioPlayer.volume = 1.0;

    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 400]);
    }

    setTimeout(() => {
        alert("¡TE AMO MUCHO! Gracias por decir que sí ❤️💍\n\nEres lo mejor que me ha pasado ✨");
    }, 1500);
}

/* === ÁRBOL - SOLO SACUDIR, NO CREAR NUEVOS ELEMENTOS === */
function iniciarAnimacionArbol() {
    var canvas = $('#canvas-tree');

    if (!canvas[0] || !canvas[0].getContext) {
        console.error("Canvas no encontrado");
        return;
    }

    var canvasWidth = canvas.width();
    var canvasHeight = canvas.height();

    canvas.attr("width", canvasWidth);
    canvas.attr("height", canvasHeight);

    // Escalar y CENTRAR el árbol correctamente
    var scaleX = canvasWidth / 1100;
    var scaleY = canvasHeight / 680;
    var scaleFactor = Math.min(scaleX, scaleY, 1);

    // Centro del canvas
    var centerX = canvasWidth / 2;

    var opts = {
        seed: { x: centerX, y: 50, color: "rgb(114, 47, 55)", scale: 2.5 },
        branch: [
            // Tronco principal - más grueso
            [centerX, canvasHeight - 10, centerX + 60 * scaleFactor, 300 * scaleY, centerX - 50 * scaleFactor, 240 * scaleY, 65 * scaleFactor, 130,
                [
                    // Rama izquierda inferior - curva irregular
                    [centerX - 20 * scaleFactor, 500 * scaleY, centerX - 120 * scaleFactor, 420 * scaleY, centerX - 190 * scaleFactor, 380 * scaleY, 18 * scaleFactor, 100,
                    [
                        [centerX - 150 * scaleFactor, 410 * scaleY, centerX - 180 * scaleFactor, 380 * scaleY, centerX - 210 * scaleFactor, 360 * scaleY, 7 * scaleFactor, 50],
                        [centerX - 170 * scaleFactor, 390 * scaleY, centerX - 220 * scaleFactor, 410 * scaleY, centerX - 250 * scaleFactor, 390 * scaleY, 5 * scaleFactor, 40]
                    ]
                    ],
                    // Rama derecha inferior - diferente ángulo
                    [centerX + 30 * scaleFactor, 490 * scaleY, centerX + 150 * scaleFactor, 430 * scaleY, centerX + 210 * scaleFactor, 400 * scaleY, 16 * scaleFactor, 90,
                    [[centerX + 180 * scaleFactor, 420 * scaleY, centerX + 230 * scaleFactor, 400 * scaleY, centerX + 260 * scaleFactor, 370 * scaleY, 6 * scaleFactor, 45]]
                    ],
                    // Rama lateral izquierda (ángulo bajo)
                    [centerX - 40 * scaleFactor, 420 * scaleY, centerX - 180 * scaleFactor, 350 * scaleY, centerX - 260 * scaleFactor, 320 * scaleY, 14 * scaleFactor, 80,
                    [[centerX - 200 * scaleFactor, 340 * scaleY, centerX - 250 * scaleFactor, 320 * scaleY, centerX - 280 * scaleFactor, 290 * scaleY, 5 * scaleFactor, 35]]
                    ],
                    // Rama lateral derecha - más curva
                    [centerX + 50 * scaleFactor, 400 * scaleY, centerX + 170 * scaleFactor, 320 * scaleY, centerX + 240 * scaleFactor, 290 * scaleY, 12 * scaleFactor, 75],
                    // Rama superior izquierda - larga e irregular
                    [centerX - 35 * scaleFactor, 350 * scaleY, centerX - 140 * scaleFactor, 260 * scaleY, centerX - 200 * scaleFactor, 210 * scaleY, 13 * scaleFactor, 90,
                    [
                        [centerX - 160 * scaleFactor, 250 * scaleY, centerX - 190 * scaleFactor, 210 * scaleY, centerX - 230 * scaleFactor, 180 * scaleY, 5 * scaleFactor, 40],
                        [centerX - 175 * scaleFactor, 230 * scaleY, centerX - 150 * scaleFactor, 180 * scaleY, centerX - 170 * scaleFactor, 150 * scaleY, 4 * scaleFactor, 30]
                    ]
                    ],
                    // Rama superior derecha - asimétrica
                    [centerX + 25 * scaleFactor, 360 * scaleY, centerX + 130 * scaleFactor, 270 * scaleY, centerX + 190 * scaleFactor, 220 * scaleY, 11 * scaleFactor, 85,
                    [[centerX + 155 * scaleFactor, 260 * scaleY, centerX + 200 * scaleFactor, 230 * scaleY, centerX + 220 * scaleFactor, 190 * scaleY, 4 * scaleFactor, 35]]
                    ],
                    // Rama vertical superior - ligeramente torcida
                    [centerX + 10 * scaleFactor, 300 * scaleY, centerX - 5 * scaleFactor, 220 * scaleY, centerX + 15 * scaleFactor, 160 * scaleY, 9 * scaleFactor, 55],
                    // Rama pequeña extra izquierda
                    [centerX - 60 * scaleFactor, 380 * scaleY, centerX - 100 * scaleFactor, 340 * scaleY, centerX - 130 * scaleFactor, 310 * scaleY, 6 * scaleFactor, 40],
                    // Rama pequeña extra derecha alta
                    [centerX + 80 * scaleFactor, 330 * scaleY, centerX + 120 * scaleFactor, 290 * scaleY, centerX + 150 * scaleFactor, 260 * scaleY, 5 * scaleFactor, 35]
                ]
            ]
        ],
        bloom: { num: 1000, width: canvasWidth, height: canvasHeight * 0.75 },
        footer: { width: canvasWidth * 0.7, height: 6, speed: 10 }
    };

    var tree = new Tree(canvas[0], canvasWidth, canvasHeight, opts);
    var seed = tree.seed;
    var foot = tree.footer;

    window.loveTree = tree;

    // === CLICK: SOLO SACUDIR, NO CREAR ELEMENTOS NUEVOS ===
    canvas.on('click touchstart', function (e) {
        e.preventDefault();

        // Solo efecto de sacudida visual
        canvas.addClass("shaking");
        setTimeout(function () { canvas.removeClass("shaking"); }, 500);

        // Pequeño confeti sin crear elementos en el canvas
        var offset = canvas.offset();
        var x = e.type === 'touchstart' && e.originalEvent.touches ?
            e.originalEvent.touches[0].pageX : e.pageX;
        var y = e.type === 'touchstart' && e.originalEvent.touches ?
            e.originalEvent.touches[0].pageY : e.pageY;

        confetti({
            particleCount: 8,
            spread: 40,
            origin: { x: x / window.innerWidth, y: y / window.innerHeight },
            colors: ['#e07a5f', '#c84c09', '#d4a845', '#722f37']
        });
    });

    // === ANIMACIÓN DEL ÁRBOL ===
    var runAsync = eval(Jscex.compile("async", function () {
        seed.drawHeart();
        $await(Jscex.Async.sleep(300));

        while (seed.canScale()) {
            seed.scale(0.95);
            $await(Jscex.Async.sleep(10));
        }

        while (seed.canMove()) {
            seed.move(0, 2);
            foot.draw();
            $await(Jscex.Async.sleep(10));
        }

        while (tree.canGrow()) {
            tree.grow();
            $await(Jscex.Async.sleep(10));
        }

        while (tree.bloomsCache.length > 0) {
            tree.flower(2);
            $await(Jscex.Async.sleep(10));
        }

        console.log("Árbol completado ❤️");
    }));

    runAsync().start();
}

/* === UTILIDADES === */
function iniciarBarraTiempo(s) {
    const b = document.getElementById("barra-progreso");
    if (b) {
        b.style.transition = "none";
        b.style.width = "100%";
        void b.offsetWidth;
        b.style.transition = `width ${s}s linear`;
        b.style.width = "0%";
    }
}

function gestionarCambioDeAudio(ruta, inicio) {
    audioPlayer.volume = 0;
    audioPlayer.src = ruta;
    audioPlayer.currentTime = inicio;
    audioPlayer.play().then(hacerFadeIn).catch(e => console.log("Audio blocked"));
}

function hacerFadeIn() {
    clearInterval(fadeInterval);
    let vol = 0;
    fadeInterval = setInterval(() => {
        if (vol < 0.8) { vol += 0.05; audioPlayer.volume = vol; }
        else clearInterval(fadeInterval);
    }, 100);
}

function hacerFadeInLento() {
    clearInterval(fadeInterval);
    let vol = 0;
    fadeInterval = setInterval(() => {
        if (vol < 0.95) { vol += 0.03; audioPlayer.volume = vol; }
        else { audioPlayer.volume = 1; clearInterval(fadeInterval); }
    }, 150);
}

function hacerFadeOut(cb) {
    clearInterval(fadeInterval);
    let vol = audioPlayer.volume;
    fadeInterval = setInterval(() => {
        if (vol > 0.05) { vol -= 0.05; audioPlayer.volume = vol; }
        else { clearInterval(fadeInterval); audioPlayer.pause(); if (cb) cb(); }
    }, 100);
}

/* === CONFETI === */
function lanzarConfetiCelebracion() {
    confetti({
        particleCount: 60, spread: 80, origin: { y: 0.65 },
        colors: ['#dc143c', '#c94c7e', '#f5b041', '#e87d4e', '#d4a845']
    });
}

function lanzarConfetiGigante() {
    var end = Date.now() + 6000;
    var colors = ['#dc143c', '#c94c7e', '#f5b041', '#e87d4e', '#d4a845'];

    (function frame() {
        confetti({
            particleCount: 8, angle: 60, spread: 65, origin: { x: 0 },
            shapes: ['heart', 'circle'], colors: colors, scalar: 2.5
        });
        confetti({
            particleCount: 8, angle: 120, spread: 65, origin: { x: 1 },
            shapes: ['heart', 'circle'], colors: colors, scalar: 2.5
        });
        if (Date.now() < end) requestAnimationFrame(frame);
    }());
}

/* ============================================================
   SKYWRITING — Avión escribe "TE AMO" con estela en el cielo
   ============================================================ */
function startSkywriting() {
    const fieldBg = document.querySelector('.field-background');
    if (!fieldBg || document.getElementById('skywriting-canvas')) return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    // --- Canvas para la estela ---
    const canvas = document.createElement('canvas');
    canvas.id = 'skywriting-canvas';
    canvas.width = W;
    canvas.height = H;
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:16;pointer-events:none;';
    fieldBg.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // --- Avión emoji ---
    const plane = document.createElement('div');
    plane.id = 'skywriting-plane';
    plane.textContent = '✈️';
    plane.style.cssText = 'position:absolute;z-index:17;font-size:1.3rem;pointer-events:none;will-change:transform;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));opacity:0;transition:opacity 0.5s;';
    fieldBg.appendChild(plane);
    setTimeout(() => { plane.style.opacity = '1'; }, 100);

    // --- Definición de letras como trazos ---
    function ellipse(n) {
        const pts = [];
        for (let i = 0; i <= n; i++) {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2;
            pts.push([0.5 + 0.48 * Math.cos(a), 0.5 + 0.48 * Math.sin(a)]);
        }
        return pts;
    }

    const L = {
        T: [[[0, 0], [1, 0]], [[0.5, 0], [0.5, 1]]],
        E: [[[0, 0], [0, 1]], [[0, 0], [0.9, 0]], [[0, 0.5], [0.75, 0.5]], [[0, 1], [0.9, 1]]],
        A: [[[0, 1], [0.5, 0]], [[0.5, 0], [1, 1]], [[0.2, 0.6], [0.8, 0.6]]],
        M: [[[0, 1], [0, 0]], [[0, 0], [0.5, 0.55]], [[0.5, 0.55], [1, 0]], [[1, 0], [1, 1]]],
        O: [ellipse(28)]
    };

    // --- Layout ---
    const lH = Math.min(H * 0.09, 85);
    const lW = lH * 0.65;
    const gap = lW * 0.4;
    const spGap = lW * 0.55;
    const chars = ['T', 'E', ' ', 'A', 'M', 'O'];

    let totalW = 0;
    for (const c of chars) totalW += c === ' ' ? spGap : lW + gap;
    totalW -= gap;

    let cx = (W - totalW) / 2;
    const cy = H * 0.12;

    // --- Construir ruta completa ---
    const raw = [];
    const midY = cy + lH / 2;

    // Entrada desde la izquierda
    raw.push({ x: -40, y: midY, p: false });
    raw.push({ x: cx - 70, y: midY, p: false });

    // Pirueta de entrada (loop circular)
    const lpX = cx - 35, lpY = midY - 35, lpR = 32;
    for (let i = 0; i <= 28; i++) {
        const a = -Math.PI / 2 + (i / 28) * Math.PI * 2;
        raw.push({ x: lpX + lpR * Math.cos(a), y: lpY + lpR * Math.sin(a), p: false });
    }

    // Trazar cada letra
    for (const c of chars) {
        if (c === ' ') { cx += spGap; continue; }
        const strokes = L[c];
        for (const stroke of strokes) {
            raw.push({ x: cx + stroke[0][0] * lW, y: cy + stroke[0][1] * lH, p: false });
            for (let i = 1; i < stroke.length; i++) {
                raw.push({ x: cx + stroke[i][0] * lW, y: cy + stroke[i][1] * lH, p: true });
            }
        }
        cx += lW + gap;
    }

    // Pirueta de salida + salir por la derecha
    const exX = cx + 25;
    raw.push({ x: exX, y: midY, p: false });
    for (let i = 0; i <= 24; i++) {
        const a = -Math.PI / 2 + (i / 24) * Math.PI * 2;
        raw.push({ x: exX + 28 * Math.cos(a), y: midY - 28 + 28 * Math.sin(a), p: false });
    }
    raw.push({ x: W + 100, y: midY - 40, p: false });

    // --- Interpolar para movimiento suave ---
    const smooth = [];
    for (let i = 0; i < raw.length - 1; i++) {
        const a = raw[i], b = raw[i + 1];
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        const steps = Math.max(1, Math.ceil(d / 2.5));
        for (let s = 0; s < steps; s++) {
            const t = s / steps;
            smooth.push({
                x: a.x + (b.x - a.x) * t,
                y: a.y + (b.y - a.y) * t,
                p: s === 0 ? false : b.p
            });
        }
    }
    smooth.push(raw[raw.length - 1]);

    // --- Animación ---
    let idx = 0;
    const SPD = 3;
    let prevX = smooth[0].x, prevY = smooth[0].y;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    function draw() {
        const end = Math.min(idx + SPD, smooth.length);
        for (let i = idx; i < end; i++) {
            const pt = smooth[i];
            if (pt.p && i > 0) {
                // Capa de resplandor dorado (distingue de nubes blancas)
                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(pt.x, pt.y);
                ctx.strokeStyle = 'rgba(255, 235, 200, 0.5)';
                ctx.lineWidth = 8;
                ctx.shadowColor = 'rgba(255, 200, 140, 0.7)';
                ctx.shadowBlur = 14;
                ctx.stroke();

                // Estela principal blanca brillante
                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(pt.x, pt.y);
                ctx.strokeStyle = 'rgba(255, 255, 250, 0.95)';
                ctx.lineWidth = 3.5;
                ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
                ctx.shadowBlur = 6;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // Mover avión
            const dx = pt.x - prevX, dy = pt.y - prevY;
            if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
                const ang = Math.atan2(dy, dx) * (180 / Math.PI);
                plane.style.left = pt.x + 'px';
                plane.style.top = pt.y + 'px';
                plane.style.transform = `translate(-50%,-50%) rotate(${ang}deg)`;
            }
            prevX = pt.x;
            prevY = pt.y;
        }

        idx = end;
        if (idx < smooth.length) {
            requestAnimationFrame(draw);
        } else {
            // Terminó: quitar avión, añadir movimiento sutil al texto
            plane.style.transition = 'opacity 1.5s ease';
            plane.style.opacity = '0';
            setTimeout(() => plane.remove(), 1800);
            canvas.classList.add('skywriting-done');
        }
    }

    requestAnimationFrame(draw);
    console.log('Skywriting iniciado: TE AMO');
}