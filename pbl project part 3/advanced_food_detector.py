import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
import io
import colorsys
from collections import Counter
import math
from indian_food_database import INDIAN_FOOD_DATABASE

class AdvancedFoodDetector:
    def __init__(self):
        # Define comprehensive visual patterns for Indian foods
        self.food_visual_patterns = {
            # Rice dishes - grain patterns and colors
            'biryani': {
                'colors': [(255, 215, 0), (255, 165, 0), (139, 69, 19)],  # Golden, orange, brown
                'texture': 'grainy',
                'shape': 'scattered_grains',
                'keywords': ['rice', 'grains', 'mixed', 'colorful'],
                'confidence_boost': 0.3
            },
            'pulao': {
                'colors': [(255, 255, 224), (255, 215, 0), (144, 238, 144)],  # Light yellow, golden, light green
                'texture': 'grainy',
                'shape': 'uniform_grains',
                'keywords': ['rice', 'light', 'uniform'],
                'confidence_boost': 0.25
            },
            'fried_rice': {
                'colors': [(255, 215, 0), (255, 99, 71), (34, 139, 34)],  # Golden, tomato, green
                'texture': 'mixed',
                'shape': 'scattered_pieces',
                'keywords': ['rice', 'vegetables', 'mixed'],
                'confidence_boost': 0.2
            },
            
            # Bread items - flat circular/oval shapes
            'roti': {
                'colors': [(222, 184, 135), (210, 180, 140), (205, 133, 63)],  # Wheat colors
                'texture': 'smooth',
                'shape': 'circular_flat',
                'keywords': ['bread', 'flat', 'round', 'wheat'],
                'confidence_boost': 0.4
            },
            'naan': {
                'colors': [(255, 248, 220), (255, 228, 181), (222, 184, 135)],  # Cream, light wheat
                'texture': 'slightly_textured',
                'shape': 'oval_flat',
                'keywords': ['bread', 'oval', 'light', 'fluffy'],
                'confidence_boost': 0.35
            },
            'paratha': {
                'colors': [(205, 133, 63), (222, 184, 135), (160, 82, 45)],  # Brown shades
                'texture': 'layered',
                'shape': 'circular_flat',
                'keywords': ['bread', 'layered', 'brown', 'crispy'],
                'confidence_boost': 0.3
            },
            
            # Curry dishes - liquid/gravy patterns
            'dal_tadka': {
                'colors': [(255, 215, 0), (255, 165, 0), (218, 165, 32)],  # Yellow/golden
                'texture': 'liquid',
                'shape': 'gravy',
                'keywords': ['dal', 'yellow', 'liquid', 'lentils'],
                'confidence_boost': 0.4
            },
            'butter_chicken': {
                'colors': [(255, 99, 71), (255, 140, 0), (255, 165, 0)],  # Orange/red
                'texture': 'creamy',
                'shape': 'chunky_gravy',
                'keywords': ['chicken', 'orange', 'creamy', 'chunks'],
                'confidence_boost': 0.35
            },
            'palak_paneer': {
                'colors': [(34, 139, 34), (0, 128, 0), (255, 255, 255)],  # Green with white
                'texture': 'thick',
                'shape': 'chunky_gravy',
                'keywords': ['green', 'spinach', 'white', 'chunks'],
                'confidence_boost': 0.4
            },
            
            # Snacks - specific shapes
            'samosa': {
                'colors': [(205, 133, 63), (160, 82, 45), (139, 69, 19)],  # Brown shades
                'texture': 'crispy',
                'shape': 'triangular',
                'keywords': ['triangular', 'fried', 'brown', 'crispy'],
                'confidence_boost': 0.5
            },
            'dosa': {
                'colors': [(255, 228, 181), (222, 184, 135), (205, 133, 63)],  # Light brown
                'texture': 'smooth',
                'shape': 'large_circular',
                'keywords': ['large', 'thin', 'circular', 'crepe'],
                'confidence_boost': 0.45
            },
            'idli': {
                'colors': [(255, 255, 255), (255, 248, 220), (245, 245, 220)],  # White/cream
                'texture': 'soft',
                'shape': 'small_round',
                'keywords': ['white', 'round', 'small', 'soft'],
                'confidence_boost': 0.4
            },
            
            # Sweets - distinctive colors and shapes
            'gulab_jamun': {
                'colors': [(139, 69, 19), (160, 82, 45), (205, 133, 63)],  # Dark brown
                'texture': 'smooth',
                'shape': 'round_balls',
                'keywords': ['round', 'brown', 'balls', 'sweet'],
                'confidence_boost': 0.5
            },
            'jalebi': {
                'colors': [(255, 165, 0), (255, 140, 0), (255, 215, 0)],  # Orange/golden
                'texture': 'spiral',
                'shape': 'spiral',
                'keywords': ['spiral', 'orange', 'coiled', 'sweet'],
                'confidence_boost': 0.6
            },
            
            # More Dal varieties
            'rajma': {
                'colors': [(139, 69, 19), (160, 82, 45), (255, 99, 71)],  # Brown-red
                'texture': 'thick',
                'shape': 'chunky_gravy',
                'keywords': ['kidney', 'beans', 'red', 'thick'],
                'confidence_boost': 0.35
            },
            'chole': {
                'colors': [(255, 215, 0), (255, 165, 0), (205, 133, 63)],  # Yellow-brown
                'texture': 'thick',
                'shape': 'chunky_gravy',
                'keywords': ['chickpeas', 'yellow', 'spicy'],
                'confidence_boost': 0.35
            },
            'moong_dal': {
                'colors': [(255, 255, 0), (255, 215, 0), (255, 228, 181)],  # Bright yellow
                'texture': 'liquid',
                'shape': 'gravy',
                'keywords': ['yellow', 'dal', 'moong', 'liquid'],
                'confidence_boost': 0.3
            },
            'masoor_dal': {
                'colors': [(255, 140, 0), (255, 99, 71), (205, 92, 92)],  # Orange-red
                'texture': 'liquid',
                'shape': 'gravy',
                'keywords': ['orange', 'red', 'dal', 'masoor'],
                'confidence_boost': 0.3
            },
            
            # Paneer dishes
            'paneer_makhani': {
                'colors': [(255, 99, 71), (255, 140, 0), (255, 255, 255)],  # Orange with white chunks
                'texture': 'creamy',
                'shape': 'chunky_gravy',
                'keywords': ['paneer', 'orange', 'creamy', 'white'],
                'confidence_boost': 0.4
            },
            'palak_paneer': {
                'colors': [(34, 139, 34), (0, 128, 0), (255, 255, 255)],  # Green with white
                'texture': 'thick',
                'shape': 'chunky_gravy',
                'keywords': ['green', 'spinach', 'paneer', 'white'],
                'confidence_boost': 0.45
            },
            'kadai_paneer': {
                'colors': [(255, 99, 71), (255, 69, 0), (255, 255, 255)],  # Red-orange with white
                'texture': 'thick',
                'shape': 'chunky_gravy',
                'keywords': ['red', 'paneer', 'kadai', 'spicy'],
                'confidence_boost': 0.35
            },
            
            # South Indian items
            'dosa': {
                'colors': [(255, 228, 181), (222, 184, 135), (205, 133, 63)],  # Light brown
                'texture': 'smooth',
                'shape': 'large_circular',
                'keywords': ['large', 'thin', 'circular', 'crepe'],
                'confidence_boost': 0.45
            },
            'idli': {
                'colors': [(255, 255, 255), (255, 248, 220), (245, 245, 220)],  # White/cream
                'texture': 'soft',
                'shape': 'small_round',
                'keywords': ['white', 'round', 'small', 'soft'],
                'confidence_boost': 0.4
            },
            'uttapam': {
                'colors': [(255, 228, 181), (255, 99, 71), (34, 139, 34)],  # Light brown with toppings
                'texture': 'slightly_textured',
                'shape': 'circular_flat',
                'keywords': ['thick', 'pancake', 'vegetables', 'round'],
                'confidence_boost': 0.35
            },
            'vada': {
                'colors': [(139, 69, 19), (160, 82, 45), (205, 133, 63)],  # Dark brown
                'texture': 'crispy',
                'shape': 'round_balls',
                'keywords': ['round', 'fried', 'brown', 'crispy'],
                'confidence_boost': 0.4
            },
            'sambhar': {
                'colors': [(255, 140, 0), (255, 99, 71), (255, 215, 0)],  # Orange-yellow
                'texture': 'liquid',
                'shape': 'gravy',
                'keywords': ['sambhar', 'orange', 'liquid', 'vegetables'],
                'confidence_boost': 0.3
            },
            
            # Street foods
            'pani_puri': {
                'colors': [(222, 184, 135), (255, 215, 0), (0, 128, 0)],  # Brown shells with green water
                'texture': 'crispy',
                'shape': 'small_round',
                'keywords': ['small', 'round', 'crispy', 'puri'],
                'confidence_boost': 0.5
            },
            'bhel_puri': {
                'colors': [(222, 184, 135), (255, 99, 71), (34, 139, 34)],  # Mixed colors
                'texture': 'mixed',
                'shape': 'scattered_pieces',
                'keywords': ['mixed', 'puffed', 'rice', 'chutney'],
                'confidence_boost': 0.3
            },
            'pakora': {
                'colors': [(205, 133, 63), (160, 82, 45), (139, 69, 19)],  # Golden brown
                'texture': 'crispy',
                'shape': 'irregular_pieces',
                'keywords': ['fried', 'crispy', 'vegetables', 'batter'],
                'confidence_boost': 0.4
            },
            'aloo_tikki': {
                'colors': [(205, 133, 63), (222, 184, 135), (255, 215, 0)],  # Golden
                'texture': 'crispy',
                'shape': 'circular_flat',
                'keywords': ['potato', 'fried', 'round', 'crispy'],
                'confidence_boost': 0.4
            },
            
            # More sweets
            'rasgulla': {
                'colors': [(255, 255, 255), (255, 248, 220), (245, 245, 220)],  # White
                'texture': 'soft',
                'shape': 'round_balls',
                'keywords': ['white', 'round', 'spongy', 'sweet'],
                'confidence_boost': 0.5
            },
            'laddu': {
                'colors': [(255, 215, 0), (255, 165, 0), (255, 140, 0)],  # Golden yellow
                'texture': 'grainy',
                'shape': 'round_balls',
                'keywords': ['round', 'yellow', 'sweet', 'balls'],
                'confidence_boost': 0.45
            },
            'barfi': {
                'colors': [(255, 255, 255), (255, 192, 203), (255, 215, 0)],  # White/pink/golden
                'texture': 'smooth',
                'shape': 'square_pieces',
                'keywords': ['square', 'sweet', 'milk', 'pieces'],
                'confidence_boost': 0.4
            },
            'kheer': {
                'colors': [(255, 255, 255), (255, 248, 220), (255, 215, 0)],  # Creamy white
                'texture': 'liquid',
                'shape': 'gravy',
                'keywords': ['white', 'creamy', 'rice', 'milk'],
                'confidence_boost': 0.35
            },
            
            # Vegetable dishes
            'aloo_gobi': {
                'colors': [(255, 215, 0), (255, 255, 255), (255, 165, 0)],  # Yellow-white
                'texture': 'chunky',
                'shape': 'mixed_pieces',
                'keywords': ['potato', 'cauliflower', 'yellow', 'vegetables'],
                'confidence_boost': 0.3
            },
            'bhindi_masala': {
                'colors': [(34, 139, 34), (255, 99, 71), (255, 140, 0)],  # Green with spices
                'texture': 'mixed',
                'shape': 'elongated_pieces',
                'keywords': ['green', 'okra', 'vegetables', 'spicy'],
                'confidence_boost': 0.35
            },
            'baingan_bharta': {
                'colors': [(128, 0, 128), (75, 0, 130), (255, 99, 71)],  # Purple-red
                'texture': 'mashed',
                'shape': 'chunky_mash',
                'keywords': ['purple', 'eggplant', 'mashed', 'roasted'],
                'confidence_boost': 0.4
            },
            
            # Chicken dishes
            'chicken_curry': {
                'colors': [(255, 99, 71), (255, 140, 0), (139, 69, 19)],  # Red-orange-brown
                'texture': 'gravy',
                'shape': 'chunky_gravy',
                'keywords': ['chicken', 'curry', 'red', 'spicy'],
                'confidence_boost': 0.3
            },
            'tandoori_chicken': {
                'colors': [(255, 69, 0), (255, 99, 71), (139, 69, 19)],  # Red-orange
                'texture': 'charred',
                'shape': 'irregular_pieces',
                'keywords': ['chicken', 'red', 'tandoori', 'grilled'],
                'confidence_boost': 0.4
            },
            'chicken_biryani': {
                'colors': [(255, 215, 0), (255, 165, 0), (139, 69, 19), (255, 99, 71)],  # Golden with meat
                'texture': 'grainy',
                'shape': 'scattered_grains',
                'keywords': ['biryani', 'chicken', 'rice', 'mixed'],
                'confidence_boost': 0.35
            },
            
            # More bread varieties
            'chapati': {
                'colors': [(222, 184, 135), (210, 180, 140), (205, 133, 63)],  # Wheat colors
                'texture': 'smooth',
                'shape': 'circular_flat',
                'keywords': ['bread', 'flat', 'round', 'thin'],
                'confidence_boost': 0.35
            },
            'kulcha': {
                'colors': [(255, 248, 220), (255, 228, 181), (222, 184, 135)],  # Light colors
                'texture': 'soft',
                'shape': 'oval_flat',
                'keywords': ['bread', 'soft', 'white', 'thick'],
                'confidence_boost': 0.3
            },
            'puri': {
                'colors': [(222, 184, 135), (205, 133, 63), (160, 82, 45)],  # Golden brown
                'texture': 'crispy',
                'shape': 'small_round',
                'keywords': ['small', 'round', 'puffed', 'crispy'],
                'confidence_boost': 0.4
            },
            
            # Beverages
            'lassi': {
                'colors': [(255, 255, 255), (255, 248, 220), (255, 192, 203)],  # White/pink
                'texture': 'liquid',
                'shape': 'liquid',
                'keywords': ['white', 'drink', 'yogurt', 'thick'],
                'confidence_boost': 0.4
            },
            'chai': {
                'colors': [(160, 82, 45), (139, 69, 19), (222, 184, 135)],  # Brown shades
                'texture': 'liquid',
                'shape': 'liquid',
                'keywords': ['tea', 'brown', 'milk', 'drink'],
                'confidence_boost': 0.5
            },
            
            # Regional specialties
            'dhokla': {
                'colors': [(255, 255, 0), (255, 215, 0), (173, 255, 47)],  # Yellow-green
                'texture': 'spongy',
                'shape': 'square_pieces',
                'keywords': ['yellow', 'spongy', 'steamed', 'gujarati'],
                'confidence_boost': 0.45
            },
            'poha': {
                'colors': [(255, 255, 224), (255, 215, 0), (34, 139, 34)],  # Light yellow with green
                'texture': 'flaky',
                'shape': 'scattered_flakes',
                'keywords': ['flattened', 'rice', 'yellow', 'light'],
                'confidence_boost': 0.35
            },
            'upma': {
                'colors': [(255, 228, 181), (255, 215, 0), (34, 139, 34)],  # Light yellow
                'texture': 'grainy',
                'shape': 'granular',
                'keywords': ['semolina', 'yellow', 'grainy', 'south'],
                'confidence_boost': 0.3
            },
            'pongal': {
                'colors': [(255, 255, 224), (255, 215, 0), (0, 0, 0)],  # Light with black pepper
                'texture': 'mushy',
                'shape': 'mushy_grains',
                'keywords': ['rice', 'dal', 'mushy', 'south'],
                'confidence_boost': 0.3
            },
            
            # More snacks
            'kachori': {
                'colors': [(205, 133, 63), (160, 82, 45), (139, 69, 19)],  # Brown
                'texture': 'crispy',
                'shape': 'round_puffed',
                'keywords': ['round', 'fried', 'stuffed', 'crispy'],
                'confidence_boost': 0.4
            },
            'bhatura': {
                'colors': [(255, 248, 220), (255, 228, 181), (222, 184, 135)],  # Light brown
                'texture': 'puffy',
                'shape': 'large_round',
                'keywords': ['large', 'puffed', 'bread', 'fried'],
                'confidence_boost': 0.4
            },
            'chole_bhature': {
                'colors': [(255, 215, 0), (255, 248, 220), (255, 165, 0)],  # Yellow curry with white bread
                'texture': 'mixed',
                'shape': 'combo_dish',
                'keywords': ['chole', 'bhature', 'combo', 'punjabi'],
                'confidence_boost': 0.35
            },
            
            # More sweets
            'halwa': {
                'colors': [(255, 140, 0), (255, 165, 0), (255, 215, 0)],  # Orange-golden
                'texture': 'dense',
                'shape': 'dense_mass',
                'keywords': ['sweet', 'dense', 'orange', 'semolina'],
                'confidence_boost': 0.35
            },
            'mysore_pak': {
                'colors': [(255, 215, 0), (255, 165, 0), (255, 140, 0)],  # Golden yellow
                'texture': 'crumbly',
                'shape': 'square_pieces',
                'keywords': ['yellow', 'square', 'sweet', 'ghee'],
                'confidence_boost': 0.4
            },
            'sandesh': {
                'colors': [(255, 255, 255), (255, 248, 220), (255, 192, 203)],  # White/pink
                'texture': 'soft',
                'shape': 'oval_pieces',
                'keywords': ['white', 'soft', 'bengali', 'milk'],
                'confidence_boost': 0.4
            },
            
            # Vegetable curries
            'dal_makhani': {
                'colors': [(139, 69, 19), (160, 82, 45), (255, 140, 0)],  # Dark brown-orange
                'texture': 'thick',
                'shape': 'thick_gravy',
                'keywords': ['black', 'dal', 'creamy', 'thick'],
                'confidence_boost': 0.4
            },
            'malai_kofta': {
                'colors': [(255, 140, 0), (255, 99, 71), (255, 255, 255)],  # Orange with white balls
                'texture': 'creamy',
                'shape': 'balls_in_gravy',
                'keywords': ['balls', 'gravy', 'creamy', 'white'],
                'confidence_boost': 0.4
            },
            'matar_paneer': {
                'colors': [(34, 139, 34), (255, 99, 71), (255, 255, 255)],  # Green peas, red gravy, white paneer
                'texture': 'chunky',
                'shape': 'chunky_gravy',
                'keywords': ['green', 'peas', 'paneer', 'white'],
                'confidence_boost': 0.35
            },
            
            # Fish and seafood
            'fish_curry': {
                'colors': [(255, 99, 71), (255, 140, 0), (255, 69, 0)],  # Red-orange
                'texture': 'gravy',
                'shape': 'chunky_gravy',
                'keywords': ['fish', 'curry', 'red', 'spicy'],
                'confidence_boost': 0.3
            },
            'prawn_curry': {
                'colors': [(255, 99, 71), (255, 140, 0), (255, 192, 203)],  # Red-orange-pink
                'texture': 'gravy',
                'shape': 'chunky_gravy',
                'keywords': ['prawn', 'shrimp', 'red', 'curry'],
                'confidence_boost': 0.35
            },
            
            # Mutton/Lamb dishes
            'mutton_curry': {
                'colors': [(139, 69, 19), (160, 82, 45), (255, 99, 71)],  # Brown-red
                'texture': 'thick',
                'shape': 'chunky_gravy',
                'keywords': ['mutton', 'lamb', 'brown', 'meat'],
                'confidence_boost': 0.3
            },
            'keema': {
                'colors': [(139, 69, 19), (160, 82, 45), (255, 99, 71)],  # Brown-red
                'texture': 'minced',
                'shape': 'granular',
                'keywords': ['minced', 'meat', 'brown', 'ground'],
                'confidence_boost': 0.35
            },
            
            # More rice varieties
            'jeera_rice': {
                'colors': [(255, 255, 224), (255, 215, 0), (0, 0, 0)],  # Light yellow with black cumin
                'texture': 'grainy',
                'shape': 'uniform_grains',
                'keywords': ['rice', 'cumin', 'light', 'aromatic'],
                'confidence_boost': 0.3
            },
            'lemon_rice': {
                'colors': [(255, 255, 0), (255, 215, 0), (255, 165, 0)],  # Bright yellow
                'texture': 'grainy',
                'shape': 'colored_grains',
                'keywords': ['yellow', 'rice', 'lemon', 'turmeric'],
                'confidence_boost': 0.4
            },
            'coconut_rice': {
                'colors': [(255, 255, 255), (255, 248, 220), (34, 139, 34)],  # White with green
                'texture': 'grainy',
                'shape': 'white_grains',
                'keywords': ['white', 'rice', 'coconut', 'south'],
                'confidence_boost': 0.35
            }
        }
        
        # Color analysis thresholds
        self.color_tolerance = 50
        self.texture_patterns = {
            'grainy': self._detect_grainy_texture,
            'smooth': self._detect_smooth_texture,
            'liquid': self._detect_liquid_texture,
            'crispy': self._detect_crispy_texture,
            'spiral': self._detect_spiral_texture,
            'creamy': self._detect_creamy_texture,
            'thick': self._detect_thick_texture,
            'soft': self._detect_soft_texture,
            'chunky': self._detect_chunky_texture,
            'mixed': self._detect_mixed_texture,
            'flaky': self._detect_flaky_texture,
            'spongy': self._detect_spongy_texture,
            'dense': self._detect_dense_texture,
            'crumbly': self._detect_crumbly_texture,
            'mashed': self._detect_mashed_texture,
            'minced': self._detect_minced_texture,
            'charred': self._detect_charred_texture,
            'puffy': self._detect_puffy_texture,
            'mushy': self._detect_mushy_texture,
            'layered': self._detect_layered_texture,
            'slightly_textured': self._detect_slightly_textured_texture
        }

    def analyze_image_advanced(self, image_data, filename=""):
        """Advanced multi-layer food detection"""
        try:
            # Load and preprocess image
            image = Image.open(io.BytesIO(image_data))
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize for consistent analysis
            image = image.resize((512, 512), Image.Resampling.LANCZOS)
            
            # Convert to numpy array for OpenCV operations
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # Multiple detection layers
            color_scores = self._analyze_colors(image)
            shape_scores = self._analyze_shapes(cv_image)
            texture_scores = self._analyze_textures(cv_image)
            filename_scores = self._analyze_filename(filename)
            
            # Combine all scores
            final_scores = self._combine_scores(color_scores, shape_scores, texture_scores, filename_scores)
            
            # Get best match with confidence
            best_food, confidence = self._get_best_match(final_scores)
            
            return best_food, confidence
            
        except Exception as e:
            print(f"Advanced detection error: {e}")
            # Fallback to basic detection
            return self._fallback_detection(), 0.3

    def _analyze_colors(self, image):
        """Analyze dominant colors and match with food patterns"""
        scores = {}
        
        # Get dominant colors
        dominant_colors = self._get_dominant_colors(image, k=5)
        
        for food_name, pattern in self.food_visual_patterns.items():
            color_score = 0
            pattern_colors = pattern.get('colors', [])
            
            for dom_color in dominant_colors:
                for pattern_color in pattern_colors:
                    similarity = self._color_similarity(dom_color, pattern_color)
                    if similarity > 0.7:  # 70% similarity threshold
                        color_score += similarity * 0.3
            
            scores[food_name] = min(color_score, 1.0)
        
        return scores

    def _analyze_shapes(self, cv_image):
        """Analyze shapes and geometric patterns"""
        scores = {}
        
        # Convert to grayscale for shape analysis
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
        
        # Edge detection
        edges = cv2.Canny(gray, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Analyze shapes
        shape_features = self._extract_shape_features(contours, gray.shape)
        
        for food_name, pattern in self.food_visual_patterns.items():
            shape_type = pattern.get('shape', '')
            shape_score = self._match_shape_pattern(shape_features, shape_type)
            scores[food_name] = shape_score
        
        return scores

    def _analyze_textures(self, cv_image):
        """Analyze texture patterns"""
        scores = {}
        
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
        
        for food_name, pattern in self.food_visual_patterns.items():
            texture_type = pattern.get('texture', '')
            if texture_type in self.texture_patterns:
                texture_score = self.texture_patterns[texture_type](gray)
                scores[food_name] = texture_score
            else:
                scores[food_name] = 0.0
        
        return scores

    def _analyze_filename(self, filename):
        """Analyze filename for food hints"""
        scores = {}
        filename_lower = filename.lower()
        
        for food_name, pattern in self.food_visual_patterns.items():
            filename_score = 0
            keywords = pattern.get('keywords', [])
            
            # Direct name match
            if food_name.replace('_', ' ') in filename_lower:
                filename_score = 1.0
            elif food_name in filename_lower:
                filename_score = 0.9
            else:
                # Keyword matching
                for keyword in keywords:
                    if keyword in filename_lower:
                        filename_score += 0.2
            
            scores[food_name] = min(filename_score, 1.0)
        
        return scores

    def _get_dominant_colors(self, image, k=5):
        """Extract dominant colors using k-means clustering"""
        # Convert image to array
        data = np.array(image)
        data = data.reshape((-1, 3))
        data = np.float32(data)
        
        # Apply k-means
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
        _, labels, centers = cv2.kmeans(data, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        
        # Convert back to uint8
        centers = np.uint8(centers)
        
        return [tuple(color) for color in centers]

    def _color_similarity(self, color1, color2):
        """Calculate color similarity using Euclidean distance"""
        r1, g1, b1 = color1
        r2, g2, b2 = color2
        
        distance = math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2)
        max_distance = math.sqrt(3 * 255**2)
        
        return 1 - (distance / max_distance)

    def _extract_shape_features(self, contours, image_shape):
        """Extract geometric features from contours"""
        features = {
            'circularity': 0,
            'rectangularity': 0,
            'triangularity': 0,
            'aspect_ratio': 0,
            'area_ratio': 0,
            'num_objects': len(contours)
        }
        
        if not contours:
            return features
        
        # Analyze largest contour
        largest_contour = max(contours, key=cv2.contourArea)
        
        # Calculate features
        area = cv2.contourArea(largest_contour)
        perimeter = cv2.arcLength(largest_contour, True)
        
        if perimeter > 0:
            features['circularity'] = 4 * math.pi * area / (perimeter * perimeter)
        
        # Bounding rectangle
        x, y, w, h = cv2.boundingRect(largest_contour)
        features['aspect_ratio'] = w / h if h > 0 else 0
        features['area_ratio'] = area / (image_shape[0] * image_shape[1])
        
        # Approximate polygon
        epsilon = 0.02 * perimeter
        approx = cv2.approxPolyDP(largest_contour, epsilon, True)
        
        # Shape classification based on vertices
        vertices = len(approx)
        if vertices == 3:
            features['triangularity'] = 1.0
        elif vertices == 4:
            features['rectangularity'] = 1.0
        elif vertices > 8:
            features['circularity'] = max(features['circularity'], 0.7)
        
        return features

    def _match_shape_pattern(self, features, shape_type):
        """Match extracted features with expected shape patterns"""
        score = 0.0
        
        if shape_type == 'triangular':
            score = features['triangularity'] * 0.8 + (1 - abs(features['aspect_ratio'] - 1)) * 0.2
        elif shape_type == 'circular_flat' or shape_type == 'small_round':
            score = features['circularity'] * 0.7 + (1 - abs(features['aspect_ratio'] - 1)) * 0.3
        elif shape_type == 'oval_flat':
            score = features['circularity'] * 0.5 + (abs(features['aspect_ratio'] - 1.5) < 0.5) * 0.5
        elif shape_type == 'large_circular':
            score = features['circularity'] * 0.6 + (features['area_ratio'] > 0.3) * 0.4
        elif shape_type == 'round_balls':
            score = features['circularity'] * 0.8 + (features['num_objects'] > 1) * 0.2
        elif shape_type == 'spiral':
            score = 0.4 if features['circularity'] > 0.3 else 0.1
        elif shape_type == 'scattered_grains' or shape_type == 'uniform_grains':
            score = (features['num_objects'] > 5) * 0.6 + (features['area_ratio'] < 0.8) * 0.4
        elif shape_type == 'chunky_gravy' or shape_type == 'thick_gravy':
            score = (features['num_objects'] > 2) * 0.5 + (features['area_ratio'] > 0.4) * 0.5
        elif shape_type == 'gravy' or shape_type == 'liquid':
            score = (features['area_ratio'] > 0.6) * 0.7 + (features['circularity'] < 0.5) * 0.3
        elif shape_type == 'scattered_pieces' or shape_type == 'mixed_pieces':
            score = (features['num_objects'] > 3) * 0.6 + (features['area_ratio'] < 0.9) * 0.4
        elif shape_type == 'irregular_pieces':
            score = (features['num_objects'] > 2) * 0.5 + (features['circularity'] < 0.6) * 0.5
        elif shape_type == 'square_pieces':
            score = features['rectangularity'] * 0.8 + (abs(features['aspect_ratio'] - 1) < 0.3) * 0.2
        elif shape_type == 'oval_pieces':
            score = features['circularity'] * 0.4 + (abs(features['aspect_ratio'] - 1.5) < 0.5) * 0.6
        elif shape_type == 'elongated_pieces':
            score = (features['aspect_ratio'] > 2.0 or features['aspect_ratio'] < 0.5) * 0.8 + 0.2
        elif shape_type == 'round_puffed' or shape_type == 'large_round':
            score = features['circularity'] * 0.8 + (features['area_ratio'] > 0.2) * 0.2
        elif shape_type == 'combo_dish':
            score = (features['num_objects'] > 1) * 0.6 + (features['area_ratio'] > 0.5) * 0.4
        elif shape_type == 'dense_mass':
            score = (features['area_ratio'] > 0.4) * 0.7 + (features['circularity'] < 0.7) * 0.3
        elif shape_type == 'balls_in_gravy':
            score = (features['num_objects'] > 1) * 0.5 + features['circularity'] * 0.5
        elif shape_type == 'granular':
            score = (features['num_objects'] > 10) * 0.7 + (features['area_ratio'] < 0.6) * 0.3
        elif shape_type == 'chunky_mash':
            score = (features['num_objects'] > 2) * 0.4 + (features['circularity'] < 0.6) * 0.6
        elif shape_type == 'colored_grains' or shape_type == 'white_grains':
            score = (features['num_objects'] > 8) * 0.6 + (features['area_ratio'] < 0.9) * 0.4
        elif shape_type == 'scattered_flakes':
            score = (features['num_objects'] > 15) * 0.7 + (features['area_ratio'] < 0.7) * 0.3
        elif shape_type == 'mushy_grains':
            score = (features['area_ratio'] > 0.5) * 0.6 + (features['circularity'] < 0.5) * 0.4
        else:
            score = 0.3  # Default moderate score
        
        return min(score, 1.0)

    # Texture detection methods
    def _detect_grainy_texture(self, gray_image):
        """Detect grainy texture (rice, etc.)"""
        # Use Laplacian variance to detect texture
        laplacian_var = cv2.Laplacian(gray_image, cv2.CV_64F).var()
        
        # Normalize score
        if laplacian_var > 500:
            return min(laplacian_var / 2000, 1.0)
        return laplacian_var / 500

    def _detect_smooth_texture(self, gray_image):
        """Detect smooth texture (bread, etc.)"""
        # Inverse of grainy - smooth surfaces have low variance
        laplacian_var = cv2.Laplacian(gray_image, cv2.CV_64F).var()
        
        if laplacian_var < 200:
            return 1.0 - (laplacian_var / 200)
        return 0.0

    def _detect_liquid_texture(self, gray_image):
        """Detect liquid/gravy texture"""
        # Look for smooth regions with some variation
        blur = cv2.GaussianBlur(gray_image, (15, 15), 0)
        diff = cv2.absdiff(gray_image, blur)
        
        mean_diff = np.mean(diff)
        if 10 < mean_diff < 50:
            return min(mean_diff / 50, 1.0)
        return 0.0

    def _detect_crispy_texture(self, gray_image):
        """Detect crispy texture (fried items)"""
        # High frequency components indicate crispiness
        edges = cv2.Canny(gray_image, 100, 200)
        edge_density = np.sum(edges > 0) / edges.size
        
        return min(edge_density * 5, 1.0)

    def _detect_spiral_texture(self, gray_image):
        """Detect spiral patterns (jalebi)"""
        # Use Hough circles to detect circular/spiral patterns
        circles = cv2.HoughCircles(gray_image, cv2.HOUGH_GRADIENT, 1, 20,
                                 param1=50, param2=30, minRadius=10, maxRadius=100)
        
        if circles is not None:
            return min(len(circles[0]) / 5, 1.0)
        return 0.0

    def _detect_creamy_texture(self, gray_image):
        """Detect creamy, smooth texture with slight variations"""
        # Gaussian blur to smooth out noise
        blurred = cv2.GaussianBlur(gray_image, (9, 9), 0)
        # Calculate standard deviation - creamy textures have moderate variance
        std_dev = np.std(blurred)
        if 15 < std_dev < 40:
            return min(std_dev / 40, 1.0)
        return 0.0

    def _detect_thick_texture(self, gray_image):
        """Detect thick, dense texture patterns"""
        # Use morphological operations to detect thick patterns
        kernel = np.ones((5,5), np.uint8)
        closing = cv2.morphologyEx(gray_image, cv2.MORPH_CLOSE, kernel)
        diff = cv2.absdiff(gray_image, closing)
        thickness_score = 1.0 - (np.mean(diff) / 255)
        return max(thickness_score, 0.0)

    def _detect_soft_texture(self, gray_image):
        """Detect soft, gentle texture"""
        # Soft textures have low edge density and smooth gradients
        edges = cv2.Canny(gray_image, 30, 80)
        edge_density = np.sum(edges > 0) / edges.size
        softness = 1.0 - min(edge_density * 10, 1.0)
        return max(softness, 0.0)

    def _detect_chunky_texture(self, gray_image):
        """Detect chunky texture with distinct pieces"""
        # Find contours to detect chunks
        edges = cv2.Canny(gray_image, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Count significant chunks
        significant_chunks = sum(1 for c in contours if cv2.contourArea(c) > 100)
        return min(significant_chunks / 10, 1.0)

    def _detect_mixed_texture(self, gray_image):
        """Detect mixed texture with various elements"""
        # High variance indicates mixed textures
        variance = np.var(gray_image)
        if variance > 1000:
            return min(variance / 3000, 1.0)
        return variance / 1000

    def _detect_flaky_texture(self, gray_image):
        """Detect flaky texture (poha, etc.)"""
        # Use edge detection with specific parameters for flakes
        edges = cv2.Canny(gray_image, 20, 60)
        edge_density = np.sum(edges > 0) / edges.size
        
        # Flaky textures have moderate edge density
        if 0.05 < edge_density < 0.15:
            return min(edge_density * 10, 1.0)
        return 0.0

    def _detect_spongy_texture(self, gray_image):
        """Detect spongy texture (dhokla, idli)"""
        # Spongy textures have uniform but slightly varied appearance
        blur = cv2.GaussianBlur(gray_image, (7, 7), 0)
        uniformity = 1.0 - (np.std(blur) / 128)
        return max(uniformity * 0.8, 0.0)

    def _detect_dense_texture(self, gray_image):
        """Detect dense, compact texture"""
        # Dense textures have high pixel intensity consistency
        mean_intensity = np.mean(gray_image)
        std_intensity = np.std(gray_image)
        density_score = mean_intensity / 255 * (1 - std_intensity / 128)
        return max(density_score, 0.0)

    def _detect_crumbly_texture(self, gray_image):
        """Detect crumbly texture (mysore pak, etc.)"""
        # Crumbly textures have irregular small patterns
        kernel = np.ones((3,3), np.uint8)
        gradient = cv2.morphologyEx(gray_image, cv2.MORPH_GRADIENT, kernel)
        crumble_score = np.mean(gradient) / 255
        return min(crumble_score * 2, 1.0)

    def _detect_mashed_texture(self, gray_image):
        """Detect mashed texture (bharta, etc.)"""
        # Mashed textures have irregular but smooth patterns
        blur = cv2.medianBlur(gray_image, 5)
        diff = cv2.absdiff(gray_image, blur)
        mash_score = np.mean(diff) / 255
        return min(mash_score * 3, 1.0)

    def _detect_minced_texture(self, gray_image):
        """Detect minced texture (keema)"""
        # Minced textures have small granular patterns
        kernel = np.ones((2,2), np.uint8)
        eroded = cv2.erode(gray_image, kernel, iterations=1)
        dilated = cv2.dilate(eroded, kernel, iterations=1)
        granular_score = np.mean(cv2.absdiff(gray_image, dilated)) / 255
        return min(granular_score * 4, 1.0)

    def _detect_charred_texture(self, gray_image):
        """Detect charred, grilled texture"""
        # Charred textures have dark spots and high contrast
        dark_pixels = np.sum(gray_image < 80) / gray_image.size
        contrast = np.std(gray_image) / 128
        char_score = dark_pixels * contrast
        return min(char_score * 2, 1.0)

    def _detect_puffy_texture(self, gray_image):
        """Detect puffy, inflated texture"""
        # Puffy textures have rounded, inflated appearance
        circles = cv2.HoughCircles(gray_image, cv2.HOUGH_GRADIENT, 1, 30,
                                 param1=40, param2=25, minRadius=20, maxRadius=200)
        if circles is not None:
            return min(len(circles[0]) / 3, 1.0)
        return 0.0

    def _detect_mushy_texture(self, gray_image):
        """Detect mushy, soft texture"""
        # Mushy textures are very smooth with minimal edges
        edges = cv2.Canny(gray_image, 10, 30)
        edge_density = np.sum(edges > 0) / edges.size
        mushiness = 1.0 - min(edge_density * 20, 1.0)
        return max(mushiness, 0.0)

    def _detect_layered_texture(self, gray_image):
        """Detect layered texture (paratha)"""
        # Detect horizontal or vertical layers
        sobelx = cv2.Sobel(gray_image, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray_image, cv2.CV_64F, 0, 1, ksize=3)
        
        # Look for directional patterns
        horizontal_lines = np.mean(np.abs(sobely))
        vertical_lines = np.mean(np.abs(sobelx))
        layer_score = max(horizontal_lines, vertical_lines) / 255
        return min(layer_score * 2, 1.0)

    def _detect_slightly_textured_texture(self, gray_image):
        """Detect slightly textured surface"""
        # Moderate texture - between smooth and rough
        laplacian_var = cv2.Laplacian(gray_image, cv2.CV_64F).var()
        if 100 < laplacian_var < 400:
            return min(laplacian_var / 400, 1.0)
        return 0.0

    def _combine_scores(self, color_scores, shape_scores, texture_scores, filename_scores):
        """Combine all detection scores with weights"""
        final_scores = {}
        
        # Weights for different detection methods
        weights = {
            'color': 0.25,
            'shape': 0.30,
            'texture': 0.25,
            'filename': 0.20
        }
        
        all_foods = set(color_scores.keys()) | set(shape_scores.keys()) | \
                   set(texture_scores.keys()) | set(filename_scores.keys())
        
        for food in all_foods:
            combined_score = (
                color_scores.get(food, 0) * weights['color'] +
                shape_scores.get(food, 0) * weights['shape'] +
                texture_scores.get(food, 0) * weights['texture'] +
                filename_scores.get(food, 0) * weights['filename']
            )
            
            # Apply confidence boost if available
            if food in self.food_visual_patterns:
                boost = self.food_visual_patterns[food].get('confidence_boost', 0)
                combined_score += boost * combined_score
            
            final_scores[food] = min(combined_score, 1.0)
        
        return final_scores

    def _get_best_match(self, scores):
        """Get the best matching food with confidence score"""
        if not scores:
            return self._fallback_detection(), 0.2
        
        # Sort by score
        sorted_foods = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        best_food, best_score = sorted_foods[0]
        
        # If score is too low, fall back to popular foods
        if best_score < 0.3:
            return self._fallback_detection(), best_score
        
        return best_food, best_score

    def _fallback_detection(self):
        """Fallback to popular Indian foods when detection fails"""
        popular_foods = ['biryani', 'dal_tadka', 'butter_chicken', 'roti', 'samosa', 'dosa']
        import random
        return random.choice(popular_foods)

# Global detector instance
food_detector = AdvancedFoodDetector()

def detect_food_advanced(image_data, filename=""):
    """Main function to detect food using advanced algorithms"""
    return food_detector.analyze_image_advanced(image_data, filename)
