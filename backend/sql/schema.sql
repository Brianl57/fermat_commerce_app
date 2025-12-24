PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT,
  description TEXT,
  price REAL,
  category TEXT,
  brand TEXT,
  rating REAL,
  inStock INTEGER,   -- 0=false / 1=true --
  imageUrl TEXT
);

CREATE TABLE IF NOT EXISTS product_tags (
  productId TEXT,
  tag TEXT,
  PRIMARY KEY (productId, tag),
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  orderId TEXT PRIMARY KEY,
  date TEXT,
  customerId TEXT,
  total REAL
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orderId TEXT,
  productId TEXT,
  quantity INTEGER,
  price REAL,
  FOREIGN KEY (orderId) REFERENCES orders(orderId) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id)
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

CREATE INDEX IF NOT EXISTS idx_product_tags_tag ON product_tags(tag);
CREATE INDEX IF NOT EXISTS idx_product_tags_productId ON product_tags(productId);

CREATE INDEX IF NOT EXISTS idx_order_items_productId ON order_items(productId);
CREATE INDEX IF NOT EXISTS idx_order_items_orderId ON order_items(orderId);
