// ==== Gemini API Key ====
// write your own api key here 
const GEMINI_API_KEY = "";

// User authentication state management
let currentUser = null;

// AI Learning Data Object - stores insights from each step
let aiLearningData = {
    userProfile: {},
    healthAnalysis: {},
    calorieAnalysis: {},
    dietaryStrategy: {},
    regionalPreferences: {},
    mealPlan: {},
    finalOptimization: {}
};

// Processing Steps Configuration
const PROCESSING_STEPS = [
    {
        id: 'profile',
        title: 'User Profile Analysis',
        description: 'Analyzing your physical metrics, goals, and lifestyle'
    },
    {
        id: 'health',
        title: 'Health & BMI Assessment',
        description: 'Evaluating health status and metabolic requirements'
    },
    {
        id: 'calories',
        title: 'Calorie Balance Analysis',
        description: 'Calculating optimal calorie intake vs burn ratio'
    },
    {
        id: 'dietary',
        title: 'Dietary Preference Strategy',
        description: 'Customizing food choices based on your preferences'
    },
    {
        id: 'regional',
        title: 'Regional Food Integration',
        description: 'Incorporating local and culturally appropriate foods'
    },
    {
        id: 'planning',
        title: 'Meal Plan Generation',
        description: 'Creating detailed meal schedules and portions'
    },
    {
        id: 'optimization',
        title: 'Final Optimization',
        description: 'Fine-tuning the diet chart for maximum effectiveness'
    }
];

// Check if user is logged in on page load
function checkAuthState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userName = localStorage.getItem('userName');

    if (isLoggedIn && userName) {
        currentUser = userName;
        showLoggedInState();
    } else {
        showLoggedOutState();
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

// Diet chart form handling
document.addEventListener('DOMContentLoaded', function() {
    const dietForm = document.getElementById('dietForm');
    const dietResult = document.getElementById('dietResult');
    const dietContent = document.getElementById('dietContent');
    const logoutBtn = document.getElementById('logoutBtn');
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Initialize auth state
    checkAuthState();

    // Logout button event listener--
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

    // Form submission with iterative AI processing
    dietForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get enhanced form data
        const formData = new FormData(dietForm);
        const userData = {
            name: formData.get('name'),
            age: parseInt(formData.get('age')),
            height: parseInt(formData.get('height')),
            weight: parseFloat(formData.get('weight')),
            caloriesIntake: parseInt(formData.get('caloriesIntake')),
            caloriesBurn: parseInt(formData.get('caloriesBurn')),
            country: formData.get('country'),
            dietaryPreference: formData.get('dietaryPreference'),
            goal: formData.get('goal'),
            exercises: formData.get('exercises'),
            allergies: formData.get('allergies') || 'None'
        };

        // Calculate BMI and other metrics
        const heightInMeters = userData.height / 100;
        const bmi = (userData.weight / (heightInMeters * heightInMeters)).toFixed(1);
        const calorieBalance = userData.caloriesIntake - userData.caloriesBurn;

        // Enhanced user data with calculations
        const enhancedUserData = {
            ...userData,
            bmi: parseFloat(bmi),
            calorieBalance: calorieBalance,
            bmr: calculateBMR(userData.weight, userData.height, userData.age, 'male'), // Default to male, can be enhanced
            bmiCategory: getBMICategory(parseFloat(bmi))
        };

        // Show result container and start iterative processing
        dietResult.style.display = 'block';
        await startIterativeProcessing(enhancedUserData);
    });
});

// Helper Functions
function calculateBMR(weight, height, age, gender) {
    // Mifflin-St Jeor Equation
    if (gender === 'male') {
        return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
}

function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

// Initialize Processing UI
function initializeProcessingUI() {
    const dietContent = document.getElementById('dietContent');
    
    let html = `
        <div class="progress-container">
            <div class="progress-bar" id="progressBar"></div>
        </div>
        <div class="progress-text" id="progressText">🚀 Starting AI Analysis...</div>
        
        <div class="ai-processing" id="aiProcessing">
            <h3 style="color: #1e3c72; margin-bottom: 20px;">🤖 AI Diet Chart Generation Process</h3>
    `;
    
    PROCESSING_STEPS.forEach((step, index) => {
        html += `
            <div class="processing-step" id="step-${step.id}">
                <div class="step-header">
                    <div class="step-number" id="stepNumber-${step.id}">${index + 1}</div>
                    <div class="step-title">${step.title}</div>
                </div>
                <div class="step-content">${step.description}</div>
                <div class="step-result" id="stepResult-${step.id}" style="display: none;"></div>
            </div>
        `;
    });
    
    html += '</div><div id="finalDietChart" style="display: none;"></div>';
    dietContent.innerHTML = html;
}

// Update Progress
function updateProgress(stepIndex, total) {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const percentage = ((stepIndex + 1) / total) * 100;
    
    progressBar.style.width = `${percentage}%`;
    const loadingEmojis = ['🧠', '💭', '⚡', '🔍', '📊', '🎯', '✨'];
    const currentEmoji = loadingEmojis[stepIndex] || '🤖';
    progressText.innerHTML = `${currentEmoji} Processing Step ${stepIndex + 1} of ${total}...`;
}

// Activate Step with Loading Animation
function activateStep(stepId) {
    const step = document.getElementById(`step-${stepId}`);
    const stepNumber = document.getElementById(`stepNumber-${stepId}`);
    
    // Add loading animation with step-specific emoji
    step.classList.add('step-active', 'step-loading');
    const stepEmojis = {
        'profile': '👤',
        'health': '🏥', 
        'calories': '⚡',
        'dietary': '🥗',
        'regional': '🌍',
        'planning': '📋',
        'optimization': '🎯'
    };
    const emoji = stepEmojis[stepId] || '🤖';
    stepNumber.innerHTML = `<div class="emoji-spinner">${emoji}</div>`;
    
    // Remove active class from all steps
    document.querySelectorAll('.processing-step').forEach(s => {
        s.classList.remove('active');
        s.querySelector('.step-number').classList.remove('active');
    });
    
    // Activate current step
    step.classList.add('active');
    stepNumber.classList.add('active');
}

// Complete Step with Animation
function completeStep(stepId, result) {
    const step = document.getElementById(`step-${stepId}`);
    const stepNumber = document.getElementById(`stepNumber-${stepId}`);
    const stepResult = document.getElementById(`stepResult-${stepId}`);
    
    // Remove loading, add completed state
    step.classList.remove('step-active', 'step-loading', 'active');
    step.classList.add('step-completed');
    
    // Success animation with step-specific celebration emoji
    const successEmojis = {
        'profile': '✅',
        'health': '💪', 
        'calories': '🔥',
        'dietary': '🌟',
        'regional': '🎊',
        'planning': '📈',
        'optimization': '🏆'
    };
    const successEmoji = successEmojis[stepId] || '🎉';
    stepNumber.innerHTML = `<div class="success-emoji">${successEmoji}</div>`;
    stepNumber.style.background = 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)';
    stepNumber.style.color = 'white';
    
    stepResult.innerHTML = result;
    stepResult.style.display = 'block';
    
    // Enhanced completion animations
    stepResult.style.animation = 'slideInFromLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    step.style.animation = 'pulseSuccess 0.6s ease-out';
}

// Main Iterative Processing Function
async function startIterativeProcessing(userData) {
    initializeProcessingUI();
    
    try {
        // Step 1: User Profile Analysis
        updateProgress(0, PROCESSING_STEPS.length);
        activateStep('profile');
        const profileAnalysis = await analyzeUserProfile(userData);
        completeStep('profile', profileAnalysis);
        await sleep(1000);
        
        // Step 2: Health & BMI Assessment
        updateProgress(1, PROCESSING_STEPS.length);
        activateStep('health');
        const healthAnalysis = await analyzeHealth(userData, aiLearningData.userProfile);
        completeStep('health', healthAnalysis);
        await sleep(1000);
        
        // Step 3: Calorie Balance Analysis
        updateProgress(2, PROCESSING_STEPS.length);
        activateStep('calories');
        const calorieAnalysis = await analyzeCalories(userData, aiLearningData);
        completeStep('calories', calorieAnalysis);
        await sleep(1000);
        
        // Step 4: Dietary Preference Strategy
        updateProgress(3, PROCESSING_STEPS.length);
        activateStep('dietary');
        const dietaryStrategy = await analyzeDietaryPreferences(userData, aiLearningData);
        completeStep('dietary', dietaryStrategy);
        await sleep(1000);
        
        // Step 5: Regional Food Integration
        updateProgress(4, PROCESSING_STEPS.length);
        activateStep('regional');
        const regionalAnalysis = await analyzeRegionalPreferences(userData, aiLearningData);
        completeStep('regional', regionalAnalysis);
        await sleep(1000);
        
        // Step 6: Meal Plan Generation
        updateProgress(5, PROCESSING_STEPS.length);
        activateStep('planning');
        const mealPlan = await generateMealPlan(userData, aiLearningData);
        completeStep('planning', mealPlan);
        await sleep(1000);
        
        // Step 7: Final Optimization
        updateProgress(6, PROCESSING_STEPS.length);
        activateStep('optimization');
        const finalChart = await optimizeDietChart(userData, aiLearningData);
        completeStep('optimization', 'Diet chart optimized and finalized!');
        
        // Show final diet chart
        document.getElementById('progressText').textContent = 'Complete! Your personalized diet chart is ready.';
        document.getElementById('finalDietChart').innerHTML = finalChart;
        document.getElementById('finalDietChart').style.display = 'block';
        
        // Add "Add Diet Chart" button
        addDietChartButton(userData, aiLearningData);
        
    } catch (error) {
        console.error('Error in iterative processing:', error);
        document.getElementById('dietContent').innerHTML = 
            '<div class="error">Error generating diet chart. Please try again.</div>';
    }
}

// Sleep function for delays
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// AI Analysis Functions for Each Step

// Step 1: User Profile Analysis
async function analyzeUserProfile(userData) {
    const prompt = `Analyze this user's profile for diet planning:
    
Name: ${userData.name}
Age: ${userData.age} years
Height: ${userData.height} cm
Weight: ${userData.weight} kg
BMI: ${userData.bmi} (${userData.bmiCategory})
Goal: ${userData.goal}
Exercises: ${userData.exercises}

Provide detailed analysis with:
1. **Physical Assessment**: BMI interpretation and body composition insights
2. **Goal Analysis**: How realistic and achievable the fitness goal is
3. **Activity Evaluation**: Exercise routine effectiveness for the goal
4. **Initial Recommendations**: 3-4 specific dietary suggestions to start with
5. **Key Focus Areas**: What should be prioritized in diet planning

Format with clear sections and bullet points. Include specific actionable advice.`;

    const result = await callGeminiAPI(prompt, userData);
    
    // Generate initial dietary suggestions based on profile
    const suggestions = generateProfileSuggestions(userData);
    
    aiLearningData.userProfile = {
        bmi: userData.bmi,
        bmiCategory: userData.bmiCategory,
        goal: userData.goal,
        activityLevel: extractActivityLevel(userData.exercises),
        analysis: result,
        suggestions: suggestions
    };
    
    // Generate progressive diet chart for Step 1 (basic chart)
    const progressiveChart = generateProgressiveDietChart(userData, 1, 'Profile-Based');
    
    return `${result}<br><br><strong>🎯 Immediate Action Items:</strong><br>${suggestions}<br><br>${progressiveChart}`;
}

// Step 2: Health & BMI Assessment
async function analyzeHealth(userData, profileData) {
    const prompt = `Based on the user profile analysis: "${profileData.analysis}"
    
Assess health status for: BMI ${userData.bmi} (${userData.bmiCategory}), Age ${userData.age}
BMR: ${userData.bmr} calories

Provide comprehensive health assessment with:
1. **BMI Health Analysis**: Detailed implications and health risks/benefits
2. **Metabolic Rate Insights**: How BMR affects daily nutrition needs
3. **Health Recommendations**: Specific dietary adjustments for health optimization
4. **Warning Signs**: What to watch out for with current health status
5. **Sample Meal Timing**: When to eat based on metabolic needs

Include specific calorie ranges and meal frequency recommendations.`;

    const result = await callGeminiAPI(prompt, userData);
    
    // Generate health-based dietary suggestions
    const healthSuggestions = generateHealthSuggestions(userData);
    
    aiLearningData.healthAssessment = {
        bmr: userData.bmr,
        healthRisks: getHealthRisks(userData.bmiCategory),
        recommendations: result,
        suggestions: healthSuggestions
    };
    
    // Generate progressive diet chart for Step 2 (refines Step 1)
    const progressiveChart = generateProgressiveDietChart(userData, 2, 'Health-Focused');
    
    return `${result}<br><br><strong>🏥 Health-Based Diet Recommendations:</strong><br>${healthSuggestions}<br><br>${progressiveChart}`;
}

// Step 3: Calorie Balance Analysis
async function analyzeCalories(userData, learningData) {
    const prompt = `Based on previous analysis:
Profile: "${learningData.userProfile.analysis}"
Health: "${learningData.healthAssessment.recommendations}"

Analyze calorie balance:
Daily Intake: ${userData.caloriesIntake} calories
Daily Burn: ${userData.caloriesBurn} calories
BMR: ${userData.bmr} calories
Goal: ${userData.goal}

Provide comprehensive calorie optimization with:
1. **Current Balance Analysis**: Surplus/deficit breakdown and implications
2. **Optimal Target Calories**: Specific daily calorie goals for the fitness goal
3. **Meal Distribution Strategy**: How to split calories across meals (breakfast, lunch, dinner, snacks)
4. **Timing Optimization**: When to eat larger vs smaller meals
5. **Sample Daily Schedule**: Example calorie distribution with timing
6. **Adjustment Guidelines**: How to modify based on progress

Include specific numbers and meal examples.`;

    const result = await callGeminiAPI(prompt, userData);
    const calorieBalance = userData.caloriesIntake - userData.caloriesBurn;
    const targetCalories = calculateOptimalCalories(userData, learningData);
    
    // Generate calorie-based meal suggestions
    const calorieSuggestions = generateCalorieSuggestions(userData, targetCalories);
    
    aiLearningData.calorieStrategy = {
        balance: calorieBalance,
        targetCalories: targetCalories,
        strategy: result,
        mealDistribution: calorieSuggestions
    };
    
    // Generate progressive diet chart for Step 3 (refines Step 2)
    const progressiveChart = generateProgressiveDietChart(userData, 3, 'Calorie-Optimized');
    
    return `${result}<br><br><strong>⚡ Calorie Strategy Implementation:</strong><br>${calorieSuggestions}<br><br>${progressiveChart}`;
}

// Step 4: Dietary Preference Strategy
async function analyzeDietaryPreferences(userData, learningData) {
    try {
        // Safely access dietary preferences with fallback
        const dietType = userData.dietaryPreferences || userData.dietary_preferences || 'vegetarian';
        const allergies = userData.allergies || 'None';
        const targetCalories = learningData.calorieStrategy?.targetCalories || 2000;
        
        console.log('Step 4 - Diet Type:', dietType, 'Allergies:', allergies);
        
        const prompt = `Based on accumulated insights:
Profile: "${learningData.userProfile.analysis}"
Health: "${learningData.healthAssessment.recommendations}"
Calories: "${learningData.calorieStrategy.strategy}"

Analyze dietary preferences:
Diet Type: ${dietType}
Allergies: ${allergies}
Target Calories: ${targetCalories}

Provide comprehensive dietary strategy with:
1. **Protein Strategy**: Best protein sources for this diet type and fitness goal
2. **Nutrient Optimization**: Key vitamins/minerals to focus on
3. **Food Restrictions Management**: How to work around allergies/restrictions
4. **Meal Variety Plan**: 7-day rotation ideas to prevent boredom
5. **Shopping List**: Top 15 foods to buy for this dietary approach
6. **Preparation Tips**: Easy meal prep ideas for busy days

Include specific food names and preparation methods.`;

        const result = await callGeminiAPI(prompt, userData);
        
        // Generate dietary preference-based suggestions
        const dietarySuggestions = generateDietarySuggestions(userData);
        
        aiLearningData.dietaryStrategy = {
            preferences: dietType,
            proteinSources: getProteinSources(dietType),
            restrictions: allergies,
            strategy: result,
            foodList: dietarySuggestions
        };
        
        // Generate progressive diet chart for Step 4 (refines Step 3)
        const progressiveChart = generateProgressiveDietChart(userData, 4, 'Preference-Aligned');
        
        return `${result}<br><br><strong>🥗 Dietary Preference Action Plan:</strong><br>${dietarySuggestions}<br><br>${progressiveChart}`;
    } catch (error) {
        console.error('Error in analyzeDietaryPreferences:', error);
        
        // Return fallback response for step 4
        const fallbackSuggestions = generateDietarySuggestions(userData);
        
        aiLearningData.dietaryStrategy = {
            preferences: userData.dietaryPreferences || 'vegetarian',
            proteinSources: ['Varied protein sources'],
            restrictions: userData.allergies || 'None',
            strategy: 'Dietary strategy analysis completed with basic recommendations.',
            foodList: fallbackSuggestions
        };
        
        return `<strong>✅ Dietary Preference Strategy Completed:</strong><br><br>
        <strong>🥗 Dietary Preference Action Plan:</strong><br>${fallbackSuggestions}`;
    }
}

// Step 5: Regional Food Integration
async function analyzeRegionalPreferences(userData, learningData) {
    try {
        // Safely access data with fallbacks
        const region = userData.region || 'Global';
        const dietType = userData.dietaryPreferences || userData.dietary_preferences || 'vegetarian';
        const targetCalories = learningData.calorieStrategy?.targetCalories || 2000;
        const dietaryStrategy = learningData.dietaryStrategy?.strategy || 'Basic dietary approach';
        
        console.log('Step 5 - Region:', region, 'Diet Type:', dietType);
        
        const prompt = `Integrating regional preferences with established strategy:
Dietary Strategy: "${dietaryStrategy}"
Region: ${region}
Diet Type: ${dietType}
Target Calories: ${targetCalories}

Provide comprehensive regional food integration with:
1. **Local Superfoods**: Top regional foods that align with fitness goals
2. **Cultural Meal Patterns**: Traditional eating schedules and how to optimize them
3. **Seasonal Menu Planning**: What to eat in different seasons for best results
4. **Regional Recipe Adaptations**: Healthy versions of traditional dishes
5. **Local Market Guide**: Where to find the best ingredients in this region
6. **Sample Regional Meals**: 3 breakfast, lunch, and dinner ideas using local foods

Include specific dish names, ingredients, and cooking methods from this region.`;

        const result = await callGeminiAPI(prompt, userData);
        
        // Generate region-specific meal suggestions
        const regionalSuggestions = generateRegionalSuggestions(userData);
        
        aiLearningData.regionalIntegration = {
            region: region,
            localFoods: getRegionalFoods(region),
            integration: result,
            regionalMeals: regionalSuggestions
        };
        
        // Generate progressive diet chart for Step 5 (refines Step 4)
        const progressiveChart = generateProgressiveDietChart(userData, 5, 'Regional-Integrated');
        
        return `${result}<br><br><strong>🌍 Regional Integration Plan:</strong><br>${regionalSuggestions}<br><br>${progressiveChart}`;
    } catch (error) {
        console.error('Error in analyzeRegionalPreferences:', error);
        
        const fallbackSuggestions = generateRegionalSuggestions(userData);
        
        aiLearningData.regionalIntegration = {
            region: userData.region || 'Global',
            localFoods: ['Local seasonal foods'],
            integration: 'Regional food integration completed with basic recommendations.',
            regionalMeals: fallbackSuggestions
        };
        
        return `<strong>✅ Regional Food Integration Completed:</strong><br><br>
        <strong>🌍 Regional Meal Suggestions:</strong><br>${fallbackSuggestions}`;
    }
}

// Step 6: Meal Plan Generation
async function generateMealPlan(userData, learningData) {
    try {
        // Safely access data with fallbacks
        const goal = learningData.userProfile?.goal || userData.goal || 'General fitness';
        const targetCalories = learningData.calorieStrategy?.targetCalories || 2000;
        const dietType = learningData.dietaryStrategy?.preferences || userData.dietaryPreferences || 'vegetarian';
        const region = learningData.regionalIntegration?.region || userData.region || 'Global';
        
        console.log('Step 6 - Goal:', goal, 'Calories:', targetCalories, 'Diet:', dietType);
        
        const prompt = `Generate comprehensive meal plan using all insights:
Profile: ${goal}
Calorie Target: ${targetCalories}
Diet Type: ${dietType}
Region: ${region}

Create detailed meal plan with:
1. **7-Day Meal Schedule**: Complete breakfast, lunch, dinner, and snack plans
2. **Portion Size Guide**: Exact measurements and serving sizes
3. **Meal Timing Strategy**: Optimal eating schedule for metabolism
4. **Hydration Protocol**: Water intake recommendations throughout the day
5. **Supplement Plan**: Essential vitamins/minerals and timing
6. **Meal Prep Instructions**: How to prepare meals in advance
7. **Emergency Options**: Quick healthy meals for busy days

Include specific recipes, cooking times, and nutritional breakdowns.`;

        const result = await callGeminiAPI(prompt, userData);
        
        // Generate detailed meal plan preview
        const mealPlanPreview = generateMealPlanPreview(learningData);
        
        aiLearningData.mealPlan = {
            schedule: generateMealSchedule(learningData),
            portions: calculatePortions(learningData),
            plan: result,
            preview: mealPlanPreview
        };
        
        // Generate progressive diet chart for Step 6 (refines Step 5)
        const progressiveChart = generateProgressiveDietChart(userData, 6, 'Complete-Meal-Plan');
        
        return `${result}<br><br><strong>📅 7-Day Meal Plan Preview:</strong><br>${mealPlanPreview}<br><br>${progressiveChart}`;
    } catch (error) {
        console.error('Error in generateMealPlan:', error);
        
        const fallbackPreview = generateMealPlanPreview(learningData);
        
        aiLearningData.mealPlan = {
            schedule: generateMealSchedule(learningData),
            portions: calculatePortions(learningData),
            plan: 'Meal plan generation completed with basic structure.',
            preview: fallbackPreview
        };
        
        return `<strong>✅ Meal Plan Generation Completed:</strong><br><br>
        <strong>📅 7-Day Meal Plan Preview:</strong><br>${fallbackPreview}`;
    }
}

// Step 7: Final Optimization Summary (No Diet Chart)
async function optimizeDietChart(userData, learningData) {
    try {
        console.log('Step 7 - Final optimization starting...');
        
        // Generate final optimization summary only
        const optimizationSummary = generateOptimizationSummary(learningData);
        
        // Return only the completion summary without diet chart
        return `<div class="optimization-summary"><strong>🎯 Final Optimization Complete!</strong><br>${optimizationSummary}</div>
        <div class="completion-message">
            <h3>✅ AI Diet Analysis Complete!</h3>
            <p>Your personalized diet recommendations have been generated through 7 comprehensive steps. Each step above contains specific insights and mini diet charts tailored to your profile.</p>
            <p><strong>💡 Review each step above for detailed nutritional guidance and meal suggestions.</strong></p>
        </div>`;
    } catch (error) {
        console.error('Error in optimizeDietChart:', error);
        
        const optimizationSummary = generateOptimizationSummary(learningData);
        
        return `<div class="optimization-summary"><strong>🎯 Final Optimization Complete!</strong><br>${optimizationSummary}</div>
        <div class="completion-message">
            <h3>✅ AI Diet Analysis Complete!</h3>
            <p>Your personalized diet recommendations have been generated. Review the steps above for detailed guidance.</p>
        </div>`;
    }
}

// Initialize Google GenAI
let genAI;

// Initialize the AI client
function initializeGenAI() {
    try {
        // Use the main API key defined at the top
        return GEMINI_API_KEY;
    } catch (error) {
        console.error('Failed to initialize GenAI:', error);
        return null;
    }
}

// Gemini API Call Function using new approach
async function callGeminiAPI(prompt, userData = null) {
    try {
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        console.log('Making API call to Gemini 1.5 Flash with user data:', userData?.name || 'Unknown');
        
        const requestBody = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.8,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('API Response received successfully');
        
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            const responseText = data.candidates[0].content.parts[0].text;
            return formatResponse(responseText);
        } else if (data?.error) {
            console.error('Gemini API Error:', data.error);
            throw new Error(data.error.message || 'API returned an error');
        } else {
            console.warn('Unexpected API response structure:', data);
            return generateDynamicFallbackResponse(userData);
        }
    } catch (error) {
        console.error('API Call Failed:', error);
        return generateDynamicFallbackResponse(userData);
    }
}

// Generate dynamic fallback response based on user data
function generateDynamicFallbackResponse(userData) {
    if (!userData) {
        return generateGenericFallbackResponse();
    }
    
    const name = userData.name || 'User';
    const goal = userData.goal || 'general fitness';
    const bmi = userData.bmi || 'unknown';
    const targetCalories = userData.caloriesIntake || userData.bmr || 2000;
    const dietType = userData.dietaryPreference || userData.dietaryPreferences || 'balanced';
    const country = userData.country || userData.region || 'your region';
    
    let goalSpecificAdvice = '';
    if (goal.toLowerCase().includes('weight loss') || goal.toLowerCase().includes('lose')) {
        goalSpecificAdvice = `
<strong>🎯 Weight Loss Strategy for ${name}:</strong><br>
• Create a moderate calorie deficit of 300-500 calories daily<br>
• Focus on high-protein, high-fiber foods to maintain satiety<br>
• Include strength training to preserve muscle mass<br>
• Aim for 1-2 pounds of weight loss per week<br>`;
    } else if (goal.toLowerCase().includes('weight gain') || goal.toLowerCase().includes('gain') || goal.toLowerCase().includes('muscle')) {
        goalSpecificAdvice = `
<strong>🎯 Weight/Muscle Gain Strategy for ${name}:</strong><br>
• Create a moderate calorie surplus of 300-500 calories daily<br>
• Prioritize protein intake: 1.6-2.2g per kg body weight<br>
• Include complex carbs around workouts for energy<br>
• Focus on compound exercises and progressive overload<br>`;
    } else {
        goalSpecificAdvice = `
<strong>🎯 Fitness Maintenance Strategy for ${name}:</strong><br>
• Maintain current calorie balance with focus on nutrient quality<br>
• Emphasize whole foods and balanced macronutrients<br>
• Include variety in your exercise routine<br>
• Monitor energy levels and adjust as needed<br>`;
    }
    
    let dietSpecificAdvice = '';
    if (dietType.toLowerCase().includes('vegetarian') || dietType.toLowerCase().includes('vegan')) {
        dietSpecificAdvice = `
<strong>🥗 ${dietType} Diet Optimization:</strong><br>
• Combine legumes + grains for complete protein profiles<br>
• Include B12 supplement and iron-rich foods with vitamin C<br>
• Focus on quinoa, lentils, chickpeas, and tofu for protein variety<br>
• Ensure adequate omega-3s from flax, chia, and walnuts<br>`;
    } else if (dietType.toLowerCase().includes('non-vegetarian')) {
        dietSpecificAdvice = `
<strong>🍖 Non-Vegetarian Diet Optimization:</strong><br>
• Choose lean proteins: chicken breast, fish, turkey, lean beef<br>
• Include fatty fish 2-3 times per week for omega-3s<br>
• Balance animal proteins with plant-based options<br>
• Limit processed meats and focus on whole food sources<br>`;
    }
    
    return `<strong>✅ Personalized Analysis for ${name} (BMI: ${bmi}):</strong><br>
<strong>🎯 Your Goal: ${goal}</strong><br>
<strong>📊 Target Calories: ${targetCalories} per day</strong><br>
<strong>🌍 Regional Focus: ${country}</strong><br>
${goalSpecificAdvice}
${dietSpecificAdvice}
<strong>🍽️ Daily Meal Structure for ${name}:</strong><br>
• Breakfast (${Math.round(targetCalories * 0.25)} cal): Protein-rich start with complex carbs<br>
• Mid-Morning (${Math.round(targetCalories * 0.10)} cal): Light, nutritious snack<br>
• Lunch (${Math.round(targetCalories * 0.35)} cal): Largest meal with balanced macros<br>
• Evening (${Math.round(targetCalories * 0.10)} cal): Energy-boosting snack<br>
• Dinner (${Math.round(targetCalories * 0.20)} cal): Light, protein-focused meal<br>
<strong>💧 Hydration Protocol for ${name}:</strong><br>
• Start day with 2 glasses of water<br>
• Drink water 30 minutes before each meal<br>
• Aim for 8-10 glasses throughout the day<br>
• Include herbal teas between meals<br>
<strong>📅 Weekly Success Tips:</strong><br>
• Meal prep 2-3 days of proteins in advance<br>
• Track your progress and adjust portions based on results<br>
• Include variety to prevent boredom and ensure nutrients<br>
• Listen to your body and adjust timing as needed<br>
<em>💡 This personalized plan is tailored specifically for ${name}'s ${goal} goal. Monitor progress and adjust as needed.</em>`;
}

// Generate generic fallback response
function generateGenericFallbackResponse() {
    return `<strong>✅ Analysis completed with expert nutritional recommendations:</strong><br>
<strong>🎯 Immediate Action Items:</strong><br>
• Calculate your daily calorie needs: BMR × activity factor<br>
• Focus on balanced macronutrients: 40% carbs, 30% protein, 30% fats<br>
• Eat protein with every meal for muscle maintenance<br>
• Include 5-7 servings of fruits and vegetables daily<br>
<strong>🍽️ Meal Structure Recommendations:</strong><br>
• Breakfast (25%): Protein + complex carbs + healthy fats<br>
• Lunch (35%): Largest meal with complete nutrition<br>
• Dinner (30%): Lighter, protein-focused meal<br>
• Snacks (10%): Nutrient-dense options between meals<br>
<strong>💧 Hydration & Timing:</strong><br>
• Drink 8-10 glasses of water daily<br>
• Eat every 3-4 hours to maintain energy<br>
• Stop eating 2-3 hours before bedtime<br>
<strong>📊 Weekly Planning:</strong><br>
• Meal prep 2-3 days of proteins in advance<br>
• Rotate food choices to ensure nutrient variety<br>
• Track progress and adjust portions as needed<br>
<em>💡 Note: This comprehensive plan provides expert-level guidance. For personalized adjustments, consult with a registered dietitian.</em>`;
}

// Progressive Diet Chart Storage
let progressiveDietChart = {
    step1: null,
    step2: null,
    step3: null,
    step4: null,
    step5: null,
    step6: null
};

// Generate Progressive Diet Chart for each step
function generateProgressiveDietChart(userData, stepNumber, chartType) {
    const targetCalories = userData.caloriesIntake || userData.bmr || 2000;
    const name = userData.name || 'User';
    const goal = userData.goal || 'general fitness';
    const dietType = userData.dietaryPreference || userData.dietaryPreferences || 'balanced';
    
    let meals = [];
    let refinements = [];
    
    // Base meal structure that gets refined with each step
    const baseMeals = [
        {
            time: '7:00 AM',
            name: 'Breakfast',
            calories: Math.round(targetCalories * 0.25),
            foods: 'Protein-rich breakfast with complex carbs',
            macros: `P: ${Math.round(targetCalories * 0.25 * 0.25 / 4)}g, C: ${Math.round(targetCalories * 0.25 * 0.45 / 4)}g, F: ${Math.round(targetCalories * 0.25 * 0.30 / 9)}g`
        },
        {
            time: '10:30 AM',
            name: 'Mid-Morning',
            calories: Math.round(targetCalories * 0.10),
            foods: 'Light nutritious snack',
            macros: `P: ${Math.round(targetCalories * 0.10 * 0.20 / 4)}g, C: ${Math.round(targetCalories * 0.10 * 0.60 / 4)}g, F: ${Math.round(targetCalories * 0.10 * 0.20 / 9)}g`
        },
        {
            time: '1:00 PM',
            name: 'Lunch',
            calories: Math.round(targetCalories * 0.35),
            foods: 'Balanced meal with all macronutrients',
            macros: `P: ${Math.round(targetCalories * 0.35 * 0.25 / 4)}g, C: ${Math.round(targetCalories * 0.35 * 0.45 / 4)}g, F: ${Math.round(targetCalories * 0.35 * 0.30 / 9)}g`
        },
        {
            time: '4:00 PM',
            name: 'Evening',
            calories: Math.round(targetCalories * 0.10),
            foods: 'Energy-boosting snack',
            macros: `P: ${Math.round(targetCalories * 0.10 * 0.25 / 4)}g, C: ${Math.round(targetCalories * 0.10 * 0.50 / 4)}g, F: ${Math.round(targetCalories * 0.10 * 0.25 / 9)}g`
        },
        {
            time: '7:00 PM',
            name: 'Dinner',
            calories: Math.round(targetCalories * 0.20),
            foods: 'Light, protein-focused meal',
            macros: `P: ${Math.round(targetCalories * 0.20 * 0.35 / 4)}g, C: ${Math.round(targetCalories * 0.20 * 0.35 / 4)}g, F: ${Math.round(targetCalories * 0.20 * 0.30 / 9)}g`
        }
    ];
    
    // Refine meals based on step
    switch(stepNumber) {
        case 1:
            meals = baseMeals.map(meal => ({
                ...meal,
                foods: getStepSpecificFoods(meal.name, 'profile', userData)
            }));
            refinements = [`Step 1: Basic meal structure created for ${name}'s ${goal} goal`];
            break;
            
        case 2:
            meals = baseMeals.map(meal => ({
                ...meal,
                foods: getStepSpecificFoods(meal.name, 'health', userData),
                calories: adjustCaloriesForHealth(meal.calories, userData)
            }));
            refinements = [
                `Step 1: Basic meal structure created for ${name}'s ${goal} goal`,
                `Step 2: Health-optimized portions for BMI ${userData.bmi} (${userData.bmiCategory})`
            ];
            break;
            
        case 3:
            meals = baseMeals.map(meal => ({
                ...meal,
                foods: getStepSpecificFoods(meal.name, 'calories', userData),
                calories: adjustCaloriesForGoal(meal.calories, userData)
            }));
            refinements = [
                `Step 1: Basic meal structure created`,
                `Step 2: Health-optimized portions`,
                `Step 3: Calorie distribution optimized for ${targetCalories} daily target`
            ];
            break;
            
        case 4:
            meals = baseMeals.map(meal => ({
                ...meal,
                foods: getStepSpecificFoods(meal.name, 'dietary', userData),
                calories: adjustCaloriesForGoal(meal.calories, userData)
            }));
            refinements = [
                `Step 1-3: Foundation established`,
                `Step 4: Food choices aligned with ${dietType} preferences`
            ];
            break;
            
        case 5:
            meals = baseMeals.map(meal => ({
                ...meal,
                foods: getStepSpecificFoods(meal.name, 'regional', userData),
                calories: adjustCaloriesForGoal(meal.calories, userData)
            }));
            refinements = [
                `Step 1-4: Core structure and preferences set`,
                `Step 5: Regional foods from ${userData.country || 'your region'} integrated`
            ];
            break;
            
        case 6:
            meals = baseMeals.map(meal => ({
                ...meal,
                foods: getStepSpecificFoods(meal.name, 'complete', userData),
                calories: adjustCaloriesForGoal(meal.calories, userData)
            }));
            refinements = [
                `Step 1-5: All optimizations applied`,
                `Step 6: Complete meal plan with detailed portions and timing`
            ];
            break;
    }
    
    const chartData = {
        meals: meals,
        refinements: refinements,
        totalCalories: meals.reduce((total, meal) => total + meal.calories, 0),
        chartType: chartType,
        stepLevel: stepNumber
    };
    
    // Store the chart data for later use
    progressiveDietChart[`step${stepNumber}`] = chartData;
    
    return generateMiniDietChart(chartData, stepNumber, chartType);
}

// Generate step-specific foods
function getStepSpecificFoods(mealName, stepType, userData) {
    const dietType = (userData.dietaryPreference || userData.dietaryPreferences || 'balanced').toLowerCase();
    const country = (userData.country || userData.region || 'global').toLowerCase();
    
    const foodOptions = {
        'Breakfast': {
            profile: 'Oats with fruits and nuts',
            health: 'High-fiber oats with berries and almonds',
            calories: 'Portion-controlled oats with measured fruits',
            dietary: getDietaryBreakfast(dietType),
            regional: getRegionalBreakfast(country, dietType),
            complete: getCompleteBreakfast(country, dietType, userData)
        },
        'Mid-Morning': {
            profile: 'Fresh fruit',
            health: 'Antioxidant-rich berries',
            calories: 'Measured fruit portion',
            dietary: getDietarySnack(dietType, 'morning'),
            regional: getRegionalSnack(country, 'morning'),
            complete: getCompleteSnack(country, dietType, 'morning')
        },
        'Lunch': {
            profile: 'Balanced meal with protein and carbs',
            health: 'Nutrient-dense complete meal',
            calories: 'Calorie-optimized balanced meal',
            dietary: getDietaryLunch(dietType),
            regional: getRegionalLunch(country, dietType),
            complete: getCompleteLunch(country, dietType, userData)
        },
        'Evening': {
            profile: 'Light snack',
            health: 'Energy-sustaining snack',
            calories: 'Portion-controlled snack',
            dietary: getDietarySnack(dietType, 'evening'),
            regional: getRegionalSnack(country, 'evening'),
            complete: getCompleteSnack(country, dietType, 'evening')
        },
        'Dinner': {
            profile: 'Light protein meal',
            health: 'Easily digestible dinner',
            calories: 'Light, protein-focused meal',
            dietary: getDietaryDinner(dietType),
            regional: getRegionalDinner(country, dietType),
            complete: getCompleteDinner(country, dietType, userData)
        }
    };
    
    return foodOptions[mealName]?.[stepType] || 'Balanced meal option';
}

// Helper functions for dietary-specific foods
function getDietaryBreakfast(dietType) {
    if (dietType.includes('vegetarian') || dietType.includes('vegan')) {
        return 'Plant-based protein smoothie with oats';
    } else if (dietType.includes('non-vegetarian')) {
        return 'Eggs with whole grain toast';
    }
    return 'Protein-rich breakfast option';
}

function getDietaryLunch(dietType) {
    if (dietType.includes('vegetarian')) {
        return 'Lentil curry with brown rice and vegetables';
    } else if (dietType.includes('non-vegetarian')) {
        return 'Grilled chicken with quinoa and vegetables';
    }
    return 'Balanced protein and carb meal';
}

function getDietaryDinner(dietType) {
    if (dietType.includes('vegetarian')) {
        return 'Tofu stir-fry with vegetables';
    } else if (dietType.includes('non-vegetarian')) {
        return 'Grilled fish with steamed vegetables';
    }
    return 'Light protein-focused meal';
}

function getDietarySnack(dietType, timing) {
    if (dietType.includes('vegetarian') || dietType.includes('vegan')) {
        return timing === 'morning' ? 'Mixed nuts and fruits' : 'Hummus with vegetables';
    } else if (dietType.includes('non-vegetarian')) {
        return timing === 'morning' ? 'Greek yogurt with berries' : 'Boiled eggs';
    }
    return 'Healthy snack option';
}

// Helper functions for regional foods
function getRegionalBreakfast(country, dietType) {
    if (country.includes('india')) {
        if (dietType.includes('vegetarian') || dietType.includes('vegan')) {
            return 'Poha (1 cup), mixed vegetables (1/2 cup), green tea (1 cup)';
        } else if (dietType.includes('non-vegetarian')) {
            return 'Egg paratha (2 pieces), curd (1/2 cup), pickle (1 tsp)';
        } else {
            return 'Upma (1 cup), sambar (1/2 cup), coconut chutney (2 tbsp)';
        }
    } else if (country.includes('usa') || country.includes('canada') || country.includes('america')) {
        if (dietType.includes('vegetarian')) {
            return 'Oatmeal (1 cup), blueberries (1/2 cup), almonds (10 pieces)';
        } else {
            return 'Scrambled eggs (2), whole wheat toast (2 slices), avocado (1/2)';
        }
    } else if (country.includes('uk') || country.includes('britain')) {
        return 'Porridge (1 bowl), banana (1), walnuts (5 pieces)';
    } else if (country.includes('japan')) {
        return 'Miso soup (1 bowl), steamed rice (1/2 cup), grilled fish (100g)';
    } else if (country.includes('china')) {
        return 'Congee (1 bowl), steamed vegetables (1/2 cup), green tea (1 cup)';
    }
    return 'Oats (1 cup), seasonal fruits (1/2 cup), nuts (10 pieces)';
}

function getRegionalLunch(country, dietType) {
    if (country.includes('india')) {
        if (dietType.includes('vegetarian') || dietType.includes('vegan')) {
            return 'Brown rice (1 cup), dal (1 cup), mixed vegetables (1 cup), salad (1 bowl), buttermilk (1 glass)';
        } else if (dietType.includes('non-vegetarian')) {
            return 'Brown rice (1 cup), chicken curry (150g), vegetables (1/2 cup), salad (1 bowl)';
        } else {
            return 'Roti (2 pieces), dal (1 cup), paneer curry (100g), vegetables (1/2 cup)';
        }
    } else if (country.includes('usa') || country.includes('canada') || country.includes('america')) {
        if (dietType.includes('vegetarian')) {
            return 'Quinoa salad (1.5 cups), black beans (1/2 cup), avocado (1/2), mixed greens (2 cups)';
        } else {
            return 'Grilled chicken breast (150g), quinoa (1 cup), steamed broccoli (1 cup)';
        }
    } else if (country.includes('uk') || country.includes('britain')) {
        return 'Lentil soup (1 bowl), whole grain bread (2 slices), mixed salad (1 bowl)';
    } else if (country.includes('japan')) {
        return 'Bento box: rice (1 cup), grilled fish (100g), pickled vegetables (1/2 cup), miso soup (1 bowl)';
    } else if (country.includes('china')) {
        return 'Stir-fried tofu (150g), brown rice (1 cup), mixed vegetables (1 cup), green tea (1 cup)';
    }
    return 'Brown rice (1 cup), lentils (1 cup), mixed vegetables (1 cup), salad (1 bowl)';
}

function getRegionalDinner(country, dietType) {
    if (country.includes('india')) {
        if (dietType.includes('vegetarian') || dietType.includes('vegan')) {
            return 'Roti (2 pieces), dal (1/2 cup), mixed vegetables (1/2 cup), salad (1 small bowl)';
        } else if (dietType.includes('non-vegetarian')) {
            return 'Roti (2 pieces), fish curry (100g), steamed vegetables (1/2 cup)';
        } else {
            return 'Chapati (2 pieces), light curry (1/2 cup), steamed vegetables (1/2 cup)';
        }
    } else if (country.includes('usa') || country.includes('canada') || country.includes('america')) {
        if (dietType.includes('vegetarian')) {
            return 'Baked sweet potato (1 medium), black bean salad (1/2 cup), steamed broccoli (1 cup)';
        } else {
            return 'Baked salmon (120g), roasted vegetables (1 cup), quinoa (1/2 cup)';
        }
    } else if (country.includes('uk') || country.includes('britain')) {
        return 'Grilled fish (120g), mashed cauliflower (1/2 cup), steamed green beans (1/2 cup)';
    } else if (country.includes('japan')) {
        return 'Grilled fish (100g), steamed rice (1/2 cup), miso soup (1 bowl), pickled vegetables (1/4 cup)';
    } else if (country.includes('china')) {
        return 'Steamed fish (100g), brown rice (1/2 cup), stir-fried vegetables (1/2 cup)';
    }
    return 'Grilled protein (100g), steamed vegetables (1 cup), whole grains (1/2 cup)';
}

function getRegionalSnack(country, timing) {
    if (country.includes('india')) {
        if (timing === 'morning') {
            return 'Apple (1 medium), green tea (1 cup)';
        } else {
            return 'Roasted chana (1/4 cup), green tea (1 cup)';
        }
    } else if (country.includes('usa') || country.includes('canada') || country.includes('america')) {
        if (timing === 'morning') {
            return 'Greek yogurt (1/2 cup), berries (1/4 cup)';
        } else {
            return 'Mixed nuts (10 pieces), herbal tea (1 cup)';
        }
    } else if (country.includes('uk') || country.includes('britain')) {
        return timing === 'morning' ? 'Banana (1 medium), green tea (1 cup)' : 'Oatcakes (2 pieces), herbal tea (1 cup)';
    } else if (country.includes('japan')) {
        return timing === 'morning' ? 'Green tea (1 cup), rice crackers (3 pieces)' : 'Edamame (1/4 cup), green tea (1 cup)';
    } else if (country.includes('china')) {
        return timing === 'morning' ? 'Green tea (1 cup), steamed bun (1 small)' : 'Herbal tea (1 cup), dried fruits (2 tbsp)';
    }
    return timing === 'morning' ? 'Seasonal fruit (1 medium), green tea (1 cup)' : 'Mixed nuts (10 pieces), herbal tea (1 cup)';
}

// Complete meal functions (most detailed)
function getCompleteBreakfast(country, dietType, userData) {
    const goal = (userData.goal || '').toLowerCase();
    const bmiCategory = (userData.bmiCategory || '').toLowerCase();
    
    if (country.includes('india')) {
        if (goal.includes('weight loss') || goal.includes('lose')) {
            if (dietType.includes('vegetarian')) {
                return 'Vegetable upma (3/4 cup), green tea (1 cup), cucumber slices (1/2 cup)';
            } else {
                return 'Egg white omelette (3 whites), whole wheat toast (1 slice), green tea (1 cup)';
            }
        } else if (goal.includes('weight gain') || goal.includes('muscle') || goal.includes('gain')) {
            if (dietType.includes('vegetarian')) {
                return 'Moong dal chilla (3 pieces), mint chutney (2 tbsp), banana (1 medium), milk (1 glass)';
            } else {
                return 'Egg paratha (2 pieces), curd (1/2 cup), banana (1 medium), milk (1 glass)';
            }
        } else {
            if (dietType.includes('vegetarian')) {
                return 'Oats upma (1 cup), mixed vegetables (1/2 cup), almonds (8 pieces), green tea (1 cup)';
            } else {
                return 'Scrambled eggs (2), whole wheat toast (2 slices), orange juice (1 glass)';
            }
        }
    } else if (country.includes('usa') || country.includes('canada') || country.includes('america')) {
        if (goal.includes('weight loss') || goal.includes('lose')) {
            return 'Greek yogurt (1/2 cup), berries (1/2 cup), chia seeds (1 tbsp), green tea (1 cup)';
        } else if (goal.includes('weight gain') || goal.includes('muscle') || goal.includes('gain')) {
            return 'Protein smoothie (1 cup), oatmeal (1 cup), banana (1), peanut butter (2 tbsp)';
        } else {
            return 'Oatmeal (1 cup), blueberries (1/2 cup), walnuts (6 pieces), coffee (1 cup)';
        }
    } else if (country.includes('uk') || country.includes('britain')) {
        if (goal.includes('weight loss')) {
            return 'Porridge (1/2 cup), strawberries (1/2 cup), green tea (1 cup)';
        } else if (goal.includes('muscle') || goal.includes('gain')) {
            return 'Full English breakfast: eggs (2), baked beans (1/2 cup), whole grain toast (2 slices)';
        } else {
            return 'Porridge (3/4 cup), banana (1), honey (1 tsp), tea (1 cup)';
        }
    }
    
    // Default based on goal
    if (goal.includes('weight loss')) {
        return 'High-protein breakfast (300 cal): Greek yogurt (1/2 cup), berries (1/2 cup), nuts (5 pieces)';
    } else if (goal.includes('muscle') || goal.includes('gain')) {
        return 'High-calorie breakfast (500 cal): Oats (1 cup), banana (1), protein powder (1 scoop), milk (1 cup)';
    }
    return 'Balanced breakfast (400 cal): Oats (3/4 cup), seasonal fruit (1/2 cup), nuts (8 pieces), green tea (1 cup)';
}

function getCompleteLunch(country, dietType, userData) {
    const goal = (userData.goal || '').toLowerCase();
    const bmiCategory = (userData.bmiCategory || '').toLowerCase();
    
    if (country.includes('india')) {
        if (goal.includes('weight loss') || goal.includes('lose')) {
            if (dietType.includes('vegetarian')) {
                return 'Brown rice (1/2 cup), moong dal (1 cup), mixed vegetables (1 cup), cucumber salad (1 bowl), buttermilk (1 glass)';
            } else {
                return 'Brown rice (1/2 cup), chicken curry (100g), mixed vegetables (1 cup), salad (1 bowl), lemon water (1 glass)';
            }
        } else if (goal.includes('weight gain') || goal.includes('muscle') || goal.includes('gain')) {
            if (dietType.includes('vegetarian')) {
                return 'Brown rice (1.5 cups), dal (1.5 cups), paneer curry (150g), mixed vegetables (1/2 cup), curd (1/2 cup), ghee (1 tsp)';
            } else {
                return 'Brown rice (1.5 cups), chicken curry (200g), dal (1 cup), vegetables (1/2 cup), curd (1/2 cup)';
            }
        } else {
            if (dietType.includes('vegetarian')) {
                return 'Brown rice (1 cup), dal (1 cup), seasonal vegetables (3/4 cup), salad (1 bowl), buttermilk (1 glass)';
            } else {
                return 'Brown rice (1 cup), fish curry (150g), dal (1/2 cup), vegetables (3/4 cup), salad (1 bowl)';
            }
        }
    } else if (country.includes('usa') || country.includes('canada') || country.includes('america')) {
        if (goal.includes('weight loss')) {
            return 'Grilled chicken breast (120g), quinoa (1/2 cup), steamed broccoli (1 cup), mixed greens salad (2 cups)';
        } else if (goal.includes('muscle') || goal.includes('gain')) {
            return 'Grilled chicken breast (200g), quinoa (1.5 cups), sweet potato (1 medium), avocado (1/2)';
        } else {
            return 'Grilled salmon (150g), quinoa (1 cup), roasted vegetables (1 cup), mixed salad (1 bowl)';
        }
    } else if (country.includes('uk') || country.includes('britain')) {
        if (goal.includes('weight loss')) {
            return 'Grilled fish (120g), new potatoes (3 small), steamed vegetables (1 cup), side salad (1 bowl)';
        } else if (goal.includes('muscle')) {
            return 'Roast chicken (200g), mashed potatoes (1 cup), roasted vegetables (1 cup), gravy (2 tbsp)';
        } else {
            return 'Baked cod (150g), boiled potatoes (4 medium), steamed carrots (1/2 cup), peas (1/2 cup)';
        }
    }
    
    // Default based on goal
    if (goal.includes('weight loss')) {
        return 'Lean protein (120g), complex carbs (1/2 cup), vegetables (1.5 cups), salad (1 bowl)';
    } else if (goal.includes('muscle') || goal.includes('gain')) {
        return 'Protein source (200g), complex carbs (1.5 cups), vegetables (1 cup), healthy fats (1 tbsp)';
    }
    return 'Balanced protein (150g), whole grains (1 cup), vegetables (1 cup), salad (1 bowl)';
}

function getCompleteDinner(country, dietType, userData) {
    const goal = (userData.goal || '').toLowerCase();
    const bmiCategory = (userData.bmiCategory || '').toLowerCase();
    
    if (country.includes('india')) {
        if (goal.includes('weight loss') || goal.includes('lose')) {
            if (dietType.includes('vegetarian')) {
                return 'Roti (1 piece), moong dal (1/2 cup), steamed vegetables (1 cup), cucumber salad (1 small bowl)';
            } else {
                return 'Roti (1 piece), grilled fish (100g), steamed vegetables (1 cup), mint chutney (1 tbsp)';
            }
        } else if (goal.includes('weight gain') || goal.includes('muscle') || goal.includes('gain')) {
            if (dietType.includes('vegetarian')) {
                return 'Roti (3 pieces), paneer curry (150g), dal (1/2 cup), vegetables (1/2 cup), curd (1/2 cup)';
            } else {
                return 'Roti (3 pieces), chicken curry (150g), dal (1/2 cup), vegetables (1/2 cup)';
            }
        } else {
            if (dietType.includes('vegetarian')) {
                return 'Roti (2 pieces), dal (3/4 cup), mixed vegetables (3/4 cup), small salad (1 bowl)';
            } else {
                return 'Roti (2 pieces), fish curry (120g), vegetables (3/4 cup), small salad (1 bowl)';
            }
        }
    } else if (country.includes('usa') || country.includes('canada') || country.includes('america')) {
        if (goal.includes('weight loss')) {
            return 'Grilled chicken breast (100g), steamed broccoli (1 cup), quinoa (1/3 cup)';
        } else if (goal.includes('muscle') || goal.includes('gain')) {
            return 'Baked salmon (150g), sweet potato (1 medium), asparagus (1 cup), olive oil (1 tbsp)';
        } else {
            return 'Baked cod (120g), roasted vegetables (1 cup), brown rice (1/2 cup)';
        }
    } else if (country.includes('uk') || country.includes('britain')) {
        if (goal.includes('weight loss')) {
            return 'Grilled fish (100g), steamed vegetables (1 cup), new potatoes (2 small)';
        } else if (goal.includes('muscle')) {
            return 'Roast beef (150g), mashed potatoes (3/4 cup), steamed broccoli (1 cup)';
        } else {
            return 'Baked chicken (120g), roasted root vegetables (1 cup), gravy (1 tbsp)';
        }
    }
    
    // Default based on goal
    if (goal.includes('weight loss')) {
        return 'Lean protein (100g), steamed vegetables (1.5 cups), small portion carbs (1/3 cup)';
    } else if (goal.includes('muscle') || goal.includes('gain')) {
        return 'Protein source (150g), complex carbs (3/4 cup), vegetables (1 cup), healthy fats (1 tbsp)';
    }
    return 'Balanced protein (120g), vegetables (1 cup), whole grains (1/2 cup)';
}

function getCompleteSnack(country, dietType, timing) {
    if (country.includes('india')) {
        if (timing === 'morning') {
            if (dietType.includes('vegetarian')) {
                return 'Apple (1 medium), almonds (6 pieces), green tea (1 cup)';
            } else {
                return 'Banana (1 medium), boiled egg (1), green tea (1 cup)';
            }
        } else {
            if (dietType.includes('vegetarian')) {
                return 'Roasted chana (1/4 cup), green tea (1 cup)';
            } else {
                return 'Greek yogurt (1/2 cup), mixed nuts (8 pieces)';
            }
        }
    } else if (country.includes('usa') || country.includes('canada') || country.includes('america')) {
        if (timing === 'morning') {
            return 'Greek yogurt (1/2 cup), berries (1/4 cup), honey (1 tsp)';
        } else {
            return 'Apple slices (1 medium), almond butter (1 tbsp)';
        }
    } else if (country.includes('uk') || country.includes('britain')) {
        if (timing === 'morning') {
            return 'Banana (1 medium), handful of nuts (8 pieces), tea (1 cup)';
        } else {
            return 'Oatcakes (2 pieces), cottage cheese (2 tbsp), herbal tea (1 cup)';
        }
    } else if (country.includes('japan')) {
        if (timing === 'morning') {
            return 'Green tea (1 cup), rice crackers (4 pieces), edamame (2 tbsp)';
        } else {
            return 'Miso soup (1 small bowl), seaweed snack (1 pack)';
        }
    } else if (country.includes('china')) {
        if (timing === 'morning') {
            return 'Green tea (1 cup), steamed bun (1 small), walnuts (4 pieces)';
        } else {
            return 'Herbal tea (1 cup), dried fruits (2 tbsp), almonds (6 pieces)';
        }
    }
    
    // Default snacks
    if (timing === 'morning') {
        return 'Seasonal fruit (1 medium), nuts (8 pieces), green tea (1 cup)';
    } else {
        return 'Mixed nuts (10 pieces), herbal tea (1 cup)';
    }
}

// Calorie adjustment functions
function adjustCaloriesForHealth(baseCalories, userData) {
    if (userData.bmiCategory === 'Underweight') {
        return Math.round(baseCalories * 1.1); // 10% increase
    } else if (userData.bmiCategory === 'Overweight' || userData.bmiCategory === 'Obese') {
        return Math.round(baseCalories * 0.9); // 10% decrease
    }
    return baseCalories;
}

function adjustCaloriesForGoal(baseCalories, userData) {
    const goal = (userData.goal || '').toLowerCase();
    if (goal.includes('weight loss') || goal.includes('lose')) {
        return Math.round(baseCalories * 0.85); // 15% decrease
    } else if (goal.includes('weight gain') || goal.includes('gain') || goal.includes('muscle')) {
        return Math.round(baseCalories * 1.15); // 15% increase
    }
    return baseCalories;
}

// Generate mini diet chart HTML
function generateMiniDietChart(chartData, stepNumber, chartType) {
    const totalCalories = chartData.totalCalories;
    
    let html = `
    <div class="mini-diet-chart" style="margin: 15px 0; padding: 20px; background: linear-gradient(135deg, #f8f9ff 0%, #e6f3ff 100%); border-radius: 12px; border-left: 4px solid #4a90e2;">
        <h4 style="color: #1e3c72; margin: 0 0 15px 0; font-size: 16px;">📊 Step ${stepNumber} Diet Chart Preview (${chartType})</h4>
        <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%); color: white;">
                        <th style="padding: 10px; text-align: left; font-size: 12px;">Time</th>
                        <th style="padding: 10px; text-align: left; font-size: 12px;">Meal</th>
                        <th style="padding: 10px; text-align: center; font-size: 12px;">Calories</th>
                        <th style="padding: 10px; text-align: left; font-size: 12px;">Foods</th>
                    </tr>
                </thead>
                <tbody>`;
    
    chartData.meals.forEach((meal, index) => {
        const bgColor = index % 2 === 0 ? '#f8f9fa' : 'white';
        html += `
                    <tr style="background: ${bgColor};">
                        <td style="padding: 8px; font-size: 11px; color: #666;">${meal.time}</td>
                        <td style="padding: 8px; font-size: 12px; font-weight: 600; color: #333;">${meal.name}</td>
                        <td style="padding: 8px; text-align: center; font-size: 12px; color: #e74c3c; font-weight: 600;">${meal.calories}</td>
                        <td style="padding: 8px; font-size: 11px; color: #555;">${meal.foods}</td>
                    </tr>`;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        <div style="margin-top: 10px; padding: 10px; background: rgba(74, 144, 226, 0.1); border-radius: 6px;">
            <strong style="color: #1e3c72; font-size: 13px;">Total: ${totalCalories} calories/day</strong>
            <div style="font-size: 11px; color: #666; margin-top: 5px;">
                ${chartData.refinements.join(' → ')}
            </div>
        </div>
    </div>`;
    
    return html;
}

// Helper function for detailed meal plans
function getDetailedMealPlan(mealType, learningData) {
    const preferences = learningData.dietaryStrategy?.preferences || 'balanced';
    const region = learningData.regionalIntegration?.region || 'global';
    
    const mealPlans = {
        'breakfast': `Optimized breakfast for ${preferences} diet with ${region} influences`,
        'mid-morning': `Light snack aligned with ${preferences} preferences`,
        'lunch': `Complete lunch incorporating ${region} foods and ${preferences} diet`,
        'evening': `Energy snack suitable for ${preferences} lifestyle`,
        'dinner': `Light dinner with ${region} flavors and ${preferences} approach`
    };
    
    return mealPlans[mealType] || 'Balanced meal option';
}

// Helper function for optimized macros
function getOptimizedMacros(calories, mealType) {
    let proteinRatio, carbRatio, fatRatio;
    
    switch(mealType) {
        case 'breakfast':
            proteinRatio = 0.25; carbRatio = 0.45; fatRatio = 0.30;
            break;
        case 'mid-morning':
        case 'evening':
            proteinRatio = 0.20; carbRatio = 0.60; fatRatio = 0.20;
            break;
        case 'lunch':
            proteinRatio = 0.25; carbRatio = 0.45; fatRatio = 0.30;
            break;
        case 'dinner':
            proteinRatio = 0.35; carbRatio = 0.35; fatRatio = 0.30;
            break;
        default:
            proteinRatio = 0.25; carbRatio = 0.45; fatRatio = 0.30;
    }
    
    const protein = Math.round(calories * proteinRatio / 4);
    const carbs = Math.round(calories * carbRatio / 4);
    const fats = Math.round(calories * fatRatio / 9);
    
    return `P: ${protein}g, C: ${carbs}g, F: ${fats}g`;
}

// Helper Functions
function extractActivityLevel(exercises) {
    const exerciseText = exercises.toLowerCase();
    if (exerciseText.includes('intense') || exerciseText.includes('heavy') || exerciseText.includes('daily')) {
        return 'High';
    } else if (exerciseText.includes('moderate') || exerciseText.includes('regular')) {
        return 'Moderate';
    } else {
        return 'Low';
    }
}

function getProteinSources(dietaryPreference) {
    // Safely handle dietary preference parameter
    const preference = (dietaryPreference || 'vegetarian').toLowerCase();
    
    const sources = {
        'pure_vegetarian': ['Lentils', 'Chickpeas', 'Paneer', 'Milk'],
        'pure vegetarian': ['Lentils', 'Chickpeas', 'Paneer', 'Milk'],
        'vegetarian': ['Eggs', 'Dairy', 'Legumes', 'Nuts'],
        'eggetarian': ['Eggs', 'Dairy', 'Legumes', 'Quinoa'],
        'non_vegetarian': ['Chicken', 'Fish', 'Eggs', 'Dairy'],
        'non-vegetarian': ['Chicken', 'Fish', 'Eggs', 'Dairy'],
        'pescatarian': ['Fish', 'Seafood', 'Eggs', 'Dairy'],
        'vegan': ['Tofu', 'Tempeh', 'Legumes', 'Nuts']
    };
    
    // Try to find a match, fallback to general sources
    for (const [key, value] of Object.entries(sources)) {
        if (preference.includes(key) || key.includes(preference)) {
            return value;
        }
    }
    
    return ['Varied protein sources', 'Legumes', 'Dairy', 'Eggs'];
}

function getTraditionalFoods(country) {
    const foods = {
        'India': ['Dal', 'Rice', 'Roti', 'Vegetables'],
        'USA': ['Quinoa', 'Sweet potato', 'Lean meats'],
        'Japan': ['Rice', 'Fish', 'Miso', 'Vegetables'],
        'China': ['Rice', 'Tofu', 'Vegetables', 'Tea']
    };
    return foods[country] || ['Local seasonal foods'];
}

// Get health risks based on BMI category
function getHealthRisks(bmiCategory) {
    const risks = {
        'Underweight': ['Nutrient deficiencies', 'Weak immune system', 'Osteoporosis risk'],
        'Normal': ['Low health risks', 'Maintain current status'],
        'Overweight': ['Type 2 diabetes risk', 'Heart disease risk', 'High blood pressure'],
        'Obese': ['High diabetes risk', 'Cardiovascular disease', 'Sleep apnea', 'Joint problems']
    };
    return risks[bmiCategory] || ['Monitor health regularly'];
}

// Get regional foods based on country
function getRegionalFoods(region) {
    const regionalFoods = {
        'India': ['Quinoa', 'Millets', 'Lentils', 'Seasonal vegetables', 'Coconut', 'Turmeric'],
        'USA': ['Quinoa', 'Sweet potatoes', 'Blueberries', 'Salmon', 'Avocado', 'Almonds'],
        'UK': ['Oats', 'Barley', 'Root vegetables', 'Fish', 'Berries', 'Leafy greens'],
        'Canada': ['Wild rice', 'Maple syrup', 'Fish', 'Berries', 'Root vegetables'],
        'Australia': ['Kangaroo meat', 'Barramundi', 'Macadamia nuts', 'Bush tomatoes'],
        'Germany': ['Rye', 'Cabbage', 'Root vegetables', 'Fish', 'Berries'],
        'France': ['Herbs', 'Olive oil', 'Fish', 'Seasonal vegetables', 'Cheese'],
        'Italy': ['Olive oil', 'Tomatoes', 'Fish', 'Herbs', 'Seasonal vegetables'],
        'Japan': ['Rice', 'Fish', 'Seaweed', 'Soy products', 'Green tea'],
        'China': ['Rice', 'Tofu', 'Vegetables', 'Tea', 'Ginger'],
        'Brazil': ['Quinoa', 'Acai', 'Fish', 'Tropical fruits', 'Beans'],
        'Mexico': ['Beans', 'Quinoa', 'Avocado', 'Chili peppers', 'Lime']
    };
    return regionalFoods[region] || ['Local seasonal produce', 'Traditional grains', 'Regional proteins'];
}

// Calculate optimal calories based on user data and learning insights
function calculateOptimalCalories(userData, learningData) {
    // Use user's input calorie intake as the primary target
    let targetCalories = userData.caloriesIntake || userData.bmr;
    
    // If user provided calorie intake, use it directly
    if (userData.caloriesIntake && userData.caloriesIntake > 0) {
        return Math.round(userData.caloriesIntake);
    }
    
    // Fallback calculation if no calorie intake provided
    const activityLevel = learningData.userProfile.activityLevel;
    if (activityLevel === 'High') {
        targetCalories *= 1.725;
    } else if (activityLevel === 'Moderate') {
        targetCalories *= 1.55;
    } else {
        targetCalories *= 1.375;
    }
    
    // Goal adjustment
    if (userData.goal.toLowerCase().includes('weight loss') || userData.goal.toLowerCase().includes('lose')) {
        targetCalories -= 500; // 500 calorie deficit
    } else if (userData.goal.toLowerCase().includes('weight gain') || userData.goal.toLowerCase().includes('gain')) {
        targetCalories += 500; // 500 calorie surplus
    }
    
    return Math.round(targetCalories);
}

// Generate meal schedule based on learning data
function generateMealSchedule(learningData) {
    const targetCalories = learningData.calorieStrategy.targetCalories;
    return {
        breakfast: { time: '7:00 AM', calories: Math.round(targetCalories * 0.25) },
        midMorning: { time: '10:00 AM', calories: Math.round(targetCalories * 0.05) },
        lunch: { time: '1:00 PM', calories: Math.round(targetCalories * 0.35) },
        afternoon: { time: '4:00 PM', calories: Math.round(targetCalories * 0.05) },
        dinner: { time: '7:00 PM', calories: Math.round(targetCalories * 0.30) }
    };
}

// Calculate portion sizes based on learning data
function calculatePortions(learningData) {
    const targetCalories = learningData.calorieStrategy.targetCalories;
    const proteinGrams = Math.round(targetCalories * 0.25 / 4); // 25% of calories from protein
    const carbGrams = Math.round(targetCalories * 0.45 / 4); // 45% of calories from carbs
    const fatGrams = Math.round(targetCalories * 0.30 / 9); // 30% of calories from fats
    
    return {
        protein: `${proteinGrams}g daily`,
        carbs: `${carbGrams}g daily`,
        fats: `${fatGrams}g daily`,
        water: '8-10 glasses daily',
        fiber: '25-35g daily'
    };
}

// Generate profile-based suggestions
function generateProfileSuggestions(userData) {
    let suggestions = [];
    
    if (userData.bmiCategory === 'Underweight') {
        suggestions.push('• Focus on calorie-dense, nutritious foods like nuts, avocados, and healthy oils');
        suggestions.push('• Eat 5-6 smaller meals throughout the day to increase intake');
        suggestions.push('• Add protein shakes between meals for muscle building');
    } else if (userData.bmiCategory === 'Overweight' || userData.bmiCategory === 'Obese') {
        suggestions.push('• Create a moderate calorie deficit (300-500 calories below maintenance)');
        suggestions.push('• Focus on high-fiber, low-calorie foods like vegetables and lean proteins');
        suggestions.push('• Practice portion control and mindful eating');
    } else {
        suggestions.push('• Maintain current calorie balance with focus on nutrient quality');
        suggestions.push('• Emphasize whole foods and balanced macronutrients');
    }
    
    if (userData.goal.toLowerCase().includes('muscle')) {
        suggestions.push('• Prioritize protein intake: 1.6-2.2g per kg body weight');
        suggestions.push('• Time protein intake around workouts for optimal recovery');
    }
    
    return suggestions.join('<br>');
}

// Generate health-based suggestions
function generateHealthSuggestions(userData) {
    let suggestions = [];
    const bmr = userData.bmr;
    
    suggestions.push(`• Your BMR is ${bmr} calories - never eat below this for healthy metabolism`);
    
    if (userData.age > 40) {
        suggestions.push('• Include calcium-rich foods for bone health (dairy, leafy greens)');
        suggestions.push('• Focus on anti-inflammatory foods (berries, fatty fish, turmeric)');
    }
    
    if (userData.bmiCategory === 'Underweight') {
        suggestions.push('• Eat every 2-3 hours to maintain steady energy levels');
        suggestions.push('• Include healthy fats at each meal for calorie density');
    } else if (userData.bmiCategory === 'Overweight') {
        suggestions.push('• Start meals with a large salad to increase satiety');
        suggestions.push('• Drink water 30 minutes before meals to aid portion control');
    }
    
    suggestions.push('• Aim for 7-9 hours of sleep to support metabolic health');
    suggestions.push('• Consider regular meal timing to optimize circadian rhythm');
    
    return suggestions.join('<br>');
}

// Generate calorie-based meal suggestions
function generateCalorieSuggestions(userData, targetCalories) {
    const breakfast = Math.round(targetCalories * 0.25);
    const lunch = Math.round(targetCalories * 0.35);
    const dinner = Math.round(targetCalories * 0.30);
    const snacks = Math.round(targetCalories * 0.10);
    
    return `
    <strong>Daily Calorie Distribution:</strong><br>
    • Breakfast: ${breakfast} calories (25%) - Start strong with protein + complex carbs<br>
    • Lunch: ${lunch} calories (35%) - Largest meal with balanced macros<br>
    • Dinner: ${dinner} calories (30%) - Lighter, protein-focused meal<br>
    • Snacks: ${snacks} calories (10%) - Healthy snacks between meals<br><br>
    <strong>Sample Timing:</strong><br>
    • 7:00 AM - Breakfast<br>
    • 10:00 AM - Morning snack<br>
    • 1:00 PM - Lunch<br>
    • 4:00 PM - Afternoon snack<br>
    • 7:00 PM - Dinner
    `;
}

// Generate dietary preference suggestions
function generateDietarySuggestions(userData) {
    let suggestions = [];
    
    // Safely get dietary preferences
    const diet = (userData.dietaryPreferences || userData.dietary_preferences || 'vegetarian').toLowerCase();
    
    console.log('Dietary preferences:', diet);
    
    if (diet.includes('vegetarian') || diet.includes('vegan') || diet.includes('pure')) {
        suggestions.push('• Combine legumes + grains for complete protein (rice + beans, hummus + pita)');
        suggestions.push('• Include B12 supplement and consider iron-rich foods with vitamin C');
        suggestions.push('• Focus on quinoa, lentils, chickpeas, and tofu for protein variety');
    }
    
    if (diet.includes('non-vegetarian') || diet.includes('non_vegetarian')) {
        suggestions.push('• Choose lean proteins: chicken breast, fish, turkey, lean beef');
        suggestions.push('• Include fatty fish 2-3 times per week for omega-3s');
        suggestions.push('• Balance animal proteins with plant-based options');
    }
    
    if (diet.includes('pescatarian')) {
        suggestions.push('• Focus on fish and seafood as primary protein sources');
        suggestions.push('• Include plant-based proteins like legumes and quinoa');
        suggestions.push('• Ensure adequate omega-3 intake from fatty fish');
    }
    
    if (diet.includes('eggetarian')) {
        suggestions.push('• Eggs are excellent complete protein sources');
        suggestions.push('• Combine with dairy and plant proteins for variety');
        suggestions.push('• Include 1-2 eggs daily for optimal nutrition');
    }
    
    // Handle allergies safely
    const allergies = (userData.allergies || '').toLowerCase();
    if (allergies.includes('dairy')) {
        suggestions.push('• Use fortified plant milks (almond, soy, oat) for calcium');
        suggestions.push('• Include tahini, leafy greens, and sardines for calcium sources');
    }
    
    if (allergies.includes('nuts')) {
        suggestions.push('• Avoid all tree nuts and peanuts');
        suggestions.push('• Use seeds like sunflower, pumpkin for healthy fats');
    }
    
    if (allergies.includes('gluten')) {
        suggestions.push('• Choose gluten-free grains: rice, quinoa, millet');
        suggestions.push('• Check labels carefully for hidden gluten sources');
    }
    
    // General suggestions
    suggestions.push('• Meal prep 2-3 days worth of proteins in advance');
    suggestions.push('• Keep healthy snacks readily available to avoid poor choices');
    suggestions.push('• Stay hydrated and eat mindfully');
    
    return suggestions.join('<br>');
}

// Generate regional meal suggestions
function generateRegionalSuggestions(userData) {
    // Safely handle region data with fallback
    const region = (userData.region || userData.country || 'global').toLowerCase();
    let suggestions = [];
    
    console.log('Generating regional suggestions for:', region);
    
    if (region.includes('india')) {
        suggestions.push('• Breakfast: Oats upma with vegetables, or moong dal chilla');
        suggestions.push('• Lunch: Brown rice + dal + sabzi + curd');
        suggestions.push('• Dinner: Roti + lean curry + salad');
    } else if (region.includes('usa') || region.includes('canada') || region.includes('america')) {
        suggestions.push('• Breakfast: Greek yogurt with berries and nuts');
        suggestions.push('• Lunch: Quinoa salad with grilled chicken');
        suggestions.push('• Dinner: Baked salmon with roasted vegetables');
    } else if (region.includes('uk') || region.includes('britain') || region.includes('england')) {
        suggestions.push('• Breakfast: Porridge with fruits and seeds');
        suggestions.push('• Lunch: Lentil soup with whole grain bread');
        suggestions.push('• Dinner: Grilled fish with steamed vegetables');
    } else if (region.includes('australia')) {
        suggestions.push('• Breakfast: Avocado toast with poached eggs');
        suggestions.push('• Lunch: Barramundi with native vegetables');
        suggestions.push('• Dinner: Lean kangaroo meat with bush vegetables');
    } else if (region.includes('germany') || region.includes('europe')) {
        suggestions.push('• Breakfast: Whole grain bread with cottage cheese');
        suggestions.push('• Lunch: Sauerkraut with lean protein');
        suggestions.push('• Dinner: Fish with root vegetables');
    } else if (region.includes('japan')) {
        suggestions.push('• Breakfast: Miso soup with rice and fish');
        suggestions.push('• Lunch: Bento box with balanced portions');
        suggestions.push('• Dinner: Grilled fish with steamed vegetables');
    } else if (region.includes('china')) {
        suggestions.push('• Breakfast: Congee with vegetables and protein');
        suggestions.push('• Lunch: Stir-fried vegetables with tofu');
        suggestions.push('• Dinner: Steamed fish with brown rice');
    } else {
        suggestions.push('• Focus on locally available seasonal fruits and vegetables');
        suggestions.push('• Include traditional whole grains and legumes');
        suggestions.push('• Adapt local dishes with healthier cooking methods');
    }
    
    suggestions.push('• Shop at local farmers markets for fresh, seasonal produce');
    suggestions.push('• Learn to prepare 3-4 healthy versions of traditional dishes');
    suggestions.push('• Stay hydrated and include regional herbs and spices');
    
    return suggestions.join('<br>');
}

// Generate meal plan preview
function generateMealPlanPreview(learningData) {
    const calories = learningData.calorieStrategy.targetCalories;
    const diet = learningData.dietaryStrategy.preferences;
    
    return `
    <div class="meal-preview">
        <strong>Day 1 Sample:</strong><br>
        🌅 Breakfast (${Math.round(calories * 0.25)} cal): Protein-rich start with complex carbs<br>
        🥪 Mid-Morning (${Math.round(calories * 0.05)} cal): Light, nutritious snack<br>
        🍽️ Lunch (${Math.round(calories * 0.35)} cal): Balanced meal with all macros<br>
        🍎 Afternoon (${Math.round(calories * 0.05)} cal): Energy-boosting snack<br>
        🍽️ Dinner (${Math.round(calories * 0.30)} cal): Light, protein-focused meal<br><br>
        <strong>Weekly Variety:</strong> 21 different meals planned with ${diet} preferences<br>
        <strong>Prep Time:</strong> 2-3 hours weekly meal prep recommended
    </div>
    `;
}

// Generate optimization summary
function generateOptimizationSummary(learningData) {
    const goal = learningData.userProfile?.goal || 'General fitness';
    const targetCalories = learningData.calorieStrategy?.targetCalories || 2000;
    const preferences = learningData.dietaryStrategy?.preferences || 'Balanced diet';
    const region = learningData.regionalIntegration?.region || 'Global';
    
    return `
    <div class="summary-points">
        ✅ <strong>Profile Optimized:</strong> ${goal} plan created<br>
        ✅ <strong>Health Considered:</strong> BMI and metabolic needs addressed<br>
        ✅ <strong>Calories Balanced:</strong> ${targetCalories} daily target set<br>
        ✅ <strong>Diet Preferences:</strong> ${preferences} approach integrated<br>
        ✅ <strong>Regional Foods:</strong> ${region} cuisine included<br>
        ✅ <strong>Complete Plan:</strong> 7-day structured meal schedule ready<br>
    </div>
    `;
}

// Generate comprehensive fallback diet chart
function generateFallbackDietChart(userData, learningData) {
    const targetCalories = learningData.calorieStrategy?.targetCalories || userData.caloriesIntake || 2000;
    const dietType = userData.dietaryPreferences || 'vegetarian';
    const region = userData.region || 'Global';
    
    return `${getDietChartCSS()}<div class="final-diet-container"><h3 class="diet-title">🍽️ Your Personalized Diet Chart</h3><div class="user-summary"><span class="user-info">${userData.name || 'User'}</span> | <span class="bmi-info">BMI: ${userData.bmi || 24} (${userData.bmiCategory || 'Normal'})</span> | <span class="calorie-info">Target: ${targetCalories} cal/day</span></div><table class="stylish-diet-table"><thead><tr><th>⏰ Time</th><th>🍽️ Meal</th><th>🔥 Calories</th><th>🥗 Food Items</th><th>📊 Macros (P/C/F)</th></tr></thead><tbody><tr><td>7:00 AM</td><td>Breakfast</td><td>${Math.round(targetCalories * 0.25)}</td><td>Oats with fruits, nuts, and milk</td><td>P: 15g, C: 45g, F: 12g</td></tr><tr><td>10:30 AM</td><td>Mid-Morning</td><td>${Math.round(targetCalories * 0.10)}</td><td>Fresh fruit and green tea</td><td>P: 2g, C: 25g, F: 1g</td></tr><tr><td>1:00 PM</td><td>Lunch</td><td>${Math.round(targetCalories * 0.35)}</td><td>Rice, dal, vegetables, and salad</td><td>P: 20g, C: 65g, F: 15g</td></tr><tr><td>4:00 PM</td><td>Evening</td><td>${Math.round(targetCalories * 0.10)}</td><td>Nuts and herbal tea</td><td>P: 6g, C: 8g, F: 14g</td></tr><tr><td>7:00 PM</td><td>Dinner</td><td>${Math.round(targetCalories * 0.20)}</td><td>Light curry, roti, and vegetables</td><td>P: 12g, C: 35g, F: 8g</td></tr></tbody></table><div class="weekly-tips"><h4>📅 Weekly Guidelines</h4><ul><li>Drink 8-10 glasses of water daily</li><li>Include variety in your meals throughout the week</li><li>Adjust portion sizes based on your hunger and activity level</li><li>Consult a nutritionist for personalized modifications</li></ul></div><div class="hydration-plan"><h4>💧 Hydration Schedule</h4><ul><li>Start day with 2 glasses of water</li><li>Drink water 30 minutes before each meal</li><li>Have herbal teas between meals</li></ul></div></div>`;
}

function getDietChartCSS() {
    return `<style>
    .final-diet-container{max-width:900px;margin:20px auto;padding:30px;background:linear-gradient(135deg,#f8f9ff 0%,#e0e7ff 100%);border-radius:20px;box-shadow:0 12px 24px rgba(0,0,0,0.15);border:1px solid #e0e7ff;}
    .diet-title{text-align:center;color:#1e3c72;margin:0 0 20px 0;font-size:28px;font-weight:700;text-shadow:0 2px 4px rgba(0,0,0,0.1);}
    .user-summary{background:white;padding:15px 20px;border-radius:12px;margin-bottom:25px;box-shadow:0 4px 8px rgba(0,0,0,0.1);text-align:center;border-left:5px solid #667eea;}
    .user-info{color:#1e3c72;font-weight:600;font-size:16px;}
    .bmi-info{color:#56ab2f;font-weight:600;margin:0 10px;}
    .calorie-info{color:#e74c3c;font-weight:600;}
    .stylish-diet-table{width:100%;border-collapse:collapse;margin:0;background:white;border-radius:15px;overflow:hidden;box-shadow:0 8px 16px rgba(0,0,0,0.1);}
    .stylish-diet-table th{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:18px 15px;text-align:center;font-weight:700;font-size:16px;border-bottom:3px solid #5a67d8;}
    .stylish-diet-table td{padding:15px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:14px;color:#2d3748;transition:all 0.3s ease;}
    .stylish-diet-table tr:nth-child(even){background:#f7fafc;}
    .stylish-diet-table tr:hover{background:linear-gradient(135deg,#e6f0ff 0%,#f0f4ff 100%);transform:scale(1.01);box-shadow:0 4px 8px rgba(102,126,234,0.2);}
    .weekly-tips{background:linear-gradient(135deg,#fff5f5 0%,#fed7d7 100%);padding:20px;border-radius:12px;margin:20px 0;border-left:5px solid #e53e3e;}
    .weekly-tips h4{margin:0 0 15px 0;color:#c53030;font-size:18px;font-weight:600;}
    .hydration-plan{background:linear-gradient(135deg,#e6fffa 0%,#b2f5ea 100%);padding:20px;border-radius:12px;margin:20px 0;border-left:5px solid #38b2ac;}
    .hydration-plan h4{margin:0 0 15px 0;color:#2c7a7b;font-size:18px;font-weight:600;}
    .optimization-summary{margin-bottom:15px;padding:15px;background:linear-gradient(135deg,#f0fff4 0%,#c6f6d5 100%);border-radius:12px;border-left:5px solid #48bb78;color:#22543d;}
    </style>`;
}

function formatResponse(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\s*\n/g, '<br>')  // Replace multiple newlines with single break
        .replace(/\n/g, '<br>')
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/<br>\s*<br>/g, '<br>')  // Remove duplicate breaks
        .trim();  // Remove leading/trailing whitespace
}

// Add Diet Chart Button Functionality
function addDietChartButton(userData, learningData) {
    const finalDietChart = document.getElementById('finalDietChart');
    
    // Check if user is logged in
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        return; // Don't show button if not logged in
    }
    
    const addButtonHtml = `
        <div style="text-align: center; margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%); border-radius: 15px; border: 2px solid #4a90e2;">
            <h4 style="color: #1e3c72; margin-bottom: 15px;">💾 Save This Diet Chart</h4>
            <p style="color: #666; margin-bottom: 20px;">Save this personalized diet chart to your collection for future reference and merging.</p>
            <input type="text" id="chartNameInput" placeholder="Enter diet chart name (e.g., 'Weight Loss Plan Jan 2024')" 
                   style="width: 300px; padding: 12px; border: 2px solid #e0e7ff; border-radius: 8px; margin-right: 15px; font-size: 14px;">
            <button id="addDietChartBtn" class="submit-btn" style="margin: 0; padding: 12px 25px; font-size: 16px;">
                💾 Add Diet Chart
            </button>
        </div>
    `;
    
    finalDietChart.innerHTML += addButtonHtml;
    
    // Add event listener for the button
    document.getElementById('addDietChartBtn').addEventListener('click', async function() {
        const chartName = document.getElementById('chartNameInput').value.trim();
        
        if (!chartName) {
            alert('Please enter a name for your diet chart');
            return;
        }
        
        const button = this;
        const originalText = button.innerHTML;
        button.innerHTML = '⏳ Saving...';
        button.disabled = true;
        
        try {
            // Prepare chart data
            const chartData = {
                meals: extractMealsFromChart(),
                target_calories: learningData.calorieStrategy?.targetCalories || userData.caloriesIntake || 2000,
                optimization_notes: generateOptimizationSummary(learningData)
            };
            
            const response = await fetch('/api/diet-chart/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_email: userEmail,
                    chart_name: chartName,
                    chart_data: chartData,
                    user_data: userData,
                    goal: userData.goal,
                    target_calories: chartData.target_calories
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                button.innerHTML = '✅ Saved!';
                button.style.background = 'linear-gradient(90deg, #28a745 0%, #20c997 100%)';
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.background = '';
                    button.disabled = false;
                }, 2000);
                
                // Show success message
                showNotification('Diet chart saved successfully! You can now merge it with other charts.', 'success');
            } else {
                throw new Error(result.message || 'Failed to save diet chart');
            }
        } catch (error) {
            console.error('Error saving diet chart:', error);
            button.innerHTML = '❌ Error';
            button.style.background = 'linear-gradient(90deg, #dc3545 0%, #e74c3c 100%)';
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
                button.disabled = false;
            }, 2000);
            
            showNotification('Failed to save diet chart. Please try again.', 'error');
        }
    });
}

// Extract meals from the current diet chart display
function extractMealsFromChart() {
    // Extract the final optimized diet chart from Step 6 (progressive chart)
    const finalChart = progressiveDietChart.step6;
    
    if (finalChart && finalChart.meals) {
        // Extract complete meal data from the final progressive chart
        const extractedMeals = {
            meals: finalChart.meals.map(meal => ({
                time: meal.time,
                name: meal.name,
                calories: meal.calories,
                foods: meal.foods,
                macros: meal.macros
            })),
            refinements: finalChart.refinements || [],
            totalCalories: finalChart.meals.reduce((total, meal) => total + meal.calories, 0),
            chartType: 'Complete-Meal-Plan',
            stepLevel: 6
        };
        
        console.log('Extracted final optimized chart:', extractedMeals);
        return extractedMeals;
    }
    
    // Fallback: try to extract from aiLearningData if progressive chart not available
    if (aiLearningData.mealPlan && aiLearningData.mealPlan.schedule) {
        const schedule = aiLearningData.mealPlan.schedule;
        const extractedMeals = {
            meals: [
                {
                    time: schedule.breakfast.time,
                    name: 'Breakfast',
                    calories: schedule.breakfast.calories,
                    foods: getDetailedMealPlan('breakfast', aiLearningData),
                    macros: getOptimizedMacros(schedule.breakfast.calories, 'breakfast')
                },
                {
                    time: schedule.midMorning.time,
                    name: 'Mid-Morning',
                    calories: schedule.midMorning.calories,
                    foods: getDetailedMealPlan('mid-morning', aiLearningData),
                    macros: getOptimizedMacros(schedule.midMorning.calories, 'mid-morning')
                },
                {
                    time: schedule.lunch.time,
                    name: 'Lunch',
                    calories: schedule.lunch.calories,
                    foods: getDetailedMealPlan('lunch', aiLearningData),
                    macros: getOptimizedMacros(schedule.lunch.calories, 'lunch')
                },
                {
                    time: schedule.afternoon.time,
                    name: 'Evening',
                    calories: schedule.afternoon.calories,
                    foods: getDetailedMealPlan('evening', aiLearningData),
                    macros: getOptimizedMacros(schedule.afternoon.calories, 'evening')
                },
                {
                    time: schedule.dinner.time,
                    name: 'Dinner',
                    calories: schedule.dinner.calories,
                    foods: getDetailedMealPlan('dinner', aiLearningData),
                    macros: getOptimizedMacros(schedule.dinner.calories, 'dinner')
                }
            ],
            refinements: [
                'Step 1: Basic profile-based meal structure created',
                'Step 2: Health-optimized portions and nutrient timing',
                'Step 3: Calorie distribution optimized',
                'Step 4: Food choices aligned with preferences',
                'Step 5: Regional foods integrated',
                'Step 6: Complete meal plan with detailed portions and timing'
            ],
            totalCalories: Object.values(schedule).reduce((total, meal) => total + meal.calories, 0),
            chartType: 'AI-Generated-Complete-Plan',
            stepLevel: 6
        };
        
        console.log('Extracted from AI learning data:', extractedMeals);
        return extractedMeals;
    }
    
    // Final fallback with basic structure
    console.warn('No optimized chart found, using basic fallback');
    return {
        meals: [
            { time: '7:00 AM', name: 'Breakfast', calories: 500, foods: 'Basic breakfast plan', macros: 'P: 20g, C: 60g, F: 15g' },
            { time: '1:00 PM', name: 'Lunch', calories: 700, foods: 'Basic lunch plan', macros: 'P: 30g, C: 80g, F: 20g' },
            { time: '7:00 PM', name: 'Dinner', calories: 600, foods: 'Basic dinner plan', macros: 'P: 25g, C: 70g, F: 18g' }
        ],
        refinements: ['Basic diet chart structure'],
        totalCalories: 1800,
        chartType: 'Basic-Fallback',
        stepLevel: 1
    };
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
        animation: slideInRight 0.3s ease;
        max-width: 300px;
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
