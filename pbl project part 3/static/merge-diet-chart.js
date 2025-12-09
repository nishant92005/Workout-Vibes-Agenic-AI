// User authentication state management
let currentUser = null;
let selectedCharts = [];
let selectedGoal = null;
let allDietCharts = [];

// Check if user is logged in on page load
function checkAuthState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userName = localStorage.getItem('userName');

    if (isLoggedIn && userName) {
        currentUser = userName;
        showLoggedInState();
        loadDietCharts();
    } else {
        showLoggedOutState();
        showLoginRequired();
    }
}

// Show logged in state
function showLoggedInState() {
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');

    if (authButtons && userInfo && userName) {
        authButtons.style.display = 'none';
        userInfo.style.display = 'flex';
        userName.textContent = currentUser;
    }
}

// Show logged out state
function showLoggedOutState() {
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');

    if (authButtons && userInfo) {
        authButtons.style.display = 'flex';
        userInfo.style.display = 'none';
    }
}

// Show login required message
function showLoginRequired() {
    const chartsContainer = document.getElementById('chartsContainer');
    chartsContainer.innerHTML = `
        <div class="empty-state">
            <h3>🔐 Login Required</h3>
            <p>Please <a href="/login.html">login</a> to view and merge your saved diet charts.</p>
        </div>
    `;
}

// Logout function
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    currentUser = null;
    showLoggedOutState();
    window.location.href = '/';
}

// Dark mode functions
function setDarkMode(enabled) {
    if (enabled) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
        const toggle = document.getElementById('darkModeToggle');
        if (toggle) toggle.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
        const toggle = document.getElementById('darkModeToggle');
        if (toggle) toggle.textContent = '🌙';
    }
}

// Load diet charts from API
async function loadDietCharts() {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        showLoginRequired();
        return;
    }

    try {
        const response = await fetch(`/api/diet-chart/list?user_email=${encodeURIComponent(userEmail)}`);
        const result = await response.json();

        if (result.success) {
            allDietCharts = result.charts;
            displayDietCharts(result.charts);
        } else {
            throw new Error(result.message || 'Failed to load diet charts');
        }
    } catch (error) {
        console.error('Error loading diet charts:', error);
        document.getElementById('chartsContainer').innerHTML = `
            <div class="error" style="text-align: center; padding: 40px;">
                <h3>❌ Error Loading Charts</h3>
                <p>Failed to load your diet charts. Please try again.</p>
                <button onclick="loadDietCharts()" class="submit-btn" style="margin-top: 15px;">🔄 Retry</button>
            </div>
        `;
    }
}

// Display diet charts in the UI
function displayDietCharts(charts) {
    const chartsContainer = document.getElementById('chartsContainer');
    const emptyState = document.getElementById('emptyState');

    if (!charts || charts.length === 0) {
        chartsContainer.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    chartsContainer.style.display = 'block';
    emptyState.style.display = 'none';

    const chartsHtml = `
        <div class="charts-grid">
            ${charts.map(chart => createChartCard(chart)).join('')}
        </div>
    `;

    chartsContainer.innerHTML = chartsHtml;

    // Add event listeners for checkboxes and remove buttons
    charts.forEach(chart => {
        const checkbox = document.getElementById(`chart-${chart.id}`);
        const removeBtn = document.getElementById(`remove-${chart.id}`);

        if (checkbox) {
            checkbox.addEventListener('change', () => updateSelection());
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', () => removeDietChart(chart.id));
        }
    });
}

// Create chart card HTML
function createChartCard(chart) {
    const createdDate = new Date(chart.created_date).toLocaleDateString();
    
    return `
        <div class="chart-card" id="card-${chart.id}">
            <input type="checkbox" class="chart-checkbox" id="chart-${chart.id}" value="${chart.id}">
            <div class="chart-title">${chart.chart_name}</div>
            <div class="chart-goal">${formatGoal(chart.goal)}</div>
            <div class="chart-details">
                <div class="chart-calories">🔥 ${chart.target_calories} calories/day</div>
                <div class="chart-date">📅 Created: ${createdDate}</div>
            </div>
            <button class="remove-btn" id="remove-${chart.id}">🗑️ Remove</button>
        </div>
    `;
}

// Format goal text for display
function formatGoal(goal) {
    const goalMap = {
        'weight_loss': 'Weight Loss',
        'muscle_gain': 'Muscle Gain',
        'maintenance': 'Maintenance',
        'endurance': 'Endurance',
        'strength': 'Strength Building',
        'fat_loss': 'Fat Loss',
        'weight_loss_muscle_gain': 'Weight Loss + Muscle Gain',
        'weight_loss_endurance': 'Weight Loss + Endurance',
        'muscle_gain_endurance': 'Muscle Gain + Endurance'
    };
    return goalMap[goal] || goal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Update selection summary and controls
function updateSelection() {
    const checkboxes = document.querySelectorAll('.chart-checkbox:checked');
    selectedCharts = Array.from(checkboxes).map(cb => parseInt(cb.value));

    const mergeControls = document.getElementById('mergeControls');
    const summaryText = document.getElementById('summaryText');
    const mergeBtn = document.getElementById('mergeBtn');

    if (selectedCharts.length === 0) {
        mergeControls.style.display = 'none';
        return;
    }

    mergeControls.style.display = 'block';

    // Update selection summary
    const selectedChartNames = selectedCharts.map(id => {
        const chart = allDietCharts.find(c => c.id === id);
        return chart ? chart.chart_name : 'Unknown';
    });

    summaryText.innerHTML = `
        <strong>Selected Charts (${selectedCharts.length}):</strong><br>
        ${selectedChartNames.map(name => `• ${name}`).join('<br>')}
    `;

    // Update merge button state
    if (selectedCharts.length > 0 && selectedGoal) {
        mergeBtn.disabled = false;
    } else {
        mergeBtn.disabled = true;
    }

    // Update card styling
    document.querySelectorAll('.chart-card').forEach(card => {
        const cardId = parseInt(card.id.replace('card-', ''));
        if (selectedCharts.includes(cardId)) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

// Remove diet chart
async function removeDietChart(chartId) {
    if (!confirm('Are you sure you want to remove this diet chart?')) {
        return;
    }

    const userEmail = localStorage.getItem('userEmail');
    
    try {
        const response = await fetch('/api/diet-chart/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_email: userEmail,
                chart_id: chartId
            })
        });

        const result = await response.json();

        if (result.success) {
            // Remove from UI
            document.getElementById(`card-${chartId}`).remove();
            
            // Update arrays
            allDietCharts = allDietCharts.filter(chart => chart.id !== chartId);
            selectedCharts = selectedCharts.filter(id => id !== chartId);
            
            // Update selection
            updateSelection();
            
            // Show empty state if no charts left
            if (allDietCharts.length === 0) {
                document.getElementById('chartsContainer').style.display = 'none';
                document.getElementById('emptyState').style.display = 'block';
            }
            
            showNotification('Diet chart removed successfully!', 'success');
        } else {
            throw new Error(result.message || 'Failed to remove diet chart');
        }
    } catch (error) {
        console.error('Error removing diet chart:', error);
        showNotification('Failed to remove diet chart. Please try again.', 'error');
    }
}

// Merge selected diet charts
async function mergeCharts() {
    if (selectedCharts.length === 0 || !selectedGoal) {
        alert('Please select at least one diet chart and choose a goal');
        return;
    }

    const userEmail = localStorage.getItem('userEmail');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Show loading overlay
    loadingOverlay.style.display = 'flex';

    try {
        const response = await fetch('/api/diet-chart/merge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_email: userEmail,
                selected_chart_ids: selectedCharts,
                merge_goal: selectedGoal
            })
        });

        const result = await response.json();

        if (result.success) {
            // Hide loading overlay
            loadingOverlay.style.display = 'none';
            
            // Display merged result
            displayMergedResult(result.merged_chart);
            
            // Reload charts (all previous charts should be deactivated)
            await loadDietCharts();
            
            showNotification('Diet charts merged successfully! All previous charts have been replaced.', 'success');
        } else {
            throw new Error(result.message || 'Failed to merge diet charts');
        }
    } catch (error) {
        console.error('Error merging diet charts:', error);
        loadingOverlay.style.display = 'none';
        showNotification('Failed to merge diet charts. Please try again.', 'error');
    }
}

// Display merged diet chart result
function displayMergedResult(mergedChart) {
    const mergedResult = document.getElementById('mergedResult');
    const mergedContent = document.getElementById('mergedContent');

    const resultHtml = `
        <div class="diet-chart-container">
            <div class="chart-header">
                <h3>${mergedChart.chart_name}</h3>
                <div class="chart-subtitle">Goal: ${formatGoal(mergedChart.goal)} | Target: ${mergedChart.target_calories} cal/day</div>
            </div>
            
            <div class="chart-details" style="padding: 20px;">
                <div style="background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h4 style="color: #22543d; margin-bottom: 10px;">🎯 Optimization Summary</h4>
                    <p style="color: #2d5016;">${mergedChart.chart_data.optimization_notes}</p>
                    <p style="color: #2d5016;"><strong>Merged from ${mergedChart.chart_data.merged_from} diet charts</strong></p>
                </div>
                
                <div class="meal-plan">
                    <h4 style="color: #1e3c72; margin-bottom: 20px;">📅 Optimized Meal Plan</h4>
                    ${generateMealPlanTable(mergedChart.chart_data.meals, mergedChart.target_calories)}
                </div>
                
                <div style="background: linear-gradient(135deg, #e6f3ff 0%, #cce7ff 100%); padding: 20px; border-radius: 12px; margin-top: 20px;">
                    <h4 style="color: #1e3c72; margin-bottom: 10px;">💡 Next Steps</h4>
                    <ul style="color: #2c5aa0; margin: 0; padding-left: 20px;">
                        <li>Follow this optimized plan for 2-3 weeks</li>
                        <li>Track your progress and adjust portions as needed</li>
                        <li>Create new diet charts as your goals evolve</li>
                        <li>Merge again when you have multiple new charts</li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    mergedContent.innerHTML = resultHtml;
    mergedResult.style.display = 'block';
    
    // Scroll to result
    mergedResult.scrollIntoView({ behavior: 'smooth' });
}

// Generate meal plan table
function generateMealPlanTable(meals, targetCalories) {
    const mealTimes = {
        breakfast: { time: '7:00 AM', percentage: 0.25 },
        lunch: { time: '1:00 PM', percentage: 0.35 },
        dinner: { time: '7:00 PM', percentage: 0.30 },
        snacks: { time: '10:00 AM & 4:00 PM', percentage: 0.10 }
    };

    let tableHtml = `
        <table class="stylish-diet-table">
            <thead>
                <tr>
                    <th>⏰ Time</th>
                    <th>🍽️ Meal</th>
                    <th>🔥 Calories</th>
                    <th>🥗 Food Options</th>
                </tr>
            </thead>
            <tbody>
    `;

    Object.entries(meals).forEach(([mealType, mealOptions]) => {
        const mealInfo = mealTimes[mealType];
        if (mealInfo) {
            const calories = Math.round(targetCalories * mealInfo.percentage);
            const foodItems = Array.isArray(mealOptions) ? mealOptions.join(', ') : 'Balanced meal options';
            
            tableHtml += `
                <tr>
                    <td>${mealInfo.time}</td>
                    <td style="font-weight: bold; color: #1e3c72;">${mealType.charAt(0).toUpperCase() + mealType.slice(1)}</td>
                    <td style="font-weight: bold; color: #28a745;">${calories}</td>
                    <td>${foodItems}</td>
                </tr>
            `;
        }
    });

    tableHtml += '</tbody></table>';
    return tableHtml;
}

// Show notification to user
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(90deg, #28a745 0%, #20c997 100%)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(90deg, #dc3545 0%, #e74c3c 100%)';
    } else {
        notification.style.background = 'linear-gradient(90deg, #17a2b8 0%, #20c997 100%)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const mergeBtn = document.getElementById('mergeBtn');

    // Initialize auth state
    checkAuthState();

    // Logout button event listener
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Dark mode toggle
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-mode');
            setDarkMode(!isDark);
        });
    }

    // Load dark mode preference
    const darkPref = localStorage.getItem('darkMode');
    setDarkMode(darkPref === 'true');

    // Goal selection event listeners
    document.querySelectorAll('.goal-option').forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            document.querySelectorAll('.goal-option').forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            this.classList.add('selected');
            
            // Update selected goal
            selectedGoal = this.dataset.goal;
            
            // Update merge button state
            updateMergeButtonState();
        });
    });

    // Merge button event listener
    if (mergeBtn) {
        mergeBtn.addEventListener('click', mergeCharts);
    }
});

// Update merge button state
function updateMergeButtonState() {
    const mergeBtn = document.getElementById('mergeBtn');
    if (selectedCharts.length > 0 && selectedGoal) {
        mergeBtn.disabled = false;
        mergeBtn.textContent = `🔄 Merge ${selectedCharts.length} Chart${selectedCharts.length > 1 ? 's' : ''}`;
    } else {
        mergeBtn.disabled = true;
        mergeBtn.textContent = '🔄 Merge Selected Charts';
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .stylish-diet-table {
        width: 100%;
        border-collapse: collapse;
        margin: 0;
        background: white;
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
    
    .stylish-diet-table th {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 18px 15px;
        text-align: center;
        font-weight: 700;
        font-size: 16px;
        border-bottom: 3px solid #5a67d8;
    }
    
    .stylish-diet-table td {
        padding: 15px;
        border-bottom: 1px solid #e2e8f0;
        text-align: center;
        font-size: 14px;
        color: #2d3748;
        transition: all 0.3s ease;
    }
    
    .stylish-diet-table tr:nth-child(even) {
        background: #f7fafc;
    }
    
    .stylish-diet-table tr:hover {
        background: linear-gradient(135deg, #e6f0ff 0%, #f0f4ff 100%);
        transform: scale(1.01);
        box-shadow: 0 4px 8px rgba(102,126,234,0.2);
    }
`;
document.head.appendChild(style);
