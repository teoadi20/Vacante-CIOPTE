/* ------------------------------
   LOGIN
------------------------------ */
const loginOverlay = document.getElementById("login-overlay");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");

const VALID_USER = "VACANTE";
const VALID_PASS = "VACANTE";

loginBtn.addEventListener("click", () => {
  const u = document.getElementById("user").value.trim();
  const p = document.getElementById("pass").value.trim();

  if (u === VALID_USER && p === VALID_PASS) {
    loginOverlay.style.display = "none";
    document.getElementById("app").style.display = "block";
    loadAlbums();
  } else {
    loginError.textContent = "Date incorecte";
  }
});

/* ------------------------------
   STORAGE
------------------------------ */
let albums = [];

function saveData() {
  localStorage.setItem("albums", JSON.stringify(albums));
}

function loadAlbums() {
  const saved = localStorage.getItem("albums");
  albums = saved ? JSON.parse(saved) : [];
  renderAlbums();
}

/* ------------------------------
   ALBUMS
------------------------------ */
const albumsContainer = document.getElementById("albums-container");
const addAlbumBtn = document.getElementById("add-album-btn");

addAlbumBtn.addEventListener("click", () => {
  const title = prompt("Nume album:");
  if (!title) return;
  albums.push({ title, media: [] });
  saveData();
  renderAlbums();
});

function renderAlbums() {
  albumsContainer.innerHTML = "";
  albums.forEach((album, index) => {
    const card = document.createElement("div");
    card.className = "album-card";
    card.innerHTML = `
      <div class="album-title">${album.title}</div>
      <div class="album-count">${album.media.length} fișiere</div>
    `;
    card.addEventListener("click", () => openAlbum(index));
    albumsContainer.appendChild(card);
  });
}

/* ------------------------------
   GALLERY
------------------------------ */
const albumsView = document.getElementById("albums-view");
const galleryView = document.getElementById("gallery-view");
const galleryGrid = document.getElementById("gallery");
const albumTitleInput = document.getElementById("album-title-input");
const albumPhotosCount = document.getElementById("album-photos-count");

let currentAlbumIndex = null;

function openAlbum(index) {
  currentAlbumIndex = index;
  albumsView.classList.remove("active-view");
  galleryView.classList.add("active-view");
  albumTitleInput.value = albums[index].title;
  renderGallery();
}

document.getElementById("back-to-albums").addEventListener("click", () => {
  galleryView.classList.remove("active-view");
  albumsView.classList.add("active-view");
  saveData();
});

albumTitleInput.addEventListener("input", () => {
  albums[currentAlbumIndex].title = albumTitleInput.value;
  saveData();
});

function renderGallery() {
  const album = albums[currentAlbumIndex];
  galleryGrid.innerHTML = "";
  albumPhotosCount.textContent = `${album.media.length} fișiere`;

  album.media.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "media-item";
    if (item.type === "image") {
      div.innerHTML = `<img src="${item.url}" alt="">`;
    } else {
      div.innerHTML = `<video src="${item.url}" controls></video>`;
    }
    div.addEventListener("click", () => openLightbox(i));
    galleryGrid.appendChild(div);
  });
}

/* ------------------------------
   CLOUDINARY UPLOAD
------------------------------ */
const fileInput = document.getElementById("file-input");

const CLOUD_NAME = "dr4bnbews";      // cloud name-ul tău
const UPLOAD_PRESET = "vacante_upload";  // presetul unsigned creat

fileInput.addEventListener("change", async (event) => {
  const files = event.target.files;
  for (let file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();

    const album = albums[currentAlbumIndex];
    album.media.push({
      url: data.secure_url,
      type: file.type.startsWith("image") ? "image" : "video"
    });

    saveData();
    renderGallery();
  }
});

/* ------------------------------
   LIGHTBOX
------------------------------ */
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lightbox-img");
const lbVideo = document.getElementById("lightbox-video");

let currentMediaIndex = 0;

function openLightbox(i) {
  currentMediaIndex = i;
  showMedia();
  lightbox.classList.remove("hidden");
}

function showMedia() {
  const item = albums[currentAlbumIndex].media[currentMediaIndex];
  lbImg.style.display = "none";
  lbVideo.style.display = "none";

  if (item.type === "image") {
    lbImg.src = item.url;
    lbImg.style.display = "block";
  } else {
    lbVideo.src = item.url;
    lbVideo.style.display = "block";
  }
}

document.getElementById("lightbox-close
