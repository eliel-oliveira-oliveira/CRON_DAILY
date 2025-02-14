// script.js
let team = [];
let shuffledTeam = [];
let currentIndex = 0;
let countdown;
let turnDuration;
let remainingTime;
let isTimerRunning = false;  // variável para controlar o estado do cronômetro
let isPreparationPhase = false;  // variável para controlar a fase de preparação
const breakDuration = 1;
// Função atualizada para embaralhar a equipe e salvar no cache
function shuffleTeam() {
    const input = document.getElementById("teamMembers").value;
    localStorage.setItem("teamMembers", input);
    team = input.split('\n').map(name => name.trim()).filter(name => name);
    if (team.length === 0) {
        alert("Por favor, insira pelo menos um nome.");
        return;
    }
    shuffledTeam = [...team];
    for (let i = shuffledTeam.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledTeam[i], shuffledTeam[j]] = [shuffledTeam[j], shuffledTeam[i]];
    }
    document.getElementById("sortedList").innerText = `Ordem Sorteada: ${shuffledTeam.join(', ')}`;
    document.getElementById("startTimer").disabled = false;
    currentIndex = 0;
    const userTime = parseInt(document.getElementById("turnTime").value);
    turnDuration = !isNaN(userTime) && userTime >= 1 ? userTime : 60;
    updateTimerDisplay(turnDuration);
}
// Carregar lista de membros do cache no carregamento da página
window.onload = loadTeamFromCache;
function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById("timerDisplay").innerText = 
        `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
function startTurn() {
    if (currentIndex >= shuffledTeam.length) {
        alert("Todos os membros completaram seus turnos!");
        resetControls();
        return;
    }
    const currentSpeaker = shuffledTeam[currentIndex];
    document.getElementById("currentSpeaker").innerText = `Prepare-se: ${currentSpeaker}`;
    document.getElementById("currentSpeaker").className = 'preparing';
    document.getElementById("startTimer").disabled = true;
    document.getElementById("stopTimer").disabled = true; // Desativar botão "Parar" durante a preparação
    document.getElementById("nextTurn").disabled = true; // Desativar botão "Avançar" durante a preparação
    isPreparationPhase = true;
    playPreparationSound().then(() => {
        document.getElementById("currentSpeaker").innerText = `Falando agora: ${currentSpeaker}`;
        document.getElementById("currentSpeaker").className = 'speaking';
        isPreparationPhase = false; // Preparação concluída
        document.getElementById("stopTimer").disabled = false; // Reativar botão "Parar"
        document.getElementById("nextTurn").disabled = false; // Reativar botão "Avançar"
        startCountdown(turnDuration, nextTurn);
    }).catch(error => console.error("Erro ao reproduzir som de preparação:", error));
}
function startCountdown(duration, callback) {
    remainingTime = duration;
    isTimerRunning = true;
    updateTimerDisplay(remainingTime);
    document.getElementById("pauseTimer").disabled = false;
    document.getElementById("nextTurn").disabled = false;
    countdown = setInterval(() => {
        remainingTime--;
        updateTimerDisplay(remainingTime);
        if (remainingTime <= 0) {
            clearInterval(countdown);
            isTimerRunning = false;
            playBeep();
            setTimeout(callback, breakDuration * 1000);
        }
    }, 1000);
}
function pauseTurn() {
    if (isTimerRunning) {
        clearInterval(countdown);
        isTimerRunning = false;
        document.getElementById("resumeTimer").disabled = false;
        document.getElementById("pauseTimer").disabled = true;
    }
}
function resumeTurn() {
    if (!isTimerRunning && remainingTime > 0) {
        startCountdown(remainingTime, nextTurn);
        document.getElementById("resumeTimer").disabled = true;
        document.getElementById("pauseTimer").disabled = false;
    }
}
function advanceTurn() {
    if (isPreparationPhase) {
        // Ignorar tempo de preparação e ir diretamente ao próximo turno
        isPreparationPhase = false;
        clearInterval(countdown);
        nextTurn();
    } else {
        clearInterval(countdown);
        isTimerRunning = false;
        document.getElementById("resumeTimer").disabled = true;
        nextTurn();
    }
}
function stopTurn() {
    clearInterval(countdown);
    isTimerRunning = false;
    isPreparationPhase = false;
    resetControls();
    document.getElementById("timerDisplay").innerText = "00:00";
    document.getElementById("currentSpeaker").innerText = "";
}
function nextTurn() {
    currentIndex++;
    if (currentIndex < shuffledTeam.length) {
        startTurn();
    } else {
        alert("Todos os turnos foram completados!");
        resetControls();
    }
}
function resetControls() {
    document.getElementById("startTimer").disabled = false;
    document.getElementById("stopTimer").disabled = true;
    document.getElementById("pauseTimer").disabled = true;
    document.getElementById("resumeTimer").disabled = true;
    document.getElementById("nextTurn").disabled = true;
    isTimerRunning = false;
    isPreparationPhase = false;
    currentIndex = 0;
}
function playPreparationSound() {
    return new Promise((resolve, reject) => {
        const preparationSound = new Audio('src/timedaily_preparacao.mp3');
        preparationSound.onended = resolve;
        preparationSound.onerror = reject;
        preparationSound.play().catch(reject);
    });
}
function playBeep() {
    const beep = new Audio('src/timedaily_beep.mp3');
    beep.play().catch(error => {
        console.error("Erro ao reproduzir som de bipe:", error);
    });
}
function loadTeamFromCache() {
    const cachedTeam = localStorage.getItem("teamMembers");
    if (cachedTeam) {
        document.getElementById("teamMembers").value = cachedTeam;
    }
}
  