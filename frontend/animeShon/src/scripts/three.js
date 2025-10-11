import * as THREE from 'three';
import { randomAnime, fetchRandomAnime } from "./fetchRandomAnime.js";

const threeJscontainer = document.querySelector(".threejs");

// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 500);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(256, 256);
threeJscontainer.appendChild(renderer.domElement);

// Load everything AFTER we fetch the anime
async function init() {
  await fetchRandomAnime(); // wait until the data is ready
  console.log("Random anime:", randomAnime);

  const geometry = new THREE.BoxGeometry(2, 4, 0.2);
  const textureLoader = new THREE.TextureLoader();

  // ✅ Check that the image exists
  const imageUrl = randomAnime?.data?.images?.jpg?.image_url;
  if (!imageUrl) {
    console.error("Image URL missing from response:", randomAnime);
    return;
  }

  const texture = textureLoader.load(imageUrl);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  camera.position.z = 5;

  function animate() {
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(animate);
}

init();