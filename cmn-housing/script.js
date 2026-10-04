/**
 * HousingDirect / CMN Housing - Interactive Media Slider & Preview Modal
 *
 * Supports:
 * - High-Res Photos
 * - HTML5 Videos
 * - YouTube Video Embeds
 * - Circular Hero Slider
 * - Circular Preview Modal
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. DOM Elements & Dynamic HTML Media List Extraction
     ========================================================================== */

  const heroSliderCard = document.getElementById('propertyImageSlider');
  const heroSliderTrack = document.getElementById('sliderTrack');
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
      src: slide.getAttribute('data-src') ||
        (imgEl ? imgEl.getAttribute('src') : ''),
      caption: slide.getAttribute('data-caption') ||
        (imgEl ? imgEl.getAttribute('alt') : 'Property Media')
    };
  });

  const totalMedia = mediaList.length;

  let currentIndex = 0;
  let heroAutoPlayTimer = null;
  let isZoomed = false;


  /* ==========================================================================
     2. CMN Modal Preview Elements
     ========================================================================== */

  const cmnModal = document.getElementById('cmnGalleryModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCloseBtn = document.getElementById('cmnModalCloseBtn');
  const modalCounter = document.getElementById('cmnModalCounter');
  const modalStageTrack = document.getElementById('cmnStageSliderTrack');

  // IMPORTANT:
  // This must be "let" because circular clones are added later.
  let modalSlides = document.querySelectorAll('.cmn-stage-slide');

  const modalArrowPrev = document.getElementById('cmnModalArrowPrev');
  const modalArrowNext = document.getElementById('cmnModalArrowNext');
  const modalThumbBtns = document.querySelectorAll('.cmn-thumb-btn');

  // Modal Toolbar Buttons
  const modalBtnZoom = document.getElementById('modalBtnZoom');
  const modalBtnFullscreenWindow =
    document.getElementById('modalBtnFullscreenWindow');


  /* ==========================================================================
     3. Hero Slider Logic
     ========================================================================== */

  function updateHeroSlider(index) {

    if (totalMedia <= 0) return;

    currentIndex =
      ((index % totalMedia) + totalMedia) % totalMedia;

    if (heroSliderTrack) {
      heroSliderTrack.style.transform =
        `translateX(-${currentIndex * 100}%)`;
    }

    // Update Hero Slides
    heroSlides.forEach((slide, idx) => {
      slide.classList.toggle(
        'active',
        idx === currentIndex
      );
    });

    // Update Hero Dots
    heroDots.forEach((dot, idx) => {
      dot.classList.toggle(
        'active',
        idx === currentIndex
      );
    });

    // Update Counter Badge
    if (heroPhotoCount) {
      heroPhotoCount.textContent =
        `${currentIndex + 1} / ${totalMedia} Media`;
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

    heroAutoPlayTimer =
      setInterval(nextHeroSlide, 5200);
  }


  function stopHeroAutoPlay() {
    if (heroAutoPlayTimer) {
      clearInterval(heroAutoPlayTimer);
      heroAutoPlayTimer = null;
    }
  }


  /* ==========================================================================
     Hero Navigation Buttons
     ========================================================================== */

  if (heroPrevBtn) {
    heroPrevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      prevHeroSlide();
      startHeroAutoPlay();
    });
  }


  if (heroNextBtn) {
    heroNextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      nextHeroSlide();
      startHeroAutoPlay();
    });
  }


  /* ==========================================================================
     Hero Dots
     ========================================================================== */

  heroDots.forEach((dot) => {

    dot.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const idx =
        parseInt(dot.getAttribute('data-index'), 10);

      if (!isNaN(idx)) {
        updateHeroSlider(idx);
        startHeroAutoPlay();
      }
    });

  });


  /* ==========================================================================
     Hero Card Click / Touch
     ========================================================================== */

  if (heroSliderCard) {

    heroSliderCard.addEventListener(
      'mouseenter',
      stopHeroAutoPlay
    );

    heroSliderCard.addEventListener(
      'mouseleave',
      startHeroAutoPlay
    );


    heroSliderCard.addEventListener('click', (e) => {

      if (
        e.target.closest(
          '#sliderPrevBtn, #sliderNextBtn, .slider-dot, #btnFullscreen'
        )
      ) {
        return;
      }

      openModal(currentIndex);
    });


    // Hero swipe support
    let heroTouchStartX = null;
    let heroTouchStartY = null;


    heroSliderCard.addEventListener(
      'touchstart',
      (e) => {

        if (
          e.target.closest(
            '#sliderPrevBtn, #sliderNextBtn, .slider-dot, #btnFullscreen'
          )
        ) {
          heroTouchStartX = null;
          return;
        }

        heroTouchStartX =
          e.changedTouches[0].screenX;

        heroTouchStartY =
          e.changedTouches[0].screenY;

        stopHeroAutoPlay();

      },
      { passive: true }
    );


    heroSliderCard.addEventListener(
      'touchend',
      (e) => {

        if (heroTouchStartX === null) return;

        const endX =
          e.changedTouches[0].screenX;

        const endY =
          e.changedTouches[0].screenY;

        const diffX =
          endX - heroTouchStartX;

        const diffY =
          endY - heroTouchStartY;

        heroTouchStartX = null;
        heroTouchStartY = null;


        if (
          Math.abs(diffX) > 40 &&
          Math.abs(diffX) > Math.abs(diffY)
        ) {

          if (diffX < 0) {
            nextHeroSlide();
          } else {
            prevHeroSlide();
          }
        }

        startHeroAutoPlay();

      },
      { passive: true }
    );
  }


  /* ==========================================================================
     Hero Fullscreen
     ========================================================================== */

  if (heroFullscreenBtn) {

    heroFullscreenBtn.addEventListener('click', (e) => {

      e.preventDefault();
      e.stopPropagation();

      openModal(currentIndex);
    });
  }


  startHeroAutoPlay();


  /* ==========================================================================
     4. CMN Preview Modal
     ========================================================================== */
function sendYouTubeCommand(func, args) {

  /*
   * IMPORTANT:
   * The circular slider creates a clone of the last slide.
   * Since the YouTube slide is the last slide, there are now
   * two YouTube iframes.
   *
   * Therefore, DO NOT use getElementById() here.
   * Always target the REAL YouTube slide using data-index="6".
   */

  const youtubeSlide =
    modalStageTrack
      ? modalStageTrack.querySelector(
          '.cmn-stage-slide:not(.cmn-stage-slide-clone)[data-index="6"]'
        )
      : null;


  const iframe =
    youtubeSlide
      ? youtubeSlide.querySelector(
          '.cmn-stage-youtube-wrapper iframe'
        )
      : null;


  if (
    iframe &&
    iframe.contentWindow
  ) {

    iframe.contentWindow.postMessage(
      JSON.stringify({
        event: 'command',
        func: func,
        args: args || []
      }),
      '*'
    );
  }
}


  /* ==========================================================================
     Circular Modal Slider Setup
     ========================================================================== */

  let modalOriginalSlides = [];
  let modalSliderPosition = 1;
  let modalIsResetting = false;


  function setupCircularModalSlider() {

    if (!modalStageTrack) return;

    // Prevent duplicate clone creation
    if (
      modalStageTrack.dataset.circularReady === 'true'
    ) {
      return;
    }


    modalOriginalSlides = Array.from(
      modalStageTrack.querySelectorAll(
        '.cmn-stage-slide'
      )
    );


    if (modalOriginalSlides.length === 0) {
      return;
    }


    /*
     * Original:
     *
     * [1] [2] [3] [4] [5] [6] [7]
     *
     * Becomes:
     *
     * [7 clone] [1] [2] [3] [4] [5] [6] [7] [1 clone]
     */


    // Clone last slide
    const lastClone =
      modalOriginalSlides[
        modalOriginalSlides.length - 1
      ].cloneNode(true);


    // Clone first slide
    const firstClone =
      modalOriginalSlides[0].cloneNode(true);


    lastClone.classList.add(
      'cmn-stage-slide-clone'
    );

    firstClone.classList.add(
      'cmn-stage-slide-clone'
    );


    // Add cloned last slide at beginning
    modalStageTrack.insertBefore(
      lastClone,
      modalStageTrack.firstChild
    );


    // Add cloned first slide at end
    modalStageTrack.appendChild(firstClone);


    // Refresh slide collection
    modalSlides =
      modalStageTrack.querySelectorAll(
        '.cmn-stage-slide'
      );


    /*
     * Position 0 = cloned last
     * Position 1 = real first
     * Position 2 = real second
     * ...
     * Position N = real last
     * Position N+1 = cloned first
     */


    modalSliderPosition = 1;


    // Initial position without animation
    modalStageTrack.style.transition = 'none';

    modalStageTrack.style.transform =
      `translateX(-${modalSliderPosition * 100}%)`;


    // Force browser reflow
    void modalStageTrack.offsetWidth;


    // Restore normal transition
    modalStageTrack.style.transition =
      'transform 0.75s cubic-bezier(0.25, 1, 0.35, 1)';


    modalStageTrack.dataset.circularReady = 'true';


    /*
     * Handle the invisible reset after reaching a clone.
     */

    modalStageTrack.addEventListener(
      'transitionend',
      () => {

        if (modalIsResetting) return;

        const realSlideCount =
          modalOriginalSlides.length;


        /*
         * Last real slide → cloned first slide
         *
         * Reset:
         *
         * clone first → real first
         */
        if (
          modalSliderPosition ===
          realSlideCount + 1
        ) {

          modalIsResetting = true;

          modalStageTrack.style.transition =
            'none';

          modalSliderPosition = 1;

          modalStageTrack.style.transform =
            `translateX(-${modalSliderPosition * 100}%)`;

          void modalStageTrack.offsetWidth;

          modalStageTrack.style.transition =
            'transform 0.75s cubic-bezier(0.25, 1, 0.35, 1)';

          modalIsResetting = false;
        }


        /*
         * First real slide → cloned last slide
         *
         * Reset:
         *
         * clone last → real last
         */
        if (modalSliderPosition === 0) {

          modalIsResetting = true;

          modalStageTrack.style.transition =
            'none';

          modalSliderPosition =
            realSlideCount;

          modalStageTrack.style.transform =
            `translateX(-${modalSliderPosition * 100}%)`;

          void modalStageTrack.offsetWidth;

          modalStageTrack.style.transition =
            'transform 0.75s cubic-bezier(0.25, 1, 0.35, 1)';

          modalIsResetting = false;
        }

      }
    );
  }


  // Setup circular modal slider once
  setupCircularModalSlider();


  /* ==========================================================================
     Render Modal Media
     ========================================================================== */

  function renderModalMedia(
    index,
    animate = true
  ) {

    if (totalMedia <= 0) return;


    // Normalize logical media index
    const targetIndex =
      ((index % totalMedia) + totalMedia) %
      totalMedia;


    const previousIndex = currentIndex;

    // Store logical index
    currentIndex = targetIndex;


    // Make sure circular slider exists
    setupCircularModalSlider();


    /* ------------------------------------------------------------------------
       Reset Zoom
       ------------------------------------------------------------------------ */

    isZoomed = false;

    document
      .querySelectorAll(
        '.cmn-stage-img.zoomed'
      )
      .forEach(img => {
        img.classList.remove('zoomed');
      });


    /* ------------------------------------------------------------------------
       Modal Track Position
       ------------------------------------------------------------------------ */

    if (modalStageTrack) {

      let targetPosition =
        targetIndex + 1;


      /*
       * NEXT:
       *
       * Last → First
       *
       * Instead of:
       *
       * 7 → 1
       *
       * which causes the browser to animate backward,
       *
       * we do:
       *
       * 7 → cloned 1
       */

      const isNextWrap =
        previousIndex === totalMedia - 1 &&
        targetIndex === 0;


      /*
       * PREVIOUS:
       *
       * First → Last
       *
       * We do:
       *
       * 1 → cloned 7
       */

      const isPreviousWrap =
        previousIndex === 0 &&
        targetIndex === totalMedia - 1;


      if (isNextWrap) {
        targetPosition =
          totalMedia + 1;
      }


      if (isPreviousWrap) {
        targetPosition = 0;
      }


      modalSliderPosition =
        targetPosition;


      if (!animate) {

        modalStageTrack.style.transition =
          'none';

        modalStageTrack.style.transform =
          `translateX(-${modalSliderPosition * 100}%)`;

        void modalStageTrack.offsetWidth;

        modalStageTrack.style.transition =
          'transform 0.75s cubic-bezier(0.25, 1, 0.35, 1)';

      } else {

        modalStageTrack.style.transition =
          'transform 0.75s cubic-bezier(0.25, 1, 0.35, 1)';

        modalStageTrack.style.transform =
          `translateX(-${modalSliderPosition * 100}%)`;
      }
    }


    /* ------------------------------------------------------------------------
       Active Slide + HTML5 Video Playback
       ------------------------------------------------------------------------ */

    modalSlides.forEach((slide, idx) => {

      const vid =
        slide.querySelector('video');


      /*
       * Because the first slide is a clone:
       *
       * DOM index 0 = clone last
       * DOM index 1 = real slide 0
       * DOM index 2 = real slide 1
       *
       * Therefore:
       *
       * logical index = DOM index - 1
       */

      const slideLogicalIndex =
        idx - 1;


      const isCurrent =
        !slide.classList.contains(
          'cmn-stage-slide-clone'
        ) &&
        slideLogicalIndex === currentIndex;


      slide.classList.toggle(
        'active',
        isCurrent
      );


      if (vid) {

        if (isCurrent) {

          vid.currentTime = 0;

          const playPromise =
            vid.play();


          if (playPromise !== undefined) {

            playPromise.catch(() => {

              // Retry muted if autoplay is blocked
              vid.muted = true;

              vid.play().catch(() => {});
            });
          }

        } else {

          vid.pause();
        }
      }
    });


    /* ------------------------------------------------------------------------
       YouTube Playback
       ------------------------------------------------------------------------ */

    const currentItem =
      mediaList[currentIndex];


    if (
      currentItem &&
      currentItem.type === 'youtube'
    ) {

      sendYouTubeCommand(
        'playVideo'
      );

    } else {

      sendYouTubeCommand(
        'pauseVideo'
      );
    }


    /* ------------------------------------------------------------------------
       Counter
       ------------------------------------------------------------------------ */

    if (modalCounter) {

      modalCounter.textContent =
        `${currentIndex + 1} / ${totalMedia}`;
    }


    /* ------------------------------------------------------------------------
       Zoom Button
       ------------------------------------------------------------------------ */

    if (modalBtnZoom) {

      modalBtnZoom.style.display =
        (
          currentItem &&
          currentItem.type === 'image'
        )
          ? 'flex'
          : 'none';
    }


    /* ------------------------------------------------------------------------
       Thumbnail Selection
       ------------------------------------------------------------------------ */

    modalThumbBtns.forEach(
      (thumb, idx) => {

        if (idx === currentIndex) {

          thumb.classList.add(
            'active'
          );


          try {

            thumb.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'center'
            });

          } catch (err) {}

        } else {

          thumb.classList.remove(
            'active'
          );
        }
      }
    );


    /* ------------------------------------------------------------------------
       URL Hash
       ------------------------------------------------------------------------ */

    try {

      history.replaceState(
        null,
        null,
        `#gallery-${currentIndex + 1}`
      );

    } catch (e) {}


    /* ------------------------------------------------------------------------
       Sync Hero Slider
       ------------------------------------------------------------------------ */

    updateHeroSlider(
      currentIndex
    );
  }


  /* ==========================================================================
     Open Modal
     ========================================================================== */

  function openModal(index) {

    stopHeroAutoPlay();


    if (typeof index === 'number') {

      currentIndex =
        ((index % totalMedia) + totalMedia) %
        totalMedia;
    }


    /*
     * Open directly without an animation.
     */
    renderModalMedia(
      currentIndex,
      false
    );


    if (cmnModal) {

      cmnModal.classList.add(
        'open'
      );

      cmnModal.setAttribute(
        'aria-hidden',
        'false'
      );

      document.body.style.overflow =
        'hidden';
    }
  }


  /* ==========================================================================
     Close Modal
     ========================================================================== */

  function closeModal() {

    if (cmnModal) {

      cmnModal.classList.remove(
        'open'
      );

      cmnModal.setAttribute(
        'aria-hidden',
        'true'
      );

      document.body.style.overflow =
        '';


      // Pause all HTML5 videos
      document
        .querySelectorAll(
          '.cmn-stage-video'
        )
        .forEach(vid => {
          vid.pause();
        });


      // Pause YouTube
      sendYouTubeCommand(
        'pauseVideo'
      );


      // Reset zoom
      isZoomed = false;

      document
        .querySelectorAll(
          '.cmn-stage-img.zoomed'
        )
        .forEach(img => {
          img.classList.remove(
            'zoomed'
          );
        });
    }


    try {

      history.replaceState(
        null,
        null,
        window.location.pathname +
        window.location.search
      );

    } catch (e) {}


    startHeroAutoPlay();
  }


  /* ==========================================================================
     Next / Previous Modal Media
     ========================================================================== */

  function nextModalMedia() {

    if (totalMedia <= 0) return;

    renderModalMedia(
      currentIndex + 1,
      true
    );
  }


  function prevModalMedia() {

    if (totalMedia <= 0) return;

    renderModalMedia(
      currentIndex - 1,
      true
    );
  }


  /* ==========================================================================
     Zoom
     ========================================================================== */

  function toggleZoom() {

    const activeSlide =
      document.querySelector(
        `.cmn-stage-slide[data-index="${currentIndex}"]`
      );


    if (!activeSlide) return;


    const stageImg =
      activeSlide.querySelector(
        '.cmn-stage-img'
      );


    if (!stageImg) return;


    isZoomed = !isZoomed;


    if (isZoomed) {

      stageImg.classList.add(
        'zoomed'
      );

    } else {

      stageImg.classList.remove(
        'zoomed'
      );
    }
  }


  // Bind click zoom on all real stage images
  document
    .querySelectorAll(
      '.cmn-stage-img'
    )
    .forEach(img => {

      img.addEventListener(
        'click',
        toggleZoom
      );
    });


  /* ==========================================================================
     Fullscreen
     ========================================================================== */

  function toggleFullscreenWindow() {

    if (!document.fullscreenElement) {

      if (
        cmnModal &&
        cmnModal.requestFullscreen
      ) {

        cmnModal
          .requestFullscreen()
          .catch(() => {});
      }

    } else {

      if (document.exitFullscreen) {

        document
          .exitFullscreen()
          .catch(() => {});
      }
    }
  }


  /* ==========================================================================
     Modal Event Listeners
     ========================================================================== */

  if (modalCloseBtn) {

    modalCloseBtn.addEventListener(
      'click',
      (e) => {

        e.preventDefault();

        closeModal();
      }
    );
  }


  if (modalBackdrop) {

    modalBackdrop.addEventListener(
      'click',
      closeModal
    );
  }


  if (modalArrowPrev) {

    modalArrowPrev.addEventListener(
      'click',
      (e) => {

        e.preventDefault();
        e.stopPropagation();

        prevModalMedia();
      }
    );
  }


  if (modalArrowNext) {

    modalArrowNext.addEventListener(
      'click',
      (e) => {

        e.preventDefault();
        e.stopPropagation();

        nextModalMedia();
      }
    );
  }


  if (modalBtnZoom) {

    modalBtnZoom.addEventListener(
      'click',
      (e) => {

        e.preventDefault();
        e.stopPropagation();

        toggleZoom();
      }
    );
  }


  if (modalBtnFullscreenWindow) {

    modalBtnFullscreenWindow.addEventListener(
      'click',
      (e) => {

        e.preventDefault();
        e.stopPropagation();

        toggleFullscreenWindow();
      }
    );
  }


  /* ==========================================================================
     Modal Thumbnail Button Clicks
     ========================================================================== */

  modalThumbBtns.forEach(
    (thumb) => {

      thumb.addEventListener(
        'click',
        (e) => {

          e.preventDefault();
          e.stopPropagation();

          const idx =
            parseInt(
              thumb.getAttribute(
                'data-index'
              ),
              10
            );


          if (!isNaN(idx)) {

            renderModalMedia(
              idx,
              true
            );
          }
        }
      );
    }
  );


  /* ==========================================================================
     Global Keyboard Navigation
     ========================================================================== */

  document.addEventListener(
    'keydown',
    (e) => {

      const isModalOpen =
        cmnModal &&
        cmnModal.classList.contains(
          'open'
        );


      if (
        e.key === 'Escape' &&
        isModalOpen
      ) {

        closeModal();

      } else if (
        e.key === 'ArrowLeft'
      ) {

        if (isModalOpen) {

          prevModalMedia();

        } else {

          prevHeroSlide();
        }

      } else if (
        e.key === 'ArrowRight'
      ) {

        if (isModalOpen) {

          nextModalMedia();

        } else {

          nextHeroSlide();
        }
      }
    }
  );


  /* ==========================================================================
     Touch Swipe for Mobile Modal
     ========================================================================== */

  let touchStartX = null;
  let touchStartY = null;


  if (cmnModal) {

    cmnModal.addEventListener(
      'touchstart',
      (e) => {

        if (
          e.target.closest(
            '.cmn-modal-nav-arrow, .cmn-thumb-btn, .cmn-tool-btn, video, iframe'
          )
        ) {

          touchStartX = null;

          return;
        }


        touchStartX =
          e.changedTouches[0].screenX;

        touchStartY =
          e.changedTouches[0].screenY;

      },
      { passive: true }
    );


    cmnModal.addEventListener(
      'touchend',
      (e) => {

        if (touchStartX === null) return;


        const endX =
          e.changedTouches[0].screenX;

        const endY =
          e.changedTouches[0].screenY;


        const diffX =
          endX - touchStartX;

        const diffY =
          endY - touchStartY;


        touchStartX = null;
        touchStartY = null;


        if (
          Math.abs(diffX) > 45 &&
          Math.abs(diffX) > Math.abs(diffY)
        ) {

          if (diffX < 0) {

            nextModalMedia();

          } else {

            prevModalMedia();
          }
        }
      },
      { passive: true }
    );
  }


  /* ==========================================================================
     Check URL Hash on Initial Page Load
     ========================================================================== */

  if (
    window.location.hash &&
    window.location.hash.startsWith(
      '#gallery-'
    )
  ) {

    const hashIndex =
      parseInt(
        window.location.hash.replace(
          '#gallery-',
          ''
        ),
        10
      ) - 1;


    if (
      hashIndex >= 0 &&
      hashIndex < totalMedia
    ) {

      openModal(hashIndex);
    }
  }


  /* ==========================================================================
     5. Bargain Offer Interactive Widget Logic
     ========================================================================== */

  const bargainCard =
    document.querySelector(
      '.bargain-card'
    );


  const ASKING_PRICE =
    bargainCard
      ? parseInt(
          bargainCard.getAttribute(
            'data-asking-price'
          ) || '7500000',
          10
        )
      : 7500000;


  const offerSlider =
    document.getElementById(
      'offerRangeSlider'
    );

  const priceDisplay =
    document.getElementById(
      'offerPriceDisplay'
    );

  const percentageDisplay =
    document.getElementById(
      'offerPercentageDisplay'
    );

  const strengthBanner =
    document.getElementById(
      'strengthBanner'
    );

  const strengthTitle =
    document.getElementById(
      'strengthTitle'
    );

  const messageInput =
    document.getElementById(
      'sellerMessage'
    );

  const charCounter =
    document.getElementById(
      'charCounter'
    );

  const sendOfferBtn =
    document.getElementById(
      'btnSendOffer'
    );

  const presetBtns =
    document.querySelectorAll(
      '.btn-preset'
    );


  function formatINR(number) {

    return `₹${new Intl.NumberFormat(
      'en-IN',
      {
        maximumFractionDigits: 0
      }
    ).format(number)}`;
  }


  function updateOfferState(amount) {

    const numericAmount =
      parseInt(amount, 10);


    const percentage =
      (
        (numericAmount / ASKING_PRICE) *
        100
      ).toFixed(1);


    if (priceDisplay) {

      priceDisplay.textContent =
        formatINR(
          numericAmount
        );
    }


    if (percentageDisplay) {

      percentageDisplay.textContent =
        `${percentage}% of asking price`;
    }


    if (
      strengthTitle &&
      strengthBanner
    ) {

      if (percentage >= 99) {

        strengthTitle.textContent =
          '🔥 Full Price Offer';

        strengthBanner.style.backgroundColor =
          '#ecfdf5';

        strengthBanner.style.borderColor =
          '#a7f3d0';


      } else if (percentage >= 92) {

        strengthTitle.textContent =
          '💪 Strong Offer';

        strengthBanner.style.backgroundColor =
          '#ecfdf5';

        strengthBanner.style.borderColor =
          '#a7f3d0';


      } else if (percentage >= 88) {

        strengthTitle.textContent =
          '⚡ Good Starting Offer';

        strengthBanner.style.backgroundColor =
          '#fefce8';

        strengthBanner.style.borderColor =
          '#fef08a';


      } else {

        strengthTitle.textContent =
          '⚠️ Value Offer';

        strengthBanner.style.backgroundColor =
          '#fffbeb';

        strengthBanner.style.borderColor =
          '#fde68a';
      }
    }


    presetBtns.forEach(
      btn => {

        const btnAmount =
          parseInt(
            btn.getAttribute(
              'data-amount'
            ),
            10
          );


        if (
          !isNaN(btnAmount) &&
          Math.abs(
            btnAmount -
            numericAmount
          ) < 15000
        ) {

          btn.classList.add(
            'active'
          );

        } else {

          btn.classList.remove(
            'active'
          );
        }
      }
    );
  }


  /* ==========================================================================
     Offer Slider
     ========================================================================== */

  if (offerSlider) {

    offerSlider.addEventListener(
      'input',
      (e) => {

        updateOfferState(
          e.target.value
        );
      }
    );


    updateOfferState(
      offerSlider.value
    );
  }


  /* ==========================================================================
     Preset Offer Buttons
     ========================================================================== */

  presetBtns.forEach(
    btn => {

      btn.addEventListener(
        'click',
        () => {

          const btnAmount =
            parseInt(
              btn.getAttribute(
                'data-amount'
              ),
              10
            );


          if (
            offerSlider &&
            !isNaN(btnAmount)
          ) {

            offerSlider.value =
              btnAmount;

            updateOfferState(
              btnAmount
            );
          }
        }
      );
    }
  );


  /* ==========================================================================
     Message Character Counter
     ========================================================================== */

  if (
    messageInput &&
    charCounter
  ) {

    messageInput.addEventListener(
      'input',
      () => {

        charCounter.textContent =
          `${messageInput.value.length}/200`;
      }
    );
  }


  /* ==========================================================================
     Send Offer
     ========================================================================== */

  if (sendOfferBtn) {

    sendOfferBtn.addEventListener(
      'click',
      () => {

        const currentOffer =
          formatINR(
            offerSlider
              ? offerSlider.value
              : ASKING_PRICE
          );


        const originalText =
          sendOfferBtn.innerHTML;


        sendOfferBtn.disabled =
          true;


        sendOfferBtn.innerHTML =
          `<span>Submitting Offer...</span>`;


        setTimeout(
          () => {

            sendOfferBtn.innerHTML =
              `<span>✓ Offer of ${currentOffer} Sent!</span>`;


            sendOfferBtn.style.backgroundColor =
              '#15803d';


            setTimeout(
              () => {

                sendOfferBtn.disabled =
                  false;

                sendOfferBtn.innerHTML =
                  originalText;

                sendOfferBtn.style.backgroundColor =
                  '';

              },
              3000
            );

          },
          800
        );
      }
    );
  }

});