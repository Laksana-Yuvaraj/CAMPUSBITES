import fs from 'fs';
import path from 'path';
import {
  User,
  Canteen,
  MenuItem,
  Address,
  Order,
  DeliveryTask,
  Coupon,
  Notification,
  Review,
  SupportTicket,
  CampusDeliveryZone,
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

interface DatabaseSchema {
  users: User[];
  canteens: Canteen[];
  menuItems: MenuItem[];
  addresses: Address[];
  orders: Order[];
  deliveryTasks: DeliveryTask[];
  coupons: Coupon[];
  notifications: Notification[];
  reviews: Review[];
  supportTickets: SupportTicket[];
  campusZones: CampusDeliveryZone[];
}

const INITIAL_SEED: DatabaseSchema = {
  users: [
    {
      id: 'user-student-1',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@examplecollege.edu.in',
      phone: '+91 98765 43210',
      role: 'student',
      collegeId: 'EC2023-CS-042',
      profilePhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      walletBalance: 450,
      hostelOrDept: 'Aryabhatta Hostel Block B',
      room: 'Room 304',
      createdAt: '2026-08-15T09:00:00Z',
    },
    {
      id: 'user-student-2',
      name: 'Sneha Patel',
      email: 'sneha.patel@examplecollege.edu.in',
      phone: '+91 98765 43211',
      role: 'student',
      collegeId: 'EC2024-EC-109',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      walletBalance: 820,
      hostelOrDept: 'Kalpana Chawla Girls Hostel',
      room: 'Room 112',
      createdAt: '2026-08-16T10:00:00Z',
    },
    {
      id: 'user-student-3',
      name: 'Rohan Gupta',
      email: 'rohan.gupta@examplecollege.edu.in',
      phone: '+91 98765 43212',
      role: 'student',
      collegeId: 'EC2023-ME-077',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      walletBalance: 150,
      hostelOrDept: 'Aryabhatta Hostel Block A',
      room: 'Room 218',
      createdAt: '2026-08-18T11:00:00Z',
    },
    {
      id: 'user-student-4',
      name: 'Ananya Verma',
      email: 'ananya.verma@examplecollege.edu.in',
      phone: '+91 98765 43213',
      role: 'student',
      collegeId: 'EC2025-BT-014',
      profilePhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      walletBalance: 600,
      hostelOrDept: 'Kalpana Chawla Girls Hostel',
      room: 'Room 205',
      createdAt: '2026-08-20T14:00:00Z',
    },
    {
      id: 'user-student-5',
      name: 'Vikram Singh',
      email: 'vikram.singh@examplecollege.edu.in',
      phone: '+91 98765 43214',
      role: 'student',
      collegeId: 'EC2022-CE-033',
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      walletBalance: 320,
      hostelOrDept: 'Aryabhatta Hostel Block B',
      room: 'Room 412',
      createdAt: '2026-08-21T15:00:00Z',
    },
    {
      id: 'user-canteen-1',
      name: 'Chef Rajesh Kumar (Central Canteen)',
      email: 'central.canteen@examplecollege.edu.in',
      phone: '+91 98111 22334',
      role: 'canteen',
      collegeId: 'STAFF-VND-001',
      canteenId: 'canteen-1',
      walletBalance: 24500,
      createdAt: '2026-01-10T08:00:00Z',
    },
    {
      id: 'user-canteen-2',
      name: 'Priya Nambiar (Green Bites Bistro)',
      email: 'greenbites@examplecollege.edu.in',
      phone: '+91 98222 33445',
      role: 'canteen',
      collegeId: 'STAFF-VND-002',
      canteenId: 'canteen-2',
      walletBalance: 18900,
      createdAt: '2026-01-15T08:00:00Z',
    },
    {
      id: 'user-canteen-3',
      name: 'Gurpreet Singh (Night Owl Food Bar)',
      email: 'nightowl@examplecollege.edu.in',
      phone: '+91 98333 44556',
      role: 'canteen',
      collegeId: 'STAFF-VND-003',
      canteenId: 'canteen-3',
      walletBalance: 31200,
      createdAt: '2026-02-01T08:00:00Z',
    },
    {
      id: 'user-agent-1',
      name: 'Karan Mehra',
      email: 'karan.agent@examplecollege.edu.in',
      phone: '+91 97777 11223',
      role: 'agent',
      collegeId: 'CAMPUS-RUN-01',
      walletBalance: 1420,
      agentDetails: {
        vehicleType: 'e-scooter',
        isAvailable: true,
        currentCampusLocation: 'Aryabhatta Quadrangle',
      },
      createdAt: '2026-03-01T09:00:00Z',
    },
    {
      id: 'user-agent-2',
      name: 'Manpreet Sandhu',
      email: 'manpreet.agent@examplecollege.edu.in',
      phone: '+91 97777 22334',
      role: 'agent',
      collegeId: 'CAMPUS-RUN-02',
      walletBalance: 980,
      agentDetails: {
        vehicleType: 'bicycle',
        isAvailable: true,
        currentCampusLocation: 'Student Activity Center',
      },
      createdAt: '2026-03-05T09:00:00Z',
    },
    {
      id: 'user-agent-3',
      name: 'Devansh Joshi',
      email: 'devansh.agent@examplecollege.edu.in',
      phone: '+91 97777 33445',
      role: 'agent',
      collegeId: 'CAMPUS-RUN-03',
      walletBalance: 2150,
      agentDetails: {
        vehicleType: 'walking',
        isAvailable: false,
        currentCampusLocation: 'Central Library Ground',
      },
      createdAt: '2026-03-10T09:00:00Z',
    },
    {
      id: 'user-admin-1',
      name: 'Prof. S. Ranganathan (Dean Student Welfare)',
      email: 'admin@examplecollege.edu.in',
      phone: '+91 98000 99887',
      role: 'admin',
      collegeId: 'ADMIN-DSW-01',
      walletBalance: 0,
      createdAt: '2026-01-01T00:00:00Z',
    },
  ],

  canteens: [
    {
      id: 'canteen-1',
      name: 'Aryabhatta Central Canteen',
      description: 'The campus heartbeat for hearty North & South Indian meals, hot chai, samosas, and wholesome thalis.',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      location: 'Ground Floor, Student Activity Center (SAC)',
      openingTime: '07:30',
      closingTime: '21:30',
      isOpen: true,
      rating: 4.6,
      ratingCount: 382,
      minimumOrderValue: 40,
      avgPrepTimeMinutes: 15,
      deliveryZones: ['Hostel Block A', 'Hostel Block B', 'Girls Hostel', 'Central Library', 'Academic Block', 'Sports Arena'],
      rushCapacityPercent: 45,
    },
    {
      id: 'canteen-2',
      name: 'Green Bites Organic Bistro',
      description: 'Nutritious smoothies, whole wheat wraps, fruit bowls, sprouts salads, and healthy cold-pressed juices.',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
      location: 'First Floor, Sports Complex & Gym',
      openingTime: '08:00',
      closingTime: '20:00',
      isOpen: true,
      rating: 4.8,
      ratingCount: 214,
      minimumOrderValue: 60,
      avgPrepTimeMinutes: 12,
      deliveryZones: ['Hostel Block A', 'Hostel Block B', 'Girls Hostel', 'Central Library', 'Academic Block', 'Science & Tech'],
      rushCapacityPercent: 30,
    },
    {
      id: 'canteen-3',
      name: 'Night Owl Maggi & Snacks Corner',
      description: 'Your late-night study companion. Cheese maggi, grilled sandwiches, fries, cold coffee, and energy snacks.',
      image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&auto=format&fit=crop&q=80',
      location: 'Hostel Junction, Near Aryabhatta Gate 2',
      openingTime: '16:00',
      closingTime: '03:00',
      isOpen: true,
      rating: 4.7,
      ratingCount: 520,
      minimumOrderValue: 50,
      avgPrepTimeMinutes: 10,
      deliveryZones: ['Hostel Block A', 'Hostel Block B', 'Girls Hostel', 'Central Library Night Reading Room'],
      rushCapacityPercent: 65,
    },
  ],

  menuItems: [
    // Canteen 1: Central Canteen (Breakfast, Lunch, Combos, Beverages)
    {
      id: 'item-101',
      canteenId: 'canteen-1',
      name: 'Masala Dosa with Sambar & 2 Chutneys',
      description: 'Crisp golden crepe stuffed with spiced potato mash, served with piping hot dal sambar and fresh coconut chutneys.',
      price: 65,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
      category: 'Breakfast',
      isVeg: true,
      spiceLevel: 1,
      calories: 340,
      stock: 45,
      isAvailable: true,
      preparationTime: 12,
      popular: true,
      customizationOptions: {
        extras: [
          { name: 'Extra Butter/Ghee', price: 15 },
          { name: 'Extra Spiced Potato Filling', price: 20 },
          { name: 'Extra Coconut Chutney Cup', price: 10 },
        ],
        spiceLevels: ['Mild', 'Regular', 'Extra Spicy Podi'],
      },
    },
    {
      id: 'item-102',
      canteenId: 'canteen-1',
      name: 'Chole Bhature (2 pcs) with Pickled Onion',
      description: 'Puffy deep-fried bhaturas served with slow-cooked zesty Punjabi chickpea gravy and fresh mint chutney.',
      price: 85,
      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
      category: 'Breakfast',
      isVeg: true,
      spiceLevel: 2,
      calories: 580,
      stock: 30,
      isAvailable: true,
      preparationTime: 15,
      popular: true,
      customizationOptions: {
        extras: [
          { name: 'Extra 1 Bhatura', price: 30 },
          { name: 'Extra Chole Bowl', price: 35 },
          { name: 'Sweet Lassi Combo', price: 35 },
        ],
      },
    },
    {
      id: 'item-103',
      canteenId: 'canteen-1',
      name: 'Executive Deluxe Thali',
      description: 'Paneer butter masala, yellow dal tadka, seasonal vegetable, jeera rice, 3 butter rotis, gulab jamun, salad and papad.',
      price: 130,
      image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80',
      category: 'Lunch',
      isVeg: true,
      spiceLevel: 1,
      calories: 720,
      stock: 50,
      isAvailable: true,
      preparationTime: 18,
      popular: true,
      customizationOptions: {
        sizes: [
          { name: 'Standard Thali', price: 0 },
          { name: 'Special Thali (Extra Paneer + Raita)', price: 35 },
        ],
        removableIngredients: ['No Onion / Garlic', 'No Dal Tadka'],
      },
    },
    {
      id: 'item-104',
      canteenId: 'canteen-1',
      name: 'Paneer Butter Masala with 2 Parathas',
      description: 'Soft cottage cheese cubes simmered in a creamy, buttery tomato-cashew sauce, accompanied by laccha parathas.',
      price: 110,
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
      category: 'Lunch',
      isVeg: true,
      spiceLevel: 2,
      calories: 550,
      stock: 25,
      isAvailable: true,
      preparationTime: 15,
      customizationOptions: {
        extras: [
          { name: 'Extra Laccha Paratha', price: 25 },
          { name: 'Butter Tandoori Roti (2 pcs)', price: 20 },
        ],
      },
    },
    {
      id: 'item-105',
      canteenId: 'canteen-1',
      name: 'Chicken Dum Biryani with Mirchi ka Salan & Raita',
      description: 'Fragrant basmati rice layered with succulent bone-in chicken marinated in saffron, spices, and fried onions.',
      price: 150,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
      category: 'Lunch',
      isVeg: false,
      spiceLevel: 3,
      calories: 680,
      stock: 40,
      isAvailable: true,
      preparationTime: 15,
      popular: true,
      customizationOptions: {
        sizes: [
          { name: 'Regular Portion', price: 0 },
          { name: 'Large Jumbo Portion', price: 50 },
        ],
        extras: [
          { name: 'Boiled Egg (2 pcs)', price: 25 },
          { name: 'Extra Raita Bowl', price: 15 },
        ],
      },
    },
    {
      id: 'item-106',
      canteenId: 'canteen-1',
      name: 'Crispy Samosa Chaat (2 pcs)',
      description: 'Crushed potato samosas crowned with spiced chole, sweetened yogurt, tangy tamarind chutney, and fine sev.',
      price: 50,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
      category: 'Snacks',
      isVeg: true,
      spiceLevel: 2,
      calories: 380,
      stock: 60,
      isAvailable: true,
      preparationTime: 8,
      popular: true,
    },
    {
      id: 'item-107',
      canteenId: 'canteen-1',
      name: 'Kadak Adrak-Elaichi Masala Chai (Kulhad)',
      description: 'Slow-brewed strong Assam tea infused with fresh crushed ginger and green cardamom, served in clay kulhad.',
      price: 20,
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
      category: 'Beverages',
      isVeg: true,
      spiceLevel: 1,
      calories: 85,
      stock: 120,
      isAvailable: true,
      preparationTime: 5,
      customizationOptions: {
        extras: [
          { name: 'Less Sugar', price: 0 },
          { name: 'Sugar-Free', price: 0 },
          { name: 'Extra Ginger Punch', price: 5 },
        ],
      },
    },
    {
      id: 'item-108',
      canteenId: 'canteen-1',
      name: 'Warm Gulab Jamun (2 pcs)',
      description: 'Golden mawa dumplings soaked in rose and cardamom-scented sugar syrup.',
      price: 40,
      image: 'https://images.unsplash.com/photo-1589119908995-c6837fa14d48?w=600&auto=format&fit=crop&q=80',
      category: 'Desserts',
      isVeg: true,
      spiceLevel: 0,
      calories: 290,
      stock: 35,
      isAvailable: true,
      preparationTime: 3,
    },

    // Canteen 2: Green Bites Organic Bistro (Healthy, Beverages, Snacks)
    {
      id: 'item-201',
      canteenId: 'canteen-2',
      name: 'Paneer & Avocado Protein Bowl',
      description: 'Grilled spiced paneer, roasted chickpeas, organic quinoa, fresh greens, cherry tomatoes, and tahini lime dressing.',
      price: 145,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
      category: 'Healthy',
      isVeg: true,
      spiceLevel: 1,
      calories: 420,
      stock: 25,
      isAvailable: true,
      preparationTime: 12,
      popular: true,
      customizationOptions: {
        extras: [
          { name: 'Extra Grilled Paneer (50g)', price: 35 },
          { name: 'Pumpkin & Sunflower Seeds Mix', price: 15 },
        ],
        removableIngredients: ['No Cherry Tomatoes', 'No Onion'],
      },
    },
    {
      id: 'item-202',
      canteenId: 'canteen-2',
      name: 'Grilled Herb Chicken & Quinoa Wrap',
      description: 'Whole wheat flatbread rolled with lean grilled chicken breast, Mediterranean herbs, lettuce, and Greek yogurt garlic spread.',
      price: 135,
      image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop&q=80',
      category: 'Healthy',
      isVeg: false,
      spiceLevel: 1,
      calories: 380,
      stock: 20,
      isAvailable: true,
      preparationTime: 14,
      popular: true,
    },
    {
      id: 'item-203',
      canteenId: 'canteen-2',
      name: 'Fresh Mixed Fruit & Chia Pudding',
      description: 'Almond milk soaked chia seeds topped with kiwi, pomegranate pearls, strawberries, and wildflower campus honey.',
      price: 95,
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80',
      category: 'Healthy',
      isVeg: true,
      spiceLevel: 0,
      calories: 220,
      stock: 18,
      isAvailable: true,
      preparationTime: 6,
    },
    {
      id: 'item-204',
      canteenId: 'canteen-2',
      name: 'Super Green Detox Cold-Pressed Juice (350ml)',
      description: 'Fresh blend of spinach, green apple, cucumber, celery, fresh mint, and a dash of Himalayan black salt.',
      price: 80,
      image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
      category: 'Beverages',
      isVeg: true,
      spiceLevel: 0,
      calories: 95,
      stock: 30,
      isAvailable: true,
      preparationTime: 5,
    },
    {
      id: 'item-205',
      canteenId: 'canteen-2',
      name: 'Almond Butter Banana Smoothie (400ml)',
      description: 'Nutritious smoothie made with ripe bananas, artisanal roasted almond butter, rolled oats, and low-fat milk.',
      price: 110,
      image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80',
      category: 'Beverages',
      isVeg: true,
      spiceLevel: 0,
      calories: 310,
      stock: 24,
      isAvailable: true,
      preparationTime: 6,
      customizationOptions: {
        extras: [
          { name: 'Whey Protein Scoop (24g)', price: 45 },
          { name: 'Chia Seeds', price: 10 },
        ],
      },
    },
    {
      id: 'item-206',
      canteenId: 'canteen-2',
      name: 'Oats & Dark Chocolate Energy Bars (Pack of 2)',
      description: 'Zero refined sugar energy squares packed with rolled oats, dates, flaxseeds, and 70% dark Belgian cocoa.',
      price: 60,
      image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=80',
      category: 'Desserts',
      isVeg: true,
      spiceLevel: 0,
      calories: 240,
      stock: 40,
      isAvailable: true,
      preparationTime: 2,
    },

    // Canteen 3: Night Owl Maggi & Snacks Corner (Snacks, Combos, Beverages)
    {
      id: 'item-301',
      canteenId: 'canteen-3',
      name: 'Double Cheese Burst Masala Maggi',
      description: 'College student favorite! Two cakes of Maggi noodles tossed with veggies, secret spice mix, and molten mozzarella cheddar blend.',
      price: 60,
      image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80',
      category: 'Snacks',
      isVeg: true,
      spiceLevel: 2,
      calories: 430,
      stock: 75,
      isAvailable: true,
      preparationTime: 8,
      popular: true,
      customizationOptions: {
        extras: [
          { name: 'Extra Cheese Slice Melt', price: 20 },
          { name: 'Sweet Corn & Peri Peri Sprinkle', price: 15 },
          { name: 'Scrambled Egg on Top', price: 20 },
        ],
        spiceLevels: ['Mild', 'Spicy', 'Hostel Fire (Extra Chili)'],
      },
    },
    {
      id: 'item-302',
      canteenId: 'canteen-3',
      name: 'Peri-Peri Crinkle Fries with Garlic Mayo Dip',
      description: 'Hot crisp potato crinkle cuts tossed in fiery African bird’s eye peri-peri dust, served with creamy house garlic mayonnaise.',
      price: 70,
      image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
      category: 'Snacks',
      isVeg: true,
      spiceLevel: 2,
      calories: 360,
      stock: 55,
      isAvailable: true,
      preparationTime: 10,
      popular: true,
    },
    {
      id: 'item-303',
      canteenId: 'canteen-3',
      name: 'Jumbo Bombay Veg Grilled Sandwich',
      description: 'Triple layer sandwich packed with spiced potato masala, cucumber, beetroot, tomato, mint chutney, and generous cheese.',
      price: 80,
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
      category: 'Snacks',
      isVeg: true,
      spiceLevel: 1,
      calories: 480,
      stock: 35,
      isAvailable: true,
      preparationTime: 12,
      popular: true,
      customizationOptions: {
        extras: [
          { name: 'Extra Cheese Grating', price: 20 },
          { name: 'Add Potato Chips inside', price: 10 },
        ],
        removableIngredients: ['No Beetroot', 'No Green Chili'],
      },
    },
    {
      id: 'item-304',
      canteenId: 'canteen-3',
      name: 'Crispy Chicken Tikka Roll',
      description: 'Rumali roti stuffed with succulent smoky chicken tikka chunks, pickled onions, and zesty mint coriander spread.',
      price: 110,
      image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&auto=format&fit=crop&q=80',
      category: 'Snacks',
      isVeg: false,
      spiceLevel: 2,
      calories: 460,
      stock: 28,
      isAvailable: true,
      preparationTime: 12,
      popular: true,
    },
    {
      id: 'item-305',
      canteenId: 'canteen-3',
      name: 'Midnight Exam Fuel Combo',
      description: 'Double cheese Maggi + Peri-Peri Fries + Cold Coffee (300ml). Perfect combo for night study sessions.',
      price: 165,
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
      category: 'Combos',
      isVeg: true,
      spiceLevel: 2,
      calories: 780,
      stock: 40,
      isAvailable: true,
      preparationTime: 14,
      popular: true,
    },
    {
      id: 'item-306',
      canteenId: 'canteen-3',
      name: 'Frothy Thick Cold Coffee with Ice Cream Scoop',
      description: 'Creamy blended iced espresso milk topped with a luscious scoop of vanilla ice cream and chocolate drizzle.',
      price: 65,
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
      category: 'Beverages',
      isVeg: true,
      spiceLevel: 0,
      calories: 270,
      stock: 80,
      isAvailable: true,
      preparationTime: 5,
      popular: true,
    },
    {
      id: 'item-307',
      canteenId: 'canteen-3',
      name: 'Hot Sizzling Brownie with Vanilla Ice Cream',
      description: 'Fudgy walnut brownie warmed on a cast iron skillet, topped with cold vanilla scoop and hot chocolate fudge.',
      price: 90,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
      category: 'Desserts',
      isVeg: true,
      spiceLevel: 0,
      calories: 410,
      stock: 22,
      isAvailable: true,
      preparationTime: 7,
    },
    {
      id: 'item-308',
      canteenId: 'canteen-3',
      name: 'Spicy Masala Lemonade (Shikanji)',
      description: 'Refreshing sparkling Indian lemonade spiked with roasted cumin, rock salt, mint leaves, and fresh lime.',
      price: 35,
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
      category: 'Beverages',
      isVeg: true,
      spiceLevel: 1,
      calories: 60,
      stock: 65,
      isAvailable: true,
      preparationTime: 4,
    },
    {
      id: 'item-309',
      canteenId: 'canteen-3',
      name: 'Egg & Cheese Bhurji with Butter Pav (2 pcs)',
      description: '3 farm-fresh eggs scrambled with chopped onions, green chilies, tomatoes, cilantro, and served with toasted butter pav.',
      price: 75,
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
      category: 'Snacks',
      isVeg: false,
      spiceLevel: 2,
      calories: 420,
      stock: 35,
      isAvailable: true,
      preparationTime: 10,
    },
  ],

  addresses: [
    {
      id: 'addr-1',
      userId: 'user-student-1',
      label: 'Hostel Room',
      block: 'Aryabhatta Hostel Block B',
      room: 'Room 304, 3rd Floor',
      landmark: 'Near Water Cooler & Staircase 2',
      locationType: 'Hostel',
    },
    {
      id: 'addr-2',
      userId: 'user-student-1',
      label: 'CS Computer Lab',
      block: 'Ramanujan Academic Block',
      room: 'Lab 402, 4th Floor',
      landmark: 'Opposite AI Research Wing',
      locationType: 'Academic',
    },
    {
      id: 'addr-3',
      userId: 'user-student-2',
      label: 'My Dorm Room',
      block: 'Kalpana Chawla Girls Hostel',
      room: 'Room 112, 1st Floor',
      landmark: 'Near North Wing Security Desk',
      locationType: 'Hostel',
    },
    {
      id: 'addr-4',
      userId: 'user-student-2',
      label: 'Central Library Study Desk',
      block: 'Central Library & Reading Pavilions',
      room: 'Cubicle 18, 2nd Floor',
      landmark: 'Quiet Zone Area B',
      locationType: 'Library',
    },
  ],

  orders: [
    {
      id: 'ORD-8821',
      userId: 'user-student-1',
      userName: 'Aarav Sharma',
      userEmail: 'aarav.sharma@examplecollege.edu.in',
      userPhone: '+91 98765 43210',
      canteenId: 'canteen-1',
      canteenName: 'Aryabhatta Central Canteen',
      items: [
        {
          menuItemId: 'item-101',
          name: 'Masala Dosa with Sambar & 2 Chutneys',
          isVeg: true,
          unitPrice: 65,
          quantity: 1,
          customizations: { spiceLevel: 'Regular', extras: ['Extra Coconut Chutney Cup'] },
        },
        {
          menuItemId: 'item-107',
          name: 'Kadak Adrak-Elaichi Masala Chai (Kulhad)',
          isVeg: true,
          unitPrice: 20,
          quantity: 2,
        },
      ],
      status: 'out_for_delivery',
      orderType: 'now',
      deliveryAddress: {
        label: 'Hostel Room',
        block: 'Aryabhatta Hostel Block B',
        room: 'Room 304, 3rd Floor',
        landmark: 'Near Water Cooler & Staircase 2',
        locationType: 'Hostel',
      },
      subtotal: 115,
      deliveryFee: 15,
      taxes: 5.75,
      discount: 20,
      total: 115.75,
      paymentMethod: 'upi',
      paymentStatus: 'completed',
      transactionId: 'UPI-TXN-98471204',
      placedAt: '2026-10-28T22:30:00Z',
      acceptedAt: '2026-10-28T22:32:00Z',
      readyAt: '2026-10-28T22:45:00Z',
      outForDeliveryAt: '2026-10-28T22:48:00Z',
      estimatedDeliveryMinutes: 10,
      deliveryOtp: '4819',
      assignedAgentId: 'user-agent-1',
      assignedAgentName: 'Karan Mehra',
      assignedAgentPhone: '+91 97777 11223',
      timeline: [
        {
          status: 'placed',
          timestamp: '2026-10-28T22:30:00Z',
          title: 'Order Placed',
          description: 'Payment verified via UPI. Sent to Aryabhatta Central Canteen.',
        },
        {
          status: 'accepted',
          timestamp: '2026-10-28T22:32:00Z',
          title: 'Accepted by Canteen',
          description: 'Canteen accepted your order and added it to the prep queue.',
        },
        {
          status: 'preparing',
          timestamp: '2026-10-28T22:35:00Z',
          title: 'Preparing Food',
          description: 'Fresh masala dosa and kadak chai are on the stove.',
        },
        {
          status: 'ready_for_pickup',
          timestamp: '2026-10-28T22:45:00Z',
          title: 'Ready for Pickup',
          description: 'Order packed in eco-friendly container with cutlery.',
        },
        {
          status: 'agent_assigned',
          timestamp: '2026-10-28T22:46:00Z',
          title: 'Agent Assigned',
          description: 'Karan Mehra (e-scooter) assigned for campus delivery.',
        },
        {
          status: 'out_for_delivery',
          timestamp: '2026-10-28T22:48:00Z',
          title: 'Out for Delivery',
          description: 'Agent picked up package and is en route to Aryabhatta Block B.',
        },
      ],
    },
    {
      id: 'ORD-8790',
      userId: 'user-student-2',
      userName: 'Sneha Patel',
      userEmail: 'sneha.patel@examplecollege.edu.in',
      userPhone: '+91 98765 43211',
      canteenId: 'canteen-2',
      canteenName: 'Green Bites Organic Bistro',
      items: [
        {
          menuItemId: 'item-201',
          name: 'Paneer & Avocado Protein Bowl',
          isVeg: true,
          unitPrice: 145,
          quantity: 1,
        },
        {
          menuItemId: 'item-204',
          name: 'Super Green Detox Cold-Pressed Juice (350ml)',
          isVeg: true,
          unitPrice: 80,
          quantity: 1,
        },
      ],
      status: 'delivered',
      orderType: 'now',
      deliveryAddress: {
        label: 'My Dorm Room',
        block: 'Kalpana Chawla Girls Hostel',
        room: 'Room 112, 1st Floor',
        landmark: 'Near North Wing Security Desk',
        locationType: 'Hostel',
      },
      subtotal: 225,
      deliveryFee: 0, // Free above ₹200
      taxes: 11.25,
      discount: 45,
      total: 191.25,
      paymentMethod: 'wallet',
      paymentStatus: 'completed',
      transactionId: 'WALLET-W738192',
      placedAt: '2026-10-28T19:15:00Z',
      acceptedAt: '2026-10-28T19:17:00Z',
      readyAt: '2026-10-28T19:30:00Z',
      outForDeliveryAt: '2026-10-28T19:33:00Z',
      deliveredAt: '2026-10-28T19:44:00Z',
      estimatedDeliveryMinutes: 0,
      deliveryOtp: '7251',
      assignedAgentId: 'user-agent-2',
      assignedAgentName: 'Manpreet Sandhu',
      assignedAgentPhone: '+91 97777 22334',
      timeline: [
        { status: 'placed', timestamp: '2026-10-28T19:15:00Z', title: 'Order Placed', description: 'Order confirmed with campus wallet.' },
        { status: 'accepted', timestamp: '2026-10-28T19:17:00Z', title: 'Accepted by Canteen', description: 'Green Bites confirmed order.' },
        { status: 'preparing', timestamp: '2026-10-28T19:20:00Z', title: 'Fresh Preparation', description: 'Salad and juice prepared fresh.' },
        { status: 'ready_for_pickup', timestamp: '2026-10-28T19:30:00Z', title: 'Ready', description: 'Packed at Bistro counter.' },
        { status: 'agent_assigned', timestamp: '2026-10-28T19:31:00Z', title: 'Agent Assigned', description: 'Manpreet Sandhu (Bicycle).' },
        { status: 'out_for_delivery', timestamp: '2026-10-28T19:33:00Z', title: 'Out for Delivery', description: 'Agent en route to Girls Hostel.' },
        { status: 'delivered', timestamp: '2026-10-28T19:44:00Z', title: 'Delivered', description: 'OTP verified. Handed over at security desk.' },
      ],
    },
    {
      id: 'ORD-8902',
      userId: 'user-student-3',
      userName: 'Rohan Gupta',
      userEmail: 'rohan.gupta@examplecollege.edu.in',
      userPhone: '+91 98765 43212',
      canteenId: 'canteen-3',
      canteenName: 'Night Owl Maggi & Snacks Corner',
      items: [
        {
          menuItemId: 'item-305',
          name: 'Midnight Exam Fuel Combo',
          isVeg: true,
          unitPrice: 165,
          quantity: 1,
        },
      ],
      status: 'preparing',
      orderType: 'scheduled',
      scheduledFor: '2026-10-29 00:30',
      deliveryAddress: {
        label: 'Central Library Study Desk',
        block: 'Central Library & Reading Pavilions',
        room: 'Reading Hall 2, Ground Floor',
        landmark: 'Near Reference Bookshelf',
        locationType: 'Library',
      },
      subtotal: 165,
      deliveryFee: 15,
      taxes: 8.25,
      discount: 0,
      total: 188.25,
      paymentMethod: 'upi',
      paymentStatus: 'completed',
      transactionId: 'UPI-TXN-55443322',
      placedAt: '2026-10-28T21:00:00Z',
      acceptedAt: '2026-10-28T21:05:00Z',
      estimatedDeliveryMinutes: 20,
      deliveryOtp: '9133',
      timeline: [
        { status: 'placed', timestamp: '2026-10-28T21:00:00Z', title: 'Scheduled Order Placed', description: 'Scheduled for 00:30 midnight delivery.' },
        { status: 'accepted', timestamp: '2026-10-28T21:05:00Z', title: 'Scheduled Slot Reserved', description: 'Slot confirmed in Night Owl schedule.' },
        { status: 'preparing', timestamp: '2026-10-28T23:30:00Z', title: 'Preparing Batch', description: 'Cooking started for midnight slot.' },
      ],
    },
  ],

  deliveryTasks: [
    {
      id: 'task-1',
      orderId: 'ORD-8821',
      canteenId: 'canteen-1',
      canteenName: 'Aryabhatta Central Canteen',
      canteenLocation: 'Ground Floor, SAC',
      dropBlock: 'Aryabhatta Hostel Block B',
      dropRoom: 'Room 304, 3rd Floor',
      dropLandmark: 'Near Water Cooler & Staircase 2',
      itemCount: 3,
      itemsSummary: '1x Masala Dosa, 2x Kulhad Chai',
      payout: 35,
      distanceMeters: 450,
      agentId: 'user-agent-1',
      agentName: 'Karan Mehra',
      agentPhone: '+91 97777 11223',
      assignedAt: '2026-10-28T22:46:00Z',
      pickedUpAt: '2026-10-28T22:48:00Z',
      status: 'picked_up',
      customerName: 'Aarav Sharma',
      customerPhone: '+91 98765 43210',
      deliveryOtp: '4819',
    },
    {
      id: 'task-2',
      orderId: 'ORD-8902',
      canteenId: 'canteen-3',
      canteenName: 'Night Owl Maggi & Snacks Corner',
      canteenLocation: 'Hostel Junction, Gate 2',
      dropBlock: 'Central Library & Reading Pavilions',
      dropRoom: 'Reading Hall 2, Ground Floor',
      dropLandmark: 'Near Reference Bookshelf',
      itemCount: 1,
      itemsSummary: '1x Midnight Exam Fuel Combo',
      payout: 40,
      distanceMeters: 620,
      scheduledDeliveryTime: '2026-10-29 00:30',
      status: 'available',
      customerName: 'Rohan Gupta',
      customerPhone: '+91 98765 43212',
      deliveryOtp: '9133',
    },
  ],

  coupons: [
    {
      code: 'CAMPUS50',
      title: 'Flat ₹50 Off',
      description: 'Get flat ₹50 off on orders above ₹150 from any campus canteen',
      discountType: 'flat',
      value: 50,
      minOrder: 150,
      maxDiscount: 50,
      validFrom: '2026-10-01',
      validTo: '2026-12-31',
      usageLimit: 500,
      usedCount: 142,
    },
    {
      code: 'FRESHER20',
      title: '20% Freshers Discount',
      description: '20% discount up to ₹60 on your favourite snacks and beverages',
      discountType: 'percentage',
      value: 20,
      minOrder: 80,
      maxDiscount: 60,
      validFrom: '2026-10-01',
      validTo: '2026-11-30',
      usageLimit: 1000,
      usedCount: 388,
    },
    {
      code: 'FREEDEL',
      title: 'Free Campus Delivery',
      description: 'Zero delivery fee on any order above ₹99 anywhere on campus',
      discountType: 'flat',
      value: 20,
      minOrder: 99,
      maxDiscount: 20,
      validFrom: '2026-10-01',
      validTo: '2026-12-31',
      usageLimit: 2000,
      usedCount: 712,
    },
    {
      code: 'EXAMFUEL',
      title: 'Exam Rush Fuel ₹30 Off',
      description: 'Save ₹30 on all midnight study combos & healthy meals',
      discountType: 'flat',
      value: 30,
      minOrder: 120,
      maxDiscount: 30,
      validFrom: '2026-10-15',
      validTo: '2026-11-15',
      usageLimit: 300,
      usedCount: 89,
    },
  ],

  notifications: [
    {
      id: 'notif-1',
      userId: 'user-student-1',
      title: 'Order is Out for Delivery!',
      message: 'Agent Karan Mehra is arriving on his e-scooter. Share OTP 4819 upon arrival.',
      type: 'delivery',
      orderId: 'ORD-8821',
      isRead: false,
      createdAt: '2026-10-28T22:48:00Z',
    },
    {
      id: 'notif-2',
      userId: 'user-student-1',
      title: 'Aryabhatta Central Canteen Accepted Order',
      message: 'Your Masala Dosa & Chai order ORD-8821 was accepted and is being freshly cooked.',
      type: 'order',
      orderId: 'ORD-8821',
      isRead: true,
      createdAt: '2026-10-28T22:32:00Z',
    },
    {
      id: 'notif-3',
      userId: 'user-student-2',
      title: 'Order Delivered Successfully!',
      message: 'Your Green Bites order ORD-8790 was delivered to Kalpana Chawla Girls Hostel. Enjoy your meal!',
      type: 'order',
      orderId: 'ORD-8790',
      isRead: true,
      createdAt: '2026-10-28T19:44:00Z',
    },
  ],

  reviews: [
    {
      id: 'rev-1',
      canteenId: 'canteen-1',
      userId: 'user-student-2',
      userName: 'Sneha Patel',
      rating: 5,
      comment: 'The Masala Dosa is super crisp and the coconut chutney is the freshest on campus. Super fast delivery to the hostel too!',
      tags: ['Crispy Dosa', 'Fresh Chutney', 'Quick Prep'],
      createdAt: '2026-10-25T14:30:00Z',
    },
    {
      id: 'rev-2',
      canteenId: 'canteen-1',
      userId: 'user-student-3',
      userName: 'Rohan Gupta',
      rating: 4,
      comment: 'Very generous portions on the Executive Deluxe Thali. Value for money meal between long lecture blocks.',
      tags: ['Value for Money', 'Good Portions'],
      createdAt: '2026-10-24T18:10:00Z',
    },
    {
      id: 'rev-3',
      canteenId: 'canteen-2',
      userId: 'user-student-1',
      userName: 'Aarav Sharma',
      rating: 5,
      comment: 'Green Bites is a lifesaver for gym goers. The paneer protein bowl has real macros and tastes phenomenal with their tahini dressing.',
      tags: ['High Protein', 'Clean Ingredients'],
      createdAt: '2026-10-26T12:00:00Z',
    },
    {
      id: 'rev-4',
      canteenId: 'canteen-3',
      userId: 'user-student-4',
      userName: 'Ananya Verma',
      rating: 5,
      comment: 'Best Maggi on campus hands down! During hackathon nights, the Midnight Exam Fuel combo kept our entire team awake.',
      tags: ['Late Night King', 'Cheesy Maggi'],
      createdAt: '2026-10-27T02:15:00Z',
    },
  ],

  supportTickets: [
    {
      id: 'TICK-101',
      userId: 'user-student-3',
      userName: 'Rohan Gupta',
      userEmail: 'rohan.gupta@examplecollege.edu.in',
      userRole: 'student',
      orderId: 'ORD-8600',
      subject: 'Delay in delivery during peak lunch hour',
      description: 'My order took 25 minutes instead of the estimated 12 minutes due to rain at the SAC quadrangle.',
      status: 'resolved',
      priority: 'low',
      aiDraftResponse: 'Hello Rohan, we sincerely apologize for the delay. During heavy campus showers, our delivery agents navigate carefully for safety. We have credited ₹25 to your Campus Wallet as a courtesy gesture.',
      resolutionNote: 'Credited ₹25 apology bonus to student campus wallet.',
      createdAt: '2026-10-22T13:45:00Z',
    },
  ],

  campusZones: [
    {
      id: 'zone-1',
      name: 'Aryabhatta Hostel Block A & B',
      distanceMeters: 450,
      baseFee: 15,
      freeDeliveryThreshold: 200,
    },
    {
      id: 'zone-2',
      name: 'Kalpana Chawla Girls Hostel',
      distanceMeters: 650,
      baseFee: 20,
      freeDeliveryThreshold: 200,
    },
    {
      id: 'zone-3',
      name: 'Central Library & Reading Pavilions',
      distanceMeters: 300,
      baseFee: 15,
      freeDeliveryThreshold: 150,
    },
    {
      id: 'zone-4',
      name: 'Ramanujan Academic Block',
      distanceMeters: 500,
      baseFee: 20,
      freeDeliveryThreshold: 200,
    },
    {
      id: 'zone-5',
      name: 'Science & Technology Lab Complex',
      distanceMeters: 850,
      baseFee: 25,
      freeDeliveryThreshold: 250,
    },
    {
      id: 'zone-6',
      name: 'Sports Arena & Gymnasium',
      distanceMeters: 950,
      baseFee: 25,
      freeDeliveryThreshold: 250,
    },
    {
      id: 'zone-7',
      name: 'Administrative Complex & Guest House',
      distanceMeters: 1100,
      baseFee: 30,
      freeDeliveryThreshold: 300,
    },
  ],
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load existing database file, falling back to seed:', e);
    }
    this.saveData(INITIAL_SEED);
    return JSON.parse(JSON.stringify(INITIAL_SEED));
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  private persist() {
    this.saveData(this.data);
  }

  public resetToSeed() {
    this.data = JSON.parse(JSON.stringify(INITIAL_SEED));
    this.persist();
    return this.data;
  }

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.persist();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.persist();
    return this.data.users[idx];
  }

  // Canteens
  public getCanteens(): Canteen[] {
    return this.data.canteens;
  }

  public getCanteenById(id: string): Canteen | undefined {
    return this.data.canteens.find((c) => c.id === id);
  }

  public updateCanteen(id: string, updates: Partial<Canteen>): Canteen | undefined {
    const idx = this.data.canteens.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.canteens[idx] = { ...this.data.canteens[idx], ...updates };
    this.persist();
    return this.data.canteens[idx];
  }

  // Menu Items
  public getMenuItems(canteenId?: string): MenuItem[] {
    if (canteenId) {
      return this.data.menuItems.filter((m) => m.canteenId === canteenId);
    }
    return this.data.menuItems;
  }

  public getMenuItemById(id: string): MenuItem | undefined {
    return this.data.menuItems.find((m) => m.id === id);
  }

  public createMenuItem(item: MenuItem): MenuItem {
    this.data.menuItems.push(item);
    this.persist();
    return item;
  }

  public updateMenuItem(id: string, updates: Partial<MenuItem>): MenuItem | undefined {
    const idx = this.data.menuItems.findIndex((m) => m.id === id);
    if (idx === -1) return undefined;
    this.data.menuItems[idx] = { ...this.data.menuItems[idx], ...updates };
    this.persist();
    return this.data.menuItems[idx];
  }

  public deleteMenuItem(id: string): boolean {
    const initialLen = this.data.menuItems.length;
    this.data.menuItems = this.data.menuItems.filter((m) => m.id !== id);
    if (this.data.menuItems.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Addresses
  public getAddresses(userId: string): Address[] {
    return this.data.addresses.filter((a) => a.userId === userId);
  }

  public addAddress(address: Address): Address {
    this.data.addresses.push(address);
    this.persist();
    return address;
  }

  public deleteAddress(id: string, userId: string): boolean {
    const initial = this.data.addresses.length;
    this.data.addresses = this.data.addresses.filter((a) => !(a.id === id && a.userId === userId));
    if (this.data.addresses.length !== initial) {
      this.persist();
      return true;
    }
    return false;
  }

  // Orders
  public getOrders(filters?: { userId?: string; canteenId?: string; status?: string }): Order[] {
    return this.data.orders.filter((order) => {
      if (filters?.userId && order.userId !== filters.userId) return false;
      if (filters?.canteenId && order.canteenId !== filters.canteenId) return false;
      if (filters?.status && order.status !== filters.status) return false;
      return true;
    });
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id);
  }

  public createOrder(order: Order): Order {
    this.data.orders.unshift(order);
    this.persist();
    return order;
  }

  public updateOrder(id: string, updates: Partial<Order>): Order | undefined {
    const idx = this.data.orders.findIndex((o) => o.id === id);
    if (idx === -1) return undefined;
    this.data.orders[idx] = { ...this.data.orders[idx], ...updates };
    this.persist();
    return this.data.orders[idx];
  }

  // Delivery Tasks
  public getDeliveryTasks(agentId?: string): DeliveryTask[] {
    if (agentId) {
      return this.data.deliveryTasks.filter((t) => t.agentId === agentId || t.status === 'available');
    }
    return this.data.deliveryTasks;
  }

  public getDeliveryTaskById(id: string): DeliveryTask | undefined {
    return this.data.deliveryTasks.find((t) => t.id === id);
  }

  public getDeliveryTaskByOrderId(orderId: string): DeliveryTask | undefined {
    return this.data.deliveryTasks.find((t) => t.orderId === orderId);
  }

  public createDeliveryTask(task: DeliveryTask): DeliveryTask {
    this.data.deliveryTasks.unshift(task);
    this.persist();
    return task;
  }

  public updateDeliveryTask(id: string, updates: Partial<DeliveryTask>): DeliveryTask | undefined {
    const idx = this.data.deliveryTasks.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    this.data.deliveryTasks[idx] = { ...this.data.deliveryTasks[idx], ...updates };
    this.persist();
    return this.data.deliveryTasks[idx];
  }

  // Coupons
  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public getCouponByCode(code: string): Coupon | undefined {
    return this.data.coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
  }

  // Notifications
  public getNotifications(userId: string): Notification[] {
    return this.data.notifications.filter((n) => n.userId === userId);
  }

  public addNotification(notification: Notification): Notification {
    this.data.notifications.unshift(notification);
    this.persist();
    return notification;
  }

  public markNotificationAsRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id && n.userId === userId);
    if (notif) {
      notif.isRead = true;
      this.persist();
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.data.notifications.forEach((n) => {
      if (n.userId === userId) n.isRead = true;
    });
    this.persist();
  }

  // Reviews
  public getReviews(canteenId?: string): Review[] {
    if (canteenId) {
      return this.data.reviews.filter((r) => r.canteenId === canteenId);
    }
    return this.data.reviews;
  }

  public addReview(review: Review): Review {
    this.data.reviews.unshift(review);
    // Recalculate canteen rating
    const canteenReviews = this.data.reviews.filter((r) => r.canteenId === review.canteenId);
    const avg = canteenReviews.reduce((sum, r) => sum + r.rating, 0) / canteenReviews.length;
    const canteen = this.data.canteens.find((c) => c.id === review.canteenId);
    if (canteen) {
      canteen.rating = Math.round(avg * 10) / 10;
      canteen.ratingCount = canteenReviews.length;
    }
    this.persist();
    return review;
  }

  // Support Tickets
  public getSupportTickets(userId?: string): SupportTicket[] {
    if (userId) {
      return this.data.supportTickets.filter((t) => t.userId === userId);
    }
    return this.data.supportTickets;
  }

  public createSupportTicket(ticket: SupportTicket): SupportTicket {
    this.data.supportTickets.unshift(ticket);
    this.persist();
    return ticket;
  }

  public updateSupportTicket(id: string, updates: Partial<SupportTicket>): SupportTicket | undefined {
    const idx = this.data.supportTickets.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    this.data.supportTickets[idx] = { ...this.data.supportTickets[idx], ...updates };
    this.persist();
    return this.data.supportTickets[idx];
  }

  // Campus Zones
  public getCampusZones(): CampusDeliveryZone[] {
    return this.data.campusZones;
  }
}

export const db = new Database();
