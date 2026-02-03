/**
 * Blueforge AI - Three.js 3D Data Flow Visualization
 * Creates an immersive 3D scene showing data flowing from sources through a historian to analytics
 */

class BlueforgeScene {
    constructor() {
        this.container = document.getElementById('hero-canvas');
        if (!this.container) return;
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.nodes = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.clock = new THREE.Clock();
        
        this.init();
        this.createNodes();
        this.createParticles();
        this.createConnections();
        this.addLights();
        this.animate();
        this.addEventListeners();
    }
    
    init() {
        // Scene
        this.scene = new THREE.Scene();
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 30;
        this.camera.position.y = 0;
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
    }
    
    createNodes() {
        const nodeData = [
            // Source nodes (top)
            { pos: [-12, 10, 0], label: 'SENSORS', color: 0x3e92cc, size: 1.2 },
            { pos: [0, 12, 2], label: 'PLCs', color: 0x5ba8d9, size: 1.2 },
            { pos: [12, 10, 0], label: 'SCADA', color: 0x3e92cc, size: 1.2 },
            
            // Central historian (center)
            { pos: [0, 0, 5], label: 'HISTORIAN', color: 0x1e4d8c, size: 2.5, glow: true },
            
            // Output nodes (bottom)
            { pos: [-12, -10, 0], label: 'AI/ML', color: 0x28a745, size: 1.5 },
            { pos: [0, -12, 2], label: 'DASHBOARD', color: 0x5ba8d9, size: 1.5 },
            { pos: [12, -10, 0], label: 'REPORTS', color: 0x3e92cc, size: 1.5 },
        ];
        
        nodeData.forEach((data, i) => {
            const node = this.createNode(data);
            this.nodes.push({ mesh: node, data: data, originalY: data.pos[1] });
            this.scene.add(node);
        });
    }
    
    createNode(data) {
        const group = new THREE.Group();
        
        // Main sphere
        const geometry = new THREE.IcosahedronGeometry(data.size, 1);
        const material = new THREE.MeshPhongMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.9,
            flatShading: true,
        });
        const sphere = new THREE.Mesh(geometry, material);
        group.add(sphere);
        
        // Wireframe overlay
        const wireGeo = new THREE.IcosahedronGeometry(data.size * 1.1, 1);
        const wireMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.3,
        });
        const wireframe = new THREE.Mesh(wireGeo, wireMat);
        group.add(wireframe);
        
        // Glow effect for historian
        if (data.glow) {
            const glowGeo = new THREE.IcosahedronGeometry(data.size * 1.5, 1);
            const glowMat = new THREE.MeshBasicMaterial({
                color: data.color,
                transparent: true,
                opacity: 0.15,
            });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            group.add(glow);
        }
        
        // Outer ring
        const ringGeo = new THREE.RingGeometry(data.size * 1.3, data.size * 1.5, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
        
        group.position.set(...data.pos);
        return group;
    }
    
    createParticles() {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const color1 = new THREE.Color(0x3e92cc);
        const color2 = new THREE.Color(0x5ba8d9);
        
        for (let i = 0; i < particleCount; i++) {
            // Random positions in a cylinder around the scene
            const angle = Math.random() * Math.PI * 2;
            const radius = 5 + Math.random() * 20;
            
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 2] = Math.sin(angle) * radius * 0.3;
            
            // Color blend
            const mixRatio = Math.random();
            const mixedColor = color1.clone().lerp(color2, mixRatio);
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
            
            sizes[i] = Math.random() * 0.5 + 0.2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
        });
        
        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
    }
    
    createConnections() {
        // Create flowing line connections between nodes
        const connections = [
            // Sources to historian
            { from: 0, to: 3 },
            { from: 1, to: 3 },
            { from: 2, to: 3 },
            // Historian to outputs
            { from: 3, to: 4 },
            { from: 3, to: 5 },
            { from: 3, to: 6 },
        ];
        
        connections.forEach(conn => {
            const fromNode = this.nodes[conn.from].data;
            const toNode = this.nodes[conn.to].data;
            
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(...fromNode.pos),
                new THREE.Vector3(
                    (fromNode.pos[0] + toNode.pos[0]) / 2,
                    (fromNode.pos[1] + toNode.pos[1]) / 2,
                    (fromNode.pos[2] + toNode.pos[2]) / 2 + 3
                ),
                new THREE.Vector3(...toNode.pos),
            ]);
            
            const points = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            
            const material = new THREE.LineBasicMaterial({
                color: 0x3e92cc,
                transparent: true,
                opacity: 0.3,
            });
            
            const line = new THREE.Line(geometry, material);
            this.scene.add(line);
        });
    }
    
    addLights() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambient);
        
        // Point lights
        const light1 = new THREE.PointLight(0x3e92cc, 1, 50);
        light1.position.set(10, 10, 10);
        this.scene.add(light1);
        
        const light2 = new THREE.PointLight(0x1e4d8c, 0.8, 50);
        light2.position.set(-10, -10, 10);
        this.scene.add(light2);
        
        const light3 = new THREE.PointLight(0x5ba8d9, 0.6, 50);
        light3.position.set(0, 0, 20);
        this.scene.add(light3);
    }
    
    addEventListeners() {
        window.addEventListener('resize', () => this.onResize());
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('scroll', () => this.onScroll());
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onMouseMove(e) {
        this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }
    
    onScroll() {
        const scrollY = window.scrollY;
        const heroHeight = window.innerHeight;
        const progress = Math.min(scrollY / heroHeight, 1);
        
        // Fade out as user scrolls
        if (this.container) {
            this.container.style.opacity = 1 - progress;
        }
        
        // Move camera back as scrolling
        this.camera.position.z = 30 + progress * 20;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = this.clock.getElapsedTime();
        
        // Rotate nodes gently
        this.nodes.forEach((node, i) => {
            node.mesh.rotation.y = time * 0.3 + i;
            node.mesh.rotation.z = Math.sin(time * 0.5 + i) * 0.1;
            
            // Floating animation
            node.mesh.position.y = node.originalY + Math.sin(time * 0.8 + i) * 0.5;
        });
        
        // Rotate particle system
        if (this.particleSystem) {
            this.particleSystem.rotation.y = time * 0.05;
            
            // Animate particles moving down (data flow)
            const positions = this.particleSystem.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] -= 0.05;
                if (positions[i + 1] < -15) {
                    positions[i + 1] = 15;
                }
            }
            this.particleSystem.geometry.attributes.position.needsUpdate = true;
        }
        
        // Camera parallax on mouse
        this.camera.position.x += (this.mouseX * 3 - this.camera.position.x) * 0.02;
        this.camera.position.y += (-this.mouseY * 2 - this.camera.position.y) * 0.02;
        this.camera.lookAt(0, 0, 0);
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on desktop (performance)
    if (window.innerWidth > 1024) {
        // Wait for Three.js to load
        if (typeof THREE !== 'undefined') {
            new BlueforgeScene();
        }
    }
});
