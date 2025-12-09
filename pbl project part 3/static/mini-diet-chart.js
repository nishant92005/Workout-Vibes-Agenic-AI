// Generate progressive diet chart that builds upon previous steps
function generateMiniDietChart(userData, stepNumber, chartType, previousChart = null) {
    const targetCalories = userData.caloriesIntake || 2000;
    const dietType = userData.dietaryPreferences || 'vegetarian';
    
    // Calculate calories based on step progression
    let breakfastCals, snackCals, lunchCals, eveningCals, dinnerCals;
    
    // Progressive refinement: each step builds upon the previous
    if (stepNumber === 1) {
        // Step 1: Basic profile-based distribution
        breakfastCals = Math.round(targetCalories * 0.25);
        snackCals = Math.round(targetCalories * 0.10);
        lunchCals = Math.round(targetCalories * 0.35);
        eveningCals = Math.round(targetCalories * 0.10);
        dinnerCals = Math.round(targetCalories * 0.20);
    } else {
        // Steps 2-6: Refine the previous step's distribution
        const previousDistribution = getPreviousDistribution(stepNumber);
        breakfastCals = Math.round(targetCalories * previousDistribution.breakfast);
        snackCals = Math.round(targetCalories * previousDistribution.snack);
        lunchCals = Math.round(targetCalories * previousDistribution.lunch);
        eveningCals = Math.round(targetCalories * previousDistribution.evening);
        dinnerCals = Math.round(targetCalories * previousDistribution.dinner);
    }
    
    // Get food items based on step and diet type
    const foods = getMiniChartFoods(stepNumber, dietType, userData.region);
    
    return `
    <div class="mini-chart-container">
        ${getMiniChartCSS()}
        <div class="mini-chart-header">
            <h4>🍽️ Step ${stepNumber} Diet Preview - ${chartType}</h4>
            <span class="chart-calories">Target: ${targetCalories} calories</span>
        </div>
        <table class="mini-diet-table">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Meal</th>
                    <th>Calories</th>
                    <th>Food Items</th>
                    <th>Macros</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>7:00 AM</td>
                    <td>Breakfast</td>
                    <td>${breakfastCals}</td>
                    <td>${foods.breakfast}</td>
                    <td>${getMacros(breakfastCals, 'breakfast')}</td>
                </tr>
                <tr>
                    <td>10:00 AM</td>
                    <td>Snack</td>
                    <td>${snackCals}</td>
                    <td>${foods.snack}</td>
                    <td>${getMacros(snackCals, 'snack')}</td>
                </tr>
                <tr>
                    <td>1:00 PM</td>
                    <td>Lunch</td>
                    <td>${lunchCals}</td>
                    <td>${foods.lunch}</td>
                    <td>${getMacros(lunchCals, 'lunch')}</td>
                </tr>
                <tr>
                    <td>4:00 PM</td>
                    <td>Evening</td>
                    <td>${eveningCals}</td>
                    <td>${foods.evening}</td>
                    <td>${getMacros(eveningCals, 'evening')}</td>
                </tr>
                <tr>
                    <td>7:00 PM</td>
                    <td>Dinner</td>
                    <td>${dinnerCals}</td>
                    <td>${foods.dinner}</td>
                    <td>${getMacros(dinnerCals, 'dinner')}</td>
                </tr>
            </tbody>
        </table>
        <div class="mini-chart-note">
            <small>💡 This preview adapts based on Step ${stepNumber} insights</small>
        </div>
    </div>`;
}

// Get food items based on step, diet type and region
function getMiniChartFoods(step, dietType, region) {
    const foods = {
        vegetarian: {
            breakfast: ['Oats with fruits & nuts', 'Whole grain toast with avocado', 'Greek yogurt with berries', 'Smoothie bowl'],
            snack: ['Mixed nuts', 'Fresh fruit', 'Green tea', 'Vegetable juice'],
            lunch: ['Dal rice with vegetables', 'Quinoa salad', 'Vegetable curry with roti', 'Lentil soup'],
            evening: ['Herbal tea', 'Roasted chickpeas', 'Fruit salad', 'Coconut water'],
            dinner: ['Light vegetable curry', 'Grilled paneer', 'Vegetable soup', 'Steamed vegetables']
        },
        vegan: {
            breakfast: ['Oat porridge with almond milk', 'Chia pudding', 'Fruit smoothie', 'Whole grain cereal'],
            snack: ['Raw almonds', 'Apple slices', 'Green juice', 'Coconut water'],
            lunch: ['Quinoa bowl', 'Lentil curry', 'Vegetable stir-fry', 'Bean salad'],
            evening: ['Herbal tea', 'Dates', 'Fresh fruit', 'Vegetable juice'],
            dinner: ['Tofu curry', 'Vegetable soup', 'Grilled vegetables', 'Legume stew']
        },
        nonvegetarian: {
            breakfast: ['Egg omelet with vegetables', 'Chicken sandwich', 'Protein smoothie', 'Greek yogurt'],
            snack: ['Boiled eggs', 'Protein bar', 'Fresh fruit', 'Milk'],
            lunch: ['Grilled chicken with rice', 'Fish curry', 'Chicken salad', 'Lean meat with vegetables'],
            evening: ['Protein shake', 'Nuts', 'Fruit', 'Buttermilk'],
            dinner: ['Grilled fish', 'Chicken soup', 'Lean meat curry', 'Egg curry']
        }
    };
    
    const selectedFoods = foods[dietType] || foods.vegetarian;
    const stepIndex = (step - 1) % 4; // Cycle through food options
    
    return {
        breakfast: selectedFoods.breakfast[stepIndex],
        snack: selectedFoods.snack[stepIndex],
        lunch: selectedFoods.lunch[stepIndex],
        evening: selectedFoods.evening[stepIndex],
        dinner: selectedFoods.dinner[stepIndex]
    };
}

// Calculate macros based on calories and meal type
function getMacros(calories, mealType) {
    let proteinRatio, carbRatio, fatRatio;
    
    switch(mealType) {
        case 'breakfast':
            proteinRatio = 0.25; carbRatio = 0.50; fatRatio = 0.25;
            break;
        case 'snack':
            proteinRatio = 0.20; carbRatio = 0.60; fatRatio = 0.20;
            break;
        case 'lunch':
            proteinRatio = 0.30; carbRatio = 0.45; fatRatio = 0.25;
            break;
        case 'evening':
            proteinRatio = 0.25; carbRatio = 0.55; fatRatio = 0.20;
            break;
        case 'dinner':
            proteinRatio = 0.35; carbRatio = 0.35; fatRatio = 0.30;
            break;
        default:
            proteinRatio = 0.25; carbRatio = 0.50; fatRatio = 0.25;
    }
    
    const protein = Math.round((calories * proteinRatio) / 4); // 4 calories per gram
    const carbs = Math.round((calories * carbRatio) / 4);
    const fats = Math.round((calories * fatRatio) / 9); // 9 calories per gram
    
    return `${protein}P/${carbs}C/${fats}F`;
}

// CSS for mini diet charts
function getMiniChartCSS() {
    return `<style>
    .mini-chart-container {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        border-radius: 12px;
        padding: 20px;
        margin: 15px 0;
        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        border: 1px solid #e1e8ed;
    }
    .mini-chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 2px solid #667eea;
    }
    .mini-chart-header h4 {
        margin: 0;
        color: #2c3e50;
        font-size: 18px;
        font-weight: 600;
    }
    .chart-calories {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
    }
    .mini-diet-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0,0,0,0.05);
    }
    .mini-diet-table th {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 8px;
        text-align: left;
        font-weight: 600;
        font-size: 14px;
    }
    .mini-diet-table td {
        padding: 10px 8px;
        border-bottom: 1px solid #f1f3f4;
        font-size: 13px;
        color: #2c3e50;
    }
    .mini-diet-table tr:nth-child(even) {
        background: #f8f9fa;
    }
    .mini-diet-table tr:hover {
        background: #e3f2fd;
        transform: translateY(-1px);
        transition: all 0.2s ease;
    }
    .mini-chart-note {
        margin-top: 12px;
        text-align: center;
        color: #6c757d;
        font-style: italic;
    }
    .mini-chart-note small {
        font-size: 12px;
    }
    </style>`;
}
