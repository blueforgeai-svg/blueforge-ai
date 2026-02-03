/**
 * Blueforge AI - Enhanced Three.js 3D Data Flow Visualization
 * Premium immersive 3D scene with glowing nodes, flowing data streams, and dynamic effects
 */

class BlueforgeScene {
    constructor() {
        this.container = document.getElementById('hero-canvas');
        if (!this.container) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.nodes = [];
        this.dataStreams = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        this.clock = new THREE.Clock();

        this.init();
        this.createBackground();
        this.createNodes();
        this.createDataStreams();
        this.createAmbientParticles();
        this.addLights();
        this.animate();
        this.addEventListeners();
    }

    init() {
        // Scene with fog for depth
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a1628, 0.02);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 35);

        // Renderer with better quality
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
    }

    createBackground() {
        // Gradient sphere background
        const bgGeometry = new THREE.SphereGeometry(100, 32, 32);
        const bgMaterial = new THREE.ShaderMaterial({
            uniforms: {
                color1: { value: new THREE.Color(0x0a1628) },
                color2: { value: new THREE.Color(0x1e4d8c) }
            },
            vertexShader: `
                varying vec3 vPosition;
                void main() {
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color1;
                uniform vec3 color2;
                varying vec3 vPosition;
                void main() {
                    float mixRatio = (vPosition.y + 100.0) / 200.0;
                    gl_FragColor = vec4(mix(color1, color2, mixRatio), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
        this.scene.add(bgMesh);
    }

    createNodes() {
        const nodeData = [
            // Sources (top arc)
            { pos: [-15, 12, -5], label: 'SENSORS', color: 0x00d4ff, emissive: 0x003d4d, size: 1.8, type: 'source' },
            { pos: [0, 15, 0], label: 'PLCs', color: 0x00ff88, emissive: 0x004d29, size: 1.8, type: 'source' },
            { pos: [15, 12, -5], label: 'SCADA', color: 0x00d4ff, emissive: 0x003d4d, size: 1.8, type: 'source' },

            // Central historian (glowing core)
            { pos: [0, 0, 8], label: 'HISTORIAN', color: 0x4d9fff, emissive: 0x1a5599, size: 3.5, type: 'core', glow: true },

            // Outputs (bottom arc)
            { pos: [-15, -12, -5], label: 'AI/ML', color: 0xff6b6b, emissive: 0x4d2020, size: 2.0, type: 'output' },
            { pos: [0, -15, 0], label: 'DASHBOARD', color: 0xffd93d, emissive: 0x4d4012, size: 2.0, type: 'output' },
            { pos: [15, -12, -5], label: 'REPORTS', color: 0xff6b6b, emissive: 0x4d2020, size: 2.0, type: 'output' },
        ];

        nodeData.forEach((data, i) => {
            const node = this.createNode(data, i);
            this.nodes.push({ group: node, data: data, originalPos: [...data.pos], index: i });
            this.scene.add(node);
        });
    }

    createNode(data, index) {
        const group = new THREE.Group();

        // Core sphere with glow material
        const coreGeometry = new THREE.IcosahedronGeometry(data.size, 2);
        const coreMaterial = new THREE.MeshPhongMaterial({
            color: data.color,
            emissive: data.emissive,
            emissiveIntensity: 0.5,
            shininess: 100,
            transparent: true,
            opacity: 0.9,
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        group.add(core);

        // Inner glow sphere
        const glowInnerGeo = new THREE.IcosahedronGeometry(data.size * 0.7, 2);
        const glowInnerMat = new THREE.MeshBasicMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.6,
        });
        const glowInner = new THREE.Mesh(glowInnerGeo, glowInnerMat);
        group.add(glowInner);

        // Outer wireframe ring
        const ringGeo = new THREE.TorusGeometry(data.size * 1.5, 0.05, 16, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.4,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);

        // Second ring at different angle
        const ring2 = ring.clone();
        ring2.rotation.x = Math.PI / 3;
        ring2.rotation.y = Math.PI / 4;
        group.add(ring2);

        // Pulsing outer aura for core node
        if (data.glow) {
            const auraGeo = new THREE.SphereGeometry(data.size * 2, 32, 32);
            const auraMat = new THREE.MeshBasicMaterial({
                color: data.color,
                transparent: true,
                opacity: 0.1,
            });
            const aura = new THREE.Mesh(auraGeo, auraMat);
            aura.name = 'aura';
            group.add(aura);

            // Point light for glow effect
            const light = new THREE.PointLight(data.color, 2, 20);
            group.add(light);
        }

        // Orbiting particles
        const orbitGroup = new THREE.Group();
        orbitGroup.name = 'orbit';
        for (let i = 0; i < 5; i++) {
            const particleGeo = new THREE.SphereGeometry(0.1, 8, 8);
            const particleMat = new THREE.MeshBasicMaterial({
                color: data.color,
                transparent: true,
                opacity: 0.8,
            });
            const particle = new THREE.Mesh(particleGeo, particleMat);
            const angle = (i / 5) * Math.PI * 2;
            particle.position.set(
                Math.cos(angle) * data.size * 2,
                0,
                Math.sin(angle) * data.size * 2
            );
            orbitGroup.add(particle);
        }
        group.add(orbitGroup);

        group.position.set(...data.pos);
        return group;
    }

    createDataStreams() {
        // Create flowing data streams between nodes
        const connections = [
            { from: 0, to: 3, color: 0x00d4ff },
            { from: 1, to: 3, color: 0x00ff88 },
            { from: 2, to: 3, color: 0x00d4ff },
            { from: 3, to: 4, color: 0xff6b6b },
            { from: 3, to: 5, color: 0xffd93d },
            { from: 3, to: 6, color: 0xff6b6b },
        ];

        connections.forEach((conn, idx) => {
            const stream = this.createDataStream(
                this.nodes[conn.from].data.pos,
                this.nodes[conn.to].data.pos,
                conn.color,
                idx
            );
            this.dataStreams.push(stream);
            this.scene.add(stream.group);
        });
    }

    createDataStream(fromPos, toPos, color, index) {
        const group = new THREE.Group();

        // Create curved path
        const midPoint = [
            (fromPos[0] + toPos[0]) / 2,
            (fromPos[1] + toPos[1]) / 2,
            (fromPos[2] + toPos[2]) / 2 + 5
        ];

        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(...fromPos),
            new THREE.Vector3(...midPoint),
            new THREE.Vector3(...toPos)
        );

        // Tube geometry for the stream
        const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.08, 8, false);
        const tubeMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.2,
        });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        group.add(tube);

        // Flowing particles along the stream
        const particles = [];
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const particleGeo = new THREE.SphereGeometry(0.15, 8, 8);
            const particleMat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.9,
            });
            const particle = new THREE.Mesh(particleGeo, particleMat);
            particle.userData.offset = i / particleCount;
            particle.userData.speed = 0.3 + Math.random() * 0.2;
            particles.push(particle);
            group.add(particle);
        }

        return { group, curve, particles, color };
    }

    createAmbientParticles() {
        // Floating ambient particles in the background
        const particleCount = 300;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;

            const colorChoice = Math.random();
            if (colorChoice < 0.33) {
                colors[i * 3] = 0; colors[i * 3 + 1] = 0.83; colors[i * 3 + 2] = 1;
            } else if (colorChoice < 0.66) {
                colors[i * 3] = 0; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 0.53;
            } else {
                colors[i * 3] = 0.3; colors[i * 3 + 1] = 0.62; colors[i * 3 + 2] = 1;
            }

            sizes[i] = Math.random() * 0.5 + 0.1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        });

        this.ambientParticles = new THREE.Points(geometry, material);
        this.scene.add(this.ambientParticles);
    }

    addLights() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambient);

        // Main directional light
        const directional = new THREE.DirectionalLight(0xffffff, 0.5);
        directional.position.set(10, 20, 10);
        this.scene.add(directional);

        // Colored accent lights
        const blueLight = new THREE.PointLight(0x00d4ff, 1.5, 50);
        blueLight.position.set(-20, 10, 10);
        this.scene.add(blueLight);

        const greenLight = new THREE.PointLight(0x00ff88, 1, 50);
        greenLight.position.set(20, -10, 10);
        this.scene.add(greenLight);

        const purpleLight = new THREE.PointLight(0x8b5cf6, 0.8, 50);
        purpleLight.position.set(0, 0, 25);
        this.scene.add(purpleLight);
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
        this.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
        this.targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }

    onScroll() {
        const scrollY = window.scrollY;
        const heroHeight = window.innerHeight;
        const progress = Math.min(scrollY / heroHeight, 1);

        if (this.container) {
            this.container.style.opacity = 1 - progress * 1.5;
        }

        this.camera.position.z = 35 + progress * 30;
        this.camera.position.y = -progress * 10;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = this.clock.getElapsedTime();

        // Smooth mouse following
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        // Animate nodes
        this.nodes.forEach((node, i) => {
            const group = node.group;
            const data = node.data;

            // Floating animation
            group.position.y = node.originalPos[1] + Math.sin(time * 0.8 + i * 0.5) * 0.8;
            group.position.x = node.originalPos[0] + Math.cos(time * 0.5 + i * 0.3) * 0.3;

            // Rotation
            group.rotation.y = time * 0.3 + i * 0.5;
            group.rotation.z = Math.sin(time * 0.4 + i) * 0.1;

            // Animate rings
            const children = group.children;
            children.forEach(child => {
                if (child.geometry && child.geometry.type === 'TorusGeometry') {
                    child.rotation.z = time * 0.5;
                }
                if (child.name === 'orbit') {
                    child.rotation.y = time * 1.5;
                    child.rotation.x = time * 0.3;
                }
                if (child.name === 'aura') {
                    const scale = 1 + Math.sin(time * 2) * 0.15;
                    child.scale.set(scale, scale, scale);
                    child.material.opacity = 0.05 + Math.sin(time * 2) * 0.05;
                }
            });
        });

        // Animate data streams
        this.dataStreams.forEach((stream, idx) => {
            stream.particles.forEach(particle => {
                const t = ((time * particle.userData.speed + particle.userData.offset) % 1);
                const point = stream.curve.getPoint(t);
                particle.position.copy(point);

                // Fade in/out at ends
                const fadeZone = 0.15;
                let opacity = 0.9;
                if (t < fadeZone) opacity = t / fadeZone * 0.9;
                if (t > 1 - fadeZone) opacity = (1 - t) / fadeZone * 0.9;
                particle.material.opacity = opacity;
            });
        });

        // Animate ambient particles
        if (this.ambientParticles) {
            this.ambientParticles.rotation.y = time * 0.02;
            const positions = this.ambientParticles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(time + i) * 0.002;
            }
            this.ambientParticles.geometry.attributes.position.needsUpdate = true;
        }

        // Camera parallax
        this.camera.position.x = this.mouseX * 5;
        this.camera.position.y += (-this.mouseY * 3 - this.camera.position.y) * 0.1;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize on DOM ready (desktop only)
document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth > 1024 && typeof THREE !== 'undefined') {
        new BlueforgeScene();
    }
});
