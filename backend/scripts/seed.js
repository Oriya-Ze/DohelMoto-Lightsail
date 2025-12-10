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

    // Create test admin user
    const testAdminPassword = await bcrypt.hash('test123', 10);
    await pool.query(
      `INSERT INTO users (email, password, name, phone, role) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (email) DO UPDATE SET role = 'admin'`,
      ['test@dohelmoto.com', testAdminPassword, 'מנהל בדיקה', '0501234567', 'admin']
    );
    console.log('Test Admin user created: test@dohelmoto.com / test123');

    // Vehicles catalog
    const vehicles = [
      // Yamaha
      { brand: 'Yamaha', brand_he: 'יאמאהא', model: 'YFZ450', model_he: 'YFZ450', type: 'ATV' },
      { brand: 'Yamaha', brand_he: 'יאמאהא', model: 'Raptor 700', model_he: 'Raptor 700', type: 'ATV' },
      { brand: 'Yamaha', brand_he: 'יאמאהא', model: 'Grizzly 700', model_he: 'Grizzly 700', type: 'ATV' },
      { brand: 'Yamaha', brand_he: 'יאמאהא', model: 'Wolverine', model_he: 'Wolverine', type: 'UTV' },
      // Honda
      { brand: 'Honda', brand_he: 'הונדה', model: 'TRX450R', model_he: 'TRX450R', type: 'ATV' },
      { brand: 'Honda', brand_he: 'הונדה', model: 'TRX500', model_he: 'TRX500', type: 'ATV' },
      { brand: 'Honda', brand_he: 'הונדה', model: 'Pioneer 1000', model_he: 'Pioneer 1000', type: 'UTV' },
      { brand: 'Honda', brand_he: 'הונדה', model: 'Rancher', model_he: 'Rancher', type: 'ATV' },
      // Polaris
      { brand: 'Polaris', brand_he: 'פולאריס', model: 'RZR 1000', model_he: 'RZR 1000', type: 'UTV' },
      { brand: 'Polaris', brand_he: 'פולאריס', model: 'Sportsman 850', model_he: 'Sportsman 850', type: 'ATV' },
      { brand: 'Polaris', brand_he: 'פולאריס', model: 'Ranger', model_he: 'Ranger', type: 'UTV' },
      // Can-Am
      { brand: 'Can-Am', brand_he: 'קן-אם', model: 'Maverick X3', model_he: 'Maverick X3', type: 'UTV' },
      { brand: 'Can-Am', brand_he: 'קן-אם', model: 'Outlander', model_he: 'Outlander', type: 'ATV' },
      { brand: 'Can-Am', brand_he: 'קן-אם', model: 'Renegade', model_he: 'Renegade', type: 'ATV' },
      // Kawasaki
      { brand: 'Kawasaki', brand_he: 'קאווסאקי', model: 'KFX450R', model_he: 'KFX450R', type: 'ATV' },
      { brand: 'Kawasaki', brand_he: 'קאווסאקי', model: 'Brute Force', model_he: 'Brute Force', type: 'ATV' },
      { brand: 'Kawasaki', brand_he: 'קאווסאקי', model: 'Teryx', model_he: 'Teryx', type: 'UTV' },
      // Suzuki
      { brand: 'Suzuki', brand_he: 'סוזוקי', model: 'LTZ400', model_he: 'LTZ400', type: 'ATV' },
      { brand: 'Suzuki', brand_he: 'סוזוקי', model: 'KingQuad', model_he: 'KingQuad', type: 'ATV' },
    ];

    for (const vehicle of vehicles) {
      await pool.query(
        `INSERT INTO vehicles (brand, brand_he, model, model_he, type) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT DO NOTHING`,
        [vehicle.brand, vehicle.brand_he, vehicle.model, vehicle.model_he, vehicle.type]
      );
    }
    console.log('Vehicles catalog seeded');

    // Categories
    const categories = [
      { name: 'Tires', name_he: 'צמיגים', description: 'צמיגים לכלי שטח' },
      { name: 'Plastic Parts', name_he: 'חלקי פלסטיק', description: 'חלקי פלסטיק וגוף' },
      { name: 'Spare Parts', name_he: 'חלקי חילוף', description: 'חלקי חילוף כלליים' },
      { name: 'Accessories', name_he: 'אביזרים', description: 'אביזרים וציוד נלווה' },
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
        name: 'ATV Tire Set',
        name_he: 'סט צמיגים לכל השטח',
        description: 'All-terrain tire set (4 tires)',
        description_he: 'סט צמיגים לכל השטח (4 צמיגים) - איכות מעולה',
        price: 450.00,
        category_id: categoryMap['צמיגים'],
        sku: 'TIR-001',
        brand: 'DohelMoto',
        stock: 12,
        compatible_models: ['Yamaha', 'YFZ450', 'Honda', 'TRX450R', 'Polaris', 'RZR 1000']
      },
      {
        name: 'Front Fender',
        name_he: 'מגן קדמי',
        description: 'Durable front fender for protection',
        description_he: 'מגן קדמי עמיד להגנה מפני בוץ ואבק',
        price: 95.00,
        category_id: categoryMap['חלקי פלסטיק'],
        sku: 'PLA-001',
        brand: 'DohelMoto',
        stock: 35,
        compatible_models: ['Polaris', 'RZR 1000', 'Can-Am', 'Maverick X3']
      },
      {
        name: 'Rear Fender',
        name_he: 'מגן אחורי',
        description: 'Durable rear fender',
        description_he: 'מגן אחורי עמיד',
        price: 85.00,
        category_id: categoryMap['חלקי פלסטיק'],
        sku: 'PLA-002',
        brand: 'DohelMoto',
        stock: 30,
        compatible_models: ['Yamaha', 'YFZ450', 'Honda', 'TRX450R']
      },
      {
        name: 'Engine Oil Filter',
        name_he: 'מסנן שמן מנוע',
        description: 'High-quality engine oil filter',
        description_he: 'מסנן שמן מנוע איכותי לטרקטורונים',
        price: 45.90,
        category_id: categoryMap['חלקי חילוף'],
        sku: 'FIL-001',
        brand: 'DohelMoto',
        stock: 50,
        compatible_models: ['Yamaha', 'YFZ450', 'Honda', 'TRX450R']
      },
      {
        name: 'Brake Pad Set',
        name_he: 'סט רפידות בלם',
        description: 'Premium brake pads for off-road vehicles',
        description_he: 'רפידות בלם פרימיום לכלי שטח',
        price: 120.00,
        category_id: categoryMap['חלקי חילוף'],
        sku: 'BRK-001',
        brand: 'DohelMoto',
        stock: 30,
        compatible_models: ['Polaris', 'RZR 1000', 'Can-Am', 'Maverick X3']
      },
      {
        name: 'Shock Absorber',
        name_he: 'בולם זעזועים',
        description: 'Heavy-duty shock absorber for rough terrain',
        description_he: 'בולם זעזועים כבד לשטח קשה',
        price: 350.00,
        category_id: categoryMap['חלקי חילוף'],
        sku: 'SUS-001',
        brand: 'DohelMoto',
        stock: 20,
        compatible_models: ['Kawasaki', 'KFX450R', 'Suzuki', 'LTZ400']
      },
      {
        name: 'Air Filter',
        name_he: 'מסנן אוויר',
        description: 'High-performance air filter',
        description_he: 'מסנן אוויר ביצועים גבוהים',
        price: 35.50,
        category_id: categoryMap['חלקי חילוף'],
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
        category_id: categoryMap['חלקי חילוף'],
        sku: 'TRN-001',
        brand: 'DohelMoto',
        stock: 15,
        compatible_models: ['Yamaha', 'YFZ450', 'Honda', 'TRX450R']
      },
      {
        name: 'Spark Plug Set',
        name_he: 'סט נרות הצתה',
        description: 'Iridium spark plugs for better performance',
        description_he: 'נרות הצתה אירידיום לביצועים משופרים',
        price: 55.00,
        category_id: categoryMap['חלקי חילוף'],
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
        category_id: categoryMap['חלקי חילוף'],
        sku: 'ELC-001',
        brand: 'DohelMoto',
        stock: 25,
        compatible_models: ['All Models']
      },
      {
        name: 'Radiator',
        name_he: 'רדיאטור',
        description: 'Aluminum radiator for efficient cooling',
        description_he: 'רדיאטור אלומיניום לקירור יעיל',
        price: 320.00,
        category_id: categoryMap['חלקי חילוף'],
        sku: 'ENG-002',
        brand: 'DohelMoto',
        stock: 18,
        compatible_models: ['Yamaha', 'YFZ450', 'Honda', 'TRX450R']
      },
      {
        name: 'Winch',
        name_he: 'מגבה',
        description: 'Heavy-duty winch for recovery',
        description_he: 'מגבה כבד לחילוץ',
        price: 850.00,
        category_id: categoryMap['אביזרים'],
        sku: 'ACC-001',
        brand: 'DohelMoto',
        stock: 8,
        compatible_models: ['Polaris', 'RZR 1000', 'Can-Am', 'Maverick X3']
      },
      {
        name: 'LED Light Bar',
        name_he: 'פנס לד',
        description: 'Bright LED light bar for night riding',
        description_he: 'פנס לד בהיר לנסיעה בלילה',
        price: 320.00,
        category_id: categoryMap['אביזרים'],
        sku: 'ACC-002',
        brand: 'DohelMoto',
        stock: 15,
        compatible_models: ['All Models']
      },
      {
        name: 'Storage Box',
        name_he: 'תיבת אחסון',
        description: 'Waterproof storage box',
        description_he: 'תיבת אחסון אטומה למים',
        price: 180.00,
        category_id: categoryMap['אביזרים'],
        sku: 'ACC-003',
        brand: 'DohelMoto',
        stock: 20,
        compatible_models: ['Polaris', 'RZR 1000', 'Can-Am', 'Maverick X3']
      },
      {
        name: 'Handlebar Grips',
        name_he: 'ידיות כידון',
        description: 'Comfortable handlebar grips',
        description_he: 'ידיות כידון נוחות',
        price: 45.00,
        category_id: categoryMap['אביזרים'],
        sku: 'ACC-004',
        brand: 'DohelMoto',
        stock: 40,
        compatible_models: ['All Models']
      },
      {
        name: 'Side Panels',
        name_he: 'לוחות צד',
        description: 'Replacement side panels',
        description_he: 'לוחות צד חלופיים',
        price: 120.00,
        category_id: categoryMap['חלקי פלסטיק'],
        sku: 'PLA-003',
        brand: 'DohelMoto',
        stock: 25,
        compatible_models: ['Yamaha', 'YFZ450', 'Honda', 'TRX450R']
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

