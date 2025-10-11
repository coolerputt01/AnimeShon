import * as THREE from 'three';


const threeJscontainer = document.querySelector(".threejs");
// Copied and pasted from docs.
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 500 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( 128, 128 );
threeJscontainer.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );