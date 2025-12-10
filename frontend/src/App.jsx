import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import './App.css'
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX } from 'react-icons/fi'

const API_URL = '/api'

// Components
const Header = ({ cartCount, user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>DohelMoto</h1>
            <p>חלקי חילוף לטרקטורונים וכלי שטח</p>
          </Link>
          <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
            <Link to="/" onClick={() => setMenuOpen(false)}>בית</Link>
            <Link to="/products" onClick={() => setMenuOpen(false)}>מוצרים</Link>
            <Link to="/categories" onClick={() => setMenuOpen(false)}>קטגוריות</Link>
            {user ? (
              <>
                <Link to="/orders" onClick={() => setMenuOpen(false)}>ההזמנות שלי</Link>
                <Link to="/cart" onClick={() => setMenuOpen(false)}>
                  <FiShoppingCart /> עגלה ({cartCount})
                </Link>
                <span className="user-name">{user.name}</span>
                <button onClick={onLogout} className="btn btn-outline">התנתק</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn btn-primary">
                <FiUser /> התחבר
              </Link>
            )}
          </nav>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </header>
  )
}

const Home = () => {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    axios.get(`${API_URL}/categories`).then(res => setCategories(res.data.slice(0, 6)))
    axios.get(`${API_URL}/products?limit=8`).then(res => setProducts(res.data))
  }, [])

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h2>ברוכים הבאים ל-DohelMoto</h2>
          <p>המקום המוביל לחלקי חילוף איכותיים לטרקטורונים וכלי שטח</p>
          <Link to="/products" className="btn btn-primary">עיין במוצרים</Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">קטגוריות מובילות</h2>
          <div className="grid grid-3">
            {categories.map(cat => (
              <Link key={cat.id} to={`/products?category=${cat.id}`} className="card category-card">
                <h3>{cat.name_he}</h3>
                <p>{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">מוצרים מומלצים</h2>
          <div className="grid grid-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    axios.get(`${API_URL}/categories`).then(res => setCategories(res.data))
    loadProducts()
  }, [selectedCategory, search])

  const loadProducts = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedCategory) params.append('category_id', selectedCategory)
    if (search) params.append('search', search)
    
    axios.get(`${API_URL}/products?${params}`).then(res => {
      setProducts(res.data)
      setLoading(false)
    })
  }

  return (
    <div className="section">
      <div className="container">
        <h2 className="section-title">מוצרים</h2>
        <div className="filters">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="חפש מוצר..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input"
            style={{ maxWidth: '300px' }}
          >
            <option value="">כל הקטגוריות</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name_he}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <div className="loading">טוען מוצרים...</div>
        ) : (
          <div className="grid grid-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const ProductCard = ({ product }) => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  
  const addToCart = () => {
    if (!user) {
      navigate('/login')
      return
    }
    axios.post(`${API_URL}/cart`, {
      user_id: user.id,
      product_id: product.id,
      quantity: 1
    }).then(() => {
      alert('המוצר נוסף לעגלה!')
    }).catch(err => {
      alert('שגיאה בהוספת המוצר לעגלה')
    })
  }

  return (
    <div className="card product-card">
      <div className="product-image">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name_he} />
        ) : (
          <div className="placeholder-image">📦</div>
        )}
      </div>
      <div className="product-info">
        <h3>{product.name_he}</h3>
        <p className="product-sku">מק"ט: {product.sku}</p>
        <p className="product-price">₪{product.price.toFixed(2)}</p>
        <button onClick={addToCart} className="btn btn-primary" style={{ width: '100%' }}>
          הוסף לעגלה
        </button>
        <Link to={`/product/${product.id}`} className="btn btn-outline" style={{ width: '100%', marginTop: '8px' }}>
          פרטים נוספים
        </Link>
      </div>
    </div>
  )
}

const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  useEffect(() => {
    axios.get(`${API_URL}/products/${id}`).then(res => {
      setProduct(res.data)
      setLoading(false)
    })
  }, [id])

  const addToCart = () => {
    if (!user) {
      navigate('/login')
      return
    }
    axios.post(`${API_URL}/cart`, {
      user_id: user.id,
      product_id: product.id,
      quantity: 1
    }).then(() => {
      alert('המוצר נוסף לעגלה!')
    })
  }

  if (loading) return <div className="loading">טוען...</div>
  if (!product) return <div className="error">מוצר לא נמצא</div>

  return (
    <div className="section">
      <div className="container">
        <div className="product-detail">
          <div className="product-detail-image">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name_he} />
            ) : (
              <div className="placeholder-image large">📦</div>
            )}
          </div>
          <div className="product-detail-info">
            <h1>{product.name_he}</h1>
            <p className="product-sku">מק"ט: {product.sku}</p>
            <p className="product-price large">₪{product.price.toFixed(2)}</p>
            <div className="product-description">
              <h3>תיאור המוצר:</h3>
              <p>{product.description_he || product.description}</p>
            </div>
            {product.compatible_models && product.compatible_models.length > 0 && (
              <div className="compatible-models">
                <h3>מודלים תואמים:</h3>
                <ul>
                  {product.compatible_models.map((model, idx) => (
                    <li key={idx}>{model}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="product-actions">
              <button onClick={addToCart} className="btn btn-primary" style={{ fontSize: '18px', padding: '16px 32px' }}>
                הוסף לעגלה
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Cart = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadCart()
  }, [])

  const loadCart = () => {
    axios.get(`${API_URL}/cart/${user.id}`).then(res => {
      setCartItems(res.data)
      setLoading(false)
    })
  }

  const updateQuantity = (cartId, quantity) => {
    if (quantity <= 0) {
      removeItem(cartId)
      return
    }
    axios.put(`${API_URL}/cart/${cartId}`, { quantity }).then(() => {
      loadCart()
    })
  }

  const removeItem = (cartId) => {
    axios.delete(`${API_URL}/cart/${cartId}`).then(() => {
      loadCart()
    })
  }

  const checkout = () => {
    if (cartItems.length === 0) {
      alert('העגלה ריקה')
      return
    }
    const items = cartItems.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity
    }))
    axios.post(`${API_URL}/orders`, {
      user_id: user.id,
      items,
      shipping_address: user.address || '',
      payment_method: 'cash'
    }).then(() => {
      alert('ההזמנה בוצעה בהצלחה!')
      navigate('/orders')
    })
  }

  if (loading) return <div className="loading">טוען עגלה...</div>

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="section">
      <div className="container">
        <h2 className="section-title">עגלת קניות</h2>
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>העגלה שלך ריקה</p>
            <Link to="/products" className="btn btn-primary">עיין במוצרים</Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.id} className="card cart-item">
                  <div className="cart-item-info">
                    <h3>{item.name_he}</h3>
                    <p>₪{item.price.toFixed(2)} × {item.quantity} = ₪{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="cart-item-actions">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="btn btn-secondary">-</button>
                    <span style={{ margin: '0 16px', fontSize: '18px' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="btn btn-secondary">+</button>
                    <button onClick={() => removeItem(item.id)} className="btn btn-danger" style={{ marginRight: '16px' }}>מחק</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-summary card">
              <h3>סיכום הזמנה</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '16px' }}>
                סה"כ: ₪{total.toFixed(2)}
              </p>
              <button onClick={checkout} className="btn btn-primary" style={{ width: '100%', marginTop: '16px', fontSize: '18px', padding: '16px' }}>
                השלם הזמנה
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '' })
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isLogin) {
      axios.post(`${API_URL}/login`, {
        email: formData.email,
        password: formData.password
      }).then(res => {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        navigate('/')
        window.location.reload()
      }).catch(() => {
        alert('שגיאה בהתחברות')
      })
    } else {
      axios.post(`${API_URL}/register`, formData).then(() => {
        alert('נרשמת בהצלחה! התחבר עכשיו')
        setIsLogin(true)
      }).catch(() => {
        alert('שגיאה בהרשמה')
      })
    }
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '500px' }}>
        <div className="card">
          <h2>{isLogin ? 'התחברות' : 'הרשמה'}</h2>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="שם מלא"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
                <input
                  type="tel"
                  placeholder="טלפון"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                  style={{ marginTop: '16px' }}
                />
              </>
            )}
            <input
              type="email"
              placeholder="אימייל"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              style={{ marginTop: '16px' }}
              required
            />
            <input
              type="password"
              placeholder="סיסמה"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input"
              style={{ marginTop: '16px' }}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
              {isLogin ? 'התחבר' : 'הירשם'}
            </button>
          </form>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="btn btn-outline"
            style={{ width: '100%', marginTop: '16px' }}
          >
            {isLogin ? 'אין לך חשבון? הירשם' : 'יש לך חשבון? התחבר'}
          </button>
        </div>
      </div>
    </div>
  )
}

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    axios.get(`${API_URL}/orders/${user.id}`).then(res => {
      setOrders(res.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="loading">טוען הזמנות...</div>

  return (
    <div className="section">
      <div className="container">
        <h2 className="section-title">ההזמנות שלי</h2>
        {orders.length === 0 ? (
          <div className="empty-cart">
            <p>אין הזמנות</p>
            <Link to="/products" className="btn btn-primary">עיין במוצרים</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="card">
                <h3>הזמנה #{order.id}</h3>
                <p>תאריך: {new Date(order.created_at).toLocaleDateString('he-IL')}</p>
                <p>סטטוס: {order.status}</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '8px' }}>
                  סה"כ: ₪{order.total_amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Main App Component
function App() {
  const [user, setUser] = useState(null)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      loadCartCount(JSON.parse(storedUser).id)
    }
  }, [])

  const loadCartCount = (userId) => {
    axios.get(`${API_URL}/cart/${userId}`).then(res => {
      setCartCount(res.data.reduce((sum, item) => sum + item.quantity, 0))
    }).catch(() => {})
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setCartCount(0)
  }

  return (
    <Router>
      <div className="app">
        <Header cartCount={cartCount} user={user} onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
        <footer className="footer">
          <div className="container">
            <p>&copy; 2024 DohelMoto. כל הזכויות שמורות.</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App

