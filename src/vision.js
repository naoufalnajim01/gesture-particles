import { FaceMesh } from '@mediapipe/face_mesh';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export class VisionManager {
    constructor(videoElement) {
        this.videoElement = videoElement;
        
        // Data storage
        this.faceLandmarks = null;
        this.handLandmarks = []; // Array of hand arrays
        
        this.isLoaded = false;
    }
    
    async init() {
        // Initialize FaceMesh
        this.faceMesh = new FaceMesh({locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }});
        this.faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        this.faceMesh.onResults((results) => {
             if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                 this.faceLandmarks = results.multiFaceLandmarks[0];
             } else {
                 this.faceLandmarks = null;
             }
        });

        // Initialize Hands
        this.hands = new Hands({locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }});
        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        this.hands.onResults((results) => {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                this.handLandmarks = results.multiHandLandmarks;
            } else {
                this.handLandmarks = [];
            }
        });

        // Initialize Camera
        // We use a lower resolution for tracking to keep it fast, 
        // but high enough for good movement correlation.
        this.camera = new Camera(this.videoElement, {
            onFrame: async () => {
                // Send frame to both trackers
                // We run them in parallel for better performance if possible, 
                // though JS is single threaded, the internal wasm might handle it? 
                // Actually await allows the event loop to breathe.
                
                // Prioritize hands or face? 
                // Let's do face then hands.
                await this.faceMesh.send({image: this.videoElement});
                await this.hands.send({image: this.videoElement});
            },
            width: 1280,
            height: 720
        });
        
        await this.camera.start();
        this.isLoaded = true;
        console.log("Vision Manager Initialized");
    }

    getLandmarks() {
        return {
            face: this.faceLandmarks,
            hands: this.handLandmarks
        };
    }
}
