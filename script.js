const blogInput = document.getElementById('blogInput');
const saveBtn = document.getElementById('saveBtn');

// 页面加载时检查是否有保存过内容
window.addEventListener('DOMContentLoaded', () => {
  const savedText = localStorage.getItem('blogContent');
  if (savedText) {
    blogInput.value = savedText;
  }
});

// 点击按钮保存并显示
saveBtn.addEventListener('click', () => {
  const content = blogInput.value;
  localStorage.setItem('blogContent', content);
  alert('𓂃𓏲࣪ ִֶָ save it  ˖࣪ 𓆩💀𓆪 ָ࣪ ۰');
});






const audio = new Audio("music/GRRL'S GRRL.mp3"); // 默认音源
audio.loop = true;
// 预创建音频缓冲，便于快速切换
const audioCache = {
  "music/GRRL'S GRRL.mp3": new Audio("music/GRRL'S GRRL.mp3"),
  "music/justforme.mp3": new Audio("music/justforme.mp3"),
  "music/boysalair.mp3": new Audio("music/boysalair.mp3"),
};
Object.values(audioCache).forEach(a => { a.preload = 'auto'; a.loop = true; });


// 固定唯一音源，不再从 getMusicSrc 读取
window.getMusicSrc = null;

let heartsContainer = null;
let heartsTimer = null;

function ensureHeartsContainer() {
  if (!heartsContainer) {
    heartsContainer = document.createElement("div");
    heartsContainer.className = "hearts-container";
    document.body.appendChild(heartsContainer);
  }
}

function spawnHeart() {
  if (!heartsContainer) return;
  const heart = document.createElement("div");
  heart.className = "heart";
  // 随机位置、尺寸、色彩（黑/白）
  const left = Math.random() * 100; // vw 百分比
  const scale = 0.35 + Math.random() * 0.45; // 更小更克制
  const isBlack = Math.random() > 0.5;
  heart.style.left = left + "vw";
  heart.style.setProperty("--heart-scale", scale);
  heart.style.setProperty("--heart-color", isBlack ? "#000" : "#fff");
  heartsContainer.appendChild(heart);
  // 动画结束后移除
  heart.addEventListener("animationend", () => heart.remove());
}

function startHearts() {
  ensureHeartsContainer();
  if (heartsTimer) return;
  // 以较为克制的频率掉落
  heartsTimer = setInterval(spawnHeart, 500);
}

function stopHearts() {
  if (heartsTimer) {
    clearInterval(heartsTimer);
    heartsTimer = null;
  }
}

function playMusic() {
  const p = audio.play();
  if (p && typeof p.catch === 'function') {
    p.catch(() => {});
  }
}

function pauseMusic() {
  audio.pause();
}

function togglePlay() {
  if (audio.paused) {
    playMusic();
  } else {
    pauseMusic();
  }
}

// 回到顶部：平滑滚动
document.addEventListener("DOMContentLoaded", function () {
  const backBtn = document.getElementById("backToTop");
  if (!backBtn) return;
  backBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// 播放列表逻辑
document.addEventListener("DOMContentLoaded", function () {
  const listEl = document.getElementById("playlist");
  const titleEl = document.getElementById("currentTrack");
  const prevBtn = document.querySelector('.wb-prev');
  const nextBtn = document.querySelector('.wb-next');
  const playBtn = document.querySelector('.wb-play');
  const centerBtn = document.querySelector('.wheel-center');
  const progress = document.getElementById('progress');
  if (!listEl || !titleEl) return;

  const items = Array.from(listEl.querySelectorAll('li'));
  let currentIndex = Math.max(0, items.findIndex(li => li.classList.contains('active')));

  function setActive(index, shouldAutoplay = true) {
    if (index < 0 || index >= items.length) return;
    items.forEach(li => li.classList.remove('active'));
    const li = items[index];
    li.classList.add('active');
    currentIndex = index;
    const src = li.getAttribute('data-src');
    if (audio.src.includes(src) === false) {
      audio.src = src;
    }
    titleEl.textContent = src.split('/').pop();
    if (shouldAutoplay) {
      playMusic();
    }
  }

  listEl.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const index = items.indexOf(li);
    if (index !== -1) setActive(index);
  });

  function next() {
    const idx = (currentIndex + 1) % items.length;
    setActive(idx);
  }
  function prev() {
    const idx = (currentIndex - 1 + items.length) % items.length;
    setActive(idx);
  }

  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);
  if (playBtn) playBtn.addEventListener('click', togglePlay);
  if (centerBtn) centerBtn.addEventListener('click', togglePlay);

  // 进度条同步与拖动
  if (progress) {
    function updateProgress() {
      if (!isFinite(audio.duration)) return;
      const percent = (audio.currentTime / audio.duration) * 100;
      progress.value = String(Math.max(0, Math.min(100, percent)));
    }
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('play', updateProgress);

    let wasPlaying = false;
    progress.addEventListener('input', () => {
      if (!isFinite(audio.duration)) return;
      const target = (Number(progress.value) / 100) * audio.duration;
      audio.currentTime = target;
    });
    progress.addEventListener('pointerdown', () => {
      wasPlaying = !audio.paused;
      audio.pause();
    });
    progress.addEventListener('pointerup', () => {
      if (wasPlaying) playMusic();
    });
  }
});

// 根据播放状态控制爱心动画，避免多处调用
audio.addEventListener('play', startHearts);
audio.addEventListener('pause', stopHearts);
audio.addEventListener('ended', stopHearts);