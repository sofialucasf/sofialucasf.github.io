import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from 'three/addons/webxr/VRButton.js';


//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

let scene, renderer;
let activeCamera ,perspectiveCamera, stereoCamera, fixedcamera, controls;

let usingPerspectiveCamera = true;
let usingFixedCamera = false;

const clock = new THREE.Clock();

const house = new THREE.Group();
const trees = new THREE.Group();
const ovni = new THREE.Group();

const ovniRotationSpeed = 1;
const ovniMovingSpeed = 100;
const diagSpeed = ovniMovingSpeed / Math.sqrt(2);

const meshList = [];

let bufferZone = 20;
let heightLeveling = -60;
let ovniMovingUp = 0;
let ovniMovingDown = 0;
let ovniMovingLeft = 0;
let ovniMovingRight = 0;

let spotLight;
let spotLightOn = true;
let bottomPointLights = [];
let pointLightOn = true;

let groundMap = generateFloralTexture();
let skyMap = generateStarrySkyTexture(); 

let globalLight
let globalLightOn = true;

const COLORS = {
    blue: {
      light: 'lightblue',
      normal: 'blue',
      dark: 'darkblue'
    },
    red: {
      light: 'lightcoral',
      normal: 'firebrick',
      dark: 'darkred'
    },
    grey: {
      light: 'lightgray',
      normal: 'gray',
      dark: 'dimgray'
    },
    yellow: {
      light: 'lightyellow',
      normal: 'yellow',
      dark: 'goldenrod'
    },
    black: {
      tire: '#111111',
      dark: '#222222',
      normal: '#333333',
      light: '#555555'
    }
};

let heightMap = new THREE.TextureLoader().load('../heightmap.png');
    heightMap.wrapS = heightMap.wrapT = THREE.RepeatWrapping;

let groundLambertMaterial = new THREE.MeshLambertMaterial({ 
    side: THREE.DoubleSide,
    flatShading : true
});

let groundPhongMaterial = new THREE.MeshPhongMaterial({ 
    side: THREE.DoubleSide 
});

let groundToonMaterial = new THREE.MeshToonMaterial({ 
    side: THREE.DoubleSide 
});

let groundBasicMaterial = new THREE.MeshBasicMaterial({ 
    side: THREE.DoubleSide 
});

let groundMaterial = groundLambertMaterial;


// Sky materials (BackSide so it surrounds the scene)
let skyLambertMaterial = new THREE.MeshLambertMaterial({ 
    side: THREE.BackSide,
    flatShading : true
});

let skyPhongMaterial = new THREE.MeshPhongMaterial({ 
    side: THREE.BackSide 
});

let skyToonMaterial = new THREE.MeshToonMaterial({ 
    side: THREE.BackSide 
});

let skyBasicMaterial = new THREE.MeshBasicMaterial({ 
    side: THREE.BackSide 
});

let skyMaterial = skyLambertMaterial;

let moonLambertMaterial = new THREE.MeshLambertMaterial({
    color: COLORS.grey.light,
    emissive: 'white',
    emissiveIntensity: 5,
    flatShading: true
});

let moonPhongMaterial = new THREE.MeshPhongMaterial({
    color: COLORS.grey.light,
    emissive: 'white',
    emissiveIntensity: 5
});

let moonToonMaterial = new THREE.MeshToonMaterial({
    color: COLORS.grey.light,
    emissive: 'white',
    emissiveIntensity: 5
});

let moonBasicMaterial = new THREE.MeshBasicMaterial({
    color: COLORS.grey.light,
});

let moonMaterial = moonLambertMaterial;

// BasicMaterial
const wallMatBasic = new THREE.MeshBasicMaterial({ color: 0xf5f5dc});
const wallMatDetailBasic = new THREE.MeshBasicMaterial({ color: 0x0000ff});
const roofMatBasic = new THREE.MeshBasicMaterial({ color: 0xffa500});
const doorMatBasic = new THREE.MeshBasicMaterial({ color: 0x632e00});
const windowMatBasic = new THREE.MeshBasicMaterial({ color: 0x005eff});
const ovniBodyMatBasic = new THREE.MeshBasicMaterial({ color: 0x909090});
const ovniCylinderMatBasic = new THREE.MeshBasicMaterial({ color: 0x707070});
const ovniGlassMatBasic = new THREE.MeshBasicMaterial({ color: 0x70c6ff});
const ovniLightsMatBasic = new THREE.MeshBasicMaterial({color: 0xfff838});
const trunkMatBasic = new THREE.MeshBasicMaterial({ color: 0xCC6600});
const leafsMatBasic = new THREE.MeshBasicMaterial({ color: 0x2b9448});

// LambertMaterial
const wallMatLambert = new THREE.MeshLambertMaterial({ color: 0xf5f5dc, flatShading : true });
const wallMatDetailLambert = new THREE.MeshLambertMaterial({ color: 0x0000ff, flatShading : true });
const roofMatLambert = new THREE.MeshLambertMaterial({ color: 0xffa500, flatShading : true });
const doorMatLambert = new THREE.MeshLambertMaterial({ color: 0x632e00, flatShading : true });
const windowMatLambert = new THREE.MeshLambertMaterial({ color: 0x005eff, flatShading : true });
const ovniBodyMatLambert = new THREE.MeshLambertMaterial({ color: 0x909090, flatShading : true });
const ovniCylinderMatLambert = new THREE.MeshLambertMaterial({ color: 0x707070, flatShading : true });
const ovniGlassMatLambert = new THREE.MeshLambertMaterial({ color: 0x70c6ff, flatShading : true });
const ovniLightsMatLambert = new THREE.MeshLambertMaterial({color: 0xfff838, opacity: 0.4, flatShading : true, emissive: 0xfff838, emissiveIntensity: 1});
const trunkMatLambert = new THREE.MeshLambertMaterial({ color: 0xCC6600, flatShading : true });
const leafsMatLambert = new THREE.MeshLambertMaterial({ color: 0x2b9448, flatShading : true });

// PhongMaterial
const wallMatPhong = new THREE.MeshPhongMaterial({ color: 0xf5f5dc });
const wallMatDetailPhong = new THREE.MeshPhongMaterial({ color: 0x0000ff });
const roofMatPhong = new THREE.MeshPhongMaterial({ color: 0xffa500 });
const doorMatPhong = new THREE.MeshPhongMaterial({ color: 0x632e00 });
const windowMatPhong = new THREE.MeshPhongMaterial({ color: 0x005eff });
const ovniBodyMatPhong = new THREE.MeshPhongMaterial({ color: 0x909090 });
const ovniCylinderMatPhong = new THREE.MeshPhongMaterial({ color: 0x707070 });
const ovniGlassMatPhong = new THREE.MeshPhongMaterial({ color: 0x70c6ff });
const ovniLightsMatPhong = new THREE.MeshPhongMaterial({color: 0xfff838, emissive: 0xfff838, emissiveIntensity: 1});
const trunkMatPhong = new THREE.MeshPhongMaterial({ color: 0xCC6600 });
const leafsMatPhong = new THREE.MeshPhongMaterial({ color: 0x2b9448 });

//ToonMaterial
const wallMatToon = new THREE.MeshToonMaterial({ color: 0xf5f5dc });
const wallMatDetailToon = new THREE.MeshToonMaterial({ color: 0x0000ff });
const roofMatToon = new THREE.MeshToonMaterial({ color: 0xffa500 });
const doorMatToon = new THREE.MeshToonMaterial({ color: 0x632e00 });
const windowMatToon = new THREE.MeshToonMaterial({ color: 0x005eff });
const ovniBodyMatToon = new THREE.MeshToonMaterial({ color: 0x909090 });
const ovniCylinderMatToon = new THREE.MeshToonMaterial({ color: 0x707070 });
const ovniGlassMatToon = new THREE.MeshToonMaterial({ color: 0x70c6ff });
const ovniLightsMatToon = new THREE.MeshToonMaterial({color: 0xfff838, emissive: 0xfff838, emissiveIntensity: 1});
const trunkMatToon = new THREE.MeshToonMaterial({ color: 0xCC6600 });
const leafsMatToon = new THREE.MeshToonMaterial({ color: 0x2b9448 });

let wallMaterial = wallMatLambert;
let wallMaterialDetail = wallMatDetailLambert;
let roofMaterial = roofMatLambert;
let doorMaterial = doorMatLambert;
let windowMaterial = windowMatLambert;
let ovniBodyMaterial = ovniBodyMatLambert;
let ovniCylinderMaterial = ovniCylinderMatLambert;
let ovniGlassMaterial = ovniGlassMatLambert;
let ovniLightsMaterial = ovniLightsMatLambert;
let trunkMaterial = trunkMatLambert;
let leafsMaterial = leafsMatLambert;

let LambertOn = true;
let phongOn = false;
let toonOn = false;
let basicOn = false;

const houseCoords = {
    xMin: -147 - bufferZone, 
    xMax: -82 + bufferZone,  
    zMin: -85 - bufferZone,  
    zMax: -12 + bufferZone   
  };

/////////////////////
/* CREATE SCENE(S) */
/////////////////////

function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb0fcff);
}


/////////////////////
/* CREATE CAMERA(S)  */
/////////////////////
function createCameras() {
    const aspect = window.innerWidth / window.innerHeight;
    perspectiveCamera = new THREE.PerspectiveCamera(90, aspect, 0.1, 2000);
    perspectiveCamera.position.set(-160, 50, 200);
    perspectiveCamera.lookAt(0, 80, 0);

    fixedcamera = new THREE.PerspectiveCamera(90, aspect, 0.1, 2000);
    fixedcamera.position.set(-150, 150, 150);
    fixedcamera.lookAt(0, 50, 0);

    activeCamera = perspectiveCamera;
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createGroundFromHeightmap(url, onComplete) {
    const width = 500;
    const height = 500;
    const widthSegments = 100;
    const heightSegments = 100;

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = url;

    image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image,0,0);
        const pixelData = ctx.getImageData(0,0, image.width,image.height).data;

        const geometry = new THREE.PlaneGeometry(width,height, widthSegments, heightSegments);
        geometry.rotateX(-Math.PI/2);

        const vertices = geometry.attributes.position;
        const heightValues = [];

        for(let i = 0; i < vertices.count;i++) {
            const x = i%(widthSegments + 1);
            const y = Math.floor(i/ (widthSegments +1));

            const imgX = Math.floor((x/ widthSegments) *(image.width - 1));
            const imgY = Math.floor((y / heightSegments) *(image.height - 1));
            const idx = (imgY * image.width + imgX)* 4;

            const pixelHeight = pixelData[idx];
            const heightValue = (pixelHeight /255) *75;
            vertices.setY(i, heightValue);
            heightValues.push(heightValue);
        }

        vertices.needsUpdate = true;
        geometry.computeVertexNormals();

        let map = generateFloralTexture();

        groundLambertMaterial.map = groundMap;
        groundBasicMaterial.map = groundMap;
        groundPhongMaterial.map = groundMap;
        groundToonMaterial.map = groundMap;

        const mesh = new THREE.Mesh(geometry, groundMaterial);
        mesh.userData.type = 'ground';
        meshList.push(mesh);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.y = heightLeveling;

        mesh.getHeightAt = function (x, z) {
            const halfWidth = width/2;
            const halfHeight = height/2;
            const col = Math.floor(((x + halfWidth) /width) * widthSegments);
            const row = Math.floor(((z + halfHeight)/ height) * heightSegments);
            const index = row * (widthSegments + 1) + col;
            return heightValues[index];
        };

        if ( onComplete ) onComplete(mesh);
    };

}

function generateFloralTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');  

    ctx.fillStyle = '#2b9448';
    ctx.fillRect(0, 0, 512, 512);

    const colors = ['white', 'yellow', 'violet', 'lightblue'];
    for (let i = 0; i < 600; i++) {
        ctx.beginPath();
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = Math.random() * 2 + 1;
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
}

function generateStarrySkyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#000033');
    gradient.addColorStop(1, '#330033');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // Estrelas
    for (let i = 0; i < 600; i++) {
        ctx.beginPath();
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = Math.random() * 1 + 0.1;
        ctx.fillStyle = 'white';
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
}

function createSkyDome(){
    const skyGeometry = new THREE.SphereGeometry(250, 32, 32);
    skyGeometry.normalsNeedUpdate = true;

    skyLambertMaterial.map = skyMap;
    skyBasicMaterial.map = skyMap;
    skyPhongMaterial.map = skyMap;
    skyToonMaterial.map = skyMap;
    const skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
    skyDome.userData.type = "skyDome";
    meshList.push(skyDome);
    scene.add(skyDome);
}

function createMoon(){
    const moonGeometry = new THREE.SphereGeometry(20, 32, 32);
    moonGeometry.normalsNeedUpdate = true;

    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    moonMesh.userData.type = "moon";
    meshList.push(moonMesh);
    moonMesh.position.set(100, 170, 100);
    scene.add(moonMesh);
}

function createGlobalLight() {
    globalLight = new THREE.DirectionalLight('white', 1);
    globalLight.position.set(500, 500, 500);
    globalLight.lookAt(new THREE.Vector3(0, 0, 0));
    globalLight.castShadow = true;
    scene.add(globalLight);
};
 
function createWallFace(p1, p2, p3, p4, material) {
    const geom = new THREE.BufferGeometry();
    geom.normalsNeedUpdate = true;
    const verts = new Float32Array([
      ...p1, ...p2, ...p3,
      ...p3, ...p4, ...p1,
    ]);
    geom.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    geom.computeVertexNormals();
    return new THREE.Mesh(geom, material);
}  

  function createHouse(groundMesh){
    // House
    let mesh;

    // Walls
    mesh = createWallFace( [-20, 5 ,20], [20, 5 ,20], [20, 20 ,20], [-20, 20 ,20], wallMaterial);
    mesh.userData.type = "wall";
    meshList.push(mesh);
    house.add(mesh);

    mesh = createWallFace( [20, 0 ,20], [20, 0 ,-40], [20, 20 ,-40], [20, 20 ,20], wallMaterial);
    mesh.userData.type = "wall";
    meshList.push(mesh);
    house.add(mesh);

    mesh = createWallFace( [20, 0 ,-40], [-20, 0 ,-40], [-20, 20 ,-40], [20, 20 ,-40], wallMaterial);
    mesh.userData.type = "wall";
    meshList.push(mesh);
    house.add(mesh);

    mesh = createWallFace( [-20, 0 ,-40], [-20, 0 ,20], [-20, 20 ,20], [-20, 20 ,-40], wallMaterial);
    mesh.userData.type = "wall";
    meshList.push(mesh);
    house.add(mesh);

    // Details (bottom)
    mesh = createWallFace( [-20.05, 0 ,20.05], [20.05, 0 ,20.05], [20.05, 5 ,20.05], [-20.05, 5 ,20.05], wallMaterialDetail);
    mesh.userData.type = "detail";
    meshList.push(mesh);
    house.add(mesh);

    mesh = createWallFace( [20.05, 0 ,20.05], [20.05, 0 ,-40.05], [20.05, 5 ,-40.05], [20, 5 ,20.05], wallMaterialDetail);
    mesh.userData.type = "detail";
    meshList.push(mesh);
    house.add(mesh);

    mesh = createWallFace( [20.05, 0 ,-40.05], [-20.05, 0 ,-40.05], [-20.05, 5 ,-40.05], [20.05, 5 ,-40.05], wallMaterialDetail);
    mesh.userData.type = "detail";
    meshList.push(mesh);
    house.add(mesh);

    mesh = createWallFace( [-20.05, 0 ,-40.05], [-20.05, 0 ,20.05], [-20.05, 5 ,20.05], [-20.05, 5 ,-40.05], wallMaterialDetail);
    mesh.userData.type = "detail";
    meshList.push(mesh);
    house.add(mesh);

    // Roof
    mesh = createWallFace( [-20, 20 ,20] , [20, 20 ,20] , [0, 30 ,20] , [-20, 20 ,20] , wallMaterial);
    mesh.userData.type = "wall";
    meshList.push(mesh);
    house.add(mesh);

    mesh = createWallFace( [20, 20 ,20] , [20, 20 ,-40] , [0, 30 ,-40] , [0, 30 ,20] , roofMaterial);
    mesh.userData.type = "roof";
    meshList.push(mesh);
    house.add(mesh);

    mesh = createWallFace( [20, 20 ,-40], [-20, 20 ,-40] , [0, 30 ,-40] , [20, 20 ,-40] , wallMaterial);
    mesh.userData.type = "wall";
    meshList.push(mesh);
    house.add(mesh);

    mesh = createWallFace( [-20, 20 ,-40] , [-20, 20 ,20] , [0, 30 ,20] , [0, 30 ,-40], roofMaterial);
    mesh.userData.type = "roof";
    meshList.push(mesh);
    house.add(mesh);

    // Door
    mesh = createWallFace( [-5, 0 , 20.1] , [5, 0 , 20.1] , [5, 15 , 20.1] , [-5, 15 , 20.1], doorMaterial);
    mesh.userData.type = "door";
    meshList.push(mesh);
    house.add(mesh);
   
    // Windows Right
    mesh = createWallFace( [-20.1, 9 , -24] , [-20.1, 9 , -16], [-20.1, 17 , -16], [-20.1, 17 , -24], windowMaterial );
    mesh.userData.type = "window";
    meshList.push(mesh);
    house.add(mesh);
    mesh = createWallFace( [-20.1, 9 , -4] , [-20.1, 9 , 4], [-20.1, 17 , 4], [-20.1, 17 , -4], windowMaterial);
    mesh.userData.type = "window";
    meshList.push(mesh);
    house.add(mesh);
    // Windows Left
    mesh = createWallFace( [20.1, 9 , -16] , [20.1, 9 , -24] , [20.1, 17 , -24] , [20.1, 17 , -16], windowMaterial);
    mesh.userData.type = "window";
    meshList.push(mesh);
    house.add(mesh);
    mesh = createWallFace( [20.1, 9 , 4] , [20.1, 9 , -4] , [20.1, 17 , -4] , [20.1, 17 , 4], windowMaterial);
    mesh.userData.type = "window";
    meshList.push(mesh);
    house.add(mesh);

    const height = groundMesh.getHeightAt(-120,-40);
    house.position.set(-120,height + heightLeveling,-40);
    house.rotateY(Math.PI / 6);
    scene.add(house);
}

function addBottomLight(angle) {
    const radius = 30; 
    const lightDistance = radius * 0.9; 

    const x = lightDistance * Math.cos(angle);
    const z = lightDistance * Math.sin(angle);
    const y = -30 * 0.2; 

    const light = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 8), ovniLightsMaterial);
    light.userData.type = "ovniLight";
    meshList.push(light);
    light.normalsNeedUpdate = true;
    light.position.set(x, y, z);

    const pointLight = new THREE.PointLight(COLORS.yellow.light, 150, 1000);
    pointLight.position.set(x, y - 5, z);
    pointLight.castShadow = true;
    bottomPointLights.push(pointLight);
    ovni.add(pointLight);

    ovni.add(light);
}

function createOvni(){
    const ovniBody = new THREE.Mesh(new THREE.SphereGeometry(40), ovniBodyMaterial);
    ovniBody.userData.type = "ovniBody";
    meshList.push(ovniBody);
    ovniBody.normalsNeedUpdate = true;
    ovniBody.scale.set(1, 0.2,1);
    ovni.add(ovniBody);

    const ovniGlass = new THREE.Mesh(new THREE.SphereGeometry(22, 32, 16, 0, Math.PI * 2, 0, Math.PI/2), ovniGlassMaterial);
    ovniGlass.userData.type = "ovniGlass";
    ovniGlass.normalsNeedUpdate = true;
    meshList.push(ovniGlass);
    ovni.add(ovniGlass);

    const ovniCylinder = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 5), ovniCylinderMaterial);
    ovniCylinder.userData.type = "ovniCylinder";
    meshList.push(ovniCylinder);
    ovniCylinder.normalsNeedUpdate = true;
    ovniCylinder.position.set(0, -6, 0);
    ovni.add(ovniCylinder);

    spotLight = new THREE.SpotLight(0xffffff, 2, 300, Math.PI / 6, 0.1, 0);
    spotLight.position.set(0, -10, 0); // Just below the cylinder
    spotLight.target.position.set(0, -40, 0); // Pointing further down
    spotLight.castShadow = true;
    ovni.add(spotLight);
    ovni.add(spotLight.target);

    addBottomLight(0);
    addBottomLight(Math.PI / 4);
    addBottomLight(Math.PI / 2);
    addBottomLight(3 * Math.PI / 4);
    addBottomLight(Math.PI);
    addBottomLight(5 * Math.PI / 4);
    addBottomLight(3 * Math.PI / 2);
    addBottomLight(7 * Math.PI / 4);

    ovni.position.set(0, 120, -50);
    scene.add(ovni);
}

function createTree(x = 0, y = 0, z = 0, rot = 0, scalar = 1) {
    // Tronco grande
    const tree = new THREE.Group();

    const trunkGeo = new THREE.CylinderGeometry(0.5, 0.6, 5, 16);
    trunkGeo.normalsNeedUpdate = true;
    const trunk = new THREE.Mesh(trunkGeo, trunkMaterial);
    trunk.userData.type = "trunk";
    meshList.push(trunk);
    trunk.rotation.z = THREE.MathUtils.degToRad(10);
    trunk.position.y = 2.0;
    tree.add(trunk);

    // Ramo pequeno
    const branchGeo = new THREE.CylinderGeometry(0.2, 0.25, 2.5, 12);
    branchGeo.normalsNeedUpdate = true;
    const branch = new THREE.Mesh(branchGeo, trunkMaterial);
    branch.userData.type = "branch";
    meshList.push(branch);
    branch.rotation.z = THREE.MathUtils.degToRad(-30);
    branch.position.set(.8, 4, 0);
    tree.add(branch);

    // Copa 2 ou 3 elipsoides 
    const numElipsoids = Math.floor(Math.random() * 3) +1; 
    for (let i = 0; i < numElipsoids; i++) {
      const leafsGeo = new THREE.SphereGeometry(1.5, 16, 16);
        leafsGeo.normalsNeedUpdate = true;
        const leafs = new THREE.Mesh(leafsGeo, leafsMaterial);
        leafs.userData.type = "leafs";
        meshList.push(leafs);
        leafs.receiveShadow = true;
        leafs.scale.set(1.2, 0.8, 1.2);
        leafs.position.set((Math.random() - 0.5) * 1.5,
                         4.5 + i* 0.5,
                        (Math.random() - 0.5) * 1.5);
        tree.add(leafs);
    }
    tree.position.set(x,y,z);
    tree.scale.setScalar(scalar);
    tree.rotation.y =rot;
    trees.add(tree);
    
    return tree;
}

function createTrees(num,mesh) {
    const size = 360;
    
    for(let i = 0; i < num; i++){
        const width = Math.floor(Math.random() * (size + 1)) - size/2;
        const length = Math.floor(Math.random() * (size + 1)) - size/2;
        const height = mesh.getHeightAt(width,length);
        const rot = Math.floor(Math.random() * 360);
        const scalar = Math.floor(Math.random() * 10) + 5;
        
        
        if (houseCoords.xMin <= width && width <= houseCoords.xMax &&
            houseCoords.zMin <= length && length <= houseCoords.zMax){
                console.log("hit!");      
                continue
            }  
            
            createTree(width,height + heightLeveling,length,rot,scalar); 
        }  
        
    scene.add(trees);
}

function toggleOvniPointLights() {
    if (pointLightOn) {
        bottomPointLights.forEach((light, index) => {
            light.intensity = 150;
            ovniLightsMatLambert.emissiveIntensity = 1;
            ovniLightsMatPhong.emissiveIntensity = 1;
            ovniLightsMatToon.emissiveIntensity = 1;
            ovniLightsMaterial.emissiveIntensity = 1;        
        });
    }
    else {
        bottomPointLights.forEach((light, index) => {
            light.intensity = 0;
            ovniLightsMatLambert.emissiveIntensity = 0;
            ovniLightsMatPhong.emissiveIntensity = 0;
            ovniLightsMatToon.emissiveIntensity = 0;
            ovniLightsMaterial.emissiveIntensity = 0;
        });
    }
}

function toggleOvniSpotlight(){
    if(spotLightOn) {
        spotLight.intensity = 2;
    }
    else {
        spotLight.intensity = 0;
    }
}

function toggleGlobalLight(){
    if(globalLightOn){
        globalLight.intensity = 1;
    }
    else{
        globalLight.intensity = 0;
    }
}

function switchMaterial(){
    if (LambertOn){
        groundMaterial = groundLambertMaterial;
        skyMaterial = skyLambertMaterial;
        wallMaterial = wallMatLambert;
        wallMaterialDetail = wallMatDetailLambert;
        roofMaterial = roofMatLambert;
        doorMaterial = doorMatLambert;
        windowMaterial = windowMatLambert;
        ovniBodyMaterial = ovniBodyMatLambert;
        ovniCylinderMaterial = ovniCylinderMatLambert;
        ovniGlassMaterial = ovniGlassMatLambert;
        ovniLightsMaterial = ovniLightsMatLambert;
        trunkMaterial = trunkMatLambert;
        leafsMaterial = leafsMatLambert;
        moonMaterial = moonLambertMaterial;
    }
    else if(phongOn){
        groundMaterial = groundPhongMaterial;
        skyMaterial = skyPhongMaterial;
        wallMaterial = wallMatPhong;
        wallMaterialDetail = wallMatDetailPhong;
        roofMaterial = roofMatPhong;
        doorMaterial = doorMatPhong;
        windowMaterial = windowMatPhong;
        ovniBodyMaterial = ovniBodyMatPhong;
        ovniCylinderMaterial = ovniCylinderMatPhong;
        ovniGlassMaterial = ovniGlassMatPhong;
        ovniLightsMaterial = ovniLightsMatPhong;
        trunkMaterial = trunkMatPhong;
        leafsMaterial = leafsMatPhong;
        moonMaterial = moonPhongMaterial;
    }
    else if(toonOn){ 
        groundMaterial = groundToonMaterial;
        skyMaterial = skyToonMaterial;
        wallMaterial = wallMatToon;
        wallMaterialDetail = wallMatDetailToon;
        roofMaterial = roofMatToon;
        doorMaterial = doorMatToon;
        windowMaterial = windowMatToon;
        ovniBodyMaterial = ovniBodyMatToon;
        ovniCylinderMaterial = ovniCylinderMatToon;
        ovniGlassMaterial = ovniGlassMatToon;
        ovniLightsMaterial = ovniLightsMatToon;
        trunkMaterial = trunkMatToon;
        leafsMaterial = leafsMatToon;
        moonMaterial = moonToonMaterial;
    }
    else if(basicOn){
        groundMaterial = groundBasicMaterial;
        skyMaterial = skyBasicMaterial;
        wallMaterial = wallMatBasic;
        wallMaterialDetail = wallMatDetailBasic;
        roofMaterial = roofMatBasic;
        doorMaterial = doorMatBasic;
        windowMaterial = windowMatBasic;
        ovniBodyMaterial = ovniBodyMatBasic;
        ovniCylinderMaterial = ovniCylinderMatBasic;
        ovniGlassMaterial = ovniGlassMatBasic;
        ovniLightsMaterial = ovniLightsMatBasic;
        trunkMaterial = trunkMatBasic;
        leafsMaterial = leafsMatBasic;
        moonMaterial = moonBasicMaterial;
    }

    for (let i = 0; i < meshList.length; i++) {
        switch (meshList[i].userData.type) {
            case "ground":
                meshList[i].material = groundMaterial;
                break;
            case "wall":
                meshList[i].material = wallMaterial;
                break;
            case "detail":
                meshList[i].material = wallMaterialDetail;
                break;
            case "roof":
                meshList[i].material = roofMaterial;
                break;
            case "door":
                meshList[i].material = doorMaterial;
                break;
            case "window":
                meshList[i].material = windowMaterial;
                break;
            case "ovniBody":
                meshList[i].material = ovniBodyMaterial;
                break;
            case "ovniGlass":
                meshList[i].material = ovniGlassMaterial;
                break;
            case "ovniCylinder":
                meshList[i].material = ovniCylinderMaterial;
                break;
            case "ovniLight":
                meshList[i].material = ovniLightsMaterial;
                break;
            case "trunk":
                meshList[i].material = trunkMaterial;
                break;
            case "leafs":
                meshList[i].material = leafsMaterial;
                break
            case "branch":
                meshList[i].material = trunkMaterial;
                break;
            case "skyDome":
                meshList[i].material = skyMaterial;
                break;
            case "moon":
                meshList[i].material = moonMaterial;
                break;
                
        }
        meshList[i].material.needsUpdate = true;
    }
}

////////////
/* UPDATE */
////////////
function update() {
    controls.update();
    const delta = clock.getDelta();
    ovni.rotation.y += ovniRotationSpeed * delta;

    let moveX = ovniMovingUp - ovniMovingDown;
    let moveZ = ovniMovingRight - ovniMovingLeft;

    if (moveX !== 0 && moveZ !== 0) {
        ovni.position.x += moveX * diagSpeed * delta;
        ovni.position.z += moveZ * diagSpeed * delta;
    } else {
        ovni.position.x += moveX * ovniMovingSpeed * delta;
        ovni.position.z += moveZ * ovniMovingSpeed * delta;
    }
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(renderer));
    createScene();
    createGroundFromHeightmap('heightmap.png', groundMesh => {
        scene.add(groundMesh);
        createTrees(20,groundMesh);
        createHouse(groundMesh);
    });
    createCameras();
    createSkyDome();
    createMoon();
    createGlobalLight();
    createOvni();  
    renderer.setAnimationLoop(() => {
        update();
        render();
    });

    controls = new OrbitControls(perspectiveCamera, renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);
}


/////////////
/* DISPLAY */
/////////////
function render() {
    renderer.render(scene, activeCamera);
}

/////////////////////
/* RESIZE HANDLER  */
/////////////////////
function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);

    const aspect = window.innerWidth / window.innerHeight;

    perspectiveCamera.aspect = aspect;
    perspectiveCamera.updateProjectionMatrix();

    fixedcamera.aspect = aspect;
    fixedcamera.updateProjectionMatrix();
}

/////////////////////
/* CAMERA SWITCHING */
/////////////////////
function onKeyDown(event) {
    switch (event.key.toLowerCase()){
        case '1':
            groundMap = generateFloralTexture();
            groundLambertMaterial.map = groundMap;
            groundPhongMaterial.map = groundMap;
            groundToonMaterial.map = groundMap;
            groundBasicMaterial.map = groundMap;
            groundMaterial.map.needsUpdate = true;
            break;
        case '2':
            skyMap = generateStarrySkyTexture();
            skyLambertMaterial.map = skyMap;
            skyPhongMaterial.map = skyMap;
            skyToonMaterial.map = skyMap;
            skyBasicMaterial.map = skyMap;
            skyMaterial.map.needsUpdate = true;
            break;
        case 'arrowup':
            ovniMovingUp = 1;
            break;
        case 'arrowdown':
            ovniMovingDown = 1;
            break;
        case 'arrowleft':
            ovniMovingLeft = 1;
            break;
        case 'arrowright':
            ovniMovingRight = 1;
            break;
        case 's':
            spotLightOn = !spotLightOn;
            toggleOvniSpotlight();
            break;
        case 'p':
            pointLightOn = !pointLightOn;
            toggleOvniPointLights();
            break;
        case 'd':
            globalLightOn = !globalLightOn;
            toggleGlobalLight();
            break;
        case 'q':
            if(LambertOn){break;}
            LambertOn = true;
            phongOn = false;
            toonOn = false;
            basicOn = false;
            switchMaterial();
            break;
        case 'w':
            if(phongOn){break;}
            LambertOn = false;
            phongOn = true;
            toonOn = false;
            basicOn = false;
            switchMaterial();
            break;
        case 'e':
            if(toonOn){break;}
            LambertOn = false;
            phongOn = false;
            toonOn = true;
            basicOn = false;
            switchMaterial();
            break;
        case 'r':
            if(basicOn){break;}
            LambertOn = false;
            phongOn = false;
            toonOn = false;
            basicOn = true;
            switchMaterial();
            break;
        case '7':
            usingFixedCamera = !usingFixedCamera;
            usingPerspectiveCamera = !usingPerspectiveCamera;
            if (usingFixedCamera) {
                activeCamera = fixedcamera;
            } else {
                activeCamera = perspectiveCamera;
            }
    }
}

function onKeyUp(event) {
    switch (event.key.toLowerCase()){
        case 'arrowup':
            ovniMovingUp = 0;
            break;
        case 'arrowdown':
            ovniMovingDown = 0;
            break;
        case 'arrowleft':
            ovniMovingLeft = 0;
            break;
        case 'arrowright':
            ovniMovingRight = 0;
            break;
    }
}

init();
