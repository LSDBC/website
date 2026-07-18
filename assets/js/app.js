// Main Application Script for Academic Website
document.addEventListener('DOMContentLoaded', () => {
  let profileData = {};
  let publicationsData = [];
  let cvData = {};

  // Theme Toggle Management
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    themeToggleBtn.innerHTML = theme === 'dark' 
      ? '<i class="fa-solid fa-sun"></i>' 
      : '<i class="fa-solid fa-moon"></i>';
  }

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });

  // Tab Navigation
  const navLinks = document.querySelectorAll('.nav-link');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetTab = link.getAttribute('data-tab');
      
      navLinks.forEach(n => n.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      link.classList.add('active');
      document.getElementById(`tab-${targetTab}`).classList.add('active');
      navMenu.classList.remove('open');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Dynamic Data Loading Engine
  async function loadData() {
    try {
      const [profileRes, pubRes, cvRes] = await Promise.all([
        fetch('data/profile.json'),
        fetch('data/publications.json'),
        fetch('data/cv.json')
      ]);

      profileData = await profileRes.json();
      publicationsData = await pubRes.json();
      cvData = await cvRes.json();

      renderProfile();
      renderPublications(publicationsData);
      renderPolicyNotes(publicationsData);
      renderCV();
      document.getElementById('currentYear').textContent = new Date().getFullYear();
    } catch (err) {
      console.error('Failed to load JSON datasets:', err);
    }
  }

  // Render Profile Section
  function renderProfile() {
    document.getElementById('brandName').textContent = profileData.name;
    document.getElementById('heroName').textContent = profileData.name;
    document.getElementById('heroRole').textContent = `${profileData.title} @ ${profileData.institution}`;
    document.getElementById('heroLocation').textContent = profileData.location;
    document.getElementById('footerAuthor').textContent = profileData.name;
    document.getElementById('bioText').textContent = profileData.bio;
    document.getElementById('cvDownloadBtn').href = profileData.cv_pdf || '#';

    // Contact info
    document.getElementById('contactEmail').textContent = profileData.contact.email;
    document.getElementById('contactOffice').textContent = `${profileData.contact.office}, ${profileData.department}`;
    document.getElementById('contactAddress').textContent = profileData.contact.address;

    // Research Field Badges
    const fieldBadges = document.getElementById('fieldBadges');
    const primaryFieldsList = document.getElementById('primaryFieldsList');
    fieldBadges.innerHTML = '';
    primaryFieldsList.innerHTML = '';

    profileData.research_fields.forEach(field => {
      const badge = document.createElement('span');
      badge.className = 'badge-tag';
      badge.textContent = field;
      fieldBadges.appendChild(badge);

      const li = document.createElement('li');
      li.textContent = field;
      primaryFieldsList.appendChild(li);
    });

    // Social Links
    const socialLinks = document.getElementById('socialLinks');
    socialLinks.innerHTML = '';
    const map = [
      { key: 'google_scholar', icon: 'fa-graduation-cap', title: 'Google Scholar' },
      { key: 'orcid', icon: 'fa-id-card', title: 'ORCID' },
      { key: 'github', icon: 'fa-brands fa-github', title: 'GitHub' },
      { key: 'linkedin', icon: 'fa-brands fa-linkedin', title: 'LinkedIn' },
      { key: 'twitter', icon: 'fa-brands fa-x-twitter', title: 'Twitter' }
    ];

    map.forEach(item => {
      if (profileData.social[item.key]) {
        const a = document.createElement('a');
        a.className = 'social-btn';
        a.href = profileData.social[item.key];
        a.target = '_blank';
        a.title = item.title;
        a.innerHTML = `<i class="${item.icon}"></i>`;
        socialLinks.appendChild(a);
      }
    });
  }

  // Render Research Publications
  function renderPublications(papers, filterType = 'all', searchQuery = '') {
    const container = document.getElementById('papersListContainer');
    container.innerHTML = '';

    const academicPapers = papers.filter(p => p.type === 'working_paper' || p.type === 'published');

    const filtered = academicPapers.filter(paper => {
      const matchesType = (filterType === 'all') || (paper.type === filterType);
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || 
        paper.title.toLowerCase().includes(query) ||
        paper.authors.some(a => a.toLowerCase().includes(query)) ||
        paper.abstract.toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<p class="text-muted" style="padding:1.5rem; text-align:center;">No research papers found matching criteria.</p>`;
      return;
    }

    filtered.forEach(paper => {
      const card = document.createElement('div');
      card.className = 'paper-card';

      const statusBadge = paper.type === 'published' 
        ? `<span class="paper-type-badge published">Published</span>`
        : `<span class="paper-type-badge working_paper">Working Paper</span>`;

      const jelTags = (paper.jel || []).map(j => `<span class="jel-tag">${j}</span>`).join('');
      const journalText = paper.journal 
        ? `${paper.journal} (${paper.year})` 
        : (paper.status || `Working Paper ${paper.year}`);

      card.innerHTML = `
        <div class="paper-header">
          <div class="paper-title">${paper.title}</div>
          ${statusBadge}
        </div>
        <div class="paper-authors">${paper.authors.join(', ')}</div>
        <div class="paper-journal">${journalText}</div>
        <div class="paper-abstract">${paper.abstract}</div>
        <div class="paper-footer">
          <div class="paper-jel">${jelTags}</div>
          <div class="paper-actions">
            ${paper.pdf ? `<a href="${paper.pdf}" class="btn btn-outline btn-sm" target="_blank"><i class="fa-solid fa-file-pdf"></i> PDF</a>` : ''}
            ${paper.code_repo ? `<a href="${paper.code_repo}" class="btn btn-outline btn-sm" target="_blank"><i class="fa-brands fa-github"></i> Code</a>` : ''}
            ${paper.bibtex ? `<button class="btn btn-outline btn-sm bibtex-btn" data-id="${paper.id}"><i class="fa-solid fa-quote-right"></i> BibTeX</button>` : ''}
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    // Attach BibTeX Click Listeners
    document.querySelectorAll('.bibtex-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const p = publicationsData.find(x => x.id === id);
        if (p && p.bibtex) {
          openBibtexModal(p.bibtex);
        }
      });
    });
  }

  // Render Policy Notes
  function renderPolicyNotes(papers) {
    const container = document.getElementById('policyListContainer');
    container.innerHTML = '';

    const policyNotes = papers.filter(p => p.type === 'policy_note');

    policyNotes.forEach(paper => {
      const card = document.createElement('div');
      card.className = 'paper-card';
      card.innerHTML = `
        <div class="paper-header">
          <div class="paper-title">${paper.title}</div>
          <span class="paper-type-badge working_paper">${paper.status || 'Policy Brief'}</span>
        </div>
        <div class="paper-authors">${paper.authors.join(', ')}</div>
        <div class="paper-abstract">${paper.abstract}</div>
        <div class="paper-footer">
          <div class="paper-jel">${(paper.jel || []).map(j => `<span class="jel-tag">${j}</span>`).join('')}</div>
          <div class="paper-actions">
            ${paper.pdf ? `<a href="${paper.pdf}" class="btn btn-outline btn-sm" target="_blank"><i class="fa-solid fa-file-pdf"></i> Download Brief</a>` : ''}
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Render CV Section
  function renderCV() {
    // Appointments
    const appContainer = document.getElementById('cvAppointments');
    appContainer.innerHTML = (cvData.appointments || []).map(item => `
      <div class="timeline-item">
        <div class="timeline-period">${item.period}</div>
        <div class="timeline-title">${item.role}</div>
        <div class="timeline-institution">${item.institution} — ${item.location}</div>
      </div>
    `).join('');

    // Education
    const eduContainer = document.getElementById('cvEducation');
    eduContainer.innerHTML = (cvData.education || []).map(item => `
      <div class="timeline-item">
        <div class="timeline-period">${item.year}</div>
        <div class="timeline-title">${item.degree}</div>
        <div class="timeline-institution">${item.institution}</div>
        ${item.details ? `<div style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">${item.details}</div>` : ''}
      </div>
    `).join('');

    // Presentations
    const presContainer = document.getElementById('cvPresentations');
    presContainer.innerHTML = (cvData.presentations || []).map(group => `
      <div style="margin-bottom:0.85rem;">
        <strong style="color:var(--accent-secondary);">${group.year}</strong>
        <ul style="margin-left:1.2rem; margin-top:0.25rem; font-size:0.9rem; color:var(--text-secondary);">
          ${group.items.map(i => `<li>${i}</li>`).join('')}
        </ul>
      </div>
    `).join('');

    // Refereeing
    const refContainer = document.getElementById('cvReferee');
    refContainer.innerHTML = (cvData.referee_service || []).map(ref => `
      <span class="tag-item">${ref}</span>
    `).join('');

    // Awards
    const awardContainer = document.getElementById('cvAwards');
    awardContainer.innerHTML = (cvData.awards || []).map(award => `
      <div style="margin-bottom:0.65rem;">
        <strong>${award.title}</strong> (${award.year})
        <div style="font-size:0.85rem; color:var(--text-muted);">${award.organization}</div>
      </div>
    `).join('');
  }

  // Filter Buttons & Search Listeners
  const filterBtns = document.querySelectorAll('.filter-btn');
  let currentFilter = 'all';

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      const searchQuery = document.getElementById('paperSearchInput').value;
      renderPublications(publicationsData, currentFilter, searchQuery);
    });
  });

  document.getElementById('paperSearchInput').addEventListener('input', (e) => {
    renderPublications(publicationsData, currentFilter, e.target.value);
  });

  // Modal Functionality
  const modal = document.getElementById('bibtexModal');
  const bibtexCode = document.getElementById('bibtexCode');
  const closeBtn = document.getElementById('closeBibtexModal');
  const copyBtn = document.getElementById('copyBibtexBtn');

  function openBibtexModal(code) {
    bibtexCode.textContent = code;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  });

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(bibtexCode.textContent);
      copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy to Clipboard';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  });

  // Initialize
  loadData();
});
