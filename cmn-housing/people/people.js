/**
 * CMNHousing - People / Profile Dashboard Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. Account Type Multi-Select Pills
     ========================================================================== */
  const accountPills = document.querySelectorAll('#accountTypePills .type-pill');
  accountPills.forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('selected');
      showToast(`Updated account role: ${pill.textContent.trim().replace('✓', '')}`);
    });
  });

  /* ==========================================================================
     2. Preferred Contact Method Selection
     ========================================================================== */
  const contactMethodBtns = document.querySelectorAll('#contactMethodGroup .method-btn');
  contactMethodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      contactMethodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const method = btn.getAttribute('data-method');
      showToast(`Preferred contact set to ${method.toUpperCase()}`);
    });
  });

  /* ==========================================================================
     3. Smooth Active Sidebar Highlighting on Scroll
     ========================================================================== */
  const sidebarLinks = document.querySelectorAll('.nav-sidebar-item');
  const sections = document.querySelectorAll('.people-card');

  function updateActiveSidebar() {
    let currentId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      sidebarLinks.forEach(link => {
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }

  window.addEventListener('scroll', updateActiveSidebar);

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  /* ==========================================================================
     4. Document Upload Dropzones Simulation
     ========================================================================== */
  const uploadBoxes = document.querySelectorAll('.doc-upload-box');
  uploadBoxes.forEach(box => {
    box.addEventListener('click', () => {
      const docName = box.querySelector('.upload-doc-title').textContent;
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          box.style.borderColor = 'var(--primary-color)';
          box.style.background = 'var(--primary-light)';
          const hint = box.querySelector('.upload-doc-hint');
          if (hint) {
            hint.textContent = `✓ Uploaded: ${file.name.substring(0, 16)}...`;
            hint.style.color = 'var(--primary-color)';
            hint.style.fontWeight = '700';
          }
          showToast(`Successfully uploaded ${docName} (${file.name})`);
        }
      };
      input.click();
    });
  });

  /* ==========================================================================
     5. Use Current Location Action
     ========================================================================== */
  const btnLocation = document.getElementById('btnCurrentLocation');
  if (btnLocation) {
    btnLocation.addEventListener('click', () => {
      btnLocation.innerHTML = `<span>Fetching...</span>`;
      setTimeout(() => {
        const cityInput = document.getElementById('cityInput');
        const localityInput = document.getElementById('localityInput');
        const pinInput = document.getElementById('pinCode');
        if (cityInput) cityInput.value = 'Hyderabad';
        if (localityInput) localityInput.value = 'Kukatpally';
        if (pinInput) pinInput.value = '500072';
        btnLocation.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
            <circle cx="12" cy="9" r="2.5"></circle>
          </svg>
          <span>Location Updated</span>
        `;
        showToast('📍 Updated address to Kukatpally, Hyderabad (500072)');
      }, 500);
    });
  }

  /* ==========================================================================
     6. Save Changes Action & Toast Notification
     ========================================================================== */
  const btnHeaderSave = document.getElementById('btnHeaderSave');
  const btnBottomSave = document.getElementById('btnBottomSave');

  function handleSave() {
    showToast('✓ All changes and preferences saved successfully!');
  }

  if (btnHeaderSave) btnHeaderSave.addEventListener('click', handleSave);
  if (btnBottomSave) btnBottomSave.addEventListener('click', handleSave);

  function showToast(message) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  /* ==========================================================================
     7. Download Profile & Logout Actions
     ========================================================================== */
  const btnDownloadProfile = document.getElementById('btnDownloadProfile');
  if (btnDownloadProfile) {
    btnDownloadProfile.addEventListener('click', () => {
      showToast('📥 Generating and downloading PDF profile summary...');
    });
  }

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out of CMNHousing?')) {
        window.location.href = '../index.html';
      }
    });
  }
});
