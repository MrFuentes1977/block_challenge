const GRID_SIZE = 8;
const TOTAL_LEVELS = 12;

let currentCourse = 1;
let currentLevel = 1;
let unlockedCourses = [1]; 
let pendingCourseToUnlock = null;

// SEGUIMIENTO DE NIVELES COMPLETADOS POR CADA CURSO
let completedLevels = {
    1: [],
    2: [],
    3: []
};

// LÍMITES DE BLOQUES POR RETO (SOLO APLICAN EN EL CURSO 3)
const levelBlockLimits = {
    1: 7,  // Reto 1
    2: 7,  // Reto 2
    3: 4,  // Reto 3
    4: 14, // Reto 4
    5: 4,  // Reto 5
    6: 7,  // Reto 6
    7: 5,  // Reto 7
    8: 13, // Reto 8
    9: 13, // Reto 9
    10: 9, // Reto 10
    11: 9, // Reto 11
    12: 13 // Reto 12
};

// SISTEMA DE PUNTUACIÓN (SOLO PARA EL CURSO 3)
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
    const scoreContainer = document.getElementById('score-container');
    if (currentCourse === 3) {
        if (scoreContainer) scoreContainer.style.display = 'flex';
        const total = calculateTotalScore();
        const scoreEl = document.getElementById('total-score');
        if (scoreEl) {
            scoreEl.innerText = total;
        }
    } else {
        if (scoreContainer) scoreContainer.style.display = 'none';
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

// EXPLICACIONES DUA PARA LOS NIVELES DEL CURSO 1, CURSO 2 Y CURSO 3
const duaLevelHints = {
    1: {
        1: "<b>Paso 1: Orientación inicial.</b> Observa hacia dónde mira el robot y usa el bloque <b>avanzar</b> para dar el primer paso. Si necesitas cambiar de dirección, usa <b>girar a la derecha</b> o <b>girar a la izquierda</b> para alinearte con la casilla roja.",
        2: "<b>Paso 2: Combinando giros y avance.</b> Para este reto, gira primero hacia la dirección correcta usando <b>girar a la derecha</b> o <b>girar a la izquierda</b>. Luego, arrastra los bloques <b>avanzar</b> necesarios hasta llegar al objetivo.",
        3: "<b>Paso 3: Trayecto completo.</b> Planifica tu secuencia: avanza los pasos necesarios, gira a la izquierda o derecha según la esquina, y vuelve a avanzar. ¡Prueba combinar ambos giros con los pasos rectos!",
        4: "Tu objetivo es guiar al robot desde la casilla de inicio (azul) hasta la meta (roja). ¡Planifica tus bloques de avanzar y girar!",
        5: "Tu objetivo es guiar al robot desde la casilla de inicio (azul) hasta la meta (roja). ¡Planifica tus bloques de avanzar y girar!",
        6: "Tu objetivo es guiar al robot desde la casilla de inicio (azul) hasta la meta (roja). ¡Planifica tus bloques de avanzar y girar!",
        7: "Tu objetivo es guiar al robot desde la casilla de inicio (azul) hasta la meta (roja). ¡Planifica tus bloques de avanzar y girar!",
        8: "Tu objetivo es guiar al robot desde la casilla de inicio (azul) hasta la meta (roja). ¡Planifica tus bloques de avanzar y girar!",
        9: "Tu objetivo es guiar al robot desde la casilla de inicio (azul) hasta la meta (roja). ¡Planifica tus bloques de avanzar y girar!",
        10: "Tu objetivo es guiar al robot desde la casilla de inicio (azul) hasta la meta (roja). ¡Planifica tus bloques de avanzar y girar!",
        11: "Tu objetivo es guiar al robot desde la casilla de inicio (azul) hasta la meta (roja). ¡Planifica tus bloques de avanzar y girar!",
        12: "Tu objetivo es guiar al robot desde la casilla de inicio (azul) hasta la meta (roja). ¡Planifica tus bloques de avanzar y girar!"
    },
    2: {
        1: "Lleva al robot desde la casilla azul hasta la casilla roja siguiendo el camino correcto.",
        2: "Tu tarea es guiar al personaje desde el punto azul hasta el punto rojo sin chocar con los obstáculos.",
        3: "Programa los movimientos necesarios para que el robot llegue del inicio (azul) al destino (rojo).",
        4: "Diseña la ruta que conecte azul con rojo usando los bloques de avanzar y girar.",
        5: "Haz que el robot recorra el trayecto desde azul hasta rojo paso a paso.",
        6: "Planifica la secuencia de comandos para mover al robot desde azul hasta rojo.",
        7: "Tu misión: encontrar el camino más corto entre azul y rojo. ¡Usa tu lógica!",
        8: "Indica los movimientos que permitirán al robot llegar del punto azul al punto rojo.",
        9: "Construye el recorrido que lleve al robot desde la posición azul hasta la meta roja.",
        10: "Guía al robot desde azul hasta rojo evitando los muros y tomando el camino correcto.",
        11: "Crea la secuencia de instrucciones para que el robot avance desde azul hasta rojo sin errores.",
        12: "El reto consiste en mover al robot del punto azul al punto rojo usando los bloques adecuados."
    },
    3: {
        1: "El robot sigue un camino que se repite tres veces. Si escribimos todas las instrucciones sería muy largo, pero con un bucle lo hacemos más fácil: repetimos 3 veces y dentro ponemos los pasos rectos y los giros. Así el programa es más rápido de escribir y más sencillo de entender.",
        2: "El camino del robot es una escalera. Cada escalón se forma con dos pasos: avanzar y girar. Como todos los escalones son iguales, podemos usar un bucle que repita esa acción varias veces. Así el programa es más corto y más fácil de entender.",
        3: "El robot debe recorrer un cuadrado. Cada lado se hace avanzando varias veces y luego girando. Como los cuatro lados son iguales, usamos un bucle que se repite 4 veces. Dentro ponemos los pasos rectos y al final de cada lado el giro. Así el programa es más corto y más fácil de entender.",
        4: "El camino del robot está formado por varios tramos rectos que se alternan con giros, creando el patrón en zigzag.<br>Cada tramo recto se recorre avanzando varias casillas seguidas. 👉 Para esto usamos un bucle interno que repite la acción de avanzar.<br>El zigzag completo se construye repitiendo esos tramos rectos seguidos de un giro. 👉 Para esto usamos un bucle externo, que repite la secuencia “avanzar + girar” tantas veces como idas y vueltas tenga el camino.",
        5: "El robot debe recorrer una espiral. Cada tramo se hace avanzando varias veces y luego girando. Como el patrón se repite, usamos un bucle externo para los lados de la espiral y dentro un bucle interno para los pasos rectos. Así el programa se reduce a solo dos bucles y es mucho más fácil de entender.",
        6: "La misión es construir la ruta que conduce hasta la meta final.",
        7: "El propósito es diseñar el trayecto que conduce al punto de llegada.",
        8: "La tarea busca elaborar la ruta que guía al robot hasta su destino.",
        9: "El reto consiste en crear el recorrido que conecta el inicio con la llegada.",
        10: "La tarea es organizar los pasos que guían al punto de llegada.",
        11: "La finalidad es programar el camino correcto para alcanzar el objetivo.",
        12: "El reto busca diseñar la secuencia de movimientos que llevan al destino final."
    }
};

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
        {x: 2, y: 4, symbol: '↻'}
    ], grid: [
['M','M','M','M','M','M','C','M'],
['M','M','M','M','M','M','C','M'],
['M','M','M','M','C','C','C','M'],
['M','M','M','M','C','M','M','M'],
['M','M','C','C','C','M','M','M'],
['M','M','C','M','M','M','M','M'],
['C','C','C','M','M','M','M','M'],
['M','M','M','M','M','M','M','M']] },
    3: { start: {x: 1, y: 1, dir: 0}, target: {x: 1, y: 3}, hints: [
        {x: 6, y: 1, symbol: '↻'}
    ], grid: [
['M','M','M','M','M','M','M','M'],
['M','C','C','C','C','C','C','M'],
['M','M','M','M','M','M','C','M'],
['M','C','M','M','M','M','C','M'],
['M','C','M','M','M','M','C','M'],
['M','C','M','M','M','M','C','M'],
['M','C','C','C','C','C','C','M'],
['M','M','M','M','M','M','M','M']] },
    4: { start: {x: 1, y: 1, dir: 0}, target: {x: 5, y: 5}, hints: [
        {x: 5, y: 1, symbol: '↻'},
        {x: 2, y: 3, symbol: '↺'}
    ], grid: [
['M','M','M','M','M','M','M','M'],
['M','C','C','C','C','C','M','M'],
['M','M','M','M','M','C','M','M'],
['M','M','C','C','C','C','M','M'],
['M','M','C','M','M','M','M','M'],
['M','M','C','C','C','C','M','M'],
['M','M','M','M','M','M','M','M'],
['M','M','M','M','M','M','M','M']] },
    5: { start: {x: 0, y: 0, dir: 0}, target: {x: 0, y: 6}, hints: [
        {x: 0, y: 6, symbol: '↻'}
    ], grid: [
['C','C','C','C','C','C','C','M'],
['M','M','M','M','M','M','C','M'],
['M','M','M','M','M','M','C','M'],
['M','M','M','M','M','M','C','M'],
['M','M','M','M','M','M','C','M'],
['M','M','M','M','M','M','C','M'],
['C','C','C','C','C','C','C','M'],
['M','M','M','M','M','M','M','M']] },
    6: { start: {x: 0, y: 7, dir: 0}, target: {x: 6, y: 1}, grid: [
['M','M','M','M','M','M','M','M'],
['M','M','M','M','C','C','C','M'],
['M','M','M','M','C','M','M','M'],
['M','M','C','C','C','M','M','M'],
['M','M','C','M','M','M','M','M'],
['C','C','C','M','M','M','M','M'],
['C','M','M','M','M','M','M','M'],
['C','M','M','M','M','M','M','M']] },
    7: { start: {x: 7, y: 7, dir: 2}, target: {x: 0, y: 0}, grid: [
['C','C','M','M','M','M','M','M'],
['M','C','C','M','M','M','M','M'],
['M','M','C','C','M','M','M','M'],
['M','M','M','C','C','M','M','M'],
['M','M','M','M','C','C','M','M'],
['M','M','M','M','M','C','C','M'],
['M','M','M','M','M','M','C','C'],
['M','M','M','M','M','M','M','C']] },
    8: { start: {x: 1, y: 1, dir: 0}, target: {x: 6, y: 7}, grid: [
['M','M','M','M','M','M','M','M'],
['M','C','C','C','C','C','C','M'],
['M','M','M','M','M','M','C','M'],
['M','C','C','C','C','C','C','M'],
['M','C','M','M','M','M','M','M'],
['M','C','C','C','C','C','C','M'],
['M','M','M','M','M','M','C','M'],
['M','M','M','M','M','M','C','M']] },
    9: { start: {x: 0, y: 0, dir: 0}, target: {x: 0, y: 6}, grid: [
['C','C','C','C','C','C','C','C'],
['M','M','M','M','M','M','M','C'],
['C','C','C','C','C','C','C','C'],
['C','M','M','M','M','M','M','M'],
['C','C','C','C','C','C','C','C'],
['M','M','M','M','M','M','M','C'],
['C','C','C','C','C','C','C','C'],
['M','M','M','M','M','M','M','M']] },
    10: { start: {x: 0, y: 3, dir: 3}, target: {x: 7, y: 3}, grid: [
['M','M','M','M','M','M','M','M'],
['C','C','C','M','C','C','C','M'],
['C','M','C','M','C','M','C','M'],
['C','M','C','C','C','M','C','C'],
['M','M','M','M','M','M','M','M'],
['M','M','M','M','M','M','M','M'],
['M','M','M','M','M','M','M','M'],
['M','M','M','M','M','M','M','M']] },
    11: { start: {x: 0, y: 3, dir: 1}, target: {x: 7, y: 3}, grid: [
['M','M','M','M','M','M','M','M'],
['M','M','M','M','M','M','M','M'],
['M','M','M','M','M','M','M','M'],
['C','M','C','C','C','M','C','C'],
['C','M','C','M','C','M','C','M'],
['C','C','C','M','C','C','C','M'],
['M','M','M','M','M','M','M','M'],
['M','M','M','M','M','M','M','M']] },
    12: { start: {x: 7, y: 7, dir: 3}, target: {x: 0, y: 7}, grid: [
['M','C','C','C','M','C','C','C'],
['M','C','M','C','M','C','M','C'],
['M','C','M','C','M','C','M','C'],
['M','C','M','C','M','C','M','C'],
['M','C','M','C','M','C','M','C'],
['M','C','M','C','M','C','M','C'],
['M','C','M','C','M','C','M','C'],
['C','C','M','C','C','C','M','C']] }
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

// CADENAS SVG DE ÍCONOS ACCESIBLES
const svgMove = `<svg class="block-icon" viewBox="0 0 100 100"><path d="M 10,32 H 55 V 15 L 90,50 L 55,85 V 68 H 10 Z" /></svg>`;
const svgTurnLeft = `<svg class="block-icon" viewBox="0 0 100 100"><path d="M 85,85 V 50 C 85,32 70,18 52,18 H 40 V 2 L 10,32 L 40,62 V 45 H 52 C 58,45 65,51 65,58 V 85 Z" /></svg>`;
const svgTurnRight = `<svg class="block-icon" viewBox="0 0 100 100"><path d="M 15,85 V 50 C 15,32 30,18 48,18 H 60 V 2 L 90,32 L 60,62 V 45 H 48 C 42,45 35,51 35,58 V 85 Z" /></svg>`;

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
        pendingCourseToUnlock = courseNum;
        document.getElementById('course-password-input').value = '';
        document.getElementById('password-modal').style.display = 'flex';
        document.getElementById('course-password-input').focus();
        return;
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

function closePasswordModal() {
    document.getElementById('password-modal').style.display = 'none';
    pendingCourseToUnlock = null;
}

function confirmCoursePassword() {
    const pass = document.getElementById('course-password-input').value;
    if (pass === "2846") {
        const courseNum = pendingCourseToUnlock;
        if (!unlockedCourses.includes(courseNum)) unlockedCourses.push(courseNum);
        updateHomeUI();
        closePasswordModal();
        startCourse(courseNum);
    } else {
        alert("Clave incorrecta. Debes completar primero los cursos previos o solicitar la clave al profesor.");
        document.getElementById('course-password-input').value = '';
    }
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
        if (completedLevels[currentCourse].includes(i)) dot.classList.add('completed');
        if (i === currentLevel) dot.classList.add('active');
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

function showCrashWarning(x, y) {
    const cell = document.getElementById(`cell-${y}-${x}`);
    if (cell) {
        const warningEl = document.createElement('div');
        warningEl.className = 'cell-crash-warning';
        warningEl.innerText = '⚠️';
        cell.appendChild(warningEl);

        setTimeout(() => {
            if (warningEl.parentNode) {
                warningEl.parentNode.removeChild(warningEl);
            }
        }, 700);
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
    const titleEl = document.getElementById('workspace-title-count');
    if (!titleEl) return;

    if (currentCourse === 3) {
        const total = countTotalBlocks(workspaceItems);
        const limit = getLevelMaxBlocks();
        titleEl.innerText = `Espacio de trabajo: ${total} / ${limit} bloques estimados`;
        titleEl.style.color = (total > limit) ? '#fca5a5' : '#ffffff';
    } else {
        titleEl.innerText = `Espacio de trabajo`;
        titleEl.style.color = '#ffffff';
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
            
            if (item.action === 'avanzar') block.innerHTML = `<span>avanzar</span>${svgMove}`;
            else if (item.action === 'izquierda') block.innerHTML = `<span>girar a la izquierda</span>${svgTurnLeft}`;
            else block.innerHTML = `<span>girar a la derecha</span>${svgTurnRight}`;
            
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
    
    // REGISTRAR EL NIVEL COMO COMPLETADO
    if (!completedLevels[currentCourse].includes(currentLevel)) {
        completedLevels[currentCourse].push(currentLevel);
    }

    const titleEl = document.getElementById('dua-success-title');
    const textEl = document.getElementById('dua-success-message');
    const randomIndex = Math.floor(Math.random() * motivationalSuccessMessages.length);
    const selectedMsg = motivationalSuccessMessages[randomIndex];

    if (currentCourse === 3) {
        const totalBlocks = countTotalBlocks(workspaceItems);
        const maxLimit = getLevelMaxBlocks();

        if (totalBlocks > maxLimit) {
            levelScores[currentLevel] = 7;
            if (titleEl) titleEl.innerText = "⚡ Reto Completado";
            if (textEl) {
                textEl.innerHTML = `<b>¡Buen trabajo! Sin embargo, puedes mejorar, ya que este reto puede resolverse con menos bloques.</b><br><br>` +
                    `<span style="font-size:14px; color:#64748b;">Usaste <b>${totalBlocks}</b> bloques (límite recomendado: <b>${maxLimit}</b>).<br>` +
                    `Puntuación de este intento: <b>+7 puntos</b>. ¡Reinténtalo para ganar +10 pts!</span>`;
            }
        } else {
            levelScores[currentLevel] = 10;
            if (titleEl) titleEl.innerText = "✨ ¡Nivel Superado con Éxito! ✨";
            if (textEl) {
                textEl.innerHTML = `<b>${selectedMsg}</b><br><br>` +
                    `<span style="font-size:14px; color:#15803d;">¡Excelente eficiencia! Usaste <b>${totalBlocks}</b> de <b>${maxLimit}</b> bloques estimados.<br>` +
                    `Puntuación obtenida: <b>+10 puntos</b> 🏆</span>`;
            }
        }
    } else {
        if (titleEl) titleEl.innerText = "✨ ¡Nivel Superado! ✨";
        if (textEl) textEl.innerHTML = `<b>${selectedMsg}</b>`;
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
        
        // Colisión con bordes del mapa
        if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
            showCrashWarning(bot.x, bot.y);
            return false;
        }
        
        // Colisión con obstáculos (Curso 2 y 3)
        if (currentCourse > 1) {
            const mapSet = currentCourse === 2 ? labyrinthMaps : nestedLoopMaps;
            const terrain = mapSet[currentLevel].grid[nextY][nextX];
            if (terrain === 'M' || terrain === 'V') {
                showCrashWarning(nextX, nextY);
                return false; 
            }
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
    // VERIFICAR SI YA COMPLETÓ TODOS LOS 12 NIVELES DEL CURSO ACTUAL
    const totalCompleted = completedLevels[currentCourse].length;

    if (totalCompleted === TOTAL_LEVELS) {
        // OBTENER CERTIFICADO SOLO SI SUPERÓ LOS 12 NIVELES
        document.getElementById('student-name').value = '';
        switchScreen('screen-certificate');
        drawCertificate();
    } else if (currentLevel < TOTAL_LEVELS) {
        currentLevel++;
        generateLevelMap();
    } else {
        // SI ESTÁ EN EL NIVEL 12 PERO HIZO SALTOS Y NO HA COMPLETADO LOS 12 NIVELES
        const missingCount = TOTAL_LEVELS - totalCompleted;
        alert(`⚠️ Para obtener tu certificado debes completar todos los 12 niveles. Aún te faltan ${missingCount} nivel(es) por superar.`);
        
        // Buscar el primer nivel que no haya completado para enviarlo allí
        for (let lvl = 1; lvl <= TOTAL_LEVELS; lvl++) {
            if (!completedLevels[currentCourse].includes(lvl)) {
                currentLevel = lvl;
                break;
            }
        }
        generateLevelMap();
    }
}

function drawCertificate() {
    const canvas = document.getElementById('cert-canvas');
    const ctx = canvas.getContext('2d');
    const name = document.getElementById('student-name').value || "[Tu Nombre Aquí]";
    
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
    ctx.fillText("Por haber completado exitosamente los 12 niveles del módulo:", 325, 230);

    ctx.fillStyle = "#00b4c6"; ctx.font = "bold 19px 'Segoe UI'";
    ctx.fillText(courseTitle, 325, 265);

    // SOLO SE MUESTRA LA PUNTUACIÓN ACUMULADA AL FINALIZAR EL CURSO DE BUCLES ANIDADOS
    if (currentCourse === 3) {
        const finalScore = calculateTotalScore();
        ctx.fillStyle = "#854d0e"; ctx.font = "bold 16px 'Segoe UI'";
        ctx.fillText(`Puntuación Final Acumulada: ${finalScore} / 120 pts`, 325, 310);
    }

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

// Inicialización de interfaz inicial
updateHomeUI();
