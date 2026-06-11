import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const DB_PATH = path.join(process.cwd(), "database.json");

export interface User {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role: "Admin" | "Manager" | "Employee";
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Supplier {
  id: number;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  country: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  description: string;
  price: number;
  quantity: number;
  supplier: string;
  image: string;
  created_at: string;
}

export interface Customer {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  company_name: string;
  status: "Active" | "Lead" | "Inactive";
  created_at: string;
}

export interface CustomerNote {
  id: number;
  customer_id: number;
  note: string;
  created_by: string;
  created_at: string;
}

export interface CustomerTimeline {
  id: number;
  customer_id: number;
  activity_type: string;
  description: string;
  created_at: string;
}

export interface OrderItem {
  product_id: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  customer_id: number;
  customer_name: string;
  order_date: string;
  status: "Pending" | "Processing" | "Completed" | "Cancelled";
  payment_status: "Paid" | "Unpaid" | "Refunded";
  total_amount: number;
  items: OrderItem[];
  created_at: string;
}

export interface InventoryHistory {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  move_type: "Stock In" | "Stock Out";
  quantity: number;
  reason: string;
  created_at: string;
  user: string;
}

export interface Employee {
  id: number;
  full_name: string;
  position: string;
  department: string;
  salary: number;
  phone: string;
  email: string;
  address: string;
  joining_date: string;
}

export interface FinanceRecord {
  id: number;
  type: "Income" | "Expense";
  category: string;
  amount: number;
  date: string;
  description: string;
  created_at: string;
}

export interface DatabaseSchema {
  users: User[];
  categories: Category[];
  suppliers: Supplier[];
  products: Product[];
  customers: Customer[];
  customer_notes: CustomerNote[];
  customer_timeline: CustomerTimeline[];
  orders: Order[];
  inventory_history: InventoryHistory[];
  employees: Employee[];
  finances: FinanceRecord[];
}

// Global memory state, backed by file
let db: DatabaseSchema = {
  users: [],
  categories: [],
  suppliers: [],
  products: [],
  customers: [],
  customer_notes: [],
  customer_timeline: [],
  orders: [],
  inventory_history: [],
  employees: [],
  finances: [],
};

// Seed utility to setup perfect sample datasets
function seedDatabase() {
  const adminHash = bcrypt.hashSync("admin123", 10);
  const managerHash = bcrypt.hashSync("manager123", 10);
  const employeeHash = bcrypt.hashSync("employee123", 10);

  db.users = [
    {
      id: 1,
      full_name: "Eleanor Vance (Admin)",
      email: "admin@fashionhub.com",
      password_hash: adminHash,
      role: "Admin",
      created_at: "2026-01-10T08:00:00Z",
    },
    {
      id: 2,
      full_name: "Marcus Aurelius (Manager)",
      email: "manager@fashionhub.com",
      password_hash: managerHash,
      role: "Manager",
      created_at: "2026-02-15T09:30:00Z",
    },
    {
      id: 3,
      full_name: "Sophia Martinez (Sales Representative)",
      email: "employee@fashionhub.com",
      password_hash: employeeHash,
      role: "Employee",
      created_at: "2026-03-01T10:00:00Z",
    }
  ];

  db.categories = [
    { id: 1, name: "Premium Denim", description: "Heavyweight selvedge denim, shirts, and high-rise jeans." },
    { id: 2, name: "Signature Outerwear", description: "Leather shearling coats, technical puffers, and chore coats." },
    { id: 3, name: "Knitwear & Sweaters", description: "Fine Mongolian cashmere, cable knit Cardigans, and merino wool." },
    { id: 4, name: "Tailored Separates", description: "Blazers, pleated trousers, waistcoats, and formalwear." },
    { id: 5, name: "Daily Essentials", description: "Organic combed cotton tees, sweatshirts, and lounge sets." }
  ];

  db.suppliers = [
    {
      id: 1,
      company_name: "Apex Textile Corporation",
      contact_person: "Liam Gallagher",
      phone: "+1 (555) 381-0021",
      email: "liam@apextextile.com",
      address: "1482 Indigo Boulevard, Sector 4",
      country: "United States"
    },
    {
      id: 2,
      company_name: "Elegance Denim Mills Ltd.",
      contact_person: "Kenji Sato",
      phone: "+81 3-5555-0143",
      email: "k.sato@elegancedenim.co.jp",
      address: "3-chōme-10-1 Kuramae, Taito City",
      country: "Japan"
    },
    {
      id: 3,
      company_name: "Sartorial Trims & Threads",
      contact_person: "Matteo Rossi",
      phone: "+39 02 5555 8921",
      email: "m.rossi@sartorialtrims.it",
      address: "Via della Moscova 24, Brera District",
      country: "Italy"
    }
  ];

  db.products = [
    {
      id: 1,
      name: "Heritage Selvedge Denim Jacket",
      sku: "DEN-HER-JKT-001",
      barcode: "840192003810",
      category: "Premium Denim",
      description: "14oz raw selvedge denim jacket dyed with organic indigo. Features custom copper shanks.",
      price: 185.00,
      quantity: 140,
      supplier: "Elegance Denim Mills Ltd.",
      image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&q=80&w=600",
      created_at: "2026-02-01T12:00:00Z"
    },
    {
      id: 2,
      name: "Suede Shearling Aviator Coat",
      sku: "OUT-SUD-SHR-002",
      barcode: "840192003827",
      category: "Signature Outerwear",
      description: "Double-faced lambskin suede exterior with warm plush shearling lining and robust brass zippers.",
      price: 520.00,
      quantity: 18,
      supplier: "Sartorial Trims & Threads",
      image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=600",
      created_at: "2026-01-15T10:30:00Z"
    },
    {
      id: 3,
      name: "Mongolian Cashmere Crewneck",
      sku: "KNT-MON-CSM-003",
      barcode: "840192003834",
      category: "Knitwear & Sweaters",
      description: "Grade-A 100% cashmere yarn harvested ethically. Seamless circular knit for maximum drape.",
      price: 245.00,
      quantity: 85,
      supplier: "Apex Textile Corporation",
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600",
      created_at: "2026-02-10T14:15:00Z"
    },
    {
      id: 4,
      name: "Italian Wool Tailored Blazer",
      sku: "SEP-ITA-BLZ-004",
      barcode: "840192003841",
      category: "Tailored Separates",
      description: "Super 120s virgin wool blazer with a soft Neapolitan shoulder. Fully unstructured.",
      price: 340.00,
      quantity: 45,
      supplier: "Sartorial Trims & Threads",
      image: "https://images.unsplash.com/photo-1598808503742-dd34ab0ccf4b?auto=format&fit=crop&q=80&w=600",
      created_at: "2026-03-01T09:45:00Z"
    },
    {
      id: 5,
      name: "Organic Supple Cotton Tee (3-Pack)",
      sku: "ESS-ORG-TEE-005",
      barcode: "840192003858",
      category: "Daily Essentials",
      description: "Long-staple combed organic cotton crewneck tee. Extremely soft, pre-shrunk.",
      price: 65.00,
      quantity: 8,
      supplier: "Apex Textile Corporation",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600",
      created_at: "2026-01-20T11:00:00Z"
    }
  ];

  db.customers = [
    {
      id: 1,
      full_name: "Oliver Harrison",
      phone: "+1 (555) 234-9012",
      email: "oliver@urbanboutique.com",
      address: "842 Broadway, Suite 10",
      city: "New York",
      country: "United States",
      company_name: "Urban Threads Boutique",
      status: "Active",
      created_at: "2026-01-20T10:00:00Z"
    },
    {
      id: 2,
      full_name: "Freja Lindqvist",
      phone: "+46 8 555 12 34",
      email: "f.lindqvist@nordicgroup.se",
      address: "Sveavägen 42",
      city: "Stockholm",
      country: "Sweden",
      company_name: "Nordic Apparel Group",
      status: "Active",
      created_at: "2026-02-05T14:30:00Z"
    },
    {
      id: 3,
      full_name: "Catherine Vance",
      phone: "+44 20 7946 0192",
      email: "catherine@starlightretail.co.uk",
      address: "15 Regency Walk, Westminster",
      city: "London",
      country: "United Kingdom",
      company_name: "Starlight Department Stores",
      status: "Lead",
      created_at: "2026-03-12T11:15:00Z"
    },
    {
      id: 4,
      full_name: "Jameson Reynolds",
      phone: "+1 (555) 782-1100",
      email: "jreynolds@pacificcoast.com",
      address: "102 Harbor Drive",
      city: "San Francisco",
      country: "United States",
      company_name: "Pacific Coast Wholesale",
      status: "Inactive",
      created_at: "2026-01-05T09:00:00Z"
    }
  ];

  db.customer_notes = [
    {
      id: 1,
      customer_id: 1,
      note: "Prefers shipments compiled in flat pallets. Key account with reliable 15-day payment cycle.",
      created_by: "Eleanor Vance (Admin)",
      created_at: "2026-01-25T15:00:00Z"
    },
    {
      id: 2,
      customer_id: 2,
      note: "Looking to expand Outerwear order by 20% for their autumn collection launching in July.",
      created_by: "Sophia Martinez (Sales Representative)",
      created_at: "2026-02-10T16:30:00Z"
    }
  ];

  db.customer_timeline = [
    {
      id: 1,
      customer_id: 1,
      activity_type: "Account Created",
      description: "Store profile initialized and verified by Finance.",
      created_at: "2026-01-20T10:00:00Z"
    },
    {
      id: 2,
      customer_id: 1,
      activity_type: "Bulk Purchase Order",
      description: "Placed First Bulk Order #1001 valued at $5,230.00.",
      created_at: "2026-01-22T11:45:00Z"
    },
    {
      id: 3,
      customer_id: 2,
      activity_type: "Inquiry Call",
      description: "Sophia Martinez conducted inventory match call for high-rise denim stock availability.",
      created_at: "2026-02-06T10:15:00Z"
    }
  ];

  db.orders = [
    {
      id: 1001,
      customer_id: 1,
      customer_name: "Urban Threads Boutique",
      order_date: "2026-04-12",
      status: "Completed",
      payment_status: "Paid",
      total_amount: 5230.00,
      items: [
        { product_id: 1, name: "Heritage Selvedge Denim Jacket", sku: "DEN-HER-JKT-001", quantity: 20, price: 185.00 },
        { product_id: 3, name: "Mongolian Cashmere Crewneck", sku: "KNT-MON-CSM-003", quantity: 5, price: 245.00 },
        { product_id: 5, name: "Organic Supple Cotton Tee (3-Pack)", sku: "ESS-ORG-TEE-005", quantity: 10, price: 65.00 }
      ],
      created_at: "2026-04-12T14:00:00Z"
    },
    {
      id: 1002,
      customer_id: 2,
      customer_name: "Nordic Apparel Group",
      order_date: "2026-05-18",
      status: "Processing",
      payment_status: "Paid",
      total_amount: 14760.00,
      items: [
        { product_id: 2, name: "Suede Shearling Aviator Coat", sku: "OUT-SUD-SHR-002", quantity: 15, price: 520.00 },
        { product_id: 3, name: "Mongolian Cashmere Crewneck", sku: "KNT-MON-CSM-003", quantity: 20, price: 245.00 },
        { product_id: 4, name: "Italian Wool Tailored Blazer", sku: "SEP-ITA-BLZ-004", quantity: 6, price: 340.00 }
      ],
      created_at: "2026-05-18T09:15:00Z"
    },
    {
      id: 1003,
      customer_id: 1,
      customer_name: "Urban Threads Boutique",
      order_date: "2026-05-28",
      status: "Pending",
      payment_status: "Unpaid",
      total_amount: 1725.00,
      items: [
        { product_id: 1, name: "Heritage Selvedge Denim Jacket", sku: "DEN-HER-JKT-001", quantity: 5, price: 185.00 },
        { product_id: 4, name: "Italian Wool Tailored Blazer", sku: "SEP-ITA-BLZ-004", quantity: 2, price: 340.00 },
        { product_id: 5, name: "Organic Supple Cotton Tee (3-Pack)", sku: "ESS-ORG-TEE-005", quantity: 2, price: 65.00 }
      ],
      created_at: "2026-05-28T16:45:00Z"
    },
    {
      id: 1004,
      customer_id: 3,
      customer_name: "Starlight Department Stores",
      order_date: "2026-06-01",
      status: "Cancelled",
      payment_status: "Unpaid",
      total_amount: 4160.00,
      items: [
        { product_id: 2, name: "Suede Shearling Aviator Coat", sku: "OUT-SUD-SHR-002", quantity: 8, price: 520.00 }
      ],
      created_at: "2026-06-01T10:00:00Z"
    }
  ];

  db.inventory_history = [
    {
      id: 1,
      product_id: 1,
      product_name: "Heritage Selvedge Denim Jacket",
      sku: "DEN-HER-JKT-001",
      move_type: "Stock In",
      quantity: 150,
      reason: "Initial purchase order import from Elegance Denim Mills.",
      created_at: "2026-02-01T12:00:00Z",
      user: "Eleanor Vance (Admin)"
    },
    {
      id: 2,
      product_id: 1,
      product_name: "Heritage Selvedge Denim Jacket",
      sku: "DEN-HER-JKT-001",
      move_type: "Stock Out",
      quantity: 10,
      reason: "Dispatched sample units for Nordic Fashion Show preview.",
      created_at: "2026-02-18T15:30:00Z",
      user: "Sophia Martinez (Sales Representative)"
    }
  ];

  db.employees = [
    {
      id: 1,
      full_name: "Gideon Cross",
      position: "Warehouse Logistics Supervisor",
      department: "Logistics & WMS",
      salary: 68000.00,
      phone: "+1 (555) 791-3810",
      email: "gideon@fashionhub.com",
      address: "740 Oakridge Lane",
      joining_date: "2025-04-01"
    },
    {
      id: 2,
      full_name: "Alba Moreno",
      position: "Lead Designer & Merchandiser",
      department: "Design & Sourcing",
      salary: 82000.00,
      phone: "+1 (555) 902-1241",
      email: "alba@fashionhub.com",
      address: "128 Grand Concourse Apt 3B",
      joining_date: "2025-08-15"
    },
    {
      id: 3,
      full_name: "Raymond Sterling",
      position: "Senior Controller",
      department: "Finance & ERP",
      salary: 95000.00,
      phone: "+1 (555) 124-7819",
      email: "raymond@fashionhub.com",
      address: "38 Ocean Breeze Drive",
      joining_date: "2025-11-01"
    }
  ];

  db.finances = [
    {
      id: 1,
      type: "Income",
      category: "Wholesale Order Sales",
      amount: 5230.00,
      date: "2026-04-12",
      description: "Payment received for Order #1001 (Urban Threads Boutique)",
      created_at: "2026-04-12T14:00:00Z"
    },
    {
      id: 2,
      type: "Income",
      category: "Wholesale Order Sales",
      amount: 14760.00,
      date: "2026-05-18",
      description: "Payment received for Order #1002 (Nordic Apparel Group)",
      created_at: "2026-05-18T09:15:00Z"
    },
    {
      id: 3,
      type: "Expense",
      category: "Supplier Sourcing",
      amount: 15000.00,
      date: "2026-03-12",
      description: "Purchased raw indigo fiber rolls from Elegance Denim Mills.",
      created_at: "2026-03-12T11:00:00Z"
    },
    {
      id: 4,
      type: "Expense",
      category: "Warehouse Logistics & Rent",
      amount: 4200.00,
      date: "2026-05-01",
      description: "Monthly lease and security fee for FashionHub Sector 4 Warehouse.",
      created_at: "2026-05-01T09:00:00Z"
    },
    {
      id: 5,
      type: "Expense",
      category: "Staff Payroll",
      amount: 12500.00,
      date: "2026-05-31",
      description: "Bi-weekly operational staff payroll disbursement.",
      created_at: "2026-05-31T17:00:00Z"
    }
  ];
}

// Read database from file or initialize
export function initDB() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const content = fs.readFileSync(DB_PATH, "utf-8");
      db = JSON.parse(content);
      // Double check if seeded appropriately
      if (!db.users || db.users.length === 0) {
        seedDatabase();
        writeDB();
      }
    } catch (e) {
      console.error("Failed reading database.json, seeding database afresh: ", e);
      seedDatabase();
      writeDB();
    }
  } else {
    seedDatabase();
    writeDB();
  }
}

export function writeDB() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export function getDB(): DatabaseSchema {
  return db;
}
