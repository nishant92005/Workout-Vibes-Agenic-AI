// Progressive Diet Chart System - Each step refines the previous one

// Store the evolving diet chart across steps
let progressiveDietChart = {
    step1: null,
    step2: null,
    step3: null,
    step4: null,
    step5: null,
    step6: null
};

// Get refined distribution based on step insights
function getPreviousDistribution(stepNumber) {
    const distributions = {
        2: { // Health-focused refinement
            breakfast: 0.25, snack: 0.10, lunch: 0.35, evening: 0.10, dinner: 0.20
        },
        3: { // Calorie-optimized refinement
            breakfast: 0.25, snack: 0.10, lunch: 0.40, evening: 0.10, dinner: 0.15
        },
        4: { // Preference-aligned refinement
            breakfast: 0.28, snack: 0.12, lunch: 0.32, evening: 0.08, dinner: 0.20
        },
        5: { // Regional-integrated refinement
            breakfast: 0.25, snack: 0.10, lunch: 0.35, evening: 0.10, dinner: 0.20
        },
        6: { // Complete meal plan refinement
            breakfast: 0.25, snack: 0.10, lunch: 0.35, evening: 0.10, dinner: 0.20
        }
    };
    return distributions[stepNumber] || distributions[2];
}

// Generate progressive diet chart that builds upon previous steps
function generateProgressiveDietChart(userData, stepNumber, chartType) {
    const targetCalories = userData.caloriesIntake || 2000;
    const dietType = userData.dietaryPreferences || 'vegetarian';
    
    // Get the base structure or refine previous step
    let chartData;
    
    if (stepNumber === 1) {
        // Step 1: Create basic diet chart with minimal parameters
        chartData = createBasicDietChart(userData, targetCalories, dietType);
        progressiveDietChart.step1 = chartData;
    } else {
        // Steps 2-6: Refine the previous step's chart
        const previousStep = `step${stepNumber - 1}`;
        const previousChart = progressiveDietChart[previousStep];
        chartData = refineDietChart(previousChart, userData, stepNumber, chartType);
        progressiveDietChart[`step${stepNumber}`] = chartData;
    }
    
    return generateChartHTML(chartData, stepNumber, chartType, targetCalories);
}

// Create basic diet chart for Step 1 (minimal parameters)
function createBasicDietChart(userData, targetCalories, dietType) {
    return {
        meals: [
            {
                time: '7:00 AM',
                name: 'Breakfast',
                calories: Math.round(targetCalories * 0.25),
                foods: getBasicFoods(dietType, 'breakfast'),
                macros: 'P: 15g, C: 45g, F: 12g'
            },
            {
                time: '10:30 AM',
                name: 'Mid-Morning',
                calories: Math.round(targetCalories * 0.10),
                foods: getBasicFoods(dietType, 'snack'),
                macros: 'P: 5g, C: 20g, F: 3g'
            },
            {
                time: '1:00 PM',
                name: 'Lunch',
                calories: Math.round(targetCalories * 0.35),
                foods: getBasicFoods(dietType, 'lunch'),
                macros: 'P: 25g, C: 60g, F: 18g'
            },
            {
                time: '4:00 PM',
                name: 'Evening',
                calories: Math.round(targetCalories * 0.10),
                foods: getBasicFoods(dietType, 'snack'),
                macros: 'P: 5g, C: 18g, F: 5g'
            },
            {
                time: '7:00 PM',
                name: 'Dinner',
                calories: Math.round(targetCalories * 0.20),
                foods: getBasicFoods(dietType, 'dinner'),
                macros: 'P: 20g, C: 35g, F: 10g'
            }
        ],
        refinements: [`Step 1: Basic profile-based meal structure created`]
    };
}

// Refine diet chart based on step insights
function refineDietChart(previousChart, userData, stepNumber, chartType) {
    if (!previousChart) return createBasicDietChart(userData, userData.caloriesIntake || 2000, userData.dietaryPreferences || 'vegetarian');
    
    const refinedChart = JSON.parse(JSON.stringify(previousChart)); // Deep copy
    const targetCalories = userData.caloriesIntake || 2000;
    
    switch(stepNumber) {
        case 2: // Health-focused refinement
            refinedChart.meals = refineForHealth(refinedChart.meals, userData, targetCalories);
            refinedChart.refinements.push(`Step 2: Health-optimized portions and nutrient timing`);
            break;
            
        case 3: // Calorie-optimized refinement
            refinedChart.meals = refineForCalories(refinedChart.meals, userData, targetCalories);
            refinedChart.refinements.push(`Step 3: Calorie distribution optimized for ${userData.goal}`);
            break;
            
        case 4: // Preference-aligned refinement
            refinedChart.meals = refineForPreferences(refinedChart.meals, userData, targetCalories);
            refinedChart.refinements.push(`Step 4: Food choices aligned with ${userData.dietaryPreferences} preferences`);
            break;
            
        case 5: // Regional-integrated refinement
            refinedChart.meals = refineForRegion(refinedChart.meals, userData, targetCalories);
            refinedChart.refinements.push(`Step 5: Regional ${userData.region || 'local'} foods integrated`);
            break;
            
        case 6: // Complete meal plan refinement
            refinedChart.meals = refineForCompleteness(refinedChart.meals, userData, targetCalories);
            refinedChart.refinements.push(`Step 6: Complete meal plan with detailed portions and timing`);
            break;
    }
    
    return refinedChart;
}

// Health-focused refinement
function refineForHealth(meals, userData, targetCalories) {
    return meals.map(meal => {
        if (meal.name === 'Breakfast') {
            meal.foods = 'High-fiber oats with berries and nuts';
            meal.macros = 'P: 18g, C: 42g, F: 14g';
        } else if (meal.name === 'Lunch') {
            meal.calories = Math.round(targetCalories * 0.35);
            meal.foods = 'Lean protein with quinoa and vegetables';
            meal.macros = 'P: 28g, C: 55g, F: 16g';
        }
        return meal;
    });
}

// Calorie-optimized refinement
function refineForCalories(meals, userData, targetCalories) {
    const isWeightLoss = userData.goal?.toLowerCase().includes('loss') || userData.goal?.toLowerCase().includes('lose');
    
    return meals.map(meal => {
        if (isWeightLoss && meal.name === 'Lunch') {
            meal.calories = Math.round(targetCalories * 0.40); // Bigger lunch for weight loss
            meal.foods = 'Large salad with protein and healthy fats';
        } else if (isWeightLoss && meal.name === 'Dinner') {
            meal.calories = Math.round(targetCalories * 0.15); // Smaller dinner
            meal.foods = 'Light protein with steamed vegetables';
        }
        return meal;
    });
}

// Preference-aligned refinement
function refineForPreferences(meals, userData, targetCalories) {
    const dietType = userData.dietaryPreferences || 'vegetarian';
    
    return meals.map(meal => {
        meal.foods = getPreferenceSpecificFoods(dietType, meal.name.toLowerCase(), userData.region);
        return meal;
    });
}

// Regional-integrated refinement
function refineForRegion(meals, userData, targetCalories) {
    const region = userData.region || 'Global';
    
    return meals.map(meal => {
        meal.foods = getRegionalFoods(region, meal.name.toLowerCase(), userData.dietaryPreferences);
        return meal;
    });
}

// Complete meal plan refinement
function refineForCompleteness(meals, userData, targetCalories) {
    return meals.map(meal => {
        meal.foods = getDetailedMealPlan(meal.name.toLowerCase(), userData);
        meal.macros = getOptimizedMacros(meal.calories, meal.name.toLowerCase());
        return meal;
    });
}

// Get basic foods for Step 1
function getBasicFoods(dietType, mealType) {
    const basicFoods = {
        vegetarian: {
            breakfast: 'Oats with milk and fruits',
            snack: 'Fresh fruit',
            lunch: 'Rice with dal and vegetables',
            dinner: 'Roti with vegetable curry'
        },
        vegan: {
            breakfast: 'Oat porridge with almond milk',
            snack: 'Mixed nuts',
            lunch: 'Quinoa bowl with vegetables',
            dinner: 'Tofu stir-fry with vegetables'
        },
        nonvegetarian: {
            breakfast: 'Eggs with whole grain toast',
            snack: 'Greek yogurt',
            lunch: 'Chicken with rice and vegetables',
            dinner: 'Grilled fish with vegetables'
        }
    };
    
    return basicFoods[dietType]?.[mealType] || basicFoods.vegetarian[mealType];
}

// Get preference-specific foods
function getPreferenceSpecificFoods(dietType, mealType, region) {
    const foods = {
        vegetarian: {
            breakfast: 'Vegetarian protein smoothie with oats',
            'mid-morning': 'Nuts and herbal tea',
            lunch: 'Lentil curry with brown rice and salad',
            evening: 'Roasted chickpeas',
            dinner: 'Paneer curry with whole wheat roti'
        },
        vegan: {
            breakfast: 'Chia seed pudding with plant milk',
            'mid-morning': 'Fresh fruit and green tea',
            lunch: 'Buddha bowl with quinoa and tahini',
            evening: 'Raw almonds and dates',
            dinner: 'Lentil soup with vegetables'
        },
        nonvegetarian: {
            breakfast: 'Protein omelet with vegetables',
            'mid-morning': 'Protein shake',
            lunch: 'Grilled chicken salad with quinoa',
            evening: 'Boiled eggs',
            dinner: 'Baked fish with roasted vegetables'
        }
    };
    
    return foods[dietType]?.[mealType] || foods.vegetarian[mealType];
}

// Get regional foods
function getRegionalFoods(region, mealType, dietType) {
    const regionalFoods = {
        'India': {
            breakfast: 'Poha with vegetables and peanuts',
            'mid-morning': 'Coconut water and seasonal fruit',
            lunch: 'Traditional thali with regional dal',
            evening: 'Masala chai with healthy snacks',
            dinner: 'Regional curry with millet roti'
        },
        'USA': {
            breakfast: 'Avocado toast with eggs',
            'mid-morning': 'Greek yogurt with berries',
            lunch: 'Quinoa salad with grilled protein',
            evening: 'Mixed nuts and fruit',
            dinner: 'Grilled salmon with sweet potato'
        },
        'Mediterranean': {
            breakfast: 'Greek yogurt with honey and nuts',
            'mid-morning': 'Olives and herbal tea',
            lunch: 'Mediterranean bowl with hummus',
            evening: 'Fresh figs and almonds',
            dinner: 'Grilled fish with olive oil and herbs'
        }
    };
    
    return regionalFoods[region]?.[mealType] || regionalFoods['India'][mealType];
}

// Get detailed meal plan
function getDetailedMealPlan(mealType, learningData) {
    // Extract preferences from learning data or use defaults
    const dietaryPreferences = learningData.dietaryStrategy?.preferences || 
                              learningData.userProfile?.dietaryPreferences || 
                              'vegetarian';
    const region = learningData.regionalIntegration?.region || 
                   learningData.userProfile?.region || 
                   'Global';
    
    const detailed = {
        breakfast: `Complete breakfast: ${getPreferenceSpecificFoods(dietaryPreferences, 'breakfast', region)} with portion control`,
        'mid-morning': `Healthy snack: ${getPreferenceSpecificFoods(dietaryPreferences, 'mid-morning', region)} timed for metabolism`,
        lunch: `Balanced lunch: ${getPreferenceSpecificFoods(dietaryPreferences, 'lunch', region)} with optimal macros`,
        evening: `Energy snack: ${getPreferenceSpecificFoods(dietaryPreferences, 'evening', region)} for sustained energy`,
        dinner: `Light dinner: ${getPreferenceSpecificFoods(dietaryPreferences, 'dinner', region)} for better sleep`
    };
    
    return detailed[mealType] || detailed.breakfast;
}

// Get optimized macros
function getOptimizedMacros(calories, mealType) {
    const macroRatios = {
        breakfast: { p: 0.25, c: 0.50, f: 0.25 },
        'mid-morning': { p: 0.20, c: 0.60, f: 0.20 },
        lunch: { p: 0.30, c: 0.45, f: 0.25 },
        evening: { p: 0.25, c: 0.55, f: 0.20 },
        dinner: { p: 0.35, c: 0.35, f: 0.30 }
    };
    
    const ratios = macroRatios[mealType] || macroRatios.breakfast;
    const protein = Math.round((calories * ratios.p) / 4);
    const carbs = Math.round((calories * ratios.c) / 4);
    const fats = Math.round((calories * ratios.f) / 9);
    
    return `P: ${protein}g, C: ${carbs}g, F: ${fats}g`;
}

// Generate HTML for the progressive chart
function generateChartHTML(chartData, stepNumber, chartType, targetCalories) {
    const refinementsList = chartData.refinements.map(r => `<li>${r}</li>`).join('');
    
    return `
    <div class="progressive-chart-container">
        ${getProgressiveChartCSS()}
        <div class="progressive-chart-header">
            <h4>🔄 Step ${stepNumber} Progressive Diet Chart - ${chartType}</h4>
            <span class="chart-calories">Target: ${targetCalories} calories</span>
        </div>
        
        <div class="refinement-history">
            <h5>🎯 Progressive Refinements:</h5>
            <ul>${refinementsList}</ul>
        </div>
        
        <table class="progressive-diet-table">
            <thead>
                <tr>
                    <th>⏰ Time</th>
                    <th>🍽️ Meal</th>
                    <th>🔥 Calories</th>
                    <th>🥗 Food Items</th>
                    <th>📊 Macros</th>
                </tr>
            </thead>
            <tbody>
                ${chartData.meals.map(meal => `
                    <tr>
                        <td>${meal.time}</td>
                        <td>${meal.name}</td>
                        <td>${meal.calories}</td>
                        <td>${meal.foods}</td>
                        <td>${meal.macros}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="progressive-note">
            <small>💡 This chart has been progressively refined through ${stepNumber} step${stepNumber > 1 ? 's' : ''}</small>
        </div>
    </div>`;
}

// CSS for progressive charts
function getProgressiveChartCSS() {
    return `<style>
    .progressive-chart-container {
        background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
        border-radius: 15px;
        padding: 25px;
        margin: 20px 0;
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        border: 2px solid #4a90e2;
        position: relative;
        overflow: hidden;
    }
    .progressive-chart-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #4a90e2, #50c878, #ffd700);
        animation: progressGlow 3s ease-in-out infinite;
    }
    @keyframes progressGlow {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
    }
    .progressive-chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #4a90e2;
    }
    .progressive-chart-header h4 {
        margin: 0;
        color: #2c5aa0;
        font-size: 20px;
        font-weight: 700;
    }
    .chart-calories {
        background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
        color: white;
        padding: 8px 15px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 600;
    }
    .refinement-history {
        background: linear-gradient(135deg, #fff9e6 0%, #ffeaa7 100%);
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 20px;
        border-left: 4px solid #fdcb6e;
    }
    .refinement-history h5 {
        margin: 0 0 10px 0;
        color: #d63031;
        font-size: 16px;
    }
    .refinement-history ul {
        margin: 0;
        padding-left: 20px;
        list-style-type: none;
    }
    .refinement-history li {
        margin: 5px 0;
        color: #2d3436;
        font-size: 14px;
        position: relative;
    }
    .refinement-history li::before {
        content: '✨';
        position: absolute;
        left: -20px;
    }
    .progressive-diet-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 6px 12px rgba(0,0,0,0.08);
    }
    .progressive-diet-table th {
        background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
        color: white;
        padding: 16px 12px;
        text-align: center;
        font-weight: 700;
        font-size: 15px;
    }
    .progressive-diet-table td {
        padding: 14px 12px;
        border-bottom: 1px solid #e9ecef;
        text-align: center;
        font-size: 14px;
        color: #2d3436;
        transition: all 0.3s ease;
    }
    .progressive-diet-table tr:nth-child(even) {
        background: #f8f9fa;
    }
    .progressive-diet-table tr:hover {
        background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%);
        transform: scale(1.01);
        box-shadow: 0 4px 8px rgba(74,144,226,0.2);
    }
    .progressive-note {
        margin-top: 15px;
        text-align: center;
        color: #6c757d;
        font-style: italic;
    }
    </style>`;
}
