var stats, clock;
var scene, camera, renderer, mixer;
var keyFrameTimes;
var keyFrameVectors;
var keyFrameQuaternion;
var clipAction;

var reqInterval = window.setInterval(update, 20);

pathToKeyframes(path);
initiateAnimation();

function update() {
  if (clipAction !== undefined && clipAction.enabled) {
    requestAnimationFrame( renderAnimation );
  }
}

function animatePath(path) {
  pathToKeyframes(path);
  initiateAnimation();
}

//Get keyframe arrays from path.js
function getColumn(matrix, col){
  var column = [];
  for(var i=0; i<matrix.length; i++){
    column.push(matrix[i][col]);
  }
  return column;
}

function pathToKeyframes(path) {
  keyFrameTimes = getColumn(path, 0);
  keyFrameTimes = keyFrameTimes.map(function (x) {
    return parseFloat(x);
  });

  keyFrameVectors = path.map(function(val){
    return val.slice(1, 4);
  });

  keyFrameVectors = keyFrameVectors.map(function(val) {
    return [val[0], val[2], val[1]];
  });

  keyFrameVectors = [].concat(...keyFrameVectors);

  keyFrameVectors = keyFrameVectors.map(function (x) {
    return parseFloat(x);
  });

  keyFrameQuaternion = path.map(function(val){
    return val.slice(4, 7);
  });

  keyFrameQuaternion = keyFrameQuaternion.map(function (val) {
    var euler = new THREE.Euler( val[0], val[2], val[1], 'XYZ' );
    var quaternion = new THREE.Quaternion().setFromEuler(euler);
    return [quaternion.x, quaternion.y, quaternion.z, quaternion.w];
  });

  keyFrameQuaternion = [].concat(...keyFrameQuaternion);
}

//
function sceneSoccerField() {
  //Floor
  var soccerfieldWidth = 10;
  var soccerfieldLength = 1.5 * soccerfieldWidth;
  var soccerfieldThickness = 0.1;
  var floorGeometry = new THREE.CubeGeometry(soccerfieldLength,soccerfieldThickness,soccerfieldWidth);
  var floorTexture = new THREE.TextureLoader().load('img/soccerfield v2.png');
  floorTexture.minFilter = THREE.LinearFilter;
  var floorMaterial = new THREE.MeshLambertMaterial( { map: floorTexture, side:THREE.DoubleSide } );
  var floorCube = new THREE.Mesh( floorGeometry, floorMaterial );
  //Receive shadow from drone
  floorCube.receiveShadow = true;
  scene.add( floorCube );

  var goalWidth = 1.4;
  var goalHeight = .5;
  var goalThickness = .1;

  function createPole() {
    var poleGeometry = new THREE.CubeGeometry(goalThickness,goalHeight,goalThickness);
    var poleMaterial = new THREE.MeshLambertMaterial( { map: new THREE.TextureLoader().load('img/shinypost.jpg'), side:THREE.DoubleSide } );
    return new THREE.Mesh( poleGeometry, poleMaterial );
  }

  function createGoal() {
    var crossbarGeometry = new THREE.CubeGeometry(goalThickness,goalThickness,goalWidth);
    var goalMaterial = new THREE.MeshLambertMaterial( { map: new THREE.TextureLoader().load('img/shinypost.jpg'), side:THREE.DoubleSide } );
    var crossbar = new THREE.Mesh( crossbarGeometry, goalMaterial );

    var leftPole = createPole();
    leftPole.position.z = -(goalWidth-goalThickness)/2;
    leftPole.position.y = -(goalHeight+goalThickness)/2;

    var rightPole = createPole();
    rightPole.position.z = (goalWidth-goalThickness)/2;
    rightPole.position.y = -(goalHeight+goalThickness)/2;

    var goal = new THREE.Group();

    goal.add(leftPole);
    goal.add(rightPole);
    goal.add(crossbar);

    return goal;
  }

  var leftGoal = createGoal();
  leftGoal.position.x = -(soccerfieldLength/2-1.05);
  leftGoal.position.y = goalHeight+goalThickness;
  scene.add(leftGoal);

  var rightGoal = createGoal();
  rightGoal.position.x = (soccerfieldLength/2-1.05);
  rightGoal.position.y = goalHeight+goalThickness;
  scene.add(rightGoal);
}

//Using clipaction.paused will stop just this clip, clock will stop all animation (as it is used by all clip mixers)
function setAnimationPaused(pause) {
  clipAction.paused = pause;
}

function setAnimationTime(time) {
  clipAction.time = time;
}

function initiateAnimation() {
  scene = new THREE.Scene();

  //Setup camera
  camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set( 5, 3, 5 );
  camera.lookAt( scene.position );

  sceneSoccerField();

  //Axes helper
  var axesHelper = new THREE.AxesHelper( 20 );
  scene.add( axesHelper );

  //Load drone mesh
  var loader = new THREE.OBJLoader();
  var drone = new THREE.Object3D();
  loader.load('models/Avular_V2_Zero.obj', function( object ) {
    //Scale from mm to meters
    object.scale.set(.001,.001,.001);

    var mat = new THREE.MeshLambertMaterial({
      //vertexColors: THREE.FaceColors,
      overdraw: 0.5,
      color: 0XCCCCCC
    });

    object.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.material = mat;
        //Add shadows from drone but not receive shadows
        child.castShadow = true;
        child.receiveShadow = false;
      }
      drone = object;
    });

    scene.add( drone );

    //Section animation
    var positionKF = new THREE.VectorKeyframeTrack( '.position', keyFrameTimes, keyFrameVectors );
    var quaternionKF = new THREE.QuaternionKeyframeTrack( '.quaternion', keyFrameTimes, keyFrameQuaternion );
    var clip = new THREE.AnimationClip( 'Action', keyFrameTimes, [ quaternionKF, positionKF] );
    mixer = new THREE.AnimationMixer( drone );
    clipAction = mixer.clipAction( clip );
    clipAction.play();
  });

  //Light
  var hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .7)
  scene.add( hemisphereLight );

  //Create a DirectionalLight and turn on shadows for the light
  var light = new THREE.DirectionalLight( 0xffffff, .7);
  light.position.set( 0, 8, 0 );
  light.castShadow = true;            // default false
  scene.add( light );

  //Set up shadow properties for the light
  light.shadow.mapSize.width = 1024;  // default
  light.shadow.mapSize.height = 1024; // default

  light.shadow.camera.left = -20/2;
  light.shadow.camera.right = 20/2;
  light.shadow.camera.top = 10;
  light.shadow.camera.bottom = -10;
  light.shadow.camera.near = 0.5;    // default
  light.shadow.camera.far = 1000;     // default

  var helper = new THREE.CameraHelper( light.shadow.camera );
  //scene.add( helper );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  //Enable shadows
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  controls = new THREE.OrbitControls( camera, renderer.domElement );

  //Stats
  stats = new Stats();
  document.body.appendChild( stats.dom );

  clock = new THREE.Clock();

  window.addEventListener( 'resize', onWindowResize, false );
}

//draw scene
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function renderAnimation() {
  var delta = clock.getDelta();
  if ( mixer ) {
    mixer.update( delta );
  }
  renderer.render( scene, camera );
  stats.update();
}
