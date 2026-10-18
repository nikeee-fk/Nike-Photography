const globeShell = document.getElementById('globeShell');

if (!globeShell) {
  console.warn('Globe shell not found.');
} else {
  const setupGlobe = async () => {
    if (!window.THREE) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.min.js';
      script.async = true;
      document.head.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load Three.js'));
      });
    }

    const THREE = window.THREE;

    const shell = document.createElement('div');
    shell.className = 'globe-canvas-shell';
    globeShell.appendChild(shell);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, shell.clientWidth / shell.clientHeight, 0.1, 1000);
    camera.position.z = 4.1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setClearColor(0x000000, 0);
    shell.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    const pointLight = new THREE.PointLight(0xffffff, 1.4, 100, 2);
    pointLight.position.set(3, 2.5, 5);
    scene.add(ambient, pointLight);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const globeTexture = new THREE.TextureLoader().load(
      'https://raw.githubusercontent.com/turban/webgl-earth/master/textures/earth_atmos_2048.jpg',
      () => {
        // no-op; texture loaded
      },
      undefined,
      () => {
        console.warn('Failed to load globe texture. Falling back to flat globe styling.');
      }
    );

    const sphereGeometry = new THREE.SphereGeometry(1.55, 64, 64);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xe7e5df,
      roughness: 0.8,
      metalness: 0.18,
      map: globeTexture,
      emissive: 0x121212,
      emissiveIntensity: 0.15,
    });

    const globe = new THREE.Mesh(sphereGeometry, sphereMaterial);
    globeGroup.add(globe);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.7, 48, 48),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide,
      })
    );
    globeGroup.add(atmosphere);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.018, 12, 180),
      new THREE.MeshBasicMaterial({ color: 0x8d8a82, transparent: true, opacity: 0.28 })
    );
    ring.rotation.x = Math.PI / 2.35;
    ring.rotation.y = 0.6;
    globeGroup.add(ring);

    const state = {
      rotationY: 0.7,
      rotationX: 0.18,
      targetRotationY: 0.7,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      lastX: 0,
      lastY: 0,
    };

    const onResize = () => {
      const { clientWidth, clientHeight } = shell;
      if (!clientWidth || !clientHeight) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight, false);
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(shell);
    onResize();

    const render = () => {
      if (!state.isDragging) {
        state.rotationY += 0.0038;
      } else {
        state.rotationY += (state.targetRotationY - state.rotationY) * 0.08;
      }

      globe.rotation.y = state.rotationY;
      globe.rotation.x = state.rotationX;
      atmosphere.rotation.y = state.rotationY * 0.9;
      ring.rotation.z += 0.003;
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    };

    shell.addEventListener('pointerdown', (event) => {
      state.isDragging = true;
      state.dragStartX = event.clientX;
      state.dragStartY = event.clientY;
      state.lastX = state.rotationY;
      state.lastY = state.rotationX;
      shell.setPointerCapture(event.pointerId);
    });

    shell.addEventListener('pointermove', (event) => {
      if (!state.isDragging) return;
      const deltaX = (event.clientX - state.dragStartX) * 0.008;
      const deltaY = (event.clientY - state.dragStartY) * 0.005;
      state.targetRotationY = state.lastX - deltaX;
      state.rotationX = THREE.MathUtils.clamp(state.lastY + deltaY, -0.75, 0.75);
    });

    const stopDrag = () => {
      state.isDragging = false;
      state.targetRotationY = state.rotationY;
    };

    shell.addEventListener('pointerup', stopDrag);
    shell.addEventListener('pointerleave', stopDrag);
    shell.addEventListener('pointercancel', stopDrag);

    requestAnimationFrame(render);
  };

  setupGlobe().catch((error) => {
    console.error('Globe setup failed:', error);
  });
}
