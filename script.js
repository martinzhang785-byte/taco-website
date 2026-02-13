// --- Tab Navigation ---
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(target).classList.add('active');
  });
});

// --- Gallery System (supports multiple galleries) ---
const GALLERY_KEYS = {
  home: 'taco-photos',
  puppy: 'taco-puppy-photos',
  grownup: 'taco-grownup-photos'
};

const galleryData = {};
let currentGallery = null;
let currentIndex = 0;

// Lightbox elements
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

function getPhotos(galleryName) {
  if (!galleryData[galleryName]) {
    const saved = localStorage.getItem(GALLERY_KEYS[galleryName]);
    galleryData[galleryName] = saved ? JSON.parse(saved) : [];
  }
  return galleryData[galleryName];
}

function savePhotos(galleryName) {
  localStorage.setItem(GALLERY_KEYS[galleryName], JSON.stringify(galleryData[galleryName]));
}

function addPhotoToGrid(src, galleryName) {
  const grid = document.querySelector(`.photo-grid[data-gallery="${galleryName}"]`);
  const photos = getPhotos(galleryName);

  const item = document.createElement('div');
  item.className = 'photo-item';

  const img = document.createElement('img');
  img.src = src;
  img.alt = 'Taco';
  img.loading = 'lazy';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '\u00d7';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const index = photos.indexOf(src);
    if (index > -1) {
      photos.splice(index, 1);
      savePhotos(galleryName);
    }
    item.remove();
  });

  item.addEventListener('click', () => {
    currentGallery = galleryName;
    currentIndex = getPhotos(galleryName).indexOf(src);
    openLightbox(src);
  });

  item.appendChild(img);
  item.appendChild(deleteBtn);
  grid.appendChild(item);
}

function handleFiles(files, galleryName) {
  const photos = getPhotos(galleryName);
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      photos.push(src);
      addPhotoToGrid(src, galleryName);
      savePhotos(galleryName);
    };
    reader.readAsDataURL(file);
  });
}

// Set up upload areas for all galleries
document.querySelectorAll('.upload-area[data-gallery]').forEach(area => {
  const galleryName = area.dataset.gallery;
  const fileInput = area.querySelector('.file-input');

  area.addEventListener('click', () => fileInput.click());

  area.addEventListener('dragover', (e) => {
    e.preventDefault();
    area.classList.add('dragover');
  });

  area.addEventListener('dragleave', () => {
    area.classList.remove('dragover');
  });

  area.addEventListener('drop', (e) => {
    e.preventDefault();
    area.classList.remove('dragover');
    handleFiles(e.dataTransfer.files, galleryName);
  });

  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files, galleryName);
    fileInput.value = '';
  });
});

// --- Profile Photo ---
const profilePhoto = document.getElementById('profilePhoto');

profilePhoto.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target.result;
      setProfileImage(src);
      localStorage.setItem('taco-profile', src);
    };
    reader.readAsDataURL(file);
  });
  input.click();
});

function setProfileImage(src) {
  profilePhoto.innerHTML = '';
  const img = document.createElement('img');
  img.src = src;
  img.alt = 'Taco';
  profilePhoto.appendChild(img);
}

// Save profile info on edit
document.querySelectorAll('.editable').forEach(el => {
  el.addEventListener('blur', () => {
    const editables = document.querySelectorAll('.editable');
    const data = Array.from(editables).map(e => e.textContent);
    localStorage.setItem('taco-profile-info', JSON.stringify(data));
  });
});

// --- Lightbox ---
function openLightbox(src) {
  lightboxImg.src = src;
  lightbox.classList.add('active');
}

lightboxClose.addEventListener('click', () => {
  lightbox.classList.remove('active');
});

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) lightbox.classList.remove('active');
});

lightboxPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!currentGallery) return;
  const photos = getPhotos(currentGallery);
  if (photos.length === 0) return;
  currentIndex = (currentIndex - 1 + photos.length) % photos.length;
  lightboxImg.src = photos[currentIndex];
});

lightboxNext.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!currentGallery) return;
  const photos = getPhotos(currentGallery);
  if (photos.length === 0) return;
  currentIndex = (currentIndex + 1) % photos.length;
  lightboxImg.src = photos[currentIndex];
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') lightbox.classList.remove('active');
  if (e.key === 'ArrowLeft') lightboxPrev.click();
  if (e.key === 'ArrowRight') lightboxNext.click();
});

// --- Stories ---
const storyTitleInput = document.getElementById('storyTitle');
const storyBodyInput = document.getElementById('storyBody');
const addStoryBtn = document.getElementById('addStoryBtn');
const storyList = document.getElementById('storyList');

function getStories() {
  const saved = localStorage.getItem('taco-stories');
  return saved ? JSON.parse(saved) : [];
}

function saveStories(stories) {
  localStorage.setItem('taco-stories', JSON.stringify(stories));
}

function renderStory(story, index) {
  const card = document.createElement('div');
  card.className = 'story-card';

  const title = document.createElement('h3');
  title.textContent = story.title;

  const date = document.createElement('div');
  date.className = 'story-date';
  date.textContent = story.date;

  const text = document.createElement('div');
  text.className = 'story-text';
  text.textContent = story.body;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '\u00d7';
  deleteBtn.addEventListener('click', () => {
    const stories = getStories();
    stories.splice(index, 1);
    saveStories(stories);
    loadStories();
  });

  card.appendChild(title);
  card.appendChild(date);
  card.appendChild(text);
  card.appendChild(deleteBtn);
  storyList.appendChild(card);
}

function loadStories() {
  storyList.innerHTML = '';
  const stories = getStories();
  stories.forEach((story, i) => renderStory(story, i));
}

addStoryBtn.addEventListener('click', () => {
  const title = storyTitleInput.value.trim();
  const body = storyBodyInput.value.trim();
  if (!title && !body) return;

  const stories = getStories();
  stories.unshift({
    title: title || 'Untitled',
    body: body,
    date: new Date().toLocaleDateString('zh-CN', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  });
  saveStories(stories);
  storyTitleInput.value = '';
  storyBodyInput.value = '';
  loadStories();
});

// --- Load All Data ---
function loadData() {
  // Load all galleries
  for (const galleryName of Object.keys(GALLERY_KEYS)) {
    const photos = getPhotos(galleryName);
    photos.forEach(src => addPhotoToGrid(src, galleryName));
  }

  // Load profile photo
  const profileSrc = localStorage.getItem('taco-profile');
  if (profileSrc) {
    setProfileImage(profileSrc);
  }

  // Load editable fields
  const profileData = localStorage.getItem('taco-profile-info');
  if (profileData) {
    const data = JSON.parse(profileData);
    const editables = document.querySelectorAll('.editable');
    editables.forEach((el, i) => {
      if (data[i]) el.textContent = data[i];
    });
  }

  // Load stories
  loadStories();
}

loadData();
