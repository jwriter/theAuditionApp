const fileListEl = document.getElementById('file-list');
const toggleBtn = document.getElementById('toggle-list');

toggleBtn.addEventListener('click', () => {
  fileListEl.classList.toggle('hidden');
});

window.electronAPI.onFileList((data) => {
  fileListEl.innerHTML = '';
  document.title = `MP4 Browser - ${data.folder}`;
  data.files.forEach(file => {
    const item = document.createElement('div');
    item.textContent = file;
    item.addEventListener('click', () => {
      window.electronAPI.notifyFileClicked(file);
    });
    fileListEl.appendChild(item);
  });
});
