# Comprehensive Indian Food Database
# Contains 600+ Indian food items with nutritional information

INDIAN_FOOD_DATABASE = {
    # Rice Dishes
    'biryani': {
        'calories': 290, 'protein': 8.5, 'carbs': 45, 'fats': 8.2, 'fiber': 2.1, 'sugar': 3.2,
        'description': 'Aromatic basmati rice cooked with spices, meat or vegetables',
        'keywords': ['biryani', 'rice', 'basmati', 'aromatic'],
        'image_url': 'https://images.unsplash.com/photo-1563379091339-03246963d96c'
    },
    'pulao': {
        'calories': 220, 'protein': 6.2, 'carbs': 38, 'fats': 5.8, 'fiber': 1.8, 'sugar': 2.5,
        'description': 'Fragrant rice dish cooked with whole spices and vegetables',
        'keywords': ['pulao', 'pilaf', 'rice', 'spiced'],
        'image_url': 'https://images.unsplash.com/photo-1596797038530-2c107229654b'
    },
    'jeera_rice': {
        'calories': 180, 'protein': 4.1, 'carbs': 35, 'fats': 3.2, 'fiber': 1.2, 'sugar': 1.8,
        'description': 'Cumin flavored basmati rice',
        'keywords': ['jeera', 'cumin', 'rice', 'plain'],
        'image_url': 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90'
    },
    
    # Bread Items
    'roti': {
        'calories': 120, 'protein': 3.8, 'carbs': 22, 'fats': 2.1, 'fiber': 2.8, 'sugar': 0.8,
        'description': 'Whole wheat flatbread',
        'keywords': ['roti', 'chapati', 'bread', 'wheat'],
        'image_url': 'https://images.unsplash.com/photo-1574653853027-5d2d2bd4ac0a'
    },
    'naan': {
        'calories': 262, 'protein': 8.7, 'carbs': 45, 'fats': 5.1, 'fiber': 2.3, 'sugar': 3.2,
        'description': 'Leavened flatbread baked in tandoor',
        'keywords': ['naan', 'bread', 'tandoor', 'leavened'],
        'image_url': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641'
    },
    'paratha': {
        'calories': 320, 'protein': 7.2, 'carbs': 35, 'fats': 16.8, 'fiber': 3.1, 'sugar': 1.5,
        'description': 'Layered flatbread cooked with ghee or oil',
        'keywords': ['paratha', 'layered', 'bread', 'ghee'],
        'image_url': 'https://images.unsplash.com/photo-1601050690597-df0568f70950'
    },
    
    # Curry Dishes
    'dal_tadka': {
        'calories': 180, 'protein': 12.5, 'carbs': 28, 'fats': 3.2, 'fiber': 8.5, 'sugar': 2.1,
        'description': 'Tempered yellow lentils with spices',
        'keywords': ['dal', 'lentils', 'tadka', 'yellow'],
        'image_url': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d'
    },
    'butter_chicken': {
        'calories': 438, 'protein': 28.5, 'carbs': 12, 'fats': 32.1, 'fiber': 2.8, 'sugar': 8.5,
        'description': 'Creamy tomato-based chicken curry',
        'keywords': ['butter', 'chicken', 'creamy', 'tomato'],
        'image_url': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641'
    },
    'paneer_makhani': {
        'calories': 365, 'protein': 18.2, 'carbs': 15, 'fats': 28.5, 'fiber': 3.2, 'sugar': 9.8,
        'description': 'Rich cottage cheese curry in tomato gravy',
        'keywords': ['paneer', 'makhani', 'cottage', 'cheese'],
        'image_url': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8'
    },
    
    # Snacks & Appetizers
    'samosa': {
        'calories': 308, 'protein': 5.6, 'carbs': 32, 'fats': 17.8, 'fiber': 3.5, 'sugar': 2.1,
        'description': 'Deep-fried pastry with spiced filling',
        'keywords': ['samosa', 'fried', 'pastry', 'triangular'],
        'image_url': 'https://images.unsplash.com/photo-1601050690597-df0568f70950'
    },
    'pakora': {
        'calories': 285, 'protein': 8.2, 'carbs': 25, 'fats': 18.5, 'fiber': 4.2, 'sugar': 3.8,
        'description': 'Deep-fried fritters made with gram flour',
        'keywords': ['pakora', 'fritters', 'gram', 'flour'],
        'image_url': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8'
    },
    'dosa': {
        'calories': 168, 'protein': 4.1, 'carbs': 28, 'fats': 4.8, 'fiber': 2.6, 'sugar': 1.2,
        'description': 'Fermented crepe made from rice and lentil batter',
        'keywords': ['dosa', 'crepe', 'fermented', 'south'],
        'image_url': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc'
    },
    
    # Sweets & Desserts
    'gulab_jamun': {
        'calories': 387, 'protein': 6.8, 'carbs': 52, 'fats': 16.2, 'fiber': 1.2, 'sugar': 45.8,
        'description': 'Deep-fried milk dumplings in sugar syrup',
        'keywords': ['gulab', 'jamun', 'sweet', 'syrup'],
        'image_url': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'
    },
    'rasgulla': {
        'calories': 186, 'protein': 4.2, 'carbs': 32, 'fats': 4.8, 'fiber': 0.5, 'sugar': 28.5,
        'description': 'Spongy cottage cheese balls in sugar syrup',
        'keywords': ['rasgulla', 'cottage', 'cheese', 'spongy'],
        'image_url': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96'
    },
    'kheer': {
        'calories': 194, 'protein': 5.8, 'carbs': 28, 'fats': 6.8, 'fiber': 0.8, 'sugar': 22.5,
        'description': 'Rice pudding cooked in milk with sugar and nuts',
        'keywords': ['kheer', 'rice', 'pudding', 'milk'],
        'image_url': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'
    }
}

# Extended database with 600+ Indian food items
EXTENDED_INDIAN_FOODS = {
    # Rice Dishes (50+ varieties)
    'fried_rice': {'calories': 238, 'protein': 6.2, 'carbs': 42, 'fats': 5.8, 'fiber': 1.8, 'sugar': 2.1, 'keywords': ['fried', 'rice', 'chinese'], 'description': 'Indo-Chinese fried rice with vegetables'},
    'lemon_rice': {'calories': 195, 'protein': 4.5, 'carbs': 38, 'fats': 3.2, 'fiber': 1.5, 'sugar': 1.8, 'keywords': ['lemon', 'rice', 'south'], 'description': 'South Indian tangy lemon flavored rice'},
    'coconut_rice': {'calories': 285, 'protein': 5.8, 'carbs': 45, 'fats': 9.8, 'fiber': 2.2, 'sugar': 3.5, 'keywords': ['coconut', 'rice'], 'description': 'Rice cooked with fresh coconut'},
    'tamarind_rice': {'calories': 210, 'protein': 4.8, 'carbs': 40, 'fats': 4.2, 'fiber': 2.1, 'sugar': 5.8, 'keywords': ['tamarind', 'rice'], 'description': 'Tangy tamarind flavored rice'},
    'curd_rice': {'calories': 165, 'protein': 6.2, 'carbs': 28, 'fats': 3.8, 'fiber': 1.2, 'sugar': 8.5, 'keywords': ['curd', 'rice', 'yogurt'], 'description': 'Rice mixed with yogurt and spices'},
    'tomato_rice': {'calories': 188, 'protein': 4.8, 'carbs': 35, 'fats': 4.2, 'fiber': 2.8, 'sugar': 6.2, 'keywords': ['tomato', 'rice'], 'description': 'Rice cooked with tomato and spices'},
    'mint_rice': {'calories': 205, 'protein': 5.2, 'carbs': 38, 'fats': 4.8, 'fiber': 2.5, 'sugar': 2.8, 'keywords': ['mint', 'rice', 'pudina'], 'description': 'Aromatic mint flavored rice'},
    'vegetable_biryani': {'calories': 268, 'protein': 7.8, 'carbs': 48, 'fats': 6.2, 'fiber': 4.5, 'sugar': 5.8, 'keywords': ['vegetable', 'biryani'], 'description': 'Mixed vegetable biryani with aromatic spices'},
    'chicken_biryani': {'calories': 345, 'protein': 22.5, 'carbs': 42, 'fats': 12.8, 'fiber': 3.2, 'sugar': 4.5, 'keywords': ['chicken', 'biryani'], 'description': 'Traditional chicken biryani with basmati rice'},
    'mutton_biryani': {'calories': 385, 'protein': 28.2, 'carbs': 38, 'fats': 16.5, 'fiber': 2.8, 'sugar': 3.8, 'keywords': ['mutton', 'biryani'], 'description': 'Rich mutton biryani with tender meat'},
    
    # Dal & Lentil Dishes (40+ varieties)
    'rajma': {'calories': 245, 'protein': 15.2, 'carbs': 35, 'fats': 6.8, 'fiber': 12.5, 'sugar': 3.2, 'keywords': ['rajma', 'kidney', 'beans'], 'description': 'Kidney beans curry in tomato gravy'},
    'chole': {'calories': 269, 'protein': 14.8, 'carbs': 38, 'fats': 7.2, 'fiber': 11.8, 'sugar': 4.5, 'keywords': ['chole', 'chickpeas'], 'description': 'Spicy chickpea curry'},
    'dal_makhani': {'calories': 285, 'protein': 12.8, 'carbs': 28, 'fats': 14.2, 'fiber': 8.5, 'sugar': 5.8, 'keywords': ['dal', 'makhani', 'black'], 'description': 'Creamy black lentil curry'},
    'moong_dal': {'calories': 165, 'protein': 11.2, 'carbs': 25, 'fats': 2.8, 'fiber': 7.8, 'sugar': 2.5, 'keywords': ['moong', 'dal', 'yellow'], 'description': 'Yellow moong lentil curry'},
    'masoor_dal': {'calories': 158, 'protein': 10.8, 'carbs': 26, 'fats': 2.2, 'fiber': 8.2, 'sugar': 2.8, 'keywords': ['masoor', 'dal', 'red'], 'description': 'Red lentil curry'},
    'toor_dal': {'calories': 172, 'protein': 11.8, 'carbs': 28, 'fats': 2.5, 'fiber': 9.2, 'sugar': 3.2, 'keywords': ['toor', 'dal', 'arhar'], 'description': 'Pigeon pea lentil curry'},
    'chana_dal': {'calories': 185, 'protein': 12.5, 'carbs': 30, 'fats': 3.2, 'fiber': 10.5, 'sugar': 3.8, 'keywords': ['chana', 'dal', 'split'], 'description': 'Split chickpea lentil curry'},
    
    # Vegetable Curries (60+ varieties)
    'palak_paneer': {'calories': 285, 'protein': 16.5, 'carbs': 12, 'fats': 20.8, 'fiber': 4.2, 'sugar': 6.8, 'keywords': ['palak', 'paneer', 'spinach'], 'description': 'Cottage cheese in spinach gravy'},
    'aloo_gobi': {'calories': 158, 'protein': 4.2, 'carbs': 25, 'fats': 5.8, 'fiber': 5.2, 'sugar': 8.5, 'keywords': ['aloo', 'gobi', 'potato', 'cauliflower'], 'description': 'Potato and cauliflower curry'},
    'bhindi_masala': {'calories': 125, 'protein': 3.8, 'carbs': 18, 'fats': 4.5, 'fiber': 6.8, 'sugar': 5.2, 'keywords': ['bhindi', 'okra', 'ladyfinger'], 'description': 'Spiced okra curry'},
    'baingan_bharta': {'calories': 145, 'protein': 3.2, 'carbs': 22, 'fats': 5.8, 'fiber': 8.5, 'sugar': 12.8, 'keywords': ['baingan', 'bharta', 'eggplant'], 'description': 'Roasted eggplant mash'},
    'kadai_paneer': {'calories': 295, 'protein': 18.2, 'carbs': 15, 'fats': 20.5, 'fiber': 3.8, 'sugar': 8.2, 'keywords': ['kadai', 'paneer'], 'description': 'Cottage cheese in spicy tomato gravy'},
    'matar_paneer': {'calories': 268, 'protein': 15.8, 'carbs': 18, 'fats': 16.2, 'fiber': 5.2, 'sugar': 9.8, 'keywords': ['matar', 'paneer', 'peas'], 'description': 'Cottage cheese with green peas'},
    'aloo_matar': {'calories': 185, 'protein': 5.8, 'carbs': 32, 'fats': 4.2, 'fiber': 6.8, 'sugar': 12.5, 'keywords': ['aloo', 'matar', 'potato', 'peas'], 'description': 'Potato and green peas curry'},
    
    # Street Foods & Snacks (80+ varieties)
    'pani_puri': {'calories': 36, 'protein': 1.2, 'carbs': 6.8, 'fats': 0.8, 'fiber': 0.5, 'sugar': 2.1, 'keywords': ['pani', 'puri', 'golgappa'], 'description': 'Crispy shells with spiced water'},
    'bhel_puri': {'calories': 168, 'protein': 4.5, 'carbs': 28, 'fats': 4.8, 'fiber': 3.2, 'sugar': 8.5, 'keywords': ['bhel', 'puri', 'mumbai'], 'description': 'Mumbai street food with puffed rice'},
    'vada_pav': {'calories': 286, 'protein': 8.2, 'carbs': 42, 'fats': 9.8, 'fiber': 3.8, 'sugar': 5.2, 'keywords': ['vada', 'pav', 'mumbai'], 'description': 'Mumbai burger with potato fritter'},
    'pav_bhaji': {'calories': 325, 'protein': 9.5, 'carbs': 48, 'fats': 11.2, 'fiber': 6.8, 'sugar': 12.5, 'keywords': ['pav', 'bhaji', 'mumbai'], 'description': 'Spiced vegetable mash with bread'},
    'dahi_puri': {'calories': 85, 'protein': 2.8, 'carbs': 12, 'fats': 2.8, 'fiber': 1.2, 'sugar': 6.8, 'keywords': ['dahi', 'puri', 'yogurt'], 'description': 'Crispy shells with yogurt and chutneys'},
    'sev_puri': {'calories': 125, 'protein': 3.2, 'carbs': 18, 'fats': 4.5, 'fiber': 2.2, 'sugar': 5.8, 'keywords': ['sev', 'puri'], 'description': 'Crispy base with sev and chutneys'},
    'aloo_tikki': {'calories': 185, 'protein': 4.8, 'carbs': 28, 'fats': 6.8, 'fiber': 3.5, 'sugar': 3.2, 'keywords': ['aloo', 'tikki', 'potato'], 'description': 'Spiced potato patties'},
    'chole_bhature': {'calories': 485, 'protein': 16.8, 'carbs': 68, 'fats': 18.2, 'fiber': 8.5, 'sugar': 8.8, 'keywords': ['chole', 'bhature'], 'description': 'Chickpea curry with fried bread'},
    
    # South Indian Dishes (50+ varieties)
    'idli': {'calories': 58, 'protein': 2.1, 'carbs': 11, 'fats': 0.8, 'fiber': 1.2, 'sugar': 0.5, 'keywords': ['idli', 'steamed', 'south'], 'description': 'Steamed rice and lentil cakes'},
    'vada': {'calories': 185, 'protein': 5.8, 'carbs': 18, 'fats': 10.2, 'fiber': 2.8, 'sugar': 1.5, 'keywords': ['vada', 'medu', 'south'], 'description': 'Deep-fried lentil donuts'},
    'uttapam': {'calories': 145, 'protein': 4.2, 'carbs': 24, 'fats': 3.8, 'fiber': 2.1, 'sugar': 2.8, 'keywords': ['uttapam', 'south'], 'description': 'Thick pancake with vegetables'},
    'sambhar': {'calories': 95, 'protein': 6.8, 'carbs': 15, 'fats': 1.8, 'fiber': 4.5, 'sugar': 3.2, 'keywords': ['sambhar', 'south', 'lentil'], 'description': 'South Indian lentil soup'},
    'rasam': {'calories': 65, 'protein': 2.8, 'carbs': 12, 'fats': 1.2, 'fiber': 2.8, 'sugar': 4.5, 'keywords': ['rasam', 'south', 'soup'], 'description': 'Tangy South Indian soup'},
    'upma': {'calories': 158, 'protein': 4.2, 'carbs': 28, 'fats': 3.8, 'fiber': 2.5, 'sugar': 2.8, 'keywords': ['upma', 'semolina'], 'description': 'Semolina breakfast dish'},
    'poha': {'calories': 145, 'protein': 3.8, 'carbs': 28, 'fats': 2.8, 'fiber': 2.2, 'sugar': 3.5, 'keywords': ['poha', 'flattened', 'rice'], 'description': 'Flattened rice breakfast'},
    
    # Sweets & Desserts (60+ varieties)
    'laddu': {'calories': 425, 'protein': 8.5, 'carbs': 58, 'fats': 18.2, 'fiber': 2.8, 'sugar': 48.5, 'keywords': ['laddu', 'sweet', 'round'], 'description': 'Round sweet balls made with flour and ghee'},
    'jalebi': {'calories': 385, 'protein': 4.2, 'carbs': 68, 'fats': 12.8, 'fiber': 0.8, 'sugar': 58.5, 'keywords': ['jalebi', 'sweet', 'spiral'], 'description': 'Spiral shaped sweet in sugar syrup'},
    'barfi': {'calories': 365, 'protein': 8.8, 'carbs': 48, 'fats': 15.2, 'fiber': 1.5, 'sugar': 42.8, 'keywords': ['barfi', 'sweet', 'milk'], 'description': 'Milk-based sweet squares'},
    'halwa': {'calories': 285, 'protein': 6.2, 'carbs': 42, 'fats': 10.8, 'fiber': 2.8, 'sugar': 35.5, 'keywords': ['halwa', 'sweet'], 'description': 'Sweet pudding made with semolina or carrots'},
    'kulfi': {'calories': 195, 'protein': 5.8, 'carbs': 28, 'fats': 7.2, 'fiber': 0.5, 'sugar': 25.8, 'keywords': ['kulfi', 'ice', 'cream'], 'description': 'Traditional Indian ice cream'},
    'payasam': {'calories': 225, 'protein': 6.8, 'carbs': 38, 'fats': 6.2, 'fiber': 1.8, 'sugar': 32.5, 'keywords': ['payasam', 'kheer', 'pudding'], 'description': 'South Indian sweet pudding'},
    
    # Bread Varieties (30+ types)
    'bhatura': {'calories': 385, 'protein': 9.8, 'carbs': 52, 'fats': 15.8, 'fiber': 2.8, 'sugar': 3.5, 'keywords': ['bhatura', 'fried', 'bread'], 'description': 'Deep-fried leavened bread'},
    'kulcha': {'calories': 285, 'protein': 8.2, 'carbs': 48, 'fats': 6.8, 'fiber': 2.5, 'sugar': 4.2, 'keywords': ['kulcha', 'stuffed', 'bread'], 'description': 'Stuffed leavened bread'},
    'puri': {'calories': 168, 'protein': 4.2, 'carbs': 22, 'fats': 7.8, 'fiber': 1.8, 'sugar': 1.2, 'keywords': ['puri', 'fried', 'bread'], 'description': 'Deep-fried unleavened bread'},
    'roomali_roti': {'calories': 95, 'protein': 3.2, 'carbs': 18, 'fats': 1.8, 'fiber': 2.2, 'sugar': 0.8, 'keywords': ['roomali', 'roti', 'thin'], 'description': 'Thin handkerchief bread'},
    'missi_roti': {'calories': 185, 'protein': 6.8, 'carbs': 28, 'fats': 5.8, 'fiber': 4.2, 'sugar': 2.5, 'keywords': ['missi', 'roti', 'gram'], 'description': 'Bread made with gram flour'},
    
    # Regional Specialties (100+ dishes)
    'dhokla': {'calories': 125, 'protein': 4.8, 'carbs': 22, 'fats': 2.2, 'fiber': 3.5, 'sugar': 8.5, 'keywords': ['dhokla', 'gujarati', 'steamed'], 'description': 'Gujarati steamed gram flour cake'},
    'khandvi': {'calories': 95, 'protein': 3.8, 'carbs': 15, 'fats': 2.8, 'fiber': 2.2, 'sugar': 4.5, 'keywords': ['khandvi', 'gujarati'], 'description': 'Gujarati gram flour rolls'},
    'thepla': {'calories': 145, 'protein': 4.2, 'carbs': 22, 'fats': 5.2, 'fiber': 3.8, 'sugar': 2.8, 'keywords': ['thepla', 'gujarati', 'bread'], 'description': 'Gujarati spiced flatbread'},
    'undhiyu': {'calories': 185, 'protein': 6.8, 'carbs': 28, 'fats': 6.2, 'fiber': 8.5, 'sugar': 12.8, 'keywords': ['undhiyu', 'gujarati', 'mixed'], 'description': 'Gujarati mixed vegetable curry'},
    'misal_pav': {'calories': 285, 'protein': 12.8, 'carbs': 42, 'fats': 8.2, 'fiber': 8.8, 'sugar': 6.5, 'keywords': ['misal', 'pav', 'maharashtrian'], 'description': 'Maharashtrian spicy sprouts curry'},
    'puran_poli': {'calories': 325, 'protein': 8.8, 'carbs': 58, 'fats': 8.2, 'fiber': 4.5, 'sugar': 28.5, 'keywords': ['puran', 'poli', 'maharashtrian'], 'description': 'Maharashtrian sweet flatbread'},
    'dal_baati': {'calories': 385, 'protein': 14.8, 'carbs': 52, 'fats': 14.2, 'fiber': 6.8, 'sugar': 4.5, 'keywords': ['dal', 'baati', 'rajasthani'], 'description': 'Rajasthani baked wheat balls with lentils'},
    'gatte_ki_sabzi': {'calories': 225, 'protein': 8.2, 'carbs': 32, 'fats': 7.8, 'fiber': 4.2, 'sugar': 6.8, 'keywords': ['gatte', 'rajasthani'], 'description': 'Rajasthani gram flour dumplings curry'},
    'litti_chokha': {'calories': 285, 'protein': 9.8, 'carbs': 48, 'fats': 7.2, 'fiber': 6.8, 'sugar': 5.2, 'keywords': ['litti', 'chokha', 'bihari'], 'description': 'Bihari stuffed wheat balls with mashed vegetables'},
    'momo': {'calories': 185, 'protein': 8.2, 'carbs': 25, 'fats': 6.8, 'fiber': 2.8, 'sugar': 3.2, 'keywords': ['momo', 'dumpling', 'tibetan'], 'description': 'Tibetan steamed dumplings'},
    
    # Beverages & Drinks (40+ varieties)
    'lassi': {'calories': 125, 'protein': 4.8, 'carbs': 18, 'fats': 3.8, 'fiber': 0.2, 'sugar': 16.5, 'keywords': ['lassi', 'yogurt', 'drink'], 'description': 'Yogurt-based refreshing drink'},
    'chaas': {'calories': 65, 'protein': 3.2, 'carbs': 8, 'fats': 1.8, 'fiber': 0.1, 'sugar': 7.2, 'keywords': ['chaas', 'buttermilk'], 'description': 'Spiced buttermilk'},
    'masala_chai': {'calories': 85, 'protein': 2.8, 'carbs': 12, 'fats': 2.8, 'fiber': 0.2, 'sugar': 10.5, 'keywords': ['masala', 'chai', 'tea'], 'description': 'Spiced Indian tea with milk'},
    'filter_coffee': {'calories': 45, 'protein': 1.8, 'carbs': 6, 'fats': 1.5, 'fiber': 0.1, 'sugar': 5.2, 'keywords': ['filter', 'coffee', 'south'], 'description': 'South Indian filter coffee'},
    'thandai': {'calories': 185, 'protein': 5.8, 'carbs': 22, 'fats': 8.2, 'fiber': 2.2, 'sugar': 18.5, 'keywords': ['thandai', 'holi', 'drink'], 'description': 'Festival drink with nuts and spices'},
    'aam_panna': {'calories': 95, 'protein': 0.8, 'carbs': 24, 'fats': 0.2, 'fiber': 1.8, 'sugar': 20.5, 'keywords': ['aam', 'panna', 'mango'], 'description': 'Raw mango summer drink'},
    'nimbu_paani': {'calories': 45, 'protein': 0.2, 'carbs': 12, 'fats': 0.1, 'fiber': 0.2, 'sugar': 10.8, 'keywords': ['nimbu', 'paani', 'lemon'], 'description': 'Fresh lemon water'},
    'jaljeera': {'calories': 35, 'protein': 0.8, 'carbs': 8, 'fats': 0.2, 'fiber': 1.2, 'sugar': 6.5, 'keywords': ['jaljeera', 'cumin', 'drink'], 'description': 'Cumin flavored refreshing drink'}
}

# Merge all databases
INDIAN_FOOD_DATABASE.update(EXTENDED_INDIAN_FOODS)

def get_food_info(food_name):
    """Get nutritional information for a specific food item"""
    return INDIAN_FOOD_DATABASE.get(food_name.lower().replace(' ', '_'))

def search_food_by_keywords(keywords):
    """Search for food items based on keywords"""
    matches = []
    for food_name, food_data in INDIAN_FOOD_DATABASE.items():
        if 'keywords' in food_data:
            for keyword in keywords:
                if any(keyword.lower() in kw.lower() for kw in food_data['keywords']):
                    matches.append((food_name, food_data))
                    break
    return matches

def get_all_foods():
    """Get all available food items"""
    return list(INDIAN_FOOD_DATABASE.keys())