const audioPlayer = document.getElementById("audioPlayer");
const seekBar = document.querySelector(".seekBar");
const circle = document.querySelector(".circle");
const currentTimeDisplay = document.querySelector(".currentTime");
const totalTimeDisplay = document.querySelector(".totalTime");
const playButton = document.querySelector(".playButton");
const prevButton = document.querySelector(".previousButton");
const nextButton = document.querySelector(".nextButton");
const songsContainer = document.querySelector(".songs-grid");

let isPlaying = false;
let currentSongIndex = 0;
let songsList = [];


document.querySelector(".home").addEventListener("click", () => {
    alert("The developer is still working on this feature. Please check back later.");
});

document.querySelector(".search").addEventListener("click", () => {
    alert("The developer is still working on this feature. Please check back later.");
});

document.querySelector(".cardContainer").addEventListener("click", () => {
    alert("The developer is still working on this feature. Please check back later.");
});

// Helper Functions
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function updateActiveSong(index) {
  document.querySelectorAll(".song-item").forEach((item, i) => {
      item.classList.toggle("active", i === index);
    });
}

async function changeBarSongCard() {
    try {
        const songInfo = document.querySelector(".songInfo");
        if (!songInfo) {
            console.error("Song info element not found");
            return;
        }

        const songs = await getSongs();
        if (!songs || !songs[currentSongIndex]) {
            console.error("No songs found or invalid index");
            return;
        }

        console.log("Loading song:", songs[currentSongIndex]);
        
        const songFile = await fetch(`songs/${songs[currentSongIndex]}`)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
                return r.blob();
            });

        const songCard = await createSongBarCard(songFile);
        if (songCard) {
            songInfo.innerHTML = songCard;
            console.log("Song card updated successfully");
        } else {
            console.error("Failed to create song card");
        }
    } catch (error) {
        console.error("Error in changeBarSongCard:", error);
    }
}


async function playSelectedSong(index) {
  try {
    const songs = await getSongs();
    if (index >= 0 && index < songs.length) {
        currentSongIndex = index;
        const songFileName = songs[index];

      const response = await fetch(`/songs/${songFileName}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      audioPlayer.src = url;
      audioPlayer.play();
      isPlaying = true;
      playButton.src = "pause.svg";
      updateActiveSong(index);
      console.log("Changing bar song card for index:", index);
        await changeBarSongCard();
        console.log("Bar song card change complete");
    }
  } catch (error) {
    console.error("Error playing song:", error);
  }
}

async function getSongs() {
  try {
    const response = await fetch("/songs/");
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    const links = doc.getElementsByTagName("a");

    return Array.from(links)
      .filter((link) => link.href.endsWith(".flac"))
      .map((link) => decodeURIComponent(link.href.split("/songs/").pop()));
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
}

async function createSongBarCard(file) {
    return new Promise((resolve) => {
        jsmediatags.read(file, {
            onSuccess: function(tag) {
                try {
                    // Default values
                    let imageUrl = "default-cover.jpg";
                    let title = "Unknown Title";
                    let artist = "Unknown Artist";

                    // Get image if available
                    if (tag.tags.picture) {
                        const { data, format } = tag.tags.picture;
                        let base64String = "";
                        for (let i = 0; i < data.length; i++) {
                            base64String += String.fromCharCode(data[i]);
                        }
                        imageUrl = `data:${format};base64,${window.btoa(base64String)}`;
                    }

                    // Get title and artist if available
                    if (tag.tags.title) title = tag.tags.title;
                    if (tag.tags.artist) artist = tag.tags.artist.replaceAll(";", "•");

                    // Create song card HTML
                    const songCard = `
                        <img src="${imageUrl}" class="cover" alt="${title}"/>
                        <div>
                            <p>${title}</p>
                        </div>
                    `;

                    resolve(songCard);
                } catch (error) {
                    console.error("Error creating song bar card:", error);
                    // Fallback card if error occurs
                    const fallbackCard = `
                        <img src="default-cover.jpg" class="cover" alt="Unable to load"/>
                        <div>
                            <p>Unable to load song info</p>
                        </div>
                    `;
                    resolve(fallbackCard);
                }
            },
            onError: function(error) {
                console.error("Error reading media tags:", error);
                const errorCard = `
                    <img src="default-cover.jpg" class="cover" alt="Error"/>
                    <div>
                        <p>Error loading song</p>
                    </div>
                `;
                resolve(errorCard);
            }
        });
    });
}
async function createSongCard(file) {
  return new Promise((resolve) => {
    jsmediatags.read(file, {
      onSuccess: function (tag) {
        const picture = tag.tags.picture;
        let imageUrl = "";

        if (picture) {
          const { data, format } = picture;
          let base64String = "";
          for (let i = 0; i < data.length; i++) {
            base64String += String.fromCharCode(data[i]);
          }
          imageUrl = `data:${format};base64,${window.btoa(base64String)}`;
        }
        let artist = tag.tags.artist.replaceAll(";", "•");
        const songCard = `
                    <li class="flex song-item">
                        <img src="${
                          imageUrl || "default-cover.jpg"
                        }" class="cover" alt="cover"/>
                        <div>
                            <img src="playButton.svg" class="svg" alt="">
                        </div>
                        <div>
                            <p>${tag.tags.title || "Unknown Title"}</p>
                            <span>${artist || "Unknown Artist"}</span>
                        </div>
                    </li>
                `;
        resolve(songCard);
      },
      onError: function (error) {
        console.log(error);
        resolve(""); // Return empty string if error
      },
    });
  });
}

// Add this function to handle play/pause toggling
function togglePlayPause() {
  const audioPlayer = document.getElementById("audioPlayer");
  if (isPlaying) {
    audioPlayer.pause();
    playButton.src = "playButton.svg";
  } else {
    audioPlayer.play();
    playButton.src = "pause.svg"; // You'll need to add this SVG file
  }
  isPlaying = !isPlaying;
}

// Add this event listener after your existing code
playButton.addEventListener("click", togglePlayPause);

// Function to load songs
async function loadSongs() {
  const songs = await getSongs(); // Your existing getSongs function
  const songsContainer = document.querySelector(".songs-grid");
//   console.log(songs);

  for (const song of songs) {
    const songFile = await fetch(`/songs/${song}`).then((r) => r.blob());
    const songCard = await createSongCard(songFile);
    if (songCard) {
      songsContainer.innerHTML += songCard;
    }
  }

}
// Simplified song click handler
songsContainer.addEventListener('click', async (event) => {
    const songItem = event.target.closest('.song-item');
    if (songItem) {
      const songs = Array.from(songsContainer.querySelectorAll('.song-item'));
      const clickedSongIndex = songs.indexOf(songItem);
      await playSelectedSong(clickedSongIndex);
    }
  });
  
  // Navigation buttons
  prevButton.addEventListener('click', () => {
    playSelectedSong(currentSongIndex - 1);
  });
  
  nextButton.addEventListener('click', () => {
    playSelectedSong(currentSongIndex + 1);
  });
  
  // Auto-play next song
  audioPlayer.addEventListener('ended', () => {
    playSelectedSong(currentSongIndex + 1);
  });
  

// Auto-play next song when current song ends
audioPlayer.addEventListener("ended", () => {
  playSelectedSong(currentSongIndex + 1);
});

// Update seekbar logic
audioPlayer.addEventListener("timeupdate", () => {
  const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  seekBar.style.setProperty("--seek-before-width", `${progress}%`);
  circle.style.left = `${progress}%`;
  currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
});
audioPlayer.addEventListener("timeupdate", () => {
    totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
    console.log(totalTimeDisplay.textContent);
});

// Update click handler
seekBar.addEventListener("click", (e) => {
  const rect = seekBar.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  audioPlayer.currentTime = pos * audioPlayer.duration;
});

// Update drag handler
let isDragging = false;

seekBar.addEventListener("click", () => {
  isDragging = true;
});

document.addEventListener("drag", (e) => {
  if (isDragging) {
    const rect = seekBar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioPlayer.currentTime = pos * audioPlayer.duration;
  }
});

// Add these event listeners to handle automatic state updates
audioPlayer.addEventListener("play", () => {
  isPlaying = true;
  playButton.src = "pause.svg";
});

audioPlayer.addEventListener("pause", () => {
  isPlaying = false;
  playButton.src = "playButton.svg";
});

audioPlayer.addEventListener("ended", () => {
  isPlaying = false;
  playButton.src = "playButton.svg";
});

// Update hamburger menu functionality
const hamburgerMenu = document.querySelector('.hamburger-menu');
const sidebar = document.querySelector('.left');
const backdrop = document.querySelector('.backdrop');

hamburgerMenu.addEventListener('click', (e) => {
  e.stopPropagation();
  sidebar.classList.toggle('show');
  document.body.classList.toggle('sidebar-open');
  backdrop.classList.toggle('show');
});

// Close sidebar when clicking backdrop
backdrop.addEventListener('click', () => {
  sidebar.classList.remove('show');
  document.body.classList.remove('sidebar-open');
  backdrop.classList.remove('show');
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
  if (!sidebar.contains(e.target) && !hamburgerMenu.contains(e.target)) {
    sidebar.classList.remove('show');
    document.body.classList.remove('sidebar-open');
    backdrop.classList.remove('show');
  }
});

// Initialize
(async () => {
  // const songs = await getSongs();
  // console.log("Found songs:", songs);
  loadSongs();
})();
