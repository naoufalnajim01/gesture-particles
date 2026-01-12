# Gesture Particles

![Demo](demo.png)

> **[English Version](#english-version)** | **[Version Française](#version-française)**

---

## Version Française

Une visualisation 3D en temps réel qui reconstruit votre visage et vos mains à l'aide de milliers de particules lumineuses. Construit avec Three.js et MediaPipe pour le suivi par webcam basé sur la vision par ordinateur.

**Créé par Naoufal NAJIM**

### ✨ Fonctionnalités

- **Suivi du Visage en Temps Réel** : 468 points de repère faciaux suivis avec haute précision
- **Suivi des Mains** : Support de deux mains avec 21 points de repère par main
- **Rendu de Particules UHD** : Multiplicateur de densité 4x pour des nuages de particules ultra-haute définition
- **Mouvement Organique** : Bruit et dérive basés sur des shaders pour un mouvement réaliste des particules
- **Dégradés de Couleurs** : 
  - Visage : Dégradés chauds (Rose → Rouge → Orange)
  - Mains : Dégradés froids (Cyan → Bleu → Vert)
- **Interpolation Fluide** : Interpolation linéaire (LERP) pour un suivi sans saccades
- **Performance Optimisée** : Système de particules GPU efficace utilisant `THREE.Points`

### 🎨 Style Visuel

- **Arrière-plan** : Vide noir pur
- **Particules** : Petits points lumineux avec mélange additif
- **Effets** : Dérive subtile pour une sensation organique et vivante
- **Éclairage** : Intensité réduite pour un rendu réaliste sans effet de bloom excessif

### 🚀 Installation

#### Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Accès à la webcam

#### Configuration

```bash
# Cloner le dépôt
git clone https://github.com/naoufalnajim01/gesture-particles.git
cd gesture-particles

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Compiler pour la production
npm run build
```

### 🛠️ Stack Technique

- **Three.js** : Rendu 3D et système de particules
- **MediaPipe** : Suivi du visage et des mains
- **Vite** : Outil de build et serveur de développement
- **Shaders WebGL** : Shaders vertex/fragment personnalisés pour les effets de particules

### 📋 Structure du Projet

```
gesture-particles/
├── src/
│   ├── main.js              # Point d'entrée et boucle d'animation
│   ├── vision.js            # Gestionnaire de suivi MediaPipe
│   ├── particleSystem.js    # Système de particules Three.js avec shaders
│   └── style.css            # Styles globaux
├── index.html               # Point d'entrée HTML
├── demo.png                 # Capture d'écran de démonstration
└── package.json             # Dépendances
```

### 🎯 Comment ça Marche

1. **Capture Webcam** : MediaPipe traite les images vidéo pour détecter les points de repère du visage et des mains
2. **Mappage des Coordonnées** : Les coordonnées 2D normalisées (0-1) sont mappées dans l'espace 3D
3. **Distribution des Particules** : Chaque point de repère génère plusieurs particules (facteur de densité : 4x)
4. **Suivi Fluide** : L'interpolation LERP lisse le mouvement des particules
5. **Effets Shader** : Les shaders GPU ajoutent du bruit, de la luminosité et des dégradés de couleurs
6. **Rendu en Temps Réel** : Boucle de rendu à 60 FPS mettant à jour les positions des particules

### 🤖 Prompt Gemini 3

Ce projet a été créé en utilisant le prompt avancé suivant avec **Google Gemini 3** :

```json
Amega Yao {
  "project_name": "Gesture Particles",
  "role": "Expert Creative Coder / Three.js Developer",
  "prompt": {
    "context": "We are building a real-time 3D particle visualization driven by webcam computer vision data. You have access to `faceLandmarks` and `handLandmarks` provided by a Mediapipe tracker.",
    "goal": "Create a 'Particle Mirror' effect where the user's face and hands are reconstructed using a cloud of glowing 3D particles.",
    "technical_requirements": [
      "Use `THREE.Points` and `THREE.BufferGeometry` for high-performance rendering.",
      "Update particle positions every frame based on the incoming landmark data.",
      "Map the 2D normalized video coordinates (x, y) to 3D world space coordinates.",
      "Implement Linear Interpolation (Lerp) on the particle positions to smooth out jitter from the tracking data."
    ],
    "visual_style": {
      "background": "Black / Dark Void",
      "particles": "Small, glowing points with additive blending.",
      "color_palette": {
        "face": "Warm gradients (Pink, Red, Orange)",
        "hands": "Cool gradients (Cyan, Blue, Green)"
      },
      "effects": "Add a subtle noise or drift to the particles so they feel alive and organic, rather than static points."
    },
    "interaction": "The particles should follow the user's movements in real-time, functioning as a digital mirror."
  }
}
```

### 🎮 Utilisation

1. Ouvrir l'application dans un navigateur moderne
2. Autoriser l'accès à la webcam lorsque demandé
3. Positionner votre visage et vos mains devant la caméra
4. Regarder les particules reconstruire vos mouvements en temps réel !

### 📝 Licence

Licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails

### 👤 Auteur

**Naoufal NAJIM**

- GitHub: [@naoufalnajim01](https://github.com/naoufalnajim01)
- LinkedIn: [Naoufal Najim](https://www.linkedin.com/in/naoufalnajim01/)
- Email: naoufal.najim19@gmail.com

### 🙏 Remerciements

- Communauté Three.js
- Équipe MediaPipe chez Google
- Gemini 3 AI pour l'assistance à la génération de code

---

**Note** : Ce projet nécessite l'accès à la webcam et fonctionne mieux dans des environnements bien éclairés avec une visibilité claire du visage et des mains.

---

## English Version

A real-time 3D particle mirror visualization that reconstructs your face and hands using thousands of glowing particles. Built with Three.js and MediaPipe for webcam-based computer vision tracking.

**Created by Naoufal NAJIM**

### ✨ Features

- **Real-time Face Tracking**: 468 facial landmarks tracked at high precision
- **Hand Tracking**: Dual hand support with 21 landmarks per hand
- **UHD Particle Rendering**: 4x density multiplier for ultra-high-definition particle clouds
- **Organic Motion**: Shader-based noise and drift for lifelike particle movement
- **Color Gradients**: 
  - Face: Warm gradients (Pink → Red → Orange)
  - Hands: Cool gradients (Cyan → Blue → Green)
- **Smooth Interpolation**: Linear interpolation (LERP) for jitter-free tracking
- **Optimized Performance**: Efficient GPU-based particle system using `THREE.Points`

### 🎨 Visual Style

- **Background**: Pure black void
- **Particles**: Small, glowing points with additive blending
- **Effects**: Subtle noise drift for organic, alive feeling
- **Lighting**: Reduced intensity for realistic, non-blooming appearance

### 🚀 Installation

#### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Webcam access

#### Setup

```bash
# Clone the repository
git clone https://github.com/naoufalnajim01/gesture-particles.git
cd gesture-particles

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### 🛠️ Technical Stack

- **Three.js**: 3D rendering and particle system
- **MediaPipe**: Face Mesh and Hands tracking
- **Vite**: Build tool and dev server
- **WebGL Shaders**: Custom vertex/fragment shaders for particle effects

### 📋 Project Structure

```
gesture-particles/
├── src/
│   ├── main.js              # Entry point and animation loop
│   ├── vision.js            # MediaPipe tracking manager
│   ├── particleSystem.js    # Three.js particle system with shaders
│   └── style.css            # Global styles
├── index.html               # HTML entry
├── demo.png                 # Demo screenshot
└── package.json             # Dependencies
```

### 🎯 How It Works

1. **Webcam Capture**: MediaPipe processes video frames to detect face and hand landmarks
2. **Coordinate Mapping**: 2D normalized coordinates (0-1) are mapped to 3D world space
3. **Particle Distribution**: Each landmark spawns multiple particles (density factor: 4x)
4. **Smooth Tracking**: LERP interpolation smooths particle movement
5. **Shader Effects**: GPU shaders add noise, glow, and color gradients
6. **Real-time Rendering**: 60 FPS rendering loop updates particle positions

### 🤖 Gemini 3 Prompt

This project was created using the following advanced prompt with **Google Gemini 3**:

```json
Amega Yao {
  "project_name": "Gesture Particles",
  "role": "Expert Creative Coder / Three.js Developer",
  "prompt": {
    "context": "We are building a real-time 3D particle visualization driven by webcam computer vision data. You have access to `faceLandmarks` and `handLandmarks` provided by a Mediapipe tracker.",
    "goal": "Create a 'Particle Mirror' effect where the user's face and hands are reconstructed using a cloud of glowing 3D particles.",
    "technical_requirements": [
      "Use `THREE.Points` and `THREE.BufferGeometry` for high-performance rendering.",
      "Update particle positions every frame based on the incoming landmark data.",
      "Map the 2D normalized video coordinates (x, y) to 3D world space coordinates.",
      "Implement Linear Interpolation (Lerp) on the particle positions to smooth out jitter from the tracking data."
    ],
    "visual_style": {
      "background": "Black / Dark Void",
      "particles": "Small, glowing points with additive blending.",
      "color_palette": {
        "face": "Warm gradients (Pink, Red, Orange)",
        "hands": "Cool gradients (Cyan, Blue, Green)"
      },
      "effects": "Add a subtle noise or drift to the particles so they feel alive and organic, rather than static points."
    },
    "interaction": "The particles should follow the user's movements in real-time, functioning as a digital mirror."
  }
}
```

### 🎮 Usage

1. Open the application in a modern browser
2. Allow webcam access when prompted
3. Position your face and hands in front of the camera
4. Watch as particles reconstruct your movements in real-time!

### 📝 License

MIT License - see [LICENSE](LICENSE) file for details

### 👤 Author

**Naoufal NAJIM**

- GitHub: [@naoufalnajim01](https://github.com/naoufalnajim01)
- LinkedIn: [Naoufal Najim](https://www.linkedin.com/in/naoufalnajim01/)
- Email: naoufal.najim19@gmail.com

### 🙏 Acknowledgments

- Three.js community
- MediaPipe team at Google
- Gemini 3 AI for code generation assistance

---

**Note**: This project requires webcam access and works best in well-lit environments with clear visibility of face and hands.
