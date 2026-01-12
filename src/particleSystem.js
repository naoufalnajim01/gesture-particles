import * as THREE from 'three';

const FACE_VERTEX_COUNT = 468;
const HAND_VERTEX_COUNT = 21;
const MAX_HANDS = 2;
// Increase particle density for "UHD" look. Multiple particles per landmark.
const DENSITY_FACTOR = 4;
const TOTAL_FACE = FACE_VERTEX_COUNT * DENSITY_FACTOR;
const TOTAL_HANDS = HAND_VERTEX_COUNT * MAX_HANDS * DENSITY_FACTOR;
const TOTAL_PARTICLES = TOTAL_FACE + TOTAL_HANDS;

// Vertex Shader
const vertexShader = `
  uniform float time;
  attribute float size;
  attribute vec3 customColor;
  attribute vec3 offset; // Random offset for density
  varying vec3 vColor;

  // Simple noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
    // Permutations
    i = mod289(i);
    vec4 p = permute( permute( permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vColor = customColor;
    
    // Add noise to position for organic feel "drift"
    float noiseFreq = 0.5;
    float noiseAmp = 0.1; // Reduced drift for more "Solid/Real" look
    vec3 noiseDrift = vec3(
        snoise(position * noiseFreq + time * 0.5),
        snoise(position * noiseFreq + time * 0.5 + 100.0),
        snoise(position * noiseFreq + time * 0.5 + 200.0)
    ) * noiseAmp;

    // Apply strict positional offset (cloud effect)
    vec3 cloudOffset = offset * 0.15; // Small spread

    vec3 finalPos = position + noiseDrift + cloudOffset;

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = size * (300.0 / -mvPosition.z);
  }
`;

// Fragment Shader
const fragmentShader = `
  uniform sampler2D pointTexture;
  varying vec3 vColor;

  void main() {
    // Decreased light intensity by lowering alpha multiplier
    vec4 texColor = texture2D(pointTexture, gl_PointCoord);
    
    // Darker, less "blooming"
    gl_FragColor = vec4(vColor, 0.6) * texColor; 
    
    if (gl_FragColor.a < 0.05) discard;
  }
`;

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.geometry = new THREE.BufferGeometry();

        // Arrays
        this.positions = new Float32Array(TOTAL_PARTICLES * 3);
        this.targetPositions = new Float32Array(TOTAL_PARTICLES * 3);
        this.colors = new Float32Array(TOTAL_PARTICLES * 3);
        this.sizes = new Float32Array(TOTAL_PARTICLES);
        this.offsets = new Float32Array(TOTAL_PARTICLES * 3); // Static random offsets

        // Initialize arrays
        for (let i = 0; i < TOTAL_PARTICLES; i++) {
            this.positions[i * 3] = (Math.random() - 0.5) * 20;
            this.positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            this.positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

            this.targetPositions[i * 3] = 0;
            this.targetPositions[i * 3 + 1] = 0;
            this.targetPositions[i * 3 + 2] = 0;

            this.sizes[i] = 0;

            // Generate stable random offsets for "volume"
            // Gaussian-ish distribution preferred but linear is fine for small
            this.offsets[i * 3] = (Math.random() - 0.5);
            this.offsets[i * 3 + 1] = (Math.random() - 0.5);
            this.offsets[i * 3 + 2] = (Math.random() - 0.5);
        }

        // Add attributes
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('customColor', new THREE.BufferAttribute(this.colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
        this.geometry.setAttribute('offset', new THREE.BufferAttribute(this.offsets, 3));

        // Create texture
        const texture = this.createGlowTexture();

        // Shader Material
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                pointTexture: { value: texture }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true
        });

        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);
    }

    createGlowTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d');
        // Sharper gradient for "Solid" look
        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.3, 'rgba(255,255,255,0.4)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 32, 32);
        return new THREE.CanvasTexture(canvas);
    }

    mapToWorld(x, y, z) {
        const SCALE_X = 20;
        const SCALE_Y = 15;
        const wx = (x - 0.5) * SCALE_X;
        const wy = -(y - 0.5) * SCALE_Y;
        const wz = -z * 10;
        return { x: wx, y: wy, z: wz };
    }

    update(landmarks, time) {
        this.material.uniforms.time.value = time;
        const { face, hands } = landmarks;

        const posAttr = this.geometry.attributes.position;
        const sizeAttr = this.geometry.attributes.size;
        const colorAttr = this.geometry.attributes.customColor;

        // 1. FACE
        if (face) {
            for (let i = 0; i < FACE_VERTEX_COUNT; i++) {
                const pt = face[i];
                const world = this.mapToWorld(pt.x, pt.y, pt.z);

                // For each landmark, update its DENSITY_FACTOR clones
                for (let j = 0; j < DENSITY_FACTOR; j++) {
                    const idx = i * DENSITY_FACTOR + j;

                    this.targetPositions[idx * 3] = world.x;
                    this.targetPositions[idx * 3 + 1] = world.y;
                    this.targetPositions[idx * 3 + 2] = world.z;

                    // Color: More defined gradients. 
                    // Face: Skin-like warm tones but stylized.
                    // Y goes 0 (top) to 1 (bottom)
                    const t = pt.y;
                    // Top: Pinkish, Mid: Orange/Red, Bot: Deep Orange
                    colorAttr.setXYZ(idx, 1.0, 0.6 - t * 0.3, 0.2 + t * 0.1);

                    // Size: randomize slightly for variety
                    sizeAttr.setX(idx, 0.8 + Math.random() * 0.5);
                }
            }
        } else {
            for (let i = 0; i < TOTAL_FACE; i++) {
                sizeAttr.setX(i, 0.0);
            }
        }

        // 2. HANDS
        const FACE_PARTICLE_END = TOTAL_FACE;

        if (hands && hands.length > 0) {
            let pIndex = FACE_PARTICLE_END;
            for (let h = 0; h < MAX_HANDS; h++) {
                const hand = hands[h];
                if (hand) {
                    for (let i = 0; i < HAND_VERTEX_COUNT; i++) {
                        const pt = hand[i];
                        const world = this.mapToWorld(pt.x, pt.y, pt.z);

                        for (let j = 0; j < DENSITY_FACTOR; j++) {
                            const idx = pIndex + (i * DENSITY_FACTOR + j);

                            this.targetPositions[idx * 3] = world.x;
                            this.targetPositions[idx * 3 + 1] = world.y;
                            this.targetPositions[idx * 3 + 2] = world.z;

                            // Color: Cool gradients
                            colorAttr.setXYZ(idx, 0.0, 0.8, 1.0 - pt.y * 0.5);
                            sizeAttr.setX(idx, 1.0 + Math.random());
                        }
                    }
                } else {
                    const HAND_CHUNK_SIZE = HAND_VERTEX_COUNT * DENSITY_FACTOR;
                    for (let i = 0; i < HAND_CHUNK_SIZE; i++) {
                        sizeAttr.setX(pIndex + i, 0.0);
                    }
                }
                pIndex += HAND_VERTEX_COUNT * DENSITY_FACTOR;
            }
        } else {
            for (let i = FACE_PARTICLE_END; i < TOTAL_PARTICLES; i++) {
                sizeAttr.setX(i, 0.0);
            }
        }

        // LERP POSITIONS
        const LERP_FACTOR = 0.3; // Tighter tracking for "Realism"
        for (let i = 0; i < TOTAL_PARTICLES; i++) {
            const px = this.positions[i * 3];
            const py = this.positions[i * 3 + 1];
            const pz = this.positions[i * 3 + 2];

            const tx = this.targetPositions[i * 3];
            const ty = this.targetPositions[i * 3 + 1];
            const tz = this.targetPositions[i * 3 + 2];

            if (this.sizes[i] > 0 || sizeAttr.getX(i) > 0) {
                this.positions[i * 3] += (tx - px) * LERP_FACTOR;
                this.positions[i * 3 + 1] += (ty - py) * LERP_FACTOR;
                this.positions[i * 3 + 2] += (tz - pz) * LERP_FACTOR;
            }
        }

        posAttr.needsUpdate = true;
        colorAttr.needsUpdate = true;
        sizeAttr.needsUpdate = true;
    }
}
