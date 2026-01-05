const CLOUD_NAME = "dr4bnbews";
const UPLOAD_PRESET = "vacante_upload";

/* Login */
const loginBtn = document.getElementById("login-btn");
loginBtn.addEventListener("click", () => {
  const u = document.getElementById("user").value.trim();
  const p = document.getElementById("pass").value.trim();
  if (u === "VACANTE" && p === "VACANTE") {
    document.getElementById("login-overlay").style.display = "none";
    document.getElementById("app").style.display = "block";
    loadAlbums();
  } else {
    document.getElementById("login-error").textContent = "Date incorecte";
  }
});

/* Storage */
let albums = [];
function saveData() {
  localStorage.setItem("albums", JSON.stringify(albums));
}
function loadAlbums() {
  const saved = localStorage.getItem("albums");
  albums = saved ? JSON.parse(saved) : [];
  renderAlbums();
}

/* Albums */
document.getElementById("add-album-btn").addEventListener("click", () => {
  const title = prompt("Nume album:");
  if (!title) return;
  albums.push({ title, media: [] });
  saveData();
  renderAlbums();
});
function renderAlbums() {
  const container = document.getElementById("albums-container");
  container.innerHTML = "";
  albums.forEach((album, i) => {
    const card = document.createElement("div");
    card.className = "album-card";
    card.innerHTML = `<div class="album-title">${album.title}</div><div class="album-count">${album.media.length} fișiere</div>`;
    card.addEventListener("click", () => openAlbum(i));
    container.appendChild(card);
  });
}

/* Gallery */
let currentAlbumIndex = null;
function openAlbum(i) {
  currentAlbumIndex = i;
  document.getElementById("albums-view").classList.remove("active-view");
  document.getElementById("gallery-view").classList.add("active-view");
  document.getElementById("album-title-input").value = albums[i].title;
  renderGallery();
}
document.getElementById("back-to-albums").addEventListener("click", () => {
  document.getElementById("gallery-view").classList.remove("active-view");
  document.getElementById("albums-view").classList.add("active-view");
  saveData();
});
document.getElementById("album-title-input").addEventListener("input", (e) => {
  albums[currentAlbumIndex].title = e.target.value;
  saveData();
});
function renderGallery() {
  const album = albums[currentAlbumIndex];
  const grid = document.getElementById("gallery");
  grid.innerHTML = "";
  document.getElementById("album-photos-count").textContent = `${album.media.length} fișiere`;
  album.media.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "media-item";
    div.innerHTML = item.type === "image" ? `<img src="${item.url}" alt="">` : `<video src="${item.url}" controls></video>`;
    div.addEventListener("click", () => openLightbox(i));
    grid.appendChild(div);
  });
}

/* Upload to Cloudinary */
document.getElementById("file-input").addEventListener("change", async (e) => {
  const files = e.target.files;
  for (let file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    albums[currentAlbumIndex].media.push({
      url: data.secure_url,
      type: file.type.startsWith("image") ? "image" : "video"
    });
    saveData();
    renderGallery();
  }
});

/* Lightbox */
let currentMediaIndex = 0;
function openLightbox(i) {
  currentMediaIndex = i;
  const item = albums[currentAlbumIndex].media[i];
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  const vid = document.getElementById("lightbox-video");
  img.style.display = "none";
  vid.style.display = "none";
  if (item.type === "image") {
    img.src