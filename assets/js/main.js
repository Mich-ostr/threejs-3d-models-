import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

// Variables Globales
let scene, camera, renderer, controls, mixer, character, currentAction;
const actions = {};
const clock = new THREE.Clock();
const container = document.getElementById('canvas-container');

// Configuración de Animaciones
const animConfig = [
    { key: '1', id: 'stab', file: 'Double Dagger Stab.fbx', label: 'STAB_ATTACK', loop: false },
    { key: '2', id: 'jump', file: 'Jump Attack.fbx', label: 'LEAP_JUMP', loop: false },
    { key: '3', id: 'walk', file: 'Walk Forward Arc Right.fbx', label: 'WALK_FORWARD', loop: true },
    { key: '4', id: 'bite', file: 'Zombie Biting.fbx', label: 'INFECT_BITE', loop: false },
    { key: '5', id: 'crawl', file: 'Zombie Crawl.fbx', label: 'CRAWL_DRAG', loop: true }
];

// Inicialización
async function init() {
    // 1. ESCENA Y NIEBLA (Profundidad)
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07080a);
    scene.fog = new THREE.Fog(0x07080a, 400, 1200);

    // 2. CÁMARA
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 2000);
    camera.position.set(200, 250, 500);

    // 3. RENDERER (Configuración Pro)
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        powerPreference: "high-performance",
        alpha: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimización de rendimiento
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 4. LUCES (Dramatismo Cian/Neon)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Luz principal (Blanca)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(100, 400, 100);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Luz de Acento (Cian - Coincide con UI)
    const blueLight = new THREE.PointLight(0x00f2ff, 15, 600);
    blueLight.position.set(-150, 200, 50);
    scene.add(blueLight);

    // 5. SUELO (Grid Tecnológico)
    const grid = new THREE.GridHelper(2000, 60, 0x00f2ff, 0x1a1a1f);
    grid.material.opacity = 0.15;
    grid.material.transparent = true;
    scene.add(grid);

    // 6. CONTROLES (Suavizados)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 800;
    controls.minDistance = 150;
    controls.target.set(0, 100, 0);

    // 7. EVENTOS
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', (e) => handleSwitch(e.key));
    
    document.querySelectorAll('.action-card').forEach(btn => {
        btn.onclick = () => handleSwitch(btn.getAttribute('data-key'));
    });

    // Iniciar carga de Assets
    loadEngine();
    animate();
}

// Carga de Archivos
async function loadEngine() {
    const loader = new FBXLoader();
    const overlay = document.getElementById('loading-overlay');

    try {
        // Carga del Personaje Base
        const fbx = await loader.loadAsync('./assets/models/fbx/character.fbx');
        character = fbx;
        character.scale.setScalar(0.7); 
        
        character.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                // Ajuste de materiales para que reaccionen mejor a la luz
                if(child.material) {
                    child.material.shininess = 10;
                }
            }
        });
        scene.add(character);
        
        mixer = new THREE.AnimationMixer(character);

        // Carga Secuencial de Animaciones
        for (const config of animConfig) {
            const animFbx = await loader.loadAsync(`./assets/models/fbx/${config.file}`);
            const action = mixer.clipAction(animFbx.animations[0]);
            
            if (!config.loop) {
                action.loop = THREE.LoopOnce;
                action.clampWhenFinished = true;
            }
            
            actions[config.id] = action;
        }

        // Finalizar Carga
        setTimeout(() => {
            overlay.classList.add('fade-out');
            handleSwitch('3'); // Comenzar con Caminar
        }, 500);

    } catch (err) {
        console.error("CRITICAL_ENGINE_ERROR:", err);
        const text = document.querySelector('.loading-text');
        if(text) text.innerText = "ERROR: ASSETS NOT FOUND";
    }
}

// Lógica de Cambio de Animación
function handleSwitch(key) {
    const config = animConfig.find(a => a.key === key);
    if (!config || !actions[config.id]) return;

    // Actualizar Interfaz (Clase Active)
    document.querySelectorAll('.action-card').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-key="${key}"]`);
    if(activeBtn) activeBtn.classList.add('active');
    
    // Actualizar Etiqueta HUD
    const label = document.getElementById('current-label');
    if(label) label.innerText = config.label;

    // Transición de Animación (Crossfade)
    const nextAction = actions[config.id];
    if (nextAction === currentAction) return;
    
    if (currentAction) {
        currentAction.fadeOut(0.3);
    }

    nextAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(0.3)
        .play();

    currentAction = nextAction;
}

// Redimensionamiento
function onResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
}

// Bucle de Renderizado
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    if (mixer) mixer.update(delta);
    
    if (controls) controls.update();
    
    renderer.render(scene, camera);
}

// Arrancar App
init();