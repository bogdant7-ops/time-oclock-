let WORK_TIME = 25 * 60; // Дефолт 25 минут
let BREAK_TIME = 5 * 60;
let timeLeft = WORK_TIME;
let timerId = null;
let isRunning = false;
let isBreak = false;

let streak = localStorage.getItem('focus_streak') ? parseInt(localStorage.getItem('focus_streak')) : 0;

const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const taskInput = document.getElementById('task-input');
const currentTask = document.getElementById('current-task');
const modeIndicator = document.getElementById('mode-indicator');
const streakCount = document.getElementById('streak-count');
const presetButtons = document.querySelectorAll('.preset-btn');
const customMinutesInput = document.getElementById('custom-minutes');

streakCount.textContent = `${streak} days streak`;

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.title = `(${timerDisplay.textContent}) Focus & Flow`;
}

function playNotificationSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 1.5);
    } catch (e) {
        console.log("Audio context blocked");
    }
}

// Смена времени по кнопкам или инпуту
function setTimerDuration(minutes) {
    if (isRunning) return; // Не меняем во время активного таймера
    WORK_TIME = minutes * 60;
    timeLeft = WORK_TIME;
    updateTimerDisplay();
}

presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (isRunning) return;
        presetButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        customMinutesInput.value = '';

        const minutes = parseInt(btn.getAttribute('data-time'));
        setTimerDuration(minutes);
    });
});

customMinutesInput.addEventListener('input', () => {
    if (isRunning) return;
    let val = parseInt(customMinutesInput.value);

    if (val >= 1 && val <= 100) {
        presetButtons.forEach(b => b.classList.remove('active'));
        setTimerDuration(val);
    }
});

function toggleTimer() {
    if (isRunning) {
        clearInterval(timerId);
        startBtn.textContent = 'Старт';
        isRunning = false;
        // Включаем обратно кнопки настройки при паузе/остановке
        customMinutesInput.disabled = false;
    } else {
        startBtn.textContent = 'Пауза';
        isRunning = true;
        customMinutesInput.disabled = true;

        timerId = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(timerId);
                isRunning = false;
                customMinutesInput.disabled = false;
                playNotificationSound();

                if (!isBreak) {
                    isBreak = true;
                    timeLeft = BREAK_TIME;
                    document.body.classList.add('break-mode');
                    modeIndicator.textContent = '✦ break';
                    currentTask.textContent = 'Время отдыхать';

                    streak++;
                    localStorage.setItem('focus_streak', streak);
                    streakCount.textContent = `${streak} days streak`;

                    alert('Сессия фокуса завершена! Время отдохнуть 5 минут.');
                } else {
                    isBreak = false;
                    timeLeft = WORK_TIME;
                    document.body.classList.remove('break-mode');
                    modeIndicator.textContent = '✦ focus';
                    currentTask.textContent = 'Введи задачу внизу и начни сессию';
                    alert('Отдых окончен. Погнали дальше!');
                }

                startBtn.textContent = 'Старт';
                updateTimerDisplay();
            }
        }, 1000);
    }
}

startBtn.addEventListener('click', toggleTimer);

resetBtn.addEventListener('click', () => {
    clearInterval(timerId);
    isRunning = false;
    isBreak = false;
    timeLeft = WORK_TIME;
    customMinutesInput.disabled = false;
    document.body.classList.remove('break-mode');
    modeIndicator.textContent = '✦ focus';
    startBtn.textContent = 'Старт';
    updateTimerDisplay();
});

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && taskInput.value.trim() !== '') {
        currentTask.textContent = taskInput.value;
        taskInput.value = '';
    }
});

updateTimerDisplay();
