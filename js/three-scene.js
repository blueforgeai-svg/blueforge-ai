/**
 * Blueforge AI - Full 3D Homepage Experience
 * Immersive scroll-based journey through 3D space
 */

class BlueforgeWorld {
    constructor() {
        this.container = document.getElementById('world-canvas');
        if (!this.container) return;

        // Scene components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        // Interaction
        this.mouseX = 0;
        this.mouseY = 0;
        this.scrollProgress = 0;
        this.targetScrollProgress = 0;

        // Scene elements
        this.dataNodes = [];
        this.floatingCards = [];
        this.particles = null;
        this.gridFloor = null;

        // Camera path waypoints (scroll positions)
        this.cameraPath = [
            { pos: [0, 5, 50], lookAt: [0, 0, 0], section: 'hero' },
            { pos: [0, 3, 30], lookAt: [0, 0, -10], section: 'about' },
            { pos: [15, 5, 0], lookAt: [0, 0, -30], section: 'services' },
            { pos: [-15, 8, -30], lookAt: [0, 0, -60], section: 'tech' },
            { pos: [0, 3, -60], lookAt: [0, 0, -80], section: 'cta' },
        ];

        this.init();
        this.createEnvironment();
        this.createHeroSection();
        this.createServicesSection();
        this.createTechSection();
        this.createCTASection();
        this.createParticleField();
        this.addLights();
        this.animate();
        this.addEventListeners();
    }

    init() {
        // Scene with dark fog
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050a15);
        this.scene.fog = new THREE.FogExp2(0x050a15, 0.008);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 50);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    createEnvironment() {
        // Infinite grid floor
        const gridHelper = new THREE.GridHelper(500, 100, 0x1a3366, 0x0d1a33);
        gridHelper.position.y = -5;
        this.scene.add(gridHelper);
        this.gridFloor = gridHelper;

        // Glowing horizon line
        const horizonGeo = new THREE.PlaneGeometry(1000, 0.5);
        const horizonMat = new THREE.MeshBasicMaterial({
            color: 0x00d4ff,
            transparent: true,
            opacity: 0.3,
        });
        const horizon = new THREE.Mesh(horizonGeo, horizonMat);
        horizon.position.set(0, -4.9, -100);
        horizon.rotation.x = -Math.PI / 2;
        this.scene.add(horizon);

        // Vertical light beams
        for (let i = 0; i < 20; i++) {
            const beamGeo = new THREE.CylinderGeometry(0.1, 0.1, 100, 8);
            const beamMat = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? 0x00d4ff : 0x8b5cf6,
                transparent: true,
                opacity: 0.1,
            });
            const beam = new THREE.Mesh(beamGeo, beamMat);
            beam.position.set(
                (Math.random() - 0.5) * 200,
                45,
                (Math.random() - 0.5) * 300 - 50
            );
            this.scene.add(beam);
        }
    }

    createHeroSection() {
        // Central data flow visualization at Z=0
        const nodePositions = [
            { pos: [-8, 8, 0], color: 0x00d4ff, label: 'Sensors' },
            { pos: [0, 10, 2], color: 0x00ff88, label: 'PLCs' },
            { pos: [8, 8, 0], color: 0x00d4ff, label: 'SCADA' },
            { pos: [0, 3, 5], color: 0x4d9fff, label: 'Historian', size: 2 },
            { pos: [-8, -2, 0], color: 0xff6b6b, label: 'AI/ML' },
            { pos: [0, -4, 2], color: 0xffd93d, label: 'Dashboard' },
            { pos: [8, -2, 0], color: 0xff6b6b, label: 'Reports' },
        ];

        nodePositions.forEach((data, i) => {
            const node = this.createGlowingNode(data, i);
            this.dataNodes.push(node);
            this.scene.add(node.group);
        });

        // Connection lines
        this.createConnectionLines(nodePositions);
    }

    createGlowingNode(data, index) {
        const group = new THREE.Group();
        const size = data.size || 1;

        // Core sphere
        const coreGeo = new THREE.IcosahedronGeometry(size, 2);
        const coreMat = new THREE.MeshPhongMaterial({
            color: data.color,
            emissive: data.color,
            emissiveIntensity: 0.3,
            shininess: 100,
            transparent: true,
            opacity: 0.9,
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        group.add(core);

        // Outer glow ring
        const ringGeo = new THREE.TorusGeometry(size * 1.5, 0.05, 16, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.5,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);

        // Point light
        const light = new THREE.PointLight(data.color, 0.5, 10);
        group.add(light);

        group.position.set(...data.pos);
        group.userData = { index, originalY: data.pos[1] };

        return { group, data };
    }

    createConnectionLines(nodes) {
        const connections = [
            [0, 3], [1, 3], [2, 3], // Sources to historian
            [3, 4], [3, 5], [3, 6], // Historian to outputs
        ];

        connections.forEach(([from, to]) => {
            const fromPos = new THREE.Vector3(...nodes[from].pos);
            const toPos = new THREE.Vector3(...nodes[to].pos);
            const midPos = fromPos.clone().add(toPos).multiplyScalar(0.5);
            midPos.z += 3;

            const curve = new THREE.QuadraticBezierCurve3(fromPos, midPos, toPos);
            const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.05, 8, false);
            const tubeMat = new THREE.MeshBasicMaterial({
                color: 0x00d4ff,
                transparent: true,
                opacity: 0.3,
            });
            const tube = new THREE.Mesh(tubeGeo, tubeMat);
            this.scene.add(tube);
        });
    }

    createServicesSection() {
        // Floating service cards at Z=-30
        const services = [
            { title: 'PI System', color: 0x00d4ff, x: -12 },
            { title: 'OT-IT', color: 0x00ff88, x: -4 },
            { title: 'ThingWorx', color: 0x8b5cf6, x: 4 },
            { title: 'AI/ML', color: 0xff6b6b, x: 12 },
        ];

        services.forEach((service, i) => {
            const card = this.createFloatingCard(service, i);
            card.position.set(service.x, 3 + Math.sin(i) * 2, -30 - i * 5);
            this.floatingCards.push(card);
            this.scene.add(card);
        });
    }

    createFloatingCard(data, index) {
        const group = new THREE.Group();

        // Card base
        const cardGeo = new THREE.BoxGeometry(8, 6, 0.5);
        const cardMat = new THREE.MeshPhongMaterial({
            color: 0x1a2744,
            emissive: data.color,
            emissiveIntensity: 0.1,
            transparent: true,
            opacity: 0.9,
        });
        const card = new THREE.Mesh(cardGeo, cardMat);
        group.add(card);

        // Glowing border
        const edgesGeo = new THREE.EdgesGeometry(cardGeo);
        const edgesMat = new THREE.LineBasicMaterial({
            color: data.color,
            transparent: true,
            opacity: 0.8,
        });
        const edges = new THREE.LineSegments(edgesGeo, edgesMat);
        group.add(edges);

        // Icon sphere
        const iconGeo = new THREE.IcosahedronGeometry(0.8, 1);
        const iconMat = new THREE.MeshPhongMaterial({
            color: data.color,
            emissive: data.color,
            emissiveIntensity: 0.5,
        });
        const icon = new THREE.Mesh(iconGeo, iconMat);
        icon.position.set(0, 1, 0.5);
        group.add(icon);

        group.userData = { index, originalY: group.position.y };
        return group;
    }

    createTechSection() {
        // Tech logos as glowing spheres at Z=-60
        const techs = [
            { name: 'AVEVA', color: 0x00d4ff },
            { name: 'Azure', color: 0x00a2ff },
            { name: 'Python', color: 0xffd43b },
            { name: 'TensorFlow', color: 0xff6f00 },
            { name: 'Docker', color: 0x2496ed },
        ];

        techs.forEach((tech, i) => {
            const angle = (i / techs.length) * Math.PI * 2;
            const radius = 12;

            const sphereGeo = new THREE.SphereGeometry(1.5, 32, 32);
            const sphereMat = new THREE.MeshPhongMaterial({
                color: tech.color,
                emissive: tech.color,
                emissiveIntensity: 0.4,
                transparent: true,
                opacity: 0.9,
            });
            const sphere = new THREE.Mesh(sphereGeo, sphereMat);
            sphere.position.set(
                Math.cos(angle) * radius,
                3 + Math.sin(angle * 2) * 2,
                -60 + Math.sin(angle) * 5
            );
            sphere.userData = { rotationSpeed: 0.5 + Math.random() * 0.5 };
            this.scene.add(sphere);
        });
    }

    createCTASection() {
        // Large glowing portal at Z=-80
        const portalGeo = new THREE.TorusGeometry(8, 0.5, 16, 100);
        const portalMat = new THREE.MeshPhongMaterial({
            color: 0x00d4ff,
            emissive: 0x00d4ff,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.8,
        });
        const portal = new THREE.Mesh(portalGeo, portalMat);
        portal.position.set(0, 3, -80);
        this.scene.add(portal);
        this.portal = portal;

        // Inner glow
        const innerGeo = new THREE.CircleGeometry(7, 64);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0x00d4ff,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide,
        });
        const inner = new THREE.Mesh(innerGeo, innerMat);
        inner.position.set(0, 3, -80);
        this.scene.add(inner);
    }

    createParticleField() {
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorOptions = [
            new THREE.Color(0x00d4ff),
            new THREE.Color(0x00ff88),
            new THREE.Color(0x8b5cf6),
            new THREE.Color(0xffffff),
        ];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = Math.random() * 50 - 5;
            positions[i * 3 + 2] = Math.random() * -150 + 50;

            const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    addLights() {
        // Ambient
        const ambient = new THREE.AmbientLight(0x111122, 0.5);
        this.scene.add(ambient);

        // Main spotlight following camera
        const spotlight = new THREE.SpotLight(0xffffff, 1);
        spotlight.position.set(0, 30, 50);
        spotlight.target.position.set(0, 0, 0);
        spotlight.castShadow = true;
        this.scene.add(spotlight);
        this.spotlight = spotlight;

        // Colored accent lights
        const blueLight = new THREE.PointLight(0x00d4ff, 2, 100);
        blueLight.position.set(-30, 10, 0);
        this.scene.add(blueLight);

        const purpleLight = new THREE.PointLight(0x8b5cf6, 2, 100);
        purpleLight.position.set(30, 10, -50);
        this.scene.add(purpleLight);

        const greenLight = new THREE.PointLight(0x00ff88, 1.5, 100);
        greenLight.position.set(0, 20, -100);
        this.scene.add(greenLight);
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
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        this.targetScrollProgress = window.scrollY / scrollHeight;
    }

    getCameraPosition(progress) {
        const numPoints = this.cameraPath.length - 1;
        const scaledProgress = progress * numPoints;
        const index = Math.min(Math.floor(scaledProgress), numPoints - 1);
        const t = scaledProgress - index;

        const from = this.cameraPath[index];
        const to = this.cameraPath[index + 1];

        return {
            pos: [
                from.pos[0] + (to.pos[0] - from.pos[0]) * t,
                from.pos[1] + (to.pos[1] - from.pos[1]) * t,
                from.pos[2] + (to.pos[2] - from.pos[2]) * t,
            ],
            lookAt: [
                from.lookAt[0] + (to.lookAt[0] - from.lookAt[0]) * t,
                from.lookAt[1] + (to.lookAt[1] - from.lookAt[1]) * t,
                from.lookAt[2] + (to.lookAt[2] - from.lookAt[2]) * t,
            ],
        };
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = this.clock.getElapsedTime();

        // Smooth scroll interpolation
        this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.05;

        // Update camera based on scroll
        const camData = this.getCameraPosition(this.scrollProgress);
        this.camera.position.set(...camData.pos);
        this.camera.position.x += this.mouseX * 2;
        this.camera.position.y += -this.mouseY * 1;
        this.camera.lookAt(new THREE.Vector3(...camData.lookAt));

        // Animate data nodes
        this.dataNodes.forEach((node, i) => {
            node.group.rotation.y = time * 0.5 + i;
            node.group.position.y = node.group.userData.originalY + Math.sin(time + i) * 0.3;
        });

        // Animate floating cards
        this.floatingCards.forEach((card, i) => {
            card.rotation.y = Math.sin(time * 0.3 + i) * 0.2;
            card.position.y = 3 + Math.sin(i) * 2 + Math.sin(time * 0.5 + i) * 0.5;
        });

        // Animate portal
        if (this.portal) {
            this.portal.rotation.z = time * 0.5;
            this.portal.rotation.x = Math.sin(time * 0.3) * 0.2;
        }

        // Animate particles
        if (this.particles) {
            this.particles.rotation.y = time * 0.01;
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(time + i) * 0.003;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }

        // Animate grid
        if (this.gridFloor) {
            this.gridFloor.position.z = (time * 2) % 5;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth > 768 && typeof THREE !== 'undefined') {
        new BlueforgeWorld();
    }
});
