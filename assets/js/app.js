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

  // Automatic Native 3-File StyleSheet Palette Parser
  function initCoolorsPaletteEngine() {
    try {
      let lightVals = [];
      let darkVals = [];

      for (let sheet of document.styleSheets) {
        try {
          if (sheet.href && sheet.href.includes('light.css')) {
            const rules = sheet.cssRules || sheet.rules || [];
            for (let rule of rules) {
              const text = rule.cssText || '';
              const matches = text.match(/(#[0-9a-fA-F]{3,8}|hsla?\([^)]+\))/g) || [];
              lightVals = [...new Set(matches.map(m => m.length === 9 ? m.substring(0, 7) : m))].slice(0, 3);
            }
          }
          if (sheet.href && sheet.href.includes('dark.css')) {
            const rules = sheet.cssRules || sheet.rules || [];
            for (let rule of rules) {
              const text = rule.cssText || '';
              const matches = text.match(/(#[0-9a-fA-F]{3,8}|hsla?\([^)]+\))/g) || [];
              darkVals = [...new Set(matches.map(m => m.length === 9 ? m.substring(0, 7) : m))].slice(0, 3);
            }
          }
        } catch (e) {
          // Ignore cross-domain sheets
        }
      }

      const root = document.documentElement;

      if (lightVals.length >= 3) {
        const [l1, l2, l3] = lightVals;
        root.style.setProperty('--c1', l1);
        root.style.setProperty('--c2', l2);
        root.style.setProperty('--c3', l3);
      }

      if (darkVals.length >= 3) {
        const [d1, d2, d3] = darkVals;
        root.style.setProperty('--dark-c1', d1);
        root.style.setProperty('--dark-c2', d2);
        root.style.setProperty('--dark-c3', d3);
      }
    } catch (err) {
      console.warn('StyleSheet palette parsing note:', err);
    }
  }

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }

  // Tab Navigation (Ignores external links)
  const navLinks = document.querySelectorAll('.nav-link:not(.nav-external)');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetTab = link.getAttribute('data-tab');
      
      navLinks.forEach(n => n.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      link.classList.add('active');
      const targetPane = document.getElementById(`tab-${targetTab}`);
      if (targetPane) targetPane.classList.add('active');
      if (navMenu) navMenu.classList.remove('open');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Dynamic Data Loading Engine
  async function loadData() {
    try {
      initCoolorsPaletteEngine();

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
    
    const cvBtn = document.getElementById('cvDownloadBtn');
    if (cvBtn) cvBtn.href = profileData.cv_pdf || '#';

    // Avatar / Profile Picture rendering
    const avatarWrapper = document.getElementById('heroAvatarWrapper');
    if (avatarWrapper && profileData.avatar) {
      const img = new Image();
      img.src = profileData.avatar;
      img.onload = () => {
        avatarWrapper.innerHTML = `<img src="${profileData.avatar}" alt="${profileData.name}" class="hero-avatar-img">`;
      };
    }

    // Contact info
    document.getElementById('contactEmail').textContent = profileData.contact.email;
    document.getElementById('contactOffice').textContent = `${profileData.contact.office}, ${profileData.department}`;
    document.getElementById('contactAddress').textContent = profileData.contact.address;

    // Affiliation Link Pills
    const affContainer = document.getElementById('affiliationBadges');
    if (affContainer && profileData.affiliations) {
      affContainer.innerHTML = profileData.affiliations.map(aff => `
        <a href="${aff.url}" target="_blank" rel="noopener" class="affiliation-link-badge">
          <i class="fa-solid fa-graduation-cap"></i> ${aff.name} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.7em;"></i>
        </a>
      `).join('');
    }

    // Research Summary Line
    const researchLine = document.getElementById('researchSummaryLine');
    if (researchLine && profileData.research_fields) {
      researchLine.textContent = `Researcher in Economics interested in ${profileData.research_fields.join(', ')}.`;
    }

    // Social Links (Official Bluesky Butterfly SVG & Strava SVG icons)
    const socialLinks = document.getElementById('socialLinks');
    if (socialLinks) {
      socialLinks.innerHTML = '';
      
      const socialMap = [
        { 
          key: 'bluesky', 
          title: 'Bluesky', 
          svg: `<svg viewBox="0 0 16 16" width="17" height="17" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3.468 1.948C5.303 3.325 7.276 6.118 8 7.616c.725-1.498 2.698-4.29 4.532-5.668C13.855.955 16 .186 16 2.632c0 .489-.28 4.105-.444 4.692-.572 2.04-2.653 2.561-4.504 2.246 3.236.551 4.06 2.375 2.281 4.2-3.376 3.464-4.852-.87-5.23-1.98-.07-.204-.103-.3-.103-.218 0-.081-.033.014-.102.218-.379 1.11-1.855 5.444-5.231 1.98-1.778-1.825-.955-3.65 2.28-4.2-1.85.315-3.932-.205-4.503-2.246C.28 6.737 0 3.12 0 2.632 0 .186 2.145.955 3.468 1.948"/></svg>` 
        },
        { key: 'github', title: 'GitHub', icon: 'fa-brands fa-github' },
        { key: 'linkedin', title: 'LinkedIn', icon: 'fa-brands fa-linkedin' },
        { 
          key: 'strava', 
          title: 'Strava', 
          svg: `<svg role="img" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.924 15.65h4.172"/></svg>` 
        }
      ];

      socialMap.forEach(item => {
        if (profileData.social && profileData.social[item.key]) {
          const a = document.createElement('a');
          a.className = 'social-btn';
          a.href = profileData.social[item.key];
          a.target = '_blank';
          a.title = item.title;
          if (item.svg) {
            a.innerHTML = item.svg;
          } else {
            a.innerHTML = `<i class="${item.icon}"></i>`;
          }
          socialLinks.appendChild(a);
        }
      });
    }
  }

  // Render Research Publications
  function renderPublications(papers, filterType = 'all', searchQuery = '') {
    const container = document.getElementById('papersListContainer');
    if (!container) return;
    container.innerHTML = '';

    const filtered = papers.filter(paper => {
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

  // Render CV Section
  function renderCV() {
    // Appointments & Positions
    const appContainer = document.getElementById('cvAppointments');
    if (appContainer) {
      appContainer.innerHTML = (cvData.appointments || []).map(item => `
        <div class="timeline-item">
          <div class="timeline-period">${item.period}</div>
          <div class="timeline-title">${item.role}</div>
          <div class="timeline-institution">${item.institution} — ${item.location}</div>
        </div>
      `).join('');
    }

    // Education
    const eduContainer = document.getElementById('cvEducation');
    if (eduContainer) {
      eduContainer.innerHTML = (cvData.education || []).map(item => `
        <div class="timeline-item">
          <div class="timeline-period">${item.year}</div>
          <div class="timeline-title">${item.degree}</div>
          <div class="timeline-institution">${item.institution}</div>
          ${item.details ? `<div style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">${item.details}</div>` : ''}
        </div>
      `).join('');
    }

    // Presentations
    const presContainer = document.getElementById('cvPresentations');
    if (presContainer) {
      presContainer.innerHTML = (cvData.presentations || []).map(group => `
        <div style="margin-bottom:0.85rem;">
          <strong style="color:var(--text-secondary);">${group.year}</strong>
          <ul style="margin-left:1.2rem; margin-top:0.25rem; font-size:0.9rem; color:var(--text-primary);">
            ${group.items.map(i => `<li>${i}</li>`).join('')}
          </ul>
        </div>
      `).join('');
    }
    // Skills & Languages
    const skillsContainer = document.getElementById('cvSkills');
    if (skillsContainer && cvData.skills_and_languages) {
      const prog = (cvData.skills_and_languages.programming || []).map(s => `<span class="tag-item"><i class="fa-solid fa-code"></i> ${s}</span>`).join('');
      const lang = (cvData.skills_and_languages.languages || []).map(l => `<span class="tag-item"><i class="fa-solid fa-language"></i> ${l}</span>`).join('');
      skillsContainer.innerHTML = `<div style="display:flex; flex-wrap:wrap; gap:0.5rem;">${prog}${lang}</div>`;
    }

    // Awards
    const awardContainer = document.getElementById('cvAwards');
    if (awardContainer) {
      awardContainer.innerHTML = (cvData.awards || []).map(award => `
        <div style="margin-bottom:0.65rem;">
          <strong style="color:var(--text-primary);">${award.title}</strong> (${award.year})
          <div style="font-size:0.85rem; color:var(--text-muted);">${award.organization}</div>
        </div>
      `).join('');
    }
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

  const searchInput = document.getElementById('paperSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderPublications(publicationsData, currentFilter, e.target.value);
    });
  }

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

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  if (copyBtn) {
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
  }

  // Initialize
  loadData();
});
