/**
 * Ian Kimemia Fine Art Portfolio & Catalog
 * Customer Frontend Client Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- State ---
  let allArtworks = [];
  let currentCategory = 'All';
  let currentSearch = '';
  let currentSort = 'newest';

  // --- DOM Elements ---
  const featuredGrid = document.getElementById('featuredGrid');
  const artworkGrid = document.getElementById('artworkGrid');
  const emptyState = document.getElementById('catalogEmptyState');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearch');
  const sortSelect = document.getElementById('sortSelect');
  const artworkInterestSelect = document.getElementById('artworkInterestSelect');

  // Modal Elements
  const artworkModal = document.getElementById('artworkModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBody = document.getElementById('modalBody');

  // Contact Form
  const contactForm = document.getElementById('contactForm');
  const submitInquiryBtn = document.getElementById('submitInquiryBtn');

  // Navigation & Drawer
  const menuToggle = document.getElementById('menuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  // Set current copyright year
  const currentYearElem = document.getElementById('currentYear');
  if (currentYearElem) currentYearElem.textContent = new Date().getFullYear();

  // --- Initialization ---
  initApp();

  async function initApp() {
    setupEventListeners();
    await fetchArtworks();
  }

  // --- Event Listeners ---
  function setupEventListeners() {
    // Mobile Drawer Navigation
    if (menuToggle && mobileDrawer) {
      menuToggle.addEventListener('click', () => {
        mobileDrawer.classList.add('open');
      });
    }

    if (drawerClose && mobileDrawer) {
      drawerClose.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    }

    drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });

    // Category Filter Buttons
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-category');
        renderCatalog();
      });
    });

    // Search Input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim();
        if (currentSearch.length > 0) {
          clearSearchBtn.classList.add('active');
        } else {
          clearSearchBtn.classList.remove('active');
        }
        renderCatalog();
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentSearch = '';
        clearSearchBtn.classList.remove('active');
        renderCatalog();
      });
    }

    // Sort Dropdown
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderCatalog();
      });
    }

    // Reset Filters Button
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        currentCategory = 'All';
        currentSearch = '';
        if (searchInput) searchInput.value = '';
        if (clearSearchBtn) clearSearchBtn.classList.remove('active');
        filterButtons.forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-category') === 'All');
        });
        renderCatalog();
      });
    }

    // Close Modal on backdrop click or ESC key
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeModal);
    }

    if (artworkModal) {
      artworkModal.addEventListener('click', (e) => {
        if (e.target === artworkModal) closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && artworkModal.classList.contains('active')) {
        closeModal();
      }
    });

    // Contact Form Submission
    if (contactForm) {
      contactForm.addEventListener('submit', handleContactSubmit);
    }
  }

  // --- Fetch Artworks from API ---
  async function fetchArtworks() {
    try {
      const response = await fetch('/api/artworks');
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        allArtworks = result.data;
        updateCategoryCounts();
        populateInquirySelect();
        renderFeaturedArtworks();
        renderCatalog();
      } else {
        showToast('Unable to load artwork catalog.', 'error');
      }
    } catch (error) {
      console.error('Error fetching artworks:', error);
      showToast('Network error while retrieving artworks.', 'error');
    }
  }

  // --- Update Filter Count Badges ---
  function updateCategoryCounts() {
    const counts = {
      All: allArtworks.length,
      Charcoal: allArtworks.filter(a => a.category === 'Charcoal').length,
      Paints: allArtworks.filter(a => a.category === 'Paints').length,
      Animes: allArtworks.filter(a => a.category === 'Animes').length
    };

    const countAll = document.getElementById('countAll');
    const countCharcoal = document.getElementById('countCharcoal');
    const countPaints = document.getElementById('countPaints');
    const countAnimes = document.getElementById('countAnimes');

    if (countAll) countAll.textContent = counts.All;
    if (countCharcoal) countCharcoal.textContent = counts.Charcoal;
    if (countPaints) countPaints.textContent = counts.Paints;
    if (countAnimes) countAnimes.textContent = counts.Animes;
  }

  // --- Populate Inquiry Select Dropdown ---
  function populateInquirySelect() {
    if (!artworkInterestSelect) return;
    artworkInterestSelect.innerHTML = '<option value="">-- General Studio Inquiry / Commission --</option>';

    allArtworks.forEach(art => {
      const option = document.createElement('option');
      option.value = art.id;
      option.textContent = `[${art.category}] ${art.title} - ${formatCurrency(art.price)} (${art.status})`;
      artworkInterestSelect.appendChild(option);
    });
  }

  // --- Render Featured Spotlight Pieces ---
  function renderFeaturedArtworks() {
    if (!featuredGrid) return;
    const featuredList = allArtworks.filter(a => a.is_featured);
    const displayItems = featuredList.length > 0 ? featuredList.slice(0, 3) : allArtworks.slice(0, 3);

    featuredGrid.innerHTML = displayItems.map(art => createArtworkCardHTML(art)).join('');
    attachCardClickListeners(featuredGrid);
  }

  // --- Render Catalog with Active Filters & Search ---
  function renderCatalog() {
    if (!artworkGrid) return;

    let filtered = [...allArtworks];

    // Filter by Category
    if (currentCategory !== 'All') {
      filtered = filtered.filter(a => a.category.toLowerCase() === currentCategory.toLowerCase());
    }

    // Filter by Search Query
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.medium && a.medium.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q))
      );
    }

    // Sort Artworks
    if (currentSort === 'price_asc') {
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (currentSort === 'price_desc') {
      filtered.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (currentSort === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Check Empty State
    if (filtered.length === 0) {
      artworkGrid.innerHTML = '';
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
      artworkGrid.innerHTML = filtered.map(art => createArtworkCardHTML(art)).join('');
      attachCardClickListeners(artworkGrid);
    }
  }

  // --- Helper: Generate HTML for Single Artwork Card ---
  function createArtworkCardHTML(art) {
    const isSold = art.status === 'Sold';
    const statusClass = `badge-status-${art.status || 'Available'}`;

    return `
      <article class="art-card" data-id="${art.id}">
        <div class="art-card-thumb-wrap">
          <img src="${escapeHTML(art.image_url)}" alt="${escapeHTML(art.title)}" class="art-card-thumb" loading="lazy">
          <div class="art-card-badges">
            <span class="badge badge-cat-${art.category}">${escapeHTML(art.category)}</span>
            <span class="badge badge-status ${statusClass}">${escapeHTML(art.status || 'Available')}</span>
          </div>
          <div class="art-card-overlay">
            <div class="view-btn-circle" title="View Details">
              <i class="fas fa-expand"></i>
            </div>
          </div>
        </div>

        <div class="art-card-body">
          <h3 class="art-card-title">${escapeHTML(art.title)}</h3>
          <p class="art-card-medium">${escapeHTML(art.medium || 'Fine Art')} ${art.dimensions ? `• ${escapeHTML(art.dimensions)}` : ''}</p>
          
          <div class="art-card-footer">
            <div class="art-card-price">${formatCurrency(art.price, art.currency)}</div>
            <div class="art-card-action">
              <span>${isSold ? 'View Archive' : 'Details & Inquire'}</span>
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  // --- Attach Card Click Handlers to Open Detail Modal ---
  function attachCardClickListeners(container) {
    const cards = container.querySelectorAll('.art-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const artwork = allArtworks.find(a => a.id === Number(id));
        if (artwork) openArtworkModal(artwork);
      });
    });
  }

  // --- Open Detailed Modal / Lightbox ---
  function openArtworkModal(art) {
    const approxUSD = Math.round(Number(art.price) / 130);
    const isAvailable = art.status === 'Available';
    const statusBadgeClass = `badge-status-${art.status || 'Available'}`;

    const encodedTitle = encodeURIComponent(art.title);
    const waUrl = `https://wa.me/254742916132?text=Hello%20Ian,%20I%20am%20interested%20in%20purchasing%20your%20piece:%20"${encodedTitle}"%20(KES%20${art.price}).%20Is%20it%20available?`;

    modalBody.innerHTML = `
      <div class="modal-detail-grid">
        <div class="modal-image-col">
          <img src="${escapeHTML(art.image_url)}" alt="${escapeHTML(art.title)}" class="modal-art-image">
        </div>

        <div class="modal-info-col">
          <div class="modal-badges-row">
            <span class="badge badge-cat-${art.category}">${escapeHTML(art.category)}</span>
            <span class="badge badge-status ${statusBadgeClass}">${escapeHTML(art.status || 'Available')}</span>
          </div>

          <h2 class="modal-title">${escapeHTML(art.title)}</h2>

          <div class="modal-price-row">
            <span class="modal-price">${formatCurrency(art.price, art.currency)}</span>
            <span class="modal-price-usd">(Approx. $${approxUSD} USD)</span>
          </div>

          <div class="modal-meta-table">
            <div class="meta-row">
              <span class="label">Artist</span>
              <span class="value">Ian Kimemia</span>
            </div>
            <div class="meta-row">
              <span class="label">Medium</span>
              <span class="value">${escapeHTML(art.medium || 'Original Fine Art')}</span>
            </div>
            <div class="meta-row">
              <span class="label">Dimensions</span>
              <span class="value">${escapeHTML(art.dimensions || 'Custom Specification')}</span>
            </div>
            <div class="meta-row">
              <span class="label">Location</span>
              <span class="value">Kutus, Kirinyaga, Kenya</span>
            </div>
            <div class="meta-row">
              <span class="label">Authenticity</span>
              <span class="value">100% Hand-signed Original</span>
            </div>
          </div>

          <div class="modal-description">
            <p>${escapeHTML(art.description) || 'An exclusive original work created by Ian Kimemia, crafted with archival-grade materials and exceptional attention to detail.'}</p>
          </div>

          <div class="modal-actions-row">
            ${isAvailable ? `
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp-full">
                <i class="fab fa-whatsapp"></i>
                <span>Direct WhatsApp Purchase Inquiry</span>
              </a>
              <button class="btn btn-primary" id="modalInquireBtn">
                <i class="fas fa-envelope"></i>
                <span>Send Studio Inquiry Message</span>
              </button>
            ` : `
              <div class="badge-status-Sold" style="padding: 0.75rem; text-align: center; border-radius: 6px; font-weight: 600;">
                <i class="fas fa-lock"></i> This artwork has been sold or reserved. You may request a custom commission similar to this style.
              </div>
              <button class="btn btn-secondary" id="modalCommissionBtn">
                <i class="fas fa-paint-brush"></i>
                <span>Commission Similar Artwork</span>
              </button>
            `}
          </div>
        </div>
      </div>
    `;

    artworkModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Hook up Inquiry and Commission buttons inside modal
    const modalInquireBtn = document.getElementById('modalInquireBtn');
    if (modalInquireBtn) {
      modalInquireBtn.addEventListener('click', () => {
        closeModal();
        prefillContactForm(art.id, `Inquiry regarding "${art.title}"`);
      });
    }

    const modalCommissionBtn = document.getElementById('modalCommissionBtn');
    if (modalCommissionBtn) {
      modalCommissionBtn.addEventListener('click', () => {
        closeModal();
        prefillContactForm(null, `Commission request inspired by "${art.title}"`);
      });
    }
  }

  function closeModal() {
    artworkModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // --- Scroll to Contact Form & Pre-fill Artwork Interest ---
  function prefillContactForm(artworkId, subjectText) {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }

    if (artworkInterestSelect && artworkId) {
      artworkInterestSelect.value = artworkId;
    }

    const subjectInput = document.getElementById('contactSubject');
    if (subjectInput && subjectText) {
      subjectInput.value = subjectText;
    }
  }

  // --- Handle Contact Form Submission ---
  async function handleContactSubmit(e) {
    e.preventDefault();

    // Elements
    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const phoneInput = document.getElementById('contactPhone');
    const subjectInput = document.getElementById('contactSubject');
    const messageInput = document.getElementById('contactMessage');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const subject = subjectInput.value.trim();
    const message = messageInput.value.trim();
    const artwork_id = artworkInterestSelect ? artworkInterestSelect.value : null;

    // Reset errors
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');

    let hasError = false;
    if (!name) {
      document.getElementById('nameError').textContent = 'Please enter your name.';
      hasError = true;
    }
    if (!email || !email.includes('@')) {
      document.getElementById('emailError').textContent = 'Please enter a valid email address.';
      hasError = true;
    }
    if (!subject) {
      document.getElementById('subjectError').textContent = 'Please enter a subject.';
      hasError = true;
    }
    if (!message) {
      document.getElementById('messageError').textContent = 'Please write your message.';
      hasError = true;
    }

    if (hasError) return;

    // Button Spinner State
    const btnText = submitInquiryBtn.querySelector('.btn-text');
    const btnSpinner = submitInquiryBtn.querySelector('.btn-spinner');
    submitInquiryBtn.disabled = true;
    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject,
          message,
          artwork_id: artwork_id || null
        })
      });

      const result = await response.json();

      if (result.success) {
        showToast(result.message || 'Message sent! Ian Kimemia will get back to you shortly.', 'success');
        contactForm.reset();
      } else {
        showToast(result.message || 'Failed to send message.', 'error');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      showToast('Network error while sending your message.', 'error');
    } finally {
      submitInquiryBtn.disabled = false;
      btnText.classList.remove('hidden');
      btnSpinner.classList.add('hidden');
    }
  }

  // --- Utility Functions ---
  function formatCurrency(amount, currency = 'KES') {
    const num = Number(amount) || 0;
    return `${currency} ${num.toLocaleString('en-US')}`;
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-triangle';

    toast.innerHTML = `
      <i class="fas ${icon}"></i>
      <span>${escapeHTML(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }
});
