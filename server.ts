import express from "express";
import cors from "cors";
import path from "path";
import dns from "dns";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Import file-based database model
import {
  initDB,
  getDB,
  writeDB,
  User,
  Customer,
  CustomerNote,
  CustomerTimeline,
  Product,
  Category,
  Supplier,
  Order,
  OrderItem,
  InventoryHistory,
  Employee,
  FinanceRecord
} from "./server/db.js";

// Define server port & runtime host
const PORT = 3000;
const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "fashionhub_cloud_enterprise_secure_token_secret_system_2026";

// Initialize data persistence
initDB();

// Global secure configurations
app.use(cors());
app.use(express.json());

// Set secure response headers to satisfy Helmet guidelines manually & portably
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

// Simple request logging for auditability
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Express auth request injection interface
interface AuthRequest extends express.Request {
  user?: {
    id: number;
    email: string;
    role: "Admin" | "Manager" | "Employee";
    full_name: string;
  };
}

// Token Verification Middleware
function authenticateToken(req: AuthRequest, res: express.Response, next: express.NextFunction): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token required. Please sign in." });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ error: "Session expired or invalid token. Please log in again." });
      return;
    }
    req.user = decoded;
    next();
  });
}

// Role Authorization Middleware Helper
function requireRole(allowedRoles: ("Admin" | "Manager" | "Employee")[]) {
  return (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized access." });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access Denied: Your role (${req.user.role}) has insufficient privileges for this operation.`
      });
      return;
    }
    next();
  };
}

// =========================================================================
// 🗝️ AUTH SERVICE ENDPOINTS
// =========================================================================

// POST /api/auth/register
app.post("/api/auth/register", (req, res) => {
  const { full_name, email, password, role } = req.body;

  if (!full_name || !email || !password) {
    res.status(400).json({ error: "All profile fields are required for onboarding." });
    return;
  }

  const dbState = getDB();
  const existing = dbState.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(400).json({ error: "An account with this email address has already been initialized." });
    return;
  }

  // Hash password using secure bcrypt configuration
  const password_hash = bcrypt.hashSync(password, 10);
  const userRole = role && ["Admin", "Manager", "Employee"].includes(role) ? role : "Employee";

  const newUser: User = {
    id: dbState.users.length > 0 ? Math.max(...dbState.users.map(u => u.id)) + 1 : 1,
    full_name,
    email: email.toLowerCase(),
    password_hash,
    role: userRole,
    created_at: new Date().toISOString()
  };

  dbState.users.push(newUser);
  writeDB();

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, full_name: newUser.full_name },
    JWT_SECRET,
    { expiresIn: "12h" }
  );

  res.status(201).json({
    message: "Registration completed successfully.",
    token,
    user: {
      id: newUser.id,
      full_name: newUser.full_name,
      email: newUser.email,
      role: newUser.role,
      created_at: newUser.created_at
    }
  });
});

// POST /api/auth/login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Please enter your email and password." });
    return;
  }

  const dbState = getDB();
  const user = dbState.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: "Invalid credentials. Please verify your email or password." });
    return;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: "12h" }
  );

  res.json({
    message: "Authentication successful.",
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    }
  });
});

// GET /api/auth/me (Get profile content)
app.get("/api/auth/me", authenticateToken, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/profile (Update account setting)
app.put("/api/auth/profile", authenticateToken, (req: AuthRequest, res) => {
  const { full_name, email, current_password, new_password } = req.body;
  const dbState = getDB();
  const userIdx = dbState.users.findIndex(u => u.id === req.user?.id);

  if (userIdx === -1) {
    res.status(404).json({ error: "User account context not active in memory." });
    return;
  }

  const user = dbState.users[userIdx];

  // If password changes are being requested
  if (current_password || new_password) {
    if (!current_password || !new_password) {
      res.status(400).json({ error: "Both current password and new password are required for update security verification." });
      return;
    }
    if (!bcrypt.compareSync(current_password, user.password_hash)) {
      res.status(400).json({ error: "Current password validation failed." });
      return;
    }
    user.password_hash = bcrypt.hashSync(new_password, 10);
  }

  if (full_name) user.full_name = full_name;
  if (email && email.toLowerCase() !== user.email) {
    const emailConflict = dbState.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== user.id);
    if (emailConflict) {
      res.status(400).json({ error: "Email address is already configured for another account." });
      return;
    }
    user.email = email.toLowerCase();
  }

  writeDB();

  // Create new active token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: "12h" }
  );

  res.json({
    message: "Profile settings modified successfully.",
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    }
  });
});

// =========================================================================
// 📈 SYSTEM DASHBOARD ANALYTICS ENDPOINTS
// =========================================================================

app.get("/api/dashboard/summary", authenticateToken, (req, res) => {
  const dbState = getDB();

  // Sum calculations
  const totalCustomers = dbState.customers.length;
  const totalProducts = dbState.products.length;
  const totalOrders = dbState.orders.length;
  const totalEmployees = dbState.employees.length;

  const totalRevenue = dbState.finances
    .filter(f => f.type === "Income")
    .reduce((sum, current) => sum + current.amount, 0);

  const totalExpenses = dbState.finances
    .filter(f => f.type === "Expense")
    .reduce((sum, current) => sum + current.amount, 0);

  const totalProfit = totalRevenue - totalExpenses;

  // Track growth indices (mock dynamic indicators with base trends)
  res.json({
    metrics: {
      customers: { count: totalCustomers, growth: "+12.4%", trend: "up" },
      products: { count: totalProducts, growth: "+4.1%", trend: "up" },
      orders: { count: totalOrders, growth: "+8.9%", trend: "up" },
      revenue: { amount: totalRevenue, growth: "+15.2%", trend: "up" },
      employees: { count: totalEmployees, growth: "+2.3%", trend: "up" },
      profit: { amount: totalProfit, growth: "+18.7%", trend: "up" }
    }
  });
});

// =========================================================================
// 👤 CRM CUSTOMER SERVICE LAYER ENDPOINTS
// =========================================================================

// GET /api/crm/customers
app.get("/api/crm/customers", authenticateToken, (req, res) => {
  const { search, status } = req.query;
  let list = [...getDB().customers];

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(
      c =>
        c.full_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company_name && c.company_name.toLowerCase().includes(q))
    );
  }

  if (status) {
    list = list.filter(c => c.status === status);
  }

  res.json(list);
});

// GET /api/crm/customers/:id
app.get("/api/crm/customers/:id", authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const dbState = getDB();
  const customer = dbState.customers.find(c => c.id === id);

  if (!customer) {
    res.status(404).json({ error: "Customer not active in active database rosters." });
    return;
  }

  const notes = dbState.customer_notes.filter(n => n.customer_id === id);
  const timeline = dbState.customer_timeline.filter(t => t.customer_id === id);
  const orders = dbState.orders.filter(o => o.customer_id === id);

  res.json({
    customer,
    notes,
    timeline,
    orders
  });
});

// POST /api/crm/customers
app.post("/api/crm/customers", authenticateToken, requireRole(["Admin", "Manager"]), (req: AuthRequest, res) => {
  const { full_name, phone, email, address, city, country, company_name, status } = req.body;

  if (!full_name || !phone || !email || !address || !city || !country) {
    res.status(400).json({ error: "All client contact details (Name, Phone, Email, Address, City, Country) are required." });
    return;
  }

  const dbState = getDB();
  const existing = dbState.customers.find(c => c.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(400).json({ error: "A client account with this email address has already been configured." });
    return;
  }

  const customer: Customer = {
    id: dbState.customers.length > 0 ? Math.max(...dbState.customers.map(c => c.id)) + 1 : 1,
    full_name,
    phone,
    email: email.toLowerCase(),
    address,
    city,
    country,
    company_name: company_name || null,
    status: status || "Active",
    created_at: new Date().toISOString()
  };

  dbState.customers.push(customer);

  // Auto-record Client Context Timeline Entry
  dbState.customer_timeline.push({
    id: dbState.customer_timeline.length > 0 ? Math.max(...dbState.customer_timeline.map(t => t.id)) + 1 : 1,
    customer_id: customer.id,
    activity_type: "Customer Registered",
    description: `Customer account initialized under '${customer.company_name || "Personal"}' profile by ${req.user?.full_name}.`,
    created_at: new Date().toISOString()
  });

  writeDB();
  res.status(201).json({ message: "Client profile successfully registered.", customer });
});

// PUT /api/crm/customers/:id
app.put("/api/crm/customers/:id", authenticateToken, requireRole(["Admin", "Manager"]), (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const { full_name, phone, email, address, city, country, company_name, status } = req.body;
  const dbState = getDB();
  const idx = dbState.customers.findIndex(c => c.id === id);

  if (idx === -1) {
    res.status(404).json({ error: "Customer profile requested is not present." });
    return;
  }

  const customer = dbState.customers[idx];

  if (email && email.toLowerCase() !== customer.email) {
    const conflict = dbState.customers.find(c => c.email.toLowerCase() === email.toLowerCase() && c.id !== id);
    if (conflict) {
      res.status(400).json({ error: "This email address is already configured for another customer roster." });
      return;
    }
    customer.email = email.toLowerCase();
  }

  if (full_name) customer.full_name = full_name;
  if (phone) customer.phone = phone;
  if (address) customer.address = address;
  if (city) customer.city = city;
  if (country) customer.country = country;
  if (company_name !== undefined) customer.company_name = company_name;
  if (status) customer.status = status;

  dbState.customer_timeline.push({
    id: dbState.customer_timeline.length > 0 ? Math.max(...dbState.customer_timeline.map(t => t.id)) + 1 : 1,
    customer_id: customer.id,
    activity_type: "Profile Redesigned",
    description: `Client contact details updated in cloud registry by ${req.user?.full_name}.`,
    created_at: new Date().toISOString()
  });

  writeDB();
  res.json({ message: "Customer register profile updated.", customer });
});

// DELETE /api/crm/customers/:id
app.delete("/api/crm/customers/:id", authenticateToken, requireRole(["Admin"]), (req, res) => {
  const id = parseInt(req.params.id);
  const dbState = getDB();
  const idx = dbState.customers.findIndex(c => c.id === id);

  if (idx === -1) {
    res.status(404).json({ error: "Customer profile not detected." });
    return;
  }

  dbState.customers.splice(idx, 1);

  // Hard cascade related telemetry
  dbState.customer_notes = dbState.customer_notes.filter(n => n.customer_id !== id);
  dbState.customer_timeline = dbState.customer_timeline.filter(t => t.customer_id !== id);

  writeDB();
  res.json({ message: "Customer profile safely purged from main repositories." });
});

// POST /api/crm/customers/:id/notes
app.post("/api/crm/customers/:id/notes", authenticateToken, (req: AuthRequest, res) => {
  const customer_id = parseInt(req.params.id);
  const { note } = req.body;

  if (!note) {
    res.status(400).json({ error: "Note text content cannot be blank." });
    return;
  }

  const dbState = getDB();
  const customer = dbState.customers.find(c => c.id === customer_id);
  if (!customer) {
    res.status(404).json({ error: "Customer context unavailable." });
    return;
  }

  const newNote: CustomerNote = {
    id: dbState.customer_notes.length > 0 ? Math.max(...dbState.customer_notes.map(n => n.id)) + 1 : 1,
    customer_id,
    note,
    created_by: req.user?.full_name || "Staff",
    created_at: new Date().toISOString()
  };

  dbState.customer_notes.push(newNote);

  dbState.customer_timeline.push({
    id: dbState.customer_timeline.length > 0 ? Math.max(...dbState.customer_timeline.map(t => t.id)) + 1 : 1,
    customer_id,
    activity_type: "Follow-up Note Added",
    description: `Added custom CRM notation: "${note.substring(0, 50)}${note.length > 50 ? "..." : ""}"`,
    created_at: new Date().toISOString()
  });

  writeDB();
  res.status(201).json({ message: "Note logged securely.", note: newNote });
});

// =========================================================================
// 🏭 WMS WAREHOUSE STOCK SERVICE ENDPOINTS
// =========================================================================

// GET /api/wms/categories
app.get("/api/wms/categories", authenticateToken, (req, res) => {
  res.json(getDB().categories);
});

// POST /api/wms/categories
app.post("/api/wms/categories", authenticateToken, requireRole(["Admin", "Manager"]), (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ error: "Category name is required." });
    return;
  }

  const dbState = getDB();
  const existing = dbState.categories.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    res.status(400).json({ error: "Category already exists." });
    return;
  }

  const cat: Category = {
    id: dbState.categories.length > 0 ? Math.max(...dbState.categories.map(c => c.id)) + 1 : 1,
    name,
    description: description || ""
  };

  dbState.categories.push(cat);
  writeDB();
  res.status(201).json({ message: "Category created.", category: cat });
});

// DELETE /api/wms/categories/:id
app.delete("/api/wms/categories/:id", authenticateToken, requireRole(["Admin"]), (req, res) => {
  const id = parseInt(req.params.id);
  const dbState = getDB();
  const index = dbState.categories.findIndex(c => c.id === id);

  if (index === -1) {
    res.status(404).json({ error: "Category context missing." });
    return;
  }

  dbState.categories.splice(index, 1);
  writeDB();
  res.json({ message: "Product taxonomy category deleted." });
});

// GET /api/wms/suppliers
app.get("/api/wms/suppliers", authenticateToken, (req, res) => {
  res.json(getDB().suppliers);
});

// POST /api/wms/suppliers
app.post("/api/wms/suppliers", authenticateToken, requireRole(["Admin", "Manager"]), (req, res) => {
  const { company_name, contact_person, phone, email, address, country } = req.body;
  if (!company_name || !contact_person || !phone || !email || !address || !country) {
    res.status(400).json({ error: "Complete corporate vendor information is required." });
    return;
  }

  const dbState = getDB();
  const sup: Supplier = {
    id: dbState.suppliers.length > 0 ? Math.max(...dbState.suppliers.map(s => s.id)) + 1 : 1,
    company_name,
    contact_person,
    phone,
    email,
    address,
    country
  };

  dbState.suppliers.push(sup);
  writeDB();
  res.status(201).json({ message: "Supplier details saved.", supplier: sup });
});

// PUT /api/wms/suppliers/:id
app.put("/api/wms/suppliers/:id", authenticateToken, requireRole(["Admin", "Manager"]), (req, res) => {
  const id = parseInt(req.params.id);
  const { company_name, contact_person, phone, email, address, country } = req.body;
  const dbState = getDB();
  const idx = dbState.suppliers.findIndex(s => s.id === id);

  if (idx === -1) {
    res.status(404).json({ error: "Supplier registry item not detected." });
    return;
  }

  const sup = dbState.suppliers[idx];

  if (company_name) sup.company_name = company_name;
  if (contact_person) sup.contact_person = contact_person;
  if (phone) sup.phone = phone;
  if (email) sup.email = email;
  if (address) sup.address = address;
  if (country) sup.country = country;

  writeDB();
  res.json({ message: "Supplier details updated successfully.", supplier: sup });
});

// DELETE /api/wms/suppliers/:id
app.delete("/api/wms/suppliers/:id", authenticateToken, requireRole(["Admin"]), (req, res) => {
  const id = parseInt(req.params.id);
  const dbState = getDB();
  const index = dbState.suppliers.findIndex(s => s.id === id);

  if (index === -1) {
    res.status(404).json({ error: "Supplier registry item not detected." });
    return;
  }

  dbState.suppliers.splice(index, 1);
  writeDB();
  res.json({ message: "Supplier details securely deleted." });
});

// GET /api/wms/products
app.get("/api/wms/products", authenticateToken, (req, res) => {
  const { search, category } = req.query;
  let items = [...getDB().products];

  if (search) {
    const q = (search as string).toLowerCase();
    items = items.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }

  if (category) {
    items = items.filter(p => p.category === category);
  }

  res.json(items);
});

// POST /api/wms/products (Add product)
app.post("/api/wms/products", authenticateToken, requireRole(["Admin", "Manager"]), (req: AuthRequest, res) => {
  const { name, sku, barcode, category, description, price, quantity, supplier, image } = req.body;

  if (!name || !sku || !barcode || !category || price === undefined || quantity === undefined) {
    res.status(400).json({ error: "Missing essential product listing parameters (Name, SKU, Barcode, Category, Price, Quantity)." });
    return;
  }

  const dbState = getDB();
  if (dbState.products.some(p => p.sku.toLowerCase() === sku.toLowerCase())) {
    res.status(400).json({ error: "This vendor SKU designation is already allocated to another style." });
    return;
  }

  if (dbState.products.some(p => p.barcode === barcode)) {
    res.status(400).json({ error: "This barcode standard is already mapped in our warehouse catalog." });
    return;
  }

  const newProduct: Product = {
    id: dbState.products.length > 0 ? Math.max(...dbState.products.map(p => p.id)) + 1 : 1,
    name,
    sku: sku.toUpperCase(),
    barcode,
    category,
    description: description || "",
    price: parseFloat(price),
    quantity: parseInt(quantity),
    supplier: supplier || "Unassigned",
    image: image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600",
    created_at: new Date().toISOString()
  };

  dbState.products.push(newProduct);

  // Generate Audit Stock Log
  dbState.inventory_history.push({
    id: dbState.inventory_history.length > 0 ? Math.max(...dbState.inventory_history.map(h => h.id)) + 1 : 1,
    product_id: newProduct.id,
    product_name: newProduct.name,
    sku: newProduct.sku,
    move_type: "Stock In",
    quantity: newProduct.quantity,
    reason: "New style roster initialized in WMS catalog.",
    created_at: new Date().toISOString(),
    user: req.user?.full_name || "Manager"
  });

  writeDB();
  res.status(201).json({ message: "Product introduced to warehouse catalog successfully.", product: newProduct });
});

// PUT /api/wms/products/:id
app.put("/api/wms/products/:id", authenticateToken, requireRole(["Admin", "Manager"]), (req, res) => {
  const id = parseInt(req.params.id);
  const { name, sku, barcode, category, description, price, quantity, supplier, image } = req.body;
  const dbState = getDB();
  const idx = dbState.products.findIndex(p => p.id === id);

  if (idx === -1) {
    res.status(404).json({ error: "Product is not active in warehouse inventories." });
    return;
  }

  const product = dbState.products[idx];

  if (sku && sku.toUpperCase() !== product.sku) {
    const conflict = dbState.products.find(p => p.sku === sku.toUpperCase() && p.id !== id);
    if (conflict) {
      res.status(400).json({ error: "This physical SKU identifier is already allocated." });
      return;
    }
    product.sku = sku.toUpperCase();
  }

  if (barcode && barcode !== product.barcode) {
    const conflict = dbState.products.find(p => p.barcode === barcode && p.id !== id);
    if (conflict) {
      res.status(400).json({ error: "This barcode registry is already mapped." });
      return;
    }
    product.barcode = barcode;
  }

  if (name) product.name = name;
  if (category) product.category = category;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = parseFloat(price);
  if (supplier) product.supplier = supplier;
  if (image) product.image = image;

  // Stock update if and only if updated explicitly
  if (quantity !== undefined && parseInt(quantity) !== product.quantity) {
    const oldQty = product.quantity;
    const newQty = parseInt(quantity);
    const diff = newQty - oldQty;

    product.quantity = newQty;

    dbState.inventory_history.push({
      id: dbState.inventory_history.length > 0 ? Math.max(...dbState.inventory_history.map(h => h.id)) + 1 : 1,
      product_id: product.id,
      product_name: product.name,
      sku: product.sku,
      move_type: diff > 0 ? "Stock In" : "Stock Out",
      quantity: Math.abs(diff),
      reason: `Manual warehouse correction adjustment. From ${oldQty} to ${newQty}.`,
      created_at: new Date().toISOString(),
      user: "System Admin"
    });
  }

  writeDB();
  res.json({ message: "Product catalog status updated.", product });
});

// DELETE /api/wms/products/:id
app.delete("/api/wms/products/:id", authenticateToken, requireRole(["Admin"]), (req, res) => {
  const id = parseInt(req.params.id);
  const dbState = getDB();
  const idx = dbState.products.findIndex(p => p.id === id);

  if (idx === -1) {
    res.status(404).json({ error: "Product was not discovered." });
    return;
  }

  dbState.products.splice(idx, 1);
  dbState.inventory_history = dbState.inventory_history.filter(h => h.product_id !== id);

  writeDB();
  res.json({ message: "Product style erased from inventory registers." });
});

// POST /api/wms/stock-move (Dedicated Stock In / Stock Out Endpoint)
app.post("/api/wms/stock-move", authenticateToken, requireRole(["Admin", "Manager"]), (req: AuthRequest, res) => {
  const { product_id, move_type, quantity, reason } = req.body;

  if (!product_id || !move_type || !quantity) {
    res.status(400).json({ error: "product_id, move_type ('Stock In' or 'Stock Out'), and quantity are compulsory." });
    return;
  }

  const qty = parseInt(quantity);
  if (isNaN(qty) || qty <= 0) {
    res.status(400).json({ error: "Quantity must be a positive integer value." });
    return;
  }

  const dbState = getDB();
  const product = dbState.products.find(p => p.id === parseInt(product_id));

  if (!product) {
    res.status(404).json({ error: "Product context was not set." });
    return;
  }

  if (move_type === "Stock Out" && product.quantity < qty) {
    res.status(400).json({ error: `Insufficient inventory. Available stock for '${product.name}' is only ${product.quantity} units.` });
    return;
  }

  // Adjust stock
  if (move_type === "Stock In") {
    product.quantity += qty;
  } else {
    product.quantity -= qty;
  }

  // Log stock movement history
  const historyLog: InventoryHistory = {
    id: dbState.inventory_history.length > 0 ? Math.max(...dbState.inventory_history.map(h => h.id)) + 1 : 1,
    product_id: product.id,
    product_name: product.name,
    sku: product.sku,
    move_type: move_type as "Stock In" | "Stock Out",
    quantity: qty,
    reason: reason || `Standard inventory stock adjustment.`,
    created_at: new Date().toISOString(),
    user: req.user?.full_name || "Warehouse Manager"
  };

  dbState.inventory_history.push(historyLog);

  // Generate Expense or Income logging automatically
  const ledgerItem: FinanceRecord = {
    id: dbState.finances.length > 0 ? Math.max(...dbState.finances.map(f => f.id)) + 1 : 1,
    type: move_type === "Stock In" ? "Expense" : "Income",
    category: move_type === "Stock In" ? "Supplier Sourcing" : "Fulfillment Sales",
    amount: product.price * 0.6 * qty, // Cost of Goods Sold estimated as 60% of wholesale price for buying supply
    date: new Date().toISOString().split("T")[0],
    description: `${move_type} transaction audit - Product SKU: ${product.sku} (${qty} pcs)`,
    created_at: new Date().toISOString()
  };

  dbState.finances.push(ledgerItem);
  writeDB();

  res.json({
    message: `${move_type} event finalized for product '${product.name}'. New warehouse balance: ${product.quantity} units.`,
    product,
    historyLog
  });
});

// GET /api/wms/inventory-history
app.get("/api/wms/inventory-history", authenticateToken, (req, res) => {
  res.json(getDB().inventory_history);
});

// =========================================================================
// 🛒 ERP SYSTEM ORDERS ENDPOINTS
// =========================================================================

// GET /api/orders
app.get("/api/orders", authenticateToken, (req, res) => {
  res.json(getDB().orders);
});

// POST /api/orders
app.post("/api/orders", authenticateToken, requireRole(["Admin", "Manager"]), (req: AuthRequest, res) => {
  const { customer_id, items, status, payment_status, order_date } = req.body;

  if (!customer_id || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Selecting a customer and listing at least one line item is required." });
    return;
  }

  const dbState = getDB();
  const customer = dbState.customers.find(c => c.id === parseInt(customer_id));

  if (!customer) {
    res.status(404).json({ error: "Customer not registered." });
    return;
  }

  let total_amount = 0;
  const orderItems: OrderItem[] = [];

  // Verify stock levels and calculate aggregate order pricing
  for (const item of items) {
    const product = dbState.products.find(p => p.id === parseInt(item.product_id));
    if (!product) {
      res.status(404).json({ error: `Product item ID ${item.product_id} from wholesale order not found.` });
      return;
    }

    const requestedQty = parseInt(item.quantity);
    if (isNaN(requestedQty) || requestedQty <= 0) {
      res.status(400).json({ error: `Invalid Quantity indicated for '${product.name}'.` });
      return;
    }

    // Checking inventory
    if (product.quantity < requestedQty) {
      res.status(400).json({ error: `Allocation limits exceeded for '${product.name}'. Available: ${product.quantity}, requested: ${requestedQty}.` });
      return;
    }

    total_amount += product.price * requestedQty;
    orderItems.push({
      product_id: product.id,
      name: product.name,
      sku: product.sku,
      quantity: requestedQty,
      price: product.price
    });
  }

  // Deduct inventory items and generate audit history
  for (const item of orderItems) {
    const product = dbState.products.find(p => p.id === item.product_id)!;
    product.quantity -= item.quantity;

    dbState.inventory_history.push({
      id: dbState.inventory_history.length > 0 ? Math.max(...dbState.inventory_history.map(h => h.id)) + 1 : 1,
      product_id: product.id,
      product_name: product.name,
      sku: product.sku,
      move_type: "Stock Out",
      quantity: item.quantity,
      reason: `Dispatched automatically for Bulk Order placement.`,
      created_at: new Date().toISOString(),
      user: req.user?.full_name || "Sales Rep"
    });
  }

  const newOrder: Order = {
    id: dbState.orders.length > 0 ? Math.max(...dbState.orders.map(o => o.id)) + 1 : 1001,
    customer_id: customer.id,
    customer_name: customer.full_name,
    order_date: order_date || new Date().toISOString().split("T")[0],
    status: status || "Pending",
    payment_status: payment_status || "Unpaid",
    total_amount,
    items: orderItems,
    created_at: new Date().toISOString()
  };

  dbState.orders.push(newOrder);

  // If order is flagged as paid at the gate, register the transaction in Finance
  if (payment_status === "Paid") {
    dbState.finances.push({
      id: dbState.finances.length > 0 ? Math.max(...dbState.finances.map(f => f.id)) + 1 : 1,
      type: "Income",
      category: "Wholesale Order Sales",
      amount: total_amount,
      date: newOrder.order_date,
      description: `Disbursement completed for wholesale PO #${newOrder.id}`,
      created_at: new Date().toISOString()
    });
  }

  // Log CRM Customer Timeline trigger
  dbState.customer_timeline.push({
    id: dbState.customer_timeline.length > 0 ? Math.max(...dbState.customer_timeline.map(t => t.id)) + 1 : 1,
    customer_id: customer.id,
    activity_type: "Bulk Purchase Order",
    description: `Placed order PO #${newOrder.id} totaling $${total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
    created_at: new Date().toISOString()
  });

  writeDB();
  res.status(201).json({ message: "Wholesale Order booked successfully.", order: newOrder });
});

// PUT /api/orders/:id
app.put("/api/orders/:id", authenticateToken, requireRole(["Admin", "Manager"]), (req, res) => {
  const id = parseInt(req.params.id);
  const { status, payment_status } = req.body;
  const dbState = getDB();
  const index = dbState.orders.findIndex(o => o.id === id);

  if (index === -1) {
    res.status(404).json({ error: "Order was not found in database records." });
    return;
  }

  const order = dbState.orders[index];
  const originalPaymentStatus = order.payment_status;

  if (status) order.status = status;
  if (payment_status) order.payment_status = payment_status;

  // Real journal ledger auditing
  if (originalPaymentStatus !== "Paid" && payment_status === "Paid") {
    dbState.finances.push({
      id: dbState.finances.length > 0 ? Math.max(...dbState.finances.map(f => f.id)) + 1 : 1,
      type: "Income",
      category: "Wholesale Order Sales",
      amount: order.total_amount,
      date: new Date().toISOString().split("T")[0],
      description: `Disbursement cleared on Invoice PO #${order.id}`,
      created_at: new Date().toISOString()
    });
  }

  writeDB();
  res.json({ message: "Order state updated successfully.", order });
});

// DELETE /api/orders/:id (To release booked inventory)
app.delete("/api/orders/:id", authenticateToken, requireRole(["Admin"]), (req, res) => {
  const id = parseInt(req.params.id);
  const dbState = getDB();
  const idx = dbState.orders.findIndex(o => o.id === id);

  if (idx === -1) {
    res.status(404).json({ error: "Wholesale order not found." });
    return;
  }

  const order = dbState.orders[idx];

  // Restock inventory elements on delete/cancellation audit
  for (const item of order.items) {
    const product = dbState.products.find(p => p.id === item.product_id);
    if (product) {
      product.quantity += item.quantity;
      dbState.inventory_history.push({
        id: dbState.inventory_history.length > 0 ? Math.max(...dbState.inventory_history.map(h => h.id)) + 1 : 1,
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        move_type: "Stock In",
        quantity: item.quantity,
        reason: `Credited back inventory due to cancellation/deletion of PO #${order.id}.`,
        created_at: new Date().toISOString(),
        user: "System Auditor"
      });
    }
  }

  dbState.orders.splice(idx, 1);
  writeDB();
  res.json({ message: "Wholesale order cancelled and items reverted back to active storage bins." });
});

// =========================================================================
// 👥 ERP STAFF ROSTER ENDPOINTS
// =========================================================================

// GET /api/erp/employees
app.get("/api/erp/employees", authenticateToken, (req, res) => {
  res.json(getDB().employees);
});

// POST /api/erp/employees
app.post("/api/erp/employees", authenticateToken, requireRole(["Admin", "Manager"]), (req, res) => {
  const { full_name, position, department, salary, phone, email, address, joining_date } = req.body;

  if (!full_name || !position || !department || !salary || !phone || !email || !address || !joining_date) {
    res.status(400).json({ error: "Please populate all fields in full to sign staff payroll roster." });
    return;
  }

  const dbState = getDB();
  const existing = dbState.employees.find(e => e.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(400).json({ error: "An employee is already active under this email address." });
    return;
  }

  const emp: Employee = {
    id: dbState.employees.length > 0 ? Math.max(...dbState.employees.map(e => e.id)) + 1 : 1,
    full_name,
    position,
    department,
    salary: parseFloat(salary),
    phone,
    email: email.toLowerCase(),
    address,
    joining_date
  };

  dbState.employees.push(emp);
  writeDB();
  res.status(201).json({ message: "Employee successfully signed onto ERP database registers.", employee: emp });
});

// PUT /api/erp/employees/:id
app.put("/api/erp/employees/:id", authenticateToken, requireRole(["Admin", "Manager"]), (req, res) => {
  const id = parseInt(req.params.id);
  const { full_name, position, department, salary, phone, email, address, joining_date } = req.body;
  const dbState = getDB();
  const idx = dbState.employees.findIndex(e => e.id === id);

  if (idx === -1) {
    res.status(404).json({ error: "Employee not active in personnel rosters." });
    return;
  }

  const emp = dbState.employees[idx];

  if (email && email.toLowerCase() !== emp.email) {
    const conflict = dbState.employees.find(e => e.email.toLowerCase() === email.toLowerCase() && e.id !== id);
    if (conflict) {
      res.status(400).json({ error: "Email address conflicts with another staff profile." });
      return;
    }
    emp.email = email.toLowerCase();
  }

  if (full_name) emp.full_name = full_name;
  if (position) emp.position = position;
  if (department) emp.department = department;
  if (salary !== undefined) emp.salary = parseFloat(salary);
  if (phone) emp.phone = phone;
  if (address) emp.address = address;
  if (joining_date) emp.joining_date = joining_date;

  writeDB();
  res.json({ message: "Employee registry update completed.", employee: emp });
});

// DELETE /api/erp/employees/:id
app.delete("/api/erp/employees/:id", authenticateToken, requireRole(["Admin"]), (req, res) => {
  const id = parseInt(req.params.id);
  const dbState = getDB();
  const idx = dbState.employees.findIndex(e => e.id === id);

  if (idx === -1) {
    res.status(404).json({ error: "Employee profile untraceable." });
    return;
  }

  dbState.employees.splice(idx, 1);
  writeDB();
  res.json({ message: "Employee records archived and deleted from payroll registry." });
});

// =========================================================================
// 💱 ERP LEDGER & FINANCIAL LEDGER ENDPOINTS
// =========================================================================

// GET /api/finances
app.get("/api/finances", authenticateToken, (req, res) => {
  res.json(getDB().finances);
});

// POST /api/finances
app.post("/api/finances", authenticateToken, requireRole(["Admin", "Manager"]), (req, res) => {
  const { type, category, amount, date, description } = req.body;

  if (!type || !category || !amount || !date) {
    res.status(400).json({ error: "Required fields (Type, Category, Amount, Date) must be entered." });
    return;
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    res.status(400).json({ error: "Ledger transaction level must be positive numbers." });
    return;
  }

  const dbState = getDB();
  const logItem: FinanceRecord = {
    id: dbState.finances.length > 0 ? Math.max(...dbState.finances.map(f => f.id)) + 1 : 1,
    type: type as "Income" | "Expense",
    category,
    amount: parsedAmount,
    date,
    description: description || "",
    created_at: new Date().toISOString()
  };

  dbState.finances.push(logItem);
  writeDB();
  res.status(201).json({ message: "Ledger item logged successfully.", logItem });
});

// DELETE /api/finances/:id
app.delete("/api/finances/:id", authenticateToken, requireRole(["Admin"]), (req, res) => {
  const id = parseInt(req.params.id);
  const dbState = getDB();
  const idx = dbState.finances.findIndex(f => f.id === id);

  if (idx === -1) {
    res.status(404).json({ error: "Ledger entry was not mapped." });
    return;
  }

  dbState.finances.splice(idx, 1);
  writeDB();
  res.json({ message: "Transaction ledger element deleted successfully." });
});

// =========================================================================
// 🧬 ROUTING CONTROL & EXPRESS STATIC INTEGRATION
// =========================================================================

async function startServer() {
  // Check if dev or production environment
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Serve static assets out of built dist path
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // BIND INGRESS LISTENER
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FashionHub Enterprise ERP running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
