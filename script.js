let scene, camera, renderer, controls;
        let labelRenderer;
        let currentRoom = null;
        let currentScreen = null;  
        let currentCenterSpeaker = null; 
        let currentLeftSpeaker = null;
        let currentRightSpeaker = null;
        let currentSLSpeaker = null;
        let currentSRSpeaker = null; 
        let currentSRLSpeaker = null; 
        let currentSRRSpeaker = null; 
        let currentTFLSpeaker = null; 
        let currentTFRSpeaker = null; 
        let currentTRLSpeaker = null; 
        let currentTRRSpeaker = null;
        let currentFLLSpeaker = null; // 左前环绕
        let currentFLRSpeaker = null; // 右前环绕 
        let currentTCLSpeaker = null; // 天空中置左
        let currentTCRSpeaker = null; // 天空中置右
        let isOrthographic = false;
        let cabinetGroup = null; // 使用Group作为容器
        const CUBE_SIZE = 0.02; // 1厘米
        const GAP = 0.02;      // 2厘米
        const CUBE_COUNT = 22; // 22个小立方体
        let wiringEnabled = false;
        const wires = [];
        const WIRE_OFFSET_STEP = 0; // 线材间距15cm
        const COLLISION_GRID_SIZE = 0.5; // 50cm网格
        const collisionGrid = new Map();
        const screenInfoElement = document.getElementById('screen-info');
        let sphere;
        let slAnnotation = null; // 存储左环绕标注
        let flrAnnotation = null; // 右前环绕标注
        let tflAnnotation = null; // 天空前置左声道标注
        let trrAnnotation = null; // 天空后置右声道标注
        let sphereAnnotation = null; // 皇帝位标注
        let sphereAnnotation2 = null; // 皇帝位第二个标注
        let projectorAnnotation = null; // 投影机标注
        let srlAnnotation = null; // 后置左环绕标注
        let trlAnnotation = null; // 天空后置左声道标注
        let leftAnnotation = null; // 左前置音箱标注
        let slLabel = null; // 存储左环绕标注文字
        let flrLabel = null; // 右前环绕标注文字
        let tflLabel = null; // 天空前置左声道标注文字
        let trrLabel = null; // 天空后置右声道标注文字
        let sphereLabel = null; // 皇帝位标注文字
        let sphereLabel2 = null; // 皇帝位第二个标注文字
        let projectorLabel = null; // 投影机标注文字
        let srlLabel = null; // 后置左环绕标注文字
        let trlLabel = null; // 天空后置左声道标注文字
        let leftLabel = null; // 左前置音箱标注文字

        const WIRE_CONFIG = {
            AVOID_RADIUS: 0.3,    // 避开喇叭的半径
            BASE_WIDTH: 0.02,      // 基础线宽
            WIDTH_PER_OVERLAP: 0.01 // 每次叠加增加的线宽
        };
        const CUBE_CONNECTIONS = {
            0: 'NO1',
            1: 'NO2',
            2: 'NO3',
            3: 'NO4',
            4: 'NO5',
            5: 'NO6',
            6: 'NO7',
            7: 'NO8',
            8: 'NO9',
            9: 'NO10',
            10: 'NO11',
            11: 'NO12',
            12: 'NO13',
            13: 'NO14',
            14: 'NO15',
            15: 'NO16',
            16: 'NO17',
            17: 'NO18',
            18: 'NO19',
            19: 'NO20',
            20: 'NO21',
            21: 'NO22',
            22: 'projector' // 新增投影机连接
        };

        // 添加音箱配置映射
        const speakerConfigMap = {
            '5.1': ['center', 'front-left', 'front-right', 'surround-left', 'surround-right'],
            '5.1.2': ['center', 'front-left', 'front-right', 'surround-left', 'surround-right',
                     'top-front-left', 'top-front-right'],
            '5.1.4': ['center', 'front-left', 'front-right', 'surround-left', 'surround-right',
                     'top-front-left', 'top-front-right', 'top-rear-left', 'top-rear-right'],
            '7.1': ['center', 'front-left', 'front-right', 'surround-left', 'surround-right',
                    'rear-left', 'rear-right'],
            '7.1.2': ['center', 'front-left', 'front-right', 'surround-left', 'surround-right',
                     'rear-left', 'rear-right', 'top-front-left', 'top-front-right'],
            '7.1.4': ['center', 'front-left', 'front-right', 'surround-left', 'surround-right',
                     'rear-left', 'rear-right', 'top-front-left', 'top-front-right',
                     'top-rear-left', 'top-rear-right'],
            '9.1.4': ['center', 'front-left', 'front-right', 'front-left-left', 'front-right-right',
                     'surround-left', 'surround-right', 'rear-left', 'rear-right',
                     'top-front-left', 'top-front-right', 'top-rear-left', 'top-rear-right'],
            '9.1.6': ['center', 'front-left', 'front-right', 'front-left-left', 'front-right-right',
                     'surround-left', 'surround-right', 'rear-left', 'rear-right',
                     'top-front-left', 'top-front-right', 'top-center-left', 'top-center-right',
                     'top-rear-left', 'top-rear-right']
        };

        // 初始化场景

        document.addEventListener('DOMContentLoaded', function() {
            // 将updateSpeakerAnnotations函数移到init之前
            function updateSpeakerAnnotations() {
                const showSpeakerPoints = document.getElementById('showSpeakerPoints').checked;
                const showProjectorPoints = document.getElementById('showProjectorPoints').checked;
                const showSweetSpot = document.getElementById('showSweetSpot').checked;

                const speakerElements = [
                    { anno: leftAnnotation, label: leftLabel },
                    { anno: slAnnotation, label: slLabel },
                    { anno: flrAnnotation, label: flrLabel },
                    { anno: srlAnnotation, label: srlLabel },
                    { anno: tflAnnotation, label: tflLabel },
                    { anno: trrAnnotation, label: trrLabel }
                ];

                const projectorElements = [projectorAnnotation, projectorLabel];
                const sweetSpotElements = [sphereAnnotation, sphereAnnotation2, sphereLabel, sphereLabel2];

                // 统一处理显示隐藏逻辑
                const setVisibility = (elements, visible) => {
                    elements.forEach(element => {
                        if (element) element.visible = visible;
                    });
                };

                // 处理音箱标注
                setVisibility(speakerElements.flatMap(item => [item.anno, item.label]), showSpeakerPoints);
                // 处理投影机标注
                setVisibility(projectorElements, showProjectorPoints);
                // 处理皇帝位标注
                setVisibility(sweetSpotElements, showSweetSpot);

                if (!showSpeakerPoints) return;

                // 获取当前音箱配置
                const config = document.querySelector('input[name="speakerConfig"]:checked').value;

                // 先隐藏所有标注
                setVisibility(speakerElements.flatMap(item => [item.anno, item.label]), false);

                // 定义每种配置需要显示的元素映射
                const configMap = {
                    '5.1': ['leftAnnotation', 'slAnnotation', 'leftLabel', 'slLabel'],
                    '5.1.2': ['leftAnnotation', 'slAnnotation', 'tflAnnotation', 'leftLabel', 'slLabel', 'tflLabel'],
                    '5.1.4': ['leftAnnotation', 'slAnnotation', 'tflAnnotation', 'trrAnnotation', 'leftLabel', 'slLabel', 'tflLabel', 'trrLabel'],
                    '7.1': ['leftAnnotation', 'slAnnotation', 'srlAnnotation', 'leftLabel', 'slLabel', 'srlLabel'],
                    '7.1.2': ['leftAnnotation', 'slAnnotation', 'srlAnnotation', 'tflAnnotation', 'leftLabel', 'slLabel', 'srlLabel', 'tflLabel'],
                    '7.1.4': ['leftAnnotation', 'slAnnotation', 'srlAnnotation', 'tflAnnotation', 'trrAnnotation', 'leftLabel', 'slLabel', 'srlLabel', 'tflLabel', 'trrLabel'],
                    '9.1.4': ['leftAnnotation', 'slAnnotation', 'flrAnnotation', 'srlAnnotation', 'tflAnnotation', 'trrAnnotation', 'leftLabel', 'slLabel', 'flrLabel', 'srlLabel', 'tflLabel', 'trrLabel'],
                    '9.1.6': ['leftAnnotation', 'slAnnotation', 'flrAnnotation', 'srlAnnotation', 'tflAnnotation', 'trrAnnotation', 'leftLabel', 'slLabel', 'flrLabel', 'srlLabel', 'tflLabel', 'trrLabel']
                };

                // 根据配置显示标注
                const elementsToShow = configMap[config] || [];
                elementsToShow.forEach(name => {
                    const element = eval(name); // 注意：使用 eval 有一定安全风险，若变量作用域可控可使用
                    if (element) element.visible = true;
                });
            }

            // 统一的标注可见性更新函数
            function updateAnnotationVisibility(states) {
                // 处理音箱标注
                const speakerAnnotations = [
                    leftAnnotation, slAnnotation, flrAnnotation, 
                    srlAnnotation, tflAnnotation, trrAnnotation, trlAnnotation
                ];
                const speakerLabels = [
                    leftLabel, slLabel, flrLabel,
                    srlLabel, tflLabel, trrLabel, trlLabel
                ];
            
                // 强制更新所有标注的可见性
                speakerAnnotations.forEach(anno => {
                    if (anno) {
                        anno.visible = states.speaker;
                        // 强制更新标注的渲染状态
                        if (anno.material) {
                            anno.material.needsUpdate = true;
                        }
                    }
                });
                speakerLabels.forEach(label => {
                    if (label) {
                        label.visible = states.speaker;
                        label.element.style.display = states.speaker ? 'block' : 'none';
                    }
                });
            
                // 处理投影机标注
                if (projectorAnnotation) {
                    projectorAnnotation.visible = states.projector;
                    if (projectorAnnotation.material) {
                        projectorAnnotation.material.needsUpdate = true;
                    }
                }
                if (projectorLabel) {
                    projectorLabel.visible = states.projector;
                    projectorLabel.element.style.display = states.projector ? 'block' : 'none';
                }
            
                // 处理皇帝位标注
                if (sphereAnnotation) {
                    sphereAnnotation.visible = states.sweetSpot;
                    if (sphereAnnotation.material) {
                        sphereAnnotation.material.needsUpdate = true;
                    }
                }
                if (sphereAnnotation2) {
                    sphereAnnotation2.visible = states.sweetSpot;
                    if (sphereAnnotation2.material) {
                        sphereAnnotation2.material.needsUpdate = true;
                    }
                }
                if (sphereLabel) {
                    sphereLabel.visible = states.sweetSpot;
                    sphereLabel.element.style.display = states.sweetSpot ? 'block' : 'none';
                }
                if (sphereLabel2) {
                    sphereLabel2.visible = states.sweetSpot;
                    sphereLabel2.element.style.display = states.sweetSpot ? 'block' : 'none';
                }
            
                // 强制渲染更新
                renderer.render(scene, camera);
                labelRenderer.render(scene, camera);
            }

            function init() {
                
                scene = new THREE.Scene();

                // 增强型照明系统
                const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
                hemisphereLight.position.set(0, 10, 0);
                scene.add(hemisphereLight);

                // 主摄像机设置
                camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
                camera.position.set(7, 5, 7);
                camera.lookAt(0, 0, 0);

                // WebGL渲染器配置
                renderer = new THREE.WebGLRenderer({antialias: true,alpha: true});
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setClearColor(0xF8F9FA, 1);
                document.body.appendChild(renderer.domElement);

                // 初始化CSS2D渲染器
                labelRenderer = new THREE.CSS2DRenderer();
                labelRenderer.setSize(window.innerWidth, window.innerHeight);
                labelRenderer.domElement.style.position = 'absolute';
                labelRenderer.domElement.style.top = '0';
                labelRenderer.domElement.style.pointerEvents = 'none';
                document.body.appendChild(labelRenderer.domElement);

                // 初始化控制器
                setTimeout(() => {
                    controls = new THREE.OrbitControls(camera, renderer.domElement);
                    controls.enableDamping = true;
                    controls.dampingFactor = 0.09;
                    controls.target.set(0, 0, 0);
                    
                    // 强制更新控制器状态
                    controls.update(); 
                    controls.addEventListener('change', () => {
                        renderer.render(scene, camera);
                    });
                    
                    // 添加鼠标事件监听
                    renderer.domElement.addEventListener('mousedown', () => {
                        controls.enabled = true;
                    });
                }, 100);

                // 初始化时隐藏所有标注
                [leftAnnotation, slAnnotation, flrAnnotation, srlAnnotation, tflAnnotation, trrAnnotation].forEach(anno => {
                    if (anno) anno.visible = false;
                });
                [leftLabel, slLabel, flrLabel, srlLabel, tflLabel, trrLabel].forEach(label => {
                    if (label) label.visible = false;
                });
                if (projectorAnnotation) projectorAnnotation.visible = false;
                if (projectorLabel) projectorLabel.visible = false;
                if (sphereAnnotation) sphereAnnotation.visible = false;
                if (sphereAnnotation2) sphereAnnotation2.visible = false;
                if (sphereLabel) sphereLabel.visible = false;
                if (sphereLabel2) sphereLabel2.visible = false;

                initCardFold();

                // 添加以下代码确保canvas层级
                renderer.domElement.style.zIndex = 1; 
                renderer.domElement.style.pointerEvents = 'auto';

                // 创建小黄色球体
                const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
                const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
                sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                scene.add(sphere);

                document.getElementById('projectionToggle').addEventListener('change', function() {
                    isOrthographic = this.checked;
                    const aspect = window.innerWidth / window.innerHeight;
                    
                    // 保留原相机位置和朝向
                    const oldPosition = camera.position.clone();
                    const oldTarget = controls.target.clone();
                 
                    if (isOrthographic) {
                        const frustumSize = 10;
                        camera = new THREE.OrthographicCamera(
                            -frustumSize * aspect / 2,
                            frustumSize * aspect / 2,
                            frustumSize / 2,
                            -frustumSize / 2,
                            0.1,
                            1000
                        );
                    } else {
                        camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
                    }
                    
                    // 恢复位置和朝向
                    camera.position.copy(oldPosition);
                    camera.lookAt(oldTarget);
                    
                    // 重新初始化控制器
                    controls.dispose();
                    controls = new THREE.OrbitControls(camera, renderer.domElement);
                    controls.enableDamping = true;
                    controls.dampingFactor = 0.05;
                    controls.target.copy(oldTarget);
                    controls.update(); 
                    
                    onWindowResize();
                });

                // 移动端自动隐藏
                if (window.innerWidth < 768) {
                    document.getElementById('control-panel').style.display = 'none';
                } else {
                    document.getElementById('control-panel').style.display = 'block';
                }

                document.getElementById('cabinetToggle').addEventListener('change', function() {
                const enabled = this.checked;

                // 布线事件绑定
                document.getElementById('generateWiring').addEventListener('change', function() {
                    wiringEnabled = this.checked;
                    if (wiringEnabled && cabinetGroup) {
                        generateAllWires();
                    } else {
                        wires.forEach(wire => scene.remove(wire));
                        wires.length = 0;
                    }
                });
                // 机柜位置变化更新布线绑定到滑块事件
                document.querySelectorAll('#cabinetX, #cabinetY, #cabinetZ').forEach(input => {
                    input.addEventListener('input', () => {
                        updateCabinetPosition();
                        onCabinetPositionChange();
                    });
                });

                // 启用/禁用滑块
                document.querySelectorAll('#cabinetX, #cabinetY, #cabinetZ')
                    .forEach(el => el.disabled = !enabled);

                     // 创建或销毁机柜模型
                    if (enabled) {
                        if (!cabinetGroup) {
                            // 创建容器组
                            cabinetGroup = new THREE.Group();
                            
                            // 创建16个小立方体
                            // 创建22个小立方体，排成一排
                            for (let i = 0; i < CUBE_COUNT; i++) {
                                const geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
                                const material = new THREE.MeshBasicMaterial({ 
                                    color: 0xff0000,
                                    transparent: true,
                                    opacity: 0.8,
                                    depthTest: false
                                });
                
                                const cube = new THREE.Mesh(geometry, material);
                                cube.renderOrder = 999;
                
                                // 设置唯一ID
                                cube.userData.id = `cabinet-cube-${i}`;
                
                                // 计算位置 (沿X轴排列)
                                cube.position.x = i * (CUBE_SIZE + GAP);
                
                                cabinetGroup.add(cube);
                            }
            
                            // 居中整体位置
                            const totalWidth = (CUBE_SIZE * CUBE_COUNT) + (GAP * (CUBE_COUNT - 1));
                            cabinetGroup.position.x = -totalWidth / 2;
                            
                            scene.add(cabinetGroup);
                        }
                        updateCabinetPosition();
                    } else if (cabinetGroup) {
                        scene.remove(cabinetGroup);
                        cabinetGroup = null;
                    }
                });

                const elements = [
                    '#screenRatio', 
                    '#screenBorderWidth', 
                    '#screenBorderWidth-range', 
                    '#throwRatio', 
                    '#throwRatio-range', 
                    '#showProjector'
                ];
                
                elements.forEach(id => {
                    const element = document.querySelector(id);
                    if (element) {
                        element.addEventListener('change', () => generateModel());
                    }
                });

                // 投射比输入同步
                document.getElementById('throwRatio').addEventListener('input', function() {
                    document.getElementById('throwRatio-range').value = this.value;
                    document.getElementById('throwRatioValue').textContent = this.value;
                });
                document.getElementById('throwRatio-range').addEventListener('input', function() {
                    document.getElementById('throwRatio').value = this.value;
                    document.getElementById('throwRatioValue').textContent = this.value;
                });

                 // 音箱配置变化监听
                // 绑定事件监听器
                // 绑定标注显示控制事件
                const annotationControls = [
                    'showSpeakerPoints', 
                    'showProjectorPoints', 
                    'showSweetSpot'
                ];
                
                annotationControls.forEach(id => {
                    document.getElementById(id).addEventListener('change', updateSpeakerAnnotations);
                });

                // 绑定参数变化事件
                const paramControls = [
                    'screenBorderWidth', 'screenBorderWidth-range',
                    'throwRatio', 'throwRatio-range'
                ];
                
                paramControls.forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.addEventListener('input', () => {
                            // 保存当前标注显示状态
                            const showSpeakerPoints = document.getElementById('showSpeakerPoints').checked;
                            const showProjectorPoints = document.getElementById('showProjectorPoints').checked;
                            const showSweetSpot = document.getElementById('showSweetSpot').checked;
                            
                            // 更新模型但不重新创建标注
                            generateModel(false);
                            
                            // 强制保持之前的显示状态
                            if (!showSpeakerPoints) {
                                [leftAnnotation, slAnnotation, flrAnnotation, srlAnnotation, 
                                tflAnnotation, trrAnnotation, trlAnnotation].forEach(anno => anno && (anno.visible = false));
                                [leftLabel, slLabel, flrLabel, srlLabel, 
                                tflLabel, trrLabel, trlLabel].forEach(label => label && (label.visible = false));
                            }
                            if (!showProjectorPoints) {
                                if (projectorAnnotation) projectorAnnotation.visible = false;
                                if (projectorLabel) projectorLabel.visible = false;
                            }
                            if (!showSweetSpot) {
                                if (sphereAnnotation) sphereAnnotation.visible = false;
                                if (sphereAnnotation2) sphereAnnotation2.visible = false;
                                if (sphereLabel) sphereLabel.visible = false;
                                if (sphereLabel2) sphereLabel2.visible = false;
                            }
                            
                            // 更新标注位置
                            updateAnnotationPositions();
                            
                            // 恢复之前的显示状态
                            document.getElementById('showSpeakerPoints').checked = showSpeakerPoints;
                            document.getElementById('showProjectorPoints').checked = showProjectorPoints;
                            document.getElementById('showSweetSpot').checked = showSweetSpot;
                        });
                    }
                });

                document.querySelectorAll('input[name="speakerConfig"]').forEach(radio => {
                    radio.addEventListener('change', function() {
                        updateSpeakerVisibility(this.value);
                        updateSpeakerAnnotations();
                    });
                });

             
                // 屏幕比例变化事件
                document.getElementById('screenRatio').addEventListener('change', () => {
                    
                    generateModel();
                    
                    if (document.getElementById('maxScreen').checked) {
                        toggleMaxScreenMode(true);
                    }
                });


                //输入事件监听
                document.querySelectorAll('input[type="number"], input[type="range"]').forEach(input => {
                    input.addEventListener('input', function() {
                        // 同步双向数据
                        if (this.type === 'number') {
                            const range = document.getElementById(this.id + '-range');
                            if (range) range.value = this.value;
                        } else {
                            const number = document.getElementById(this.id.replace('-range', ''));
                            if (number) number.value = this.value;
                        }

                        // 根据输入项类型触发更新
                        if (this.id === 'viewAngle' || this.id === 'viewAngle-range') {
                            updateSpherePosition();
                            generateSPK(); // 关键：视角变化时更新音箱位置
                            createAnnotation(); // 更新左环绕标注

                        } else {
                            generateModel(); // 其他参数变化时更新房间和屏幕
                        }
                        
                        // 保持标注的隐藏状态
                        const showSpeakerPoints = document.getElementById('showSpeakerPoints').checked;
                        const showProjectorPoints = document.getElementById('showProjectorPoints').checked;
                        const showSweetSpot = document.getElementById('showSweetSpot').checked;
                        
                        updateModelInfo();
                        updateSpeakerAnnotations();
                        
                        // 恢复之前的显示状态
                        document.getElementById('showSpeakerPoints').checked = showSpeakerPoints;
                        document.getElementById('showProjectorPoints').checked = showProjectorPoints;
                        document.getElementById('showSweetSpot').checked = showSweetSpot;
                    });
                });

                // 视图切换事件
                document.getElementById('viewDirection').addEventListener('change', function() {
                    setCameraPosition(this.value);
                });

              
                // 窗口resize处理
                window.addEventListener('resize', onWindowResize, false);
                adjustPanelLayout();
                createCamera();
            }

            // 窗口resize回调函数
            function onWindowResize() {
                const aspect = window.innerWidth / window.innerHeight;
    
                if (isOrthographic) {
                    const frustumSize = 10;
                    camera.left = -frustumSize * aspect / 2;
                    camera.right = frustumSize * aspect / 2;
                    camera.top = frustumSize / 2;
                    camera.bottom = -frustumSize / 2;
                    camera.updateProjectionMatrix();
                } else {
                    camera.aspect = aspect;
                    camera.updateProjectionMatrix();
                }
                
                renderer.setSize(window.innerWidth, window.innerHeight);
            }

            function createCamera() {
                const aspect = window.innerWidth / window.innerHeight;
                camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
                camera.position.set(6,6,6); // 调整初始位置
                camera.lookAt(0, 0, 0);
            }

            function initCardFold() {
                // 默认收起control-panel和card部分
                document.querySelectorAll('#control-panel .card-header').forEach(header => {
                    header.classList.add('collapsed');
                    header.nextElementSibling.style.maxHeight = "0";
                });
                
                // 默认展开info-section
                document.querySelectorAll('#info-panel .card-header').forEach(header => {
                    header.classList.remove('collapsed');
                    header.nextElementSibling.style.maxHeight = header.nextElementSibling.scrollHeight + "px";
                });
             
                // 事件绑定（最终可靠版本）
                document.addEventListener('click', function(e) {
                    const header = e.target.closest('.card-header');
                    if (!header) return;
             
                    const content = header.nextElementSibling;
                    header.classList.toggle('collapsed');
                    content.style.maxHeight = header.classList.contains('collapsed') ? '0' : content.scrollHeight + 'px';
                });
            }

            // 相机位置设置函数
            function setCameraPosition(direction) {
                const roomLength = parseFloat(document.getElementById('length').value) || 5;
                const roomWidth = parseFloat(document.getElementById('width').value) || 4;
                const roomHeight = parseFloat(document.getElementById('height').value) || 3;
             
                const positions = {
                    front:  { x: 0, y: 0, z: roomWidth * 1.5 },
                    back:   { x: 0, y: 0, z: -roomWidth * 1.5 },
                    left:   { x: -roomLength * 1.5, y: 0, z: 0 },
                    right:  { x: roomLength * 1.5, y: 0, z: 0 },
                    top:    { x: 0, y: roomHeight * 2, z: 0 },
                    bottom: { x: 0, y: -roomHeight * 0.5, z: 0 }
                };
             
                camera.position.set(positions[direction].x, positions[direction].y, positions[direction].z);
                camera.lookAt(0, 0, 0);
                controls.target.set(0, 0, 0);
                controls.update();
            }

            // 添加移动端面板切换逻辑
            function togglePanel() {
                const panel = document.getElementById('control-panel');
                if (panel.style.display === 'none' || panel.style.display === '') {
                    panel.style.display = 'block';
                    document.querySelector('.mobile-toggle').textContent = '▲ 收起面板';
                } else {
                    panel.style.display = 'none';
                    document.querySelector('.mobile-toggle').textContent = '▼ 展开面板';
                }
            }

            
            function createRoom(length, height, width) {
            
                const geometry = new THREE.BoxGeometry(length, height, width);
                const mainMaterial = new THREE.MeshPhongMaterial({
                    color: 0xC0C0C0,
                    transparent: true,
                    opacity: 0.25,
                    specular: 0xFFFFFF,
                    shininess: 50,
                    side: THREE.DoubleSide,
                    depthWrite: false  // 新增属性
                });

                const edges = new THREE.EdgesGeometry(geometry);
                const edgeMaterial = new THREE.LineBasicMaterial({
                    color: 0x606060,
                    linewidth: 2
                });
                const roomGroup = new THREE.Group();
                const mainMesh = new THREE.Mesh(geometry, mainMaterial);
                const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
                roomGroup.add(mainMesh);
                roomGroup.add(edgeLines);
                return roomGroup;
            }

            function createScreen(roomLength, roomHeight, roomWidth) {
                const screenRatio = document.getElementById('screenRatio').value;
                const [ratioWidth, ratioHeight] = screenRatio.split('/').map(Number);
                const borderWidth = parseFloat(document.getElementById('screenBorderWidth').value) / 100; // 转换为米
             
                // 手动模式计算
                const screenSizeInch = parseFloat(document.getElementById('screenSize').value) || 0;
                const screenDiagonal = Math.max(screenSizeInch, 30) * 0.0254;
                
                // 基础尺寸计算
                const ratioDiagonal = Math.sqrt(ratioWidth**2 + ratioHeight**2);
                let screenHeight = (screenDiagonal * ratioHeight) / ratioDiagonal;
                let screenWidth = (screenDiagonal * ratioWidth) / ratioDiagonal;
             
                // 应用边框限制
                const maxValidWidth = roomWidth - 2 * borderWidth;
                const maxValidHeight = roomHeight - 2 * borderWidth;
                
                // 自动修正尺寸
                if (screenWidth > maxValidWidth || screenHeight > maxValidHeight) {
                    const widthRatio = maxValidWidth / screenWidth;
                    const heightRatio = maxValidHeight / screenHeight;
                    const adjustRatio = Math.min(widthRatio, heightRatio);
                    
                    screenWidth *= adjustRatio;
                    screenHeight *= adjustRatio;
                    
                    // 更新输入框显示实际尺寸
                    const actualDiagonal = Math.sqrt(screenWidth**2 + screenHeight**2) / 0.0254;
                    document.getElementById('screenSize').value = actualDiagonal.toFixed(1);
                    document.getElementById('screenSize-range').value = actualDiagonal.toFixed(1);
                }

                // 创建投影幕主体
                const screenGeometry = new THREE.PlaneGeometry(screenWidth, screenHeight);
                const screenMaterial = new THREE.MeshPhongMaterial({
                    color: 0x000000,
                    transparent: true,
                    opacity: 0.7,
                    side: THREE.DoubleSide
                });
                const screen = new THREE.Mesh(screenGeometry, screenMaterial);

                // 创建边框
                const borderGroup = new THREE.Group();
                if (borderWidth > 0) {
                    const borderMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
                    
                    // 上下边框（带侧边延伸）
                    const horizontalBorderGeometry = new THREE.BoxGeometry(
                        screenWidth + 2 * borderWidth, 
                        borderWidth, 
                        0.01
                    );
                    const topBorder = new THREE.Mesh(horizontalBorderGeometry, borderMaterial);
                    const bottomBorder = topBorder.clone();
                    topBorder.position.y = screenHeight/2 + borderWidth/2;
                    bottomBorder.position.y = -screenHeight/2 - borderWidth/2;

                    // 左右边框（带上下延伸）
                    const verticalBorderGeometry = new THREE.BoxGeometry(
                        borderWidth, 
                        screenHeight + 2 * borderWidth, 
                        0.01
                    );
                    const leftBorder = new THREE.Mesh(verticalBorderGeometry, borderMaterial);
                    const rightBorder = leftBorder.clone();
                    leftBorder.position.x = -screenWidth/2 - borderWidth/2;
                    rightBorder.position.x = screenWidth/2 + borderWidth/2;

                    borderGroup.add(topBorder, bottomBorder, leftBorder, rightBorder);
                }

                // 组合元素
                const screenAssembly = new THREE.Group();
                screenAssembly.add(screen);
                screenAssembly.add(borderGroup);
                
                // 定位到墙面
                screenAssembly.position.set(-roomLength/2 + 0.02, 0, 0);
                screenAssembly.rotation.y = Math.PI/2;

                return screenAssembly;
            }

            // 切换最大屏幕模式
            function toggleMaxScreenMode(isMax) {
                const screenSizeInput = document.getElementById('screenSize');
                const screenSizeRange = document.getElementById('screenSize-range');
             
                // 切换禁用状态
                screenSizeInput.disabled = isMax;
                screenSizeRange.disabled = isMax;
             
                // 样式变化
                screenSizeInput.style.backgroundColor = isMax ? '#eee' : '';
                screenSizeRange.style.opacity = isMax ? 0.5 : 1;
             
                if (isMax) {
                    // 自动计算并显示最大尺寸
                    const roomWidth = parseFloat(document.getElementById('width').value);
                    const roomHeight = parseFloat(document.getElementById('height').value);
                    const borderWidth = parseFloat(document.getElementById('screenBorderWidth').value) / 100;
                    
                    const [ratioW, ratioH] = document.getElementById('screenRatio').value.split('/').map(Number);
                    const availableWidth = roomWidth - 2 * borderWidth;
                    const availableHeight = roomHeight - 2 * borderWidth;
             
                    // 计算最大对角线尺寸（英寸）
                    const maxWidth = availableWidth / (ratioW / Math.sqrt(ratioW**2 + ratioH**2));
                    const maxHeight = availableHeight / (ratioH / Math.sqrt(ratioW**2 + ratioH**2));
                    const maxDiagonal = Math.min(maxWidth, maxHeight) / 0.0254; // 转换为英寸
             
                    screenSizeInput.value = Math.floor(maxDiagonal);
                    screenSizeRange.value = Math.floor(maxDiagonal);
                }
            }

            function updateSpherePosition() {
                const earHeight = parseFloat(document.getElementById('earHeight').value) || 0;
                const viewAngle = parseFloat(document.getElementById('viewAngle').value) || 45;
                const height = parseFloat(document.getElementById('height').value) || 2.7;
                const length = parseFloat(document.getElementById('length').value) || 5.0;

                // 获取屏幕实际尺寸
                if (currentScreen && currentScreen.children.length > 0) {
                    const screenMesh = currentScreen.children[0];
                    const screenWidth = screenMesh.geometry.parameters.width;
                    
                    // 计算观影距离
                    const distance = (screenWidth / 2) / Math.tan((viewAngle / 2) * (Math.PI / 180));
                    const xPosition = distance - length / 2;
                    const yPosition = earHeight - height / 2;
                    
                    sphere.position.set(xPosition, yPosition, 0);
                } else {
                    console.warn("屏幕尚未生成");
                }
            }

            function updateAnnotationPositions() {
                // 更新所有标注的位置
                if (leftAnnotation && currentLeftSpeaker) {
                    const leftSpeakerPos = currentLeftSpeaker.position.clone();
                    const leftStart = new THREE.Vector3(leftSpeakerPos.x-0.2, leftSpeakerPos.y, leftSpeakerPos.z);
                    const leftEnd = new THREE.Vector3(leftSpeakerPos.x-0.2, leftSpeakerPos.y, width/2);
                    updateAnnotationLine(leftAnnotation, leftStart, leftEnd);
                    updateAnnotationLabel(leftLabel, leftStart, leftEnd);
                }
                
                if (slAnnotation && currentSLSpeaker) {
                    const slSpeakerPos = currentSLSpeaker.position.clone();
                    const slStart = new THREE.Vector3(slSpeakerPos.x, slSpeakerPos.y, slSpeakerPos.z + 0.2);
                    const slEnd = new THREE.Vector3(-length/2, slSpeakerPos.y, slSpeakerPos.z + 0.2);
                    updateAnnotationLine(slAnnotation, slStart, slEnd);
                    updateAnnotationLabel(slLabel, slStart, slEnd);
                }
                
                // 更新其他标注的位置...
            }

            function updateAnnotationLine(annotation, start, end) {
                if (!annotation) return;
                
                const points = [start, end];
                annotation.geometry.setFromPoints(points);
                
                // 更新端点线段
                const direction = new THREE.Vector3().subVectors(end, start).normalize();
                const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
                const endLineLength = 0.20;
                
                // 起点端点
                const startEnd1 = start.clone().add(perpendicular.clone().multiplyScalar(endLineLength/2));
                const startEnd2 = start.clone().sub(perpendicular.clone().multiplyScalar(endLineLength/2));
                annotation.children[1].geometry.setFromPoints([startEnd1, startEnd2]);
                
                // 终点端点
                const endEnd1 = end.clone().add(perpendicular.clone().multiplyScalar(endLineLength/2));
                const endEnd2 = end.clone().sub(perpendicular.clone().multiplyScalar(endLineLength/2));
                annotation.children[2].geometry.setFromPoints([endEnd1, endEnd2]);
            }

            function updateAnnotationLabel(label, start, end) {
                if (!label) return;
                
                const middlePoint = new THREE.Vector3().lerpVectors(start, end, 0.5);
                label.position.copy(middlePoint);
            }

            function createAnnotation() {
                // 移除所有旧标注
                const annotations = [
                    slAnnotation, flrAnnotation, tflAnnotation, trrAnnotation,
                    sphereAnnotation, projectorAnnotation, srlAnnotation, trlAnnotation
                ];
                const labels = [
                    slLabel, flrLabel, tflLabel, trrLabel,
                    sphereLabel, projectorLabel, srlLabel, trlLabel
                ];
                
                annotations.forEach(anno => anno && scene.remove(anno));
                labels.forEach(label => label && scene.remove(label));
                
                // 重置所有标注变量
                slAnnotation = flrAnnotation = tflAnnotation = trrAnnotation = 
                sphereAnnotation = projectorAnnotation = srlAnnotation = trlAnnotation = null;
                slLabel = flrLabel = tflLabel = trrLabel = 
                sphereLabel = projectorLabel = srlLabel = trlLabel = null;

                // 创建左前置音箱标注
                if (currentLeftSpeaker && currentLeftSpeaker.visible) {
                    // 清理旧标注
                    if (leftAnnotation) {
                        scene.remove(leftAnnotation);
                        leftAnnotation = null;
                    }
                    if (leftLabel) {
                        scene.remove(leftLabel);
                        leftLabel = null;
                    }

                    const leftSpeakerPos = currentLeftSpeaker.position.clone();
                    
                    // 计算起点（Z轴负方向偏移0.2米）
                    const leftStart = new THREE.Vector3(
                        leftSpeakerPos.x-0.2,
                        leftSpeakerPos.y,
                        leftSpeakerPos.z
                    );

                    // 计算终点（左侧墙位置）
                    const width = parseFloat(document.getElementById('width').value) || 5.0;
                    const leftEnd = new THREE.Vector3(
                        leftSpeakerPos.x-0.2, // 影视墙X坐标
                        leftSpeakerPos.y,
                        width/2
                    );

                    // 创建标注
                    leftAnnotation = createAnnotationLine(leftStart, leftEnd, 0x0000FF); // 蓝色标注
                    scene.add(leftAnnotation);

                    // 创建文字标注
                    const leftDistance = leftStart.distanceTo(leftEnd).toFixed(2);
                    leftLabel = createAnnotationLabel(leftStart, leftEnd, leftDistance, '#0000FF');
                    scene.add(leftLabel);
                }

                // 创建左环绕标注
                if (currentSLSpeaker && currentSLSpeaker.visible) {
                    const slSpeakerPos = currentSLSpeaker.position.clone();
                    
                    // 计算起点（Z轴负方向偏移0.2米）
                    const slStart = new THREE.Vector3(
                        slSpeakerPos.x,
                        slSpeakerPos.y,
                        slSpeakerPos.z + 0.2
                    );

                    // 计算终点（影视墙位置）
                    const length = parseFloat(document.getElementById('length').value) || 5.0;
                    const slEnd = new THREE.Vector3(
                        -length/2, // 影视墙X坐标
                        slSpeakerPos.y,
                        slSpeakerPos.z + 0.2
                    );

                    // 创建标注
                    slAnnotation = createAnnotationLine(slStart, slEnd, 0x0000FF); // 蓝色标注
                    scene.add(slAnnotation);

                    // 创建文字标注
                    const slDistance = slStart.distanceTo(slEnd).toFixed(2);
                    slLabel = createAnnotationLabel(slStart, slEnd, slDistance, '#0000FF');
                    scene.add(slLabel);
                }

                // 创建右前环绕标注
                if (currentFLRSpeaker && currentFLRSpeaker.visible) {
                    const flrSpeakerPos = currentFLRSpeaker.position.clone();
                    
                    // 计算起点（Z轴负方向偏移0.2米）
                    const flrStart = new THREE.Vector3(
                        flrSpeakerPos.x,
                        flrSpeakerPos.y,
                        flrSpeakerPos.z - 0.2
                    );

                    // 计算终点（影视墙位置）
                    const length = parseFloat(document.getElementById('length').value) || 5.0;
                    const flrEnd = new THREE.Vector3(
                        -length/2, // 影视墙X坐标
                        flrSpeakerPos.y,
                        flrSpeakerPos.z - 0.2
                    );

                    // 创建标注
                    flrAnnotation = createAnnotationLine(flrStart, flrEnd, 0xFF0000); // 红色标注
                    scene.add(flrAnnotation);

                    // 创建文字标注
                    const flrDistance = flrStart.distanceTo(flrEnd).toFixed(2);
                    flrLabel = createAnnotationLabel(flrStart, flrEnd, flrDistance, '#FF0000');
                    scene.add(flrLabel);
                }

                // 创建天空前置左声道标注
                if (currentTFLSpeaker) {
                    const tflSpeakerPos = currentTFLSpeaker.position.clone();
                    
                    // 计算起点（Y轴负方向偏移0.2米）
                    const tflStart = new THREE.Vector3(
                        tflSpeakerPos.x,
                        tflSpeakerPos.y,
                        tflSpeakerPos.z+0.2
                    );

                    // 计算终点（影视墙位置）
                    const length = parseFloat(document.getElementById('length').value) || 5.0;
                    const tflEnd = new THREE.Vector3(
                        -length/2, // 影视墙X坐标
                        tflSpeakerPos.y,
                        tflSpeakerPos.z+0.2
                    );

                    // 创建标注
                    tflAnnotation = createAnnotationLine(tflStart, tflEnd, 0x00FF00); // 绿色标注
                    scene.add(tflAnnotation);

                    // 创建文字标注
                    const tflDistance = tflStart.distanceTo(tflEnd).toFixed(2);
                    tflLabel = createAnnotationLabel(tflStart, tflEnd, tflDistance, '#00FF00');
                    scene.add(tflLabel);
                }

                // 创建天空后置右声道标注
                if (currentTRRSpeaker) {
                    const trrSpeakerPos = currentTRRSpeaker.position.clone();
                    
                    // 计算起点（Y轴负方向偏移0.2米）
                    const trrStart = new THREE.Vector3(
                        trrSpeakerPos.x,
                        trrSpeakerPos.y,
                        trrSpeakerPos.z-0.2
                    );

                    // 计算终点（影视墙位置）
                    const length = parseFloat(document.getElementById('length').value) || 5.0;
                    const trrEnd = new THREE.Vector3(
                        -length/2, // 影视墙X坐标
                        trrSpeakerPos.y,
                        trrSpeakerPos.z-0.2
                    );

                    // 创建标注
                    trrAnnotation = createAnnotationLine(trrStart, trrEnd, 0xFFA500); // 橙色标注
                    scene.add(trrAnnotation);

                    // 创建文字标注
                    const trrDistance = trrStart.distanceTo(trrEnd).toFixed(2);
                    trrLabel = createAnnotationLabel(trrStart, trrEnd, trrDistance, '#FFA500');
                    scene.add(trrLabel);
                }

                // 创建皇帝位标注
                if (sphere) {
                    // 清理旧标注
                    if (sphereAnnotation) {
                        scene.remove(sphereAnnotation);
                        sphereAnnotation = null;
                    }
                    if (sphereAnnotation2) {
                        scene.remove(sphereAnnotation2);
                        sphereAnnotation2 = null;
                    }
                    if (sphereLabel) {
                        scene.remove(sphereLabel);
                        sphereLabel = null;
                    }
                    if (sphereLabel2) {
                        scene.remove(sphereLabel2);
                        sphereLabel2 = null;
                    }

                    const spherePos = sphere.position.clone();
                    
                    // 第一个标注：Z轴方向
                    const sphereStart1 = new THREE.Vector3(
                        spherePos.x,
                        spherePos.y,
                        spherePos.z + 0.2
                    );
                    const length = parseFloat(document.getElementById('length').value) || 5.0;
                    const height = parseFloat(document.getElementById('height').value) || 5.0;
                    const sphereEnd1 = new THREE.Vector3(
                        -length/2, // 影视墙X坐标
                        spherePos.y,
                        spherePos.z + 0.2
                    );
                    sphereAnnotation = createAnnotationLine(sphereStart1, sphereEnd1, 0x800080); // 紫色标注
                    scene.add(sphereAnnotation);

                    // 第一个标注的文字
                    const sphereDistance1 = sphereStart1.distanceTo(sphereEnd1).toFixed(2);
                    sphereLabel = createAnnotationLabel(sphereStart1, sphereEnd1, sphereDistance1, '#800080');
                    scene.add(sphereLabel);

                    // 第二个标注：Y轴方向
                    const sphereStart2 = new THREE.Vector3(
                        spherePos.x,
                        spherePos.y ,
                        spherePos.z+0.2
                    );
                    const sphereEnd2 = new THREE.Vector3(
                        spherePos.x, 
                        -height/2,
                        spherePos.z+0.2
                    );
                    sphereAnnotation2 = createAnnotationLine(sphereStart2, sphereEnd2, 0xffff00); // 粉红色标注
                    scene.add(sphereAnnotation2);

                    // 第二个标注的文字
                    const sphereDistance2 = sphereStart2.distanceTo(sphereEnd2).toFixed(2);
                    sphereLabel2 = createAnnotationLabel(sphereStart2, sphereEnd2, sphereDistance2, '#ffff00');
                    scene.add(sphereLabel2);
                }

                // 创建投影机标注
                if (currentProjector) {
                    const projectorPos = currentProjector.position.clone();
                    
                    // 计算起点（Y轴负方向偏移0.2米）
                    const projectorStart = new THREE.Vector3(
                        projectorPos.x-0.25,
                        projectorPos.y,
                        projectorPos.z-0.3
                    );

                    // 计算终点（影视墙位置）
                    const length = parseFloat(document.getElementById('length').value) || 5.0;
                    const projectorEnd = new THREE.Vector3(
                        -length/2, // 影视墙X坐标
                        projectorPos.y,
                        projectorPos.z-0.3
                    );

                    // 创建标注
                    projectorAnnotation = createAnnotationLine(projectorStart, projectorEnd, 0xFF00FF); // 品红色标注
                    scene.add(projectorAnnotation);

                    // 创建文字标注
                    const projectorDistance = projectorStart.distanceTo(projectorEnd).toFixed(2);
                    projectorLabel = createAnnotationLabel(projectorStart, projectorEnd, projectorDistance, '#FF00FF');
                    scene.add(projectorLabel);
                }

                // 创建后置左环绕标注
                if (currentSRLSpeaker) {
                    const srlSpeakerPos = currentSRLSpeaker.position.clone();
                    
                    // 计算起点（Z轴正方向偏移0.2米）
                    const srlStart = new THREE.Vector3(
                        srlSpeakerPos.x+0.1,
                        srlSpeakerPos.y,
                        srlSpeakerPos.z
                    );

                    // 计算终点（左侧墙位置）
                    const length = parseFloat(document.getElementById('length').value) || 5.0;
                    const width = parseFloat(document.getElementById('width').value) || 5.0;
                    const srlEnd = new THREE.Vector3(
                        length/2+0.15, // 左墙X坐标
                        srlSpeakerPos.y,
                        width/2
                    );

                    // 创建标注
                    srlAnnotation = createAnnotationLine(srlStart, srlEnd, 0x8A2BE2); // 蓝紫色标注
                    scene.add(srlAnnotation);

                    // 创建文字标注
                    const srlDistance = srlStart.distanceTo(srlEnd).toFixed(2);
                    srlLabel = createAnnotationLabel(srlStart, srlEnd, srlDistance, '#8A2BE2');
                    scene.add(srlLabel);
                }

                // 创建天空后置左声道标注
                if (currentTRLSpeaker) {
                    const trlSpeakerPos = currentTRLSpeaker.position.clone();
                    
                    // 计算起点（Y轴负方向偏移0.2米）
                    const trlStart = new THREE.Vector3(
                        trlSpeakerPos.x-0.2,
                        trlSpeakerPos.y,
                        trlSpeakerPos.z
                    );

                    // 计算终点（影视墙位置）
                    const length = parseFloat(document.getElementById('length').value) || 5.0;
                    const width = parseFloat(document.getElementById('width').value) || 5.0;
                    const trlEnd = new THREE.Vector3(
                        trlSpeakerPos.x-0.2, // 影视墙X坐标
                        trlSpeakerPos.y,
                        width/2
                    );

                    // 创建标注
                    trlAnnotation = createAnnotationLine(trlStart, trlEnd, 0x00CED1); // 深青色标注
                    scene.add(trlAnnotation);

                    // 创建文字标注
                    const trlDistance = trlStart.distanceTo(trlEnd).toFixed(2);
                    trlLabel = createAnnotationLabel(trlStart, trlEnd, trlDistance, '#00CED1');
                    scene.add(trlLabel);
                }
            }

            // 创建标注线的辅助函数
            function createAnnotationLine(start, end, color) {
                const points = [start, end];
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({
                    color: color,
                    linewidth: 2
                });
                const mainLine = new THREE.Line(geometry, material);

                // 创建端点线段
                const endLineLength = 0.20; // 5px 转换为 Three.js 单位（假设 1单位=1米）
                const direction = new THREE.Vector3().subVectors(end, start).normalize();
                const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x); // 垂直于主线的方向

                // 起点端点
                const startEnd1 = start.clone().add(perpendicular.clone().multiplyScalar(endLineLength/2));
                const startEnd2 = start.clone().sub(perpendicular.clone().multiplyScalar(endLineLength/2));
                const startEndGeometry = new THREE.BufferGeometry().setFromPoints([startEnd1, startEnd2]);
                const startEndLine = new THREE.Line(startEndGeometry, material);

                // 终点端点
                const endEnd1 = end.clone().add(perpendicular.clone().multiplyScalar(endLineLength/2));
                const endEnd2 = end.clone().sub(perpendicular.clone().multiplyScalar(endLineLength/2));
                const endEndGeometry = new THREE.BufferGeometry().setFromPoints([endEnd1, endEnd2]);
                const endEndLine = new THREE.Line(endEndGeometry, material);

                // 创建组并添加所有线段
                const annotationGroup = new THREE.Group();
                annotationGroup.add(mainLine);
                annotationGroup.add(startEndLine);
                annotationGroup.add(endEndLine);

                return annotationGroup;
            }

            // 创建文字标注的辅助函数
            function createAnnotationLabel(start, end, distance, color) {
                const middlePoint = new THREE.Vector3().lerpVectors(start, end, 0.5);
                const div = document.createElement('div');
                div.textContent = `${distance}米`;
                div.style.color = color;
                div.style.fontSize = '17px';
                div.style.textShadow = '0 0 2px black';

                const label = new THREE.CSS2DObject(div);
                label.position.copy(middlePoint);
                return label;
            }

            function generateSPK() {
                // 先移除所有现有的音箱
                [
                    currentCenterSpeaker, currentLeftSpeaker, currentRightSpeaker,
                    currentSLSpeaker, currentSRSpeaker, currentSRLSpeaker,
                    currentSRRSpeaker, currentTFLSpeaker, currentTFRSpeaker,
                    currentTRLSpeaker, currentTRRSpeaker,
                    currentFLLSpeaker, currentFLRSpeaker,
                    currentTCLSpeaker, currentTCRSpeaker
                ].forEach(speaker => {
                    if (speaker) {
                        scene.remove(speaker);
                    }
                });

                // 移除旧标注
                if (slAnnotation) scene.remove(slAnnotation);
                if (flrAnnotation) scene.remove(flrAnnotation);
                if (slLabel) scene.remove(slLabel);
                if (flrLabel) scene.remove(flrLabel);
                slAnnotation = null;
                slLabel = null;
                flrAnnotation = null;
                flrLabel = null;

                const length = parseFloat(document.getElementById('length').value) || 5.0;
                const width = parseFloat(document.getElementById('width').value) || 4.0;
                const height = parseFloat(document.getElementById('height').value) || 2.7;
                const earHeight = parseFloat(document.getElementById('earHeight').value) || 1.2;
                const mainSpeakerAngle = parseFloat(document.getElementById('mainSpeakerAngle').value) || 45;
                const frontSurroundAngle = parseFloat(document.getElementById('frontSurroundAngle').value) || 60;
                const sideSurroundAngle = parseFloat(document.getElementById('sideSurroundAngle').value) || 90;
                const rearSurroundAngle = parseFloat(document.getElementById('rearSurroundAngle').value) || 60;
                const frontSkyAngle = parseFloat(document.getElementById('frontSkyAngle').value) || 55;
                const rearSkyAngle = parseFloat(document.getElementById('rearSkyAngle').value) || 125;

                updateSpherePosition();
                const sphereX = sphere.position.x;
                const sphereY = sphere.position.y;
                

                // 更新 range 输入框的值
                document.getElementById('length-range').value = length;
                document.getElementById('width-range').value = width;
                document.getElementById('height-range').value = height;
                document.getElementById('earHeight-range').value = earHeight;
                document.getElementById('viewAngle-range').value = document.getElementById('viewAngle').value;
                document.getElementById('mainSpeakerAngle-range').value = mainSpeakerAngle;
                document.getElementById('sideSurroundAngle-range').value = sideSurroundAngle;
                document.getElementById('rearSurroundAngle-range').value = rearSurroundAngle;
                document.getElementById('frontSkyAngle-range').value = frontSkyAngle;
                document.getElementById('rearSkyAngle-range').value = rearSkyAngle;

                


                // 生成中置音箱
                    const centerX = -length / 2 - 0.05; // x轴坐标是房间长度的一半的负值再减去5cm（转换为米）
                    const centerY = earHeight - height/2;
                    const centerZ = 0;
                    const speakerWidth = 0.1;
                    const speakerHeight = 0.2;
                    const speakerDepth = 0.4;

                    const speakerGeometry = new THREE.BoxGeometry(speakerWidth, speakerHeight, speakerDepth);
                    const speakerMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });

                    currentCenterSpeaker = new THREE.Mesh(speakerGeometry, speakerMaterial);
                    currentCenterSpeaker.speakerType = 'center';
                    currentCenterSpeaker.position.set(centerX, centerY, centerZ);
                    scene.add(currentCenterSpeaker);

                // 生成左声道音箱
                    const leftSpeakerWidth = 0.1;
                    const leftSpeakerHeight = 0.4;
                    const leftSpeakerDepth = 0.2;
                    const leftSpeakerX = -length / 2 - 0.05;
                    const leftSpeakerY = earHeight - height/2;
                    const leftSpeakerZ = Math.tan((mainSpeakerAngle / 2) * (Math.PI / 180)) * (sphere.position.x + length / 2);

                    const leftSpeakerGeometry = new THREE.BoxGeometry(leftSpeakerWidth, leftSpeakerHeight, leftSpeakerDepth);
                    const leftSpeakerMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });

                    currentLeftSpeaker = new THREE.Mesh(leftSpeakerGeometry, leftSpeakerMaterial);
                    currentLeftSpeaker.speakerType = 'front-left';
                    currentLeftSpeaker.position.set(leftSpeakerX, leftSpeakerY, leftSpeakerZ);
                    scene.add(currentLeftSpeaker);

                // 生成右声道音箱
                    const rightSpeakerWidth = 0.1;
                    const rightSpeakerHeight = 0.4;
                    const rightSpeakerDepth = 0.2;

                    const viewAngle = parseFloat(document.getElementById('viewAngle').value);

                    const rightSpeakerX = -(length / 2) - 0.05;
                    const rightSpeakerY = earHeight - height/2;
                    const rightSpeakerZ = -Math.tan((mainSpeakerAngle / 2) * (Math.PI / 180)) * (sphereX + length / 2);

                    const rightSpeakerGeometry = new THREE.BoxGeometry(rightSpeakerWidth, rightSpeakerHeight, rightSpeakerDepth);
                    const rightSpeakerMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
                    currentRightSpeaker = new THREE.Mesh(rightSpeakerGeometry, rightSpeakerMaterial);
                    currentRightSpeaker.speakerType = 'front-right';
                    currentRightSpeaker.position.set(rightSpeakerX, rightSpeakerY, rightSpeakerZ);
                    scene.add(currentRightSpeaker);

                // 生成左环绕声道音箱
                    const leftSurroundWidth = 0.2;
                    const leftSurroundHeight = 0.4;
                    const leftSurroundDepth = 0.1;
                    const leftSurroundX = Math.tan((sideSurroundAngle - 90) * (Math.PI / 180)) * (width / 2)+sphereX;
                    const leftSurroundY = earHeight - height/2;
                    const leftSurroundZ = width / 2 + 0.05;

                    const leftSurroundGeometry = new THREE.BoxGeometry(leftSurroundWidth, leftSurroundHeight, leftSurroundDepth);
                    const leftSurroundMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
                    currentSLSpeaker = new THREE.Mesh(leftSurroundGeometry, leftSurroundMaterial);
                    currentSLSpeaker.speakerType = 'surround-left';
                    currentSLSpeaker.position.set(leftSurroundX, leftSurroundY, leftSurroundZ);
                    scene.add(currentSLSpeaker);

                // 生成右环绕声道音箱
                    const rightSurroundWidth = 0.2;
                    const rightSurroundHeight = 0.4;
                    const rightSurroundDepth = 0.1;

                    const rightSurroundX = Math.tan((sideSurroundAngle - 90) * (Math.PI / 180)) * (width / 2) + sphereX;
                    const rightSurroundY = earHeight - height/2;
                    const rightSurroundZ = -width / 2 - 0.05;

                    const rightSurroundGeometry = new THREE.BoxGeometry(rightSurroundWidth, rightSurroundHeight, rightSurroundDepth);
                    const rightSurroundMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });

                    currentSRSpeaker = new THREE.Mesh(rightSurroundGeometry, rightSurroundMaterial);
                    currentSRSpeaker.speakerType = 'surround-right';
                    currentSRSpeaker.position.set(rightSurroundX, rightSurroundY, rightSurroundZ);
                    scene.add(currentSRSpeaker);

                // 生成左后环绕声道音箱
                    const leftRearSurroundWidth = 0.1;
                    const leftRearSurroundHeight = 0.4;
                    const leftRearSurroundDepth = 0.2;

                    const leftRearSurroundX = length / 2 + 0.05;
                    const leftRearSurroundY = earHeight - height/2;
                    const leftRearSurroundZ = Math.tan((rearSurroundAngle / 2) * (Math.PI / 180)) * (length / 2 - sphereX);

                    const leftRearSurroundGeometry = new THREE.BoxGeometry(leftRearSurroundWidth, leftRearSurroundHeight, leftRearSurroundDepth);
                    const leftRearSurroundMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });

                    currentSRLSpeaker = new THREE.Mesh(leftRearSurroundGeometry, leftRearSurroundMaterial);
                    currentSRLSpeaker.speakerType = 'rear-left';
                    currentSRLSpeaker.position.set(leftRearSurroundX, leftRearSurroundY, leftRearSurroundZ);
                    scene.add(currentSRLSpeaker);

                // 生成右后环绕声道音箱
                    const rightRearSurroundWidth = 0.1;
                    const rightRearSurroundHeight = 0.4;
                    const rightRearSurroundDepth = 0.2;

                    const rightRearSurroundX = length / 2 + 0.05;
                    const rightRearSurroundY = earHeight - height/2;
                    const rightRearSurroundZ = -Math.tan((rearSurroundAngle / 2) * (Math.PI / 180)) * (length / 2 - sphereX);

                    const rightRearSurroundGeometry = new THREE.BoxGeometry(rightRearSurroundWidth, rightRearSurroundHeight, rightRearSurroundDepth);
                    const rightRearSurroundMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });

                    currentSRRSpeaker = new THREE.Mesh(rightRearSurroundGeometry, rightRearSurroundMaterial);
                    currentSRRSpeaker.speakerType = 'rear-right';
                    currentSRRSpeaker.position.set(rightRearSurroundX, rightRearSurroundY, rightRearSurroundZ);
                    scene.add(currentSRRSpeaker);

                // 生成天空前置左声道音箱
                    const frontSkyLeftRadius = 0.1;
                    const frontSkyLeftHeight = 0.01;

                    const frontSkyLeftX = sphereX - Math.tan(((90 - frontSkyAngle) * Math.PI) / 180) * (height / 2 - sphereY);
                    const frontSkyLeftY = height - height/2;
                    const frontSkyLeftZ = Math.tan(30 * Math.PI / 180) * (height / 2 - sphereY);

                    const frontSkyLeftGeometry = new THREE.CylinderGeometry(frontSkyLeftRadius, frontSkyLeftRadius, frontSkyLeftHeight, 32);
                    const frontSkyLeftMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });

                    currentTFLSpeaker = new THREE.Mesh(frontSkyLeftGeometry, frontSkyLeftMaterial);
                    currentTFLSpeaker.speakerType = 'top-front-left';
                    currentTFLSpeaker.position.set(frontSkyLeftX, frontSkyLeftY, frontSkyLeftZ);
                    scene.add(currentTFLSpeaker);

                // 生成天空前置右声道音箱
                    const frontSkyRightRadius = 0.1;
                    const frontSkyRightHeight = 0.01;

                    const frontSkyRightX = sphereX - Math.tan(((90 - frontSkyAngle) * Math.PI) / 180) * (height / 2 - sphereY);
                    const frontSkyRightY = height - height/2;
                    const frontSkyRightZ = -Math.tan(30 * Math.PI / 180) * (height / 2 - sphereY);

                    const frontSkyRightGeometry = new THREE.CylinderGeometry(frontSkyRightRadius, frontSkyRightRadius, frontSkyRightHeight, 32);
                    const frontSkyRightMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });

                    currentTFRSpeaker = new THREE.Mesh(frontSkyRightGeometry, frontSkyRightMaterial);
                    currentTFRSpeaker.speakerType = 'top-front-right';
                    currentTFRSpeaker.position.set(frontSkyRightX, frontSkyRightY, frontSkyRightZ);
                    scene.add(currentTFRSpeaker);

                // 生成天空后置左声道音箱
                    const rearSkyLeftRadius = 0.1;
                    const rearSkyLeftHeight = 0.01;

                    const rearSkyLeftX = sphereX + Math.tan(((rearSkyAngle - 90) * Math.PI) / 180) * (height / 2 - sphereY);
                    const rearSkyLeftY = height - height/2;
                    const rearSkyLeftZ = Math.tan(30 * Math.PI / 180) * (height / 2 - sphereY);

                    const rearSkyLeftGeometry = new THREE.CylinderGeometry(rearSkyLeftRadius, rearSkyLeftRadius, rearSkyLeftHeight, 32);
                    const rearSkyLeftMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });

                    currentTRLSpeaker = new THREE.Mesh(rearSkyLeftGeometry, rearSkyLeftMaterial);
                    currentTRLSpeaker.speakerType = 'top-rear-left';
                    currentTRLSpeaker.position.set(rearSkyLeftX, rearSkyLeftY, rearSkyLeftZ);
                    scene.add(currentTRLSpeaker);

                // 生成天空后置右声道音箱
                    const rearSkyRightRadius = 0.1;
                    const rearSkyRightHeight = 0.01;

                    const rearSkyRightX = sphereX + Math.tan(((rearSkyAngle - 90) * Math.PI) / 180) * (height / 2 - sphereY);
                    const rearSkyRightY = height - height/2;
                    const rearSkyRightZ = -Math.tan(30 * Math.PI / 180) * (height / 2 - sphereY);

                    const rearSkyRightGeometry = new THREE.CylinderGeometry(rearSkyRightRadius, rearSkyRightRadius, rearSkyRightHeight, 32);
                    const rearSkyRightMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });

                    currentTRRSpeaker = new THREE.Mesh(rearSkyRightGeometry, rearSkyRightMaterial);
                    currentTRRSpeaker.speakerType = 'top-rear-right';
                    currentTRRSpeaker.position.set(rearSkyRightX, rearSkyRightY, rearSkyRightZ);
                    scene.add(currentTRRSpeaker);

                // 生成左前环绕声道音箱
                const frontLeftLeftWidth = 0.2;
                const frontLeftLeftHeight = 0.4;
                const frontLeftLeftDepth = 0.1;
                const frontLeftLeftX = Math.tan((frontSurroundAngle - 90) * (Math.PI / 180)) * (width / 2) + sphereX;
                const frontLeftLeftY = earHeight - height/2;
                const frontLeftLeftZ = width / 2 + 0.05;

                const frontLeftLeftGeometry = new THREE.BoxGeometry(frontLeftLeftWidth, frontLeftLeftHeight, frontLeftLeftDepth);
                const frontLeftLeftMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
                currentFLLSpeaker = new THREE.Mesh(frontLeftLeftGeometry, frontLeftLeftMaterial);
                currentFLLSpeaker.speakerType = 'front-left-left';
                currentFLLSpeaker.position.set(frontLeftLeftX, frontLeftLeftY, frontLeftLeftZ);
                scene.add(currentFLLSpeaker);

                // 生成右前环绕声道音箱
                const frontRightRightWidth = 0.2;
                const frontRightRightHeight = 0.4;
                const frontRightRightDepth = 0.1;
                const frontRightRightX = Math.tan((frontSurroundAngle - 90) * (Math.PI / 180)) * (width / 2) + sphereX;
                const frontRightRightY = earHeight - height/2;
                const frontRightRightZ = -width / 2 - 0.05;

                const frontRightRightGeometry = new THREE.BoxGeometry(frontRightRightWidth, frontRightRightHeight, frontRightRightDepth);
                const frontRightRightMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
                currentFLRSpeaker = new THREE.Mesh(frontRightRightGeometry, frontRightRightMaterial);
                currentFLRSpeaker.speakerType = 'front-right-right';
                currentFLRSpeaker.position.set(frontRightRightX, frontRightRightY, frontRightRightZ);
                scene.add(currentFLRSpeaker);

                // 生成天空中置左声道音箱
                const topCenterLeftRadius = 0.1;
                const topCenterLeftHeight = 0.01;
                const topCenterLeftX = sphereX;
                const topCenterLeftY = height - height/2;
                const topCenterLeftZ = Math.tan(30 * Math.PI / 180) * (height / 2 - sphereY);

                const topCenterLeftGeometry = new THREE.CylinderGeometry(topCenterLeftRadius, topCenterLeftRadius, topCenterLeftHeight, 32);
                const topCenterLeftMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
                currentTCLSpeaker = new THREE.Mesh(topCenterLeftGeometry, topCenterLeftMaterial);
                currentTCLSpeaker.speakerType = 'top-center-left';
                currentTCLSpeaker.position.set(topCenterLeftX, topCenterLeftY, topCenterLeftZ);
                scene.add(currentTCLSpeaker);

                // 生成天空中置右声道音箱
                const topCenterRightRadius = 0.1;
                const topCenterRightHeight = 0.01;
                const topCenterRightX = sphereX;
                const topCenterRightY = height - height/2;
                const topCenterRightZ = -Math.tan(30 * Math.PI / 180) * (height / 2 - sphereY);

                const topCenterRightGeometry = new THREE.CylinderGeometry(topCenterRightRadius, topCenterRightRadius, topCenterRightHeight, 32);
                const topCenterRightMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
                currentTCRSpeaker = new THREE.Mesh(topCenterRightGeometry, topCenterRightMaterial);
                currentTCRSpeaker.speakerType = 'top-center-right';
                currentTCRSpeaker.position.set(topCenterRightX, topCenterRightY, topCenterRightZ);
                scene.add(currentTCRSpeaker);

                updateSpherePosition();
                    // 初始可见性设置
                    const currentConfig = document.querySelector('input[name="speakerConfig"]:checked').value;
                    updateSpeakerVisibility(currentConfig);

            }

            let currentProjector = null; // 投影机作为音箱设备
            let projectorCubes = []; // 存储投影机旁的小立方体

            function createProjector(screenWidth, screenHeight) {
                // 投影机尺寸（转换为米）
                const projectorWidth = 0.5;
                const projectorHeight = 0.2; 
                const projectorDepth = 0.6;

                // 创建圆角投影机几何体
                const radius = 0.05; // 圆角半径
                const segments = 8; // 圆角分段数
                const geometry = new THREE.RoundedBoxGeometry(
                    projectorWidth, 
                    projectorHeight, 
                    projectorDepth,
                    segments,
                    radius
                );
                const material = new THREE.MeshPhongMaterial({ 
                    color: 0x808080,
                    flatShading: true // 启用平面着色
                });
                const projector = new THREE.Mesh(geometry, material);

                // 将投影机标记为音箱设备
                projector.speakerType = 'projector';

                // 获取投射比
                const throwRatio = parseFloat(document.getElementById('throwRatio').value) || 1.5;

                // 计算投影机位置
                const roomLength = parseFloat(document.getElementById('length').value) || 5.0;
                const xPos = (screenWidth * throwRatio) - (roomLength / 2)+0.25; // X轴位置 = 幕布宽度 * 投射比 - 房间长度的一半
                const yPos = (screenHeight / 2)-0.1; // Y轴位置 = 幕布高度/2
                projector.position.set(xPos, yPos, 0);

                // 旋转投影机使其朝向幕布i
                projector.rotation.y = Math.PI;

                return projector;
            }

            function generateModel(createAnnotations = true){
                // 保存当前标注可见性状态
                const annotationStates = {
                    speaker: document.getElementById('showSpeakerPoints').checked,
                    projector: document.getElementById('showProjectorPoints').checked,
                    sweetSpot: document.getElementById('showSweetSpot').checked
                };

                if (currentRoom) scene.remove(currentRoom);
                if (currentScreen) scene.remove(currentScreen); 
                if (currentProjector) scene.remove(currentProjector);
                if (slAnnotation) {
                    scene.remove(slAnnotation);
                    scene.remove(slLabel);
                    slAnnotation = null;
                    slLabel = null;
                }
                if (flrAnnotation) {
                    scene.remove(flrAnnotation);
                    scene.remove(flrLabel);
                    flrAnnotation = null;
                    flrLabel = null;
                }

                const length = parseFloat(document.getElementById('length').value) || 5.0;
                const width = parseFloat(document.getElementById('width').value) || 4.0;
                const height = parseFloat(document.getElementById('height').value) || 2.7;

                 if (isNaN(length) || isNaN(width) || isNaN(height)) {
                    console.error("房间尺寸参数无效");
                    return;
                }

                currentRoom = createRoom(length, height, width);
                currentScreen = createScreen(length, height, width);

                scene.add(currentRoom);
                scene.add(currentScreen);

                // 获取屏幕实际尺寸
                if (currentScreen && currentScreen.children.length > 0) {
                    const screenMesh = currentScreen.children[0];
                    const screenWidth = screenMesh.geometry.parameters.width;
                    const screenHeight = screenMesh.geometry.parameters.height;
                    
                    // 创建并添加投影机
                    if (document.getElementById('showProjector').checked) {
                        currentProjector = createProjector(screenWidth, screenHeight);
                        scene.add(currentProjector);
                
                        // 创建投影机旁的小立方体
                        if (projectorCubes.length === 0) {
                            for (let i = 0; i < 3; i++) {
                                const geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
                                const material = new THREE.MeshBasicMaterial({ 
                                    color: i < 2 ? 0x0000ff : 0x00ff00, // 前两个蓝色，第三个绿色
                                    transparent: true,
                                    opacity: 0.8,
                                    depthTest: false
                                });
                                const cube = new THREE.Mesh(geometry, material);
                                cube.renderOrder = 999;
                                cube.userData.id = `projector-cube-${i}`;
                                projectorCubes.push(cube);
                                scene.add(cube);
                            }
                        }
                
                        // 更新小立方体位置
                        const projectorX = currentProjector.position.x;
                        const projectorY = currentProjector.position.y;
                        const offsetX = 0.25; // 25cm
                
                        for (let i = 0; i < projectorCubes.length; i++) {
                            projectorCubes[i].position.set(
                                projectorX + offsetX,
                                projectorY,
                                i * (CUBE_SIZE + GAP) - (CUBE_SIZE + GAP) // 居中排列
                            );
                        }
                    } else if (currentProjector) {
                        scene.remove(currentProjector);
                        currentProjector = null;
                    
                        // 移除投影机旁的小立方体
                        projectorCubes.forEach(cube => scene.remove(cube));
                        projectorCubes = [];
                    }
                }

                updateSpherePosition();
                generateSPK();
                if (createAnnotations) {
                    createAnnotation(); // 更新左环绕标注
                }
                updateModelInfo();
                updateSliderRanges();
                updateCabinetPosition();
                
                // 恢复标注可见性状态
                updateAnnotationVisibility(annotationStates);
            }

            function updateModelInfo() {
                // 获取房间参数
                const length = parseFloat(document.getElementById('length').value) || 0;
                const width = parseFloat(document.getElementById('width').value) || 0;
                const height = parseFloat(document.getElementById('height').value) || 1; // 确保分母不为零
                
                // 计算房间信息
                const area = length * width;
                const volume = length * width * height;

                // 计算比例（高度标准化为1）
                const baseHeight = height || 1; // 防止除零错误
                const lengthRatio = (length / baseHeight).toFixed(2);
                const widthRatio = (width / baseHeight).toFixed(2);
                            
                // 更新显示
                document.getElementById('room-ratio').textContent = 
                    `${lengthRatio}:${widthRatio}:1.00`; // 固定高度显示为1.00
                            
                document.getElementById('room-area').textContent = (length * width).toFixed(2);
                document.getElementById('room-volume').textContent = (length * width * height).toFixed(2);


                // 计算投影幕信息
                const screenSize = parseFloat(document.getElementById('screenSize').value) || 0;
                const ratio = document.getElementById('screenRatio').value.split('/');
                const ratioW = parseFloat(ratio[0]);
                const ratioH = parseFloat(ratio[1]);
                const diagonal = screenSize * 0.0254; // 转换为米
                
                // 根据勾股定理计算实际尺寸
                const screenWidth = (diagonal * ratioW) / Math.sqrt(ratioW**2 + ratioH**2);
                const screenHeight = (diagonal * ratioH) / Math.sqrt(ratioW**2 + ratioH**2);
             
                // 更新显示
                document.getElementById('room-area').textContent = area.toFixed(2);
                document.getElementById('room-volume').textContent = volume.toFixed(2);
                document.getElementById('screen-width').textContent = screenWidth.toFixed(2);
                document.getElementById('screen-height').textContent = screenHeight.toFixed(2);
            }

            // 音箱可见性控制函数
            function updateSpeakerAnnotations() {
                const showSpeakerPoints = document.getElementById('showSpeakerPoints').checked;
                const showProjectorPoints = document.getElementById('showProjectorPoints').checked;
                const showSweetSpot = document.getElementById('showSweetSpot').checked;

                // Hide all annotations first
                [leftAnnotation, slAnnotation, flrAnnotation, srlAnnotation, tflAnnotation, trrAnnotation].forEach(anno => {
                    if (anno) anno.visible = false;
                });
                [leftLabel, slLabel, flrLabel, srlLabel, tflLabel, trrLabel].forEach(label => {
                    if (label) label.visible = false;
                });

                // Handle projector annotation
                if (projectorAnnotation) projectorAnnotation.visible = showProjectorPoints;
                if (projectorLabel) projectorLabel.visible = showProjectorPoints;

                // Handle sweet spot annotations
                if (sphereAnnotation) sphereAnnotation.visible = showSweetSpot;
                if (sphereAnnotation2) sphereAnnotation2.visible = showSweetSpot;
                if (sphereLabel) sphereLabel.visible = showSweetSpot;
                if (sphereLabel2) sphereLabel2.visible = showSweetSpot;

                // Only show speaker annotations if checkbox is checked
                if (showSpeakerPoints) {
                    // Get current speaker configuration
                    const config = document.querySelector('input[name="speakerConfig"]:checked').value;
                    
                    // Show annotations based on configuration
                    switch(config) {
                        case '5.1':
                            if (leftAnnotation) leftAnnotation.visible = true;
                            if (slAnnotation) slAnnotation.visible = true;
                            if (leftLabel) leftLabel.visible = true;
                            if (slLabel) slLabel.visible = true;
                            break;
                        case '5.1.2':
                            if (leftAnnotation) leftAnnotation.visible = true;
                            if (slAnnotation) slAnnotation.visible = true;
                            if (tflAnnotation) tflAnnotation.visible = true;
                            if (leftLabel) leftLabel.visible = true;
                            if (slLabel) slLabel.visible = true;
                            if (tflLabel) tflLabel.visible = true;
                            break;
                        case '5.1.4':
                            if (leftAnnotation) leftAnnotation.visible = true;
                            if (slAnnotation) slAnnotation.visible = true;
                            if (tflAnnotation) tflAnnotation.visible = true;
                            if (trrAnnotation) trrAnnotation.visible = true;
                            if (leftLabel) leftLabel.visible = true;
                            if (slLabel) slLabel.visible = true;
                            if (tflLabel) tflLabel.visible = true;
                            if (trrLabel) trrLabel.visible = true;
                            break;
                        case '7.1':
                            if (leftAnnotation) leftAnnotation.visible = true;
                            if (slAnnotation) slAnnotation.visible = true;
                            if (srlAnnotation) srlAnnotation.visible = true;
                            if (leftLabel) leftLabel.visible = true;
                            if (slLabel) slLabel.visible = true;
                            if (srlLabel) srlLabel.visible = true;
                            break;
                        case '7.1.2':
                            if (leftAnnotation) leftAnnotation.visible = true;
                            if (slAnnotation) slAnnotation.visible = true;
                            if (srlAnnotation) srlAnnotation.visible = true;
                            if (tflAnnotation) tflAnnotation.visible = true;
                            if (leftLabel) leftLabel.visible = true;
                            if (slLabel) slLabel.visible = true;
                            if (srlLabel) srlLabel.visible = true;
                            if (tflLabel) tflLabel.visible = true;
                            break;
                        case '7.1.4':
                            if (leftAnnotation) leftAnnotation.visible = true;
                            if (slAnnotation) slAnnotation.visible = true;
                            if (srlAnnotation) srlAnnotation.visible = true;
                            if (tflAnnotation) tflAnnotation.visible = true;
                            if (trrAnnotation) trrAnnotation.visible = true;
                            if (leftLabel) leftLabel.visible = true;
                            if (slLabel) slLabel.visible = true;
                            if (srlLabel) srlLabel.visible = true;
                            if (tflLabel) tflLabel.visible = true;
                            if (trrLabel) trrLabel.visible = true;
                            break;
                        case '9.1.4':
                        case '9.1.6':
                            if (leftAnnotation) leftAnnotation.visible = true;
                            if (slAnnotation) slAnnotation.visible = true;
                            if (flrAnnotation) flrAnnotation.visible = true;
                            if (srlAnnotation) srlAnnotation.visible = true;
                            if (tflAnnotation) tflAnnotation.visible = true;
                            if (trrAnnotation) trrAnnotation.visible = true;
                            if (leftLabel) leftLabel.visible = true;
                            if (slLabel) slLabel.visible = true;
                            if (flrLabel) flrLabel.visible = true;
                            if (srlLabel) srlLabel.visible = true;
                            if (tflLabel) tflLabel.visible = true;
                            if (trrLabel) trrLabel.visible = true;
                            break;
                    }
                }
            }

            function updateSpeakerAnnotations() {
                const showSpeakerPoints = document.getElementById('showSpeakerPoints').checked;
                const showProjectorPoints = document.getElementById('showProjectorPoints').checked;
                const showSweetSpot = document.getElementById('showSweetSpot').checked;

                // 初始隐藏所有标注
                const allAnnotations = [
                    leftAnnotation, slAnnotation, flrAnnotation, srlAnnotation, 
                    tflAnnotation, trrAnnotation, sphereAnnotation, sphereAnnotation2,
                    projectorAnnotation
                ];
                const allLabels = [
                    leftLabel, slLabel, flrLabel, srlLabel, 
                    tflLabel, trrLabel, sphereLabel, sphereLabel2,
                    projectorLabel
                ];

                allAnnotations.forEach(anno => anno && (anno.visible = false));
                allLabels.forEach(label => label && (label.visible = false));

                // 只有勾选对应选项时才显示标注
                if (showSpeakerPoints) {
                    const config = document.querySelector('input[name="speakerConfig"]:checked').value;
                    
                    // 根据配置显示标注
                    switch(config) {
                    case '5.1':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        break;
                    case '5.1.2':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (tflAnnotation) tflAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        if (tflLabel) tflLabel.visible = true;
                        break;
                    case '5.1.4':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (tflAnnotation) tflAnnotation.visible = true;
                        if (trrAnnotation) trrAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        if (tflLabel) tflLabel.visible = true;
                        if (trrLabel) trrLabel.visible = true;
                        break;
                    case '7.1':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (srlAnnotation) srlAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        if (srlLabel) srlLabel.visible = true;
                        break;
                    case '7.1.2':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (srlAnnotation) srlAnnotation.visible = true;
                        if (tflAnnotation) tflAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        if (srlLabel) srlLabel.visible = true;
                        if (tflLabel) tflLabel.visible = true;
                        break;
                    case '7.1.4':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (srlAnnotation) srlAnnotation.visible = true;
                        if (tflAnnotation) tflAnnotation.visible = true;
                        if (trrAnnotation) trrAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        if (srlLabel) srlLabel.visible = true;
                        if (tflLabel) tflLabel.visible = true;
                        if (trrLabel) trrLabel.visible = true;
                        break;
                    case '9.1.4':
                    case '9.1.6':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (flrAnnotation) flrAnnotation.visible = true;
                        if (srlAnnotation) srlAnnotation.visible = true;
                        if (tflAnnotation) tflAnnotation.visible = true;
                        if (trrAnnotation) trrAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        if (flrLabel) flrLabel.visible = true;
                        if (srlLabel) srlLabel.visible = true;
                        if (tflLabel) tflLabel.visible = true;
                        if (trrLabel) trrLabel.visible = true;
                        break;
                }
            }

            function updateSpeakerAnnotations() {
                const showSpeakerPoints = document.getElementById('showSpeakerPoints').checked;
                const showProjectorPoints = document.getElementById('showProjectorPoints').checked;
                const showSweetSpot = document.getElementById('showSweetSpot').checked;

                // Handle speaker annotations
                [leftAnnotation, slAnnotation, flrAnnotation, srlAnnotation, tflAnnotation, trrAnnotation, trlAnnotation].forEach(anno => {
                    if (anno) anno.visible = showSpeakerPoints;
                });
                [leftLabel, slLabel, flrLabel, srlLabel, tflLabel, trrLabel].forEach(label => {
                    if (label) label.visible = showSpeakerPoints;
                });

                // Handle projector annotation
                if (projectorAnnotation) projectorAnnotation.visible = showProjectorPoints;
                if (projectorLabel) projectorLabel.visible = showProjectorPoints;

                // Handle sweet spot annotations
                if (sphereAnnotation) sphereAnnotation.visible = showSweetSpot;
                if (sphereAnnotation2) sphereAnnotation2.visible = showSweetSpot;
                if (sphereLabel) sphereLabel.visible = showSweetSpot;
                if (sphereLabel2) sphereLabel2.visible = showSweetSpot;

                if (!showSpeakerPoints) return;

                // Get current speaker configuration
                const config = document.querySelector('input[name="speakerConfig"]:checked').value;
                
                // Hide all annotations first
                [leftAnnotation, slAnnotation, flrAnnotation, tflAnnotation, trrAnnotation, srlAnnotation, trlAnnotation].forEach(anno => {
                    if (anno) anno.visible = false;
                });
                [leftLabel, slLabel, flrLabel, tflLabel, trrLabel, srlLabel, trlLabel].forEach(label => {
                    if (label) label.visible = false;
                });

                // Show annotations based on configuration
                switch(config) {
                    case '5.1':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        break;
                    case '5.1.2':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (tflAnnotation) tflAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        if (tflLabel) tflLabel.visible = true;
                        break;
                    case '5.1.4':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (tflAnnotation) tflAnnotation.visible = true;
                        if (trrAnnotation) trrAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        if (tflLabel) tflLabel.visible = true;
                        if (trrLabel) trrLabel.visible = true;
                        break;
                    case '7.1':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (srlAnnotation) srlAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        if (srlLabel) srlLabel.visible = true;
                        break;
                    case '7.1.2':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (srlAnnotation) srlAnnotation.visible = true;
                        if (tflAnnotation) tflAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        if (srlLabel) srlLabel.visible = true;
                        if (tflLabel) tflLabel.visible = true;
                        break;
                    case '7.1.4':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (srlAnnotation) srlAnnotation.visible = true;
                        if (tflAnnotation) tflAnnotation.visible = true;
                        if (trrAnnotation) trrAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        if (srlLabel) srlLabel.visible = true;
                        if (tflLabel) tflLabel.visible = true;
                        if (trrLabel) trrLabel.visible = true;
                        break;
                    case '9.1.4':
                    case '9.1.6':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (flrAnnotation) flrAnnotation.visible = true;
                        if (srlAnnotation) srlAnnotation.visible = true;
                        if (tflAnnotation) tflAnnotation.visible = true;
                        if (trrAnnotation) trrAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        if (flrLabel) flrLabel.visible = true;
                        if (srlLabel) srlLabel.visible = true;
                        if (tflLabel) tflLabel.visible = true;
                        if (trrLabel) trrLabel.visible = true;
                        break;
                }
            }
            }

            function updateSpeakerAnnotations() {
                const showSpeakerPoints = document.getElementById('showSpeakerPoints').checked;
                const showProjectorPoints = document.getElementById('showProjectorPoints').checked;
                const showSweetSpot = document.getElementById('showSweetSpot').checked;

                // 初始隐藏所有标注
                const allAnnotations = [
                    leftAnnotation, slAnnotation, flrAnnotation, srlAnnotation, 
                    tflAnnotation, trrAnnotation, trlAnnotation, sphereAnnotation, 
                    sphereAnnotation2, projectorAnnotation
                ];
                const allLabels = [
                    leftLabel, slLabel, flrLabel, srlLabel, 
                    tflLabel, trrLabel, trlLabel, sphereLabel, 
                    sphereLabel2, projectorLabel
                ];

                allAnnotations.forEach(anno => anno && (anno.visible = false));
                allLabels.forEach(label => label && (label.visible = false));

                // 处理投影机和皇帝位标注
                if (projectorAnnotation) projectorAnnotation.visible = showProjectorPoints;
                if (projectorLabel) projectorLabel.visible = showProjectorPoints;
                if (sphereAnnotation) sphereAnnotation.visible = showSweetSpot;
                if (sphereAnnotation2) sphereAnnotation2.visible = showSweetSpot;
                if (sphereLabel) sphereLabel.visible = showSweetSpot;
                if (sphereLabel2) sphereLabel2.visible = showSweetSpot;

                // 如果未勾选音箱布线点位，直接返回
                if (!showSpeakerPoints) return;

                // 获取当前音箱配置
                const config = document.querySelector('input[name="speakerConfig"]:checked').value;
                
                // 根据配置显示标注
                switch(config) {
                    case '5.1':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        break;
                    case '5.1.2':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (tflAnnotation) tflAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        if (tflLabel) tflLabel.visible = true;
                        break;
                    case '5.1.4':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (tflAnnotation) tflAnnotation.visible = true;
                        if (trrAnnotation) trrAnnotation.visible = true;
                        if (trlAnnotation) trlAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        if (tflLabel) tflLabel.visible = true;
                        if (trrLabel) trrLabel.visible = true;
                        if (trlLabel) trlLabel.visible = true;
                        break;
                    case '7.1':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (srlAnnotation) srlAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        if (srlLabel) srlLabel.visible = true;
                        break;
                    case '7.1.2':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (srlAnnotation) srlAnnotation.visible = true;
                        if (tflAnnotation) tflAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        if (srlLabel) srlLabel.visible = true;
                        if (tflLabel) tflLabel.visible = true;
                        break;
                    case '7.1.4':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (srlAnnotation) srlAnnotation.visible = true;
                        if (tflAnnotation) tflAnnotation.visible = true;
                        if (trrAnnotation) trrAnnotation.visible = true;
                        if (trlAnnotation) trlAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        if (srlLabel) srlLabel.visible = true;
                        if (tflLabel) tflLabel.visible = true;
                        if (trrLabel) trrLabel.visible = true;
                        if (trlLabel) trlLabel.visible = true;
                        break;
                    case '9.1.4':
                    case '9.1.6':
                        if (leftAnnotation) leftAnnotation.visible = true;
                        if (slAnnotation) slAnnotation.visible = true;
                        if (flrAnnotation) flrAnnotation.visible = true;
                        if (srlAnnotation) srlAnnotation.visible = true;
                        if (tflAnnotation) tflAnnotation.visible = true;
                        if (trrAnnotation) trrAnnotation.visible = true;
                        if (trlAnnotation) trlAnnotation.visible = true;
                        if (leftLabel) leftLabel.visible = true;
                        if (slLabel) slLabel.visible = true;
                        if (flrLabel) flrLabel.visible = true;
                        if (srlLabel) srlLabel.visible = true;
                        if (tflLabel) tflLabel.visible = true;
                        if (trrLabel) trrLabel.visible = true;
                        if (trlLabel) trlLabel.visible = true;
                        break;
                }
            }

            function updateSpeakerVisibility(config) {
                const activeTypes = speakerConfigMap[config] || [];
                
                // 所有音箱对象
                const allSpeakers = [
                    currentCenterSpeaker, currentLeftSpeaker, currentRightSpeaker,
                    currentSLSpeaker, currentSRSpeaker, currentSRLSpeaker,
                    currentSRRSpeaker, currentTFLSpeaker, currentTFRSpeaker,
                    currentTRLSpeaker, currentTRRSpeaker,
                    currentFLLSpeaker, currentFLRSpeaker,
                    currentTCLSpeaker, currentTCRSpeaker
                ];
                
                allSpeakers.forEach(speaker => {
                    if (speaker) {
                        speaker.visible = activeTypes.includes(speaker.speakerType);
                    }
                });
                
                // 更新布线
                if (document.getElementById('generateWiring').checked) {
                    generateAllWires();
                }
            }



            // 出线位置坐标更新函数
            function updateCabinetPosition() {
                if (!cabinetGroup) return;
             
                // 获取实时旋转角度
                const rotationY = ((cabinetGroup.rotation.y % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
             
                // 根据旋转方向确定坐标映射
                if (Math.abs(rotationY - Math.PI/2) < 0.01 || 
                    Math.abs(rotationY - (3 * Math.PI/2)) < 0.01) {
                    // 旋转90°/270°时：X轴对应原始Z轴，Z轴对应原始X轴
                    cabinetGroup.position.set(
                        parseFloat(document.getElementById('cabinetZ').value),
                        parseFloat(document.getElementById('cabinetY').value),
                        parseFloat(document.getElementById('cabinetX').value)
                    );
                } else {
                    // 默认方向
                    cabinetGroup.position.set(
                        parseFloat(document.getElementById('cabinetX').value),
                        parseFloat(document.getElementById('cabinetY').value),
                        parseFloat(document.getElementById('cabinetZ').value)
                    );
                }
            }

            // 新增距离计算函数
            function calculateDistance(pos1, pos2) {
                return Math.sqrt(
                    Math.pow(pos1.x - pos2.x, 2) +
                    Math.pow(pos1.y - pos2.y, 2) +
                    Math.pow(pos1.z - pos2.z, 2)
                );
            }

            function isPathColliding(newPath, existingPaths) {
                const collisionThreshold = 0.2; // 检测精度提高到20cm
                
                // 检查每个路径段
                for(let i=0; i<newPath.length-1; i++){
                    const currentSeg = [newPath[i], newPath[i+1]];
                    
                    for(const existingPath of existingPaths){
                        for(let j=0; j<existingPath.length-1; j++){
                            const existingSeg = [existingPath[j], existingPath[j+1]];
                            
                            // 三维空间线段交叉检测
                            if(areSegmentsIntersecting(currentSeg, existingSeg, collisionThreshold)){
                                return true;
                            }
                        }
                    }
                }
                return false;
            }

            // 生成布线优化路径（带防重叠）
            function generateOptimizedPath(cabinetPos, speakerPos, roomHeight, index) {
                const ceilingHeight = roomHeight / 2;
                const path = [
                    cabinetPos.clone(),
                    new THREE.Vector3(cabinetPos.x, ceilingHeight, cabinetPos.z),
                    new THREE.Vector3(cabinetPos.x, ceilingHeight, speakerPos.z),
                    new THREE.Vector3(speakerPos.x, ceilingHeight, speakerPos.z),
                    speakerPos.clone()
                ];
                return path;
            }

            function generateDistanceBasedPath(cabinetPos, speakerPos, roomHeight, index) {
                const ceilingHeight = roomHeight / 2;
                const LATERAL_OFFSET_STEP = 0; // 横向偏移步长30cm
                
                const path = [];
                
                // 从机柜出发
                path.push(cabinetPos.clone());
                
                // 垂直上升到天花板
                path.push(new THREE.Vector3(
                    cabinetPos.x,
                    ceilingHeight,
                    cabinetPos.z
                ));
             
                // 根据距离添加横向偏移
                const lateralOffset = index % 2 === 0 ? 
                    index * LATERAL_OFFSET_STEP : 
                    -index * LATERAL_OFFSET_STEP;
                
                // 横向移动
                path.push(new THREE.Vector3(
                    cabinetPos.x + lateralOffset,
                    ceilingHeight,
                    cabinetPos.z
                ));
             
                // 向音箱方向移动
                path.push(new THREE.Vector3(
                    cabinetPos.x + lateralOffset,
                    ceilingHeight,
                    speakerPos.z
                ));
             
                // 纵向移动
                path.push(new THREE.Vector3(
                    speakerPos.x,
                    ceilingHeight,
                    speakerPos.z
                ));
             
                // 垂直下降到音箱
                path.push(speakerPos.clone());
                
                return path;
            }

            function avoidCollision(from, to, obstacles) {
                const direction = new THREE.Vector3().subVectors(to, from).normalize();
                let current = from.clone();
                const step = 0.01; // 检测步长
             
                while(current.distanceTo(to) > step) {
                    current.add(direction.clone().multiplyScalar(step));
                    
                    for(const speaker of obstacles) {
                        if(speaker.position.distanceTo(current) < WIRE_CONFIG.AVOID_RADIUS) {
                            // 计算避让偏移
                            const offset = new THREE.Vector3()
                                .crossVectors(direction, new THREE.Vector3(0,1,0))
                                .normalize()
                                .multiplyScalar(WIRE_CONFIG.AVOID_RADIUS * 2);
                            return current.clone().add(offset);
                        }
                    }
                }
                return to.clone();
            }

            // 线段交叉检测（投影到XZ平面）
            function isLineSegmentsCross(a1, a2, b1, b2) {
                // 将三维点转换为二维（忽略Y轴）
                const to2D = v => ({x: v.x, z: v.z});
                
                const p1 = to2D(a1), p2 = to2D(a2);
                const p3 = to2D(b1), p4 = to2D(b2);
                
                // 计算方向向量
                const d = (p2.x - p1.x) * (p4.z - p3.z) - (p2.z - p1.z) * (p4.x - p3.x);
                if (d === 0) return false; // 平行线
                
                // 计算交点参数
                const t = ((p3.x - p1.x) * (p4.z - p3.z) - (p3.z - p1.z) * (p4.x - p3.x)) / d;
                const u = ((p3.x - p1.x) * (p2.z - p1.z) - (p3.z - p1.z) * (p2.x - p1.x)) / d;
                
                // 判断是否在线段范围内
                return t >= 0 && t <= 1 && u >= 0 && u <= 1;
            }

            function areSegmentsIntersecting(seg1, seg2, threshold) {
                const dir1 = seg1[1].clone().sub(seg1[0]);
                const dir2 = seg2[1].clone().sub(seg2[0]);
                
                // 计算最近点
                const result = new THREE.Line3(seg1[0], seg1[1]).closestPointsToSegment(
                    new THREE.Line3(seg2[0], seg2[1])
                );
                
                // 检测间距是否小于阈值
                return result[0].distanceTo(result[1]) < threshold;
            }

            // 路径优化（删除冗余点）
            function optimizePath(originalPath) {
                return originalPath.filter((point, index) => {
                    return index === 0 || 
                        !point.equals(originalPath[index-1]);
                });
            }


            function getSpeakerByType(type) {
                const speakerMap = {
                    'front-left': currentLeftSpeaker,
                    'center': currentCenterSpeaker,
                    'front-right': currentRightSpeaker,
                    'surround-left': currentSLSpeaker,
                    'surround-right': currentSRSpeaker,
                    'rear-left': currentSRLSpeaker,
                    'rear-right': currentSRRSpeaker,
                    'top-front-left': currentTFLSpeaker,
                    'top-front-right': currentTFRSpeaker,
                    'top-rear-left': currentTRLSpeaker,
                    'top-rear-right': currentTRRSpeaker
                };
                return speakerMap[type] || null;
            }

            // 修正后的生成所有线材函数
            let lastWireUpdate = 0;
            function generateAllWires() {

                // 防抖处理（100ms间隔）
                const now = Date.now();
                if (now - lastWireUpdate < 100) return;
                lastWireUpdate = now;

                wires.forEach(wire => scene.remove(wire));
                wires.length = 0;

                if (!cabinetGroup) {
                    console.warn("请先设置机柜位置");
                    return;
                }

                const roomHeight = parseFloat(document.getElementById('height').value) || 2.8;
                const ceilingHeight = roomHeight / 2;

                // 按顺序连接所有音箱到机柜
                const connections = [];
                const speakers = [
                    currentCenterSpeaker,
                    currentLeftSpeaker,
                    currentRightSpeaker,
                    currentSLSpeaker,
                    currentSRSpeaker,
                    currentSRLSpeaker,
                    currentSRRSpeaker,
                    currentTFLSpeaker,
                    currentTFRSpeaker,
                    currentTRLSpeaker,
                    currentTRRSpeaker,
                    currentFLLSpeaker,
                    currentFLRSpeaker,
                    currentTCLSpeaker,
                    currentTCRSpeaker
                ].filter(s => s && s.visible);

                // 所有设备（音箱+投影机）按顺序连接
                const allDevices = [...speakers];
                if (currentProjector) {
                    allDevices.push(currentProjector);
                }

                // 先隐藏所有小立方体
                cabinetGroup.children.forEach(cube => cube.visible = false);

                // 连接音箱
                for (let i = 0; i < speakers.length; i++) {
                    if (i < cabinetGroup.children.length) {
                        connections.push({
                            cubeIndex: i,
                            speakerType: `NO${i+1}`,
                            speakerObj: speakers[i],
                            originalIndex: i
                        });
                        // 显示已连接的小立方体
                        cabinetGroup.children[i].visible = true;
                    }
                }

                // 连接投影机小立方体
                for (let i = 0; i < projectorCubes.length; i++) {
                    const cubeIndex = speakers.length + i; // 从音箱之后开始分配
                    if (cubeIndex < cabinetGroup.children.length) {
                        connections.push({
                            cubeIndex: cubeIndex,
                            speakerType: `projector-cube-${i}`,
                            speakerObj: projectorCubes[i],
                            originalIndex: cubeIndex
                        });
                        // 显示已连接的小立方体
                        cabinetGroup.children[cubeIndex].visible = true;
                    }
                }


                // 生成带原始索引的初始路径
                let paths = connections.map(conn => {
                    const cube = cabinetGroup.children[conn.cubeIndex];
                    const cubePos = cube.getWorldPosition(new THREE.Vector3());
                    const speakerPos = conn.speakerObj.getWorldPosition(new THREE.Vector3());
                    return {
                        ...conn,
                        path: generateBasicPath(cubePos, speakerPos, ceilingHeight, conn.originalIndex)
                    };
                });

                // 优化循环（使用原始索引）
                let hasCollision = true;
                let maxIterations = 10;
                
                while (hasCollision && maxIterations-- > 0) {
                    hasCollision = false;
                    
                    const tempPaths = [...paths];
                    
                    for (let i = 0; i < tempPaths.length; i++) {
                        for (let j = i + 1; j < tempPaths.length; j++) {
                            const pathA = tempPaths[i];
                            const pathB = tempPaths[j];
                            
                            if (isForcedCollision(pathA.speakerType, pathB.speakerType)) continue;
                            
                            if (checkCrossing(pathA.path, pathB.path)) {
                                // 交换立方体索引但保留原始索引
                                [paths[i].cubeIndex, paths[j].cubeIndex] = [paths[j].cubeIndex, paths[i].cubeIndex];
                                
                                // 重新生成路径时使用原始索引
                                const regeneratePath = (path) => {
                                    const cube = cabinetGroup.children[path.cubeIndex];
                                    if (!cube) return [];
                                    
                                    const cubePos = cube.getWorldPosition(new THREE.Vector3());
                                    const speakerPos = path.speakerObj.getWorldPosition(new THREE.Vector3());
                                    return generateBasicPath(cubePos, speakerPos, ceilingHeight, path.originalIndex);
                                };
                                
                                paths[i].path = regeneratePath(paths[i]);
                                paths[j].path = regeneratePath(paths[j]);
                                
                                hasCollision = true;
                            }
                        }
                    }
                }

                // 生成线材
                paths.forEach(p => {
                    if (!p.path || p.path.length < 2) return;
                    
                    const geometry = new THREE.BufferGeometry().setFromPoints(p.path);
                    // Get color from projector cube if it's a projector connection
                    let wireColor = 0xFF0000; // Default red
                    if (p.speakerType.startsWith('projector-cube')) {
                        const cubeIndex = parseInt(p.speakerType.split('-')[2]);
                        if (projectorCubes[cubeIndex]) {
                            wireColor = projectorCubes[cubeIndex].material.color.getHex();
                        }
                    }
                    
                    const material = new THREE.LineBasicMaterial({ 
                        color: wireColor,
                        linewidth: 2,
                        depthTest: false
                    });
                    const wire = new THREE.Line(geometry, material);
                    scene.add(wire);
                    wires.push(wire);
                });

                const wireStats = calculateWireStats(paths);
                updateWireStats(wireStats);
            }

            function calculateWireStats(paths) {
                let total = 0;
                
                paths.forEach(p => {
                    if (!p.path || p.path.length < 2) return;
                    
                    let pathLength = 0;
                    for (let i = 1; i < p.path.length; i++) {
                        pathLength += p.path[i-1].distanceTo(p.path[i]);
                    }
                    total += pathLength;
                });
                
                return {
                    total: total.toFixed(2),
                    details: {} // 不再需要详细分类
                };
            }

            function updateWireStats(stats) {
                document.getElementById('total-wire-length').textContent = stats.total;
            }
            function generateBasicPath(start, end, ceilingHeight, index) {
                // 获取当前机柜的旋转角度（归一化到0-2π范围）
                const rotationY = cabinetGroup ? 
                    ((cabinetGroup.rotation.y % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2) : 0;
                
                // 判断是否为垂直方向（90度或270度）
                const isVertical = 
                    Math.abs(rotationY - Math.PI/2) < 0.1 || 
                    Math.abs(rotationY - (3 * Math.PI/2)) < 0.1;
                
                // 计算动态偏移方向
                const offsetDirection = index % 2 === 0 ? 1 : -1;
                const offset = WIRE_OFFSET_STEP * Math.ceil(index/2) * offsetDirection;
                
                // 确保路径始终连接到机柜
                const path = [
                    start.clone(), // 机柜起点
                    new THREE.Vector3(start.x, ceilingHeight, start.z) // 上升到天花板
                ];
                
                if (isVertical) {
                    // 当机柜旋转90度或270度时，使用Z轴偏移
                    path.push(
                        new THREE.Vector3(start.x, ceilingHeight, start.z + offset),
                        new THREE.Vector3(end.x, ceilingHeight, start.z + offset),
                        new THREE.Vector3(end.x, ceilingHeight, end.z)
                    );
                } else {
                    // 默认X轴偏移
                    path.push(
                        new THREE.Vector3(start.x + offset, ceilingHeight, start.z),
                        new THREE.Vector3(start.x + offset, ceilingHeight, end.z),
                        new THREE.Vector3(end.x, ceilingHeight, end.z)
                    );
                }
                
                path.push(end.clone()); // 连接到音箱
                return path;
            }
             
            function checkCrossing(pathA, pathB) {

                // 获取旋转状态（与generateBasicPath保持相同逻辑）
                const rotationY = cabinetGroup ? 
                    ((cabinetGroup.rotation.y % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2) : 0;
                const isVertical = 
                    Math.abs(rotationY - Math.PI/2) < 0.1 || 
                    Math.abs(rotationY - (3 * Math.PI/2)) < 0.1;
                
                // 根据旋转方向选择检测维度
                const projectTo2D = isVertical ? 
                    path => path.map(p => ({x: p.x, z: p.z})) : // 垂直排列时检测XZ平面
                    path => path.map(p => ({x: p.x, z: p.z}));

                const projA = projectTo2D(pathA);
                const projB = projectTo2D(pathB);
             
                // 检测每对线段
                for (let i = 0; i < projA.length - 1; i++) {
                    for (let j = 0; j < projB.length - 1; j++) {
                        if (isSegmentIntersect(projA[i], projA[i+1], projB[j], projB[j+1])) {
                            return true;
                        }
                    }
                }
                return false;
            }
             
            function isSegmentIntersect(a1, a2, b1, b2) {
                // 线段交叉检测算法
                const denominator = (b2.z - b1.z)*(a2.x - a1.x) - (b2.x - b1.x)*(a2.z - a1.z);
                if (denominator === 0) return false;
             
                const ua = ((b2.x - b1.x)*(a1.z - b1.z) - (b2.z - b1.z)*(a1.x - b1.x)) / denominator;
                const ub = ((a2.x - a1.x)*(a1.z - b1.z) - (a2.z - a1.z)*(a1.x - b1.x)) / denominator;
                
                return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
            }
             
            function isForcedCollision(typeA, typeB) {
                // 需要排除的强制碰撞组合
                const forcedPairs = [
                    ['top-front-left', 'top-rear-left'],
                    ['top-front-right', 'top-rear-right']
                ];
                return forcedPairs.some(pair => 
                    (pair.includes(typeA) && pair.includes(typeB))
                );
            }

            function gridKey(position) {
                return `${Math.floor(position.x / COLLISION_GRID_SIZE)}_${Math.floor(position.z / COLLISION_GRID_SIZE)}`;
            }

            // 获取所有音箱位置（示例数据）
            function getAllSpeakerPositions() {
                return [
                    currentCenterSpeaker?.position,
                    currentLeftSpeaker?.position,
                    currentRightSpeaker?.position,
                    currentSLSpeaker?.position,
                    currentSRSpeaker?.position,
                    currentSRLSpeaker?.position,
                    currentSRRSpeaker?.position,
                    currentTFLSpeaker?.position,
                    currentTFRSpeaker?.position,
                    currentTRLSpeaker?.position,
                    currentTRRSpeaker?.position
                ].filter(pos => pos); // 使用可选链和过滤确保有效性
            }

            // 在机柜位置变化时更新布线
            function onCabinetPositionChange() {
                if (wiringEnabled) {
                    generateAllWires();
                }
            }

            function animate() {
                requestAnimationFrame(animate);
                try {
                    if(controls) controls.update();
                } catch(e) {
                    console.warn("控制器更新异常:", e);
                    controls = new THREE.OrbitControls(camera, renderer.domElement);
                }
                renderer.render(scene, camera);
                labelRenderer.render(scene, camera);
            }

             
                init();
                generateModel();
                generateSPK();
                createAnnotation();
                
                // 初始隐藏所有标注
                updateSpeakerAnnotations();
                
                // 强制更新一次标注可见性
                document.querySelectorAll('#showSpeakerPoints, #showProjectorPoints, #showSweetSpot').forEach(checkbox => {
                    checkbox.dispatchEvent(new Event('change'));
                });
                
                animate();

            function rotateCabinet() {
                if (cabinetGroup) {
                    cabinetGroup.rotation.y += Math.PI / 2;
                    if (document.getElementById('generateWiring').checked) {
                        generateAllWires(); // 现在可以访问闭包内的函数
                    }
                }
            }

            document.getElementById('rotateCabinetBtn').addEventListener('click', rotateCabinet);

            });
        // 布局调整函数
        function adjustPanelLayout() {
            const infoPanel = document.getElementById('model-info');
            if (window.innerWidth < 768) {
                infoPanel.style.flexDirection = 'column';
            } else {
                infoPanel.style.flexDirection = 'row';
            }
        }

        function updateSliderRanges() {
            // 允许超出房间的固定距离
            const OVERFLOW = 3; // 单位：米

            // 获取房间尺寸
            const length = parseFloat(document.getElementById('length').value) || 0;
            const width = parseFloat(document.getElementById('width').value) || 0;
            const height = parseFloat(document.getElementById('height').value) || 0;

            // 获取机柜旋转状态
            let rotationY = 0;
            if (cabinetGroup) {
                rotationY = ((cabinetGroup.rotation.y % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
            }

            // 动态计算机柜占位尺寸（带旋转补偿）
            let cabinetWidth = 0.2, cabinetDepth = 0.2; // 默认尺寸
            if (cabinetGroup) {
                const box = new THREE.Box3().setFromObject(cabinetGroup);
                const rawWidth = box.max.x - box.min.x;
                const rawDepth = box.max.z - box.min.z;
                
                // 根据旋转角度调整有效尺寸
                if (Math.abs(rotationY - Math.PI/2) < 0.01 || 
                    Math.abs(rotationY - (3 * Math.PI/2)) < 0.01) {
                    cabinetWidth = rawDepth;
                    cabinetDepth = rawWidth;
                } else {
                    cabinetWidth = rawWidth;
                    cabinetDepth = rawDepth;
                }
            }

            // 设置滑块范围（允许超出3米）
            const cabinetX = document.getElementById('cabinetX');
            const cabinetY = document.getElementById('cabinetY');
            const cabinetZ = document.getElementById('cabinetZ');

            // X轴（前后）- 基于房间长度
            cabinetX.min = -(length/2 + OVERFLOW) + cabinetDepth/2;
            cabinetX.max = length/2 + OVERFLOW - cabinetDepth/2;

            // Y轴（上下）- 基于房间高度
            cabinetY.min = -(height/2 + OVERFLOW) + CUBE_SIZE/2;
            cabinetY.max = height/2 + OVERFLOW - CUBE_SIZE/2;

            // Z轴（左右）- 基于房间宽度
            cabinetZ.min = -(width/2 + OVERFLOW) + cabinetWidth/2;
            cabinetZ.max = width/2 + OVERFLOW - cabinetWidth/2;

            // 强制约束当前值到新范围
            cabinetX.value = THREE.MathUtils.clamp(cabinetX.value, cabinetX.min, cabinetX.max);
            cabinetY.value = THREE.MathUtils.clamp(cabinetY.value, cabinetY.min, cabinetY.max);
            cabinetZ.value = THREE.MathUtils.clamp(cabinetZ.value, cabinetZ.min, cabinetZ.max);
        }

        document.querySelectorAll('#length, #width, #height').forEach(input => {
            input.addEventListener('input', () => {
                updateSliderRanges();
                // 保持当前位置在更新后的范围内
                ['cabinetX', 'cabinetY', 'cabinetZ'].forEach(id => {
                    const slider = document.getElementById(id);
                    slider.value = Math.max(
                        parseFloat(slider.min),
                        Math.min(parseFloat(slider.value), parseFloat(slider.max))
                    );
                });
            });
        });
        adjustPanelLayout();
        updateSliderRanges();



        // 禁用右键菜单
        document.addEventListener('contextmenu', e => e.preventDefault());

        // 禁用Ctrl+C/Ctrl+V/Ctrl+S等快捷键
        document.addEventListener('keydown', e => {
          if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 's' || e.key === 'u')) e.preventDefault();
          if (e.key === 'F12') e.preventDefault(); // 禁用F12开发者工具
        });