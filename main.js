// ====================================================================
// A. FUNGSI UTILITY (COPY, MODAL)
// ====================================================================

// FUNGSI COPY TO CLIPBOARD (Diperbarui dari Block 1 & 3: membersihkan spasi/strip)
function copyToClipboard(textToCopy, buttonId) {
  const tempInput = document.createElement("input");
  // Hapus tanda hubung/koma/spasi untuk rekening, biarkan alamat tetap (jika alamat)
  const cleanedText = buttonId.includes("rek")
    ? textToCopy.replace(/[-\s,]/g, "")
    : textToCopy;
  tempInput.value = cleanedText;
  document.body.appendChild(tempInput);

  // Gunakan document.execCommand untuk kompatibilitas iframe
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);

  const button = document.getElementById(buttonId);
  const originalText = button.innerHTML;

  // Feedback visual
  button.innerHTML = '<i class="fas fa-check mr-1"></i> Tersalin!';
  button.classList.add("text-green-500");

  // Kembalikan teks tombol
  setTimeout(() => {
    button.innerHTML = originalText;
    button.classList.remove("text-green-500");
  }, 2000);
}

// FUNGSI MODAL
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove("hidden");

  setTimeout(() => {
    modal.classList.add("opacity-100");
    modal.querySelector(".modal-content").classList.remove("scale-95");
    modal.querySelector(".modal-content").classList.add("scale-100");
  }, 10);

  document.body.style.overflow = "hidden";
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);

  modal.classList.remove("opacity-100");
  modal.querySelector(".modal-content").classList.add("scale-95");
  modal.querySelector(".modal-content").classList.remove("scale-100");

  setTimeout(() => {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }, 300);
}

// FUNGSI COPY DAN TUTUP MODAL
function copyAndClose(textToCopy, buttonId, modalId) {
  copyToClipboard(textToCopy, buttonId);
  setTimeout(() => {
    closeModal(modalId);
  }, 400);
}

window.openModal = openModal;
window.closeModal = closeModal;
window.copyAndClose = copyAndClose;
window.copyToClipboard = copyToClipboard;

// ====================================================================
// B. FUNGSI NAMA TAMU DARI URL (FITUR BARU)
// ====================================================================

function getGuestNameFromUrl() {
  const params = new URLSearchParams(window.location.search);
  let guestName = params.get("to") || params.get("nama"); // Cek 'to' atau 'nama'

  if (guestName) {
    // Decode URL (misal: "Budi%20Wijaya" menjadi "Budi Wijaya")
    guestName = decodeURIComponent(guestName.replace(/\+/g, " "));

    // Opsional: Buat format kapitalisasi yang lebih rapi
    // Misal: "BUDI WIJAYA" menjadi "Budi Wijaya" (jika diperlukan)
    // guestName = guestName.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');

    return guestName;
  }
  return null;
}

function displayGuestName() {
  const guestName = getGuestNameFromUrl();
  const displayElement = document.getElementById("guest-name-display");

  if (guestName) {
    displayElement.innerText = guestName;
  } else {
    // Jika tidak ada parameter URL, gunakan teks default atau sembunyikan
    displayElement.innerText = "Tamu Undangan";
  }
}

// ====================================================================
// B. FUNGSI KONTROL MUSIK
// ====================================================================

function initializeMusicControl() {
  const music = document.getElementById("background-music");
  const controlButton = document.getElementById("music-control-button");
  const musicIcon = document.getElementById("music-icon");
  let isPlaying = false;

  // Fungsi untuk memperbarui ikon tombol
  function updateIcon(playing) {
    if (playing) {
      musicIcon.classList.remove("fa-volume-mute");
      musicIcon.classList.add("fa-volume-up");
    } else {
      musicIcon.classList.remove("fa-volume-up");
      musicIcon.classList.add("fa-volume-mute");
    }
  }

  // Fungsi untuk memutar musik otomatis setelah interaksi pertama
  function autoPlayAfterInteraction() {
    if (!isPlaying) {
      music.volume = 0.5;
      music
        .play()
        .then(() => {
          isPlaying = true;
          updateIcon(true);
        })
        .catch((error) => {
          // Autoplay diblokir
          console.log("Autoplay diblokir:", error);
          updateIcon(false); // Pastikan status tetap mute
        });
      // Hapus listener agar hanya dipicu sekali
      document.removeEventListener("click", autoPlayAfterInteraction, true);
    }
  }

  // Pasang listener pada seluruh dokumen untuk interaksi pertama
  document.addEventListener("click", autoPlayAfterInteraction, {
    once: true,
    capture: true, // Gunakan capture agar dipicu sebelum event di elemen lain
  });

  // Listener untuk tombol kontrol
  controlButton.addEventListener("click", (e) => {
    e.stopPropagation(); // Stop propagation agar tidak memicu autoPlayAfterInteraction (jika masih aktif)
    if (music.paused) {
      music
        .play()
        .then(() => {
          isPlaying = true;
          updateIcon(true);
        })
        .catch((error) => {
          // Jika gagal (diblokir), beri notifikasi
          alert(
            "Browser memblokir pemutaran otomatis. Silakan cek pengaturan media."
          );
          updateIcon(false);
        });
    } else {
      music.pause();
      isPlaying = false;
      updateIcon(false);
    }
  });

  // Atur status awal ke MUTE
  updateIcon(false);
}

// ====================================================================
// C. FUNGSI SCROLL, NAVIGASI & OBSERVER
// ====================================================================

const mobileWrapper = document.getElementById("mobile-wrapper");

// FUNGSI C.1: Centering Nav Item (dari Block 3)
function centerActiveNavItem(itemId) {
  const navContainer = document.getElementById("nav-container");
  const activeItem = document.getElementById(`nav-${itemId}`);

  if (!activeItem || !navContainer) return;

  const scrollPosition =
    activeItem.offsetLeft -
    navContainer.clientWidth / 2 +
    activeItem.offsetWidth / 2;

  navContainer.scrollTo({
    left: scrollPosition,
    behavior: "smooth",
  });
}

// FUNGSI C.2: Scroll Manual (diperbarui dari Block 2 & 3)
function scrollToSection(event, sectionId) {
  event.preventDefault();
  const targetSection = document.getElementById(sectionId);
  // Memastikan scroll hanya bisa dilakukan setelah undangan dibuka
  if (targetSection && mobileWrapper.style.overflowY === "scroll") {
    mobileWrapper.scrollTo({
      top: targetSection.offsetTop,
      behavior: "smooth",
    });

    // Setelah scroll, langsung set aktif dan center
    updateNavbarActiveState(sectionId);
  }
}
window.scrollToSection = scrollToSection;

// FUNGSI C.3: Logika Button Buka Undangan (dari Block 2)
document.addEventListener("DOMContentLoaded", () => {
  initializeMusicControl(); // Panggil inisialisasi musik

  document.getElementById("open-button").addEventListener("click", function () {
    const targetSection = document.getElementById(
      this.getAttribute("data-target").replace("#", "")
    );
    const openButton = document.getElementById("open-button");
    const bottomNavbar = document.getElementById("bottom-navbar");
    const fullscreenTarget = document.getElementById("fullscreen-container");

    const isMobile = window.innerWidth <= 768;

    // 1. Panggil mode Layar Penuh HANYA jika isMobile true
    if (isMobile) {
      launchFullscreen(fullscreenTarget);
    }

    // 2. Sembunyikan tombol segera
    openButton.classList.add("hidden");

    // 3. Gunakan Timeout untuk transisi
    setTimeout(() => {
      // 4. Aktifkan scrolling dan sesuaikan dimensi/layout
      mobileWrapper.style.overflowY = "scroll";
      mobileWrapper.style.paddingBottom = "70px"; // Sesuaikan dengan tinggi navbar

      // Tampilkan semua section
      document.querySelectorAll(".angkasa_slide").forEach((section) => {
        section.classList.add("scroll-active-section"); // Mengatur opacity: 1
      });

      // 5. Tampilkan Navbar
      bottomNavbar.classList.remove("hidden");
      setTimeout(() => {
        bottomNavbar.classList.remove("translate-y-full");
      }, 50);

      // 6. Scroll ke section target
      if (targetSection) {
        mobileWrapper.scrollTo({
          top: targetSection.offsetTop,
          behavior: "smooth",
        });
      }

      // 7. Set 'cover' sebagai aktif inisial
      updateNavbarActiveState("cover");
    }, 200);
  });
});

// Fungsi pembantu untuk meminta mode layar penuh (Fullscreen API)
function launchFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

// FUNGSI C.4: Update Navbar Active State (diperbarui dari Block 2 & 3)
function updateNavbarActiveState(sectionId) {
  // 1. Hapus kelas aktif dari semua item
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active-nav-style");
  });

  // 2. Tambahkan kelas aktif ke item yang sesuai
  const activeLink = document.getElementById(`nav-${sectionId}`);
  if (activeLink) {
    activeLink.classList.add("active-nav-style");
    // 3. Panggil fungsi pemusatan
    centerActiveNavItem(sectionId);
  }
}

// FUNGSI C.5: Intersection Observer (dari Block 2, menggunakan root: mobileWrapper)
const observerOptions = {
  root: mobileWrapper, // Penting: Menggunakan mobileWrapper sebagai root scroll
  rootMargin: "0px",
  threshold: 0.8, // Section dianggap aktif jika 80% terlihat
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    const section = entry.target;
    const bottomNavbar = document.getElementById("bottom-navbar");

    if (entry.isIntersecting) {
      // TAMPILKAN NAVBAR (Jika sudah dalam mode scroll)
      if (mobileWrapper.style.overflowY === "scroll") {
        // Sudah ditangani oleh tombol 'Buka Undangan', jadi cukup update state
      }

      // Update Active State Navbar
      const sectionId = section.getAttribute("id");
      if (sectionId) {
        updateNavbarActiveState(sectionId);
      }

      // Memicu animasi konten (.animated-content)
      section.querySelectorAll(".animated-content").forEach((el) => {
        el.classList.add("is-visible");
      });

      // Memicu animasi konten (animate.css - walaupun tidak di load, ini adalah logicnya)
      section.querySelectorAll(".animate__animated").forEach((el) => {
        // Logika re-trigger animasi entrance
        const entryAnimation = Array.from(el.classList).find(
          (cls) =>
            cls.startsWith("animate__fadeIn") ||
            cls.startsWith("animate__slideIn")
        );
        if (entryAnimation) {
          el.classList.remove(entryAnimation);
          setTimeout(() => {
            el.classList.add(entryAnimation);
          }, 50);
        }
      });
    } else {
      // SECTION KELUAR: Reset animasi (opsional)
      section.querySelectorAll(".animated-content").forEach((el) => {
        el.classList.remove("is-visible");
      });
    }
  });
}, observerOptions);

// Amati semua section slide setelah DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".angkasa_slide").forEach((section) => {
    observer.observe(section);
  });
});
