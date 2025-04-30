document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const subjectItems = document.querySelectorAll('.subject-list li');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const currentSubjectEl = document.getElementById('current-subject');
    const totalTimeEl = document.getElementById('total-time');
    const timerModal = document.getElementById('timer-modal');
    const timerBtns = document.querySelectorAll('.timer-btn');
    const startTimerBtn = document.getElementById('start-timer');
    const pauseTimerBtn = document.getElementById('pause-timer');
    const stopTimerBtn = document.getElementById('stop-timer');
    const closeModalBtn = document.querySelector('.close-btn');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    // App State
    let currentSubject = 'dsa';
    let activeTab = 'modules';
    let timerInterval;
    let seconds = 0;
    let activeModule = null;
    
    // Sample data for subjects and modules
    const subjects = {
      dsa: {
        name: 'Data Structures & Algorithms',
        modules: [
          { id: 'arrays', name: 'Arrays & Linked Lists', timeSpent: 0, completed: false },
          { id: 'trees', name: 'Trees & Graphs', timeSpent: 0, completed: false },
          { id: 'sorting', name: 'Sorting Algorithms', timeSpent: 0, completed: false },
          { id: 'searching', name: 'Searching Algorithms', timeSpent: 0, completed: false }
        ],
        totalTime: 0
      },
      web: {
        name: 'Internet Programming',
        modules: [
          { id: 'html', name: 'HTML & CSS', timeSpent: 0, completed: false },
          { id: 'javascript', name: 'JavaScript Fundamentals', timeSpent: 0, completed: false },
          { id: 'react', name: 'React Framework', timeSpent: 0, completed: false },
          { id: 'node', name: 'Node.js & Express', timeSpent: 0, completed: false }
        ],
        totalTime: 0
      },
      db: {
        name: 'Database Systems',
        modules: [
          { id: 'sql', name: 'SQL Fundamentals', timeSpent: 0, completed: false },
          { id: 'normalization', name: 'Database Normalization', timeSpent: 0, completed: false },
          { id: 'indexes', name: 'Indexes & Optimization', timeSpent: 0, completed: false },
          { id: 'transactions', name: 'Transactions & ACID', timeSpent: 0, completed: false }
        ],
        totalTime: 0
      },
      crypto: {
        name: 'Cryptography',
        modules: [
          { id: 'symmetric', name: 'Symmetric Encryption', timeSpent: 0, completed: false },
          { id: 'asymmetric', name: 'Asymmetric Encryption', timeSpent: 0, completed: false },
          { id: 'hashing', name: 'Hashing Algorithms', timeSpent: 0, completed: false },
          { id: 'ssl', name: 'SSL/TLS Protocols', timeSpent: 0, completed: false }
        ],
        totalTime: 0
      }
    };
    
    // Initialize Chart
    const ctx = document.getElementById('progressChart').getContext('2d');
    const progressChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Data Structures', 'Internet Prog', 'Database', 'Cryptography'],
        datasets: [{
          label: 'Study Time (hours)',
          data: [0, 0, 0, 0],
          backgroundColor: [
            'rgba(67, 97, 238, 0.7)',
            'rgba(76, 201, 240, 0.7)',
            'rgba(243, 104, 224, 0.7)',
            'rgba(247, 37, 133, 0.7)'
          ],
          borderColor: [
            'rgba(67, 97, 238, 1)',
            'rgba(76, 201, 240, 1)',
            'rgba(243, 104, 224, 1)',
            'rgba(247, 37, 133, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    
    // Event Listeners
    subjectItems.forEach(item => {
      item.addEventListener('click', function() {
        // Update active subject in UI
        subjectItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        
        // Update current subject
        currentSubject = this.dataset.subject;
        currentSubjectEl.textContent = subjects[currentSubject].name;
        
        // Update total time display
        updateTotalTime();
        
        // Render modules for this subject
        renderModules();
        
        // Update chart
        updateChart();
      });
    });
    
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Update active tab in UI
        tabButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // Update active tab
        activeTab = this.dataset.tab;
        
        // Show corresponding content
        tabContents.forEach(content => {
          content.classList.remove('active');
          if (content.dataset.tab === activeTab) {
            content.classList.add('active');
          }
        });
      });
    });
    
    // Timer functionality
    timerBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        activeModule = this.dataset.module;
        timerModal.classList.add('active');
      });
    });
    
    startTimerBtn.addEventListener('click', startTimer);
    pauseTimerBtn.addEventListener('click', pauseTimer);
    stopTimerBtn.addEventListener('click', stopTimer);
    closeModalBtn.addEventListener('click', closeModal);
    
    // Functions
    function renderModules() {
      const modulesContainer = document.querySelector('.tab-content[data-tab="modules"]');
      modulesContainer.innerHTML = '';
      
      subjects[currentSubject].modules.forEach(module => {
        const hours = Math.floor(module.timeSpent / 3600);
        const minutes = Math.floor((module.timeSpent % 3600) / 60);
        const timeString = `${hours}h ${minutes}m`;
        const progressPercent = module.completed ? 100 : Math.min((module.timeSpent / 3600) * 10, 100);
        
        const moduleCard = document.createElement('div');
        moduleCard.className = 'module-card';
        moduleCard.innerHTML = `
          <div class="module-header">
            <h3>${module.name}</h3>
            <div class="module-time">
              <span class="time-spent">${timeString}</span>
              <button class="timer-btn" data-module="${module.id}">
                <i class="fas fa-play"></i>
              </button>
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercent}%"></div>
          </div>
          <div class="module-actions">
            <button class="action-btn complete-btn" data-module="${module.id}">
              <i class="far fa-check-circle"></i> Mark Complete
            </button>
            <button class="action-btn notes-btn" data-module="${module.id}">
              <i class="far fa-edit"></i> Add Notes
            </button>
          </div>
        `;
        
        modulesContainer.appendChild(moduleCard);
      });
      
      // Add event listeners to new timer buttons
      document.querySelectorAll('.timer-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          activeModule = this.dataset.module;
          timerModal.classList.add('active');
        });
      });
      
      // Add event listeners to complete buttons
      document.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const moduleId = this.dataset.module;
          const module = subjects[currentSubject].modules.find(m => m.id === moduleId);
          module.completed = !module.completed;
          renderModules();
        });
      });
    }
    
    function updateTotalTime() {
      const totalSeconds = subjects[currentSubject].totalTime;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      totalTimeEl.textContent = `${hours}h ${minutes}m`;
      
      // Update stats
      const completedModules = subjects[currentSubject].modules.filter(m => m.completed).length;
      document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = 
        `${completedModules}/${subjects[currentSubject].modules.length}`;
    }
    
    function updateChart() {
      progressChart.data.datasets[0].data = [
        subjects.dsa.totalTime / 3600,
        subjects.web.totalTime / 3600,
        subjects.db.totalTime / 3600,
        subjects.crypto.totalTime / 3600
      ];
      progressChart.update();
      
      // Update total study time stat
      const totalHours = Object.values(subjects).reduce((sum, subject) => sum + subject.totalTime, 0) / 3600;
      const hours = Math.floor(totalHours);
      const minutes = Math.floor((totalHours % 1) * 60);
      document.querySelector('.stat-card:first-child .stat-value').textContent = `${hours}h ${minutes}m`;
    }
    
    function startTimer() {
      startTimerBtn.disabled = true;
      pauseTimerBtn.disabled = false;
      stopTimerBtn.disabled = false;
      
      timerInterval = setInterval(() => {
        seconds++;
        updateTimerDisplay();
      }, 1000);
    }
    
    function pauseTimer() {
      clearInterval(timerInterval);
      startTimerBtn.disabled = false;
      pauseTimerBtn.disabled = true;
    }
    
    function stopTimer() {
      clearInterval(timerInterval);
      
      // Save time to module and subject
      const module = subjects[currentSubject].modules.find(m => m.id === activeModule);
      module.timeSpent += seconds;
      subjects[currentSubject].totalTime += seconds;
      
      // Reset timer
      seconds = 0;
      updateTimerDisplay();
      
      // Update UI
      updateTotalTime();
      renderModules();
      updateChart();
      
      // Close modal
      timerModal.classList.remove('active');
      startTimerBtn.disabled = false;
      pauseTimerBtn.disabled = true;
      stopTimerBtn.disabled = true;
    }
    
    function closeModal() {
      clearInterval(timerInterval);
      timerModal.classList.remove('active');
      seconds = 0;
      updateTimerDisplay();
      startTimerBtn.disabled = false;
      pauseTimerBtn.disabled = true;
      stopTimerBtn.disabled = true;
    }
    
    function updateTimerDisplay() {
      const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
      const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
      const secs = (seconds % 60).toString().padStart(2, '0');
      
      hoursEl.textContent = hours;
      minutesEl.textContent = mins;
      secondsEl.textContent = secs;
    }
    
    // Initialize the app
    renderModules();
    updateTotalTime();
    updateChart();
  });