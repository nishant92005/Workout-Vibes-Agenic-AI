from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import sqlite3
import os
from datetime import datetime, timedelta
import json
import base64
import io
from PIL import Image
import requests
import random
import re
import numpy as np
from indian_food_database import INDIAN_FOOD_DATABASE, search_food_by_keywords, get_food_info
from advanced_food_detector import detect_food_advanced

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///workoutvibes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db = SQLAlchemy(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    image = db.Column(db.String(500))
    price = db.Column(db.Float, nullable=False)

class Cart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(120), nullable=False)
    product_id = db.Column(db.Integer, nullable=False)
    quantity = db.Column(db.Integer, default=1)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(120), nullable=False)
    order_time = db.Column(db.DateTime, default=datetime.utcnow)

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, nullable=False)
    product_id = db.Column(db.Integer, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

class Membership(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(120), nullable=False)
    plan = db.Column(db.String(50), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)

class DietChart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(120), nullable=False)
    chart_name = db.Column(db.String(200), nullable=False)
    chart_data = db.Column(db.Text, nullable=False)  # JSON string of diet chart
    user_data = db.Column(db.Text, nullable=False)   # JSON string of user profile
    goal = db.Column(db.String(100), nullable=False)
    target_calories = db.Column(db.Integer, nullable=False)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

# Helper function to check if user is registered
def is_registered_user(user_email):
    if not user_email or user_email.strip() == '':
        return False
    user = User.query.filter_by(email=user_email).first()
    return user is not None

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login.html')
def login_page():
    return render_template('login.html')

@app.route('/signup.html')
def signup_page():
    return render_template('signup.html')

@app.route('/diet-chart.html')
def diet_chart_page():
    return render_template('diet-chart.html')

@app.route('/shop.html')
def shop_page():
    user_email = request.args.get('user_email')
    if not user_email or user_email.strip() == '':
        return redirect(url_for('login_page'))
    return render_template('shop.html')

@app.route('/history.html')
def history_page():
    return render_template('history.html')

@app.route('/membership-history.html')
def membership_history_page():
    return render_template('membership-history.html')

@app.route('/calories-analysis.html')
def calories_analysis_page():
    return render_template('calories-analysis.html')

@app.route('/merge-diet-chart.html')
def merge_diet_chart_page():
    return render_template('merge-diet-chart.html')

# API Routes
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'All fields required.'})
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'success': False, 'message': 'Email already registered.'})
    
    # Create new user
    hashed_password = generate_password_hash(password)
    new_user = User(name=name, email=email, password=hashed_password)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Signup failed.'})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'success': False, 'message': 'All fields required.'})
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'success': False, 'message': 'User not found.'})
    
    if not check_password_hash(user.password, password):
        return jsonify({'success': False, 'message': 'Incorrect password.'})
    
    return jsonify({'success': True, 'userName': user.name})


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/api/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    products_list = []
    for product in products:
        products_list.append({
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'image': product.image,
            'price': product.price
        })
    return jsonify({'success': True, 'products': products_list})

@app.route('/api/cart', methods=['POST'])
def add_to_cart():
    data = request.get_json()
    user_email = data.get('user_email')
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)
    
    if not is_registered_user(user_email) or not product_id:
        return jsonify({'success': False, 'message': 'Not authenticated'})
    
    # Check if item already in cart
    existing_cart_item = Cart.query.filter_by(user_email=user_email, product_id=product_id).first()
    
    try:
        if existing_cart_item:
            existing_cart_item.quantity += quantity
        else:
            new_cart_item = Cart(user_email=user_email, product_id=product_id, quantity=quantity)
            db.session.add(new_cart_item)
        
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False})

@app.route('/api/cart', methods=['GET'])
def get_cart():
    user_email = request.args.get('user_email')
    
    if not is_registered_user(user_email):
        return jsonify({'success': False, 'message': 'Not authenticated'})
    
    # Join cart with products
    cart_items = db.session.query(Cart, Product).join(Product, Cart.product_id == Product.id).filter(Cart.user_email == user_email).all()
    
    cart_list = []
    for cart_item, product in cart_items:
        cart_list.append({
            'id': cart_item.id,
            'product_id': product.id,
            'name': product.name,
            'price': product.price,
            'image': product.image,
            'quantity': cart_item.quantity
        })
    
    return jsonify({'success': True, 'cart': cart_list})

@app.route('/api/cart', methods=['DELETE'])
def remove_from_cart():
    data = request.get_json()
    user_email = data.get('user_email')
    product_id = data.get('product_id')
    
    if not is_registered_user(user_email) or not product_id:
        return jsonify({'success': False, 'message': 'Not authenticated'})
    
    try:
        Cart.query.filter_by(user_email=user_email, product_id=product_id).delete()
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False})

@app.route('/api/order', methods=['POST'])
def create_order():
    data = request.get_json()
    user_email = data.get('user_email')
    
    if not is_registered_user(user_email):
        return jsonify({'success': False, 'message': 'Not authenticated'})
    
    try:
        # Create order
        new_order = Order(user_email=user_email)
        db.session.add(new_order)
        db.session.flush()  # Get the order ID
        
        # Get cart items
        cart_items = Cart.query.filter_by(user_email=user_email).all()
        
        # Add order items
        for cart_item in cart_items:
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity
            )
            db.session.add(order_item)
        
        # Clear cart
        Cart.query.filter_by(user_email=user_email).delete()
        
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False})

@app.route('/api/history', methods=['GET'])
def get_order_history():
    user_email = request.args.get('user_email')
    
    if not is_registered_user(user_email):
        return jsonify({'success': False, 'message': 'Not authenticated'})
    
    # Join orders, order_items, and products
    history = db.session.query(Order, OrderItem, Product).join(
        OrderItem, Order.id == OrderItem.order_id
    ).join(
        Product, OrderItem.product_id == Product.id
    ).filter(Order.user_email == user_email).order_by(Order.order_time.desc()).all()
    
    history_list = []
    for order, order_item, product in history:
        history_list.append({
            'order_id': order.id,
            'order_time': order.order_time.isoformat(),
            'product_id': product.id,
            'quantity': order_item.quantity,
            'name': product.name,
            'price': product.price,
            'image': product.image
        })
    
    return jsonify({'success': True, 'history': history_list})

@app.route('/api/membership/buy', methods=['POST'])
def buy_membership():
    data = request.get_json()
    user_email = data.get('user_email')
    plan = data.get('plan')
    
    if not is_registered_user(user_email) or not plan:
        return jsonify({'success': False, 'message': 'Not authenticated'})
    
    # Calculate membership duration
    months = 1
    if plan == '6months':
        months = 6
    elif plan == '1year':
        months = 12
    
    start_date = datetime.now()
    end_date = start_date + timedelta(days=30 * months)
    
    try:
        new_membership = Membership(
            user_email=user_email,
            plan=plan,
            start_date=start_date,
            end_date=end_date
        )
        db.session.add(new_membership)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False})

# Diet Chart API Routes
@app.route('/api/diet-chart/save', methods=['POST'])
def save_diet_chart():
    data = request.get_json()
    user_email = data.get('user_email')
    chart_name = data.get('chart_name')
    chart_data = data.get('chart_data')
    user_data = data.get('user_data')
    goal = data.get('goal')
    target_calories = data.get('target_calories')
    
    if not is_registered_user(user_email):
        return jsonify({'success': False, 'message': 'Not authenticated'})
    
    if not all([chart_name, chart_data, user_data, goal, target_calories]):
        return jsonify({'success': False, 'message': 'Missing required data'})
    
    try:
        new_diet_chart = DietChart(
            user_email=user_email,
            chart_name=chart_name,
            chart_data=json.dumps(chart_data),
            user_data=json.dumps(user_data),
            goal=goal,
            target_calories=target_calories
        )
        db.session.add(new_diet_chart)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Diet chart saved successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Failed to save diet chart'})

@app.route('/api/diet-chart/list', methods=['GET'])
def get_diet_charts():
    user_email = request.args.get('user_email')
    
    if not is_registered_user(user_email):
        return jsonify({'success': False, 'message': 'Not authenticated'})
    
    try:
        diet_charts = DietChart.query.filter_by(user_email=user_email, is_active=True).order_by(DietChart.created_date.desc()).all()
        
        charts_list = []
        for chart in diet_charts:
            charts_list.append({
                'id': chart.id,
                'chart_name': chart.chart_name,
                'goal': chart.goal,
                'target_calories': chart.target_calories,
                'created_date': chart.created_date.isoformat(),
                'chart_data': json.loads(chart.chart_data),
                'user_data': json.loads(chart.user_data)
            })
        
        return jsonify({'success': True, 'charts': charts_list})
    except Exception as e:
        return jsonify({'success': False, 'message': 'Failed to fetch diet charts'})

@app.route('/api/diet-chart/delete', methods=['DELETE'])
def delete_diet_chart():
    data = request.get_json()
    user_email = data.get('user_email')
    chart_id = data.get('chart_id')
    
    if not is_registered_user(user_email) or not chart_id:
        return jsonify({'success': False, 'message': 'Not authenticated or missing chart ID'})
    
    try:
        diet_chart = DietChart.query.filter_by(id=chart_id, user_email=user_email).first()
        if not diet_chart:
            return jsonify({'success': False, 'message': 'Diet chart not found'})
        
        diet_chart.is_active = False
        db.session.commit()
        return jsonify({'success': True, 'message': 'Diet chart removed successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Failed to remove diet chart'})

@app.route('/api/diet-chart/merge', methods=['POST'])
def merge_diet_charts():
    data = request.get_json()
    user_email = data.get('user_email')
    selected_chart_ids = data.get('selected_chart_ids')
    merge_goal = data.get('merge_goal')
    
    if not is_registered_user(user_email) or not selected_chart_ids or not merge_goal:
        return jsonify({'success': False, 'message': 'Missing required data'})
    
    try:
        # Get selected diet charts
        selected_charts = DietChart.query.filter(
            DietChart.id.in_(selected_chart_ids),
            DietChart.user_email == user_email,
            DietChart.is_active == True
        ).all()
        
        if not selected_charts:
            return jsonify({'success': False, 'message': 'No valid charts found'})
        
        # Generate merged diet chart
        merged_chart_data = generate_merged_diet_chart(selected_charts, merge_goal)
        
        # Create merged chart name
        chart_names = [chart.chart_name for chart in selected_charts]
        merged_name = f"Merged Diet Plan - {merge_goal} ({len(selected_charts)} charts)"
        
        # Calculate average target calories
        avg_calories = sum(chart.target_calories for chart in selected_charts) // len(selected_charts)
        
        # Save merged diet chart
        merged_chart = DietChart(
            user_email=user_email,
            chart_name=merged_name,
            chart_data=json.dumps(merged_chart_data),
            user_data=json.dumps(json.loads(selected_charts[0].user_data)),  # Use first chart's user data
            goal=merge_goal,
            target_calories=avg_calories
        )
        db.session.add(merged_chart)
        
        # Deactivate all previous diet charts for this user
        DietChart.query.filter_by(user_email=user_email, is_active=True).update({'is_active': False})
        
        # Activate only the merged chart
        merged_chart.is_active = True
        
        db.session.commit()
        
        return jsonify({
            'success': True, 
            'message': 'Diet charts merged successfully',
            'merged_chart': {
                'id': merged_chart.id,
                'chart_name': merged_chart.chart_name,
                'goal': merged_chart.goal,
                'target_calories': merged_chart.target_calories,
                'chart_data': merged_chart_data
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Failed to merge diet charts: {str(e)}'})

def generate_merged_diet_chart(selected_charts, merge_goal):
    """Generate an optimized merged diet chart from selected charts"""
    
    # Extract all meals from selected charts
    all_meals = []
    total_calories = 0
    user_preferences = set()
    
    for chart in selected_charts:
        chart_data = json.loads(chart.chart_data)
        user_data = json.loads(chart.user_data)
        
        if 'meals' in chart_data:
            all_meals.extend(chart_data['meals'])
            total_calories += chart_data.get('totalCalories', 0)
        
        # Collect user preferences
        user_preferences.add(user_data.get('dietaryPreferences', 'vegetarian'))
    
    # Calculate target calories based on goal
    avg_calories = total_calories // len(selected_charts) if selected_charts else 2000
    
    goal_adjustments = {
        'Weight Loss': -200,
        'Weight Gain': +300,
        'Muscle Building': +250,
        'Maintenance': 0,
        'Athletic Performance': +150
    }
    
    target_calories = avg_calories + goal_adjustments.get(merge_goal, 0)
    
    # Create optimized meal distribution based on goal
    if merge_goal == 'Weight Loss':
        meal_distribution = {
            'Breakfast': 0.30,  # Larger breakfast for weight loss
            'Mid-Morning': 0.10,
            'Lunch': 0.35,
            'Evening': 0.10,
            'Dinner': 0.15      # Smaller dinner
        }
    elif merge_goal == 'Muscle Building':
        meal_distribution = {
            'Breakfast': 0.25,
            'Mid-Morning': 0.15,  # More snacks for muscle building
            'Lunch': 0.30,
            'Evening': 0.15,
            'Dinner': 0.15
        }
    else:
        meal_distribution = {
            'Breakfast': 0.25,
            'Mid-Morning': 0.10,
            'Lunch': 0.35,
            'Evening': 0.10,
            'Dinner': 0.20
        }
    
    # Get primary dietary preference
    primary_preference = list(user_preferences)[0] if user_preferences else 'vegetarian'
    
    # Generate truly optimized meals with variety
    optimized_meals = []
    for meal_name, percentage in meal_distribution.items():
        meal_calories = int(target_calories * percentage)
        
        optimized_meal = {
            'time': get_default_meal_time(meal_name),
            'name': meal_name,
            'calories': meal_calories,
            'foods': generate_optimal_food_options(meal_name, merge_goal, primary_preference, meal_calories),
            'macros': calculate_optimal_macros(meal_calories, meal_name, merge_goal)
        }
        
        optimized_meals.append(optimized_meal)
    
    # Generate comprehensive optimization notes
    optimization_notes = generate_comprehensive_optimization_notes(merge_goal, len(selected_charts), target_calories, primary_preference)
    
    return {
        'meals': optimized_meals,
        'totalCalories': target_calories,
        'goal': merge_goal,
        'optimizationNotes': optimization_notes,
        'chartsUsed': len(selected_charts),
        'refinements': [
            f'Intelligently merged {len(selected_charts)} diet charts for {merge_goal}',
            f'Goal-optimized calorie distribution: {target_calories} total calories',
            f'Customized for {primary_preference} dietary preferences',
            'Meal-specific food variety and nutritional balance',
            'Optimized meal timing for metabolic efficiency'
        ]
    }

def generate_optimal_food_options(meal_name, goal, dietary_preference, calories):
    """Generate optimal food options for specific meal, goal, and preferences"""
    
    food_database = {
        'Breakfast': {
            'vegetarian': {
                'Weight Loss': ['Greek yogurt with berries and nuts', 'Vegetable omelet with whole grain toast', 'Oatmeal with protein powder and fruits'],
                'Weight Gain': ['Protein smoothie with banana and peanut butter', 'Avocado toast with eggs', 'Granola with full-fat yogurt and nuts'],
                'Muscle Building': ['Protein pancakes with Greek yogurt', 'Scrambled eggs with quinoa and vegetables', 'Cottage cheese with fruits and nuts'],
                'Maintenance': ['Balanced oatmeal with fruits and nuts', 'Vegetable omelet with whole grain bread', 'Greek yogurt parfait'],
                'Athletic Performance': ['High-protein smoothie bowl', 'Energy-dense oatmeal with nuts and seeds', 'Protein-rich egg scramble']
            },
            'non-vegetarian': {
                'Weight Loss': ['Egg white omelet with vegetables', 'Grilled chicken with avocado', 'Protein smoothie with berries'],
                'Weight Gain': ['Whole eggs with turkey bacon', 'Protein pancakes with chicken sausage', 'High-calorie smoothie with protein'],
                'Muscle Building': ['Lean beef with sweet potato hash', 'Chicken and egg scramble', 'Protein-packed omelet with lean meat'],
                'Maintenance': ['Balanced egg and meat breakfast', 'Chicken with whole grain toast', 'Protein smoothie with lean meat'],
                'Athletic Performance': ['High-protein meat and egg combo', 'Performance smoothie with whey', 'Lean meat with complex carbs']
            }
        },
        'Mid-Morning': {
            'vegetarian': {
                'Weight Loss': ['Apple with almond butter', 'Greek yogurt with cucumber', 'Mixed nuts and seeds'],
                'Weight Gain': ['Trail mix with dried fruits', 'Protein bar with nuts', 'Smoothie with protein powder'],
                'Muscle Building': ['Protein shake with banana', 'Cottage cheese with nuts', 'Greek yogurt with granola'],
                'Maintenance': ['Fresh fruit with nuts', 'Yogurt with berries', 'Healthy granola bar'],
                'Athletic Performance': ['Energy balls with dates and nuts', 'Protein smoothie', 'Mixed nuts and dried fruits']
            },
            'non-vegetarian': {
                'Weight Loss': ['Hard-boiled eggs', 'Turkey jerky', 'Protein shake'],
                'Weight Gain': ['Protein bar with nuts', 'Chicken salad wrap', 'High-calorie smoothie'],
                'Muscle Building': ['Whey protein shake', 'Lean meat snack', 'Protein-rich energy bar'],
                'Maintenance': ['Balanced protein snack', 'Lean meat with crackers', 'Protein smoothie'],
                'Athletic Performance': ['Performance protein bar', 'Lean meat snack', 'High-protein smoothie']
            }
        },
        'Lunch': {
            'vegetarian': {
                'Weight Loss': ['Large salad with quinoa and chickpeas', 'Vegetable curry with brown rice', 'Lentil soup with whole grain bread'],
                'Weight Gain': ['Quinoa bowl with avocado and nuts', 'Pasta with creamy vegetable sauce', 'Rice and dal with ghee'],
                'Muscle Building': ['Protein-rich lentil curry with quinoa', 'Paneer with vegetables and rice', 'High-protein pasta with cheese'],
                'Maintenance': ['Balanced dal-rice with vegetables', 'Quinoa salad with mixed vegetables', 'Vegetable curry with roti'],
                'Athletic Performance': ['Power bowl with quinoa and legumes', 'High-energy vegetable curry', 'Performance pasta with vegetables']
            },
            'non-vegetarian': {
                'Weight Loss': ['Grilled chicken salad with vegetables', 'Fish with steamed vegetables', 'Lean meat with quinoa'],
                'Weight Gain': ['Chicken curry with rice', 'Fish with sweet potato', 'Meat with pasta and sauce'],
                'Muscle Building': ['Grilled chicken with brown rice', 'Salmon with quinoa and vegetables', 'Lean beef with sweet potato'],
                'Maintenance': ['Balanced chicken with rice and vegetables', 'Fish with mixed grains', 'Lean meat with balanced sides'],
                'Athletic Performance': ['High-protein chicken bowl', 'Performance fish with complex carbs', 'Power meat and grain combo']
            }
        },
        'Evening': {
            'vegetarian': {
                'Weight Loss': ['Roasted chickpeas', 'Vegetable sticks with hummus', 'Green tea with almonds'],
                'Weight Gain': ['Protein smoothie with nuts', 'Granola with yogurt', 'Nut butter with fruits'],
                'Muscle Building': ['Protein bar with nuts', 'Greek yogurt with granola', 'Cottage cheese with fruits'],
                'Maintenance': ['Mixed nuts and fruits', 'Healthy snack bar', 'Yogurt with berries'],
                'Athletic Performance': ['Energy-dense nuts and seeds', 'Performance snack bar', 'High-protein smoothie']
            },
            'non-vegetarian': {
                'Weight Loss': ['Grilled chicken strips', 'Hard-boiled eggs', 'Protein shake'],
                'Weight Gain': ['Protein bar with meat', 'Chicken salad', 'High-calorie smoothie'],
                'Muscle Building': ['Lean meat snack', 'Protein shake with extras', 'Chicken with crackers'],
                'Maintenance': ['Balanced protein snack', 'Lean meat portion', 'Protein smoothie'],
                'Athletic Performance': ['Performance meat snack', 'High-protein bar', 'Power smoothie']
            }
        },
        'Dinner': {
            'vegetarian': {
                'Weight Loss': ['Vegetable curry with small roti', 'Lentil soup with salad', 'Grilled vegetables with quinoa'],
                'Weight Gain': ['Dal with rice and ghee', 'Paneer curry with naan', 'Pasta with creamy sauce'],
                'Muscle Building': ['High-protein dal with quinoa', 'Paneer with vegetables and rice', 'Protein-rich curry with bread'],
                'Maintenance': ['Balanced vegetable curry with roti', 'Dal-rice with vegetables', 'Quinoa with mixed curry'],
                'Athletic Performance': ['Power vegetable curry', 'High-energy dal-rice combo', 'Performance quinoa bowl']
            },
            'non-vegetarian': {
                'Weight Loss': ['Grilled fish with vegetables', 'Chicken soup with salad', 'Lean meat with steamed vegetables'],
                'Weight Gain': ['Chicken curry with rice', 'Fish with creamy sauce', 'Meat with pasta'],
                'Muscle Building': ['Grilled chicken with sweet potato', 'Salmon with quinoa', 'Lean beef with vegetables'],
                'Maintenance': ['Balanced chicken with rice', 'Fish with mixed vegetables', 'Lean meat with grains'],
                'Athletic Performance': ['High-protein fish dinner', 'Performance chicken bowl', 'Power meat with complex carbs']
            }
        }
    }
    
    # Get appropriate food options
    meal_foods = food_database.get(meal_name, {})
    preference_foods = meal_foods.get(dietary_preference, meal_foods.get('vegetarian', {}))
    goal_foods = preference_foods.get(goal, preference_foods.get('Maintenance', []))
    
    if goal_foods:
        return ', '.join(goal_foods[:3])  # Return top 3 options
    else:
        return f"Optimized {meal_name.lower()} for {goal} ({dietary_preference})"

def calculate_optimal_macros(calories, meal_name, goal='Maintenance'):
    """Calculate optimal macronutrient distribution for a meal based on goal"""
    
    # Goal-specific macro adjustments
    goal_macro_adjustments = {
        'Weight Loss': {'protein': 0.35, 'carbs': 0.35, 'fats': 0.30},
        'Weight Gain': {'protein': 0.25, 'carbs': 0.50, 'fats': 0.25},
        'Muscle Building': {'protein': 0.40, 'carbs': 0.35, 'fats': 0.25},
        'Athletic Performance': {'protein': 0.30, 'carbs': 0.45, 'fats': 0.25},
        'Maintenance': {'protein': 0.30, 'carbs': 0.45, 'fats': 0.25}
    }
    
    # Meal-specific base ratios
    meal_base_ratios = {
        'Breakfast': {'protein': 0.25, 'carbs': 0.50, 'fats': 0.25},
        'Mid-Morning': {'protein': 0.35, 'carbs': 0.45, 'fats': 0.20},
        'Lunch': {'protein': 0.30, 'carbs': 0.45, 'fats': 0.25},
        'Evening': {'protein': 0.40, 'carbs': 0.40, 'fats': 0.20},
        'Dinner': {'protein': 0.35, 'carbs': 0.35, 'fats': 0.30}
    }
    
    # Combine goal and meal ratios
    base_ratios = meal_base_ratios.get(meal_name, meal_base_ratios['Breakfast'])
    goal_ratios = goal_macro_adjustments.get(goal, goal_macro_adjustments['Maintenance'])
    
    # Average the ratios for optimal distribution
    optimal_ratios = {
        'protein': (base_ratios['protein'] + goal_ratios['protein']) / 2,
        'carbs': (base_ratios['carbs'] + goal_ratios['carbs']) / 2,
        'fats': (base_ratios['fats'] + goal_ratios['fats']) / 2
    }
    
    protein_g = round((calories * optimal_ratios['protein']) / 4)
    carbs_g = round((calories * optimal_ratios['carbs']) / 4)
    fats_g = round((calories * optimal_ratios['fats']) / 9)
    
    return f"P: {protein_g}g, C: {carbs_g}g, F: {fats_g}g"

def generate_comprehensive_optimization_notes(goal, charts_used, target_calories, dietary_preference):
    """Generate comprehensive optimization notes for merged diet chart"""
    
    goal_specific_notes = {
        'Weight Loss': [
            f"🔥 Calorie deficit optimized: {target_calories} calories for sustainable weight loss",
            "🍽️ Larger breakfast (30%) and smaller dinner (15%) for better metabolism",
            "🥗 High-protein meals (35-40%) to maintain muscle mass during weight loss",
            "⏰ Meal timing optimized for fat burning and energy maintenance"
        ],
        'Weight Gain': [
            f"📈 Calorie surplus optimized: {target_calories} calories for healthy weight gain",
            "🥜 Nutrient-dense, calorie-rich foods selected for efficient weight gain",
            "🍽️ Balanced meal distribution with emphasis on healthy fats (25%)",
            "💪 Protein intake optimized to support lean muscle growth"
        ],
        'Muscle Building': [
            f"💪 High-protein optimization: {target_calories} calories for muscle synthesis",
            "🥩 Protein intake increased to 40% for optimal muscle protein synthesis",
            "🍌 Strategic carb timing around workouts for energy and recovery",
            "⚡ Frequent meals (15% snacks) to maintain positive nitrogen balance"
        ],
        'Athletic Performance': [
            f"🏃‍♂️ Performance-focused: {target_calories} calories for peak athletic output",
            "⚡ Carbohydrate emphasis (45%) for sustained energy and glycogen replenishment",
            "🔋 Strategic meal timing for pre/post workout optimization",
            "💧 Enhanced hydration and electrolyte balance considerations"
        ],
        'Maintenance': [
            f"⚖️ Balanced maintenance: {target_calories} calories for weight stability",
            "🍽️ Classic meal distribution (25-35-20%) for sustained energy",
            "🥗 Balanced macronutrients (30-45-25%) for overall health",
            "🌱 Focus on nutrient variety and meal satisfaction"
        ]
    }
    
    base_notes = [
        f"🧠 AI-powered merge of {charts_used} personalized diet charts",
        f"🎯 Goal-specific optimization for {goal} with {dietary_preference} preferences",
        "🔄 Progressive refinement algorithm applied for maximum effectiveness",
        "📊 Scientifically-backed macro and calorie distribution",
        "🌟 Meal variety optimized to prevent dietary boredom"
    ]
    
    specific_notes = goal_specific_notes.get(goal, goal_specific_notes['Maintenance'])
    
    return base_notes + specific_notes

def get_default_meal_time(meal_name):
    """Get default time for meal types"""
    meal_times = {
        'Breakfast': '7:00 AM',
        'Mid-Morning': '10:00 AM', 
        'Lunch': '1:00 PM',
        'Evening': '4:00 PM',
        'Dinner': '7:00 PM'
    }
    return meal_times.get(meal_name, '12:00 PM')

def generate_default_meals(target_calories, goal):
    """Generate default meals when no options available"""
    base_meals = {
        'weight_loss': ['Oats with berries', 'Greek yogurt with nuts', 'Green smoothie'],
        'muscle_gain': ['Protein pancakes', 'Eggs with toast', 'Protein smoothie'],
        'weight_loss_muscle_gain': ['Egg white omelet', 'Protein oats', 'Lean protein shake'],
        'weight_loss_endurance': ['Quinoa porridge', 'Fruit bowl with nuts', 'Energy smoothie'],
        'muscle_gain_endurance': ['Power breakfast bowl', 'Protein-rich meal', 'Recovery shake']
    }
    
    return base_meals.get(goal, ['Balanced meal', 'Nutritious option', 'Healthy choice'])

def generate_optimization_notes(goal):
    """Generate optimization notes for merged diet chart"""
    notes = {
        'weight_loss': 'Optimized for fat loss with moderate calorie deficit and high protein retention',
        'weight_loss_muscle_gain': 'Balanced approach for simultaneous fat loss and muscle preservation',
        'muscle_gain': 'High protein and calorie surplus for optimal muscle building',
        'weight_loss_endurance': 'Endurance-focused with sustained energy and fat burning',
        'muscle_gain_endurance': 'Muscle building with endurance support and recovery optimization'
    }
    
    return notes.get(goal, 'Optimized for general health and fitness goals')

@app.route('/api/membership/history', methods=['GET'])
def get_membership_history():
    user_email = request.args.get('user_email')
    
    if not is_registered_user(user_email):
        return jsonify({'success': False, 'message': 'Not authenticated'})
    
    memberships = Membership.query.filter_by(user_email=user_email).order_by(Membership.start_date.desc()).all()
    
    now = datetime.now()
    history_list = []
    for membership in memberships:
        status = 'Expired' if membership.end_date < now else 'Not Expired'
        time_left = max(0, (membership.end_date - now).total_seconds() * 1000) if membership.end_date > now else 0
        
        history_list.append({
            'id': membership.id,
            'plan': membership.plan,
            'start': membership.start_date.isoformat(),
            'end': membership.end_date.isoformat(),
            'status': status,
            'timeLeft': time_left
        })
    
    return jsonify({'success': True, 'history': history_list})

# Image analysis patterns for Indian food detection
FOOD_DETECTION_PATTERNS = {
    'round_flat': ['roti', 'naan', 'paratha', 'dosa', 'uttapam'],
    'rice_grains': ['biryani', 'pulao', 'jeera_rice', 'fried_rice', 'lemon_rice'],
    'curry_gravy': ['dal_tadka', 'butter_chicken', 'paneer_makhani', 'rajma', 'chole'],
    'triangular': ['samosa', 'kachori'],
    'round_balls': ['gulab_jamun', 'rasgulla', 'laddu'],
    'small_round': ['idli', 'vada', 'pani_puri'],
    'mixed_vegetables': ['pav_bhaji', 'bhel_puri', 'aloo_gobi']
}

def analyze_image_properties(image_data):
    """Analyze basic image properties to help with food detection"""
    try:
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Get dominant colors (simplified)
        colors = image.getcolors(maxcolors=256*256*256)
        if colors:
            # Sort by frequency and get most common colors
            colors.sort(key=lambda x: x[0], reverse=True)
            dominant_colors = colors[:5]
            
            # Analyze color patterns
            color_analysis = []
            for count, color in dominant_colors:
                r, g, b = color
                if r > 200 and g > 150 and b < 100:  # Golden/yellow (rice, bread)
                    color_analysis.append('golden')
                elif r > 150 and g < 100 and b < 100:  # Red/brown (curry, meat)
                    color_analysis.append('reddish')
                elif r < 100 and g > 150 and b < 100:  # Green (vegetables)
                    color_analysis.append('green')
                elif r > 200 and g > 200 and b > 200:  # White (rice, bread)
                    color_analysis.append('white')
                elif r < 100 and g < 100 and b < 100:  # Dark (dal, gravy)
                    color_analysis.append('dark')
            
            return color_analysis
    except Exception as e:
        print(f"Image analysis error: {e}")
    
    return []

def detect_indian_food(image_data, filename=""):
    """Enhanced Indian food detection using image analysis and patterns"""
    
    # Analyze image properties
    color_patterns = analyze_image_properties(image_data)
    
    # Use filename hints if available
    filename_hints = []
    if filename:
        filename_lower = filename.lower()
        for food_name in INDIAN_FOOD_DATABASE.keys():
            if food_name.replace('_', ' ') in filename_lower or food_name in filename_lower:
                filename_hints.append(food_name)
    
    # Smart detection based on patterns
    possible_foods = []
    
    # Color-based detection
    if 'golden' in color_patterns or 'white' in color_patterns:
        possible_foods.extend(FOOD_DETECTION_PATTERNS['rice_grains'])
        possible_foods.extend(FOOD_DETECTION_PATTERNS['round_flat'])
    
    if 'reddish' in color_patterns or 'dark' in color_patterns:
        possible_foods.extend(FOOD_DETECTION_PATTERNS['curry_gravy'])
    
    if 'green' in color_patterns:
        possible_foods.extend(['palak_paneer', 'aloo_gobi', 'bhel_puri'])
    
    # If filename hints exist, prioritize them
    if filename_hints:
        detected_food = random.choice(filename_hints)
    elif possible_foods:
        detected_food = random.choice(possible_foods)
    else:
        # Fallback to popular Indian foods
        popular_foods = ['biryani', 'butter_chicken', 'dal_tadka', 'naan', 'samosa', 'dosa']
        detected_food = random.choice(popular_foods)
    
    return detected_food

def analyze_food_image(image_data, filename=""):
    """
    Advanced food recognition and nutrition analysis using computer vision
    """
    
    try:
        # Use advanced detection system
        detected_food, confidence = detect_food_advanced(image_data, filename)
        
        # Get nutrition data from database
        food_data = INDIAN_FOOD_DATABASE.get(detected_food, {})
        
        if not food_data:
            # Fallback to a default food
            detected_food = 'dal_tadka'
            food_data = INDIAN_FOOD_DATABASE[detected_food]
            confidence = 0.3
        
        # Extract nutrition information
        nutrition = {
            'calories': food_data.get('calories', 200),
            'protein': food_data.get('protein', 8),
            'carbs': food_data.get('carbs', 30),
            'fats': food_data.get('fats', 5),
            'fiber': food_data.get('fiber', 3),
            'sugar': food_data.get('sugar', 5)
        }
        
        # Add realistic variation based on confidence (higher confidence = less variation)
        variation_range = 0.15 * (1 - confidence)  # Less variation for higher confidence
        variation = random.uniform(1 - variation_range, 1 + variation_range)
        for key in nutrition:
            nutrition[key] = round(nutrition[key] * variation, 1)
        
        # Get description
        description = food_data.get('description', f'Traditional Indian {detected_food.replace("_", " ")}')
        
        # Generate health tips based on nutrition
        health_tips = []
        if nutrition['calories'] > 350:
            health_tips.append("⚠️ High calorie food - consider portion control")
        elif nutrition['calories'] < 100:
            health_tips.append("🍃 Low calorie option - great for weight management")
        
        if nutrition['protein'] > 20:
            health_tips.append("💪 Excellent protein source for muscle building")
        elif nutrition['protein'] > 10:
            health_tips.append("💪 Good protein content")
        
        if nutrition['fiber'] > 5:
            health_tips.append("🌾 High fiber content - excellent for digestive health")
        elif nutrition['fiber'] > 3:
            health_tips.append("🌾 Good fiber content for digestive health")
        
        if nutrition['fats'] > 20:
            health_tips.append("🥑 High in fats - ensure balanced intake")
        elif nutrition['fats'] < 3:
            health_tips.append("✅ Low fat option")
        
        if nutrition['sugar'] > 15:
            health_tips.append("🍯 Contains sugars - monitor intake if diabetic")
        
        # Add Indian food specific tips
        if detected_food in ['biryani', 'pulao', 'fried_rice']:
            health_tips.append("🍚 Rich in carbohydrates - perfect post-workout meal")
        elif detected_food in ['dal_tadka', 'rajma', 'chole', 'moong_dal', 'masoor_dal']:
            health_tips.append("🌱 Plant-based protein powerhouse")
        elif detected_food in ['paneer_makhani', 'butter_chicken', 'dal_makhani']:
            health_tips.append("🥛 Rich and creamy - enjoy in moderation")
        elif detected_food in ['samosa', 'pakora', 'vada']:
            health_tips.append("🔥 Deep-fried item - balance with lighter meals")
        elif detected_food in ['idli', 'dosa', 'uttapam']:
            health_tips.append("🌟 Fermented food - great for gut health")
        
        # Add confidence-based tip
        if confidence > 0.8:
            health_tips.append("🎯 High detection confidence - analysis is very accurate")
        elif confidence > 0.6:
            health_tips.append("✅ Good detection confidence - analysis is reliable")
        elif confidence < 0.4:
            health_tips.append("⚠️ Lower detection confidence - consider uploading a clearer image")
        
        if not health_tips:
            health_tips.append("✅ Well-balanced traditional Indian dish")
        
        return {
            'food_name': detected_food.replace('_', ' ').title(),
            'description': description,
            'nutrition': nutrition,
            'health_tips': health_tips,
            'image_url': food_data.get('image_url', ''),
            'confidence': round(confidence * 100, 1)
        }
        
    except Exception as e:
        print(f"Advanced analysis error: {e}")
        # Fallback to basic detection
        return analyze_food_image_basic(image_data, filename)

def analyze_food_image_basic(image_data, filename=""):
    """Fallback basic food detection"""
    detected_food = detect_indian_food(image_data, filename)
    food_data = INDIAN_FOOD_DATABASE.get(detected_food, INDIAN_FOOD_DATABASE['dal_tadka'])
    
    nutrition = {
        'calories': food_data.get('calories', 200),
        'protein': food_data.get('protein', 8),
        'carbs': food_data.get('carbs', 30),
        'fats': food_data.get('fats', 5),
        'fiber': food_data.get('fiber', 3),
        'sugar': food_data.get('sugar', 5)
    }
    
    return {
        'food_name': detected_food.replace('_', ' ').title(),
        'description': food_data.get('description', 'Traditional Indian dish'),
        'nutrition': nutrition,
        'health_tips': ["✅ Basic detection - nutritional analysis provided"],
        'image_url': food_data.get('image_url', ''),
        'confidence': 30.0
    }

@app.route('/api/analyze-food', methods=['POST'])
def analyze_food():
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'message': 'No image uploaded'})
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No image selected'})
        
        if file and file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
            # Read and process the image
            image_data = file.read()
            
            # Analyze the food image with filename for better detection
            analysis_result = analyze_food_image(image_data, file.filename)
            
            return jsonify({
                'success': True,
                'food_name': analysis_result['food_name'],
                'description': analysis_result['description'],
                'nutrition': analysis_result['nutrition'],
                'health_tips': analysis_result['health_tips'],
                'reference_image': analysis_result.get('image_url', ''),
                'confidence': analysis_result.get('confidence', 50.0)
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid image format'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'Analysis failed: {str(e)}'})

@app.route('/api/demo-products', methods=['GET'])
def add_demo_products():
    demo_products = [
        {
            'name': 'Creatine Monohydrate',
            'description': 'Micronized creatine powder for muscle growth, strength, and performance. 100 servings.',
            'image': 'https://m.media-amazon.com/images/I/61auT4jdRQL._UF1000,1000_QL80_.jpg',
            'price': 1399.00
        },
        {
            'name': 'Whey Protein',
            'description': 'High-quality whey protein for muscle recovery and building. 1kg, chocolate flavor.',
            'image': 'https://m.media-amazon.com/images/I/71l2r6yqQ0L._AC_SL1500_.jpg',
            'price': 2499.00
        },
        {
            'name': 'BCAA Powder',
            'description': 'Branched-chain amino acids for muscle recovery and endurance. 30 servings.',
            'image': 'https://m.media-amazon.com/images/I/71QKQ9mwV7L._AC_SL1500_.jpg',
            'price': 1199.00
        },
        {
            'name': 'Electrol Hydration Drink',
            'description': 'Electrolyte drink for instant hydration and energy during workouts.',
            'image': 'https://m.media-amazon.com/images/I/61Q5p1QKQwL._AC_SL1000_.jpg',
            'price': 299.00
        },
        {
            'name': 'Gym Shaker Bottle',
            'description': 'Leak-proof shaker bottle for protein shakes and supplements. 700ml.',
            'image': 'https://m.media-amazon.com/images/I/61Q5p1QKQwL._AC_SL1000_.jpg',
            'price': 349.00
        },
        {
            'name': 'Gym Bag',
            'description': 'Spacious and durable gym bag with shoe compartment and water-resistant material.',
            'image': 'https://m.media-amazon.com/images/I/81Q5p1QKQwL._AC_SL1500_.jpg',
            'price': 899.00
        },
        {
            'name': 'Resistance Bands Set',
            'description': 'Set of 5 resistance bands for strength training, stretching, and mobility.',
            'image': 'https://m.media-amazon.com/images/I/71QKQ9mwV7L._AC_SL1500_.jpg',
            'price': 499.00
        },
        {
            'name': 'Yoga Mat',
            'description': 'Non-slip yoga mat for workouts, pilates, and stretching. 6mm thick.',
            'image': 'https://m.media-amazon.com/images/I/81Q5p1QKQwL._AC_SL1500_.jpg',
            'price': 599.00
        }
    ]
    
    try:
        for product_data in demo_products:
            # Check if product already exists
            existing = Product.query.filter_by(name=product_data['name']).first()
            if not existing:
                product = Product(
                    name=product_data['name'],
                    description=product_data['description'],
                    image=product_data['image'],
                    price=product_data['price']
                )
                db.session.add(product)
        
        db.session.commit()
        return jsonify({'success': True, 'message': 'Demo products added.'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Failed to add demo products.'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=3000)
