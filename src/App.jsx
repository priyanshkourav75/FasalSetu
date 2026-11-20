
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const API_URL = `${API_BASE_URL}/api/auth`;
const PRODUCT_API = `${API_BASE_URL}/api/products`;

const retailers = [
  { name: "Sharma Krishi Kendra", area: "Main Market", initials: "SK" },
  { name: "Kisan Beej Bhandar", area: "Bus Stand Road", initials: "KB" },
  { name: "Patel Agro Centre", area: "Near Mandi", initials: "PA" },
  { name: "Gupta Fertilizers", area: "Old Market", initials: "GF" }
];

const companies = ["IFFCO", "BAYER", "UPL", "SYNGENTA", "MAHADHAN", "RALLIS"];

function BrandLogo() {
  return (
    <div className="brand">
      <div className="brand-icon">🌿</div>
      <div>
        <h2>Fasal<span>Setu</span></h2>
        <small>FARMERS FIRST</small>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "13px",
  border: "1px solid #dce5dd",
  borderRadius: "9px",
  fontSize: "14px",
  outline: "none",
  background: "#fff",
  color: "#17251c",
  boxSizing: "border-box"
};

const primaryStyle = {
  width: "100%",
  padding: "14px",
  border: "none",
  borderRadius: "10px",
  background: "#237b42",
  color: "white",
  fontWeight: 700,
  fontSize: "15px",
  cursor: "pointer"
};

// ================= MY ACCOUNT =================

function AccountDetails({ user, onBack, onLogout }) {
  const isRetailer = user?.role === "retailer";

  const detailStyle = {
    background: "#f6f9f6",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12
  };

  const labelStyle = {
    color: "#758278",
    fontSize: 12,
    marginBottom: 5
  };

  const valueStyle = {
    color: "#203327",
    fontWeight: 700,
    fontSize: 15,
    overflowWrap: "anywhere"
  };

  function Detail({ label, value }) {
    return (
      <div style={detailStyle}>
        <div style={labelStyle}>{label}</div>
        <div style={valueStyle}>{value || "Not provided"}</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f4f7f4",
      color: "#203327"
    }}>
      <header style={{
        background: "white",
        padding: "15px 5%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
        borderBottom: "1px solid #e5ebe5"
      }}>
        <BrandLogo />

        <button
          onClick={onBack}
          style={{
            background: "#237b42",
            color: "white",
            border: 0,
            padding: "11px 18px",
            borderRadius: 9,
            cursor: "pointer",
            fontWeight: 700
          }}
        >
          ← Back
        </button>
      </header>

      <main style={{
        width: "min(94%, 850px)",
        margin: "35px auto",
        background: "white",
        padding: 25,
        borderRadius: 18,
        boxShadow: "0 5px 25px #183d1710"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          paddingBottom: 22,
          borderBottom: "1px solid #edf1ed",
          marginBottom: 24
        }}>
          <div style={{
            width: 65,
            height: 65,
            borderRadius: "50%",
            background: "#e5f3e8",
            color: "#237b42",
            display: "grid",
            placeItems: "center",
            fontSize: 30
          }}>
            {isRetailer ? "🏪" : "👨‍🌾"}
          </div>

          <div>
            <h2 style={{ margin: 0, color: "#205c35" }}>My Account</h2>
            <p style={{ margin: "6px 0 0", color: "#758278" }}>
              Welcome, {user?.name || "User"}
            </p>
          </div>
        </div>

        <h3 style={{ color: "#205c35" }}>Personal Information</h3>

        <Detail label="Full Name" value={user?.name} />
        <Detail label="Email Address" value={user?.email} />
        <Detail label="Mobile Number" value={user?.mobile} />
        <Detail
          label="Account Type"
          value={isRetailer ? "Retailer" : "Farmer"}
        />

        {isRetailer && (
          <>
            <h3 style={{ color: "#205c35", marginTop: 25 }}>Shop Information</h3>
            <Detail label="Shop Name" value={user?.shopName} />
            <Detail label="Shop Address" value={user?.shopAddress} />
            <Detail label="PIN Code" value={user?.pincode} />
          </>
        )}

        {!isRetailer && (
          <>
            <h3 style={{ color: "#205c35", marginTop: 25 }}>Location</h3>
            <Detail
              label="Village / Town"
              value={JSON.parse(localStorage.getItem("fasalsetu_area") || "null")?.village}
            />
            <Detail
              label="PIN Code"
              value={JSON.parse(localStorage.getItem("fasalsetu_area") || "null")?.pincode}
            />
          </>
        )}

        <div style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginTop: 25
        }}>
          <button onClick={onBack} style={{
            ...primaryStyle,
            width: "auto",
            flex: 1
          }}>
            Continue to FasalSetu
          </button>

          <button onClick={onLogout} style={{
            ...primaryStyle,
            width: "auto",
            flex: 1,
            background: "#fff0ed",
            color: "#b34232"
          }}>
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}

// ================= RETAILER DASHBOARD =================

function RetailerDashboard({ user, onLogout, onHome, onAccount }) {
  const [section, setSection] = useState("Overview");
  const [items, setItems] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    company: "",
    category: "Fertilizers",
    price: "",
    stock: ""
  });

  const token = localStorage.getItem("fasalsetu_token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  async function loadProducts() {
    try {
      setLoading(true);

      const response = await fetch(`${PRODUCT_API}/my`, { headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load products.");
      }

      setItems(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const totalStock = items.reduce(
    (sum, item) => sum + Number(item.stock || 0), 0
  );

  const inventoryValue = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.stock || 0), 0
  );

  const menu = [
    ["Overview", "▦"],
    ["Products", "📦"],
    ["Inventory", "📊"],
    ["Orders", "🛒"],
    ["Pricing", "₹"],
    ["Sales Reports", "📈"],
    ["Shop Profile", "🏪"],
    ["Customers", "👥"],
    ["Settings", "⚙️"],
    ["My Account", "👤"]
  ];

  const buttonStyle = {
    background: "#237b42",
    color: "white",
    border: 0,
    borderRadius: 9,
    padding: "11px 17px",
    cursor: "pointer",
    fontWeight: 700
  };

  const cardStyle = {
    background: "white",
    border: "1px solid #e7eee8",
    borderRadius: 14,
    padding: 20
  };

  function openAdd() {
    setForm({
      name: "",
      company: "",
      category: "Fertilizers",
      price: "",
      stock: ""
    });
    setEditId(null);
    setFormOpen(true);
    setMessage("");
  }

  function openEdit(item) {
    setForm({
      name: item.name,
      company: item.company || "",
      category: item.category,
      price: String(item.price),
      stock: String(item.stock)
    });
    setEditId(item._id);
    setFormOpen(true);
    setMessage("");
  }

  async function submitProduct(e) {
    e.preventDefault();
    setMessage("");

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (
      !form.name.trim() ||
      !form.company.trim() ||
      !Number.isFinite(price) ||
      !Number.isInteger(stock) ||
      price <= 0 ||
      stock < 0
    ) {
      setMessage("Please enter valid product details.");
      return;
    }

    const productData = {
      name: form.name.trim(),
      company: form.company.trim(),
      category: form.category,
      price,
      stock
    };

    try {
      setSaving(true);

      const response = await fetch(
        editId ? `${PRODUCT_API}/${editId}` : PRODUCT_API,
        {
          method: editId ? "PUT" : "POST",
          headers,
          body: JSON.stringify(productData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save product.");
      }

      await loadProducts();
      setFormOpen(false);
      setEditId(null);
      setMessage("Product saved successfully!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Delete this product?")) return;

    try {
      const response = await fetch(`${PRODUCT_API}/${id}`, {
        method: "DELETE",
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete product.");
      }

      await loadProducts();
      setMessage("Product deleted successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function updateStock(item, change) {
    const newStock = Math.max(0, Number(item.stock) + change);

    try {
      const response = await fetch(`${PRODUCT_API}/${item._id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ stock: newStock })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Stock update failed.");
      }

      await loadProducts();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7f4", color: "#203327" }}>
      <header style={{
        background: "white",
        padding: "15px 4%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #e5ebe5",
        flexWrap: "wrap",
        gap: 12
      }}>
        <BrandLogo />

        <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
          <div style={{ textAlign: "right" }}>
            <strong>{user.shopName || user.name}</strong>
            <div style={{ fontSize: 12, color: "#758278" }}>Retailer Account</div>
          </div>

          <button onClick={onHome} style={{
            ...buttonStyle,
            background: "#e9f4eb",
            color: "#237b42"
          }}>
            🏠 Home
          </button>

          <button onClick={onAccount} style={{
            ...buttonStyle,
            background: "#edf2ed",
            color: "#237b42"
          }}>
            👤 My Account
          </button>

          <button onClick={onLogout} style={{
            ...buttonStyle,
            background: "#fff0ed",
            color: "#b34232"
          }}>
            Logout
          </button>
        </div>
      </header>

      <div className="retailer-layout">
        <aside className="retailer-sidebar">
          <div style={{ padding: "0 12px 22px", borderBottom: "1px solid #ffffff30" }}>
            <div style={{ fontSize: 12, color: "#b9d8c2" }}>BUSINESS PANEL</div>
            <h3 style={{ marginBottom: 4 }}>Shop Manager</h3>
            <small style={{ color: "#c6ddcc" }}>Manage your business</small>
          </div>

          <div style={{ display: "grid", gap: 7, marginTop: 20 }}>
            {menu.map(([name, icon]) => (
              <button
                key={name}
                onClick={() => {
                  if (name === "My Account") {
                    onAccount();
                    return;
                  }

                  setSection(name);
                  setFormOpen(false);
                  setMessage("");
                }}
                style={{
                  border: 0,
                  borderRadius: 9,
                  padding: "13px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                  background: section === name ? "#ffffff" : "transparent",
                  color: section === name ? "#1b6338" : "#e7f2e9",
                  fontWeight: 700,
                  fontSize: 14
                }}
              >
                <span style={{ display: "inline-block", width: 28 }}>{icon}</span>
                {name}
              </button>
            ))}
          </div>
        </aside>

        <main style={{ padding: "28px 3%", minWidth: 0 }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 25
          }}>
            <div>
              <h1 style={{ margin: 0, color: "#1c6636", fontSize: 27 }}>{section}</h1>
              <p style={{ color: "#758278", margin: "7px 0 0" }}>
                Welcome, {user.name}. Manage your shop from here.
              </p>
            </div>

            {section === "Products" && !formOpen && (
              <button style={buttonStyle} onClick={openAdd}>
                ＋ Add Product
              </button>
            )}
          </div>

          {message && (
            <p style={{
              background: "#fff4e5",
              color: "#8a5010",
              padding: 12,
              borderRadius: 8
            }}>
              {message}
            </p>
          )}

          {loading ? (
            <div style={cardStyle}>Loading your products...</div>
          ) : (
            <>
              {section === "Overview" && (
                <>
                  <div className="retailer-stat-grid">
                    {[
                      ["Total Products", items.length, "📦"],
                      ["Total Stock Units", totalStock, "📊"],
                      ["Inventory Value", `₹${inventoryValue.toLocaleString("en-IN")}`, "💰"],
                      ["Orders", "0", "🛒"]
                    ].map(([label, value, icon]) => (
                      <div key={label} style={cardStyle}>
                        <div style={{ fontSize: 25 }}>{icon}</div>
                        <p style={{ color: "#758278", marginBottom: 7 }}>{label}</p>
                        <h2 style={{ color: "#1c6636", margin: 0 }}>{value}</h2>
                      </div>
                    ))}
                  </div>

                  <div style={{ ...cardStyle, marginTop: 20 }}>
                    <h3>Quick Actions</h3>
                    <button style={buttonStyle} onClick={() => {
                      setSection("Products");
                      openAdd();
                    }}>
                      ＋ Add New Product
                    </button>
                  </div>

                  <div style={{ ...cardStyle, marginTop: 20 }}>
                    <h3>Recently Added Products</h3>
                    {items.length === 0 ? (
                      <p>No products added yet.</p>
                    ) : (
                      items.slice(0, 5).map(item => (
                        <div key={item._id} style={{
                          padding: 12,
                          borderBottom: "1px solid #edf1ed",
                          display: "flex",
                          justifyContent: "space-between"
                        }}>
                          <strong>{item.name}</strong>
                          <span>₹{Number(item.price).toLocaleString("en-IN")}</span>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {section === "Products" && (
                <div style={cardStyle}>
                  {formOpen ? (
                    <form onSubmit={submitProduct} style={{ maxWidth: 550, display: "grid", gap: 10 }}>
                      <h3>{editId ? "Edit Product" : "Add New Product"}</h3>

                      <label>Product Name</label>
                      <input style={inputStyle} value={form.name} required
                        placeholder="e.g. NPK Fertilizer"
                        onChange={e => setForm({ ...form, name: e.target.value })} />

                      <label>Company / Brand</label>
                      <input style={inputStyle} value={form.company} required
                        placeholder="e.g. IFFCO"
                        onChange={e => setForm({ ...form, company: e.target.value })} />

                      <label>Category</label>
                      <select style={inputStyle} value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value })}>
                        <option>Fertilizers</option>
                        <option>Seeds</option>
                      </select>

                      <label>Price (₹)</label>
                      <input style={inputStyle} type="number" min="0.01" step="0.01"
                        value={form.price} required
                        onChange={e => setForm({ ...form, price: e.target.value })} />

                      <label>Available Stock (units)</label>
                      <input style={inputStyle} type="number" min="0" step="1"
                        value={form.stock} required
                        onChange={e => setForm({ ...form, stock: e.target.value })} />

                      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                        <button style={buttonStyle} type="submit" disabled={saving}>
                          {saving ? "Saving..." : "Save Product"}
                        </button>
                        <button type="button" onClick={() => setFormOpen(false)}
                          style={{ ...buttonStyle, background: "#edf1ed", color: "#34483a" }}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h3>Your Product Catalogue</h3>

                      {items.length === 0 ? (
                        <div style={{ textAlign: "center", padding: 35 }}>
                          <div style={{ fontSize: 40 }}>📦</div>
                          <h3>No products yet</h3>
                          <p style={{ color: "#758278" }}>Add products to your shop catalogue.</p>
                          <button style={buttonStyle} onClick={openAdd}>＋ Add First Product</button>
                        </div>
                      ) : (
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 570 }}>
                            <thead>
                              <tr style={{ textAlign: "left", background: "#f2f7f2" }}>
                                {["Product", "Company", "Category", "Price", "Stock", "Actions"].map(x =>
                                  <th key={x} style={{ padding: 12 }}>{x}</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {items.map(item => (
                                <tr key={item._id} style={{ borderBottom: "1px solid #edf1ed" }}>
                                  <td style={{ padding: 12 }}>{item.name}</td>
                                  <td style={{ padding: 12 }}>{item.company}</td>
                                  <td style={{ padding: 12 }}>{item.category}</td>
                                  <td style={{ padding: 12 }}>₹{item.price}</td>
                                  <td style={{ padding: 12 }}>{item.stock}</td>
                                  <td style={{ padding: 12, whiteSpace: "nowrap" }}>
                                    <button onClick={() => openEdit(item)}
                                      style={{ border: 0, color: "#237b42", background: "none", cursor: "pointer" }}>
                                      Edit
                                    </button>
                                    <button onClick={() => deleteProduct(item._id)}
                                      style={{ border: 0, color: "#bd3939", background: "none", cursor: "pointer" }}>
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {section === "Inventory" && (
                <div style={cardStyle}>
                  <h3>Stock Overview</h3>
                  {items.length === 0 ? (
                    <p>Add products first to manage inventory.</p>
                  ) : items.map(item => (
                    <div key={item._id} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                      padding: 14,
                      borderBottom: "1px solid #edf1ed"
                    }}>
                      <div>
                        <strong>{item.name}</strong>
                        <div style={{ fontSize: 13, color: "#758278" }}>{item.company}</div>
                      </div>

                      <strong style={{ color: item.stock < 5 ? "#c04a36" : "#237b42" }}>
                        {item.stock} units {item.stock < 5 ? "• Low Stock" : ""}
                      </strong>

                      <div style={{ display: "flex", gap: 7 }}>
                        <button style={buttonStyle} onClick={() => updateStock(item, 1)}>＋</button>
                        <button style={{ ...buttonStyle, background: "#edf1ed", color: "#34483a" }}
                          disabled={item.stock === 0}
                          onClick={() => updateStock(item, -1)}>−</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section === "Pricing" && (
                <div style={cardStyle}>
                  <h3>Product Pricing</h3>
                  {items.length === 0 ? (
                    <p>Add products to manage prices.</p>
                  ) : items.map(item => (
                    <div key={item._id} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: 13,
                      borderBottom: "1px solid #edf1ed"
                    }}>
                      <strong>{item.name}</strong>
                      <span>₹{Number(item.price).toLocaleString("en-IN")}</span>
                      <button onClick={() => {
                        setSection("Products");
                        openEdit(item);
                      }} style={{ border: 0, background: "none", color: "#237b42", cursor: "pointer" }}>
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {section === "Shop Profile" && (
                <div style={cardStyle}>
                  <h3>Shop Information</h3>
                  <p><strong>Shop Name:</strong> {user.shopName || "Not provided"}</p>
                  <p><strong>Owner:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Mobile:</strong> {user.mobile || "Not provided"}</p>
                  <p><strong>Shop Address:</strong> {user.shopAddress || "Not provided"}</p>
                  <p><strong>PIN Code:</strong> {user.pincode || "Not provided"}</p>
                  <p style={{ color: "#758278" }}>Profile editing will be added later.</p>
                </div>
              )}

              {["Orders", "Sales Reports", "Customers", "Settings"].includes(section) && (
                <div style={{ ...cardStyle, textAlign: "center", padding: 40 }}>
                  <h2>{section}</h2>
                  <p style={{ color: "#758278" }}>
                    This module will be connected in a later step.
                  </p>
                  <small style={{ color: "#237b42" }}>Not connected yet.</small>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ================= MAIN APP =================

function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  const [authOpen, setAuthOpen] = useState(false);
  const [authScreen, setAuthScreen] = useState("role");
  const [authRole, setAuthRole] = useState("");
  const [authMode, setAuthMode] = useState("login");

  const [authName, setAuthName] = useState("");
  const [authShopName, setAuthShopName] = useState("");
  const [authMobile, setAuthMobile] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authIdentifier, setAuthIdentifier] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authAddress, setAuthAddress] = useState("");
  const [authPincode, setAuthPincode] = useState("");

  const [areaVillage, setAreaVillage] = useState("");
  const [areaPincode, setAreaPincode] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fasalsetu_user")) || null;
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("fasalsetu_user"));
      return savedUser?.role === "retailer" ? "dashboard" : "home";
    } catch {
      return "home";
    }
  });

  const [accountReturnPage, setAccountReturnPage] = useState("home");

  const [farmerArea, setFarmerArea] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fasalsetu_area")) || null;
    } catch {
      return null;
    }
  });

  async function loadPublicProducts() {
    try {
      setProductsLoading(true);
      setProductsError("");

      const response = await fetch(PRODUCT_API);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load products.");
      }

      const formattedProducts = data.map(product => ({
        ...product,
        id: product._id,
        emoji: product.category === "Seeds" ? "🌾" : "🌱",
        description: product.description || "Quality agricultural product"
      }));

      setProducts(formattedProducts);
    } catch (error) {
      setProductsError(error.message || "Could not connect to server.");
    } finally {
      setProductsLoading(false);
    }
  }

  useEffect(() => {
    loadPublicProducts();
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.company || "").toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  function addToCart(product) {
    setCart(current => {
      const existing = current.find(item => item.id === product.id);

      if (existing) {
        return current.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  }

  function increaseQuantity(id) {
    setCart(current =>
      current.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  function decreaseQuantity(id) {
    setCart(current =>
      current
        .map(item =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter(item => item.quantity > 0)
    );
  }

  function removeItem(id) {
    setCart(current => current.filter(item => item.id !== id));
  }

  function openAuth() {
    setAuthScreen("role");
    setAuthRole("");
    setAuthMode("login");
    setAuthMessage("");
    setAuthName("");
    setAuthShopName("");
    setAuthMobile("");
    setAuthEmail("");
    setAuthIdentifier("");
    setAuthPassword("");
    setAuthAddress("");
    setAuthPincode("");
    setAuthOpen(true);
  }

  function selectRole(role) {
    setAuthRole(role);
    setAuthMode("login");
    setAuthScreen("form");
    setAuthMessage("");
  }

  function openAccount(returnPage = "home") {
    setAccountReturnPage(returnPage);
    setPage("account");
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthMessage("");
    setAuthLoading(true);

    try {
      const endpoint = authMode === "signup" ? "/signup" : "/login";

      const body = authMode === "signup"
        ? {
            name: authName,
            email: authEmail,
            mobile: authMobile,
            password: authPassword,
            role: authRole,
            shopName: authRole === "retailer" ? authShopName : undefined,
            shopAddress: authRole === "retailer" ? authAddress : undefined,
            pincode: authPincode || undefined
          }
        : {
            identifier: authIdentifier.trim(),
            password: authPassword,
            role: authRole
          };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      localStorage.setItem("fasalsetu_token", data.token);
      localStorage.setItem("fasalsetu_user", JSON.stringify(data.user));

      setUser(data.user);
      setAuthPassword("");

      if (data.user.role === "farmer") {
        setPage("home");
        setAuthScreen("area");
        setAuthMessage("");
      } else {
        setPage("dashboard");
        setAuthOpen(false);
        alert(data.message || "Welcome to FasalSetu!");
      }
    } catch (error) {
      setAuthMessage(error.message || "Server connection failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  function saveFarmerArea(e) {
    e.preventDefault();

    if (!areaVillage.trim() || !/^\d{6}$/.test(areaPincode)) {
      setAuthMessage("Please enter your village and a valid 6-digit PIN code.");
      return;
    }

    const area = {
      village: areaVillage.trim(),
      pincode: areaPincode
    };

    localStorage.setItem("fasalsetu_area", JSON.stringify(area));
    setFarmerArea(area);
    setAuthMessage("");
    setAuthOpen(false);
    setPage("home");
    alert("Welcome to FasalSetu!");
  }

  function logout() {
    localStorage.removeItem("fasalsetu_token");
    localStorage.removeItem("fasalsetu_user");
    localStorage.removeItem("fasalsetu_area");

    setUser(null);
    setFarmerArea(null);
    setPage("home");
    setCart([]);
    setCartOpen(false);
    setAuthOpen(false);

    alert("You have been logged out.");
  }

  if (page === "account" && user) {
    return (
      <AccountDetails
        user={user}
        onBack={() => setPage(accountReturnPage)}
        onLogout={logout}
      />
    );
  }

  if (user?.role === "retailer" && page === "dashboard") {
    return (
      <RetailerDashboard
        user={user}
        onLogout={logout}
        onHome={() => setPage("home")}
        onAccount={() => openAccount("dashboard")}
      />
    );
  }

  return (
    <div className="app">
      <header className="header">
        <BrandLogo />

        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search fertilizers, seeds and companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="header-actions">
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600, color: "#237b42" }}>
                Hi, {user.name}
              </span>

              {user.role === "retailer" && (
                <button
                  className="login-button"
                  onClick={() => setPage("dashboard")}
                >
                  Business Panel
                </button>
              )}

              <button
                className="login-button"
                onClick={() => openAccount("home")}
              >
                My Account
              </button>

              <button className="login-button" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <button className="login-button" onClick={openAuth}>
              Login / Signup
            </button>
          )}

          <button className="cart-button" onClick={() => setCartOpen(true)}>
            🛒 Cart ({cartCount})
          </button>
        </div>
      </header>

      <nav className="navbar">
        {["Home", "Fertilizers", "Seeds", "Companies", "Nearby Shops", "My Orders"].map(item => (
          <button
            key={item}
            onClick={() => {
              if (item === "Fertilizers" || item === "Seeds") {
                setActiveCategory(item);
                setCartOpen(false);
              } else if (item === "Home") {
                setActiveCategory("All");
                setSearch("");
                setCartOpen(false);
                setPage("home");
              } else if (item === "My Orders" && !user) {
                openAuth();
              } else if (item === "My Orders" && user?.role === "retailer") {
                setPage("dashboard");
                alert("Orders section is not connected yet.");
              } else if (item === "My Orders" && user?.role === "farmer") {
                alert("Your orders section will be connected later.");
              }
            }}
          >
            {item}
          </button>
        ))}
      </nav>

      <main className="main-layout">
        <aside className="sidebar">
          <h3>📍 Nearby Retailers</h3>
          <p className="muted">
            {farmerArea
              ? `Shops around ${farmerArea.village} - ${farmerArea.pincode}`
              : "Agriculture shops around you"}
          </p>

          {retailers.map(shop => (
            <div className="retailer" key={shop.name}>
              <div className="retailer-logo">{shop.initials}</div>
              <div>
                <strong>{shop.name}</strong>
                <small>{shop.area}</small>
                <small className="open-status">● Open</small>
              </div>
            </div>
          ))}

          <button className="outline-button">Explore All Retailers</button>

          {user?.role === "farmer" && (
            <button
              className="outline-button"
              style={{ marginTop: 10 }}
              onClick={() => {
                setAreaVillage(farmerArea?.village || "");
                setAreaPincode(farmerArea?.pincode || "");
                setAuthMessage("");
                setAuthScreen("area");
                setAuthOpen(true);
              }}
            >
              Change My Area
            </button>
          )}
        </aside>

        <section className="content">
          <section className="hero">
            <div className="hero-content">
              <span className="hero-tag">WELCOME TO FASALSETU</span>
              <h1>Everything your farm needs, in one place.</h1>
              <p>
                Discover agricultural products from trusted companies and nearby retailers.
              </p>
              <button
                className="primary-button"
                onClick={() => {
                  setActiveCategory("All");
                  document.getElementById("products")?.scrollIntoView({
                    behavior: "smooth"
                  });
                }}
              >
                Explore Products →
              </button>
            </div>
          </section>

          <section className="companies-section">
            <h3>Trusted Companies</h3>
            <div className="company-list">
              {companies.map(company => (
                <div className="company-logo" key={company}>{company}</div>
              ))}
            </div>
          </section>

          <section className="trust-section">
            <div>📍 <strong>Nearby Retailers</strong><small>Find local shops</small></div>
            <div>💰 <strong>Compare Prices</strong><small>Choose better deals</small></div>
            <div>✓ <strong>Trusted Companies</strong><small>Quality products</small></div>
          </section>

          <section className="products-section" id="products">
            <div className="section-heading">
              <div>
                <h2>Popular Products</h2>
                <p>Explore products for your farming needs</p>
              </div>

              <div className="filter-buttons">
                {["All", "Fertilizers", "Seeds"].map(category => (
                  <button
                    key={category}
                    className={activeCategory === category ? "active" : ""}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {productsLoading ? (
              <p>Loading products from FasalSetu...</p>
            ) : productsError ? (
              <div style={{
                background: "#fff0f0",
                color: "#bd2828",
                padding: 15,
                borderRadius: 10
              }}>
                {productsError}
                <button
                  onClick={loadPublicProducts}
                  style={{ marginLeft: 12, cursor: "pointer" }}
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map(product => (
                  <div className="product-card" key={product.id}>
                    <div className="product-image">{product.emoji}</div>
                    <span className="product-company">{product.company}</span>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <strong className="product-price">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </strong>
                    <button
                      className="add-button"
                      disabled={Number(product.stock) <= 0}
                      onClick={() => addToCart(product)}
                    >
                      {Number(product.stock) <= 0 ? "Out of Stock" : "+ Add to Cart"}
                    </button>
                  </div>
                ))}

                {filteredProducts.length === 0 && (
                  <p>No products found. Retailers can add products to the catalogue.</p>
                )}
              </div>
            )}
          </section>
        </section>
      </main>

      <footer className="footer">
        <BrandLogo />
        <p>Connecting Farmers with Trusted Agriculture Retailers.</p>
      </footer>

      {authOpen && (
        <div
          className="cart-overlay"
          onClick={() => {
            setAuthOpen(false);
            setAuthMessage("");
          }}
        >
          <section
            className="cart-panel"
            style={{
              width: "min(94vw, 490px)",
              maxWidth: 490,
              height: "auto",
              maxHeight: "92vh",
              overflowY: "auto",
              margin: "auto",
              borderRadius: 20,
              padding: 28,
              background: "white"
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 22
            }}>
              <BrandLogo />
              <button className="close-cart" onClick={() => setAuthOpen(false)}>✕</button>
            </div>

            {authScreen === "role" && (
              <div>
                <div style={{ textAlign: "center", marginBottom: 25 }}>
                  <h2 style={{ color: "#205c35", marginBottom: 8 }}>Welcome to FasalSetu</h2>
                  <p style={{ color: "#718078" }}>Select how you want to continue</p>
                </div>

                <div style={{ display: "grid", gap: 15 }}>
                  <button type="button" onClick={() => selectRole("farmer")} style={{
                    padding: 22,
                    border: "1px solid #d9e9dc",
                    borderRadius: 16,
                    background: "linear-gradient(120deg,#eff9ef,#ffffff)",
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    textAlign: "left",
                    cursor: "pointer",
                    color: "#205c35"
                  }}>
                    <span style={{ fontSize: 36, background: "#dff2df", padding: 13, borderRadius: 13 }}>🌾</span>
                    <span>
                      <strong style={{ display: "block", fontSize: 19 }}>I'm a Farmer</strong>
                      <small>Discover products and nearby shops</small>
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: 22 }}>→</span>
                  </button>

                  <button type="button" onClick={() => selectRole("retailer")} style={{
                    padding: 22,
                    border: "1px solid #eadfca",
                    borderRadius: 16,
                    background: "linear-gradient(120deg,#fff8e9,#ffffff)",
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    textAlign: "left",
                    cursor: "pointer",
                    color: "#79551b"
                  }}>
                    <span style={{ fontSize: 36, background: "#f8ebcd", padding: 13, borderRadius: 13 }}>🏪</span>
                    <span>
                      <strong style={{ display: "block", fontSize: 19 }}>I'm a Retailer</strong>
                      <small>Manage your shop and business</small>
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: 22 }}>→</span>
                  </button>
                </div>
              </div>
            )}

            {authScreen === "form" && (
              <>
                <button type="button" onClick={() => {
                  setAuthScreen("role");
                  setAuthMessage("");
                }} style={{
                  border: "none",
                  background: "none",
                  color: "#237b42",
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: 0,
                  marginBottom: 15
                }}>
                  ← Change account type
                </button>

                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 36 }}>{authRole === "farmer" ? "🌾" : "🏪"}</div>
                  <h2 style={{ color: "#205c35", margin: "6px 0" }}>
                    {authRole === "farmer" ? "Farmer Account" : "Retailer Account"}
                  </h2>
                  <p style={{ color: "#718078", margin: 0 }}>
                    {authMode === "login" ? "Welcome back! Login to continue." : "Create your FasalSetu account"}
                  </p>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  background: "#f0f5f0",
                  padding: 5,
                  borderRadius: 10,
                  marginBottom: 20
                }}>
                  {["login", "signup"].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setAuthMode(mode);
                        setAuthMessage("");
                      }}
                      style={{
                        padding: 11,
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 700,
                        background: authMode === mode ? "#237b42" : "transparent",
                        color: authMode === mode ? "white" : "#526456"
                      }}
                    >
                      {mode === "login" ? "Login" : "Create Account"}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleAuthSubmit} style={{ display: "grid", gap: 12 }}>
                  {authMode === "signup" && (
                    <>
                      <label>Owner / Full Name</label>
                      <input style={inputStyle} placeholder="Enter your full name"
                        value={authName} onChange={e => setAuthName(e.target.value)} required />

                      {authRole === "retailer" && (
                        <>
                          <label>Shop Name</label>
                          <input style={inputStyle} placeholder="Enter your shop name"
                            value={authShopName} onChange={e => setAuthShopName(e.target.value)} required />
                        </>
                      )}

                      <label>Mobile Number</label>
                      <input style={inputStyle} type="tel" placeholder="10-digit mobile number"
                        value={authMobile}
                        onChange={e => setAuthMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        pattern="[6-9][0-9]{9}" required />

                      <label>Email Address</label>
                      <input style={inputStyle} type="email" placeholder="Enter your email"
                        value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />

                      {authRole === "retailer" && (
                        <>
                          <label>Shop Address</label>
                          <input style={inputStyle} placeholder="Shop address"
                            value={authAddress} onChange={e => setAuthAddress(e.target.value)} required />

                          <label>PIN Code</label>
                          <input style={inputStyle} placeholder="6-digit PIN code"
                            value={authPincode}
                            onChange={e => setAuthPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            pattern="[0-9]{6}" required />
                        </>
                      )}
                    </>
                  )}

                  {authMode === "login" && (
                    <>
                      <label>Email ID or Mobile Number</label>
                      <input style={inputStyle} placeholder="Enter email or mobile number"
                        value={authIdentifier} onChange={e => setAuthIdentifier(e.target.value)} required />
                    </>
                  )}

                  <label>Password</label>
                  <input style={inputStyle} type="password" placeholder="Minimum 8 characters"
                    value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                    minLength={8} required />

                  {authMessage && (
                    <p style={{
                      color: "#bd2828",
                      background: "#fff0f0",
                      padding: 11,
                      borderRadius: 8,
                      margin: 0,
                      fontSize: 13
                    }}>{authMessage}</p>
                  )}

                  <button type="submit" disabled={authLoading} style={{
                    ...primaryStyle,
                    opacity: authLoading ? 0.7 : 1,
                    marginTop: 5
                  }}>
                    {authLoading ? "Please wait..." : authMode === "signup" ? "Create Account →" : "Login →"}
                  </button>
                </form>
              </>
            )}

            {authScreen === "area" && (
              <div>
                <div style={{ textAlign: "center", marginBottom: 22 }}>
                  <div style={{ fontSize: 42 }}>📍</div>
                  <h2 style={{ color: "#205c35" }}>Select Your Area</h2>
                  <p style={{ color: "#718078" }}>Find agriculture shops near your village or town.</p>
                </div>

                <form onSubmit={saveFarmerArea} style={{ display: "grid", gap: 14 }}>
                  <label>Village / Town</label>
                  <input style={inputStyle} placeholder="Enter village or town name"
                    value={areaVillage} onChange={e => setAreaVillage(e.target.value)} required />

                  <label>PIN Code</label>
                  <input style={inputStyle} placeholder="Enter 6-digit PIN code"
                    value={areaPincode}
                    onChange={e => setAreaPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    pattern="[0-9]{6}" required />

                  {authMessage && <p style={{ color: "#bd2828" }}>{authMessage}</p>}

                  <button type="submit" style={primaryStyle}>Continue to FasalSetu →</button>
                </form>
              </div>
            )}
          </section>
        </div>
      )}

      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)}>
          <section className="cart-panel" onClick={e => e.stopPropagation()}>
            <div className="cart-heading">
              <div>
                <h2>My Cart 🛒</h2>
                <p>{cartCount} items in your cart</p>
              </div>
              <button className="close-cart" onClick={() => setCartOpen(false)}>✕</button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <div>🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some products to get started.</p>
                <button className="primary-button" onClick={() => setCartOpen(false)}>
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div className="cart-item" key={item.id}>
                      <div className="cart-item-image">{item.emoji}</div>
                      <div className="cart-item-info">
                        <strong>{item.name}</strong>
                        <small>{item.company}</small>
                        <b>₹{Number(item.price).toLocaleString("en-IN")}</b>
                        <div className="quantity-control">
                          <button onClick={() => decreaseQuantity(item.id)}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => increaseQuantity(item.id)}>+</button>
                        </div>
                      </div>
                      <button className="remove-button" onClick={() => removeItem(item.id)}>Remove</button>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>₹{cartTotal.toLocaleString("en-IN")}</strong>
                  </div>
                  <div>
                    <span>Delivery</span>
                    <strong>Calculated later</strong>
                  </div>
                  <div className="grand-total">
                    <span>Total</span>
                    <strong>₹{cartTotal.toLocaleString("en-IN")}</strong>
                  </div>
                  <button className="checkout-button"
                    onClick={() => alert("Checkout will be connected in the next step.")}>
                    Proceed to Checkout →
                  </button>
                  <button className="clear-cart" onClick={() => setCart([])}>Clear Cart</button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
