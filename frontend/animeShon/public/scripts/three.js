// /scripts/three.js
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { randomAnime, fetchRandomAnime } from "./fetchRandomAnime.js";

// Promise wrapper for TextureLoader
function loadTexture(url) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(url, resolve, undefined, reject);
  });
}

async function createCassette(container, imageUrl) {
  // basic safety
  if (!container || !imageUrl) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 1, 500);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  // size renderer to the container element
  const width = container.clientWidth || 256;
  const height = container.clientHeight || 256;
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(2, 4, 0.2);
  let texture;
  try {
    texture = await loadTexture(imageUrl);
  } catch (err) {
    console.error("Failed to load texture:", err);
    return;
  }

  const materials = [
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
    new THREE.MeshBasicMaterial({ map: texture }),
    new THREE.MeshBasicMaterial({ map: texture }),
  ];

  const cube = new THREE.Mesh(geometry, materials);
  scene.add(cube);
  camera.position.z = 5;

  function animate() {
    cube.rotation.y += 0.02;
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);
}

async function initAllCassettes() {
  const containers = Array.from(document.querySelectorAll('.threejs'));
  if (!containers.length) return;

  // Separate containers that have image vs those that don't
  const withImage = containers.filter(c => c.dataset.image);
  const withoutImage = containers.filter(c => !c.dataset.image);

  // 1) Render all withImage immediately (sequentially to avoid blocking)
  for (const c of withImage) {
    const img = c.dataset.image;
    // don't await too long serially if you prefer parallel; serial is safer for network
    createCassette(c, img).catch(err => console.error("createCassette error:", err));
  }

  // 2) If there are containers without an image, fetch random anime once and use it
  if (withoutImage.length > 0) {
    try {
      // call your existing fetchRandomAnime (it should set exported randomAnime)
      await fetchRandomAnime();
      // randomAnime must be exported as a mutable (export let randomAnime) in fetchRandomAnime.js
      const imageUrl = randomAnime?.data?.images?.jpg?.image_url;
      if (!imageUrl) {
        console.error("No image found on randomAnime:", randomAnime);
        return;
      }

      // Use the same random image for all no-image containers to avoid rate-limits
      for (const c of withoutImage) {
        createCassette(c, imageUrl).catch(err => console.error("createCassette error:", err));
      }
    } catch (err) {
      console.error("Error fetching random anime for cassettes:", err);
    }
  }
}

// Ensure DOM is ready
if (document.readyState === "complete" || document.readyState === "interactive") {
  // small timeout to ensure SSR-to-CSR hydration finished
  setTimeout(initAllCassettes, 0);
} else {
  document.addEventListener("DOMContentLoaded", initAllCassettes);
}