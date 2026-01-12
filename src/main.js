import * as THREE from 'three';
import { VisionManager } from './vision.js';
import { ParticleSystem } from './particleSystem.js';

// Setup basic Three.js scene
const app = document.querySelector('#app');
const videoElement = document.querySelector('#input-video');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// Move camera back to see the "mirror"
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
app.appendChild(renderer.domElement);

// Initialize Components
const particleSystem = new ParticleSystem(scene);
const visionManager = new VisionManager(videoElement);

async function init() {
  try {
    console.log("Initializing Vision...");
    await visionManager.init();
    console.log("Vision Initialized.");
    animate();
  } catch (e) {
    console.error("Failed to init vision:", e);
    alert("Camera access failed or tracking error. Check console.");
  }
}

// Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
const clock = new THREE.Clock(); // Start clock

function animate() {
  requestAnimationFrame(animate);

  const time = clock.getElapsedTime();
  const landmarks = visionManager.getLandmarks();

  // Update particles
  particleSystem.update(landmarks, time);

  // Subtle automatic camera movement or "drift" to feel alive? 
  // The prompt says "effects: Add a subtle noise or drift to the particles".
  // We did this in the shader and update loop.

  renderer.render(scene, camera);
}

// Start
init();
