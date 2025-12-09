// Calories Analysis JavaScript
let nutritionChart = null;

document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const foodImageInput = document.getElementById('foodImageInput');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultsSection = document.getElementById('resultsSection');
    const loadingSection = document.getElementById('loadingSection');

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageUpload(files[0]);
        }
    });

    // File input change
    foodImageInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleImageUpload(e.target.files[0]);
        }
    });

    // Analyze button click
    analyzeBtn.addEventListener('click', function() {
        analyzeFood();
    });

    function handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload a valid image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            uploadArea.style.display = 'none';
            imagePreview.style.display = 'block';
            resultsSection.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    function analyzeFood() {
        const file = foodImageInput.files[0];
        if (!file) {
            alert('Please select an image first.');
            return;
        }

        // Show loading
        imagePreview.style.display = 'none';
        loadingSection.style.display = 'block';
        resultsSection.style.display = 'none';

        const formData = new FormData();
        formData.append('image', file);

        fetch('/api/analyze-food', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            loadingSection.style.display = 'none';
            
            if (data.success) {
                displayResults(data);
            } else {
                alert('Analysis failed: ' + data.message);
                imagePreview.style.display = 'block';
            }
        })
        .catch(error => {
            loadingSection.style.display = 'none';
            alert('Error analyzing image: ' + error.message);
            imagePreview.style.display = 'block';
        });
    }

    function displayResults(data) {
        // Update food info
        document.getElementById('foodName').textContent = data.food_name;
        document.getElementById('foodDescription').textContent = data.description;

        // Add confidence indicator
        const confidenceLevel = data.confidence || 50;
        const confidenceColor = confidenceLevel > 70 ? '#4CAF50' : confidenceLevel > 50 ? '#FF9800' : '#F44336';
        const confidenceText = `Detection Confidence: ${confidenceLevel}%`;
        
        // Create or update confidence indicator
        let confidenceElement = document.getElementById('confidenceIndicator');
        if (!confidenceElement) {
            confidenceElement = document.createElement('div');
            confidenceElement.id = 'confidenceIndicator';
            confidenceElement.style.cssText = `
                margin: 10px 0;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 0.9rem;
                font-weight: bold;
                text-align: center;
            `;
            document.getElementById('foodDescription').parentNode.appendChild(confidenceElement);
        }
        
        confidenceElement.textContent = confidenceText;
        confidenceElement.style.backgroundColor = confidenceColor + '20';
        confidenceElement.style.color = confidenceColor;
        confidenceElement.style.border = `2px solid ${confidenceColor}`;

        // Update nutrition values
        document.getElementById('caloriesValue').textContent = `${data.nutrition.calories} kcal`;
        document.getElementById('proteinValue').textContent = `${data.nutrition.protein}g`;
        document.getElementById('carbsValue').textContent = `${data.nutrition.carbs}g`;
        document.getElementById('fatsValue').textContent = `${data.nutrition.fats}g`;
        document.getElementById('fiberValue').textContent = `${data.nutrition.fiber}g`;
        document.getElementById('sugarValue').textContent = `${data.nutrition.sugar}g`;

        // Update health tips
        const healthTipsContainer = document.getElementById('healthTips');
        healthTipsContainer.innerHTML = '';
        data.health_tips.forEach(tip => {
            const tipElement = document.createElement('div');
            tipElement.className = 'health-tip';
            tipElement.textContent = tip;
            healthTipsContainer.appendChild(tipElement);
        });

        // Create nutrition chart
        createNutritionChart(data.nutrition);

        // Show results
        resultsSection.style.display = 'block';
    }

    function createNutritionChart(nutrition) {
        const ctx = document.getElementById('nutritionChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (nutritionChart) {
            nutritionChart.destroy();
        }

        const macronutrients = {
            protein: nutrition.protein * 4, // 4 calories per gram
            carbs: nutrition.carbs * 4,     // 4 calories per gram
            fats: nutrition.fats * 9        // 9 calories per gram
        };

        nutritionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Protein', 'Carbohydrates', 'Fats'],
                datasets: [{
                    data: [macronutrients.protein, macronutrients.carbs, macronutrients.fats],
                    backgroundColor: [
                        '#FF6B6B', // Red for protein
                        '#4ECDC4', // Teal for carbs
                        '#45B7D1'  // Blue for fats
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                size: 14
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label;
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value.toFixed(1)} kcal (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Reset functionality
    window.resetAnalysis = function() {
        uploadArea.style.display = 'block';
        imagePreview.style.display = 'none';
        resultsSection.style.display = 'none';
        loadingSection.style.display = 'none';
        foodImageInput.value = '';
        
        if (nutritionChart) {
            nutritionChart.destroy();
            nutritionChart = null;
        }
    };
});
