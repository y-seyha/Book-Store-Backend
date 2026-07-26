import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [__dirname + '/common/entities/*.entity{.ts,.js}'],
    synchronize: true,
    ssl: { rejectUnauthorized: false },
  });

  await ds.initialize();
  console.log('Connected, seeding...');

  // ----- REPOS -----
  const userRepo = ds.getRepository('User');
  const accountRepo = ds.getRepository('Account');
  const categoryRepo = ds.getRepository('Category');
  const productRepo = ds.getRepository('Product');
  const orderRepo = ds.getRepository('Order');
  const orderItemRepo = ds.getRepository('OrderItem');
  const paymentRepo = ds.getRepository('Payment');
  const reviewRepo = ds.getRepository('Review');
  const sellerRepo = ds.getRepository('Seller');
  const driverProfileRepo = ds.getRepository('DriverProfile');
  const deliveryTrackingRepo = ds.getRepository('DeliveryTracking');

  // ----- CLEAN UP existing data (reverse FK order) -----
  await ds.query(`TRUNCATE delivery_tracking, reviews, payments, order_items, orders, products, categories, sellers, driver_profiles, accounts, users CASCADE`);
  // console.log('  Cleaned existing data');

  const hash = await bcrypt.hash('password123', 10);

  const usersData = [
    { email: 'admin@bookstore.com', first_name: 'Admin', last_name: 'User', role: 'admin', is_verified: true },
    { email: 'alice@example.com', first_name: 'Alice', last_name: 'Johnson', role: 'customer', is_verified: true },
    { email: 'bob@example.com', first_name: 'Bob', last_name: 'Smith', role: 'customer', is_verified: true },
    { email: 'carol@example.com', first_name: 'Carol', last_name: 'Davis', role: 'customer', is_verified: true },
    { email: 'dave@example.com', first_name: 'Dave', last_name: 'Wilson', role: 'customer', is_verified: false },
    { email: 'eve@example.com', first_name: 'Eve', last_name: 'Brown', role: 'customer', is_verified: true },
    { email: 'seller1@bookstore.com', first_name: 'Sarah', last_name: 'Books', role: 'seller', is_verified: true },
    { email: 'seller2@bookstore.com', first_name: 'Tom', last_name: 'Pages', role: 'seller', is_verified: true },
    { email: 'seller3@bookstore.com', first_name: 'Lisa', last_name: 'Reads', role: 'seller', is_verified: false },
    { email: 'driver1@bookstore.com', first_name: 'Mike', last_name: 'Wheels', role: 'driver', is_verified: true },
    { email: 'driver2@bookstore.com', first_name: 'Jenny', last_name: 'Drive', role: 'driver', is_verified: true },
  ];

  const users = await userRepo.save(usersData.map(u => userRepo.create(u)));

  // ----- ACCOUNTS (password hashes) -----
  for (const user of users) {
    const existing = await accountRepo.findOne({ where: { user: { id: user.id }, provider: 'local' } });
    if (!existing) {
      await accountRepo.save(accountRepo.create({
        user,
        provider: 'local',
        provider_account_id: user.id,
        password_hash: hash,
      }));
    }
  }

  // console.log(`  Created ${users.length} users + accounts`);

  // ----- CATEGORIES -----
  const categoriesData = [
    { name: 'Fiction', description: 'Novels, stories, and imaginative literature' },
    { name: 'Non-Fiction', description: 'Factual books covering real-world topics' },
    { name: 'Science', description: 'Physics, biology, chemistry, and more' },
    { name: 'Technology', description: 'Programming, engineering, and digital topics' },
    { name: 'History', description: 'World history, biographies, and historical accounts' },
    { name: 'Art', description: 'Painting, sculpture, photography, and design' },
  ];
  const categories = await categoryRepo.save(categoriesData.map(c => categoryRepo.create(c)));
  // console.log(`  Created ${categories.length} categories`);

  // ----- PRODUCTS -----
  const sellerIds = users.filter(u => u.role === 'seller').map(u => u.id);

  const productsData = [
    { name: 'The Great Adventure', price: 14.99, stock: 25, categoryIdx: 0, sellerIdx: 0 },
    { name: 'Mystery of the Night', price: 12.99, stock: 30, categoryIdx: 0, sellerIdx: 0 },
    { name: 'Love in Paris', price: 11.99, stock: 0, categoryIdx: 0, sellerIdx: 1 },
    { name: 'The Silent Guardian', price: 16.99, stock: 15, categoryIdx: 0, sellerIdx: 1 },
    { name: 'Beyond the Stars', price: 19.99, stock: 20, categoryIdx: 0, sellerIdx: 2 },

    { name: 'A Brief History of Time', price: 24.99, stock: 18, categoryIdx: 1, sellerIdx: 0 },
    { name: 'The Art of War', price: 9.99, stock: 40, categoryIdx: 1, sellerIdx: 1 },
    { name: 'Sapiens: A Brief History', price: 21.99, stock: 12, categoryIdx: 1, sellerIdx: 2 },

    { name: 'Quantum Mechanics', price: 34.99, stock: 8, categoryIdx: 2, sellerIdx: 0 },
    { name: 'The Selfish Gene', price: 18.99, stock: 22, categoryIdx: 2, sellerIdx: 1 },

    { name: 'Clean Code', price: 39.99, stock: 10, categoryIdx: 3, sellerIdx: 0 },
    { name: 'Design Patterns', price: 44.99, stock: 5, categoryIdx: 3, sellerIdx: 2 },

    { name: 'The Rise and Fall', price: 28.99, stock: 14, categoryIdx: 4, sellerIdx: 1 },
    { name: 'Ancient Civilizations', price: 32.99, stock: 7, categoryIdx: 4, sellerIdx: 0 },

    { name: 'The Story of Art', price: 49.99, stock: 3, categoryIdx: 5, sellerIdx: 2 },
  ];

  const products = await productRepo.save(
    productsData.map(p =>
      productRepo.create({
        name: p.name,
        price: p.price,
        stock: p.stock,
        category: { id: categories[p.categoryIdx].id },
        category_id: categories[p.categoryIdx].id,
        user: { id: sellerIds[p.sellerIdx] },
        user_id: sellerIds[p.sellerIdx],
        description: `A great book titled "${p.name}"`,
        image_url: null,
      })
    )
  );
  // console.log(`  Created ${products.length} products`);

  // ----- HISTORICAL ORDERS (Jan 2022 – Jul 2026) -----
  const customerIds = users.filter(u => u.role === 'customer').map(u => u.id);
  const orderStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];
  const paymentMethods = ['cod', 'aba', 'card'];

  const startDate = new Date('2022-01-01');
  const endDate = new Date();
  const totalMonths =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth()) +
    1;

  const allOrdersData: any[] = [];
  for (let m = 0; m < totalMonths; m++) {
    const year = startDate.getFullYear() + Math.floor((startDate.getMonth() + m) / 12);
    const month = (startDate.getMonth() + m) % 12;
    const ordersThisMonth = 2 + Math.floor(Math.random() * 4); // 2–5 orders per month

    for (let o = 0; o < ordersThisMonth; o++) {
      const day = 1 + Math.floor(Math.random() * 25);
      const created = new Date(year, month, day, 10 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
      if (created > endDate) continue;

      const statusRoll = Math.random();
      const status = statusRoll < 0.6 ? 'completed' : statusRoll < 0.8 ? 'paid' : statusRoll < 0.9 ? 'shipped' : 'cancelled';

      allOrdersData.push({
        user: { id: customerIds[Math.floor(Math.random() * customerIds.length)] },
        total_price: '0',
        status,
        shipping_name: 'Test Shipping',
        shipping_phone: '0123456789',
        shipping_address: '123 Book St',
        shipping_city: 'Phnom Penh',
        created_at: created,
      });
    }
  }

  console.log(`  Generating ${allOrdersData.length} historical orders...`);
  const orders = await orderRepo.save(allOrdersData.map(o => orderRepo.create(o)));

  // ----- ORDER ITEMS + PAYMENTS (per order) -----
  const orderItemsData: any[] = [];
  const paymentsData: any[] = [];
  let totalAmount = 0;

  for (const order of orders) {
    const itemCount = 1 + Math.floor(Math.random() * 3);
    let orderTotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const qty = 1 + Math.floor(Math.random() * 3);
      const price = Number(product.price) * qty;
      orderTotal += price;

      orderItemsData.push({
        order: { id: order.id },
        product: { id: product.id },
        quantity: qty,
        price: price.toFixed(2),
        status: 'fulfilled',
      });
    }

    order.total_price = orderTotal.toFixed(2);
    totalAmount += orderTotal;
    await orderRepo.save(order);

    // Payment (80% success, 10% pending, 10% failed)
    const payRoll = Math.random();
    let payStatus = 'pending';
    let paidAt: Date | null = null;

    if (payRoll < 0.8) {
      payStatus = 'success';
      paidAt = new Date(order.created_at.getTime() + 1000 * 60 * 60 * (1 + Math.floor(Math.random() * 24)));
    } else if (payRoll < 0.9) {
      payStatus = 'pending';
    } else {
      payStatus = 'failed';
    }

    paymentsData.push({
      order: { id: order.id },
      amount: order.total_price,
      method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      status: payStatus,
      paid_at: paidAt,
    });
  }

  await orderItemRepo.save(orderItemsData.map(oi => orderItemRepo.create(oi)));
  await paymentRepo.save(paymentsData.map(p => paymentRepo.create(p)));
  console.log(`  Created ${orders.length} orders, ${orderItemsData.length} items, ${paymentsData.length} payments`);

  // ----- REVIEWS -----
  const reviewsData = [
    { rating: 5, comment: 'Excellent book! Highly recommend.', userIdx: 1, productIdx: 0 },
    { rating: 4, comment: 'Great read, very engaging.', userIdx: 2, productIdx: 1 },
    { rating: 3, comment: 'Decent book but could be better.', userIdx: 3, productIdx: 2 },
    { rating: 5, comment: 'Changed my perspective on things.', userIdx: 4, productIdx: 4 },
    { rating: 4, comment: 'Well written and informative.', userIdx: 1, productIdx: 6 },
    { rating: 2, comment: 'Not what I expected, but okay.', userIdx: 2, productIdx: 10 },
    { rating: 5, comment: 'Masterpiece! A must-read.', userIdx: 3, productIdx: 8 },
    { rating: 4, comment: 'Beautifully illustrated and detailed.', userIdx: 4, productIdx: 14 },
  ];

  const savedReviews = await reviewRepo.save(
    reviewsData.map(r =>
      reviewRepo.create({
        user: { id: customerIds[r.userIdx] },
        product: { id: products[r.productIdx].id },
        rating: r.rating,
        comment: r.comment,
      })
    )
  );
  console.log(`  Created ${savedReviews.length} reviews`);

  // ----- SELLER PROFILES -----
  const sellerProfilesData = [
    { userIdx: 6, store_name: 'Sarah\'s Book Nook', store_description: 'Curated fiction and science books', store_address: '234 Fiction Lane', phone: '011111111' },
    { userIdx: 7, store_name: 'Tom\'s Pages', store_description: 'Non-fiction and history books', store_address: '456 Knowledge Road', phone: '022222222' },
    { userIdx: 8, store_name: 'Lisa\'s Reads', store_description: 'Tech, science, and art books', store_address: '789 Innovation Blvd', phone: '033333333' },
  ];

  for (const sp of sellerProfilesData) {
    const existing = await sellerRepo.findOne({ where: { user: { id: users[sp.userIdx].id } } });
    if (!existing) {
      await sellerRepo.save(sellerRepo.create({
        user: { id: users[sp.userIdx].id },
        store_name: sp.store_name,
        store_description: sp.store_description,
        store_address: sp.store_address,
        phone: sp.phone,
        logo_url: null,
      }));
    }
  }
  console.log(`  Created ${sellerProfilesData.length} seller profiles`);

  // ----- DRIVER PROFILES -----
  const driverProfilesData = [
    { userIdx: 9, plate_number: 'PP-1234', vehicle_type: 'Motorbike', is_available: true },
    { userIdx: 10, plate_number: 'PP-5678', vehicle_type: 'Van', is_available: false },
  ];

  for (const dp of driverProfilesData) {
    const existing = await driverProfileRepo.findOne({ where: { user: { id: users[dp.userIdx].id } } });
    if (!existing) {
      await driverProfileRepo.save(driverProfileRepo.create({
        user: { id: users[dp.userIdx].id },
        plate_number: dp.plate_number,
        vehicle_type: dp.vehicle_type,
        is_available: dp.is_available,
      }));
    }
  }
  console.log(`  Created ${driverProfilesData.length} driver profiles`);

  // ----- DELIVERY TRACKING (for completed/paid orders) -----
  const deliverableOrders = orders.filter(o => o.status === 'completed' || o.status === 'shipped' || o.status === 'paid');
  for (const order of deliverableOrders) {
    const existing = await deliveryTrackingRepo.findOne({ where: { order: { id: order.id } } });
    if (!existing) {
      const driver = (await driverProfileRepo.find())[0];
      await deliveryTrackingRepo.save(deliveryTrackingRepo.create({
        order: { id: order.id },
        order_id: order.id,
        status: order.status === 'completed' ? 'delivered' : 'on_the_way',
        result: order.status === 'completed' ? 'success' : null,
        driverProfile: driver ?? null,
      }));
    }
  }
  console.log(`  Created delivery tracking entries`);

  await ds.destroy();
  console.log('\n✅ Seed complete!');
  console.log('   Admin login: admin@bookstore.com / password123');
  console.log('   Customer login: alice@example.com / password123');
  console.log('   Seller login: seller1@bookstore.com / password123');
  console.log('   Driver login: driver1@bookstore.com / password123');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
