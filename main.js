import './style.css'
import * as THREE from "three";

//canvas
const canvas = document.querySelector("#webgl");

//scene
const scene = new THREE.Scene();

//背景用のテクスチャ
const textureLoader = new THREE.TextureLoader(); //TextureLoaderクラスでテクスチャをロードする
const bgTexture = textureLoader.load("bg/bg.jpg"); //bgTexture変数にTextureLoaderのload関数で画像を指定する
scene.background = bgTexture;

//size
const sizes = {
  width:innerWidth,
  height:innerHeight
};

//camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width/ sizes.height,
  0.1,
  1000
);

//renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width,sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

//オブジェクトを作成
const boxGeometry = new THREE.BoxGeometry(5,5,5,10);
const boxMaterial = new THREE.MeshNormalMaterial();
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.set(0,0.5,-15);
box.rotation.set(1,1,0);

const torusGeometry = new THREE.TorusGeometry(8,2,16,100);
const torusMaterial = new THREE.MeshNormalMaterial();
const torus = new THREE.Mesh(torusGeometry,torusMaterial);
torus.position.set(0,1,10);

scene.add(box, torus);

//線形補間で滑らかに移動させる
function lerp(x,y,a){
  return (1-a) * x + a * y; //xがスタート地点、yがゴール地点、aの値で滑らかさを決める（一つの数字ではなく関数にする）
}

function scalePercent(start,end){
  return (scrollPercent - start) / (end -start); 
}

//スクロールアニメーション
const animationScripts =[];

animationScripts.push({
  start:0,
  end:40, //画面40%の位置
  function(){ //0～40%の位置で実行する内容
    camera.lookAt(box.position); //カメラの向いてほしい位置→boxの方向
    camera.position.set(0,1,10); //カメラの位置をz方向の手前に変える
    box.position.z = lerp(-15,2,scalePercent(0,40));
    torus.position.z = lerp(10,-20,scalePercent(0,40));

    //box.position.z += 0.01; //positionを0.01動かす
  },
});

animationScripts.push({
  start:40,
  end:60,
  function(){
    camera.lookAt(box.position);
    camera.position.set(0,1,10);
    box.rotation.z = lerp(1,Math.PI, scalePercent(40,60)); //Math.PI（半回転）だけ回転
  },
});

animationScripts.push({
  start:60,
  end:80,
  function(){
    camera.lookAt(box.position);
    camera.position.x = lerp(0,-15,scalePercent(60,80));
    camera.position.y = lerp(1,15,scalePercent(60,80));
    camera.position.z = lerp(10,25,scalePercent(60,80));
  },
});

animationScripts.push({
  start:80,
  end:100,
  function(){
    camera.lookAt(box.position);
    box.rotation.x += 0.02;
    box.rotation.y += 0.02;
  },
});


//アニメーションを開始
function playScrollAnimation(){
  animationScripts.forEach((animation) => {
    if(scrollPercent >= animation.start && scrollPercent < animation.end)
    animation.function();
  });
}

//ブラウザのスクロール率（自分がどこにいるのか）を取得
let scrollPercent = 0;

document.body.onscroll =() =>{ //スクロールのトリガー
  scrollPercent = 
    (document.documentElement.scrollTop / //scrollTop →　スクロールできるエリアの一番上とブラウザの一番上の距離
    (document.documentElement.scrollHeight - //scrollHeight　→　スクロールできるエリア全体の縦
      document.documentElement.clientHeight))* //clientHeight　→　ブラウザの縦
      100;

      //console.log(scrollPercent);
};


//animation
const tick = () =>{
  window.requestAnimationFrame(tick);
  playScrollAnimation();
  renderer.render(scene, camera);
};

tick();

//ブラウザのリサイズに対応
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(window.devicePixelRatio);
});
