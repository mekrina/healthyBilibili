document.getElementById('saveSettings').addEventListener('click', () => {
  const maxVideos = parseInt(document.getElementById('maxVideos').value, 10);
  chrome.storage.local.set({ maxVideos: maxVideos });
  alert('Settings saved!');
});
