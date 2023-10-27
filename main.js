import "./style.css";
import {
	ACESFilmicToneMapping,
	AmbientLight,
	AxesHelper,
	BoxGeometry,
	Color,
	DirectionalLight,
	DirectionalLightHelper,
	EquirectangularReflectionMapping,
	FogExp2,
	HemisphereLight,
	Mesh,
	MeshStandardMaterial,
	OrthographicCamera,
	PerspectiveCamera,
	PointLight,
	ReinhardToneMapping,
	SRGBColorSpace,
	Scene,
	SpotLight,
	SpotLightHelper,
	TextureLoader,
	Vector2,
	WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";

let width = window.innerWidth;
let height = window.innerHeight;
const canvas = document.querySelector("#canvas");
const renderer = new WebGLRenderer({ antialias: true, canvas });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x11151c);

const fov = 75;
const aspect = width / height; // the canvas default
const near = 0.1;
const far = 100;
const camera = new PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 0, 7);

const controls = new OrbitControls(camera, canvas);

const scene = new Scene();

const pointlight = new PointLight(0x85ccb8, 50, 10);
pointlight.position.set(0, 3, 2);
scene.add(pointlight);
const pointlight2 = new PointLight(0x9f85cc, 50, 10);
pointlight2.position.set(0, 3, 2);
scene.add(pointlight2);
// const dLight = new DirectionalLight(0xffffff, 3);
// dLight.position.set(2, 4, 10);
// scene.add(dLight);
// const light = new SpotLight(0xffffff, 400, 20, 10, 1);
// light.position.set(0, 6, 1);
// scene.add(light);

// create a new RGBELoader to import the HDR
const hdrEquirect = new RGBELoader()
	// add your HDR //
	.setPath("/")
	.load("ml_gradient_freebie_01.hdr", function () {
		hdrEquirect.mapping = EquirectangularReflectionMapping;
	});
scene.environment = hdrEquirect;
scene.fog = new FogExp2(0x11151c, 0.15);

const loader = new TextureLoader();

const baseColorMap1 = loader.load(
	"https://miroleon.github.io/daily-assets/porcelain/textures/Porcelain_Map1_BaseColor.png"
);
const metallicMap1 = loader.load(
	"https://miroleon.github.io/daily-assets/porcelain/textures/Porcelain_Map1_Metallic.png"
);
const normalMap1 = loader.load("https://miroleon.github.io/daily-assets/porcelain/textures/Porcelain_Map1_Normal.png");
const roughnessMap1 = loader.load(
	"https://miroleon.github.io/daily-assets/porcelain/textures/Porcelain_Map1_Roughness.png"
);
const aoMap1 = loader.load("https://miroleon.github.io/daily-assets/porcelain/textures/Porcelain_Map1_ao.png");

const material1 = new MeshStandardMaterial({
	map: baseColorMap1,
	metalnessMap: metallicMap1,
	normalMap: normalMap1,
	roughnessMap: roughnessMap1,
	aoMap: aoMap1,
	envMap: hdrEquirect,
	envMapIntensity: 10,
});

const baseColorMap2 = loader.load(
	"https://miroleon.github.io/daily-assets/porcelain/textures/Porcelain_Map2_BaseColor.png"
);
const metallicMap2 = loader.load(
	"https://miroleon.github.io/daily-assets/porcelain/textures/Porcelain_Map2_Metallic.png"
);
const normalMap2 = loader.load("https://miroleon.github.io/daily-assets/porcelain/textures/Porcelain_Map2_Normal.png");
const roughnessMap2 = loader.load(
	"https://miroleon.github.io/daily-assets/porcelain/textures/Porcelain_Map2_Roughness.png"
);
const aoMap2 = loader.load("https://miroleon.github.io/daily-assets/porcelain/textures/Porcelain_Map2_ao.png");

const material2 = new MeshStandardMaterial({
	map: baseColorMap2,
	metalnessMap: metallicMap2,
	normalMap: normalMap2,
	roughnessMap: roughnessMap2,
	aoMap: aoMap2,
	envMap: hdrEquirect,
	envMapIntensity: 10,
});

const gltfLoader = new GLTFLoader();
const url = "/gameready_colt_python_revolver/scene.gltf";
gltfLoader.load(url, (gltf) => {
	// gltf.scene.children[0].material = material1;
	// gltf.scene.children[1].material = material2;
	const model = gltf.scene.children[0];
	model.material = material2;
	model.scale.setScalar(28);
	model.rotation.set(1.6, 3.1, 1.55);
	scene.add(model);
});

// POST PROCESSING
// define the composer
let composer;
// define/add the RenderPass
const renderScene = new RenderPass(scene, camera);

// add the afterimagePass
const afterimagePass = new AfterimagePass();
// for my taste, anything between 0.85 and 0.95 looks good, but your milage may vary
afterimagePass.uniforms["damp"].value = 0.9;

// add the paramters for your bloom
// play around with the values to make it fit your scene
// note that you might want to consider the bi-directional effect between Fog and Bloom
const bloomparams = {
	exposure: 1,
	bloomStrength: 1,
	bloomThreshold: 0.1,
	bloomRadius: 1,
};

// add a new UnrealBloomPass and add the values from the parameters above
const bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = bloomparams.bloomThreshold;
bloomPass.strength = bloomparams.bloomStrength;
bloomPass.radius = bloomparams.bloomRadius;

// finally, create a new EffectComposer and add the different effects
composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(afterimagePass);
composer.addPass(bloomPass);

function resizeRendererToDisplaySize(renderer) {
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	const needResize = canvas.width !== width || canvas.height !== height;
	if (needResize) {
		renderer.setSize(width, height, false);
	}
	return needResize;
}

function render(time) {
	// time *= 0.001;

	if (resizeRendererToDisplaySize(renderer)) {
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		camera.updateProjectionMatrix();
	}
	// renderer.render(scene, camera);
	composer.render();
	requestAnimationFrame(render);
}
requestAnimationFrame(render);
