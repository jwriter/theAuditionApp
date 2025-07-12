//const path = require('path');

//const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
//const fs = require('fs');

let inLoop = false;
let subtitles = [];
let loopId = 0;
const video = document.getElementById('video');
const subtitleDiv = document.getElementById('subtitleLabel');
const offset = 0.3; // смещение для перемотки назад

const fileListEl = document.getElementById('file-list');

window.electronAPI.onFileList((data) => {
  fileListEl.innerHTML = '';
  document.title = `MP4 Browser - ${data.folder}`;
  data.files.forEach(file => createFileInFilelist(data.folder, file));
});

function createFileInFilelist(folder, file) {
  const item = document.createElement('div');
  item.textContent = file;
  item.addEventListener('click', () => {
    loadVideo(folder, file)
  });
  fileListEl.appendChild(item);
}

function loadVideo(folder, filename) {
  console.log('fn1:', folder, filename);
    let videoPath = window.electronAPI.joinPathes(folder, filename);
    console.log('fn2:', videoPath);
    // Подставь путь к своему видеофайлу
    video.src = videoPath;//'C:\\delete\\Friends.S01E01-h264.mp4';
    video.load();

    console.log(1, videoPath);
    let parsed = window.electronAPI.parseFile(videoPath)
    console.log(2, parsed);
    parsed.ext = ".srt"
    console.log(3, parsed);
    let srtPath = window.electronAPI.formatFile(parsed)
    console.log(4, srtPath);

    let newFilename = filename.replace('.mp4', '.srt')
    srtPath = window.electronAPI.joinPathes(folder, parsed.name + parsed.ext);
    
    if (window.electronAPI.existsSync(srtPath)){
      console.log(srtPath);
      fetch(srtPath)
          .then(res => res.text())
          .then(parseSRT)
          .then(subs => {
          subtitles = subs;
          console.log('Субтитры загружены:', subtitles);
          });

      console.log('Назначили src, video.readyState:', video.readyState);
    }else {
      console.log('Файл ',srtPath,' не найден');
    }
}


function parseSRT(data) {
  const subs = [];
  const regex = /(\d+)\s+(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\s+([\s\S]*?)(?=\n{2,}|$)/g;
  let match;
  let counter = 0;
  while ((match = regex.exec(data)) !== null) {
    subs.push({
      id: counter,
      index: parseInt(match[1]),
      start: timeStrToSec(match[2]),
      end: timeStrToSec(match[3]),
      text: match[4].replace(/\n/g, ' ')
    });
    counter++;
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

  if(inLoop) {
    if (t > subtitles[loopId].end ) {
      video.currentTime = subtitles[loopId].start - offset;
      subtitleDiv.textContent = subtitles[loopId].text;
    }
  }
  else {
    const sub = subtitles.find(s => t >= s.start && t <= s.end);
    let subContent = sub ? sub.text : '';

    if (sub) loopId = sub.id;
    subtitleDiv.textContent = subContent;
  }
});

// управление клавишами
document.addEventListener('keydown', (e) => {
  if (!subtitles.length) return;

  if (e.code === 'ArrowRight') {
    loopId = Math.min(loopId + 1, subtitles.length - 1);
    video.currentTime = subtitles[loopId].start;

  } else if (e.code === 'ArrowLeft') {
    loopId = Math.max(loopId - 1, 0);
    let startTime = subtitles[loopId].start;
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
  