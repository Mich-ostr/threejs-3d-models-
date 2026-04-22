import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

// --- VARIABLES GLOBALES ---
let scene, camera, renderer, controls, mixer, character, currentAction;
const actions = {};
const clock = new THREE.Clock();
const container = document.getElementById('canvas-container');

// --- CONFIGURACIÓN DE ANIMACIONES ---
const animConfig = [
    { key: '1', id: 'stab', file: 'Double Dagger Stab.fbx', label: 'STAB_ATTACK', loop: false },
    { key: '2', id: 'jump', file: 'Jump Attack.fbx', label: 'LEAP_JUMP', loop: false },
    { key: '3', id: 'walk', file: 'Walk Forward Arc Right.fbx', label: 'WALK_FORWARD', loop: true },
    { key: '4', id: 'bite', file: 'Zombie Biting.fbx', label: 'INFECT_BITE', loop: false },
    { key: '5', id: 'crawl', file: 'Zombie Crawl.fbx', label: 'CRAWL_DRAG', loop: true }
];

async function init() {
    // 1. ESCENA Y NIEBLA
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07080a);
    scene.fog = new THREE.Fog(0x07080a, 400, 1200);

    // 2. CÁMARA (Near ajustado a 0.1 para permitir zoom extremo sin recortes)
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 2000);
    
    // POSICIÓN INICIAL: Más cerca del personaje (Z: 250 en lugar de 500)
    camera.position.set(100, 180, 250); 

    // 3. RENDERER
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        powerPreference: "high-performance",
        alpha: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 4. LUCES DRAMÁTICAS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(100, 400, 100);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    scene.add(sunLight);

    const blueLight = new THREE.PointLight(0x00f2ff, 15, 600);
    blueLight.position.set(-150, 200, 50);
    scene.add(blueLight);

    // 5. GRID TECNOLÓGICO
    const grid = new THREE.GridHelper(2000, 60, 0x00f2ff, 0x1a1a1f);
    grid.material.opacity = 0.1;
    grid.material.transparent = true;
    scene.add(grid);

    // 6. CONTROLES DE CÁMARA (CONFIGURACIÓN DE ZOOM CERCANO)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // LIMITES DE ZOOM: 
    controls.minDistance = 40;  // Permite acercarse muchísimo al personaje
    controls.maxDistance = 600; // Evita que el usuario se pierda en el vacío
    
    // PUNTO DE ENFOQUE: Centrado en el torso/pecho del modelo (Y: 120)
    controls.target.set(0, 120, 0); 

    // 7. EVENTOS
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', (e) => handleSwitch(e.key));
    
    document.querySelectorAll('.action-card').forEach(btn => {
        btn.onclick = () => handleSwitch(btn.getAttribute('data-key'));
    });

    loadEngine();
    animate();
}

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
            }
        });
        scene.add(character);
        
        mixer = new THREE.AnimationMixer(character);

        // Carga Secuencial de Animaciones
        for (const config of animConfig) {
            // Nota: Verifica que la ruta no tenga la barra invertida en el nombre de la carpeta
            const animFbx = await loader.loadAsync(`./assets/models/fbx/${config.file}`);
            const action = mixer.clipAction(animFbx.animations[0]);
            
            if (!config.loop) {
                action.loop = THREE.LoopOnce;
                action.clampWhenFinished = true;
            }
            actions[config.id] = action;
        }

        setTimeout(() => {
            overlay.classList.add('fade-out');
            handleSwitch('3'); 
        }, 500);

    } catch (err) {
        console.error("CRITICAL_ENGINE_ERROR:", err);
    }
}

function handleSwitch(key) {
    const config = animConfig.find(a => a.key === key);
    if (!config || !actions[config.id]) return;

    document.querySelectorAll('.action-card').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-key="${key}"]`);
    if(activeBtn) activeBtn.classList.add('active');
    
    const label = document.getElementById('current-label');
    if(label) label.innerText = config.label;

    const nextAction = actions[config.id];
    if (nextAction === currentAction) return;
    
    if (currentAction) currentAction.fadeOut(0.3);

    nextAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(0.3)
        .play();

    currentAction = nextAction;
}

function onResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    if (controls) controls.update();
    renderer.render(scene, camera);
}

init();