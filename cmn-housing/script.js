/**
 * HousingDirect - Bargain Offer & Real Estate Interactive Controls
 */

document.addEventListener('DOMContentLoaded', () => {
  const ASKING_PRICE = 7500000; // ₹75,00,000

  // Elements
  const slider = document.getElementById('offerRangeSlider');
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

  // Helper to format currency in Indian numbering format (e.g. ₹69,50,000)
  function formatINR(number) {
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(number);
    return `₹${formatted}`;
  }

  // Update offer details based on current slider or preset amount
  function updateOfferState(amount) {
    const numericAmount = parseInt(amount, 10);
    const percentage = ((numericAmount / ASKING_PRICE) * 100).toFixed(1);

    // Update display values
    priceDisplay.textContent = formatINR(numericAmount);
    percentageDisplay.textContent = `${percentage}% of asking price`;

    // Dynamic Offer Strength logic
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

    // Sync preset active states
    presetBtns.forEach(preset => {
      if (Math.abs(preset.amount - numericAmount) < 15000) {
        preset.el.classList.add('active');
      } else {
        preset.el.classList.remove('active');
      }
    });
  }

  // Slider Event Listener
  if (slider) {
    slider.addEventListener('input', (e) => {
      updateOfferState(e.target.value);
    });
  }

  // Preset Buttons Event Listeners
  presetBtns.forEach(preset => {
    if (preset.el) {
      preset.el.addEventListener('click', () => {
        slider.value = preset.amount;
        updateOfferState(preset.amount);
      });
    }
  });

  // Character counter for seller message
  if (messageInput && charCounter) {
    messageInput.addEventListener('input', () => {
      const length = messageInput.value.length;
      charCounter.textContent = `${length}/200`;
    });
  }

  // Send Offer Button
  if (sendOfferBtn) {
    sendOfferBtn.addEventListener('click', () => {
      const currentOffer = formatINR(slider.value);
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

  // Initial calculation on load
  if (slider) {
    updateOfferState(slider.value);
  }
});
