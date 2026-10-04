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
     3. Hero Slider Logic
     ========================================================================== */

  let heroOriginalSlides = [];
  let heroSliderPosition = 0;
  let heroIsResetting = false;
  let heroIsTransitioning = false;

  function setupCircularHeroSlider() {
    if (!heroSliderTrack || heroSliderTrack.dataset.circularReady === 'true') return;
    
    heroOriginalSlides = Array.from(heroSliderTrack.querySelectorAll('.slider-slide'));
    if (heroOriginalSlides.length === 0) return;
    
    const firstClone = heroOriginalSlides[0].cloneNode(true);
    const lastClone = heroOriginalSlides[heroOriginalSlides.length - 1].cloneNode(true);
    
    firstClone.classList.add('slider-slide-clone');
    lastClone.classList.add('slider-slide-clone');
    
    heroSliderTrack.insertBefore(lastClone, heroSliderTrack.firstChild);
    heroSliderTrack.appendChild(firstClone);
    
    heroSliderPosition = currentIndex + 1;
    
    heroSliderTrack.style.transition = 'none';
    heroSliderTrack.style.transform = `translateX(-${heroSliderPosition * 100}%)`;
    void heroSliderTrack.offsetWidth;
    heroSliderTrack.style.transition = 'transform 0.75s cubic-bezier(0.25, 1, 0.35, 1)';
    
    heroSliderTrack.dataset.circularReady = 'true';
    
    heroSliderTrack.addEventListener('transitionend', (event) => {
      if (event.propertyName !== 'transform') return;
      if (heroIsResetting) return;
      
      const realSlideCount = heroOriginalSlides.length;
      
      if (heroSliderPosition === realSlideCount + 1) {
        heroIsResetting = true;
        heroSliderTrack.style.transition = 'none';
        heroSliderPosition = 1;
        heroSliderTrack.style.transform = `translateX(-${heroSliderPosition * 100}%)`;
        void heroSliderTrack.offsetWidth;
        heroSliderTrack.style.transition = 'transform 0.75s cubic-bezier(0.25, 1, 0.35, 1)';
        heroIsResetting = false;
        heroIsTransitioning = false;
        return;
      }
      
      if (heroSliderPosition === 0) {
        heroIsResetting = true;
        heroSliderTrack.style.transition = 'none';
        heroSliderPosition = realSlideCount;
        heroSliderTrack.style.transform = `translateX(-${heroSliderPosition * 100}%)`;
        void heroSliderTrack.offsetWidth;
        heroSliderTrack.style.transition = 'transform 0.75s cubic-bezier(0.25, 1, 0.35, 1)';
        heroIsResetting = false;
        heroIsTransitioning = false;
        return;
      }
      
      heroIsTransitioning = false;
    });
  }

  function updateHeroSlider(index) {
    if (totalMedia <= 0) return;

    setupCircularHeroSlider();

    // If a transition is already running and we are at a clone boundary,
    // force an instant snap to the real slide before starting the next transition.
    if (heroIsTransitioning) {
      const realSlideCount = heroOriginalSlides.length;
      if (heroSliderPosition === realSlideCount + 1) {
        heroSliderTrack.style.transition = 'none';
        heroSliderPosition = 1;
        heroSliderTrack.style.transform = `translateX(-${heroSliderPosition * 100}%)`;
        void heroSliderTrack.offsetWidth;
      } else if (heroSliderPosition === 0) {
        heroSliderTrack.style.transition = 'none';
        heroSliderPosition = realSlideCount;
        heroSliderTrack.style.transform = `translateX(-${heroSliderPosition * 100}%)`;
        void heroSliderTrack.offsetWidth;
      }
    }

    const previousIndex = currentIndex;
    const targetIndex = ((index % totalMedia) + totalMedia) % totalMedia;
    currentIndex = targetIndex;

    let targetPosition = targetIndex + 1;

    if (previousIndex === totalMedia - 1 && targetIndex === 0 && index > previousIndex) {
      targetPosition = totalMedia + 1;
    } else if (previousIndex === 0 && targetIndex === totalMedia - 1 && index < previousIndex) {
      targetPosition = 0;
    }

    heroSliderPosition = targetPosition;

    if (heroSliderTrack) {
      heroIsTransitioning = true;
      heroSliderTrack.style.transition = 'transform 0.75s cubic-bezier(0.25, 1, 0.35, 1)';
      heroSliderTrack.style.transform = `translateX(-${heroSliderPosition * 100}%)`;
    }

    // Update Hero Slides
    const realSlides = heroSliderTrack ? heroSliderTrack.querySelectorAll('.slider-slide:not(.slider-slide-clone)') : heroSlides;
    realSlides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === currentIndex);
    });

    // Update Hero Dots
    heroDots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
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





  setupCircularHeroSlider();
  startHeroAutoPlay();


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