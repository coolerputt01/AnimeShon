// /scripts/three.js
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { randomAnime, fetchRandomAnime } from "./fetchRandomAnime.js";
import { animeData, fetchAnime } from "./fetchAnime.js"; // new import for ID-based fetching

// Promise wrapper for TextureLoader
function loadTexture(url) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(url, resolve, undefined, reject);
  });
}

async function createCassette(container, imageUrl) {
  if (!container || !imageUrl) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 1, 500);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

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

  // containers that already have image data
  const withImage = containers.filter(c => c.dataset.image);
  const withoutImage = containers.filter(c => !c.dataset.image);

  // 1️⃣ Render all with existing images
  for (const c of withImage) {
    const img = c.dataset.image;
    createCassette(c, img).catch(err => console.error("createCassette error:", err));
  }

  // 2️⃣ Handle containers with no image → detect mode (by ID or random)
  if (withoutImage.length > 0) {
    try {
      let imageUrl = null;

// Detect anime ID either from path (/anime/1234) or query (?id=1234)
let animeId = null;

// Try query parameter first
const params = new URLSearchParams(window.location.search);
if (params.has("id")) {
  animeId = params.get("id");
} else {
  // fallback to path param
  const match = window.location.pathname.match(/\/anime\/(\d+)/);
  if (match) animeId = match[1];
}

if (animeId) {
  console.log("Detected Anime ID:", animeId);
  await fetchAnime(animeId);
  imageUrl = animeData?.data?.images?.jpg?.image_url;
} else {
  console.log("No anime ID found → fetching random anime");
  await fetchRandomAnime();
  imageUrl = randomAnime?.data?.images?.jpg?.image_url;
}

      if (!imageUrl) {
        console.error("No image found for cassette rendering");
        return;
      }

      for (const c of withoutImage) {
        createCassette(c, imageUrl).catch(err => console.error("createCassette error:", err));
      }
    } catch (err) {
      console.error("Error loading anime for cassette:", err);
    }
  }
}

// Ensure DOM is ready
if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(initAllCassettes, 0);
} else {
  document.addEventListener("DOMContentLoaded", initAllCassettes);
}