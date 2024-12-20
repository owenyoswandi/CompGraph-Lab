import * as THREE from './ThreeJS/build/three.module.js';
import { OrbitControls } from './ThreeJS/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './ThreeJS/examples/jsm/loaders/GLTFLoader.js'

let modelInit = false

let scene, camera, rndr, control, camera2, selectedCamera, spot, model
let mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, satellite
let sun, sunGroup
let raycaster, mouse
let hoveredObject = null;
let originalColors = new Map();
let label = null

const colors = [
    "#00FFFF", "#00FF00", "#FFCC00", "#E6E6FA", 
    "#FF69B4", "#FF8C00", "#FFB6C1", "#00FFFF", 
    "#87CEEB", "#A8FFB2", "#EE82EE", "#ADD8E6"
]

window.addEventListener("mousemove", onMouseMove);

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

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

    raycaster = new THREE.Raycaster()
    mouse = new THREE.Vector2()

    sun = createSun()
    let point = createPointLight()
    sunGroup = new THREE.Group()
    sunGroup.add(sun, point)
    sunGroup.position.set(640, 320, 0)
    sunGroup.userData.id = 'Sun'

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

    mercury.userData.id = "Mercury"
    venus.userData.id = "Venus"
    earth.userData.id = "Earth"
    mars.userData.id = "Mars"
    jupiter.userData.id = "Jupiter"
    saturn.userData.id = "Saturn"
    uranus.userData.id = "Uranus"
    neptune.userData.id = "Neptune"

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

function updateSpotlightPosition(model) {
    spot.position.set(
        model.position.x, 
        model.position.y + 6, 
        model.position.z
    );
    spot.target.position.set(
        model.position.x,
        model.position.y,
        model.position.z
    );
    spot.target.updateMatrixWorld();
}

function updateCamera2Position(model) {
    camera2.position.set(
        model.position.x,
        model.position.y + 16,
        model.position.z - 16
    );

    camera2.lookAt(
        model.position.x,
        model.position.y,
        model.position.z
    );
}

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
        if (modelInit == false){
            updateSpotlightPosition(model);
            updateCamera2Position(model);
            modelInit = true
        }

        const prevPosition = model.userData.previousPosition || {};
        const currentPosition = model.position;

        if (
            prevPosition.x !== currentPosition.x ||
            prevPosition.y !== currentPosition.y ||
            prevPosition.z !== currentPosition.z
        ) {
            updateSpotlightPosition(model);
            updateCamera2Position(model);

            model.userData.previousPosition = {
                x: currentPosition.x,
                y: currentPosition.y,
                z: currentPosition.z,
            };
        }
    }
}

function rotationSolarSystem(){
    const speedFactor = -0.0001;
    mercury.position.x = sunGroup.position.x + 58 * Math.cos(Date.now() * speedFactor * 5);
    mercury.position.z = sunGroup.position.z + 58 * Math.sin(Date.now() * speedFactor * 5);

    venus.position.x = sunGroup.position.x + 80 * Math.cos(Date.now() * speedFactor * 2);
    venus.position.z = sunGroup.position.z + 80 * Math.sin(Date.now() * speedFactor * 2);

    earth.position.x = sunGroup.position.x + 100 * Math.cos(Date.now() * speedFactor * 1);
    earth.position.z = sunGroup.position.z + 100 * Math.sin(Date.now() * speedFactor * 1);

    mars.position.x = sunGroup.position.x + 130 * Math.cos(Date.now() * speedFactor * 0.8);
    mars.position.z = sunGroup.position.z + 130 * Math.sin(Date.now() * speedFactor * 0.8);

    jupiter.position.x = sunGroup.position.x + 175 * Math.cos(Date.now() * speedFactor * 4);
    jupiter.position.z = sunGroup.position.z + 175 * Math.sin(Date.now() * speedFactor * 4);

    saturn.position.x = sunGroup.position.x + 240 * Math.cos(Date.now() * speedFactor * 3.5);
    saturn.position.z = sunGroup.position.z + 240 * Math.sin(Date.now() * speedFactor * 3.5);

    uranus.position.x = sunGroup.position.x + 280 * Math.cos(Date.now() * speedFactor * 1.5);
    uranus.position.z = sunGroup.position.z + 280 * Math.sin(Date.now() * speedFactor * 1.5);

    neptune.position.x = sunGroup.position.x + 320 * Math.cos(Date.now() * speedFactor * 1.2);
    neptune.position.z = sunGroup.position.z + 320 * Math.sin(Date.now() * speedFactor * 1.2);

    const speedFactor2 = 0.001;
    sunGroup.rotation.y += speedFactor2 * 1;
    mercury.rotation.y += speedFactor2 * 5;
    venus.rotation.y += speedFactor2 * -2;
    earth.rotation.y += speedFactor2 * 1;
    mars.rotation.y += speedFactor2 * 0.8;
    jupiter.rotation.y += speedFactor2 * 4;
    saturn.rotation.y += speedFactor2 * 3.5;
    uranus.rotation.y += speedFactor2 * 1.5;
    neptune.rotation.y += speedFactor2 * 1.2;
}

function checkHover(){
    raycaster.setFromCamera(mouse, camera);

    const objectsToTest = [sunGroup, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune];
    const intersects = raycaster.intersectObjects(objectsToTest, true);

    if(intersects.length > 0){
        const intersectedObject = intersects[0].object;

        let parentGroup = intersectedObject;
        while(parentGroup.parent && !objectsToTest.includes(parentGroup)){
            parentGroup = parentGroup.parent;
        }

        if(hoveredObject != parentGroup){
            if(hoveredObject){
                hoveredObject.traverse((node) =>{
                    if(node.isMesh && originalColors.has(node)){
                        node.material.color.set(originalColors.get(node));
                    }
                })
                if(label){
                    scene.remove(label);
                }
            }

            hoveredObject = parentGroup;

            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            hoveredObject.traverse((node) => {
                if(node.isMesh){
                    if(!originalColors.has(node)){
                        originalColors.set(node, node.material.color.clone());
                    }
                    node.material.color.set(randomColor);
                }
            });

            const labelColor = colors[Math.floor(Math.random() * colors.length)];
            label = createTextSprite(intersectedObject.userData.id, labelColor);
            label.position.set(
                hoveredObject.position.x,
                hoveredObject.position.y + 45,
                hoveredObject.position.z
            );
            scene.add(label);
        }
    }else{
        if(hoveredObject){
            hoveredObject.traverse((node) =>{
                if(node.isMesh && originalColors.has(node)){
                    node.material.color.set(originalColors.get(node));
                }
            });

            if (label) {
                scene.remove(label);
                label = null;
            }

            hoveredObject = null;
        }
    }
}

function createTextSprite(text, color = '#FFFFFF') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    const fontSize = 2000;

    context.font = `${fontSize}pt Arial`;

    const textWidth = context.measureText(text).width;

    canvas.width = Math.max(textWidth, 1000);
    canvas.height = fontSize * 2;

    context.font = `${fontSize}pt Arial`;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(10, 5, 1);

    return sprite;
}

function render () {
    requestAnimationFrame(render)
    rndr.render(scene, selectedCamera)
    control.update()

    checkHover()
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