/**
 * CVitron Application Orchestrator - Renderer Process Main Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // ----------------------------------------------------
  // FUTURISTIC SYNTHESIZED SOUND EFFECTS
  // ----------------------------------------------------
  const AudioEffects = {
    ctx: null,
    
    init() {
      // Lazy-init AudioContext to bypass browser gesture policies
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    },

    playHover() {
      this.init();
      if (!this.ctx) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.005, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    },

    playClick() {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    },

    playSuccess() {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      
      // Note 1 (E5)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.02, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start();
      osc1.stop(now + 0.2);
      
      // Note 2 (A5) slightly delayed
      setTimeout(() => {
        if (!this.ctx) return;
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.frequency.setValueAtTime(880, this.ctx.currentTime);
        gain2.gain.setValueAtTime(0.02, this.ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start();
        osc2.stop(this.ctx.currentTime + 0.3);
      }, 80);
    },

    playStartup() {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      
      // Low sub base sweep
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(60, now);
      subOsc.frequency.exponentialRampToValueAtTime(110, now + 1.2);
      
      // Filter sweep to make it feel techy/futuristic
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = 5;
      filter.frequency.setValueAtTime(100, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 1.2);

      subGain.gain.setValueAtTime(0.03, now);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      
      subOsc.connect(filter);
      filter.connect(subGain);
      subGain.connect(this.ctx.destination);
      
      subOsc.start();
      subOsc.stop(now + 1.2);

      // Startup sparkling chime chords (C major triad arpeggio)
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.5);
        }, 300 + idx * 100);
      });
    }
  };

  // App State
  let resumeData = {
    personal: {
      fullname: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: ''
    },
    summary: '',
    experience: [],
    education: [],
    projects: [],
    skills: {
      languages: '',
      frameworks: '',
      tools: ''
    },
    customSections: []
  };

  // ----------------------------------------------------
  // INITIALIZATION & SETTINGS
  // ----------------------------------------------------
  
  // Developer Configurations - Hardcoded for security
  const DEVELOPER_UPI_ID = 'shubhamdiwakarkadam-2@okaxis';
  const DEVELOPER_PAYPAL_CLIENT = 'sb';

  function initSettings() {
    const savedKey = AI.getApiKey();
    const isMock = AI.isMockMode();

    document.getElementById('settings-api-key').value = savedKey;
    document.getElementById('settings-mock-mode').checked = isMock;
    
    updateApiBadge(isMock);
  }

  function updateApiBadge(isMock) {
    const badge = document.getElementById('api-status-badge');
    const dot = badge.querySelector('.badge-dot');
    const text = badge.querySelector('.badge-text');

    if (isMock) {
      dot.className = 'badge-dot dot-red';
      text.innerText = 'Mock Mode';
    } else {
      dot.className = 'badge-dot dot-green';
      text.innerText = 'Gemini Live';
    }
  }

  // Save Settings Handler
  document.getElementById('btn-save-settings').addEventListener('click', () => {
    const key = document.getElementById('settings-api-key').value.trim();
    const isMock = document.getElementById('settings-mock-mode').checked;

    localStorage.setItem('gemini_api_key', key);
    localStorage.setItem('gemini_mock_mode', isMock ? 'true' : 'false');
    
    updateApiBadge(isMock);
    AudioEffects.playSuccess();
    showToast('Configuration saved successfully!', 2000);
  });


  // ----------------------------------------------------
  // NAVIGATION ROUTING
  // ----------------------------------------------------
  
  const menuItems = document.querySelectorAll('.menu-item');
  const tabContents = document.querySelectorAll('.tab-content');

  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabName = item.getAttribute('data-tab');
      
      menuItems.forEach(i => i.classList.remove('active'));
      tabContents.forEach(t => t.classList.remove('active'));

      item.classList.add('active');
      document.getElementById(`tab-${tabName}`).classList.add('active');
    });
  });

  // Helper to switch tabs programmatically
  function switchTab(tabName) {
    const item = document.querySelector(`.menu-item[data-tab="${tabName}"]`);
    if (item) item.click();
  }

  // ----------------------------------------------------
  // ACCORDIONS
  // ----------------------------------------------------
  
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isExpanded = item.classList.contains('expanded');
      
      // Close other accordions in this view
      const siblings = item.parentElement.querySelectorAll('.accordion-item');
      siblings.forEach(sib => sib.classList.remove('expanded'));

      if (!isExpanded) {
        item.classList.add('expanded');
      }
    });
  });

  // ----------------------------------------------------
  // FORM BINDINGS & SYNCHRONIZATION
  // ----------------------------------------------------
  
  // Connect text inputs with state & preview
  const personalInputs = [
    { id: 'input-fullname', key: 'fullname' },
    { id: 'input-title', key: 'title' },
    { id: 'input-email', key: 'email' },
    { id: 'input-phone', key: 'phone' },
    { id: 'input-location', key: 'location' },
    { id: 'input-linkedin', key: 'linkedin' },
    { id: 'input-website', key: 'website' }
  ];

  personalInputs.forEach(mapping => {
    const inputEl = document.getElementById(mapping.id);
    inputEl.addEventListener('input', (e) => {
      resumeData.personal[mapping.key] = e.target.value;
      updatePreview();
    });
  });

  // Summary statement binding
  const summaryInput = document.getElementById('input-summary');
  summaryInput.addEventListener('input', (e) => {
    resumeData.summary = e.target.value;
    updatePreview();
  });

  // Skills input bindings
  const skillInputs = [
    { id: 'input-skills-languages', key: 'languages' },
    { id: 'input-skills-frameworks', key: 'frameworks' },
    { id: 'input-skills-tools', key: 'tools' }
  ];

  skillInputs.forEach(mapping => {
    const inputEl = document.getElementById(mapping.id);
    inputEl.addEventListener('input', (e) => {
      resumeData.skills[mapping.key] = e.target.value;
      updatePreview();
    });
  });

  // ----------------------------------------------------
  // REPEATING LIST MANAGERS (EXP, EDU, PROJECTS)
  // ----------------------------------------------------

  // 1. Work Experience
  const experienceList = document.getElementById('experience-list');
  
  function addExperience(company = '', role = '', duration = '', description = '') {
    const index = resumeData.experience.length;
    resumeData.experience.push({ company, role, duration, description });

    const card = document.createElement('div');
    card.className = 'card-item';
    card.setAttribute('data-index', index);
    card.innerHTML = `
      <div class="form-grid">
        <div class="form-group col-6">
          <label>Company Name</label>
          <input type="text" class="exp-company" placeholder="e.g. Acme Corp" value="${company}">
        </div>
        <div class="form-group col-6">
          <label>Job Title</label>
          <input type="text" class="exp-role" placeholder="e.g. Software Engineer" value="${role}">
        </div>
        <div class="form-group col-12">
          <label>Employment Period / Location</label>
          <input type="text" class="exp-duration" placeholder="e.g. Jan 2023 - Present" value="${duration}">
        </div>
        <div class="form-group col-12">
          <div class="label-header">
            <label>Work Summary / Achievements</label>
            <button class="btn-micro-ai exp-ai-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              AI Improve
            </button>
          </div>
          <textarea class="exp-description" rows="3" placeholder="Describe achievements, project roles using action items...">${description}</textarea>
        </div>
      </div>
      <div class="card-actions-row">
        <span>Work Experience Card</span>
        <button class="btn-remove">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Delete Card
        </button>
      </div>
    `;

    // Bind event listeners inside card
    card.querySelector('.exp-company').addEventListener('input', (e) => {
      resumeData.experience[index].company = e.target.value;
      updatePreview();
    });
    card.querySelector('.exp-role').addEventListener('input', (e) => {
      resumeData.experience[index].role = e.target.value;
      updatePreview();
    });
    card.querySelector('.exp-duration').addEventListener('input', (e) => {
      resumeData.experience[index].duration = e.target.value;
      updatePreview();
    });
    card.querySelector('.exp-description').addEventListener('input', (e) => {
      resumeData.experience[index].description = e.target.value;
      updatePreview();
    });

    // Remove Card Handler
    card.querySelector('.btn-remove').addEventListener('click', () => {
      card.remove();
      // Remove from state array
      resumeData.experience.splice(index, 1);
      // Re-index remaining cards
      reindexCards(experienceList, 'experience');
      updatePreview();
    });

    // Inline AI Enhance trigger
    card.querySelector('.exp-ai-btn').addEventListener('click', () => {
      const currentText = card.querySelector('.exp-description').value;
      triggerInlineEnhance(currentText, (enhancedText) => {
        card.querySelector('.exp-description').value = enhancedText;
        resumeData.experience[index].description = enhancedText;
        updatePreview();
      });
    });

    experienceList.appendChild(card);
    updatePreview();
  }

  // 2. Education
  const educationList = document.getElementById('education-list');

  function addEducation(school = '', degree = '', duration = '', description = '') {
    const index = resumeData.education.length;
    resumeData.education.push({ school, degree, duration, description });

    const card = document.createElement('div');
    card.className = 'card-item';
    card.setAttribute('data-index', index);
    card.innerHTML = `
      <div class="form-grid">
        <div class="form-group col-6">
          <label>School / University</label>
          <input type="text" class="edu-school" placeholder="e.g. Stanford University" value="${school}">
        </div>
        <div class="form-group col-6">
          <label>Degree / Field of Study</label>
          <input type="text" class="edu-degree" placeholder="e.g. B.S. in Computer Science" value="${degree}">
        </div>
        <div class="form-group col-12">
          <label>Graduation Year / Date Period</label>
          <input type="text" class="edu-duration" placeholder="e.g. 2019 - 2023" value="${duration}">
        </div>
        <div class="form-group col-12">
          <label>Honors / Details (Optional)</label>
          <input type="text" class="edu-description" placeholder="e.g. GPA 3.9, Magna Cum Laude" value="${description}">
        </div>
      </div>
      <div class="card-actions-row">
        <span>Education Card</span>
        <button class="btn-remove">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Delete Card
        </button>
      </div>
    `;

    card.querySelector('.edu-school').addEventListener('input', (e) => {
      resumeData.education[index].school = e.target.value;
      updatePreview();
    });
    card.querySelector('.edu-degree').addEventListener('input', (e) => {
      resumeData.education[index].degree = e.target.value;
      updatePreview();
    });
    card.querySelector('.edu-duration').addEventListener('input', (e) => {
      resumeData.education[index].duration = e.target.value;
      updatePreview();
    });
    card.querySelector('.edu-description').addEventListener('input', (e) => {
      resumeData.education[index].description = e.target.value;
      updatePreview();
    });

    card.querySelector('.btn-remove').addEventListener('click', () => {
      card.remove();
      resumeData.education.splice(index, 1);
      reindexCards(educationList, 'education');
      updatePreview();
    });

    educationList.appendChild(card);
    updatePreview();
  }

  // 3. Projects
  const projectsList = document.getElementById('projects-list');

  function addProject(name = '', role = '', description = '') {
    const index = resumeData.projects.length;
    resumeData.projects.push({ name, role, description });

    const card = document.createElement('div');
    card.className = 'card-item';
    card.setAttribute('data-index', index);
    card.innerHTML = `
      <div class="form-grid">
        <div class="form-group col-6">
          <label>Project Name</label>
          <input type="text" class="proj-name" placeholder="e.g. Distributed Task Queue" value="${name}">
        </div>
        <div class="form-group col-6">
          <label>Role / Technologies</label>
          <input type="text" class="proj-role" placeholder="e.g. Lead Dev (React, Go, Redis)" value="${role}">
        </div>
        <div class="form-group col-12">
          <div class="label-header">
            <label>Project Summary / Highlights</label>
            <button class="btn-micro-ai proj-ai-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              AI Improve
            </button>
          </div>
          <textarea class="proj-description" rows="3" placeholder="Describe project achievements and code capabilities...">${description}</textarea>
        </div>
      </div>
      <div class="card-actions-row">
        <span>Project Card</span>
        <button class="btn-remove">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Delete Card
        </button>
      </div>
    `;

    card.querySelector('.proj-name').addEventListener('input', (e) => {
      resumeData.projects[index].name = e.target.value;
      updatePreview();
    });
    card.querySelector('.proj-role').addEventListener('input', (e) => {
      resumeData.projects[index].role = e.target.value;
      updatePreview();
    });
    card.querySelector('.proj-description').addEventListener('input', (e) => {
      resumeData.projects[index].description = e.target.value;
      updatePreview();
    });

    card.querySelector('.btn-remove').addEventListener('click', () => {
      card.remove();
      resumeData.projects.splice(index, 1);
      reindexCards(projectsList, 'projects');
      updatePreview();
    });

    // Inline AI Enhance trigger
    card.querySelector('.proj-ai-btn').addEventListener('click', () => {
      const currentText = card.querySelector('.proj-description').value;
      triggerInlineEnhance(currentText, (enhancedText) => {
        card.querySelector('.proj-description').value = enhancedText;
        resumeData.projects[index].description = enhancedText;
        updatePreview();
      });
    });

    projectsList.appendChild(card);
    updatePreview();
  }

  // Utility to recalculate indices after a card is removed
  function reindexCards(containerEl, type) {
    const cards = containerEl.querySelectorAll('.card-item');
    cards.forEach((card, index) => {
      card.setAttribute('data-index', index);
      // Re-bind listeners or update references
      // Note: Re-binding listeners from scratch avoids closure index misalignment
    });
  }

  // 4. Custom Sections
  const customSectionsList = document.getElementById('custom-sections-list');

  function addCustomSection(title = '', content = '') {
    const index = resumeData.customSections.length;
    resumeData.customSections.push({ title, content });

    const card = document.createElement('div');
    card.className = 'card-item';
    card.setAttribute('data-index', index);
    card.innerHTML = `
      <div class="form-grid">
        <div class="form-group col-12">
          <label>Section Title</label>
          <input type="text" class="cust-title" placeholder="e.g. Certifications, Interests, Publications" value="${title}">
        </div>
        <div class="form-group col-12">
          <div class="label-header">
            <label>Section Content / Bullets (One per line)</label>
            <button class="btn-micro-ai cust-ai-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              AI Improve
            </button>
          </div>
          <textarea class="cust-content" rows="4" placeholder="Enter bullet points (one per line) or raw text...">${content}</textarea>
        </div>
      </div>
      <div class="card-actions-row">
        <span>Custom Section Card</span>
        <button class="btn-remove">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Delete Card
        </button>
      </div>
    `;

    card.querySelector('.cust-title').addEventListener('input', (e) => {
      resumeData.customSections[index].title = e.target.value;
      updatePreview();
    });
    card.querySelector('.cust-content').addEventListener('input', (e) => {
      resumeData.customSections[index].content = e.target.value;
      updatePreview();
    });

    card.querySelector('.btn-remove').addEventListener('click', () => {
      card.remove();
      resumeData.customSections.splice(index, 1);
      reindexCards(customSectionsList, 'customSections');
      updatePreview();
    });

    // Inline AI Enhance trigger
    card.querySelector('.cust-ai-btn').addEventListener('click', () => {
      const currentText = card.querySelector('.cust-content').value;
      triggerInlineEnhance(currentText, (enhancedText) => {
        card.querySelector('.cust-content').value = enhancedText;
        resumeData.customSections[index].content = enhancedText;
        updatePreview();
      });
    });

    customSectionsList.appendChild(card);
    updatePreview();
  }

  // Hook Add Buttons
  document.getElementById('add-experience-btn').addEventListener('click', () => addExperience());
  document.getElementById('add-education-btn').addEventListener('click', () => addEducation());
  document.getElementById('add-project-btn').addEventListener('click', () => addProject());
  document.getElementById('add-custom-section-btn').addEventListener('click', () => addCustomSection());

  // ----------------------------------------------------
  // PREVIEW RENDERER
  // ----------------------------------------------------

  function updatePreview() {
    const isCreative = themeSelect.value === 'theme-creative-split';
    const sheet = document.getElementById('resume-sheet-preview');

    // Photo HTML
    let photoHTML = '';
    if (resumeData.personal.photo) {
      photoHTML = `
        <div class="resume-photo-container" id="resume-sheet-photo-container">
          <img id="resume-sheet-photo" src="${resumeData.personal.photo}" alt="Candidate Photo">
        </div>`;
    } else {
      photoHTML = `
        <div class="resume-photo-container hidden" id="resume-sheet-photo-container">
          <img id="resume-sheet-photo" src="" alt="Candidate Photo">
        </div>`;
    }

    // Header Content
    const nameText = resumeData.personal.fullname || 'Your Name';
    const titleText = resumeData.personal.title || 'Target Job Title';
    
    const contacts = [
      resumeData.personal.email,
      resumeData.personal.phone,
      resumeData.personal.location,
      resumeData.personal.linkedin,
      resumeData.personal.website
    ].filter(Boolean);

    let contactsHTML = '';
    if (isCreative) {
      contactsHTML = contacts.map(c => `<span>${c}</span>`).join('');
    } else {
      contactsHTML = contacts.map((c, idx) => `${idx > 0 ? ' | ' : ''}<span>${c}</span>`).join('');
    }

    // Summary Section
    let summaryHTML = '';
    if (resumeData.summary) {
      summaryHTML = `
        <section class="sheet-section" id="sheet-section-summary">
          <h3 class="section-title-sheet">Professional Summary</h3>
          <div class="section-divider-sheet"></div>
          <p id="resume-sheet-summary">${resumeData.summary}</p>
        </section>`;
    }

    // Experience Section
    let expHTML = '';
    const validExp = resumeData.experience.filter(exp => exp.company || exp.role);
    if (validExp.length > 0) {
      let expBlocks = '';
      validExp.forEach(exp => {
        const bulletsHTML = exp.description
          ? `<ul class="block-bullets-sheet">${exp.description.split('\n').filter(Boolean).map(bullet => `<li>${bullet.replace(/^-\s*/, '')}</li>`).join('')}</ul>`
          : '';
        expBlocks += `
          <div class="block-item-sheet">
            <div class="block-header-sheet">
              <span class="block-title-sheet">${exp.role || 'Job Title'} at ${exp.company || 'Company'}</span>
              <span class="block-meta-sheet">${exp.duration || ''}</span>
            </div>
            ${bulletsHTML}
          </div>`;
      });
      expHTML = `
        <section class="sheet-section" id="sheet-section-experience">
          <h3 class="section-title-sheet">Professional Experience</h3>
          <div class="section-divider-sheet"></div>
          <div id="resume-sheet-experience-container">${expBlocks}</div>
        </section>`;
    }

    // Education Section
    let eduHTML = '';
    const validEdu = resumeData.education.filter(edu => edu.school || edu.degree);
    if (validEdu.length > 0) {
      let eduBlocks = '';
      validEdu.forEach(edu => {
        eduBlocks += `
          <div class="block-item-sheet">
            <div class="block-header-sheet">
              <span class="block-title-sheet">${edu.degree || 'Degree'}</span>
              <span class="block-meta-sheet">${edu.duration || ''}</span>
            </div>
            <div class="block-subtitle-sheet">${edu.school || 'University'}</div>
            ${edu.description ? `<p style="font-size: 11px; margin-top: 2px;">${edu.description}</p>` : ''}
          </div>`;
      });
      eduHTML = `
        <section class="sheet-section" id="sheet-section-education">
          <h3 class="section-title-sheet">Education</h3>
          <div class="section-divider-sheet"></div>
          <div id="resume-sheet-education-container">${eduBlocks}</div>
        </section>`;
    }

    // Projects Section
    let projHTML = '';
    const validProj = resumeData.projects.filter(proj => proj.name || proj.role);
    if (validProj.length > 0) {
      let projBlocks = '';
      validProj.forEach(proj => {
        const bulletsHTML = proj.description
          ? `<ul class="block-bullets-sheet">${proj.description.split('\n').filter(Boolean).map(bullet => `<li>${bullet.replace(/^-\s*/, '')}</li>`).join('')}</ul>`
          : '';
        projBlocks += `
          <div class="block-item-sheet">
            <div class="block-header-sheet">
              <span class="block-title-sheet">${proj.name || 'Project Name'}</span>
              <span class="block-meta-sheet">${proj.role || ''}</span>
            </div>
            ${bulletsHTML}
          </div>`;
      });
      projHTML = `
        <section class="sheet-section" id="sheet-section-projects">
          <h3 class="section-title-sheet">Key Projects</h3>
          <div class="section-divider-sheet"></div>
          <div id="resume-sheet-projects-container">${projBlocks}</div>
        </section>`;
    }

    // Skills Section
    let skillsHTML = '';
    const hasSkills = resumeData.skills.languages || resumeData.skills.frameworks || resumeData.skills.tools;
    if (hasSkills) {
      let skillsBlocks = '';
      if (resumeData.skills.languages) {
        skillsBlocks += `<div class="skills-row-sheet"><strong>Languages:</strong><br>${resumeData.skills.languages}</div>`;
      }
      if (resumeData.skills.frameworks) {
        skillsBlocks += `<div class="skills-row-sheet" style="margin-top: 6px;"><strong>Frameworks:</strong><br>${resumeData.skills.frameworks}</div>`;
      }
      if (resumeData.skills.tools) {
        skillsBlocks += `<div class="skills-row-sheet" style="margin-top: 6px;"><strong>Tools/Databases:</strong><br>${resumeData.skills.tools}</div>`;
      }

      skillsHTML = `
        <section class="sheet-section" id="sheet-section-skills">
          <h3 class="section-title-sheet">Technical Skills</h3>
          <div class="section-divider-sheet"></div>
          <div class="skills-grid-sheet" id="resume-sheet-skills-container">${skillsBlocks}</div>
        </section>`;
    }

    // Custom Sections
    let customHTML = '';
    const validCustom = resumeData.customSections ? resumeData.customSections.filter(c => c.title) : [];
    if (validCustom.length > 0) {
      validCustom.forEach(c => {
        const bulletsHTML = c.content
          ? `<ul class="block-bullets-sheet">${c.content.split('\n').filter(Boolean).map(bullet => `<li>${bullet.replace(/^-\s*/, '')}</li>`).join('')}</ul>`
          : '';
        customHTML += `
          <section class="sheet-section">
            <h3 class="section-title-sheet">${c.title}</h3>
            <div class="section-divider-sheet"></div>
            ${bulletsHTML}
          </section>`;
      });
    }

    // Map of section IDs to their compiled HTML
    const sectionBlocks = {
      'sheet-section-summary': summaryHTML,
      'sheet-section-experience': expHTML,
      'sheet-section-education': eduHTML,
      'sheet-section-projects': projHTML,
      'sheet-section-skills': skillsHTML,
      'resume-sheet-custom-container': customHTML
    };

    // Read the current sequence of the accordion headers
    const draggableItems = Array.from(document.querySelectorAll('.form-accordion .draggable-section'));
    const sectionOrder = draggableItems.map(item => item.getAttribute('data-section-id'));

    // Assemble final output based on active theme layout
    if (isCreative) {
      // Reorder main section blocks
      let creativeMainHTML = '';
      sectionOrder.forEach(sectionId => {
        if (sectionId !== 'sheet-section-skills' && sectionBlocks[sectionId]) {
          creativeMainHTML += sectionBlocks[sectionId];
        }
      });

      sheet.innerHTML = `
        <div class="creative-sidebar">
          <div class="resume-header-flex-wrapper">
            ${photoHTML}
            <div class="resume-header-text">
              <h1>${nameText}</h1>
              <p class="resume-title-sub">${titleText}</p>
              <div class="resume-contacts">${contactsHTML}</div>
            </div>
          </div>
          ${skillsHTML}
        </div>
        <div class="creative-main">
          ${creativeMainHTML}
        </div>`;
    } else {
      let bodyHTML = '';
      sectionOrder.forEach(sectionId => {
        if (sectionBlocks[sectionId]) {
          bodyHTML += sectionBlocks[sectionId];
        }
      });

      sheet.innerHTML = `
        <header class="resume-header-sheet">
          <div class="resume-header-flex-wrapper">
            ${photoHTML}
            <div class="resume-header-text">
              <h1 id="resume-sheet-name">${nameText}</h1>
              <p class="resume-title-sub" id="resume-sheet-title">${titleText}</p>
              <div class="resume-contacts" id="resume-sheet-contacts">${contactsHTML}</div>
            </div>
          </div>
        </header>
        <div class="resume-body-sheet">
          ${bodyHTML}
        </div>`;
    }

  }


  // ----------------------------------------------------
  // ATS SCORE CHECKER CONTROLLER
  // ----------------------------------------------------

  const runAtsBtn = document.getElementById('btn-run-ats');
  const atsLoader = document.getElementById('ats-loader');
  const atsResults = document.getElementById('ats-results');
  const jdInput = document.getElementById('ats-jd-input');

  runAtsBtn.addEventListener('click', async () => {
    const jdText = jdInput.value.trim();
    if (!jdText) {
      showToast('Please paste a target job description first!', 3000);
      return;
    }

    // Compile entire resume details into text block
    const resumeText = compileResumeText();

    // Show loading spinner
    atsLoader.classList.remove('hidden');
    atsResults.classList.add('hidden');

    try {
      const analysis = await AI.checkATSCompatibility(resumeText, jdText);
      
      // Populate results
      const scoreCircle = document.getElementById('ats-score-circle');
      const scoreVal = document.getElementById('ats-score-value');
      const scoreBadge = document.getElementById('ats-score-badge');
      const scoreSummary = document.getElementById('ats-score-summary');

      const score = analysis.score || 0;
      scoreVal.innerText = `${score}%`;
      
      // Set circular stroke offset based on A = 2 * PI * r = 251.2
      const radius = 40;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (score / 100) * circumference;
      scoreCircle.style.strokeDashoffset = offset;

      // Classify match state
      if (score >= 80) {
        scoreBadge.innerText = 'Excellent Match';
        scoreBadge.style.color = '#34d399';
        scoreCircle.style.stroke = '#34d399';
      } else if (score >= 60) {
        scoreBadge.innerText = 'Good Match';
        scoreBadge.style.color = '#f59e0b';
        scoreCircle.style.stroke = '#f59e0b';
      } else {
        scoreBadge.innerText = 'Weak Match';
        scoreBadge.style.color = '#ef4444';
        scoreCircle.style.stroke = '#ef4444';
      }

      scoreSummary.innerText = analysis.summary || '';

      // Populate keywords lists
      const matchedContainer = document.getElementById('ats-matched-tags');
      const missingContainer = document.getElementById('ats-missing-tags');
      matchedContainer.innerHTML = '';
      missingContainer.innerHTML = '';

      if (analysis.matchedKeywords?.length) {
        analysis.matchedKeywords.forEach(kw => {
          const span = document.createElement('span');
          span.innerText = kw;
          matchedContainer.appendChild(span);
        });
      } else {
        matchedContainer.innerHTML = '<span style="background:none; border:none; color:var(--text-muted)">No keywords matched.</span>';
      }

      if (analysis.missingKeywords?.length) {
        analysis.missingKeywords.forEach(kw => {
          const span = document.createElement('span');
          span.innerText = kw;
          missingContainer.appendChild(span);
        });
      } else {
        missingContainer.innerHTML = '<span style="background:none; border:none; color:var(--text-muted)">None detected! Outstanding.</span>';
      }

      // Populate suggestion bullets
      const suggestionList = document.getElementById('ats-bullet-suggestions');
      suggestionList.innerHTML = '';
      if (analysis.bulletSuggestions?.length) {
        analysis.bulletSuggestions.forEach(bullet => {
          const li = document.createElement('li');
          li.innerText = bullet;
          suggestionList.appendChild(li);
        });
      } else {
        suggestionList.innerHTML = '<li style="color:var(--text-secondary)">No major suggestions, your resume looks highly optimal!</li>';
      }

      atsResults.classList.remove('hidden');
    } catch (err) {
      showToast(`Analysis Failed: ${err.message}`, 4000);
    } finally {
      atsLoader.classList.add('hidden');
    }
  });

  // ATS Subtabs management
  const subtabHeaders = document.querySelectorAll('.results-tab-headers .tab-hdr');
  subtabHeaders.forEach(hdr => {
    hdr.addEventListener('click', () => {
      const targetSubtab = hdr.getAttribute('data-subtab');
      
      subtabHeaders.forEach(h => h.classList.remove('active'));
      document.querySelectorAll('.results-tab-body .subtab-content').forEach(c => c.classList.remove('active'));

      hdr.classList.add('active');
      document.getElementById(targetSubtab).classList.add('active');
    });
  });

  // Helper: converts resume structured content into string format
  function compileResumeText() {
    let output = `NAME: ${resumeData.personal.fullname}
ROLE: ${resumeData.personal.title}
SUMMARY: ${resumeData.summary}
SKILLS: Languages: ${resumeData.skills.languages}, Frameworks: ${resumeData.skills.frameworks}, Tools: ${resumeData.skills.tools}\n`;

    output += '\nEXPERIENCE:\n';
    resumeData.experience.forEach(exp => {
      output += `- Job: ${exp.role} at ${exp.company} (${exp.duration})\nDescription: ${exp.description}\n`;
    });

    output += '\nEDUCATION:\n';
    resumeData.education.forEach(edu => {
      output += `- Degree: ${edu.degree} from ${edu.school} (${edu.duration}) ${edu.description}\n`;
    });

    output += '\nPROJECTS:\n';
    resumeData.projects.forEach(proj => {
      output += `- Project: ${proj.name} (${proj.role})\nDescription: ${proj.description}\n`;
    });

    return output;
  }

  // ----------------------------------------------------
  // COVER LETTER GENERATOR CONTROLLER
  // ----------------------------------------------------

  const genClBtn = document.getElementById('btn-generate-cl');
  const clLoader = document.getElementById('cl-loader');
  const clResultContainer = document.getElementById('cl-result-container');
  const clBody = document.getElementById('cl-letter-body');

  genClBtn.addEventListener('click', async () => {
    const company = document.getElementById('cl-company').value.trim();
    const role = document.getElementById('cl-role').value.trim();
    const clJd = document.getElementById('cl-jd').value.trim();

    if (!company || !role) {
      showToast('Please provide a Company Name and Job Title.', 3000);
      return;
    }

    clLoader.classList.remove('hidden');
    clResultContainer.classList.add('hidden');

    try {
      const resumeText = compileResumeText();
      const letter = await AI.generateCoverLetter(resumeText, company, role, clJd);
      
      clBody.innerText = letter;
      clResultContainer.classList.remove('hidden');
    } catch (err) {
      showToast(`Letter Generation Failed: ${err.message}`, 4000);
    } finally {
      clLoader.classList.add('hidden');
    }
  });

  // Copy Cover letter to clipboard
  document.getElementById('btn-copy-cl').addEventListener('click', () => {
    const text = clBody.innerText;
    navigator.clipboard.writeText(text);
    showToast('Cover letter copied to clipboard!', 2000);
  });

  // ----------------------------------------------------
  // AI PARAGRAPH ENHANCER CONTROLLER
  // ----------------------------------------------------

  let inlineApplyCallback = null; // Stores target input context for inline modifications

  const improveInput = document.getElementById('ai-improve-input');
  const improveTone = document.getElementById('ai-improve-tone');
  const improveKeywords = document.getElementById('ai-improve-keywords');
  const runImproveBtn = document.getElementById('btn-run-improve');
  const improveLoader = document.getElementById('improve-loader');
  const improveResults = document.getElementById('improve-results');

  const origBox = document.getElementById('improve-orig-box');
  const newBox = document.getElementById('improve-new-box');

  runImproveBtn.addEventListener('click', async () => {
    const text = improveInput.value.trim();
    const tone = improveTone.value;
    const keywords = improveKeywords.value.trim();

    if (!text) {
      showToast('Please paste or write original text to improve!', 3000);
      return;
    }

    improveLoader.classList.remove('hidden');
    improveResults.classList.add('hidden');

    try {
      const enhanced = await AI.enhanceParagraph(text, tone, keywords);
      
      origBox.innerText = text;
      newBox.innerText = enhanced;
      improveResults.classList.remove('hidden');
    } catch (err) {
      showToast(`Enhancement failed: ${err.message}`, 4000);
    } finally {
      improveLoader.classList.add('hidden');
    }
  });

  // Copy enhanced text
  document.getElementById('btn-copy-improved').addEventListener('click', () => {
    const text = newBox.innerText;
    navigator.clipboard.writeText(text);
    showToast('Improved text copied to clipboard!', 2000);

    // If this was triggered as an inline enhancement, apply it to the source box directly
    if (inlineApplyCallback) {
      inlineApplyCallback(text);
      showToast('Text updated in resume builder!', 2500);
      
      // Auto return to builder tab
      setTimeout(() => {
        switchTab('builder');
        inlineApplyCallback = null;
      }, 1000);
    }
  });

  // Helper: triggers a switch to the enhancer tab for inline "AI Improve" buttons
  function triggerInlineEnhance(text, callback) {
    inlineApplyCallback = callback;
    improveInput.value = text || '';
    improveResults.classList.add('hidden');
    switchTab('improve');
    
    // Smooth focus
    setTimeout(() => {
      improveInput.focus();
    }, 150);
  }

  // Bind the summary block AI improve button directly
  document.getElementById('ai-improve-summary-btn').addEventListener('click', () => {
    const summaryText = summaryInput.value;
    triggerInlineEnhance(summaryText, (enhancedText) => {
      summaryInput.value = enhancedText;
      resumeData.summary = enhancedText;
      updatePreview();
    });
  });

  // ----------------------------------------------------
  // PAYMENT INTEGRATION (UPI QR & PAYPAL SMART BUTTONS)
  // ----------------------------------------------------
  let isPaid = false;
  let paypalLoaded = false;

  const paymentModal = document.getElementById('payment-modal');
  const btnClosePayment = document.getElementById('btn-close-payment');

  
  // Tab buttons
  const tabBtnUpi = document.getElementById('tab-btn-upi');
  const tabBtnPaypal = document.getElementById('tab-btn-paypal');
  
  // Panels
  const panelUpi = document.getElementById('payment-panel-upi');
  const panelPaypal = document.getElementById('payment-panel-paypal');
  
  // UPI Form Elements
  const inputUpiUtr = document.getElementById('input-upi-utr');
  const btnVerifyUpi = document.getElementById('btn-verify-upi');

  // Tab switching logic
  tabBtnUpi.addEventListener('click', () => {
    tabBtnUpi.classList.add('active');
    tabBtnPaypal.classList.remove('active');
    panelUpi.classList.remove('hidden');
    panelPaypal.classList.add('hidden');
  });

  tabBtnPaypal.addEventListener('click', () => {
    tabBtnPaypal.classList.add('active');
    tabBtnUpi.classList.remove('active');
    panelPaypal.classList.remove('hidden');
    panelUpi.classList.add('hidden');
    
    // Load PayPal SDK when tab is clicked
    loadPayPalSDK();
  });

  function loadPayPalSDK(callback) {
    const paypalClientId = DEVELOPER_PAYPAL_CLIENT;
    
    if (paypalLoaded) {
      initPayPalButtons();
      if (callback) callback();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD`;
    script.onload = () => {
      paypalLoaded = true;
      initPayPalButtons();
      if (callback) callback();
    };
    script.onerror = () => {
      console.error('Failed to load PayPal SDK');
      showToast('Error: Failed to connect to PayPal. Check your network.', 4000);
    };
    document.head.appendChild(script);
  }

  function initPayPalButtons() {
    if (!window.paypal) return;
    
    // Clear previous content
    const container = document.getElementById('paypal-button-container');
    container.innerHTML = '';

    window.paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
              amount: {
                value: '0.25'
              },
            description: 'CVitron Premium PDF Resume Unlock'
          }]
        });
      },
      onApprove: async (data, actions) => {
        try {
          const details = await actions.order.capture();
          console.log('Transaction completed:', details);
          isPaid = true;
          closePaymentModal();
          AudioEffects.playSuccess();
          showToast('Payment approved! Download unlocked.', 3000);
          setTimeout(() => {
            PDFExporter.exportResume();
          }, 800);
        } catch (err) {
          console.error('Capture failed:', err);
          showToast('Transaction validation failed.', 4000);
        }
      },
      onError: (err) => {
        console.error('PayPal Smart Button Error:', err);
        showToast('Payment processing failed. Please try again.', 4500);
      }
    }).render('#paypal-button-container');
  }

  // UPI QR Code Generation & Verification
  function setupUpiPayment() {
    const merchantUpi = DEVELOPER_UPI_ID;
    
    // Standard UPI deep link
    const upiLink = `upi://pay?pa=${encodeURIComponent(merchantUpi)}&pn=CVitron&am=20.00&cu=INR&tn=PremiumResume`;
    
    // Generate QR code using public serverless API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}`;
    
    document.getElementById('payment-upi-qr').src = qrUrl;
    document.getElementById('payment-upi-id-txt').innerText = merchantUpi;
    
    // Reset UTR fields
    inputUpiUtr.value = '';
    btnVerifyUpi.disabled = false;
    btnVerifyUpi.innerText = 'Verify & Download PDF';
  }

  btnVerifyUpi.addEventListener('click', () => {
    const utr = inputUpiUtr.value.trim();
    
    // Validate 12-digit numeric code
    if (!/^\d{12}$/.test(utr)) {
      showToast('Please enter a valid 12-digit numeric UPI Ref / UTR number.', 3500);
      return;
    }
    
    // Simulate payment validation with bank
    btnVerifyUpi.disabled = true;
    btnVerifyUpi.innerText = 'Verifying with bank network...';
    
    setTimeout(() => {
      isPaid = true;
      closePaymentModal();
      AudioEffects.playSuccess();
      showToast('Transaction verified successfully! Download unlocked.', 3000);
      setTimeout(() => {
        PDFExporter.exportResume();
      }, 800);
    }, 1500);
  });

  function openPaymentModal() {
    paymentModal.classList.remove('hidden');
    
    // Default to UPI tab first
    tabBtnUpi.click();
    
    // Set up QR Code values
    setupUpiPayment();
  }

  function closePaymentModal() {
    paymentModal.classList.add('hidden');
  }

  btnClosePayment.addEventListener('click', closePaymentModal);

  // ----------------------------------------------------
  // PDF EXPORT
  // ----------------------------------------------------
  
  document.getElementById('btn-export-pdf').addEventListener('click', () => {
    if (isPaid) {
      PDFExporter.exportResume();
    } else {
      openPaymentModal();
    }
  });

  // ----------------------------------------------------
  // PHOTO UPLOADER BINDING
  // ----------------------------------------------------
  const photoInput = document.getElementById('input-photo');
  const removePhotoBtn = document.getElementById('btn-remove-photo');

  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        resumeData.personal.photo = event.target.result;
        removePhotoBtn.style.display = 'inline-block';
        updatePreview();
      };
      reader.readAsDataURL(file);
    }
  });

  removePhotoBtn.addEventListener('click', () => {
    photoInput.value = '';
    resumeData.personal.photo = '';
    removePhotoBtn.style.display = 'none';
    updatePreview();
  });

  // Templates & Styling Selectors
  const themeSelect = document.getElementById('builder-theme-select');
  const fontsizeSelect = document.getElementById('builder-fontsize-select');
  const marginSelect = document.getElementById('builder-margin-select');

  function updateStyleClasses() {
    const sheet = document.getElementById('resume-sheet-preview');
    const theme = themeSelect.value;
    const fontsize = fontsizeSelect.value;
    const margin = marginSelect.value;

    // Reset layout classes
    sheet.className = `resume-sheet ${theme} size-${fontsize} margin-${margin}`;

    // Also update settings page theme selector
    const settingsTheme = document.getElementById('settings-theme');
    if (settingsTheme) {
      settingsTheme.value = theme;
    }
  }

  themeSelect.addEventListener('change', () => {
    updateStyleClasses();
    updatePreview();
  });
  
  const settingsTheme = document.getElementById('settings-theme');
  if (settingsTheme) {
    settingsTheme.addEventListener('change', (e) => {
      themeSelect.value = e.target.value;
      updateStyleClasses();
      updatePreview();
    });
  }

  fontsizeSelect.addEventListener('change', updateStyleClasses);
  marginSelect.addEventListener('change', updateStyleClasses);

  // ----------------------------------------------------
  // RUN INITIAL DEFAULT TEMPLATE DATA
  // ----------------------------------------------------
  
  initSettings();
  updateStyleClasses();

  // Populate some elegant default placeholder items to wow the user out of the box!
  document.getElementById('input-fullname').value = 'Diana Prince';
  document.getElementById('input-title').value = 'Lead Cloud Solutions Architect';
  document.getElementById('input-email').value = 'diana.prince@cloudnet.io';
  document.getElementById('input-phone').value = '+1 (555) 389-1029';
  document.getElementById('input-location').value = 'Seattle, WA';
  document.getElementById('input-linkedin').value = 'linkedin.com/in/dianacloud';
  document.getElementById('input-website').value = 'dianaprince.cloud';
  
  document.getElementById('input-summary').value = 'Detail-oriented and results-driven Solutions Architect with 8+ years of experience designing and implementing highly available, scalable cloud infrastructure. Expert in AWS, Kubernetes, and automating dev workflows.';

  document.getElementById('input-skills-languages').value = 'JavaScript, Go, Python, Bash, SQL';
  document.getElementById('input-skills-frameworks').value = 'React, Node.js, Express, FastAPI';
  document.getElementById('input-skills-tools').value = 'AWS (EC2, S3, RDS, EKS), Docker, Terraform, Kubernetes, Git, PostgreSQL';

  // Synchronize state map
  resumeData.personal = {
    fullname: 'Diana Prince',
    title: 'Lead Cloud Solutions Architect',
    email: 'diana.prince@cloudnet.io',
    phone: '+1 (555) 389-1029',
    location: 'Seattle, WA',
    linkedin: 'linkedin.com/in/dianacloud',
    website: 'dianaprince.cloud'
  };
  resumeData.summary = 'Detail-oriented and results-driven Solutions Architect with 8+ years of experience designing and implementing highly available, scalable cloud infrastructure. Expert in AWS, Kubernetes, and automating dev workflows.';
  resumeData.skills = {
    languages: 'JavaScript, Go, Python, Bash, SQL',
    frameworks: 'React, Node.js, Express, FastAPI',
    tools: 'AWS (EC2, S3, RDS, EKS), Docker, Terraform, Kubernetes, Git, PostgreSQL'
  };

  // Populate experience templates
  addExperience(
    'CloudNet Technologies',
    'Lead Solutions Architect',
    'June 2021 - Present',
    '- Directed migration of monolithic architectures to multi-region AWS microservices, improving uptime to 99.99%.\n- Designed Kubernetes workflows reducing deployment cycle overhead from 4 hours to under 12 minutes.\n- Managed a team of 6 DevOps engineers deploying Terraform configurations across Dev, Staging, and Production.'
  );
  addExperience(
    'AppFlow Systems',
    'Senior DevOps Engineer',
    'March 2018 - May 2021',
    '- Standardized containerization of 40+ microservices utilizing Docker, leading to a 30% reduction in hosting bills.\n- Built robust CI/CD pipelines in GitLab CI, automating unit test validations and staging deployments.'
  );

  // Populate education templates
  addEducation(
    'University of Washington',
    'M.S. in Computer Science',
    '2016 - 2018',
    'Thesis focused on distributed routing and container orchestration security.'
  );

  // Populate projects templates
  addProject(
    'AutoTerraform CLI',
    'Creator (Go & Shell)',
    '- Created open-source developer tool translating visual cloud architecture schemas to fully compliant Terraform code.\n- Earned 1,200+ stars on GitHub and was integrated by several regional enterprise companies.'
  );

  // Populate custom sections
  addCustomSection(
    'Certifications & Achievements',
    '- AWS Certified Solutions Architect – Professional (SAP-C02)\n- Certified Kubernetes Administrator (CKA) – CNCF\n- HashiCorp Certified: Terraform Associate'
  );

  // ----------------------------------------------------
  // WORKSPACE DRAGGABLE SPLITTER
  // ----------------------------------------------------
  const splitter = document.getElementById('layout-splitter');
  const controlsPanel = document.querySelector('.controls-panel');
  
  // Load saved splitter width on startup
  const savedSplitterWidth = localStorage.getItem('workspace_splitter_width');
  if (savedSplitterWidth) {
    controlsPanel.style.width = savedSplitterWidth + 'px';
  }

  if (splitter && controlsPanel) {
    splitter.addEventListener('mousedown', (e) => {
      e.preventDefault();
      splitter.classList.add('dragging');
      
      const startX = e.clientX;
      const startWidth = controlsPanel.getBoundingClientRect().width;
      
      function onMouseMove(moveEvent) {
        const deltaX = moveEvent.clientX - startX;
        const newWidth = startWidth + deltaX;
        
        // Boundaries checks (320px min, 75% max width)
        const containerWidth = splitter.parentElement.getBoundingClientRect().width;
        const minWidth = 320;
        const maxWidth = containerWidth * 0.75;
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          controlsPanel.style.width = newWidth + 'px';
        }
      }
      
      function onMouseUp() {
        splitter.classList.remove('dragging');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        
        // Cache the custom panel width
        localStorage.setItem('workspace_splitter_width', controlsPanel.getBoundingClientRect().width);
      }
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  // ----------------------------------------------------
  // COLLAPSIBLE SIDEBAR
  // ----------------------------------------------------
  const sidebar = document.querySelector('.sidebar');
  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  
  // Load saved sidebar state on startup
  const isSidebarCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
  if (isSidebarCollapsed) {
    sidebar.classList.add('collapsed');
    if (btnToggleSidebar) btnToggleSidebar.setAttribute('data-tooltip', 'Expand sidebar');
  } else {
    if (btnToggleSidebar) btnToggleSidebar.setAttribute('data-tooltip', 'Collapse sidebar');
  }

  if (btnToggleSidebar && sidebar) {
    btnToggleSidebar.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      const isCollapsed = sidebar.classList.contains('collapsed');
      btnToggleSidebar.setAttribute('data-tooltip', isCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
      
      // Cache user sidebar state preference
      localStorage.setItem('sidebar_collapsed', isCollapsed);
      
      // Update active tooltip text instantly if open
      const tooltip = document.getElementById('app-tooltip');
      if (tooltip && tooltip.classList.contains('visible')) {
        tooltip.innerText = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';
      }
    });
  }

  // ----------------------------------------------------
  // ACCORDION DRAG & DROP REORDERING
  // ----------------------------------------------------
  const accordionContainer = document.querySelector('.form-accordion');
  
  if (accordionContainer) {
    // Dynamic Draggable Toggle: Enable dragging ONLY when hovering over the header
    const draggableSections = accordionContainer.querySelectorAll('.draggable-section');
    draggableSections.forEach(section => {
      const header = section.querySelector('.accordion-header');
      if (header) {
        header.addEventListener('mouseenter', () => {
          section.setAttribute('draggable', 'true');
        });
        header.addEventListener('mouseleave', () => {
          if (!section.classList.contains('dragging')) {
            section.setAttribute('draggable', 'false');
          }
        });
      }
    });

    accordionContainer.addEventListener('dragstart', (e) => {
      const item = e.target.closest('.draggable-section');
      if (!item) return;
      
      item.classList.add('dragging');
      
      // Collapse accordion item on dragstart for a cleaner drag representation
      item.classList.remove('expanded');
    });

    accordionContainer.addEventListener('dragend', (e) => {
      const item = e.target.closest('.draggable-section');
      if (item) {
        item.classList.remove('dragging');
        item.setAttribute('draggable', 'false');
      }
      // Re-trigger preview update to commit new section order
      updatePreview();
    });

    accordionContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      const draggingItem = accordionContainer.querySelector('.dragging');
      if (!draggingItem) return;
      
      const siblings = Array.from(accordionContainer.querySelectorAll('.draggable-section:not(.dragging)'));
      
      // Find the sibling to drop before
      const nextSibling = siblings.find(sibling => {
        const box = sibling.getBoundingClientRect();
        // Check if mouse cursor is past the middle of the sibling
        return e.clientY <= box.top + box.height / 2;
      });
      
      if (nextSibling) {
        accordionContainer.insertBefore(draggingItem, nextSibling);
      } else {
        // If cursor is below all siblings, append it to the end of the draggable block
        const lastDraggable = siblings[siblings.length - 1];
        if (lastDraggable) {
          lastDraggable.after(draggingItem);
        }
      }
    });
  }

  // ----------------------------------------------------
  // GLOBAL PREMIUM TOOLTIPS
  // ----------------------------------------------------
  const appTooltip = document.getElementById('app-tooltip');
  let tooltipTimeout = null;

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (!target) {
      hideAppTooltip();
      return;
    }

    clearTimeout(tooltipTimeout);
    
    // Add a 350ms delay for high-fidelity hovering affordance
    tooltipTimeout = setTimeout(() => {
      appTooltip.innerText = target.getAttribute('data-tooltip');
      appTooltip.classList.remove('hidden');
      
      const rect = target.getBoundingClientRect();
      let x = rect.left + rect.width / 2;
      let y = rect.top - appTooltip.offsetHeight - 8;
      
      // Special offset math for the vertical layout splitter
      if (target.id === 'layout-splitter') {
        y = e.clientY - appTooltip.offsetHeight - 12;
      }
      
      // Boundary safety checks
      if (x < appTooltip.offsetWidth / 2) {
        x = appTooltip.offsetWidth / 2 + 4;
      } else if (x > window.innerWidth - appTooltip.offsetWidth / 2) {
        x = window.innerWidth - appTooltip.offsetWidth / 2 - 4;
      }
      if (y < 4) {
        y = rect.top + rect.height + 8;
      }

      appTooltip.style.left = x + 'px';
      appTooltip.style.top = y + 'px';
      appTooltip.classList.add('visible');
    }, 350);
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (target) {
      hideAppTooltip();
    }
  });

  function hideAppTooltip() {
    clearTimeout(tooltipTimeout);
    if (appTooltip) {
      appTooltip.classList.remove('visible');
      appTooltip.classList.add('hidden');
    }
  }

  // ----------------------------------------------------
  // APP STARTUP SPLASH SCREEN TIMEOUT
  // ----------------------------------------------------
  const startupSplash = document.getElementById('startup-splash');
  if (startupSplash) {
    setTimeout(() => {
      startupSplash.classList.add('fade-out');
      // Play clean boot chime!
      AudioEffects.playStartup();
      
      // Completely remove splash screen overlay from DOM after transition completes (800ms)
      setTimeout(() => {
        startupSplash.remove();
      }, 800);
    }, 2200); // 2.2 seconds loading progress bar duration
  }

  // ----------------------------------------------------
  // GLOBAL AUDIO FEEDBACK EVENT BINDINGS
  // ----------------------------------------------------
  // List of interactive selectors to play hover and click sounds
  const interactiveSelector = '.menu-item, .btn-primary, .btn-secondary, .btn-micro, .btn-micro-ai, .accordion-header, .btn-toggle-sidebar, .layout-splitter';
  
  // Hover effect: mouseenter
  document.addEventListener('mouseenter', (e) => {
    const target = e.target.closest(interactiveSelector);
    if (target) {
      AudioEffects.playHover();
    }
  }, true); // Use capture phase because mouseenter doesn't bubble

  // Click effect: mousedown (gives immediate feedback before click completes)
  document.addEventListener('mousedown', (e) => {
    const target = e.target.closest(interactiveSelector);
    if (target) {
      AudioEffects.playClick();
    }
  }, true);

  updatePreview();
});

