// Elements
const songList = document.getElementById("songList");
const audio = document.getElementById("audio");
const cover = document.getElementById("cover");
const title = document.getElementById("title");
const artist = document.getElementById("artist");

const playBtn = document.getElementById("play");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");
const shuffleBtn = document.getElementById("shuffleMode");
const repeatBtn = document.getElementById("repeatMode");
const bannerDisk = document.getElementById("bannerImg");

const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");

const searchInput = document.getElementById("search");
const clearSearchBtn = document.getElementById("clearSearch");
const favCountBadge = document.getElementById("favCount");
const trackCount = document.getElementById("trackCount");
const currentSectionTitle = document.getElementById("currentSectionTitle");

const favBtn = document.getElementById("favBtn");
const eqBars = document.getElementById("eqBars");
const volumeInput = document.getElementById("volume");
const volIcon = document.getElementById("volIcon");

// State
let currentSongIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let activeGenre = "all";
let favorites = JSON.parse(localStorage.getItem("shez_favs") || "[]");

// Update favorite count
function updateFavCount() {
  if (favCountBadge) favCountBadge.innerText = favorites.length;
}
updateFavCount();

// Render Songs
function renderSongs(songsToRender) {
  songList.innerHTML = "";
  trackCount.innerText = `${songsToRender.length} Tracks`;

  if (songsToRender.length === 0) {
    songList.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; color: #64748b;">
        <i class="fa-solid fa-music" style="font-size: 2.5rem; margin-bottom: 12px; display: block;"></i>
        <h3>No songs found</h3>
        <p style="font-size: 0.85rem; margin-top: 5px;">Try a different keyword or genre.</p>
      </div>
    `;
    return;
  }

  songsToRender.forEach((song, originalIdx) => {
    // Find the real index in global songs array
    const realIndex = songs.findIndex(s => s.id === song.id);
    const isFav = favorites.includes(song.id);
    const isCurrentPlaying = (currentSongIndex === realIndex && isPlaying);

    const card = document.createElement("div");
    card.className = `song-card ${isCurrentPlaying ? "playing" : ""}`;
    card.onclick = () => playSong(realIndex);

    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${song.cover}" alt="${song.title}">
        <span class="card-badge">${song.category || 'Pop'}</span>
        <div class="card-play-overlay">
          <i class="fa-solid ${isCurrentPlaying ? 'fa-pause' : 'fa-play'}"></i>
        </div>
      </div>
      <div class="card-info">
        <h3>${song.title}</h3>
        <p>${song.artist}</p>
      </div>
      <div class="card-footer">
        <span><i class="fa-regular fa-clock"></i> ${song.duration || '3:45'}</span>
        <button class="fav-card-btn ${isFav ? 'favorited' : ''}" onclick="toggleFav(event, ${song.id})">
          <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
        </button>
      </div>
    `;
    songList.appendChild(card);
  });
}

// Initial render
renderSongs(songs);

// Play Song Function
function playSong(index) {
  if (index < 0 || index >= songs.length) return;
  currentSongIndex = index;
  const song = songs[currentSongIndex];

  audio.src = song.file;
  cover.src = song.cover;
  bannerDisk.src = song.cover;
  title.innerText = song.title;
  artist.innerText = song.artist;

  audio.play().then(() => {
    isPlaying = true;
    updatePlayStateUI();
  }).catch(err => {
    console.warn("Autoplay blocked or stream error:", err);
  });

  updateFavButtonUI();
  renderCurrentList();
}

// Play / Pause Toggle
function togglePlay() {
  if (!audio.src || audio.src === window.location.href) {
    playSong(0);
    return;
  }

  if (isPlaying) {
    audio.pause();
    isPlaying = false;
  } else {
    audio.play();
    isPlaying = true;
  }
  updatePlayStateUI();
  renderCurrentList();
}

function updatePlayStateUI() {
  playBtn.innerHTML = isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
  if (isPlaying) {
    eqBars.classList.add("active");
  } else {
    eqBars.classList.remove("active");
  }
}

// Previous & Next Track
function nextSong() {
  if (isShuffle) {
    currentSongIndex = Math.floor(Math.random() * songs.length);
  } else {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
  }
  playSong(currentSongIndex);
}

function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  playSong(currentSongIndex);
}

// Audio Progress & Seek
audio.addEventListener("timeupdate", () => {
  if (audio.duration) {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progress.value = progressPercent;
    currentTimeEl.innerText = formatTime(audio.currentTime);
    durationEl.innerText = formatTime(audio.duration);
  }
});

progress.addEventListener("input", (e) => {
  if (audio.duration) {
    const seekTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = seekTime;
  }
});

audio.addEventListener("ended", () => {
  if (isRepeat) {
    audio.currentTime = 0;
    audio.play();
  } else {
    nextSong();
  }
});

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Volume handling
volumeInput.addEventListener("input", (e) => {
  audio.volume = e.target.value / 100;
  if (audio.volume === 0) {
    volIcon.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
  } else if (audio.volume < 0.5) {
    volIcon.innerHTML = '<i class="fa-solid fa-volume-low"></i>';
  } else {
    volIcon.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
  }
});

volIcon.onclick = () => {
  if (audio.volume > 0) {
    audio.volume = 0;
    volumeInput.value = 0;
    volIcon.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
  } else {
    audio.volume = 0.8;
    volumeInput.value = 80;
    volIcon.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
  }
};

// Favorites System
function toggleFav(e, songId) {
  e.stopPropagation();
  if (favorites.includes(songId)) {
    favorites = favorites.filter(id => id !== songId);
  } else {
    favorites.push(songId);
  }
  localStorage.setItem("shez_favs", JSON.stringify(favorites));
  updateFavCount();
  updateFavButtonUI();
  renderCurrentList();
}

favBtn.onclick = () => {
  const currentSong = songs[currentSongIndex];
  if (currentSong) {
    toggleFav(new Event('click'), currentSong.id);
  }
};

function updateFavButtonUI() {
  const currentSong = songs[currentSongIndex];
  if (currentSong && favorites.includes(currentSong.id)) {
    favBtn.classList.add("favorited");
    favBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
  } else {
    favBtn.classList.remove("favorited");
    favBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
  }
}

// Filter Navigation (Sidebar & Topbar Chips)
function renderCurrentList() {
  let list = songs;
  const query = searchInput.value.toLowerCase().trim();

  if (activeGenre === "favorites") {
    list = songs.filter(s => favorites.includes(s.id));
    currentSectionTitle.innerText = "Favorite Tracks ❤️";
  } else if (activeGenre !== "all" && activeGenre !== "playlist") {
    list = songs.filter(s => s.category?.toLowerCase() === activeGenre.toLowerCase());
    currentSectionTitle.innerText = `${activeGenre} Tracks`;
  } else {
    currentSectionTitle.innerText = "Trending Tracks";
  }

  if (query) {
    list = list.filter(s =>
      s.title.toLowerCase().includes(query) ||
      s.artist.toLowerCase().includes(query) ||
      s.category?.toLowerCase().includes(query)
    );
  }

  renderSongs(list);
}

// Genre Click Handlers
document.querySelectorAll(".nav-menu li").forEach(item => {
  item.onclick = () => {
    document.querySelectorAll(".nav-menu li").forEach(l => l.classList.remove("active"));
    item.classList.add("active");
    activeGenre = item.dataset.filter;
    renderCurrentList();
  };
});

document.querySelectorAll(".chip").forEach(chip => {
  chip.onclick = () => {
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    activeGenre = chip.dataset.genre;
    renderCurrentList();
  };
});

// Search input
searchInput.addEventListener("input", () => {
  clearSearchBtn.style.display = searchInput.value ? "block" : "none";
  renderCurrentList();
});

clearSearchBtn.onclick = () => {
  searchInput.value = "";
  clearSearchBtn.style.display = "none";
  renderCurrentList();
};

// Tool toggles (Shuffle / Repeat)
shuffleBtn.onclick = () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
};

repeatBtn.onclick = () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("active", isRepeat);
};

// Banner quick actions
document.getElementById("playAllBtn").onclick = () => playSong(0);
document.getElementById("shuffleBtn").onclick = () => {
  isShuffle = true;
  shuffleBtn.classList.add("active");
  nextSong();
};

// Event Listeners for Player Controls
playBtn.onclick = togglePlay;
nextBtn.onclick = nextSong;
prevBtn.onclick = prevSong;
