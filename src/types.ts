export interface User {
  id: number;
  full_name: string;
  email: string;
  role: "Admin" | "Manager" | "Employee";
  created_at: string;
  username: string;
}

export interface Customer {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  company_name: string | null;
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

export interface Transaction {
  id: number;
  type: "Income" | "Expense";
  amount: number;
  date: string;
  description: string;
  created_at: string;
}

export interface DashboardMetrics {
  customers: { count: number; growth: string; trend: "up" | "down" };
  products: { count: number; growth: string; trend: "up" | "down" };
  orders: { count: number; growth: string; trend: "up" | "down" };
  revenue: { amount: number; growth: string; trend: "up" | "down" };
  employees: { count: number; growth: string; trend: "up" | "down" };
  profit: { amount: number; growth: string; trend: "up" | "down" };
}
