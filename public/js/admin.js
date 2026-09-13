/**
 * Ian Kimemia Fine Art Studio CMS
 * Admin Dashboard Management Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- State ---
  let authToken = localStorage.getItem('ian_art_admin_token') || null;
  let adminData = null;
  let artworksList = [];
  let inquiriesList = [];
  let activeTab = 'overview';
  let editingArtworkId = null;
  let deletingArtworkId = null;

  // --- DOM Elements: Screens ---
  const authScreen = document.getElementById('authScreen');
  const dashboardScreen = document.getElementById('dashboardScreen');

  // Login Elements
  const loginForm = document.getElementById('loginForm');
  const loginUsername = document.getElementById('loginUsername');
  const loginPassword = document.getElementById('loginPassword');
  const toggleLoginPwd = document.getElementById('toggleLoginPwd');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  // Sidebar & Navigation
  const adminSidebar = document.getElementById('adminSidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarClose = document.getElementById('sidebarClose');
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const tabContents = document.querySelectorAll('.tab-content');
  const pageTitle = document.getElementById('pageTitle');
  const sidebarAdminName = document.getElementById('sidebarAdminName');
  const sidebarArtworksCount = document.getElementById('sidebarArtworksCount');
  const sidebarUnreadBadge = document.getElementById('sidebarUnreadBadge');

  // Overview / KPI Elements
  const kpiTotalArtworks = document.getElementById('kpiTotalArtworks');
  const kpiAvailableArtworks = document.getElementById('kpiAvailableArtworks');
  const kpiTotalValue = document.getElementById('kpiTotalValue');
  const kpiAvailableValue = document.getElementById('kpiAvailableValue');
  const kpiNewInquiries = document.getElementById('kpiNewInquiries');
  const kpiTotalInquiries = document.getElementById('kpiTotalInquiries');
  const countCharcoalKpi = document.getElementById('countCharcoalKpi');
  const countPaintsKpi = document.getElementById('countPaintsKpi');
  const countAnimesKpi = document.getElementById('countAnimesKpi');
  const quickAddArtBtn = document.getElementById('quickAddArtBtn');
  const overviewAddArtBtn = document.getElementById('overviewAddArtBtn');
  const overviewViewInquiriesBtn = document.getElementById('overviewViewInquiriesBtn');

  // Inventory Table & Controls
  const artworksTableBody = document.getElementById('artworksTableBody');
  const adminArtSearch = document.getElementById('adminArtSearch');
  const adminArtCategoryFilter = document.getElementById('adminArtCategoryFilter');
  const adminArtStatusFilter = document.getElementById('adminArtStatusFilter');
  const openAddModalBtn = document.getElementById('openAddModalBtn');

  // Artwork Modal Form
  const artworkFormModal = document.getElementById('artworkFormModal');
  const closeArtworkModal = document.getElementById('closeArtworkModal');
  const cancelArtworkModal = document.getElementById('cancelArtworkModal');
  const artworkForm = document.getElementById('artworkForm');
  const artworkModalTitle = document.getElementById('artworkModalTitle');
  const artworkEditId = document.getElementById('artworkEditId');
  const artTitle = document.getElementById('artTitle');
  const artCategory = document.getElementById('artCategory');
  const artStatus = document.getElementById('artStatus');
  const artPrice = document.getElementById('artPrice');
  const artDimensions = document.getElementById('artDimensions');
  const artMedium = document.getElementById('artMedium');
  const artDescription = document.getElementById('artDescription');
  const artFeatured = document.getElementById('artFeatured');

  // Image Upload Controls
  const tabUploadFile = document.getElementById('tabUploadFile');
  const tabImageUrl = document.getElementById('tabImageUrl');
  const sectionUploadFile = document.getElementById('sectionUploadFile');
  const sectionImageUrl = document.getElementById('sectionImageUrl');
  const fileDropzone = document.getElementById('fileDropzone');
  const artImageFile = document.getElementById('artImageFile');
  const artImageUrl = document.getElementById('artImageUrl');
  const previewImg = document.getElementById('previewImg');
  const previewPlaceholder = document.getElementById('previewPlaceholder');
  const saveArtworkBtn = document.getElementById('saveArtworkBtn');

  // Delete Modal
  const deleteModal = document.getElementById('deleteModal');
  const closeDeleteModal = document.getElementById('closeDeleteModal');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const deleteItemTitle = document.getElementById('deleteItemTitle');

  // Inquiries Elements
  const inquiriesListContainer = document.getElementById('inquiriesListContainer');
  const adminInquiryStatusFilter = document.getElementById('adminInquiryStatusFilter');
  const refreshInquiriesBtn = document.getElementById('refreshInquiriesBtn');

  // Settings Elements
  const changePasswordForm = document.getElementById('changePasswordForm');
  const currPassword = document.getElementById('currPassword');
  const newPassword = document.getElementById('newPassword');

  // --- Initialize CMS ---
  initCMS();

  async function initCMS() {
    setupEventListeners();
    await checkAuth();
  }

  // --- Setup Event Listeners ---
  function setupEventListeners() {
    // Password Visibility Toggle
    if (toggleLoginPwd) {
      toggleLoginPwd.addEventListener('click', () => {
        const isPassword = loginPassword.type === 'password';
        loginPassword.type = isPassword ? 'text' : 'password';
        toggleLoginPwd.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
      });
    }

    // Login Form Submit
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }

    // Logout Button
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }

    // Sidebar Mobile Toggle
    if (sidebarToggle && adminSidebar) {
      sidebarToggle.addEventListener('click', () => {
        adminSidebar.classList.add('open');
      });
    }

    if (sidebarClose && adminSidebar) {
      sidebarClose.addEventListener('click', () => {
        adminSidebar.classList.remove('open');
      });
    }

    // Sidebar Navigation Tabs
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.getAttribute('data-tab');
        switchTab(tab);
        if (adminSidebar) adminSidebar.classList.remove('open');
      });
    });

    // Quick Action Buttons
    if (quickAddArtBtn) quickAddArtBtn.addEventListener('click', () => openArtworkModal('create'));
    if (openAddModalBtn) openAddModalBtn.addEventListener('click', () => openArtworkModal('create'));
    if (overviewAddArtBtn) overviewAddArtBtn.addEventListener('click', () => openArtworkModal('create'));
    if (overviewViewInquiriesBtn) overviewViewInquiriesBtn.addEventListener('click', () => switchTab('inquiries'));

    // Filter and Search Artworks in Table
    if (adminArtSearch) adminArtSearch.addEventListener('input', renderArtworksTable);
    if (adminArtCategoryFilter) adminArtCategoryFilter.addEventListener('change', renderArtworksTable);
    if (adminArtStatusFilter) adminArtStatusFilter.addEventListener('change', renderArtworksTable);

    // Image Input Tabs
    if (tabUploadFile && tabImageUrl) {
      tabUploadFile.addEventListener('click', () => {
        tabUploadFile.classList.add('active');
        tabImageUrl.classList.remove('active');
        sectionUploadFile.classList.remove('hidden');
        sectionImageUrl.classList.add('hidden');
      });

      tabImageUrl.addEventListener('click', () => {
        tabImageUrl.classList.add('active');
        tabUploadFile.classList.remove('active');
        sectionImageUrl.classList.remove('hidden');
        sectionUploadFile.classList.add('hidden');
      });
    }

    // File Drag & Drop
    if (fileDropzone && artImageFile) {
      fileDropzone.addEventListener('click', () => artImageFile.click());

      fileDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropzone.style.borderColor = 'var(--gold-primary)';
      });

      fileDropzone.addEventListener('dragleave', () => {
        fileDropzone.style.borderColor = 'var(--admin-border)';
      });

      fileDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropzone.style.borderColor = 'var(--admin-border)';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          artImageFile.files = e.dataTransfer.files;
          handleFileSelect(e.dataTransfer.files[0]);
        }
      });

      artImageFile.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleFileSelect(e.target.files[0]);
        }
      });
    }

    // Direct Image URL preview input
    if (artImageUrl) {
      artImageUrl.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (url) {
          updateImagePreview(url);
        } else {
          clearImagePreview();
        }
      });
    }

    // Artwork Form Modal Close
    if (closeArtworkModal) closeArtworkModal.addEventListener('click', closeArtworkFormModal);
    if (cancelArtworkModal) cancelArtworkModal.addEventListener('click', closeArtworkFormModal);
    if (artworkForm) artworkForm.addEventListener('submit', handleArtworkSubmit);

    // Delete Modal Actions
    if (closeDeleteModal) closeDeleteModal.addEventListener('click', closeDeleteConfirmationModal);
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteConfirmationModal);
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

    // Inquiries Filter & Refresh
    if (adminInquiryStatusFilter) adminInquiryStatusFilter.addEventListener('change', fetchInquiries);
    if (refreshInquiriesBtn) refreshInquiriesBtn.addEventListener('click', fetchInquiries);

    // Password Change Form
    if (changePasswordForm) {
      changePasswordForm.addEventListener('submit', handleChangePassword);
    }
  }

  // --- Authentication Check ---
  async function checkAuth() {
    if (!authToken) {
      showAuthScreen();
      return;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const result = await response.json();

      if (result.success && result.admin) {
        adminData = result.admin;
        if (sidebarAdminName) sidebarAdminName.textContent = adminData.username;
        showDashboardScreen();
        await loadDashboardData();
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Auth verification error:', error);
      showAuthScreen();
    }
  }

  function showAuthScreen() {
    authScreen.classList.remove('hidden');
    dashboardScreen.classList.add('hidden');
  }

  function showDashboardScreen() {
    authScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
  }

  // --- Login Handler ---
  async function handleLogin(e) {
    e.preventDefault();
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();

    if (!username || !password) {
      showToast('Please enter both username and password.', 'error');
      return;
    }

    const btnText = loginSubmitBtn.querySelector('.btn-text');
    const btnSpinner = loginSubmitBtn.querySelector('.btn-spinner');
    loginSubmitBtn.disabled = true;
    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (result.success && result.token) {
        authToken = result.token;
        localStorage.setItem('ian_art_admin_token', authToken);
        adminData = result.admin;
        if (sidebarAdminName) sidebarAdminName.textContent = adminData.username;
        showToast('Welcome to Ian Kimemia Art CMS', 'success');
        loginForm.reset();
        showDashboardScreen();
        await loadDashboardData();
      } else {
        showToast(result.message || 'Invalid credentials.', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Network error during authentication.', 'error');
    } finally {
      loginSubmitBtn.disabled = false;
      btnText.classList.remove('hidden');
      btnSpinner.classList.add('hidden');
    }
  }

  // --- Logout Handler ---
  function handleLogout() {
    authToken = null;
    adminData = null;
    localStorage.removeItem('ian_art_admin_token');
    showToast('Logged out successfully.', 'info');
    showAuthScreen();
  }

  // --- Tab Switching ---
  function switchTab(tabId) {
    activeTab = tabId;

    navItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
    });

    tabContents.forEach(tab => {
      tab.classList.toggle('active', tab.id === `tab-${tabId}`);
    });

    const titles = {
      overview: 'Studio Dashboard',
      artworks: 'Artwork Inventory Management',
      inquiries: 'Customer Inquiries & Messages',
      settings: 'Account Settings'
    };
    if (pageTitle) pageTitle.textContent = titles[tabId] || 'Dashboard';

    if (tabId === 'artworks') {
      fetchArtworks();
    } else if (tabId === 'inquiries') {
      fetchInquiries();
    } else if (tabId === 'overview') {
      fetchStats();
    }
  }

  // --- Load Full Dashboard Data ---
  async function loadDashboardData() {
    await Promise.all([
      fetchStats(),
      fetchArtworks(),
      fetchInquiries()
    ]);
  }

  // --- Fetch Statistics (KPIs) ---
  async function fetchStats() {
    try {
      const response = await fetch('/api/stats', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const result = await response.json();

      if (result.success && result.data) {
        const d = result.data;
        if (kpiTotalArtworks) kpiTotalArtworks.textContent = d.totalArtworks;
        if (kpiAvailableArtworks) kpiAvailableArtworks.textContent = d.availableArtworks;
        if (kpiTotalValue) kpiTotalValue.textContent = `KES ${(d.totalInventoryValue || 0).toLocaleString()}`;
        if (kpiAvailableValue) kpiAvailableValue.textContent = `Avail: KES ${(d.availableInventoryValue || 0).toLocaleString()}`;
        if (kpiNewInquiries) kpiNewInquiries.textContent = d.newInquiries;
        if (kpiTotalInquiries) kpiTotalInquiries.textContent = `${d.totalInquiries} total messages`;

        if (countCharcoalKpi) countCharcoalKpi.textContent = `${d.categoriesCount.Charcoal || 0} pieces`;
        if (countPaintsKpi) countPaintsKpi.textContent = `${d.categoriesCount.Paints || 0} pieces`;
        if (countAnimesKpi) countAnimesKpi.textContent = `${d.categoriesCount.Animes || 0} pieces`;

        // Update sidebar badges
        if (sidebarArtworksCount) sidebarArtworksCount.textContent = d.totalArtworks;
        if (sidebarUnreadBadge) {
          sidebarUnreadBadge.textContent = d.newInquiries;
          sidebarUnreadBadge.classList.toggle('hidden', d.newInquiries === 0);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  }

  // --- Fetch Artworks ---
  async function fetchArtworks() {
    try {
      const response = await fetch('/api/artworks');
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        artworksList = result.data;
        renderArtworksTable();
        if (sidebarArtworksCount) sidebarArtworksCount.textContent = artworksList.length;
      }
    } catch (error) {
      console.error('Error fetching artworks:', error);
      showToast('Failed to load artworks inventory.', 'error');
    }
  }

  // --- Render Artworks Table ---
  function renderArtworksTable() {
    if (!artworksTableBody) return;

    let filtered = [...artworksList];

    // Search filter
    const q = (adminArtSearch ? adminArtSearch.value : '').toLowerCase().trim();
    if (q) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.medium && a.medium.toLowerCase().includes(q)) ||
        (a.dimensions && a.dimensions.toLowerCase().includes(q))
      );
    }

    // Category filter
    const cat = adminArtCategoryFilter ? adminArtCategoryFilter.value : 'All';
    if (cat !== 'All') {
      filtered = filtered.filter(a => a.category === cat);
    }

    // Status filter
    const st = adminArtStatusFilter ? adminArtStatusFilter.value : '';
    if (st) {
      filtered = filtered.filter(a => a.status === st);
    }

    if (filtered.length === 0) {
      artworksTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            No artworks match your search criteria.
          </td>
        </tr>
      `;
      return;
    }

    artworksTableBody.innerHTML = filtered.map(art => `
      <tr>
        <td>
          <img src="${escapeHTML(art.image_url)}" alt="${escapeHTML(art.title)}" class="tbl-thumb" onerror="this.src='https://via.placeholder.com/80?text=Art'">
        </td>
        <td>
          <div class="tbl-title-cell">
            <span class="tbl-title">${escapeHTML(art.title)}</span>
            <span class="tbl-desc">${escapeHTML(art.description || 'No description provided')}</span>
          </div>
        </td>
        <td>
          <span class="category-indicator cat-${art.category.toLowerCase()}" style="display:inline-block; vertical-align:middle; margin-right:4px;"></span>
          ${escapeHTML(art.category)}
        </td>
        <td>
          <div>${escapeHTML(art.medium || 'N/A')}</div>
          <small style="color: var(--text-dim);">${escapeHTML(art.dimensions || 'Standard')}</small>
        </td>
        <td>
          <span class="tbl-price">KES ${Number(art.price).toLocaleString()}</span>
        </td>
        <td>
          <span class="status-badge status-${art.status}">${escapeHTML(art.status)}</span>
        </td>
        <td style="text-align: center;">
          ${art.is_featured ? '<i class="fas fa-star featured-star" title="Featured Spotlight"></i>' : '<span style="color:var(--text-dim);">-</span>'}
        </td>
        <td>
          <div class="tbl-actions">
            <button class="btn-icon btn-edit" data-id="${art.id}" title="Edit Artwork">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon btn-delete" data-id="${art.id}" data-title="${escapeHTML(art.title)}" title="Delete Listing">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Attach Edit and Delete buttons
    artworksTableBody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openArtworkModal('edit', id);
      });
    });

    artworksTableBody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const title = btn.getAttribute('data-title');
        openDeleteConfirmationModal(id, title);
      });
    });
  }

  // --- Artwork Modal Form Logic (Create & Edit) ---
  function openArtworkModal(mode = 'create', id = null) {
    artworkForm.reset();
    clearImagePreview();

    // Default to File Upload tab
    if (tabUploadFile) tabUploadFile.click();

    if (mode === 'create') {
      editingArtworkId = null;
      artworkModalTitle.textContent = 'Add New Artwork to Catalog';
      artworkEditId.value = '';
      artCategory.value = 'Charcoal';
      artStatus.value = 'Available';
      artFeatured.checked = false;
    } else {
      editingArtworkId = id;
      artworkModalTitle.textContent = 'Edit Artwork Listing';
      artworkEditId.value = id;

      const art = artworksList.find(a => a.id === Number(id));
      if (art) {
        artTitle.value = art.title;
        artCategory.value = art.category;
        artStatus.value = art.status;
        artPrice.value = art.price;
        artDimensions.value = art.dimensions || '';
        artMedium.value = art.medium || '';
        artDescription.value = art.description || '';
        artFeatured.checked = Boolean(art.is_featured);

        if (art.image_url) {
          updateImagePreview(art.image_url);
          // If URL tab is preferred
          if (art.image_url.startsWith('http')) {
            tabImageUrl.click();
            artImageUrl.value = art.image_url;
          }
        }
      }
    }

    artworkFormModal.classList.add('active');
  }

  function closeArtworkFormModal() {
    artworkFormModal.classList.remove('active');
    editingArtworkId = null;
    artworkForm.reset();
    clearImagePreview();
  }

  // Image Preview Helpers
  function handleFileSelect(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      updateImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  function updateImagePreview(src) {
    if (previewImg && previewPlaceholder) {
      previewImg.src = src;
      previewImg.classList.remove('hidden');
      previewPlaceholder.classList.add('hidden');
    }
  }

  function clearImagePreview() {
    if (previewImg && previewPlaceholder) {
      previewImg.src = '';
      previewImg.classList.add('hidden');
      previewPlaceholder.classList.remove('hidden');
    }
  }

  // --- Submit Artwork (Create or Update) ---
  async function handleArtworkSubmit(e) {
    e.preventDefault();

    const title = artTitle.value.trim();
    const category = artCategory.value;
    const price = artPrice.value;

    if (!title || !category || !price) {
      showToast('Title, category, and price are required.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('status', artStatus.value);
    formData.append('price', price);
    formData.append('dimensions', artDimensions.value.trim());
    formData.append('medium', artMedium.value.trim());
    formData.append('description', artDescription.value.trim());
    formData.append('is_featured', artFeatured.checked ? '1' : '0');

    // Handle Image Source
    if (artImageFile.files && artImageFile.files[0]) {
      formData.append('image', artImageFile.files[0]);
    } else if (artImageUrl.value.trim()) {
      formData.append('image_url', artImageUrl.value.trim());
    } else if (!editingArtworkId) {
      showToast('Please upload an image or provide an image URL.', 'error');
      return;
    }

    const btnText = saveArtworkBtn.querySelector('.btn-text');
    const btnSpinner = saveArtworkBtn.querySelector('.btn-spinner');
    saveArtworkBtn.disabled = true;
    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');

    try {
      const url = editingArtworkId ? `/api/artworks/${editingArtworkId}` : '/api/artworks';
      const method = editingArtworkId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        showToast(result.message || 'Artwork saved successfully!', 'success');
        closeArtworkFormModal();
        await fetchArtworks();
        await fetchStats();
      } else {
        showToast(result.message || 'Failed to save artwork.', 'error');
      }
    } catch (error) {
      console.error('Error saving artwork:', error);
      showToast('Server error while saving artwork.', 'error');
    } finally {
      saveArtworkBtn.disabled = false;
      btnText.classList.remove('hidden');
      btnSpinner.classList.add('hidden');
    }
  }

  // --- Delete Artwork Confirmation ---
  function openDeleteConfirmationModal(id, title) {
    deletingArtworkId = id;
    if (deleteItemTitle) deleteItemTitle.textContent = `"${title}"`;
    deleteModal.classList.add('active');
  }

  function closeDeleteConfirmationModal() {
    deleteModal.classList.remove('active');
    deletingArtworkId = null;
  }

  async function handleConfirmDelete() {
    if (!deletingArtworkId) return;

    confirmDeleteBtn.disabled = true;
    try {
      const response = await fetch(`/api/artworks/${deletingArtworkId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const result = await response.json();

      if (result.success) {
        showToast(result.message || 'Artwork deleted.', 'success');
        closeDeleteConfirmationModal();
        await fetchArtworks();
        await fetchStats();
      } else {
        showToast(result.message || 'Failed to delete artwork.', 'error');
      }
    } catch (error) {
      console.error('Error deleting artwork:', error);
      showToast('Error deleting artwork.', 'error');
    } finally {
      confirmDeleteBtn.disabled = false;
    }
  }

  // --- Fetch Inquiries ---
  async function fetchInquiries() {
    try {
      const status = adminInquiryStatusFilter ? adminInquiryStatusFilter.value : 'all';
      const response = await fetch(`/api/inquiries?status=${status}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        inquiriesList = result.data;
        renderInquiriesList();
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      showToast('Failed to load inquiries.', 'error');
    }
  }

  // --- Render Inquiries Cards ---
  function renderInquiriesList() {
    if (!inquiriesListContainer) return;

    if (inquiriesList.length === 0) {
      inquiriesListContainer.innerHTML = `
        <div class="dashboard-panel" style="text-align: center; padding: 3rem; color: var(--text-muted);">
          <i class="fas fa-envelope-open" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--text-dim); display: block;"></i>
          <h3>No customer messages found</h3>
          <p>Messages submitted through the website contact form will appear here.</p>
        </div>
      `;
      return;
    }

    inquiriesListContainer.innerHTML = inquiriesList.map(inq => {
      const dateStr = new Date(inq.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const emailSubject = encodeURIComponent(`Re: ${inq.subject} - Ian Kimemia Art Studio`);
      const emailBody = encodeURIComponent(`Hi ${inq.name},\n\nThank you for reaching out regarding your art inquiry.\n\nBest regards,\nIan Kimemia\nFine Artist | Kutus, Kirinyaga\n+254 742916132`);
      const mailtoUrl = `mailto:${inq.email}?subject=${emailSubject}&body=${emailBody}`;

      // Clean phone number for WhatsApp
      let cleanPhone = (inq.phone || '').replace(/[^0-9]/g, '');
      if (cleanPhone.startsWith('07')) cleanPhone = '254' + cleanPhone.slice(1);
      if (cleanPhone.startsWith('01')) cleanPhone = '254' + cleanPhone.slice(1);
      const waMsg = encodeURIComponent(`Hello ${inq.name}, this is Ian Kimemia following up on your art inquiry on my website.`);
      const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${waMsg}` : null;

      return `
        <div class="inquiry-card status-${inq.status}">
          <div class="inquiry-header">
            <div class="inquiry-sender">
              <span class="inquiry-name">${escapeHTML(inq.name)}</span>
              <div class="inquiry-meta">
                <span><i class="fas fa-envelope"></i> <a href="mailto:${escapeHTML(inq.email)}">${escapeHTML(inq.email)}</a></span>
                ${inq.phone ? `<span><i class="fas fa-phone-alt"></i> <a href="tel:${escapeHTML(inq.phone)}">${escapeHTML(inq.phone)}</a></span>` : ''}
                <span><i class="fas fa-clock"></i> ${dateStr}</span>
              </div>
            </div>

            <div class="inquiry-status-selector">
              <select class="inquiry-status-change" data-id="${inq.id}">
                <option value="new" ${inq.status === 'new' ? 'selected' : ''}>New / Unread</option>
                <option value="read" ${inq.status === 'read' ? 'selected' : ''}>Marked as Read</option>
                <option value="replied" ${inq.status === 'replied' ? 'selected' : ''}>Replied</option>
              </select>
            </div>
          </div>

          ${inq.artwork_title ? `
            <div class="inquiry-art-tag">
              <i class="fas fa-palette"></i> Interested in: <strong>"${escapeHTML(inq.artwork_title)}"</strong>
            </div>
          ` : ''}

          <div class="inquiry-subject">${escapeHTML(inq.subject)}</div>
          <div class="inquiry-message">${escapeHTML(inq.message)}</div>

          <div class="inquiry-actions">
            <div class="inquiry-reply-btns">
              <a href="${mailtoUrl}" class="btn btn-outline btn-sm" title="Reply via Email Client">
                <i class="fas fa-reply"></i> Reply by Email
              </a>
              ${waUrl ? `
                <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp-sm btn-sm" title="Reply on WhatsApp">
                  <i class="fab fa-whatsapp"></i> Chat on WhatsApp
                </a>
              ` : ''}
            </div>

            <button class="btn-icon btn-delete-inquiry" data-id="${inq.id}" title="Delete Message">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach status change events
    inquiriesListContainer.querySelectorAll('.inquiry-status-change').forEach(select => {
      select.addEventListener('change', async (e) => {
        const id = select.getAttribute('data-id');
        const newStatus = e.target.value;
        await updateInquiryStatus(id, newStatus);
      });
    });

    // Attach delete inquiry events
    inquiriesListContainer.querySelectorAll('.btn-delete-inquiry').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Delete this inquiry permanently?')) {
          await deleteInquiry(id);
        }
      });
    });
  }

  // --- Update Inquiry Status ---
  async function updateInquiryStatus(id, status) {
    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ status })
      });

      const result = await response.json();
      if (result.success) {
        showToast(`Inquiry marked as ${status}.`, 'info');
        await fetchStats();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update status.', 'error');
    }
  }

  // --- Delete Inquiry ---
  async function deleteInquiry(id) {
    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const result = await response.json();
      if (result.success) {
        showToast('Inquiry deleted.', 'success');
        await fetchInquiries();
        await fetchStats();
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      showToast('Failed to delete inquiry.', 'error');
    }
  }

  // --- Account Settings: Password Change ---
  async function handleChangePassword(e) {
    e.preventDefault();
    const current = currPassword.value.trim();
    const newPwd = newPassword.value.trim();

    if (!current || !newPwd) {
      showToast('Both current and new password are required.', 'error');
      return;
    }

    if (newPwd.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          currentPassword: current,
          newPassword: newPwd
        })
      });

      const result = await response.json();
      if (result.success) {
        showToast('Password updated successfully!', 'success');
        changePasswordForm.reset();
      } else {
        showToast(result.message || 'Failed to update password.', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showToast('Network error while updating password.', 'error');
    }
  }

  // --- Utility Functions ---
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
    const container = document.getElementById('adminToastContainer');
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
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
});
