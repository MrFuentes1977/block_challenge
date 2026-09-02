const GRID_SIZE = 8;
const TOTAL_LEVELS = 12;

let currentCourse = 1;
let currentLevel = 1;
let unlockedCourses = [1]; 

// LÍMITES ESTIMADOS DE BLOQUES POR RETO (CURSO 3)
const levelBlockLimits = {
    1: 7,  // Reto 1: 7 bloques
    2: 7,  // Reto 2: 7 bloques
    3: 3,  // Reto 3: 3 bloques
    4: 4,  // Reto 4: 4 bloques
    5: 4,  // Reto 5: 4 bloques
    6: 4,  // Reto 6: 4 bloques
    7: 4,  // Reto 7: 4 bloques
    8: 5,  // Reto 8: 5 bloques
    9: 5,  // Reto 9: 5 bloques
    10: 5, // Reto 10: 5 bloques
    11: 5, // Reto 11: 5 bloques
    12: 6  // Reto 12: 6 bloques
};

// SISTEMA DE PUNTUACIÓN (12 RETOS x 10 PTS MAX = 120 PTS MAX)
let levelScores = {};

function getLevelMaxBlocks() {
    return levelBlockLimits[currentLevel] || 5;
}

function calculateTotalScore() {
    let sum = 0;
    for (let lvl = 1; lvl <= TOTAL_LEVELS; lvl++) {
        if (levelScores[lvl] !== undefined) {
            sum += levelScores[lvl];
        }
    }
    return sum;
}

function updateScoreUI() {
    const total = calculateTotalScore();
    const scoreEl = document.getElementById('total-score');
    if (scoreEl) {
        scoreEl.innerText = total;
    }
}

let startPos = { x: 0, y: 0 };
let targetPos = { x: 0, y: 0 };
let bot = { x: 0, y: 0, dir: 0 }; 

const rotationDegrees = [0, 90, 180, 270];
const dirVectors = [
    { dx: 1, dy: 0 },  
    { dx: 0, dy: 1 },  
    { dx: -1, dy: 0 }, 
    { dx: 0, dy: -1 }  
];

// MAPAS DEL CURSO 2: LABERINTOS
const labyrinthMaps = {
    1: { start: {x: 0, y: 3, dir: 0}, target: {x: 6, y: 6}, grid: [
['V','V','V','V','V','V','V','V'],
['V','V','V','V','V','V','V','V'],
['M','M','M','M','M','M','M','M'],
['C','C','C','C','C','C','C','M'],
['M','M','M','M','M','M','C','M'],
['V','V','V','V','V','M','C','M'],
['V','V','V','V','V','M','C','M'],
['V','V','V','V','V','M','M','M']] },
    2: { start: {x: 0, y: 7, dir: 0}, target: {x: 2, y: 1}, grid:[
['V','M','M','M','M','M','M','V'],
['V','M','C','C','C','C','M','V'],
['V','M','M','M','M','C','M','M'],
['V','V','V','V','M','C','C','C'],
['V','V','V','V','M','M','M','C'],
['V','V','V','V','V','V','M','C'],
['M','M','M','M','M','M','M','C'],
['C','C','C','C','C','C','C','C']] },
    3: { start: {x: 0, y: 0, dir: 1}, target: {x: 7, y: 7}, grid:[
['C','M','M','M','V','V','V','V'],
['C','C','C','M','V','V','V','V'],
['M','M','C','M','M','M','V','V'],
['V','M','C','C','C','M','V','V'],
['V','M','M','M','C','M','M','M'],
['V','V','V','M','C','C','C','M'],
['V','V','V','M','M','M','C','M'],
['V','V','V','V','V','M','C','C']] },
    4: { start: {x: 6, y: 3, dir: 0}, target: {x: 1, y: 3}, grid:[
['V','V','V','V','V','V','V','V'],
['V','V','V','V','V','V','V','V'],
['M','M','M','V','V','M','M','M'],
['M','C','M','V','V','M','C','M'],
['M','C','M','V','V','M','C','M'],
['M','C','M','V','V','M','C','M'],
['M','C','M','M','M','M','C','M'],
['M','C','C','C','C','C','C','M']] },
    5: { start: {x: 7, y: 7, dir: 2}, target: {x: 0, y: 0}, grid:[
['C','C','C','M','V','V','V','V'],
['V','M','C','M','V','V','V','V'],
['M','M','C','M','V','V','V','V'],
['C','C','C','M','V','V','V','V'],
['C','M','M','M','V','V','V','V'],
['C','M','V','M','M','M','M','M'],
['C','M','M','M','M','M','M','M'],
['C','C','C','C','C','C','C','C']] },
    6: { start: {x: 4, y: 4, dir: 0}, target: {x: 7, y: 6}, grid:[
['V','V','V','V','V','V','V','V'],
['V','M','M','M','M','M','M','M'],
['V','M','C','C','C','C','C','M'],
['V','M','C','M','M','M','C','M'],
['V','M','C','M','C','C','C','M'],
['V','M','C','M','M','M','M','M'],
['V','M','C','C','C','C','C','C'],
['V','M','M','M','M','M','M','M']] },
    7: { start: {x: 0, y: 7, dir: 0}, target: {x: 7, y: 1}, grid: [
['V','V','V','V','M','M','M','M'],
['V','V','V','V','M','C','C','C'],
['V','V','V','M','M','C','M','M'],
['V','M','M','M','C','C','M','V'],
['V','M','C','C','C','M','M','V'],
['M','M','C','M','M','M','V','V'],
['M','M','C','M','V','V','V','V'],
['C','C','C','M','V','V','V','V']] },
    8: { start: {x: 6, y: 3, dir: 0}, target: {x: 2, y: 1}, grid: [
['M','M','M','M','M','M','M','M'],
['M','C','C','M','C','C','C','M'],
['M','C','M','M','C','M','C','M'],
['M','C','M','M','C','M','C','M'],
['M','C','M','M','C','M','M','M'],
['M','C','C','M','C','C','C','C'],
['M','M','C','M','M','M','M','C'],
['M','M','C','C','C','C','C','C']] },
    9: { start: {x: 3, y: 3, dir: 0}, target: {x: 5, y: 3}, grid: [
['V','V','M','C','C','C','C','C'],
['V','V','M','C','M','M','M','C'],
['V','V','M','C','M','V','M','C'],
['V','V','M','C','M','C','M','C'],
['M','M','M','M','M','C','M','C'],
['C','C','C','C','C','C','M','C'],
['C','M','M','M','M','M','M','C'],
['C','C','C','C','C','C','C','C']] },
    10: { start: {x: 4, y: 7, dir: 0}, target: {x: 4, y: 1}, grid: [
['M','M','M','M','M','M','V','V'],
['C','C','C','C','C','M','V','V'],
['C','M','M','M','M','M','V','V'],
['C','M','V','V','V','V','V','V'],
['C','M','M','M','M','M','M','M'],
['C','C','C','C','C','C','C','M'],
['M','M','M','M','M','M','C','M'],
['V','V','V','M','C','C','C','M']] },
    11: { start: {x: 7, y: 0, dir: 0}, target: {x: 0, y: 7}, grid: [
['V','V','V','V','M','M','C','C'],
['V','V','V','M','M','C','C','M'],
['V','V','M','M','C','C','M','M'],
['V','M','M','C','C','M','M','V'],
['M','M','C','C','M','M','V','V'],
['M','C','C','M','M','V','V','V'],
['C','C','M','M','V','V','V','V'],
['C','M','M','V','V','V','V','V']] },
    12: { start: {x: 3, y: 7, dir: 0}, target: {x: 2, y: 1}, grid: [
['V','M','M','M','M','M','M','M'],
['V','M','C','C','C','C','C','M'],
['V','M','M','M','M','M','C','M'],
['V','M','C','C','C','C','C','M'],
['V','M','C','M','M','M','M','M'],
['V','M','C','C','C','M','V','V'],
['V','M','M','M','C','M','V','V'],
['V','V','M','C','C','M','V','V']] }
};

// MAPAS DEL CURSO 3: BUCLES ANIDADOS
const nestedLoopMaps = {
    1: { start: {x: 0, y: 0, dir: 0}, target: {x: 6, y: 6}, hints: [
        {x: 2, y: 0, symbol: '↻'},
        {x: 2, y: 2, symbol: '↺'}
    ], grid: [
['C','C','C','M','M','M','M','M'],
['M','M','C','M','M','M','M','M'],
['M','M','C','C','C','M','M','M'],
['M','M','M','M','C','M','M','M'],
['M','M','M','M','C','C','C','M'],
['M','M','M','M','M','M','C','M'],
['M','M','M','M','M','M','C','M'],
['M','M','M','M','M','M','M','M']] },
    2: { start: {x: 0, y: 6, dir: 0}, target: {x: 6, y: 0}, hints: [
        {x: 2, y: 6, symbol: '↺'},
        {x: 2, y: 4, symbol: '↺'}
    ], grid: [
['M','M','M','M','M','M','C','M'],
['M','M','M','M','M','M','C','M'],
['M','M','M','M','C','C','C','M'],
['M','M','M','M','C','M','M','M'],
['M','M','C','C','C','M','M','M'],
['M','M','C','M','M','M','M','M'],
['C','C','C','M','M','M','M','M'],
['M','M','M','M','M','M','M','M']] },
    3: { start: {x: 1, y: 1, dir: 0}, target: {x: 1, y: 2}, grid: [
['M','M','M','M','M','M','M','M'],
['M','C','C','C','C','C','M','M'],
['M','C','M','M','M','C','M','M'],
['M','C','M','M','M','C','M','M'],
['M','C','M','M','M','C','M','M'],
['M','C','C','C','C','C','M','M'],
['M','M','M','M','M','M','M','M'],
['M','M','M','M','M','M','M','M']] },
    4: { start: {x: 1, y: 1, dir: 0}, target: {x: 5, y: 5}, grid: [
['M','M','M','M','M','M','M','M'],
['M','C','C','C','C','C','M','M'],
['M','M','M','M','M','C','M','M'],
['M','M','C','C','C','C','M','M'],
['M','M','C','M','M','M','M','M'],
['M','M','C','C','C','C','M','M'],
['M','M','M','M','M','M','M','M'],
['M','M','M','M','M','M','M','M']] },
    5: { start: {x: 0, y: 0, dir: 0}, target: {x: 3, y: 3}, grid: [
['C','C','C','C','C','C','C','M'],
['M','M','M','M','M','M','C','M'],
['M','C','C','C','C','M','C','M'],
['M','C','M','C','C','M','C','M'],
['M','C','M','M','M','M','C','M'],
['M','C','C','C','C','C','C','M'],
['M','M','M','M','M','M','M','M'],
['M','M','M','M','M','M','M','M']] },
    6: { start: {x: 0, y: 7, dir: 0}, target: {x: 7, y: 0}, grid: [
['M','M','M','M','M','M','C','C'],
['M','M','M','M','C','C','C','M'],
['M','M','M','M','C','M','M','M'],
['M','M','C','C','C','M','M','M'],
['M','M','C','M','M','M','M','M'],
['C','C','C','M','M','M','M','M'],
['C','M','M','M','M','M','M','M'],
['C','C','M','M','M','M','M','M']] },
    7: { start: {x: 7, y: 7, dir: 2}, target: {x: 0, y: 0}, grid: [
['C','C','M','M','M','M','M','M'],
['M','C','C','M','M','M','M','M'],
['M','M','C','C','M','M','M','M'],
['M','M','M','C','C','M','M','M'],
['M','M','M','M','C','C','M','M'],
['M','M','M','M','M','C','C','M'],
['M','M','M','M','M','M','C','C'],
['M','M','M','M','M','M','M','C']] },
    8: { start: {x: 1, y: 0, dir: 1}, target: {x: 6, y: 7}, grid: [
['M','C','M','M','M','M','M','M'],
['M','C','C','C','C','C','C','M'],
['M','M','M','M','M','M','C','M'],
['M','C','C','C','C','C','C','M'],
['M','C','M','M','M','M','M','M'],
['M','C','C','C','C','C','C','M'],
['M','M','M','M','M','M','C','M'],
['M','M','M','M','M','M','C','M']] },
    9: { start: {x: 0, y: 0, dir: 0}, target: {x: 4, y: 4}, grid: [
['C','C','C','C','C','C','C','C'],
['M','M','M','M','M','M','M','C'],
['C','C','C','C','C','C','M','C'],
['C','M','M','M','M','C','M','C'],
['C','M','C','C','C','C','M','C'],
['C','M','M','M','M','M','M','C'],
['C','C','C','C','C','C','C','C'],
['M','M','M','M','M','M','M','M']] },
    10: { start: {x: 0, y: 3, dir: 0}, target: {x: 7, y: 3}, grid: [
['M','M','M','M','M','M','M','M'],
['M','C','C','C','C','C','C','M'],
['M','C','M','M','M','M','C','M'],
['C','C','M','C','C','M','C','C'],
['M','C','M','M','M','M','C','M'],
['M','C','C','C','C','C','C','M'],
['M','M','M','M','M','M','M','M'],
['M','M','M','M','M','M','M','M']] },
    11: { start: {x: 7, y: 0, dir: 2}, target: {x: 0, y: 7}, grid: [
['M','M','M','M','M','M','M','C'],
['M','C','C','C','C','C','C','C'],
['M','C','M','M','M','M','M','M'],
['M','C','C','C','C','C','C','M'],
['M','M','M','M','M','M','C','M'],
['M','C','C','C','C','C','C','M'],
['M','C','M','M','M','M','M','M'],
['C','C','M','M','M','M','M','M']] },
    12: { start: {x: 0, y: 7, dir: 0}, target: {x: 7, y: 7}, grid: [
['M','M','M','M','M','M','M','M'],
['C','C','C','C','C','C','C','C'],
['C','M','M','M','M','M','M','C'],
['C','M','C','C','C','C','M','C'],
['C','M','C','M','M','C','M','C'],
['C','M','C','C','C','C','M','C'],
['C','M','M','M','M','M','M','C'],
['C','C','C','C','C','C','C','C']] }
};

const motivationalSuccessMessages = [
    "🎉 ¡Excelente trabajo! Has superado este nivel con dedicación y esfuerzo, sigue avanzando hacia nuevos retos.",
    "🚀 ¡Felicitaciones! Tu constancia y habilidades te han llevado a completar este curso, el siguiente desafío te espera.",
    "🌟 ¡Muy bien hecho! Cada paso que das te acerca más a convertirte en un gran programador.",
    "🏆 ¡Lo lograste! Cada nivel superado demuestra tu esfuerzo y compromiso con el aprendizaje.",
    "💡 ¡Gran avance! Tu curiosidad y dedicación te están llevando cada vez más lejos en el mundo de la programación."
];

const motivationalErrorMessages = [
    "🌱 No pasa nada, cada intento te acerca más al éxito. ¡Sigue practicando y lo lograrás!",
    "💪 El esfuerzo que haces hoy será tu fortaleza mañana. ¡Inténtalo de nuevo, tú puedes!",
    "🔄 Equivocarse es parte del aprendizaje. Cada error es una oportunidad para mejorar.",
    "✨ Recuerda: los grandes programadores también empezaron fallando. ¡Tu progreso está en marcha!",
    "🚀 No te rindas, cada nivel es un reto que te prepara para el siguiente. ¡Vuelve a intentarlo!"
];

// EXPLICACIONES DUA PARA LOS PRIMEROS NIVELES DEL CURSO 3
const duaLevelHints = {
    3: {
        1: "El robot sigue un camino que se repite tres veces. Si escribimos todas las instrucciones sería muy largo, pero con un bucle lo hacemos más fácil: repetimos 3 veces y dentro ponemos los pasos rectos y los giros. Así el programa es más rápido de escribir y más sencillo de entender.",
        2: "El camino del robot es una escalera. Cada escalón se forma con dos pasos: avanzar y girar. Como todos los escalones son iguales, podemos usar un bucle que repita esa acción varias veces. Así el programa es más corto y más fácil de entender.",
        3: "<b>Cuadrado Perfecto:</b> Para recorrer los 4 lados de la figura, usa un bucle exterior de 4 repeticiones y dentro pon un bucle interno de avanzar.",
        4: "<b>Líneas en Zigzag:</b> Descompón el movimiento en tramos. Usa un bucle interno para recorrer la recta y el externo para repetir las idas y vueltas.",
        5: "<b>Patrón Espiral:</b> Un bucle dentro de otro te permite reducir un programa gigante a solo 2 bloques de Repetir anidados."
    }
};

const tankSVG = `
    <svg class="tank-sprite" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="30" width="50" height="40" rx="6" fill="#4ade80" stroke="#1e3a1e" stroke-width="5"/>
        <rect x="25" y="24" width="40" height="6" rx="2" fill="#22c55e" stroke="#1e3a1e" stroke-width="3"/>
        <rect x="25" y="70" width="40" height="6" rx="2" fill="#22c55e" stroke="#1e3a1e" stroke-width="3"/>
        <rect x="59" y="45" width="26" height="10" rx="2" fill="#4ade80" stroke="#1e3a1e" stroke-width="4"/>
        <circle cx="45" cy="50" r="14" fill="#22c55e" stroke="#1e3a1e" stroke-width="4"/>
    </svg>
`;

let workspaceItems = []; 
let isExecuting = false;
let executionInterrupted = false;
let reachedTarget = false;

function parsePath(pathStr) {
    if (!pathStr || pathStr === "") return [];
    try {
        return JSON.parse(pathStr);
    } catch(e) {
        return [];
    }
}

function getItemByPath(tree, path) {
    if (!path || path.length === 0) return null;
    let current = tree;
    for (let i = 0; i < path.length; i++) {
        const idx = path[i];
        if (!current || !current[idx]) return null;
        if (i === path.length - 1) return current[idx];
        current = current[idx].innerBlocks;
    }
    return null;
}

function removeItemByPath(tree, path) {
    if (!path || path.length === 0) return null;
    let current = tree;
    for (let i = 0; i < path.length - 1; i++) {
        if (!current || !current[path[i]]) return null;
        current = current[path[i]].innerBlocks;
    }
    const removedIndex = path[path.length - 1];
    if (!current || removedIndex >= current.length) return null;
    return current.splice(removedIndex, 1)[0];
}

function getTargetListByPath(tree, path) {
    if (!path || path.length === 0) return tree;
    let item = getItemByPath(tree, path);
    if (item && item.type === 'loop') return item.innerBlocks;
    return tree;
}

function isDescendantPath(parentPath, childPath) {
    if (parentPath.length >= childPath.length) return false;
    return parentPath.every((val, idx) => childPath[idx] === val);
}

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function startCourse(courseNum) {
    if (courseNum > 1 && !unlockedCourses.includes(courseNum)) {
        const pass = prompt(`🔑 Para acceder directamente al Curso ${courseNum} sin completar los anteriores, introduce la clave de acceso:`);
        if (pass === "2846") {
            if (!unlockedCourses.includes(courseNum)) unlockedCourses.push(courseNum);
            updateHomeUI();
            alert(`¡Acceso concedido! Curso ${courseNum} desbloqueado.`);
        } else {
            alert("Clave incorrecta. Debes completar primero los cursos previos o solicitar la clave al profesor.");
            return;
        }
    }

    currentCourse = courseNum;
    currentLevel = 1;
    
    let titleText = "Programación en Bloques: Primeros pasos";
    if (currentCourse === 2) titleText = "Programación en Bloques: Laberintos";
    else if (currentCourse === 3) titleText = "Programación en Bloques: Bucles Anidados";
    
    document.getElementById('app-current-title').innerText = titleText;

    switchScreen('screen-game');
    initProgressBar();
    generateLevelMap();
}

function goBackToHome() {
    if(isExecuting) return;
    updateHomeUI();
    switchScreen('screen-home');
}

function updateHomeUI() {
    [2, 3].forEach(cNum => {
        const card = document.getElementById(`card-course-${cNum}`);
        const badge = document.getElementById(`badge-course-${cNum}`);
        if (card && badge && unlockedCourses.includes(cNum)) {
            card.classList.remove('locked');
            card.classList.add('unlocked');
            badge.className = "course-badge b-unlocked";
            badge.innerText = "Habilitado";
        }
    });
}

function initProgressBar() {
    const dotsContainer = document.getElementById('progress-dots');
    dotsContainer.innerHTML = '';
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot-level';
        dot.id = `dot-level-${i}`;
        dot.innerText = i;
        dot.title = `Ir al Reto ${i}`;
        dot.onclick = () => jumpToLevel(i);
        dotsContainer.appendChild(dot);
    }
    updateProgressBarUI();
}

function jumpToLevel(lvlNum) {
    if (isExecuting) return;
    currentLevel = lvlNum;
    generateLevelMap();
    updateProgressBarUI();
}

function updateProgressBarUI() {
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
        const dot = document.getElementById(`dot-level-${i}`);
        if (!dot) continue;
        dot.classList.remove('active', 'completed');
        if (i < currentLevel) dot.classList.add('completed');
        else if (i === currentLevel) dot.classList.add('active');
    }
}

function updateDuaHintDisplay() {
    const hintBanner = document.getElementById('dua-hint-banner');
    const hintText = document.getElementById('dua-hint-text');
    
    if (duaLevelHints[currentCourse] && duaLevelHints[currentCourse][currentLevel]) {
        hintText.innerHTML = duaLevelHints[currentCourse][currentLevel];
        hintBanner.style.display = 'block';
    } else {
        hintBanner.style.display = 'none';
    }
}

function generateLevelMap() {
    if (isExecuting) return;

    if (currentCourse === 1) {
        const startIdx = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
        let targetIdx = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
        while (targetIdx === startIdx) {
            targetIdx = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
        }
        startPos.x = startIdx % GRID_SIZE;
        startPos.y = Math.floor(startIdx / GRID_SIZE);
        targetPos.x = targetIdx % GRID_SIZE;
        targetPos.y = Math.floor(targetIdx / GRID_SIZE);
        bot.dir = 0;
    } else {
        const mapSet = currentCourse === 2 ? labyrinthMaps : nestedLoopMaps;
        const mapData = mapSet[currentLevel];
        startPos.x = mapData.start.x;
        startPos.y = mapData.start.y;
        targetPos.x = mapData.target.x;
        targetPos.y = mapData.target.y;
        bot.dir = mapData.start.dir;
    }

    workspaceItems = [];
    renderWorkspace();
    resetLevelState();
    updateProgressBarUI();
    updateDuaHintDisplay();
    updateScoreUI();
}

function renderBoard() {
    const gridContainer = document.getElementById('flat-grid');
    gridContainer.innerHTML = '';

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${r}-${c}`;

            if (currentCourse > 1) {
                const mapSet = currentCourse === 2 ? labyrinthMaps : nestedLoopMaps;
                const terrain = mapSet[currentLevel].grid[r][c];
                if (terrain === 'M') cell.classList.add('wall-brown');
                else if (terrain === 'V') cell.classList.add('grass-green');

                if (currentCourse === 3 && mapSet[currentLevel].hints) {
                    const hint = mapSet[currentLevel].hints.find(h => h.x === c && h.y === r);
                    if (hint) {
                        const arrowEl = document.createElement('span');
                        arrowEl.className = 'cell-arrow-hint';
                        arrowEl.innerText = hint.symbol;
                        cell.appendChild(arrowEl);
                    }
                }
            }

            if (c === startPos.x && r === startPos.y) cell.classList.add('start-cell');
            else if (c === targetPos.x && r === targetPos.y) cell.classList.add('target-cell');

            gridContainer.appendChild(cell);
        }
    }

    const botEl = document.createElement('div');
    botEl.className = 'bot';
    botEl.id = 'bot';
    botEl.innerHTML = tankSVG;
    gridContainer.appendChild(botEl);
    updateBotVisual();
}

function updateBotVisual() {
    const botEl = document.getElementById('bot');
    if (!botEl) return;
    const targetCell = document.getElementById(`cell-${bot.y}-${bot.x}`);
    if (targetCell) {
        targetCell.appendChild(botEl);
        botEl.style.transform = `rotate(${rotationDegrees[bot.dir]}deg)`;
    }
}

function dragFromToolbox(ev, blockType) {
    if (isExecuting) { ev.preventDefault(); return; }
    ev.dataTransfer.setData("text/plain", blockType);
    ev.dataTransfer.setData("source", "toolbox");
}

function dragFromWorkspace(ev, pathStr) {
    if (isExecuting) { ev.preventDefault(); return; }
    ev.stopPropagation();
    ev.dataTransfer.setData("source", "workspace");
    ev.dataTransfer.setData("path", pathStr);
}

function allowDrop(ev) { ev.preventDefault(); ev.currentTarget.classList.add('drag-over'); }
function dragLeave(ev) { ev.currentTarget.classList.remove('drag-over'); }
function allowDropTrash(ev) { ev.preventDefault(); document.getElementById('toolbox-column').classList.add('trash-can-active'); }
function dragLeaveTrash(ev) { document.getElementById('toolbox-column').classList.remove('trash-can-active'); }

function dropToWorkspace(ev, zoneType, slotPathStr = '') {
    ev.preventDefault();
    ev.currentTarget.classList.remove('drag-over');
    ev.stopPropagation(); 
    if (isExecuting) return;

    const source = ev.dataTransfer.getData("source");
    const slotPath = parsePath(slotPathStr);
    const targetList = getTargetListByPath(workspaceItems, slotPath);

    if (source === "toolbox") {
        const blockType = ev.dataTransfer.getData("text/plain");
        if (!blockType) return;

        if (blockType === 'loop') {
            targetList.push({ type: 'loop', iterations: 2, innerBlocks: [] });
        } else {
            targetList.push({ type: 'single', action: blockType });
        }
    } else if (source === "workspace") {
        const srcPath = parsePath(ev.dataTransfer.getData("path"));
        if (!srcPath || srcPath.length === 0) return;

        if (isDescendantPath(srcPath, slotPath)) return;

        const movedItem = removeItemByPath(workspaceItems, srcPath);
        if (movedItem) {
            targetList.push(movedItem);
        }
    }
    renderWorkspace();
}

function dropTrash(ev) {
    ev.preventDefault();
    document.getElementById('toolbox-column').classList.remove('trash-can-active');
    if (isExecuting) return;

    const source = ev.dataTransfer.getData("source");
    if (source === "workspace") {
        const srcPath = parsePath(ev.dataTransfer.getData("path"));
        if (srcPath && srcPath.length > 0) {
            removeItemByPath(workspaceItems, srcPath);
            renderWorkspace();
        }
    }
}

let touchDragData = null;
let ghostEl = null;

function initTouchDragSupport() {
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
}

function handleTouchStart(e) {
    if (isExecuting) return;
    const block = e.target.closest('.block-element, .loop-container-block');
    if (!block) return;

    if (e.target.tagName === 'SELECT') return;

    const isToolbox = !!block.closest('.toolbox-column');
    const isWorkspace = !!block.closest('.workspace-column');

    if (!isToolbox && !isWorkspace) return;

    const touch = e.touches[0];
    
    let source = isToolbox ? 'toolbox' : 'workspace';
    let blockType = block.getAttribute('data-type');
    let pathStr = block.getAttribute('data-path');

    if (isToolbox && !blockType) {
        if (block.classList.contains('move')) blockType = 'avanzar';
        else if (block.classList.contains('turn-left')) blockType = 'izquierda';
        else if (block.classList.contains('turn-right')) blockType = 'derecha';
        else if (block.classList.contains('loop-btn')) blockType = 'loop';
    }

    touchDragData = {
        source: source,
        blockType: blockType,
        pathStr: pathStr,
        startX: touch.clientX,
        startY: touch.clientY,
        blockEl: block
    };

    ghostEl = block.cloneNode(true);
    ghostEl.classList.add('touch-drag-ghost');
    ghostEl.style.width = block.offsetWidth + 'px';
    ghostEl.style.left = (touch.clientX - block.offsetWidth / 2) + 'px';
    ghostEl.style.top = (touch.clientY - block.offsetHeight / 2) + 'px';
    document.body.appendChild(ghostEl);
}

function handleTouchMove(e) {
    if (!touchDragData || !ghostEl) return;
    e.preventDefault(); 
    
    const touch = e.touches[0];
    ghostEl.style.left = (touch.clientX - ghostEl.offsetWidth / 2) + 'px';
    ghostEl.style.top = (touch.clientY - ghostEl.offsetHeight / 2) + 'px';

    const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
    
    document.querySelectorAll('.drag-over, .trash-can-active').forEach(el => {
        el.classList.remove('drag-over', 'trash-can-active');
    });

    if (elementUnder) {
        const targetSlot = elementUnder.closest('.loop-body-slots, .workspace-area');
        if (targetSlot) {
            targetSlot.classList.add('drag-over');
        }
        const trashArea = elementUnder.closest('.toolbox-column');
        if (trashArea && touchDragData.source === 'workspace') {
            trashArea.classList.add('trash-can-active');
        }
    }
}

function handleTouchEnd(e) {
    if (!touchDragData || !ghostEl) return;

    const touch = e.changedTouches[0];
    const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);

    document.querySelectorAll('.drag-over, .trash-can-active').forEach(el => {
        el.classList.remove('drag-over', 'trash-can-active');
    });

    if (elementUnder) {
        const trashArea = elementUnder.closest('.toolbox-column');
        const targetSlot = elementUnder.closest('.loop-body-slots, .workspace-area');

        if (trashArea && touchDragData.source === 'workspace') {
            const srcPath = parsePath(touchDragData.pathStr);
            if (srcPath && srcPath.length > 0) {
                removeItemByPath(workspaceItems, srcPath);
                renderWorkspace();
            }
        } else if (targetSlot) {
            let slotPathStr = '';
            if (targetSlot.classList.contains('loop-body-slots')) {
                const parentLoop = targetSlot.closest('.loop-container-block');
                if (parentLoop) {
                    slotPathStr = parentLoop.getAttribute('data-path') || '';
                }
            }

            const slotPath = parsePath(slotPathStr);
            const targetList = getTargetListByPath(workspaceItems, slotPath);

            if (touchDragData.source === 'toolbox') {
                if (touchDragData.blockType === 'loop') {
                    targetList.push({ type: 'loop', iterations: 2, innerBlocks: [] });
                } else if (touchDragData.blockType) {
                    targetList.push({ type: 'single', action: touchDragData.blockType });
                }
            } else if (touchDragData.source === 'workspace') {
                const srcPath = parsePath(touchDragData.pathStr);
                if (srcPath && srcPath.length > 0 && !isDescendantPath(srcPath, slotPath)) {
                    const movedItem = removeItemByPath(workspaceItems, srcPath);
                    if (movedItem) {
                        targetList.push(movedItem);
                    }
                }
            }
            renderWorkspace();
        }
    }

    if (ghostEl && ghostEl.parentNode) {
        ghostEl.parentNode.removeChild(ghostEl);
    }
    ghostEl = null;
    touchDragData = null;
}

function changeIterations(pathStr, val) {
    const path = parsePath(pathStr);
    const item = getItemByPath(workspaceItems, path);
    if (item && item.type === 'loop') {
        item.iterations = parseInt(val);
    }
}

function countTotalBlocks(blocks = workspaceItems) {
    let total = 0;
    blocks.forEach(item => {
        total++;
        if (item.type === 'loop') {
            total += countTotalBlocks(item.innerBlocks);
        }
    });
    return total;
}

function updateBlockCountDisplay() {
    const total = countTotalBlocks(workspaceItems);
    const limit = getLevelMaxBlocks();
    const titleEl = document.getElementById('workspace-title-count');
    if (titleEl) {
        titleEl.innerText = `Espacio de trabajo: ${total} / ${limit} bloques estimados`;
        if (total > limit) {
            titleEl.style.color = '#fca5a5';
        } else {
            titleEl.style.color = '#ffffff';
        }
    }
}

function clearWorkspaceOnly() {
    if (isExecuting) return;
    workspaceItems = [];
    renderWorkspace();
    resetLevelState();
}

function renderBlockTree(container, blocks, parentPath = []) {
    container.innerHTML = '';

    blocks.forEach((item, index) => {
        const currentPath = [...parentPath, index];
        const pathStr = JSON.stringify(currentPath);
        const elementId = `block-${currentPath.join('-')}`;

        if (item.type === 'single') {
            const block = document.createElement('div');
            block.className = `block-element ${item.action === 'avanzar' ? 'move' : (item.action === 'derecha' ? 'turn-right' : 'turn-left')}`;
            block.id = elementId;
            block.setAttribute('draggable', 'true');
            block.setAttribute('data-path', pathStr);
            block.ondragstart = (e) => dragFromWorkspace(e, pathStr);
            
            if (item.action === 'avanzar') block.innerHTML = `<span>avanzar</span><span class="arrow-icon">→</span>`;
            else if (item.action === 'izquierda') block.innerHTML = `<span>girar a la izquierda</span><span class="turn-icon">↺</span>`;
            else block.innerHTML = `<span>girar a la derecha</span><span class="turn-icon">↻</span>`;
            
            container.appendChild(block);
        } else if (item.type === 'loop') {
            const loopContainer = document.createElement('div');
            loopContainer.className = 'loop-container-block';
            loopContainer.id = elementId;
            loopContainer.setAttribute('draggable', 'true');
            loopContainer.setAttribute('data-path', pathStr);
            loopContainer.ondragstart = (e) => dragFromWorkspace(e, pathStr);

            const headerDiv = document.createElement('div');
            headerDiv.className = 'loop-header';
            headerDiv.innerHTML = `<span>Repetir</span>`;

            const select = document.createElement('select');
            select.onclick = (e) => e.stopPropagation(); 
            select.onchange = (e) => changeIterations(pathStr, e.target.value);
            for(let v = 2; v <= 9; v++) {
                const opt = document.createElement('option');
                opt.value = v; opt.innerText = `${v} veces`;
                if(item.iterations === v) opt.selected = true;
                select.appendChild(opt);
            }
            headerDiv.appendChild(select);
            loopContainer.appendChild(headerDiv);

            const bodySlots = document.createElement('div');
            bodySlots.className = 'loop-body-slots';
            bodySlots.setAttribute('ondragover', 'allowDrop(event)');
            bodySlots.setAttribute('ondragleave', 'dragLeave(event)');
            bodySlots.ondrop = (e) => dropToWorkspace(e, 'loop', pathStr);
            
            renderBlockTree(bodySlots, item.innerBlocks, currentPath);

            loopContainer.appendChild(bodySlots);
            container.appendChild(loopContainer);
        }
    });
}

function renderWorkspace() {
    const stackContainer = document.getElementById('blocks-stack');
    renderBlockTree(stackContainer, workspaceItems, []);
    updateBlockCountDisplay();
}

function resetLevelState() {
    isExecuting = false;
    executionInterrupted = false;
    reachedTarget = false;

    if (currentCourse === 1) {
        bot.x = startPos.x; bot.y = startPos.y; bot.dir = 0;
    } else {
        const mapSet = currentCourse === 2 ? labyrinthMaps : nestedLoopMaps;
        const mapData = mapSet[currentLevel];
        bot.x = mapData.start.x; bot.y = mapData.start.y; bot.dir = mapData.start.dir;
    }
    document.querySelectorAll('.cell').forEach(c => c.classList.remove('victory'));
    document.querySelectorAll('.block-element, .loop-container-block').forEach(b => b.classList.remove('executing'));
    renderBoard();
}

function triggerDuaError() {
    isExecuting = false;
    document.querySelectorAll('.executing').forEach(el => el.classList.remove('executing'));
    
    const randomIndex = Math.floor(Math.random() * motivationalErrorMessages.length);
    const selectedErrorMsg = motivationalErrorMessages[randomIndex];
    
    document.getElementById('dua-error-message').innerText = selectedErrorMsg;
    document.getElementById('dua-error-modal').style.display = 'flex';
}

function closeDuaModal() {
    document.getElementById('dua-error-modal').style.display = 'none';
    resetLevelState();
}

function triggerDuaSuccess() {
    isExecuting = false;
    const totalBlocks = countTotalBlocks(workspaceItems);
    const maxLimit = getLevelMaxBlocks();
    const titleEl = document.getElementById('dua-success-title');
    const textEl = document.getElementById('dua-success-message');

    if (totalBlocks > maxLimit) {
        levelScores[currentLevel] = 7;
        if (titleEl) titleEl.innerText = "⚡ Reto Completado";
        if (textEl) {
            textEl.innerHTML = `<b>¡Buen trabajo! Sin embargo, puedes mejorar, ya que este reto puede resolverse con menos bloques.</b><br><br>` +
                `<span style="font-size:13px; color:#64748b;">Usaste <b>${totalBlocks}</b> bloques (límite recomendado: <b>${maxLimit}</b>).<br>` +
                `Puntuación de este intento: <b>+7 puntos</b>. ¡Reinténtalo para ganar +10 pts!</span>`;
        }
    } else {
        levelScores[currentLevel] = 10;
        if (titleEl) titleEl.innerText = "✨ ¡Nivel Superado con Éxito! ✨";
        const randomIndex = Math.floor(Math.random() * motivationalSuccessMessages.length);
        const selectedMsg = motivationalSuccessMessages[randomIndex];
        if (textEl) {
            textEl.innerHTML = `<b>${selectedMsg}</b><br><br>` +
                `<span style="font-size:13px; color:#15803d;">¡Excelente eficiencia! Usaste <b>${totalBlocks}</b> de <b>${maxLimit}</b> bloques estimados.<br>` +
                `Puntuación obtenida: <b>+10 puntos</b> 🏆</span>`;
        }
    }

    updateScoreUI();
    document.getElementById('dua-success-modal').style.display = 'flex';
}

function retryCurrentLevel() {
    document.getElementById('dua-success-modal').style.display = 'none';
    resetLevelState();
}

function closeSuccessModal() {
    document.getElementById('dua-success-modal').style.display = 'none';
    advanceLevel();
}

async function executeBlockList(blocks, parentPath = []) {
    for (let i = 0; i < blocks.length; i++) {
        if (!isExecuting || executionInterrupted || reachedTarget) break;

        const currentPath = [...parentPath, i];
        const elementId = `block-${currentPath.join('-')}`;
        const uiElement = document.getElementById(elementId);
        const item = blocks[i];

        if (item.type === 'single') {
            if (uiElement) uiElement.classList.add('executing');
            
            let validMove = executeStep(item.action);
            if (!validMove) {
                executionInterrupted = true;
                triggerDuaError();
                return;
            }
            
            if (checkVictory()) {
                reachedTarget = true;
                if (uiElement) uiElement.classList.remove('executing');
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 450));
            if (uiElement) uiElement.classList.remove('executing');
        } else if (item.type === 'loop') {
            if (uiElement) uiElement.classList.add('executing');

            for (let iter = 0; iter < item.iterations; iter++) {
                if (!isExecuting || executionInterrupted || reachedTarget) break;

                await executeBlockList(item.innerBlocks, currentPath);

                if (reachedTarget || executionInterrupted) break;
            }

            if (uiElement) uiElement.classList.remove('executing');
            if (reachedTarget || executionInterrupted) break;
        }
    }
}

async function runProgram() {
    if (isExecuting || workspaceItems.length === 0) return;
    resetLevelState();
    isExecuting = true;
    reachedTarget = false;
    executionInterrupted = false;

    await executeBlockList(workspaceItems, []);

    isExecuting = false;
    document.querySelectorAll('.executing').forEach(el => el.classList.remove('executing'));

    if (reachedTarget) {
        setTimeout(() => { triggerDuaSuccess(); }, 100);
    } else if (!executionInterrupted) {
        setTimeout(() => { triggerDuaError(); }, 100);
    }
}

function executeStep(command) {
    if (command === 'avanzar') {
        const vec = dirVectors[bot.dir];
        const nextX = bot.x + vec.dx;
        const nextY = bot.y + vec.dy;
        
        if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) return false;
        
        if (currentCourse > 1) {
            const mapSet = currentCourse === 2 ? labyrinthMaps : nestedLoopMaps;
            const terrain = mapSet[currentLevel].grid[nextY][nextX];
            if (terrain === 'M' || terrain === 'V') return false; 
        }
        
        bot.x = nextX;
        bot.y = nextY;
    } else if (command === 'derecha') {
        bot.dir = (bot.dir + 1) % 4;
    } else if (command === 'izquierda') {
        bot.dir = (bot.dir + 3) % 4;
    }
    updateBotVisual();
    return true;
}

function checkVictory() {
    if (bot.x === targetPos.x && bot.y === targetPos.y) {
        const targetCell = document.getElementById('cell-' + targetPos.y + '-' + targetPos.x);
        if (targetCell) targetCell.classList.add('victory');
        return true;
    }
    return false;
}

function advanceLevel() {
    if (currentLevel < TOTAL_LEVELS) {
        currentLevel++;
        generateLevelMap();
    } else {
        document.getElementById('student-name').value = '';
        switchScreen('screen-certificate');
        drawCertificate();
    }
}

function drawCertificate() {
    const canvas = document.getElementById('cert-canvas');
    const ctx = canvas.getContext('2d');
    const name = document.getElementById('student-name').value || "[Tu Nombre Aquí]";
    const finalScore = calculateTotalScore();
    
    let courseTitle = "Curso 1: Primeros pasos";
    if (currentCourse === 2) courseTitle = "Curso 2: Laberintos";
    else if (currentCourse === 3) courseTitle = "Curso 3: Bucles Anidados";

    ctx.fillStyle = "#fff8f0"; ctx.fillRect(0, 0, 650, 450);
    ctx.lineWidth = 15; ctx.strokeStyle = "#00b4c6"; ctx.strokeRect(0, 0, 650, 450);
    ctx.lineWidth = 4; ctx.strokeStyle = "#ffa400"; ctx.strokeRect(18, 18, 614, 414);

    ctx.textAlign = "center";
    ctx.fillStyle = "#333e48"; ctx.font = "bold 24px 'Segoe UI'";
    ctx.fillText("CERTIFICADO DE LOGRO", 325, 75);
    
    ctx.fillStyle = "#ff00a0"; ctx.font = "italic 15px 'Segoe UI'";
    ctx.fillText("Otorgado con orgullo a:", 325, 125);

    ctx.fillStyle = "#000000"; ctx.font = "bold 30px Georgia";
    ctx.fillText(name, 325, 175);

    ctx.fillStyle = "#475569"; ctx.font = "14px 'Segoe UI'";
    ctx.fillText("Por haber completado exitosamente todas las actividades del módulo:", 325, 230);

    ctx.fillStyle = "#00b4c6"; ctx.font = "bold 19px 'Segoe UI'";
    ctx.fillText(courseTitle, 325, 265);

    ctx.fillStyle = "#854d0e"; ctx.font = "bold 16px 'Segoe UI'";
    ctx.fillText(`Puntuación Final Acumulada: ${finalScore} / 120 pts`, 325, 310);

    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(220, 380); ctx.lineTo(430, 380); ctx.stroke();
    ctx.fillStyle = "#64748b"; ctx.font = "italic 12px 'Segoe UI'";
    ctx.fillText("Instructor: Pedro Javier Fuentes Parada", 325, 400);
}

function downloadCertificate() {
    const name = document.getElementById('student-name').value.trim();
    if(!name) { alert("Por favor escribe tu nombre completo para generar el archivo."); return; }
    
    const canvas = document.getElementById('cert-canvas');
    const link = document.createElement('a');
    link.download = `Certificado_Curso_${currentCourse}_${name.replace(/ /g, '_')}.png`;
    link.href = canvas.toDataURL ? canvas.toDataURL() : canvas.toDataURL();
    link.click();
}

function acceptCertificateAndContinue() {
    const name = document.getElementById('student-name').value.trim();
    if(!name) { alert("Escribe tu nombre antes de continuar para guardar tu registro."); return; }

    if (currentCourse < 3) {
        const nextCourseNum = currentCourse + 1;
        if(!unlockedCourses.includes(nextCourseNum)) unlockedCourses.push(nextCourseNum);
        
        const nextCourseName = nextCourseNum === 2 ? "Curso 2: Laberintos" : "Curso 3: Bucles Anidados";
        alert(`¡Felicidades! Se ha desbloqueado el ${nextCourseName}.`);
        
        currentCourse = nextCourseNum;
        currentLevel = 1;
        document.getElementById('app-current-title').innerText = `Programación en Bloques: ${nextCourseName.split(': ')[1]}`;
        switchScreen('screen-game');
        initProgressBar();
        generateLevelMap();
    } else {
        alert("¡Increíble! Has finalizado todos los cursos de la plataforma. ¡Eres un auténtico maestro de la programación!");
        currentCourse = 1;
        currentLevel = 1;
        updateHomeUI();
        switchScreen('screen-home');
    }
}

// Evento de inicialización cuando el documento está completamente cargado
window.addEventListener('load', () => {
    initTouchDragSupport();
    updateHomeUI();
});
