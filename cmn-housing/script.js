/**
 * HousingDirect / CMN Housing - Interactive Media Slider & Preview Modal
 * Supports: High-Res Photos, HTML5 Videos & YouTube Video Embeds
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. DOM Elements & Dynamic HTML Media List Extraction
     ========================================================================== */
  const heroSliderCard = document.getElementById('propertyImageSlider');
  const heroSlides = document.querySelectorAll('.slider-slide');
  const heroDots = document.querySelectorAll('.slider-dot');
  const heroPrevBtn = document.getElementById('sliderPrevBtn');
  const heroNextBtn = document.getElementById('sliderNextBtn');
  const heroPhotoCount = document.getElementById('sliderPhotoCount');
  const heroFullscreenBtn = document.getElementById('btnFullscreen');

  // Extract media items directly from HTML slide markup
  const mediaList = Array.from(heroSlides).map(slide => {
    const imgEl = slide.querySelector('img');
    return {
      type: slide.getAttribute('data-type') || 'image',
      src: slide.getAttribute('data-src') || (imgEl ? imgEl.getAttribute('src') : ''),
      caption: slide.getAttribute('data-caption') || (imgEl ? imgEl.getAttribute('alt') : 'Property Media')
    };
  });

  const totalMedia = mediaList.length;
  let currentIndex = 0;
  let heroAutoPlayTimer = null;
  let isZoomed = false;

  // CMN Modal Preview Elements
  const cmnModal = document.getElementById('cmnGalleryModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCloseBtn = document.getElementById('cmnModalCloseBtn');
  const modalCounter = document.getElementById('cmnModalCounter');
  const modalStageImgWrapper = document.getElementById('cmnStageImgWrapper');
  const modalArrowPrev = document.getElementById('cmnModalArrowPrev');
  const modalArrowNext = document.getElementById('cmnModalArrowNext');
  const modalThumbBtns = document.querySelectorAll('.cmn-thumb-btn');
  
  // Modal Toolbar Buttons
  const modalBtnZoom = document.getElementById('modalBtnZoom');
  const modalBtnFullscreenWindow = document.getElementById('modalBtnFullscreenWindow');

  /* ==========================================================================
     3. Hero Slider Update Logic
     ========================================================================== */
  function updateHeroSlider(index) {
    if (index < 0) index = totalMedia - 1;
    if (index >= totalMedia) index = 0;
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

    // Update Counter Badge
    if (heroPhotoCount) {
      heroPhotoCount.textContent = `${currentIndex + 1} / ${totalMedia} Media`;
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
     4. CMN Preview Modal Popup (Supports Images, HTML5 Video & YouTube)
     ========================================================================== */
  function renderModalMedia(index) {
    const item = mediaList[index];
    if (!item || !modalStageImgWrapper) return;

    // Reset zoom state and clear previous media (stops audio/video playback)
    isZoomed = false;
    modalStageImgWrapper.innerHTML = '';

    if (item.type === 'image') {
      const imgEl = document.createElement('img');
      imgEl.src = item.src;
      imgEl.alt = item.caption;
      imgEl.className = 'cmn-stage-img';
      imgEl.id = 'cmnStageImg';
      imgEl.addEventListener('click', toggleZoom);
      modalStageImgWrapper.appendChild(imgEl);
      if (modalBtnZoom) modalBtnZoom.style.display = 'flex';
    } else if (item.type === 'html_video') {
      const videoEl = document.createElement('video');
      videoEl.src = item.src;
      videoEl.className = 'cmn-stage-video';
      videoEl.controls = true;
      videoEl.autoplay = true;
      videoEl.playsInline = true;
      videoEl.loop = true;
      modalStageImgWrapper.appendChild(videoEl);
      if (modalBtnZoom) modalBtnZoom.style.display = 'none';
    } else if (item.type === 'youtube') {
      const ytWrap = document.createElement('div');
      ytWrap.className = 'cmn-stage-youtube-wrapper';
      ytWrap.innerHTML = `
        <iframe 
          src="${item.src}" 
          title="${item.caption}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen
        ></iframe>
      `;
      modalStageImgWrapper.appendChild(ytWrap);
      if (modalBtnZoom) modalBtnZoom.style.display = 'none';
    }

    // Update Counter (e.g. 1 / 7, 2 / 7)
    if (modalCounter) {
      modalCounter.textContent = `${index + 1} / ${totalMedia}`;
    }

    // Update Modal Thumbnail Strip Selection
    modalThumbBtns.forEach((thumb, idx) => {
      if (idx === index) {
        thumb.classList.add('active');
        try {
          thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } catch (err) {}
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
    renderModalMedia(currentIndex);
    if (cmnModal) {
      cmnModal.classList.add('open');
      cmnModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (cmnModal) {
      cmnModal.classList.remove('open');
      cmnModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (modalStageImgWrapper) {
        modalStageImgWrapper.innerHTML = ''; // Stop video and youtube audio immediately
      }
    }
    try {
      history.replaceState(null, null, window.location.pathname + window.location.search);
    } catch (e) {}
    startHeroAutoPlay();
  }

  function nextModalMedia() {
    currentIndex = (currentIndex + 1) % totalMedia;
    renderModalMedia(currentIndex);
  }

  function prevModalMedia() {
    currentIndex = (currentIndex - 1 + totalMedia) % totalMedia;
    renderModalMedia(currentIndex);
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

  // Modal Event Listeners
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  if (modalArrowPrev) modalArrowPrev.addEventListener('click', prevModalMedia);
  if (modalArrowNext) modalArrowNext.addEventListener('click', nextModalMedia);
  if (modalBtnZoom) modalBtnZoom.addEventListener('click', toggleZoom);
  if (modalBtnFullscreenWindow) modalBtnFullscreenWindow.addEventListener('click', toggleFullscreenWindow);

  // Modal Thumbnail Button Clicks
  modalThumbBtns.forEach((thumb) => {
    thumb.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(thumb.getAttribute('data-index'), 10);
      if (!isNaN(idx)) {
        currentIndex = idx;
        renderModalMedia(currentIndex);
      }
    });
  });

  // Global Keyboard Navigation (Arrows & Escape)
  document.addEventListener('keydown', (e) => {
    const isModalOpen = cmnModal && cmnModal.classList.contains('open');
    if (e.key === 'Escape' && isModalOpen) {
      closeModal();
    } else if (e.key === 'ArrowLeft') {
      if (isModalOpen) {
        prevModalMedia();
      } else {
        prevHeroSlide();
      }
    } else if (e.key === 'ArrowRight') {
      if (isModalOpen) {
        nextModalMedia();
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
        if (diff < 0) nextModalMedia();
        else prevModalMedia();
      }
    }, { passive: true });
  }

  // Check URL Hash on initial page load (e.g. #gallery-2)
  if (window.location.hash && window.location.hash.startsWith('#gallery-')) {
    const hashIndex = parseInt(window.location.hash.replace('#gallery-', ''), 10) - 1;
    if (hashIndex >= 0 && hashIndex < totalMedia) {
      openModal(hashIndex);
    }
  }

  /* ==========================================================================
     5. Bargain Offer Interactive Widget Logic
     ========================================================================== */
  const bargainCard = document.querySelector('.bargain-card');
  const ASKING_PRICE = bargainCard 
    ? parseInt(bargainCard.getAttribute('data-asking-price') || '7500000', 10) 
    : 7500000;

  const offerSlider = document.getElementById('offerRangeSlider');
  const priceDisplay = document.getElementById('offerPriceDisplay');
  const percentageDisplay = document.getElementById('offerPercentageDisplay');
  const strengthBanner = document.getElementById('strengthBanner');
  const strengthTitle = document.getElementById('strengthTitle');
  const messageInput = document.getElementById('sellerMessage');
  const charCounter = document.getElementById('charCounter');
  const sendOfferBtn = document.getElementById('btnSendOffer');
  const presetBtns = document.querySelectorAll('.btn-preset');

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

    presetBtns.forEach(btn => {
      const btnAmount = parseInt(btn.getAttribute('data-amount'), 10);
      if (!isNaN(btnAmount) && Math.abs(btnAmount - numericAmount) < 15000) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  if (offerSlider) {
    offerSlider.addEventListener('input', (e) => {
      updateOfferState(e.target.value);
    });
    updateOfferState(offerSlider.value);
  }

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const btnAmount = parseInt(btn.getAttribute('data-amount'), 10);
      if (offerSlider && !isNaN(btnAmount)) {
        offerSlider.value = btnAmount;
        updateOfferState(btnAmount);
      }
    });
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
