document.addEventListener('DOMContentLoaded', () => {
  const streamUrlInput = document.getElementById('streamUrl');
  const saveStreamBtn = document.getElementById('saveStream');
  const clearStreamBtn = document.getElementById('clearStream');
  const streamFrame = document.getElementById('streamFrame');
  const playerEmpty = document.getElementById('playerEmpty');
  const statusText = document.getElementById('statusText');
  const statusDot = document.querySelector('.status-pill .dot');
  const mileInput = document.getElementById('mileInput');
  const saveMilesBtn = document.getElementById('saveMiles');
  const mileNumber = document.getElementById('mileNumber');
  const mileBar = document.getElementById('mileBar');

  // Load saved stream URL
  const savedUrl = localStorage.getItem('streamUrl');
  if (savedUrl) {
    streamUrlInput.value = savedUrl;
    streamFrame.src = savedUrl;
    playerEmpty.style.display = 'none';
    statusText.textContent = 'LIVE';
    statusDot.style.background = 'green';
  }

  // Save stream URL
  saveStreamBtn.addEventListener('click', () => {
    const url = streamUrlInput.value.trim();
    if (url) {
      localStorage.setItem('streamUrl', url);
      streamFrame.src = url;
      playerEmpty.style.display = 'none';
      statusText.textContent = 'LIVE';
      statusDot.style.background = 'green';
    }
  });

  // Clear stream URL
  clearStreamBtn.addEventListener('click', () => {
    localStorage.removeItem('streamUrl');
    streamUrlInput.value = '';
    streamFrame.src = '';
    playerEmpty.style.display = 'block';
    statusText.textContent = 'OFFLINE';
    statusDot.style.background = 'red';
  });

  // Load saved miles
  const savedMiles = localStorage.getItem('miles') || 0;
  mileNumber.textContent = savedMiles;
  mileBar.style.width = `${(savedMiles / 10000) * 100}%`; // Assuming 10,000 mile goal for Phase 1

  // Save miles
  saveMilesBtn.addEventListener('click', () => {
    const miles = parseInt(mileInput.value, 10);
    if (!isNaN(miles) && miles >= 0) {
      localStorage.setItem('miles', miles);
      mileNumber.textContent = miles;
      mileBar.style.width = `${(miles / 10000) * 100}%`;
      mileInput.value = '';
    }
  });
});