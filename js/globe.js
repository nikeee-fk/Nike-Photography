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
    const camera = new THREE.PerspectiveCamera(32, shell.clientWidth / shell.clientHeight || 1, 0.1, 1000);
    camera.position.set(0, 0.2, 4.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    shell.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xf4f1ea, 1.05);
    const keyLight = new THREE.DirectionalLight(0xf6f2ea, 1.3);
    keyLight.position.set(2.7, 2.2, 3.6);

    const fillLight = new THREE.DirectionalLight(0xc9d1d8, 0.75);
    fillLight.position.set(-3.4, -1.2, 2.8);

    scene.add(ambient, keyLight, fillLight);

    const globeGroup = new THREE.Group();
    globeGroup.rotation.y = -0.7;
    scene.add(globeGroup);

    const globeTexture = new THREE.TextureLoader().load(
      'https://raw.githubusercontent.com/turban/webgl-earth/master/textures/earth_atmos_2048.jpg',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      },
      undefined,
      () => {
        console.warn('Failed to load globe texture. Falling back to flat globe styling.');
      }
    );

    const sphereGeometry = new THREE.SphereGeometry(1.52, 96, 96);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0xe6e0d4,
      roughness: 0.9,
      metalness: 0.08,
      map: globeTexture,
      emissive: 0x111111,
      emissiveIntensity: 0.1,
      transparent: true,
      opacity: 1,
    });

    const globe = new THREE.Mesh(sphereGeometry, sphereMaterial);
    globeGroup.add(globe);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.72, 56, 56),
      new THREE.MeshBasicMaterial({
        color: 0xf2efe9,
        transparent: true,
        opacity: 0.10,
        side: THREE.BackSide,
      })
    );
    globeGroup.add(atmosphere);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.28, 0.02, 12, 220),
      new THREE.MeshBasicMaterial({
        color: 0x9a958c,
        transparent: true,
        opacity: 0.28,
      })
    );
    ring.rotation.x = Math.PI / 2.32;
    ring.rotation.y = 0.65;
    ring.rotation.z = -0.18;
    globeGroup.add(ring);

    const state = {
      rotationY: -0.7,
      rotationX: 0.18,
      targetRotationY: -0.7,
      targetRotationX: 0.18,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      lastX: -0.7,
      lastY: 0.18,
    };

    const onResize = () => {
      const { clientWidth, clientHeight } = shell;
      if (!clientWidth || !clientHeight) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight, false);
    };

    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(onResize) : null;
    if (resizeObserver) {
      resizeObserver.observe(shell);
    } else {
      window.addEventListener('resize', onResize);
    }
    onResize();

    const render = () => {
      if (!state.isDragging) {
        state.rotationY += 0.0033;
      } else {
        state.rotationY += (state.targetRotationY - state.rotationY) * 0.08;
      }

      state.rotationX += (state.targetRotationX - state.rotationX) * 0.08;
      globe.rotation.y = state.rotationY;
      globe.rotation.x = state.rotationX;
      atmosphere.rotation.y = state.rotationY * 0.9;
      ring.rotation.z += 0.0018;
      ring.rotation.y += 0.0008;
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
      const deltaX = (event.clientX - state.dragStartX) * 0.006;
      const deltaY = (event.clientY - state.dragStartY) * 0.004;
      state.targetRotationY = state.lastX - deltaX;
      state.targetRotationX = THREE.MathUtils.clamp(state.lastY + deltaY, -0.9, 0.9);
    });

    const stopDrag = () => {
      state.isDragging = false;
      state.targetRotationY = state.rotationY;
      state.targetRotationX = state.rotationX;
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
