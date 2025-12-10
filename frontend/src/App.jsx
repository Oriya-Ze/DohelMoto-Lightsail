import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import './App.css'
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiSettings } from 'react-icons/fi'
import AdminPanel from './AdminPanel'
import PaymentCallback from './PaymentCallback'

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
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="btn btn-outline">
                    <FiSettings /> ניהול
                  </Link>
                )}
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

  const categoryImages = {
    'מנועים': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    'תמסורת': 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=600&h=400&fit=crop',
    'מתלים': 'https://images.unsplash.com/photo-1558980664-1a0d0e4b5c3d?w=600&h=400&fit=crop',
    'בלמים': 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=600&h=400&fit=crop',
    'חשמל': 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=600&h=400&fit=crop',
    'חלקי גוף': 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=600&h=400&fit=crop',
    'מסננים': 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=600&h=400&fit=crop',
    'צמיגים וגלגלים': 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=600&h=400&fit=crop'
  }

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
              <Link 
                key={cat.id} 
                to={`/products?category=${cat.id}`} 
                className="card category-card"
                style={{ 
                  backgroundImage: `url(${categoryImages[cat.name_he] || 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=600&h=400&fit=crop'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="category-overlay">
                  <h3>{cat.name_he}</h3>
                  <p>{cat.description}</p>
                </div>
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
  const [vehicles, setVehicles] = useState([])
  const [vehicleModels, setVehicleModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedVehicleBrand, setSelectedVehicleBrand] = useState('')
  const [selectedVehicleModel, setSelectedVehicleModel] = useState('')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  useEffect(() => {
    axios.get(`${API_URL}/categories`).then(res => setCategories(res.data))
    axios.get(`${API_URL}/vehicles`).then(res => setVehicles(res.data))
    loadUserVehicle()
    loadProducts()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [selectedCategory, search, selectedVehicleBrand, selectedVehicleModel])

  useEffect(() => {
    if (selectedVehicleBrand) {
      axios.get(`${API_URL}/vehicles/models?brand=${selectedVehicleBrand}`).then(res => {
        setVehicleModels(res.data)
      })
    } else {
      setVehicleModels([])
      setSelectedVehicleModel('')
    }
  }, [selectedVehicleBrand])

  const loadUserVehicle = async () => {
    if (user) {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${API_URL}/user/vehicle`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.vehicle_brand) {
          setSelectedVehicleBrand(res.data.vehicle_brand)
          if (res.data.vehicle_model) {
            setSelectedVehicleModel(res.data.vehicle_model)
          }
        }
      } catch (error) {
        console.error('Error loading user vehicle:', error)
      }
    }
  }

  const loadProducts = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedCategory) params.append('category_id', selectedCategory)
    if (search) params.append('search', search)
    if (selectedVehicleBrand) params.append('vehicle_brand', selectedVehicleBrand)
    if (selectedVehicleModel) params.append('vehicle_model', selectedVehicleModel)
    
    axios.get(`${API_URL}/products?${params}`).then(res => {
      setProducts(res.data)
      setLoading(false)
    })
  }

  const handleSaveVehicle = async () => {
    if (!user) {
      alert('נא להתחבר כדי לשמור את כלי השטח שלך')
      return
    }
    try {
      const token = localStorage.getItem('token')
      await axios.put(`${API_URL}/user/vehicle`, {
        vehicle_brand: selectedVehicleBrand,
        vehicle_model: selectedVehicleModel
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('כלי השטח נשמר בהצלחה!')
    } catch (error) {
      alert('שגיאה בשמירת כלי השטח')
    }
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
            style={{ maxWidth: '200px' }}
          >
            <option value="">כל הקטגוריות</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name_he}</option>
            ))}
          </select>
          <select
            value={selectedVehicleBrand}
            onChange={(e) => setSelectedVehicleBrand(e.target.value)}
            className="input"
            style={{ maxWidth: '200px' }}
          >
            <option value="">כל המותגים</option>
            {vehicles.map((v, idx) => (
              <option key={idx} value={v.brand}>{v.brand_he}</option>
            ))}
          </select>
          {selectedVehicleBrand && (
            <select
              value={selectedVehicleModel}
              onChange={(e) => setSelectedVehicleModel(e.target.value)}
              className="input"
              style={{ maxWidth: '200px' }}
            >
              <option value="">כל הדגמים</option>
              {vehicleModels.map((v, idx) => (
                <option key={idx} value={v.model}>{v.model_he}</option>
              ))}
            </select>
          )}
          {user && selectedVehicleBrand && (
            <button onClick={handleSaveVehicle} className="btn btn-outline" style={{ maxWidth: '150px' }}>
              שמור כלי שטח
            </button>
          )}
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
        <p className="product-price">₪{parseFloat(product.price || 0).toFixed(2)}</p>
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
            <p className="product-price large">₪{parseFloat(product.price || 0).toFixed(2)}</p>
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

  const checkout = async () => {
    if (cartItems.length === 0) {
      alert('העגלה ריקה')
      return
    }
    const items = cartItems.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity
    }))
    
    try {
      // Create order first
      const orderRes = await axios.post(`${API_URL}/orders`, {
        user_id: user.id,
        items,
        shipping_address: user.address || '',
        payment_method: 'cardcom'
      })
      
      const order = orderRes.data
      const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.quantity), 0)
      
      // Initialize Cardcom payment
      const token = localStorage.getItem('token')
      const paymentRes = await axios.post(
        `${API_URL}/payment/cardcom/init`,
        {
          order_id: order.id,
          amount: total,
          currency: 'ILS'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      // Redirect to Cardcom payment page
      if (paymentRes.data.payment_url) {
        window.location.href = paymentRes.data.payment_url
      } else {
        alert('שגיאה בהתחלת תהליך התשלום')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('שגיאה בביצוע ההזמנה')
    }
  }

  if (loading) return <div className="loading">טוען עגלה...</div>

  const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.quantity), 0)

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
                    <p>₪{parseFloat(item.price || 0).toFixed(2)} × {item.quantity} = ₪{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}</p>
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
                סה"כ: ₪{parseFloat(total || 0).toFixed(2)}
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
  const [errors, setErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, text: '' })
  const [emailExists, setEmailExists] = useState(false)
  const navigate = useNavigate()

  // Check password strength
  const checkPasswordStrength = (password) => {
    let strength = 0
    let text = ''
    
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    
    if (strength <= 2) text = 'חלשה'
    else if (strength <= 3) text = 'בינונית'
    else if (strength <= 4) text = 'חזקה'
    else text = 'חזקה מאוד'
    
    return { strength, text }
  }

  // Check if email exists
  const checkEmailExists = async (email) => {
    if (!email || !email.includes('@')) {
      setEmailExists(false)
      return
    }
    try {
      // We'll check on submit, but we can add a debounced check here if needed
      setEmailExists(false)
    } catch (error) {
      setEmailExists(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!isLogin) {
      if (!formData.name || formData.name.length < 2) {
        newErrors.name = 'שם חייב להכיל לפחות 2 תווים'
      }
      
      if (formData.phone && !/^0[2-9]\d{7,8}$/.test(formData.phone.replace(/-/g, ''))) {
        newErrors.phone = 'מספר טלפון לא תקין'
      }
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'כתובת אימייל לא תקינה'
    }
    
    if (!formData.password) {
      newErrors.password = 'סיסמה חובה'
    } else if (!isLogin && passwordStrength.strength < 3) {
      newErrors.password = 'הסיסמה חלשה מדי. נדרשות לפחות 8 תווים, אותיות גדולות וקטנות ומספרים'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePasswordChange = (e) => {
    const password = e.target.value
    setFormData({ ...formData, password })
    if (!isLogin) {
      setPasswordStrength(checkPasswordStrength(password))
    }
  }

  const handleEmailChange = (e) => {
    const email = e.target.value
    setFormData({ ...formData, email })
    setErrors({ ...errors, email: '' })
    if (!isLogin) {
      checkEmailExists(email)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    if (isLogin) {
      axios.post(`${API_URL}/login`, {
        email: formData.email,
        password: formData.password
      }).then(res => {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        navigate('/')
        window.location.reload()
      }).catch((err) => {
        const message = err.response?.data?.error || 'שגיאה בהתחברות'
        setErrors({ submit: message })
      })
    } else {
      axios.post(`${API_URL}/register`, formData).then(() => {
        alert('נרשמת בהצלחה! התחבר עכשיו')
        setIsLogin(true)
        setFormData({ email: '', password: '', name: '', phone: '' })
        setErrors({})
        setPasswordStrength({ strength: 0, text: '' })
      }).catch((err) => {
        const message = err.response?.data?.error || 'שגיאה בהרשמה'
        if (message.includes('Email already exists') || message.includes('קיים')) {
          setErrors({ email: 'כתובת אימייל זו כבר רשומה במערכת' })
        } else {
          setErrors({ submit: message })
        }
      })
    }
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '500px' }}>
        <div className="card">
          <h2>{isLogin ? 'התחברות' : 'הרשמה'}</h2>
          <form onSubmit={handleSubmit}>
            {errors.submit && (
              <div className="error-message" style={{ marginBottom: '16px', padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px' }}>
                {errors.submit}
              </div>
            )}
            
            {!isLogin && (
              <>
                <div>
                  <input
                    type="text"
                    placeholder="שם מלא"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value })
                      setErrors({ ...errors, name: '' })
                    }}
                    className={`input ${errors.name ? 'input-error' : ''}`}
                    required
                  />
                  {errors.name && <div className="error-text">{errors.name}</div>}
                </div>
                <div style={{ marginTop: '16px' }}>
                  <input
                    type="tel"
                    placeholder="טלפון (אופציונלי)"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value })
                      setErrors({ ...errors, phone: '' })
                    }}
                    className={`input ${errors.phone ? 'input-error' : ''}`}
                  />
                  {errors.phone && <div className="error-text">{errors.phone}</div>}
                </div>
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    כלי שטח שלי (אופציונלי)
                  </label>
                  <select
                    value={formData.vehicle_brand}
                    onChange={(e) => setFormData({ ...formData, vehicle_brand: e.target.value, vehicle_model: '' })}
                    className="input"
                    style={{ marginBottom: '12px' }}
                  >
                    <option value="">בחר מותג</option>
                    {vehicles.map((v, idx) => (
                      <option key={idx} value={v.brand}>{v.brand_he}</option>
                    ))}
                  </select>
                  {formData.vehicle_brand && (
                    <select
                      value={formData.vehicle_model}
                      onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                      className="input"
                    >
                      <option value="">בחר דגם</option>
                      {vehicleModels.map((v, idx) => (
                        <option key={idx} value={v.model}>{v.model_he}</option>
                      ))}
                    </select>
                  )}
                </div>
              </>
            )}
            <div style={{ marginTop: '16px' }}>
              <input
                type="email"
                placeholder="אימייל"
                value={formData.email}
                onChange={handleEmailChange}
                className={`input ${errors.email ? 'input-error' : ''}`}
                required
              />
              {errors.email && <div className="error-text">{errors.email}</div>}
              {emailExists && !isLogin && (
                <div className="error-text">כתובת אימייל זו כבר רשומה</div>
              )}
            </div>
            <div style={{ marginTop: '16px' }}>
              <input
                type="password"
                placeholder="סיסמה"
                value={formData.password}
                onChange={handlePasswordChange}
                className={`input ${errors.password ? 'input-error' : ''}`}
                required
              />
              {errors.password && <div className="error-text">{errors.password}</div>}
              {!isLogin && formData.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        style={{
                          flex: 1,
                          height: '4px',
                          background: level <= passwordStrength.strength 
                            ? level <= 2 ? '#dc2626' : level <= 3 ? '#f59e0b' : '#10b981'
                            : '#e5e7eb',
                          borderRadius: '2px'
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: '12px', color: passwordStrength.strength <= 2 ? '#dc2626' : passwordStrength.strength <= 3 ? '#f59e0b' : '#10b981' }}>
                    חוזק סיסמה: {passwordStrength.text}
                  </div>
                </div>
              )}
            </div>
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
                  סה"כ: ₪{parseFloat(order.total_amount || 0).toFixed(2)}
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
    window.location.href = '/'
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
            <Route path="/admin" element={user && user.role === 'admin' ? <AdminPanel user={user} onLogout={handleLogout} /> : <Login />} />
            <Route path="/payment/success" element={<PaymentCallback type="success" />} />
            <Route path="/payment/cancel" element={<PaymentCallback type="cancel" />} />
            <Route path="/payment/error" element={<PaymentCallback type="error" />} />
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

