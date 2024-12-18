import * as THREE from './ThreeJS/build/three.module.js';
import { OrbitControls } from './ThreeJS/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './ThreeJS/examples/jsm/loaders/GLTFLoader.js'

let scene, camera, rndr, control, camera2, selectedCamera, spot, model
let mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, satellite
let sun, sunGroup

let w = window.innerWidth, h = window.innerHeight

function init () {
    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 10000)
    camera2 = new THREE.PerspectiveCamera(90, w/h, 0.1, 10000)

    selectedCamera = camera

    rndr = new THREE.WebGL1Renderer({antialias: true})
    rndr.setSize(w, h)
    document.body.appendChild(rndr.domElement)

    rndr.setClearColor(0xffffff)

    rndr.shadowMap.type = THREE.PCFShadowMap
    rndr.shadowMap.enabled = true 
    
    control = new OrbitControls(camera, rndr.domElement)

    updateCameraPosition()

    sun = createSun()
    let point = createPointLight()
    sunGroup = new THREE.Group()
    sunGroup.add(sun, point)
    sunGroup.position.set(640, 320, 0)

    satellite = createSatellite()

    spot = createSpotLight()
    spot.shadow.mapSize.width = 512;
    spot.shadow.mapSize.height = 512;
    spot.distance = 10;

    scene.add(sunGroup, satellite, spot)

    createPlanets()
    
    let loader = new GLTFLoader()
    loader.load("./assets/model/spaceship/scene.gltf", function ( gltf ) {
        model = gltf.scene
        model.position.set(420, 320, 60)
        model.traverse(function(node){
        if(node.isMesh)
            node.castShadow = true
            node.receiveShadow = true
        })
        scene.add(model);
    });

    loadSkyBox()
}

function createPlanet({ name, size, position, texturePath, ring = null }) {
    const geo = new THREE.SphereGeometry(size, 64, 64);

    const textureLoad = new THREE.TextureLoader();
    const texture = textureLoad.load(texturePath);

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);

    const mats = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: texture
    });

    const planet = new THREE.Mesh(geo, mats);
    planet.castShadow = true;
    planet.receiveShadow = true;

    const planetGroup = new THREE.Group();
    planetGroup.add(planet);
    planetGroup.position.set(...position);

    if (ring) {
        const { innerRadius, outerRadius, ringTexturePath, rotationX } = ring;
        const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 64);

        const ringTexture = textureLoad.load(ringTexturePath);
        ringTexture.wrapS = THREE.RepeatWrapping;
        ringTexture.wrapT = THREE.RepeatWrapping;
        ringTexture.repeat.set(1, 1);

        const ringMats = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            map: ringTexture,
            side: THREE.DoubleSide
        });

        const ringMesh = new THREE.Mesh(ringGeo, ringMats);
        ringMesh.castShadow = false;
        ringMesh.receiveShadow = true;
        ringMesh.rotation.x = rotationX;

        planetGroup.add(ringMesh);
    }

    return planetGroup;
}

function createPlanets() {
    mercury = createPlanet({
        name: "Mercury",
        size: 3.2,
        position: [sunGroup.position.x+58, 320, 0],
        texturePath: "./assets/textures/mercury.jpg"
    });

    venus = createPlanet({
        name: "Venus",
        size: 4.8,
        position: [sunGroup.position.x+80, 320, 0],
        texturePath: "./assets/textures/venus.jpg"
    });

    earth = createPlanet({
        name: "Earth",
        size: 4.8,
        position: [sunGroup.position.x+100, 320, 0],
        texturePath: "./assets/textures/earth.jpg"
    });

    mars = createPlanet({
        name: "Mars",
        size: 4,
        position: [sunGroup.position.x+130, 320, 0],
        texturePath: "./assets/textures/mars.jpg"
    });

    jupiter = createPlanet({
        name: "Jupiter",
        size: 13,
        position: [sunGroup.position.x+175, 320, 0],
        texturePath: "./assets/textures/jupiter.jpg"
    });

    saturn = createPlanet({
        name: "Saturn",
        size: 10,
        position: [sunGroup.position.x+240, 320, 0],
        texturePath: "./assets/textures/saturn.jpg",
        ring: {
            innerRadius: 16,
            outerRadius: 32,
            ringTexturePath: "./assets/textures/saturn_ring.png",
            rotationX: Math.PI / 4
        }
    });

    uranus = createPlanet({
        name: "Uranus",
        size: 13,
        position: [sunGroup.position.x+280, 320, 0],
        texturePath: "./assets/textures/uranus.jpg",
        ring: {
            innerRadius: 16,
            outerRadius: 20,
            ringTexturePath: "./assets/textures/uranus_ring.png",
            rotationX: -Math.PI / 4
        }
    });

    neptune = createPlanet({
        name: "Neptune",
        size: 13,
        position: [sunGroup.position.x+320, 320, 0],
        texturePath: "./assets/textures/neptune.jpg"
    });

    scene.add(mercury, venus, earth, mars, jupiter, saturn, uranus, neptune);
}

function loadSkyBox() {
    let CubeTexture = new THREE.TextureLoader()
    let geo = new THREE.BoxGeometry(4260, 4260, 4260)
    let skyBoxMat = [
        new THREE.MeshBasicMaterial({map: CubeTexture.load("./assets/skybox/right.png"),
            side: THREE.DoubleSide
        }),
        new THREE.MeshBasicMaterial({map: CubeTexture.load("./assets/skybox/left.png"),
            side: THREE.DoubleSide
        }),
        new THREE.MeshBasicMaterial({map: CubeTexture.load("./assets/skybox/top.png"),
            side: THREE.DoubleSide
        }),
        new THREE.MeshBasicMaterial({map: CubeTexture.load("./assets/skybox/bottom.png"),
            side: THREE.DoubleSide
        }),
        new THREE.MeshBasicMaterial({map: CubeTexture.load("./assets/skybox/front.png"),
            side: THREE.DoubleSide
        }),
        new THREE.MeshBasicMaterial({map: CubeTexture.load("./assets/skybox/back.png"),
            side: THREE.DoubleSide
        })
    ]
    let cube = new THREE.Mesh(geo, skyBoxMat)
    scene.add(cube)
}

function createSpotLight (){
    let SpotLight = new THREE.SpotLight(0xffffff, 8);
    SpotLight.castShadow = false;
    return SpotLight
}

function createPointLight (){
    let lampu = new THREE.PointLight(0xffffff, 1, 1280)
    lampu.castShadow = true
    return lampu
}

function updateSpotlightPosition(spaceship) {
    if (spaceship && spaceship.userData.previousPosition) {
        const { x, y, z } = spaceship.userData.previousPosition;
        const hasMoved = (
            x !== spaceship.position.x ||
            y !== spaceship.position.y ||
            z !== spaceship.position.z
        );
        if (!hasMoved) return;
    }

    spot.position.set(
        spaceship.position.x, 
        spaceship.position.y + 6, 
        spaceship.position.z
    );
    spot.target.position.set(
        spaceship.position.x,
        spaceship.position.y,
        spaceship.position.z
    );
    spot.target.updateMatrixWorld();
    spaceship.userData.previousPosition = {
        x: spaceship.position.x,
        y: spaceship.position.y,
        z: spaceship.position.z,
    };
}
function updateCamera2Position(spaceship) {
    camera2.position.set(
        spaceship.position.x,
        spaceship.position.y + 16,
        spaceship.position.z - 16
    );

    camera2.lookAt(
        spaceship.position.x,
        spaceship.position.y,
        spaceship.position.z
    );
}
function createSun () {
    let geo = new THREE.SphereGeometry(40, 64, 64)

    let textureLoad = new THREE.TextureLoader()
    let texture  = textureLoad.load(
        "./assets/textures/sun.jpg"
    )

    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    texture.repeat.set(1, 1)

    let mats = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: texture
    })
    return new THREE.Mesh(geo, mats)
}

function createSatellite () {
    let geometry = new THREE.CylinderGeometry(1, 0.5, 0.4, 8);

    let material = new THREE.MeshStandardMaterial({
        color: 0xCCCCCC,
        metalness: 0.5,
        roughness: 0.5,
    });

    let satellite_obj = new THREE.Mesh(geometry, material);
    satellite_obj.castShadow = false;
    satellite_obj.receiveShadow = true;

    return satellite_obj;
};

function updateSatellitePosition() {
    if (earth && satellite) {
        satellite.position.set(
            earth.position.x + 8,
            earth.position.y,
            earth.position.z
        );
    }
}

function updateCameraPosition(){
    camera.position.set(640, 480, 240)
    camera.lookAt(640, 320, 0)

    control.target.set(640, 320, 0);
    control.update();
}

function updateSpaceship() {
    if (model) {
        updateSpotlightPosition(model);
        updateCamera2Position(model);
    }
}

function rotationSolarSystem() {
    //Orbital Rotation
    const speedFactor = -0.0001;
    mercury.position.x = sunGroup.position.x + 58 * Math.cos(Date.now() * speedFactor * 4.15);
    mercury.position.z = sunGroup.position.z + 58 * Math.sin(Date.now() * speedFactor * 4.15);

    venus.position.x = sunGroup.position.x + 80 * Math.cos(Date.now() * speedFactor * 1.62);
    venus.position.z = sunGroup.position.z + 80 * Math.sin(Date.now() * speedFactor * 1.62);

    earth.position.x = sunGroup.position.x + 100 * Math.cos(Date.now() * speedFactor * 1);
    earth.position.z = sunGroup.position.z + 100 * Math.sin(Date.now() * speedFactor * 1);

    mars.position.x = sunGroup.position.x + 130 * Math.cos(Date.now() * speedFactor * 0.53);
    mars.position.z = sunGroup.position.z + 130 * Math.sin(Date.now() * speedFactor * 0.53);

    jupiter.position.x = sunGroup.position.x + 175 * Math.cos(Date.now() * speedFactor * 0.08);
    jupiter.position.z = sunGroup.position.z + 175 * Math.sin(Date.now() * speedFactor * 0.08);

    saturn.position.x = sunGroup.position.x + 240 * Math.cos(Date.now() * speedFactor * 0.03);
    saturn.position.z = sunGroup.position.z + 240 * Math.sin(Date.now() * speedFactor * 0.03);

    uranus.position.x = sunGroup.position.x + 280 * Math.cos(Date.now() * speedFactor * 0.011);
    uranus.position.z = sunGroup.position.z + 280 * Math.sin(Date.now() * speedFactor * 0.011);

    neptune.position.x = sunGroup.position.x + 320 * Math.cos(Date.now() * speedFactor * 0.006);
    neptune.position.z = sunGroup.position.z + 320 * Math.sin(Date.now() * speedFactor * 0.006);

    //Planet Rotation
    const speedFactor2 = 0.001;
    sunGroup.rotation.y += speedFactor2 * 1;
    mercury.rotation.y += speedFactor2 * 4.15;
    venus.rotation.y += speedFactor2 * -1.62; //clockwise planet rotation
    earth.rotation.y += speedFactor2 * 1;
    mars.rotation.y += speedFactor2 * 0.53;
    jupiter.rotation.y += speedFactor2 * 0.08;
    saturn.rotation.y += speedFactor2 * 0.03;
    uranus.rotation.y += speedFactor2 * 0.011;
    neptune.rotation.y += speedFactor2 * 0.006;
}

function render () {
    
    requestAnimationFrame(render)
    rndr.render(scene, selectedCamera)
    control.update()

    rotationSolarSystem()
    updateSpaceship()
    updateSatellitePosition()
}

window.onresize = () => {
    w = window.innerWidth
    h = window.innerHeight

    camera.aspect = w/h
    rndr.setSize(w, h)
    camera.updateProjectionMatrix()

}

window.onload = () => {
    init()
    render()
}

window.addEventListener("keydown", (event=>{
    if(event.key.charCodeAt(0) == 32){
        if(selectedCamera == camera){
            selectedCamera = camera2
            control.enabled = false
        }else if(selectedCamera == camera2){
            selectedCamera = camera
            control.enabled = true
        }
    }
}))