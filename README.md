# 🧊 THREEJS-3D-MODEL-PERSONAJE

## 📌 Descripción

Este proyecto consiste en una aplicación web que permite visualizar un **modelo 3D animado** utilizando la librería Three.js.

El personaje fue obtenido desde Mixamo y se le integraron múltiples animaciones que pueden ser controladas mediante el teclado, permitiendo simular acciones tipo videojuego en tiempo real.

---

## 🎯 Objetivo

* Implementar un entorno de graficación 3D en la web
* Cargar modelos en formato FBX
* Integrar múltiples animaciones en un mismo personaje
* Controlar animaciones mediante el teclado
* Aplicar transiciones suaves entre movimientos

---

## 🛠️ Tecnologías utilizadas

* JavaScript (ES Modules)
* Three.js
* FBXLoader
* OrbitControls
* Stats.js

---

## 📁 Estructura del proyecto

```id="struct01"
/THREEJS-3D-MODEL-PERSONAJE
│
├── index.html
├── README.md
└── assets/
    ├── build/
    │   ├── three.core.js
    │   └── three.module.js
    ├── css/
    │   └── main.css
    ├── img/
    │   └── favicon.png
    ├── js/
    │   └── main.js
    ├── jsm/
    │   ├── controls/
    │   ├── curves/
    │   ├── libs/
    │   └── loaders/
    └── models/
        └── fbx/
            ├── character.fbx
            ├── Double Dagger Stab.fbx
            ├── Jump Attack.fbx
            ├── Walk Forward Arc Right.fbx
            ├── Zombie Biting.fbx
            └── Zombie Crawl.fbx
```

---

## 🎮 Controles

Las animaciones del personaje se controlan mediante el teclado:

| Tecla | Animación              |
| ----- | ---------------------- |
| 1     | Double Dagger Stab     |
| 2     | Jump Attack            |
| 3     | Walk Forward Arc Right |
| 4     | Zombie Biting          |
| 5     | Zombie Crawl           |

---

## ⚙️ Funcionamiento

1. Se carga un modelo 3D base (`character.fbx`)
2. Se inicializa un `AnimationMixer` para gestionar animaciones
3. Se cargan las animaciones de forma independiente
4. Se almacenan en una lista en JavaScript
5. Se activan mediante eventos de teclado
6. Se aplican transiciones suaves con `crossFadeTo()`

---

## 🔄 Transiciones de animación

El proyecto utiliza técnicas de interpolación para mejorar la experiencia visual:

* `crossFadeTo()` para transiciones suaves
* `LoopRepeat` para animaciones continuas (caminar)
* `LoopOnce` para acciones (ataques)
* `clampWhenFinished` para mantener la pose final

---

## ⚠️ Requisitos importantes

* Todas las animaciones deben pertenecer al mismo rig del personaje
* Las animaciones deben descargarse sin skin
* El modelo principal debe incluir skin
* Ejecutar el proyecto en un servidor local (ej. Live Server)

---

## 🚀 Ejecución del proyecto

1. Abrir el proyecto en Visual Studio Code
2. Instalar la extensión Live Server
3. Ejecutar el archivo `index.html`
4. Esperar a que cargue el modelo
5. Usar las teclas 1–5 para cambiar animaciones

---

## 💡 Posibles mejoras

* Movimiento del personaje con WASD
* Cámara en tercera persona
* Interfaz gráfica (botones)
* Integración de sonidos
* Sistema de estados (idle, run, attack)

---

## 👨‍💻 Autor

Ostria Martinez Michell 

---

## 📚 Conclusión

Este proyecto permite comprender los fundamentos de la graficación 3D en la web, el uso de modelos externos y la integración de múltiples animaciones en tiempo real, sentando bases para el desarrollo de aplicaciones interactivas o videojuegos.
