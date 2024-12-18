import * as THREE from './ThreeJS/build/three.module.js';
import { OrbitControls } from './ThreeJS/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './ThreeJS/examples/jsm/loaders/GLTFLoader.js'

let scene, camera, w, h, rndr, control, camera2, selectedCamera, spot, model

function init () {
    scene = new THREE.Scene()

    w = window.innerWidth
    h = window.innerHeight

    camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 10000)
    camera.position.set(640, 480, 240)
    camera.lookAt(640, 320, 0)

    camera2 = new THREE.PerspectiveCamera(90, w/h, 0.1, 10000)
    camera2.position.set(640, 480, 240)
    camera2.lookAt(640, 320, 0)

    selectedCamera = camera

    rndr = new THREE.WebGL1Renderer({antialias: true})
    rndr.setSize(w, h)
    document.body.appendChild(rndr.domElement)

    rndr.setClearColor(0xffffff)

    rndr.shadowMap.enabled = true 
    rndr.shadowMap.type = THREE.PCFShadowMap

    control = new OrbitControls(camera, rndr.domElement)

    let sun = createSun()
    sun.position.set(640, 320, 0)

    let mercury = createMercury()
    mercury.position.set(58, 320, 0)
    mercury.castShadow = true
    mercury.receiveShadow = true

    let venus = createVenus()
    venus.position.set(80, 320, 0)
    venus.castShadow = true
    venus.receiveShadow = true

    let earth = createEarth()
    earth.position.set(100, 320, 0)
    earth.castShadow = true
    earth.receiveShadow = true

    let mars = createMars()
    mars.position.set(130, 320, 0)
    mars.castShadow = true
    mars.receiveShadow = true

    let jupiter = createJupiter()
    jupiter.position.set(175, 320, 0)
    jupiter.castShadow = true
    jupiter.receiveShadow = true

    let saturn = createSaturn()

    let uranus = createUranus()

    let neptune = createNeptune()
    neptune.position.set(320, 320, 0)
    neptune.castShadow = true
    neptune.receiveShadow = true
    
    let point = createPointLight()
    point.position.set(640, 320, 0)
    point.castShadow = true

    spot = new THREE.SpotLight(0xffffff, 8, 8)
    let satellite = createSatellite()
    satellite.position.set(100 + 8, 320, 0);
    satellite.castShadow = false;
    satellite.receiveShadow = true;

    scene.add(sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, satellite)
    scene.add(point, spot)

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
function loadSkyBox() {
    let CubeTexture = new THREE.TextureLoader
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

function createPointLight (){
    let lampu = new THREE.PointLight(0xffffff, 1, 1280)
    return lampu
}

function updateSpotlightPosition(spaceship) {
    if (model) {
        spot.position.set(
            spaceship.position.x, 
            spaceship.position.y + 6, 
            spaceship.position.z
        );
        
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

function createMercury () {
    let geo = new THREE.SphereGeometry(3.2, 64, 64)

    let textureLoad = new THREE.TextureLoader()
    let texture  = textureLoad.load(
        "./assets/textures/mercury.jpg"
    )

    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    texture.repeat.set(1, 1)

    let mats = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: texture
    })
    return new THREE.Mesh(geo, mats)
}

function createVenus () {
    let geo = new THREE.SphereGeometry(4.8, 64, 64)

    let textureLoad = new THREE.TextureLoader()
    let texture  = textureLoad.load(
        "./assets/textures/venus.jpg"
    )

    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    texture.repeat.set(1, 1)

    let mats = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: texture
    })
    return new THREE.Mesh(geo, mats)
}

function createEarth () {
    let geo = new THREE.SphereGeometry(4.8, 64, 64)

    let textureLoad = new THREE.TextureLoader()
    let texture  = textureLoad.load(
        "./assets/textures/earth.jpg"
    )

    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    texture.repeat.set(1, 1)

    let mats = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: texture
    })
    return new THREE.Mesh(geo, mats)
}

function createMars (){
    let geo = new THREE.SphereGeometry(4)

    let textureLoad = new THREE.TextureLoader()
    let texture  = textureLoad.load(
        "./assets/textures/mars.jpg"
    )

    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    texture.repeat.set(1, 1)

    let mats = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: texture
    })
    return new THREE.Mesh(geo, mats)
}

function createJupiter (){
    let geo = new THREE.SphereGeometry(13)

    let textureLoad = new THREE.TextureLoader()
    let texture  = textureLoad.load(
        "./assets/textures/jupiter.jpg"
    )

    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    texture.repeat.set(1, 1)

    let mats = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: texture
    })
    return new THREE.Mesh(geo, mats)
}

function createSaturn (){
    let geo = new THREE.SphereGeometry(10)

    let textureLoad = new THREE.TextureLoader()
    let texture  = textureLoad.load(
        "./assets/textures/saturn.jpg"
    )

    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    texture.repeat.set(1, 1)

    let mats = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: texture
    })
    let saturn = new THREE.Mesh(geo, mats)
    saturn.castShadow = true
    saturn.receiveShadow = true

    let ringGeo = new THREE.RingGeometry(16, 32, 64)
    let ringTextureLoad = new THREE.TextureLoader()
    let ringTexture  = ringTextureLoad.load(
        "./assets/textures/saturn_ring.png"
    )

    ringTexture.wrapS = THREE.RepeatWrapping
    ringTexture.wrapT = THREE.RepeatWrapping

    ringTexture.repeat.set(1, 1)
    let ringMats = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: texture,
        side: THREE.DoubleSide
    })
    let ring= new THREE.Mesh(ringGeo, ringMats)
    ring.castShadow = false
    ring.receiveShadow = true
    ring.rotation.x = Math.PI/4

    let saturnGroup = new THREE.Group()
    saturnGroup.add(saturn)
    saturnGroup.add(ring)
    saturnGroup.position.set(240, 320, 0); // Set Saturn's position as a group
    return saturnGroup;
}

function createUranus (){
    let geo = new THREE.SphereGeometry(13)

    let textureLoad = new THREE.TextureLoader()
    let texture  = textureLoad.load(
        "./assets/textures/uranus.jpg"
    )

    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    texture.repeat.set(1, 1)

    let mats = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: texture
    })
    let uranus =  new THREE.Mesh(geo, mats)
    uranus.castShadow = true
    uranus.receiveShadow = true

    let ringGeo = new THREE.RingGeometry(16, 20, 64)
    let ringTextureLoad = new THREE.TextureLoader()
    let ringTexture  = ringTextureLoad.load(
        "./assets/textures/uranus_ring.png"
    )

    ringTexture.wrapS = THREE.RepeatWrapping
    ringTexture.wrapT = THREE.RepeatWrapping

    ringTexture.repeat.set(1, 1)
    let ringMats = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: texture,
        side: THREE.DoubleSide
    })
    let ring= new THREE.Mesh(ringGeo, ringMats)
    ring.castShadow = false
    ring.receiveShadow = true
    ring.rotation.x = Math.PI/-4

    let uranusGroup = new THREE.Group()
    uranusGroup.add(uranus)
    uranusGroup.add(ring)
    uranusGroup.position.set(280, 320, 0); // Set uranus's position as a group
    return uranusGroup;
}

function createNeptune (){
    let geo = new THREE.SphereGeometry(13)

    let textureLoad = new THREE.TextureLoader()
    let texture  = textureLoad.load(
        "./assets/textures/neptune.jpg"
    )

    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    texture.repeat.set(1, 1)

    let mats = new THREE.MeshStandardMaterial({
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

    let satellite = new THREE.Mesh(geometry, material);
    return satellite;
};
function render () {
    requestAnimationFrame(render)
    rndr.render(scene, selectedCamera)
    control.update()
    updateSpotlightPosition(model)
    updateCamera2Position(model)
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