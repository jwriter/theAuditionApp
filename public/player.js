
let inLoop = false;
let subtitles = [];
let currentSubtitleIndex = -1;
const video = document.getElementById('video');
const subtitleDiv = document.getElementById('subtitle');
const offset = 0.3; // смещение для перемотки назад

// Ждем загрузки DOM, чтобы кнопка точно существовала
document.addEventListener("DOMContentLoaded", function () {
  const button = document.getElementById("loadingButton");
  button.addEventListener("click", function loadVideo() {
    // Подставь путь к своему видеофайлу
    video.src = 'C:\\delete\\Friends.S01E01-h264.mp4';
    video.load();

    // Загружаем субтитры из SRT-файла
    fetch("C:\\delete\\2_English.srt")
        .then(res => res.text())
        .then(parseSRT)
        .then(subs => {
        subtitles = subs;
        console.log('Субтитры загружены:', subtitles);
        });

    console.log('Назначили src, video.readyState:', video.readyState);
  });
});

function parseSRT(data) {
  const subs = [];
  const regex = /(\d+)\s+(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\s+([\s\S]*?)(?=\n{2,}|$)/g;
  let match;
  while ((match = regex.exec(data)) !== null) {
    subs.push({
      index: parseInt(match[1]),
      start: timeStrToSec(match[2]),
      end: timeStrToSec(match[3]),
      text: match[4].replace(/\n/g, ' ')
    });
  }
  return subs;
}

function timeStrToSec(timeStr) {
  const [h, m, s] = timeStr.replace(',', '.').split(':');
  return parseFloat(h) * 3600 + parseFloat(m) * 60 + parseFloat(s);
}

// обновляем субтитры в зависимости от текущего времени видео
video.addEventListener('timeupdate', () => {
  if (!subtitles.length) return;
  const t = video.currentTime;

  let index = Math.max(currentSubtitleIndex - 1, 0);
  if (index >= 0 && index < subtitles.length - 1) {
    let currentEnd = index >= 0 ? subtitles[index].end : 0;

    if (inLoop && index >= 0 && t >= currentEnd) {
      // если включен цикл, перематываем на начало текущих субтитров
      video.currentTime = subtitles[index].start - offset;
      return;
    }
  }

  const sub = subtitles.find(s => t >= s.start && t <= s.end);
  let subContent = sub ? sub.text : '';

  if (sub) currentSubtitleIndex = sub.index

  subtitleDiv.textContent = subContent;
});

// управление клавишами
document.addEventListener('keydown', (e) => {
  if (!subtitles.length) return;

  if (e.code === 'ArrowRight') {
    currentSubtitleIndex = Math.min(currentSubtitleIndex + 1, subtitles.length - 1);
    video.currentTime = subtitles[currentSubtitleIndex].start;

  } else if (e.code === 'ArrowLeft') {
    currentSubtitleIndex = Math.max(currentSubtitleIndex - 2, 0);
    let startTime = subtitles[currentSubtitleIndex].start;
    if (startTime > offset) startTime -= offset;
    video.currentTime = startTime;

  } else if (e.code === 'Space') {
    if (video.paused) video.play();
    else video.pause();

  }  else if (e.code === 'KeyL') {
    inLoop = !inLoop;;
  }else{
    console.log('Нажата клавиша:', e.code);
  }
});
  