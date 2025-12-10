const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://dohelmoto:dohelmoto123@db:5432/dohelmoto',
  ssl: false
});

const seedData = async () => {
  try {
    // Create admin user
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO users (email, password, name, phone, role) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (email) DO UPDATE SET role = 'admin'`,
      ['admin@dohelmoto.com', adminPassword, 'מנהל מערכת', '0500000000', 'admin']
    );
    console.log('Admin user created: admin@dohelmoto.com / admin123');

    // Categories
    const categories = [
      { name: 'Engines', name_he: 'מנועים', description: 'Engine parts and components' },
      { name: 'Transmission', name_he: 'תמסורת', description: 'Transmission and gearbox parts' },
      { name: 'Suspension', name_he: 'מתלים', description: 'Suspension components' },
      { name: 'Brakes', name_he: 'בלמים', description: 'Brake system parts' },
      { name: 'Electrical', name_he: 'חשמל', description: 'Electrical components' },
      { name: 'Body Parts', name_he: 'חלקי גוף', description: 'Body and frame parts' },
      { name: 'Filters', name_he: 'מסננים', description: 'Air, oil, and fuel filters' },
      { name: 'Tires & Wheels', name_he: 'צמיגים וגלגלים', description: 'Tires and wheels' },
    ];

    for (const cat of categories) {
      await pool.query(
        'INSERT INTO categories (name, name_he, description) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [cat.name, cat.name_he, cat.description]
      );
    }

    // Get category IDs
    const catResult = await pool.query('SELECT id, name_he FROM categories');
    const categoryMap = {};
    catResult.rows.forEach(cat => {
      categoryMap[cat.name_he] = cat.id;
    });

    // Products
    const products = [
      {
        name: 'Engine Oil Filter',
        name_he: 'מסנן שמן מנוע',
        description: 'High-quality engine oil filter for tractors',
        description_he: 'מסנן שמן מנוע איכותי לטרקטורונים',
        price: 45.90,
        category_id: categoryMap['מסננים'],
        sku: 'FIL-001',
        brand: 'DohelMoto',
        stock: 50,
        compatible_models: ['Yamaha YFZ450', 'Honda TRX450']
      },
      {
        name: 'Brake Pad Set',
        name_he: 'סט רפידות בלם',
        description: 'Premium brake pads for off-road vehicles',
        description_he: 'רפידות בלם פרימיום לכלי שטח',
        price: 120.00,
        category_id: categoryMap['בלמים'],
        sku: 'BRK-001',
        brand: 'DohelMoto',
        stock: 30,
        compatible_models: ['Polaris RZR', 'Can-Am Maverick']
      },
      {
        name: 'Shock Absorber',
        name_he: 'בולם זעזועים',
        description: 'Heavy-duty shock absorber for rough terrain',
        description_he: 'בולם זעזועים כבד לשטח קשה',
        price: 350.00,
        category_id: categoryMap['מתלים'],
        sku: 'SUS-001',
        brand: 'DohelMoto',
        stock: 20,
        compatible_models: ['Kawasaki KFX', 'Suzuki LTZ']
      },
      {
        name: 'Air Filter',
        name_he: 'מסנן אוויר',
        description: 'High-performance air filter',
        description_he: 'מסנן אוויר ביצועים גבוהים',
        price: 35.50,
        category_id: categoryMap['מסננים'],
        sku: 'FIL-002',
        brand: 'DohelMoto',
        stock: 40,
        compatible_models: ['All Models']
      },
      {
        name: 'Clutch Kit',
        name_he: 'ערכת מצמד',
        description: 'Complete clutch kit with plates and springs',
        description_he: 'ערכת מצמד מלאה עם לוחות וקפיצים',
        price: 280.00,
        category_id: categoryMap['תמסורת'],
        sku: 'TRN-001',
        brand: 'DohelMoto',
        stock: 15,
        compatible_models: ['Yamaha YFZ450', 'Honda TRX450']
      },
      {
        name: 'Spark Plug Set',
        name_he: 'סט נרות הצתה',
        description: 'Iridium spark plugs for better performance',
        description_he: 'נרות הצתה אירידיום לביצועים משופרים',
        price: 55.00,
        category_id: categoryMap['מנועים'],
        sku: 'ENG-001',
        brand: 'DohelMoto',
        stock: 60,
        compatible_models: ['All Models']
      },
      {
        name: 'Battery 12V',
        name_he: 'סוללה 12V',
        description: 'High-capacity 12V battery for ATVs',
        description_he: 'סוללה 12V קיבולת גבוהה לכלי שטח',
        price: 180.00,
        category_id: categoryMap['חשמל'],
        sku: 'ELC-001',
        brand: 'DohelMoto',
        stock: 25,
        compatible_models: ['All Models']
      },
      {
        name: 'Front Fender',
        name_he: 'מגן קדמי',
        description: 'Durable front fender for protection',
        description_he: 'מגן קדמי עמיד להגנה',
        price: 95.00,
        category_id: categoryMap['חלקי גוף'],
        sku: 'BDY-001',
        brand: 'DohelMoto',
        stock: 35,
        compatible_models: ['Polaris RZR', 'Can-Am Maverick']
      },
      {
        name: 'ATV Tire Set',
        name_he: 'סט צמיגים',
        description: 'All-terrain tire set (4 tires)',
        description_he: 'סט צמיגים לכל השטח (4 צמיגים)',
        price: 450.00,
        category_id: categoryMap['צמיגים וגלגלים'],
        sku: 'TIR-001',
        brand: 'DohelMoto',
        stock: 12,
        compatible_models: ['All Models']
      },
      {
        name: 'Radiator',
        name_he: 'רדיאטור',
        description: 'Aluminum radiator for efficient cooling',
        description_he: 'רדיאטור אלומיניום לקירור יעיל',
        price: 320.00,
        category_id: categoryMap['מנועים'],
        sku: 'ENG-002',
        brand: 'DohelMoto',
        stock: 18,
        compatible_models: ['Yamaha YFZ450', 'Honda TRX450']
      },
    ];

    for (const product of products) {
      await pool.query(
        `INSERT INTO products (name, name_he, description, description_he, price, category_id, sku, brand, stock, compatible_models) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (sku) DO NOTHING`,
        [
          product.name,
          product.name_he,
          product.description,
          product.description_he,
          product.price,
          product.category_id,
          product.sku,
          product.brand,
          product.stock,
          product.compatible_models
        ]
      );
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();

