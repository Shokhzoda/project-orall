import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Package,
  Layers,
  TrendingUp,
  Inbox,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  PlusCircle,
  Plus,
  Minus,
  Edit,
  Trash2,
  X,
  FileText,
  BookmarkCheck,
  Truck
} from "lucide-react";
import { Product, Category, Supplier, InventoryHistory } from "../types";

export default function WmsView({
  products,
  categories,
  suppliers,
  refreshAll
}: {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  refreshAll: () => void;
}) {
  const { apiFetch, user } = useAuth();

  // Selected WMS Sub-tab
  const [activeWmsTab, setActiveWmsTab] = useState<"catalog" | "categories" | "history">("catalog");

  // Filter & Search states
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [stockLevelFilter, setStockLevelFilter] = useState("ALL"); // ALL, LOW, OK
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // History state
  const [history, setHistory] = useState<InventoryHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Stock Movement Modal (Stock In / Stock Out)
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveProduct, setMoveProduct] = useState<Product | null>(null);
  const [moveType, setMoveType] = useState<"Stock In" | "Stock Out">("Stock In");
  const [moveQty, setMoveQty] = useState(10);
  const [moveReason, setMoveReason] = useState("");

  // Product Create/Edit Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [prodIsEdit, setProdIsEdit] = useState(false);
  const [editProdId, setEditProdId] = useState<number | null>(null);
  const [prodError, setProdError] = useState("");

  // Product Form holds
  const [prodName, setProdName] = useState("");
  const [prodSku, setProdSku] = useState("");
  const [prodBarcode, setProdBarcode] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodPrice, setProdPrice] = useState(0);
  const [prodQty, setProdQty] = useState(0);
  const [prodSupplier, setProdSupplier] = useState("");
  const [prodImage, setProdImage] = useState("");

  // Category Create form
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [catError, setCatError] = useState("");

  // Load Inventory audit logs from database
  const loadHistoryLogs = async () => {
    setLoadingHistory(true);
    try {
      const logs = await apiFetch("/api/wms/inventory-history");
      setHistory(logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeWmsTab === "history") {
      loadHistoryLogs();
    }
  }, [activeWmsTab]);

  // Open modals
  const handleOpenStockMove = (prod: Product, type: "Stock In" | "Stock Out") => {
    setMoveProduct(prod);
    setMoveType(type);
    setMoveQty(10);
    setMoveReason(type === "Stock In" ? "Restocking bulk denim supply order." : "Fulfillment of customer purchase order line items.");
    setShowMoveModal(true);
  };

  const handleStockMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveProduct || moveQty <= 0) return;

    try {
      await apiFetch("/api/wms/stock-move", {
        method: "POST",
        body: JSON.stringify({
          product_id: moveProduct.id,
          move_type: moveType,
          quantity: moveQty,
          reason: moveReason
        })
      });
      setShowMoveModal(false);
      refreshAll();
      if (activeWmsTab === "history") {
        loadHistoryLogs();
      }
    } catch (err: any) {
      alert(err.message || "Failed running movement correction action.");
    }
  };

  const handleOpenCreateProduct = () => {
    setProdIsEdit(false);
    setEditProdId(null);
    setProdName("");
    setProdSku("");
    setProdBarcode("");
    setProdCategory(categories[0]?.name || "");
    setProdDescription("");
    setProdPrice(95.00);
    setProdQty(50);
    setProdSupplier(suppliers[0]?.company_name || "");
    setProdImage("");
    setProdError("");
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setProdIsEdit(true);
    setEditProdId(prod.id);
    setProdName(prod.name);
    setProdSku(prod.sku);
    setProdBarcode(prod.barcode);
    setProdCategory(prod.category);
    setProdDescription(prod.description);
    setProdPrice(prod.price);
    setProdQty(prod.quantity);
    setProdSupplier(prod.supplier);
    setProdImage(prod.image);
    setProdError("");
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProdError("");

    const payload = {
      name: prodName,
      sku: prodSku,
      barcode: prodBarcode,
      category: prodCategory,
      description: prodDescription,
      price: prodPrice,
      quantity: prodQty,
      supplier: prodSupplier,
      image: prodImage || undefined
    };

    try {
      if (prodIsEdit && editProdId) {
        await apiFetch(`/api/wms/products/${editProdId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch("/api/wms/products", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
      setShowProductModal(false);
      refreshAll();
    } catch (err: any) {
      setProdError(err.message || "Error submitting listing.");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Are you positive you wish to remove this product and erase its audit logs from database? This is cascading.")) return;
    try {
      await apiFetch(`/api/wms/products/${id}`, { method: "DELETE" });
      refreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError("");
    try {
      await apiFetch("/api/wms/categories", {
        method: "POST",
        body: JSON.stringify({ name: newCatName, description: newCatDesc })
      });
      setNewCatName("");
      setNewCatDesc("");
      setShowCatModal(false);
      refreshAll();
    } catch (err: any) {
      setCatError(err.message || "Error creating group.");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm("Delete this product category taxonomy? Current products will lose their categorized ties.")) return;
    try {
      await apiFetch(`/api/wms/categories/${id}`, { method: "DELETE" });
      refreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filters math
  const filteredProducts = products.filter(p => {
    const term = productSearch.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term) || p.barcode.includes(term);
    const matchCat = categoryFilter === "ALL" || p.category === categoryFilter;

    let matchStock = true;
    if (stockLevelFilter === "LOW") {
      matchStock = p.quantity <= 15;
    } else if (stockLevelFilter === "OK") {
      matchStock = p.quantity > 15;
    }

    return matchSearch && matchCat && matchStock;
  });

  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentList = filteredProducts.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* SECTION SUB NAVIGATION BAR */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-1 gap-2">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveWmsTab("catalog")}
            className={`pb-3 text-xs font-semibold select-none flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeWmsTab === "catalog"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <Package size={15} /> Physical Products Catalog
          </button>
          <button
            onClick={() => setActiveWmsTab("categories")}
            className={`pb-3 text-xs font-semibold select-none flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeWmsTab === "categories"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <Layers size={15} /> Taxonomy & Categories
          </button>
          <button
            onClick={() => setActiveWmsTab("history")}
            className={`pb-3 text-xs font-semibold select-none flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeWmsTab === "history"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <TrendingUp size={15} /> Inventory Audit Logs
          </button>
        </div>

        {activeWmsTab === "catalog" && user?.role !== "Employee" && (
          <button
            onClick={handleOpenCreateProduct}
            className="mb-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle size={14} /> Style Setup
          </button>
        )}
        {activeWmsTab === "categories" && user?.role !== "Employee" && (
          <button
            onClick={() => setShowCatModal(true)}
            className="mb-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle size={14} /> New Group
          </button>
        )}
      </div>

      {/* VIEW PANEL: PRODUCTS CATALOG */}
      {activeWmsTab === "catalog" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
          {/* SEARCH ACTIONS BAR */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-[#94A3B8]" size={14} />
              <input
                type="text"
                placeholder="Search style names, bar codes, raw sku parameters..."
                value={productSearch}
                onChange={e => {
                  setProductSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-[#2563EB]/40 outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={e => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#64748B] focus:ring-1 focus:ring-[#2563EB]/40 outline-none"
              >
                <option value="ALL">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Stock Alarm Filter */}
              <select
                value={stockLevelFilter}
                onChange={e => {
                  setStockLevelFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#64748B] focus:ring-1 focus:ring-[#2563EB]/40 outline-none"
              >
                <option value="ALL">All Stock Levels</option>
                <option value="LOW">Low Stock Warn (&le; 15 units)</option>
                <option value="OK">In Stock (&gt; 15 units)</option>
              </select>
            </div>
          </div>

          {/* GRID OF PRODUCT CARDS AND SECTIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentList.length === 0 ? (
              <div className="col-span-full text-center py-16 text-[#94A3B8] font-medium text-xs">
                No active styles match standard search. Let's introduce a style!
              </div>
            ) : (
              currentList.map(p => {
                const isLow = p.quantity <= 15;
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl border border-[#E2E8F0] hover:border-[#2563EB]/40 transition-all flex flex-col justify-between overflow-hidden relative shadow-xs"
                  >
                    {/* Style Header Thumbnail */}
                    <div className="relative h-44 bg-[#F8FAFC] flex justify-center items-center">
                      <img
                        src={p.image}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {isLow && (
                        <div className="absolute top-2 left-2 bg-[#EF4444] text-white px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 shadow-sm">
                          <AlertTriangle size={10} /> REORDER REQUIRED
                        </div>
                      )}
                      <span className="absolute bottom-2 right-2 bg-white/95 border border-[#E2E8F0] px-2 py-0.5 rounded text-[9px] font-mono font-bold text-[#0F172A] shadow-xs">
                        {p.barcode}
                      </span>
                    </div>

                    {/* Specifications List */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold font-mono text-[#94A3B8]">
                          {p.category}
                        </span>
                        <h4 className="font-sans font-bold text-xs text-[#0F172A] leading-tight line-clamp-1">
                          {p.name}
                        </h4>
                        <p className="font-mono text-[9px] text-[#64748B] font-semibold">SKU: {p.sku}</p>
                        <p className="text-[11px] text-[#475569] leading-relaxed line-clamp-2 mt-1">
                          {p.description || "No specifications logged."}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
                        {/* Cost & Stocks levels */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[9px] uppercase font-mono text-[#64748B] block font-bold">Wholesale Price</span>
                            <span className="font-mono text-sm font-bold text-[#2563EB]">${p.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] uppercase font-mono text-[#64748B] block font-bold">Active Stocks</span>
                            <span
                              className={`font-mono text-sm font-bold block ${
                                isLow ? "text-[#EF4444]" : "text-[#10B981]"
                              }`}
                            >
                              {p.quantity} units
                            </span>
                          </div>
                        </div>

                        {/* Inventory adjustments and management actions */}
                        <div className="flex gap-1 pt-1">
                          {user?.role !== "Employee" ? (
                            <>
                              <button
                                onClick={() => handleOpenStockMove(p, "Stock In")}
                                className="flex-1 bg-[#F1F5F9] hover:bg-[#10B981]/10 text-[#475569] hover:text-[#10B981] py-1.5 rounded text-[10px] font-sans font-bold flex items-center justify-center gap-1 transition-all"
                                title="Bulk Stock In"
                              >
                                <Plus size={11} /> Stock In
                              </button>
                              <button
                                onClick={() => handleOpenStockMove(p, "Stock Out")}
                                className="flex-1 bg-[#F1F5F9] hover:bg-[#EF4444]/10 text-[#475569] hover:text-[#EF4444] py-1.5 rounded text-[10px] font-sans font-bold flex items-center justify-center gap-1 transition-all"
                                title="Fulfillment Out"
                              >
                                <Minus size={11} /> Stock Out
                              </button>
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="bg-[#F1F5F9] hover:bg-[#2563EB]/10 text-[#64748B] hover:text-[#2563EB] p-1.5 rounded transition-all"
                                title="Edit Catalog Specifications"
                              >
                                <Edit size={11} />
                              </button>
                              {user?.role === "Admin" && (
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="bg-[#F1F5F9] hover:bg-[#EF4444]/10 text-[#64748B] hover:text-[#EF4444] p-1.5 rounded transition-all"
                                  title="Unsafe Catalog Delete"
                                >
                                  <Trash2 size={11} />
                                </button>
                              )}
                            </>
                          ) : (
                            <div className="w-full text-center py-2 font-mono text-[9px] text-[#94A3B8] font-bold border border-dashed border-[#E2E8F0] rounded">
                              READ-ONLY CATALOG OVERVIEW
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* CATALOG PAGINATIONS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs pt-3">
              <span className="text-[#64748B]">
                Showing page {currentPage} of {totalPages} ({filteredProducts.length} filtered styles)
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-2.5 py-1 bg-white border border-[#E2E8F0] rounded hover:bg-[#F8FAFC] disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-2.5 py-1 bg-white border border-[#E2E8F0] rounded hover:bg-[#F8FAFC] disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW PANEL: CATEGORIES TAXONOMY */}
      {activeWmsTab === "categories" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4 max-w-2xl">
          <div>
            <h3 className="font-sans font-bold text-sm text-[#0F172A]">Taxonomy Categories Registry</h3>
            <p className="text-xs text-[#64748B]">Organize clothing collections, apparel lines, and fabric tags.</p>
          </div>

          <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] font-semibold h-10 bg-[#F8FAFC]">
                  <th className="px-4">Group Name</th>
                  <th className="px-4">Description Text</th>
                  {user?.role === "Admin" && <th className="px-4 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {categories.map(cat => (
                  <tr key={cat.id} className="h-11 hover:bg-[#F8FAFC]">
                    <td className="px-4 font-bold text-[#0F172A]">{cat.name}</td>
                    <td className="px-4 text-[#64748B]">{cat.description || "No descriptions set."}</td>
                    {user?.role === "Admin" && (
                      <td className="px-4 text-right">
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="text-[#EF4444] hover:text-[#DC2626] font-semibold"
                        >
                          <Trash2 size={13} className="inline mr-1" /> Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW PANEL: INVENTORY AUDIT HISTORY LOGS */}
      {activeWmsTab === "history" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-sans font-bold text-sm text-[#0F172A]">WMS Stock Movement Histograms</h3>
              <p className="text-xs text-[#64748B]">Real-time transactional log of all entries, evacuations, and corrections.</p>
            </div>
            <button
              onClick={loadHistoryLogs}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
              disabled={loadingHistory}
            >
              {loadingHistory ? "Syncing ledger..." : "Refresh ledger"}
            </button>
          </div>

          {loadingHistory ? (
            <div className="text-center py-10 text-[#64748B] text-xs">Loading transactional ledger data...</div>
          ) : (
            <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] font-semibold h-10 bg-[#F8FAFC]">
                    <th className="px-4">Move ID</th>
                    <th className="px-4">Dynamic Product SKU</th>
                    <th className="px-4 text-center">Movement Type</th>
                    <th className="px-4 text-center">Quantity</th>
                    <th className="px-4">Fulfillment Reason</th>
                    <th className="px-4">Audited Date/Time</th>
                    <th className="px-4">Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-[#94A3B8]">
                        No movements completed inside log.
                      </td>
                    </tr>
                  ) : (
                    [...history].reverse().map(h => (
                      <tr key={h.id} className="h-11 hover:bg-[#F8FAFC]">
                        <td className="px-4 font-mono font-bold text-[#64748B]">{h.id}</td>
                        <td className="px-4">
                          <p className="font-semibold text-[#0F172A]">{h.product_name}</p>
                          <span className="font-mono text-[9px] text-[#94A3B8] block">{h.sku}</span>
                        </td>
                        <td className="px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              h.move_type === "Stock In"
                                ? "bg-[#10B981]/10 text-[#10B981]"
                                : "bg-[#EF4444]/10 text-[#EF4444]"
                            }`}
                          >
                            {h.move_type === "Stock In" ? (
                              <>
                                <ArrowUpRight size={10} /> Stock In
                              </>
                            ) : (
                              <>
                                <ArrowDownRight size={10} /> Stock Out
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 text-center font-mono font-bold text-[#0F172A]">{h.quantity} pcs</td>
                        <td className="px-4 text-[#475569] max-w-xs truncate">{h.reason}</td>
                        <td className="px-4 text-[#64748B]">{new Date(h.created_at).toLocaleString()}</td>
                        <td className="px-4 font-medium text-[#475569]">{h.user}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL WINDOW: STYLE SETUP AND INTRODUCTIONS */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl max-w-xl w-full overflow-hidden">
            <div className="bg-[#2563EB] p-4 flex items-center justify-between text-white">
              <h3 className="font-sans font-bold text-sm">
                {prodIsEdit ? "Modify Styling & Specs" : "Introduce Wholesale Apparel Style"}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="hover:text-red-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-5 space-y-4">
              {prodError && (
                <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-semibold rounded-lg">
                  {prodError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Apparel Model / Style Name *</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={e => setProdName(e.target.value)}
                    placeholder="e.g. Heavyweight Indigo Cotton Crewneck"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Style SKU code *</label>
                  <input
                    type="text"
                    required
                    disabled={prodIsEdit}
                    value={prodSku}
                    onChange={e => setProdSku(e.target.value)}
                    placeholder="e.g. KNT-HDY-ORG-001"
                    className="w-full bg-[#F8FAFC] disabled:opacity-50 border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Barcode (EAN-13/UPC) *</label>
                  <input
                    type="text"
                    required
                    disabled={prodIsEdit}
                    value={prodBarcode}
                    onChange={e => setProdBarcode(e.target.value)}
                    placeholder="e.g. 840192003810"
                    className="w-full bg-[#F8FAFC] disabled:opacity-50 border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Apparel Category *</label>
                  <select
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Assigned Production Vendor</label>
                  <select
                    value={prodSupplier}
                    onChange={e => setProdSupplier(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  >
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.company_name}>
                        {sup.company_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Wholesale Unit Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodPrice}
                    onChange={e => setProdPrice(parseFloat(e.target.value))}
                    placeholder="e.g. 145.00"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Inaugural Stock Level *</label>
                  <input
                    type="number"
                    required
                    value={prodQty}
                    onChange={e => setProdQty(parseInt(e.target.value))}
                    placeholder="Initial stock balance"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Style Image URL (High Resolution)</label>
                  <input
                    type="text"
                    value={prodImage}
                    onChange={e => setProdImage(e.target.value)}
                    placeholder="e.g. https://images.unsplash.com/..."
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Model Fabrication & Details</label>
                  <textarea
                    value={prodDescription}
                    onChange={e => setProdDescription(e.target.value)}
                    placeholder="Detailed specifications (e.g. 100% fine organic ring-spun cotton, loopback lining...)"
                    rows={2}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB] resize-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 hover:bg-[#F8FAFC] border border-[#E2E8F0] text-slate-500 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Style Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WINDOW: DYNAMIC STOCK IN & STOCK OUT */}
      {showMoveModal && moveProduct && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-[#2563EB] p-4 flex items-center justify-between text-white">
              <h3 className="font-sans font-bold text-sm">
                Perform Inventory Correction Ledger: {moveType}
              </h3>
              <button onClick={() => setShowMoveModal(false)} className="hover:text-red-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStockMoveSubmit} className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] font-mono tracking-widest text-[#94A3B8] font-bold uppercase">Target Product</span>
                <p className="text-xs font-bold text-[#0F172A]">{moveProduct.name}</p>
                <div className="flex justify-between items-center text-[10px] font-mono text-[#64748B] pt-1">
                  <span>SKU: {moveProduct.sku}</span>
                  <span>Balance: <strong className="text-[#0F172A]">{moveProduct.quantity} units</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Action Type</label>
                  <div className="border border-[#E2E8F0] px-3 py-2 rounded-lg text-xs font-semibold bg-[#F8FAFC] text-slate-700 capitalize">
                    {moveType}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Batch Quantity *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={moveQty}
                    onChange={e => setMoveQty(Math.max(1, parseInt(e.target.value)))}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Movement Manifest/Reason *</label>
                  <input
                    type="text"
                    required
                    value={moveReason}
                    onChange={e => setMoveReason(e.target.value)}
                    placeholder="Specify physical reason for adjustment"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowMoveModal(false)}
                  className="px-4 py-2 hover:bg-[#F8FAFC] border border-[#E2E8F0] text-slate-500 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-lg shadow-sm"
                >
                  Confirm Stock Move
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WINDOW: CREATE CATEGORY TAXONOMY */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl max-w-sm w-full overflow-hidden">
            <div className="bg-[#2563EB] p-4 flex items-center justify-between text-white">
              <h3 className="font-sans font-bold text-sm">Add Taxonomy Category group</h3>
              <button onClick={() => setShowCatModal(false)} className="hover:text-red-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="p-5 space-y-4">
              {catError && (
                <div className="p-2 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-[11px] font-semibold rounded">
                  {catError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Category Group Name *</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="e.g. Premium Silk Scarf"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-[#64748B]">Fabric / Collection Descriptions</label>
                <textarea
                  value={newCatDesc}
                  onChange={e => setNewCatDesc(e.target.value)}
                  placeholder="Provide collection synopsis..."
                  rows={2}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#2563EB] resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 hover:bg-[#F8FAFC] border border-[#E2E8F0] text-slate-500 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-lg shadow-sm"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
