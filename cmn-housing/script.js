/**
 * HousingDirect / CMN Housing - Interactive Image Slider & Preview Modal
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. Image Data Definition (5 High-Res Property Photos)
     ========================================================================== */
  const photoList = [
    {
      src: 'images/property.jpg',
      thumb: 'images/property.jpg',
      caption: 'Spacious Living Room & Hall'
    },
    {
      src: 'images/living_room.jpg',
      thumb: 'images/living_room.jpg',
      caption: 'Modern Lounge & Entertainment Unit'
    },
    {
      src: 'images/master_bedroom.jpg',
      thumb: 'images/master_bedroom.jpg',
      caption: 'Master Bedroom Suite'
    },
    {
      src: 'images/building_exterior.jpg',
      thumb: 'images/building_exterior.jpg',
      caption: 'Building Facade & Gated Entrance'
    },
    {
      src: 'images/balcony_view.jpg',
      thumb: 'images/balcony_view.jpg',
      caption: 'Private Balcony Sunset View'
    }
  ];

  const totalPhotos = photoList.length;
  let currentIndex = 0;
  let heroAutoPlayTimer = null;
  let modalSlideshowTimer = null;
  let isModalSlideshowPlaying = false;
  let isZoomed = false;

  /* ==========================================================================
     2. DOM Elements Selection
     ========================================================================== */
  // Hero Slider Elements
  const heroSliderCard = document.getElementById('propertyImageSlider');
  const heroSlides = document.querySelectorAll('.slider-slide');
  const heroDots = document.querySelectorAll('.slider-dot');
  const heroThumbs = document.querySelectorAll('#sliderThumbnails .thumb-item');
  const heroPrevBtn = document.getElementById('sliderPrevBtn');
  const heroNextBtn = document.getElementById('sliderNextBtn');
  const heroPhotoCount = document.getElementById('sliderPhotoCount');
  const heroFullscreenBtn = document.getElementById('btnFullscreen');

  // CMN Modal Preview Elements
  const cmnModal = document.getElementById('cmnGalleryModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCloseBtn = document.getElementById('cmnModalCloseBtn');
  const modalCounter = document.getElementById('cmnModalCounter');
  const modalStageMediaWrapper = document.getElementById('cmnStageMediaWrapper');
  const modalArrowPrev = document.getElementById('cmnModalArrowPrev');
  const modalArrowNext = document.getElementById('cmnModalArrowNext');
  const modalThumbsCards = document.querySelectorAll('.cmn-thumb-card');
  const modalBottomBar = document.getElementById('cmnModalBottomBar');
  
  // Modal Toolbar Buttons
  const modalBtnZoom = document.getElementById('modalBtnZoom');
  const modalBtnPlay = document.getElementById('modalBtnPlay');
  const modalBtnFullscreenWindow = document.getElementById('modalBtnFullscreenWindow');
  const modalBtnToggleThumbs = document.getElementById('modalBtnToggleThumbs');

  /* ==========================================================================
     3. Hero Slider Update Logic
     ========================================================================== */
  function updateHeroSlider(index) {
    if (index < 0) index = totalPhotos - 1;
    if (index >= totalPhotos) index = 0;
    currentIndex = index;

    // Update Hero Slides
    heroSlides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update Hero Dots
    heroDots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Update Hero Thumbnails
    heroThumbs.forEach((thumb, idx) => {
      if (idx === currentIndex) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });

    // Update Counter Badge
    if (heroPhotoCount) {
      heroPhotoCount.textContent = `${currentIndex + 1} / ${totalPhotos} Photos`;
    }
  }

  function nextHeroSlide() {
    updateHeroSlider(currentIndex + 1);
  }

  function prevHeroSlide() {
    updateHeroSlider(currentIndex - 1);
  }

  function startHeroAutoPlay() {
    stopHeroAutoPlay();
    heroAutoPlayTimer = setInterval(nextHeroSlide, 4500);
  }

  function stopHeroAutoPlay() {
    if (heroAutoPlayTimer) {
      clearInterval(heroAutoPlayTimer);
      heroAutoPlayTimer = null;
    }
  }

  // Hero Nav Button Listeners
  if (heroPrevBtn) {
    heroPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevHeroSlide();
      startHeroAutoPlay();
    });
  }

  if (heroNextBtn) {
    heroNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextHeroSlide();
      startHeroAutoPlay();
    });
  }

  // Hero Dots Click
  heroDots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(dot.getAttribute('data-index'), 10);
      updateHeroSlider(idx);
      startHeroAutoPlay();
    });
  });

  // Hero Thumbnails Click
  heroThumbs.forEach((thumb) => {
    thumb.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(thumb.getAttribute('data-index'), 10);
      updateHeroSlider(idx);
      openModal(idx);
    });
  });

  // Hero Card Click to Open Preview Modal
  if (heroSliderCard) {
    heroSliderCard.addEventListener('mouseenter', stopHeroAutoPlay);
    heroSliderCard.addEventListener('mouseleave', startHeroAutoPlay);
    heroSliderCard.addEventListener('click', () => {
      openModal(currentIndex);
    });
  }

  if (heroFullscreenBtn) {
    heroFullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(currentIndex);
    });
  }

  startHeroAutoPlay();

  /* ==========================================================================
     4. CMN Preview Modal Popup & Image Slider (Exact match to screenshot)
     ========================================================================== */
  function renderModalImage(index) {
    const item = photoList[index];
    if (!item || !modalStageMediaWrapper) return;

    // Reset zoom state
    isZoomed = false;
    modalStageMediaWrapper.innerHTML = '';

    const imgEl = document.createElement('img');
    imgEl.src = item.src;
    imgEl.alt = item.caption;
    imgEl.className = 'cmn-stage-img';
    imgEl.id = 'cmnStageImg';
    imgEl.addEventListener('click', toggleZoom);
    modalStageMediaWrapper.appendChild(imgEl);

    // Update Counter (e.g. 1 / 5, 2 / 5)
    if (modalCounter) {
      modalCounter.textContent = `${index + 1} / ${totalPhotos}`;
    }

    // Update Modal Thumbnails active state
    modalThumbsCards.forEach((thumb, idx) => {
      if (idx === index) {
        thumb.classList.add('active');
        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        thumb.classList.remove('active');
      }
    });

    // Update URL hash without jumping
    try {
      history.replaceState(null, null, `#gallery-${index + 1}`);
    } catch (e) {}

    // Sync hero slider index
    updateHeroSlider(index);
  }

  function openModal(index) {
    stopHeroAutoPlay();
    if (typeof index === 'number') {
      currentIndex = index;
    }
    renderModalImage(currentIndex);
    if (cmnModal) {
      cmnModal.classList.add('open');
      cmnModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (modalSlideshowTimer) {
      clearInterval(modalSlideshowTimer);
      modalSlideshowTimer = null;
      isModalSlideshowPlaying = false;
      updatePlayIcon();
    }
    if (cmnModal) {
      cmnModal.classList.remove('open');
      cmnModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    try {
      history.replaceState(null, null, window.location.pathname + window.location.search);
    } catch (e) {}
    startHeroAutoPlay();
  }

  function nextModalImage() {
    currentIndex = (currentIndex + 1) % totalPhotos;
    renderModalImage(currentIndex);
  }

  function prevModalImage() {
    currentIndex = (currentIndex - 1 + totalPhotos) % totalPhotos;
    renderModalImage(currentIndex);
  }

  function toggleZoom() {
    const stageImg = document.getElementById('cmnStageImg');
    if (!stageImg) return;
    isZoomed = !isZoomed;
    if (isZoomed) {
      stageImg.classList.add('zoomed');
    } else {
      stageImg.classList.remove('zoomed');
    }
  }

  function updatePlayIcon() {
    const playIcon = document.getElementById('playPauseIcon');
    if (!playIcon) return;
    if (isModalSlideshowPlaying) {
      playIcon.innerHTML = `
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      `;
      if (modalBtnPlay) modalBtnPlay.classList.add('active');
    } else {
      playIcon.innerHTML = `
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      `;
      if (modalBtnPlay) modalBtnPlay.classList.remove('active');
    }
  }

  function toggleModalSlideshow() {
    if (isModalSlideshowPlaying) {
      clearInterval(modalSlideshowTimer);
      modalSlideshowTimer = null;
      isModalSlideshowPlaying = false;
    } else {
      isModalSlideshowPlaying = true;
      modalSlideshowTimer = setInterval(nextModalImage, 3800);
    }
    updatePlayIcon();
  }

  function toggleFullscreenWindow() {
    if (!document.fullscreenElement) {
      if (cmnModal.requestFullscreen) {
        cmnModal.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  function toggleThumbnailsBar() {
    if (modalBottomBar) {
      modalBottomBar.classList.toggle('hidden');
      if (modalBtnToggleThumbs) {
        modalBtnToggleThumbs.classList.toggle('active');
      }
    }
  }

  // Modal Event Listeners
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  if (modalArrowPrev) modalArrowPrev.addEventListener('click', prevModalImage);
  if (modalArrowNext) modalArrowNext.addEventListener('click', nextModalImage);
  if (modalBtnZoom) modalBtnZoom.addEventListener('click', toggleZoom);
  if (modalBtnPlay) modalBtnPlay.addEventListener('click', toggleModalSlideshow);
  if (modalBtnFullscreenWindow) modalBtnFullscreenWindow.addEventListener('click', toggleFullscreenWindow);
  if (modalBtnToggleThumbs) modalBtnToggleThumbs.addEventListener('click', toggleThumbnailsBar);

  // Modal Thumbnails Click
  modalThumbsCards.forEach((thumb) => {
    thumb.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(thumb.getAttribute('data-index'), 10);
      renderModalImage(idx);
    });
  });

  // Global Keyboard Navigation (Arrows & Escape)
  document.addEventListener('keydown', (e) => {
    const isModalOpen = cmnModal && cmnModal.classList.contains('open');
    if (e.key === 'Escape' && isModalOpen) {
      closeModal();
    } else if (e.key === 'ArrowLeft') {
      if (isModalOpen) {
        prevModalImage();
      } else {
        prevHeroSlide();
      }
    } else if (e.key === 'ArrowRight') {
      if (isModalOpen) {
        nextModalImage();
      } else {
        nextHeroSlide();
      }
    }
  });

  // Touch Swipe for Mobile Modal
  let touchStartX = 0;
  let touchEndX = 0;

  if (cmnModal) {
    cmnModal.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    cmnModal.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 50) {
        if (diff < 0) nextModalImage();
        else prevModalImage();
      }
    }, { passive: true });
  }

  // Check URL Hash on initial page load (e.g. #gallery-2)
  if (window.location.hash && window.location.hash.startsWith('#gallery-')) {
    const hashIndex = parseInt(window.location.hash.replace('#gallery-', ''), 10) - 1;
    if (hashIndex >= 0 && hashIndex < totalPhotos) {
      openModal(hashIndex);
    }
  }

  /* ==========================================================================
     5. Bargain Offer Interactive Widget Logic
     ========================================================================== */
  const ASKING_PRICE = 7500000; // ₹75,00,000

  const offerSlider = document.getElementById('offerRangeSlider');
  const priceDisplay = document.getElementById('offerPriceDisplay');
  const percentageDisplay = document.getElementById('offerPercentageDisplay');
  const strengthBanner = document.getElementById('strengthBanner');
  const strengthTitle = document.getElementById('strengthTitle');
  const messageInput = document.getElementById('sellerMessage');
  const charCounter = document.getElementById('charCounter');
  const sendOfferBtn = document.getElementById('btnSendOffer');

  const presetBtns = [
    { el: document.getElementById('btnQuickOffer'), amount: 6750000 },
    { el: document.getElementById('btnStrongOffer'), amount: 6950000 },
    { el: document.getElementById('btnFullPrice'), amount: 7500000 }
  ];

  function formatINR(number) {
    return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(number)}`;
  }

  function updateOfferState(amount) {
    const numericAmount = parseInt(amount, 10);
    const percentage = ((numericAmount / ASKING_PRICE) * 100).toFixed(1);

    if (priceDisplay) priceDisplay.textContent = formatINR(numericAmount);
    if (percentageDisplay) percentageDisplay.textContent = `${percentage}% of asking price`;

    if (strengthTitle && strengthBanner) {
      if (percentage >= 99) {
        strengthTitle.textContent = '🔥 Full Price Offer';
        strengthBanner.style.backgroundColor = '#ecfdf5';
        strengthBanner.style.borderColor = '#a7f3d0';
      } else if (percentage >= 92) {
        strengthTitle.textContent = '💪 Strong Offer';
        strengthBanner.style.backgroundColor = '#ecfdf5';
        strengthBanner.style.borderColor = '#a7f3d0';
      } else if (percentage >= 88) {
        strengthTitle.textContent = '⚡ Good Starting Offer';
        strengthBanner.style.backgroundColor = '#fefce8';
        strengthBanner.style.borderColor = '#fef08a';
      } else {
        strengthTitle.textContent = '⚠️ Value Offer';
        strengthBanner.style.backgroundColor = '#fffbeb';
        strengthBanner.style.borderColor = '#fde68a';
      }
    }

    presetBtns.forEach(preset => {
      if (preset.el) {
        if (Math.abs(preset.amount - numericAmount) < 15000) {
          preset.el.classList.add('active');
        } else {
          preset.el.classList.remove('active');
        }
      }
    });
  }

  if (offerSlider) {
    offerSlider.addEventListener('input', (e) => {
      updateOfferState(e.target.value);
    });
    updateOfferState(offerSlider.value);
  }

  presetBtns.forEach(preset => {
    if (preset.el) {
      preset.el.addEventListener('click', () => {
        if (offerSlider) offerSlider.value = preset.amount;
        updateOfferState(preset.amount);
      });
    }
  });

  if (messageInput && charCounter) {
    messageInput.addEventListener('input', () => {
      charCounter.textContent = `${messageInput.value.length}/200`;
    });
  }

  if (sendOfferBtn) {
    sendOfferBtn.addEventListener('click', () => {
      const currentOffer = formatINR(offerSlider ? offerSlider.value : ASKING_PRICE);
      const originalText = sendOfferBtn.innerHTML;
      
      sendOfferBtn.disabled = true;
      sendOfferBtn.innerHTML = `<span>Submitting Offer...</span>`;

      setTimeout(() => {
        sendOfferBtn.innerHTML = `<span>✓ Offer of ${currentOffer} Sent!</span>`;
        sendOfferBtn.style.backgroundColor = '#15803d';

        setTimeout(() => {
          sendOfferBtn.disabled = false;
          sendOfferBtn.innerHTML = originalText;
          sendOfferBtn.style.backgroundColor = '';
        }, 3000);
      }, 800);
    });
  }
});
