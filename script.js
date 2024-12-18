import * as THREE from './ThreeJS/build/three.module.js';
import { OrbitControls } from './ThreeJS/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './ThreeJS/examples/jsm/loaders/GLTFLoader.js'

let scene, camera, w, h, rndr, control, camera2, selectedCamera, spot, model
let mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, satellite

function init () {
    scene = new THREE.Scene()

    w = window.innerWidth
    h = window.innerHeight

    camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 10000)
    camera2 = new THREE.PerspectiveCamera(90, w/h, 0.1, 10000)

    selectedCamera = camera

    rndr = new THREE.WebGL1Renderer({antialias: true})
    rndr.setSize(w, h)
    document.body.appendChild(rndr.domElement)

    rndr.setClearColor(0xffffff)

    rndr.shadowMap.enabled = true 
    rndr.shadowMap.type = THREE.PCFShadowMap

    control = new OrbitControls(camera, rndr.domElement)

    updateCameraPosition()

    let sun = createSun()
    let point = createPointLight()
    let sunGroup = new THREE.Group()
    sunGroup.add(sun, point)
    sunGroup.position.set(640, 320, 0)

    satellite = createSatellite()

    createPlanets()

    spot = createSpotLight()

    scene.add(sunGroup, satellite, spot)
    
    let loader = new GLTFLoader()
    loader.load("./assets/model/spaceship/scene.gltf", function ( gltf ) {
        model = gltf.scene
        model.position.set(420, 320, 60)
        model.traverse(function(node){
        if(node.isMesh)
            node.castShadow = true
            node.receiveShadow = true
        })
        scene.add( model );
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
        position: [58, 320, 0],
        texturePath: "./assets/textures/mercury.jpg"
    });

    venus = createPlanet({
        name: "Venus",
        size: 4.8,
        position: [80, 320, 0],
        texturePath: "./assets/textures/venus.jpg"
    });

    earth = createPlanet({
        name: "Earth",
        size: 4.8,
        position: [100, 320, 0],
        texturePath: "./assets/textures/earth.jpg"
    });

    mars = createPlanet({
        name: "Mars",
        size: 4,
        position: [130, 320, 0],
        texturePath: "./assets/textures/mars.jpg"
    });

    jupiter = createPlanet({
        name: "Jupiter",
        size: 13,
        position: [175, 320, 0],
        texturePath: "./assets/textures/jupiter.jpg"
    });

    saturn = createPlanet({
        name: "Saturn",
        size: 10,
        position: [240, 320, 0],
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
        position: [280, 320, 0],
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
        position: [320, 320, 0],
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
    if (model) {
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
    }
}
function updateCamera2Position(spaceship) {
  if(model){
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

function render () {
    requestAnimationFrame(render)
    rndr.render(scene, selectedCamera)
    control.update()
    if (model) {
        updateSpotlightPosition(model)
        updateCamera2Position(model)
    }
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