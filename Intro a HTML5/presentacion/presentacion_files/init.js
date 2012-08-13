	if (!Detector.webgl) {
			Detector.addGetWebGLMessage();
			document.getElementById('container').innerHTML = "";
		}

		var TO_RADIANS = Math.PI / 180;
		var theta = 0;

		var SCREEN_WIDTH = window.innerWidth;
		var SCREEN_HEIGHT = window.innerHeight;

		var viewportWidth = 1080;
		var viewportHeight = 800;

		var container, stats;
		var projector, camera, scene, renderer, quadTarget;

		//post processing
		var sceneRenderTarget, postRenderTarget, cameraOrtho;
		var postprocessing = {
			enabled : true
		};

		//textures/materials
		var urls = [];
		var cubeMap;
		var skyTextures = [];
		var displacementMaterial, noiseMaterial, noiseMap;

		//demo specific
		var sphereRadius = 103;
		var properties, noiseUniforms, displacementUniforms;
		var ballContainer, orb, dome, boltGeometry;
		var intersectionPoint, intersectNormal;
		var bolts = [];
		var controlBolts = [];
		var mouse2d = new THREE.Vector3(0, 0, 0);

		//start engine and loading
		$(document).ready(function() {
			mainInit();
		});

		function mainInit() {

			properties = {

				speed : -0.045,
				displacementScale : 40,
				intensity : 2.3,
				color1 : new THREE.Color(0x8c808d),
				color2 : new THREE.Color(0x0000ff),
				color3 : new THREE.Color(0x530c28)
			}

			//wait for shaders to load
			LIBRARY.Shaders.loadedSignal.add(onShadersLoaded);

			//var gui = new DAT.GUI();
			/*DAT.GUI.autoPlace = false;

			$("#uiContainer").append(gui.domElement);

			gui.add(properties, 'speed').min(-0.0685).max(-0.0085).listen()
			gui.add(properties, 'intensity').min(0.7).max(5.3).listen()

			gui.add(properties, 'displacementScale').min(0).max(70).listen().onChange(function(newValue){
				displacementUniforms.uDisplacementScale.value = newValue;
			});

			gui.close();
			 */
		}

		function onShadersLoaded() {

			initEngine();
			initPostprocessing();
			initObjects();

			window.addEventListener('resize', onWindowResize, false);
			onWindowResize();

			window.addEventListener('mousemove', onDocumentMouseMove, false);

			initStartState();
		}

		function initEngine() {

			projector = new THREE.Projector();

			container = document.getElementById('container');

			scene = new THREE.Scene();
			//scene.fog = new THREE.Fog(1,9500,0x000000);
			sceneRenderTarget = new THREE.Scene();

			// fov, aspect, near, far
			camera = new THREE.Camera(70, SCREEN_WIDTH / SCREEN_HEIGHT, 1,
					10000);
			//camera = new THREE.Camera( {fov:70, aspect: SCREEN_WIDTH / SCREEN_HEIGHT, near:1, far:10000} );
			//camera = new THREE.TrackballCamera( { minDistance: sphereRadius * 1.1, maxDistance: sphereRadius * 20, fov:70, aspect: SCREEN_WIDTH / SCREEN_HEIGHT, near:1, far:10000} );
			camera.position.z = 200;
			camera.position.y = -100;

			camera.updateMatrix();
			camera.updateProjectionMatrix();

			//noise
			cameraOrtho = new THREE.Camera();
			cameraOrtho.projectionMatrix = THREE.Matrix4.makeOrtho(SCREEN_WIDTH
					/ -2, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_HEIGHT
					/ -2, -10000, 10000);
			cameraOrtho.position.z = 100;

			var plane = new THREE.PlaneGeometry(SCREEN_WIDTH, SCREEN_HEIGHT);
			quadTarget = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({
				color : 0xff0000
			}));
			quadTarget.position.z = -500;
			sceneRenderTarget.addObject(quadTarget);

			renderer = new THREE.WebGLRenderer({
				antialias : false
			});
			renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
			renderer.autoClear = false;
			renderer.sortObjects = false;

			if (renderer.getContext().getParameter(
					renderer.getContext().MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0) {
				alert('Opps! Your browser does not support [VERTEX-TEXTURES-TECHY-THINGY]. Guess I\'ll have to rename this experiment to "Glowing Spikes".');
				return;
			}

			//add renderer to DOM
			container.innerHTML = "";
			container.appendChild(renderer.domElement);

		}

		function initPostprocessing() {

			postprocessing.scene = new THREE.Scene();

			postprocessing.camera = new THREE.Camera();
			postprocessing.camera.projectionMatrix = THREE.Matrix4.makeOrtho(
					SCREEN_WIDTH / -2, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2,
					SCREEN_HEIGHT / -2, -10000, 10000);
			postprocessing.camera.position.z = 100;

			var pars = {
				minFilter : THREE.LinearFilter,
				magFilter : THREE.LinearFilter,
				format : THREE.RGBFormat
			};
			postprocessing.rtTexture1 = new THREE.WebGLRenderTarget(
					SCREEN_WIDTH, SCREEN_HEIGHT, pars);
			postprocessing.rtTexture2 = new THREE.WebGLRenderTarget(512, 512,
					pars);
			postprocessing.rtTexture3 = new THREE.WebGLRenderTarget(512, 512,
					pars);

			var screen_shader = THREE.ShaderUtils.lib["screen"];
			var screen_uniforms = THREE.UniformsUtils
					.clone(screen_shader.uniforms);

			screen_uniforms["tDiffuse"].texture = postprocessing.rtTexture1;
			screen_uniforms["opacity"].value = 1;

			postprocessing.materialScreen = new THREE.MeshShaderMaterial({

				uniforms : screen_uniforms,
				vertexShader : screen_shader.vertexShader,
				fragmentShader : screen_shader.fragmentShader,
				blending : THREE.AdditiveBlending,
				transparent : true

			});

			var convolution_shader = THREE.ShaderUtils.lib["convolution"];
			var convolution_uniforms = THREE.UniformsUtils
					.clone(convolution_shader.uniforms);

			postprocessing.blurx = new THREE.Vector2(0.001353125, 0.0),
					postprocessing.blury = new THREE.Vector2(0.0, 0.001353125);

			convolution_uniforms["tDiffuse"].texture = postprocessing.rtTexture1;
			convolution_uniforms["uImageIncrement"].value = postprocessing.blurx;
			convolution_uniforms["cKernel"].value = THREE.ShaderUtils
					.buildKernel(4.0);

			postprocessing.materialConvolution = new THREE.MeshShaderMaterial({

				uniforms : convolution_uniforms,
				vertexShader : "#define KERNEL_SIZE 25.0\n"
						+ convolution_shader.vertexShader,
				fragmentShader : "#define KERNEL_SIZE 25\n"
						+ convolution_shader.fragmentShader

			});

			postprocessing.quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
					postprocessing.materialConvolution);
			postprocessing.quad.scale.set(SCREEN_WIDTH, SCREEN_HEIGHT, 1);
			postprocessing.quad.position.z = -500;
			postprocessing.scene.addObject(postprocessing.quad);
		}

		function initObjects() {

			ballContainer = new THREE.Object3D();

			var names = [ "logoBlack.jpg",
					"logoBlack.jpg",
					"logoBlack.jpg",
					"logoBlack.jpg",
					"logoBlack.jpg",
					"logoBlack.jpg" ];

			var i;
			for (i = 0; i < 6; i++) {
				urls[i] = "presentacion_files/" + names[i];
				skyTextures[i] = THREE.ImageUtils.loadTexture(urls[i]);
			}

			var skyMaterials = [];
			skyMaterials.push(new THREE.MeshBasicMaterial({
				map : skyTextures[0]
			}));
			skyMaterials.push(new THREE.MeshBasicMaterial({
				map : skyTextures[1]
			}));
			skyMaterials.push(new THREE.MeshBasicMaterial({
				map : skyTextures[2]
			}));
			skyMaterials.push(new THREE.MeshBasicMaterial({
				map : skyTextures[3]
			}));
			skyMaterials.push(new THREE.MeshBasicMaterial({
				map : skyTextures[4]
			}));
			skyMaterials.push(new THREE.MeshBasicMaterial({
				map : skyTextures[5]
			}));

			noiseMap = new THREE.WebGLRenderTarget(256, 256, {
				format : THREE.RGBFormat
			});

			cubeMap = new THREE.ImageUtils.loadTextureCube(urls);

			var dirtTexture = THREE.ImageUtils
					.loadTexture("presentacion_files/logoBlack.jpg");
			dirtTexture.minFilter = THREE.LinearMipMapLinearFilter;
			dirtTexture.magFilter = THREE.LinearMipMapLinearFilter;

			var orbUniforms = {
				mRefractionRatio : {
					type : "f",
					value : 1.02
				},
				mFresnelBias : {
					type : "f",
					value : 0.45
				},
				mFresnelPower : {
					type : "f",
					value : 2.0
				},
				mFresnelScale : {
					type : "f",
					value : 1.0
				},
				tCube : {
					type : "t",
					value : 1,
					texture : cubeMap
				},
				tDiffuse : {
					type : "t",
					value : 2,
					texture : dirtTexture
				}
			}

			var parameters = {
				depthTest : false,
				blending : THREE.AdditiveBlending,
				fragmentShader : LIBRARY.Shaders.Orb.fragment,
				vertexShader : LIBRARY.Shaders.Orb.vertex,
				uniforms : orbUniforms
			};
			var orbMaterial = new THREE.MeshShaderMaterial(parameters);

			var geometrySphere = new THREE.SphereGeometry(sphereRadius, 40, 40);
			orb = new THREE.Mesh(geometrySphere, orbMaterial);
			orb.geometry.computeFaceNormals();
			scene.addChild(orb);

			dome = new THREE.Mesh(new THREE.CubeGeometry(9000, 9000, 9000, 1,
					1, 1, skyMaterials, true), new THREE.MeshFaceMaterial());
			scene.addChild(dome);

			noiseUniforms = {
				time : {
					type : "f",
					value : 1.0
				},
				scale : {
					type : "v2",
					value : new THREE.Vector2(1, 1)
				}
			};

			noiseMaterial = new THREE.MeshShaderMaterial({
				uniforms : noiseUniforms,
				vertexShader : LIBRARY.Shaders.Noise.vertex,
				fragmentShader : LIBRARY.Shaders.Noise.fragment,
				lights : false
			});

			displacementUniforms = {
				time : {
					type : "f",
					value : 1.0
				},
				tHeightMap : {
					type : "t",
					value : 1,
					texture : noiseMap
				},
				uDisplacementScale : {
					type : "f",
					value : properties.displacementScale
				},
				uTurbulence : {
					type : "f",
					value : properties.turbulence
				},
				uColor1 : {
					type : "c",
					value : properties.color1
				},
				uColor2 : {
					type : "c",
					value : properties.color2
				},
				uColor3 : {
					type : "c",
					value : properties.color3
				}
			};

			displacementMaterial = new THREE.MeshShaderMaterial({
				transparent : true,
				vertexColors : true,
				blending : THREE.AdditiveBlending,
				uniforms : displacementUniforms,
				vertexShader : LIBRARY.Shaders.Displacement.vertex,
				fragmentShader : LIBRARY.Shaders.Displacement.fragment,
				lights : false
			});

			/*var loader = new THREE.JSONLoader();
			loader.load( { model: "models/bolt.js", callback: function(geo) { boltLoaded( geo ) } } );*/

			var loader = new THREE.JSONLoader();
			loader.load({
				model : "presentacion_files/edge-glow.js",
				callback : function(geo) {
					glowLoaded(geo)
				}
			});

			scene.addChild(ballContainer);

			geometrySphere = new THREE.SphereGeometry(15, 50, 50);
			//geometrySphere.computeFaceNormals();
			var emitterSphere = new THREE.Mesh(geometrySphere, noiseMaterial);
			emitterSphere.depthTest = true;

			ballContainer.addChild(emitterSphere);

		}
		/*
		 function boltLoaded( geo ) {
		 boltGeometry = geo;
		 var loader = new THREE.JSONLoader();
		 loader.load( { model: "models/edge-glow.js", callback: function(geo) { glowLoaded( geo ) } } );

		 for( var i=0; i<2;i++){
		 bolt = new THREE.Mesh( boltGeometry, displacementMaterial );
		 bolt.rotation = new THREE.Vector3(0,0,Math.random()*360*TO_RADIANS);

		 glow = new THREE.Mesh( geo, glowMaterial );
		 glow.doubleSided = false;

		 bolt.addChild(glow);
		 bolt.visible = false;
		 bolt.ticker = Math.random()*200;

		 }
		 }*/

		function glowLoaded(geo) {

			var bolt, glow;
			var glowMaterial = new THREE.MeshBasicMaterial({
				transparent : true,
				depthTest : false,
				blending : THREE.AdditiveBlending,
				map : THREE.ImageUtils.loadTexture("presentacion_files/glow.png")
			});

			//tube bolts
			for ( var i = 0; i < 20; i++) {

				if (i < 3) {
					bolt = new Bolt(displacementMaterial,
							Math.random() * 6 + .5);
					ballContainer.addChild(bolt);
					controlBolts.push(bolt);
				} else {
					bolt = new Bolt(displacementMaterial,
							Math.random() * 2 + 0.5);
					ballContainer.addChild(bolt);
					bolts.push(bolt);
				}

				bolt.build();
				bolt.geometry.computeFaceNormals();
				bolt.geometry.computeVertexNormals();
				bolt.rotation = new THREE.Vector3(i * 360 / 20 * TO_RADIANS,
						Math.random() * 360 * TO_RADIANS, Math.random() * 360
								* TO_RADIANS);

				glow = new THREE.Mesh(geo, glowMaterial);
				glow.scale = new THREE.Vector3(1, 1, -1);
				glow.doubleSided = true;
				bolt.addChild(glow);

				bolt.ticker = Math.random() * 200;

			}
		}

		function initStartState() {

			$("#loading").delay(500).hide(function() {
				closeMoreInfo();
			});

			animate();
		}

		//game loop
		function animate() {
			requestAnimationFrame(animate);
			render()
		}

		function render() {

			var i, max;

			checkCollisions();

			renderer.clear();
			theta += properties.speed;
			displacementUniforms.time.value += properties.speed * .3;
			noiseUniforms.time.value += properties.speed * .3;

			//ballContainer.rotation.y += ((mouse2d.x+0.8)-ballContainer.rotation.y)/5;
			var angle = mouse2d.x * 180 * TO_RADIANS;
			camera.position.x = Math.sin(angle) * 200;
			camera.position.z = Math.cos(angle) * 200;
			camera.position.y = Math.tan(mouse2d.y * 60 * TO_RADIANS) * 200;

			//camera.lookAt(camera.target);

			quadTarget.materials[0] = noiseMaterial;
			renderer.render(sceneRenderTarget, cameraOrtho, noiseMap, true);

			var bolt;

			if (intersectionPoint) {
				for (i = 0, max = bolts.length; i < max; i++) {
					bolts[i].visible = false;
					bolts[i].children[0].visible = false;
				}
			} else {
				for (i = 0, max = bolts.length; i < max; i++) {
					bolt = bolts[i];
					bolt.ticker++;
					if (bolt.ticker > 200) {
						bolt.ticker = 0;
						bolt.rotation.x += Math.random() * 30 * TO_RADIANS;
						bolt.rotation.y += Math.random() * 30 * TO_RADIANS;
					}
					bolt.visible = true;
					bolt.children[0].visible = true;
					bolt.rotation.x += 0.005;
					bolt.rotation.y += 0.005;
					bolt.rotation.z += 0.01;
				}
			}

			if (controlBolts.length > 0) {
				if (intersectionPoint) {
					for (i = 0, max = controlBolts.length; i < max; i++) {
						controlBolts[i].visible = true;
						controlBolts[i].children[0].visible = true;
						controlBolts[i].lookAt(intersectionPoint);
						controlBolts[i].rotation.x += Math.sin(theta * 3)
								* TO_RADIANS;
						controlBolts[i].rotation.y += Math.cos(theta * 3)
								* TO_RADIANS;
						controlBolts[i].rotation.z = i * 45 * TO_RADIANS;
						controlBolts[i].scale.x = 1 - (Math.cos(theta) + 1) * .2;
					}
				} else {
					for (i = 0, max = controlBolts.length; i < max; i++) {
						controlBolts[i].visible = false;
						controlBolts[i].children[0].visible = false;

					}
				}
			}

			if (postprocessing.enabled) {
				// Render scene into texture
				orb.visible = true;
				dome.visible = true;
				renderer.render(scene, camera);
				orb.visible = false;
				dome.visible = false;

				renderer.render(scene, camera, postprocessing.rtTexture1, true);

				// Render quad with blured scene into texture (convolution pass 1)
				postprocessing.quad.materials = [ postprocessing.materialConvolution ];
				postprocessing.materialConvolution.uniforms.tDiffuse.texture = postprocessing.rtTexture1;
				postprocessing.materialConvolution.uniforms.uImageIncrement.value = postprocessing.blurx;

				renderer.render(postprocessing.scene, postprocessing.camera,
						postprocessing.rtTexture2, true);

				// Render quad with blured scene into texture (convolution pass 2)
				postprocessing.materialConvolution.uniforms.tDiffuse.texture = postprocessing.rtTexture2;
				postprocessing.materialConvolution.uniforms.uImageIncrement.value = postprocessing.blury;

				renderer.render(postprocessing.scene, postprocessing.camera,
						postprocessing.rtTexture3, true);

				// Render original scene with superimposed blur to texture
				postprocessing.quad.materials = [ postprocessing.materialScreen ];
				postprocessing.materialScreen.uniforms.tDiffuse.texture = postprocessing.rtTexture3;
				postprocessing.materialScreen.uniforms.opacity.value = properties.intensity
						+ Math.random() * .2;

				renderer.render(postprocessing.scene, postprocessing.camera,
						postprocessing.rtTexture1, false);

				// Render to screen
				postprocessing.materialScreen.uniforms.tDiffuse.texture = postprocessing.rtTexture1;

				renderer.render(postprocessing.scene, postprocessing.camera);

			} else {
				renderer.render(scene, camera);
			}

			updateFPS()
		}

		function checkCollisions() {

			var vector = mouse2d.clone();
			projector.unprojectVector(vector, camera);
			var r = new THREE.Ray(camera.position, vector.subSelf(
					camera.position).normalize());
			var c = r.intersectObject(orb);

			if (c.length > 0 && c[0].point) {
				intersectionPoint = c[0].point//.negate();
				intersectNormal = c[0].face.normal;
				$("body").css("cursor", "crosshair");
			} else {
				intersectionPoint = null;
				$("body").css("cursor", "default");
			}

		}

		function onDocumentMouseMove(event) {
			event.preventDefault();
			mouse2d.x = (event.clientX / window.innerWidth) * 2 - 1;
			mouse2d.y = -(event.clientY / window.innerHeight) * 2 + 1;
		}

		function onWindowResize() {

			SCREEN_WIDTH = window.innerWidth;
			SCREEN_HEIGHT = window.innerHeight;

			renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

			camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
			camera.updateProjectionMatrix();

			postprocessing.camera.projectionMatrix = THREE.Matrix4.makeOrtho(
					SCREEN_WIDTH / -2, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2,
					SCREEN_HEIGHT / -2, -10000, 10000);
			postprocessing.quad.scale.set(SCREEN_WIDTH, SCREEN_HEIGHT, 1);
			postprocessing.rtTexture1 = new THREE.WebGLRenderTarget(
					SCREEN_WIDTH, SCREEN_HEIGHT, {
						minFilter : THREE.LinearFilter,
						magFilter : THREE.LinearFilter,
						format : THREE.RGBFormat
					});

		}

		var _frames = 0;
		var _time;
		var _timeLastFrame = new Date().getTime();
		var _fps = "";
		var _mb = 0;
		var _timeLastSecond = new Date().getTime();

		function updateFPS() {

			_frames++;
			_time = new Date().getTime();

			_ms = _time - _timeLastFrame;

			_timeLastFrame = _time;

			if (_time > _timeLastSecond + 1000) {

				_fps = Math.round((_frames * 1000) / (_time - _timeLastSecond));
				//_mb = performance.memory.usedJSHeapSize * 0.000000954;

				$("#infoText").html("FPS: " + _fps);

				_timeLastSecond = _time;
				_frames = 0;

			}
		}
