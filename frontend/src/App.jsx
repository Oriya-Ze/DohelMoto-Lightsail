import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import './App.css'
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiSettings, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
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
            <img src="/images/logo.png" alt="DohelMoto" className="logo-image" />
          </Link>
          <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
            <Link to="/" onClick={() => setMenuOpen(false)}>בית</Link>
            <Link to="/products" onClick={() => setMenuOpen(false)}>מוצרים</Link>
            <Link to="/categories" onClick={() => setMenuOpen(false)}>קטגוריות</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)}>אודות</Link>
            <Link to="/customer-service" onClick={() => setMenuOpen(false)}>שירות לקוחות</Link>
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
    'צמיגים וג\'אנטים': 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=600&h=400&fit=crop',
    'חלקי פלסטיק': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    'פגושים': 'https://images.unsplash.com/photo-1558980664-1a0d0e4b5c3d?w=600&h=400&fit=crop',
    'אביזרים': '/images/Accessories.png',
    'חלקי חילוף': 'https://images.unsplash.com/photo-1558980664-1a0d0e4b5c3d?w=600&h=400&fit=crop'
  }

  useEffect(() => {
    const loadData = () => {
      axios.get(`${API_URL}/categories`).then(res => setCategories(res.data.slice(0, 6)))
      axios.get(`${API_URL}/products?limit=8`).then(res => setProducts(res.data))
    }
    loadData()
    // Refresh every 5 seconds to catch updates
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
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
            {categories.slice(0, 6).map(cat => {
              const imageUrl = cat.image_url || categoryImages[cat.name_he] || 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=600&h=400&fit=crop'
              console.log(`Category ${cat.name_he} (id: ${cat.id}): image_url=${cat.image_url}, finalUrl=${imageUrl}`)
              return (
              <Link 
                key={`${cat.id}-${cat.image_url || 'default'}`}
                to={`/products?category=${cat.id}`} 
                className="card category-card"
                style={{ 
                  backgroundImage: imageUrl ? `url("${imageUrl}")` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: imageUrl ? 'transparent' : '#4b5563'
                }}
              >
                <div className="category-overlay">
                  <h3>{cat.name_he}</h3>
                  <p>{cat.description}</p>
                </div>
              </Link>
              )
            })}
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

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = () => {
      axios.get(`${API_URL}/categories`).then(res => {
        console.log('Categories loaded:', res.data)
        setCategories(res.data)
        setLoading(false)
      }).catch(err => {
        console.error('Error loading categories:', err)
        setLoading(false)
      })
    }
    loadCategories()
    // Refresh every 5 seconds to catch updates
    const interval = setInterval(loadCategories, 5000)
    return () => clearInterval(interval)
  }, [])

  const categoryImages = {
    'צמיגים וג\'אנטים': 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=600&h=400&fit=crop',
    'חלקי פלסטיק': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    'פגושים': 'https://images.unsplash.com/photo-1558980664-1a0d0e4b5c3d?w=600&h=400&fit=crop',
    'אביזרים': '/images/Accessories.png',
    'חלקי חילוף': 'https://images.unsplash.com/photo-1558980664-1a0d0e4b5c3d?w=600&h=400&fit=crop'
  }

  if (loading) return <div className="loading">טוען קטגוריות...</div>

  return (
    <div className="section">
      <div className="container">
        <h2 className="section-title">כל הקטגוריות</h2>
          <div className="grid grid-3">
            {categories.map(cat => {
              const imageUrl = cat.image_url || categoryImages[cat.name_he] || 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=600&h=400&fit=crop'
              console.log(`Category ${cat.name_he} (id: ${cat.id}): image_url=${cat.image_url}, finalUrl=${imageUrl}`)
              return (
              <Link 
                key={`${cat.id}-${cat.image_url || 'default'}`}
                to={`/products?category=${cat.id}`} 
                className="card category-card"
                style={{ 
                  backgroundImage: imageUrl ? `url("${imageUrl}")` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: imageUrl ? 'transparent' : '#4b5563'
                }}
              >
              <div className="category-overlay">
                <h3>{cat.name_he}</h3>
                <p>{cat.description}</p>
              </div>
            </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const Products = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [vehicleModels, setVehicleModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedVehicleBrand, setSelectedVehicleBrand] = useState('')
  const [selectedVehicleModel, setSelectedVehicleModel] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
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
    filterAndSortProducts()
  }, [products, sortBy, priceRange])

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

  const filterAndSortProducts = () => {
    let filtered = [...products]

    // Filter by price range
    if (priceRange.min) {
      filtered = filtered.filter(p => parseFloat(p.price || 0) >= parseFloat(priceRange.min))
    }
    if (priceRange.max) {
      filtered = filtered.filter(p => parseFloat(p.price || 0) <= parseFloat(priceRange.max))
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price || 0) - parseFloat(b.price || 0)
        case 'price-high':
          return parseFloat(b.price || 0) - parseFloat(a.price || 0)
        case 'name':
          return a.name_he.localeCompare(b.name_he)
        case 'newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at)
      }
    })

    setFilteredProducts(filtered)
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
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontWeight: '600' }}>מיון:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
              style={{ minWidth: '150px' }}
            >
              <option value="newest">חדש ביותר</option>
              <option value="price-low">מחיר: נמוך לגבוה</option>
              <option value="price-high">מחיר: גבוה לנמוך</option>
              <option value="name">שם: א-ת</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontWeight: '600' }}>טווח מחירים:</label>
            <input
              type="number"
              placeholder="מ-"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className="input"
              style={{ width: '100px' }}
            />
            <span>-</span>
            <input
              type="number"
              placeholder="עד"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              className="input"
              style={{ width: '100px' }}
            />
          </div>
        </div>
        {loading ? (
          <div className="loading">טוען מוצרים...</div>
        ) : (
          <>
            {filteredProducts.length === 0 ? (
              <div className="empty-cart">
                <p>לא נמצאו מוצרים</p>
              </div>
            ) : (
              <>
                <p style={{ marginBottom: '16px', color: '#666' }}>
                  נמצאו {filteredProducts.length} מוצרים
                </p>
                <div className="grid grid-4">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </>
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
        {product.sale_price && parseFloat(product.sale_price) < parseFloat(product.price) ? (
          <div className="product-price-container">
            <p className="product-price original-price">₪{parseFloat(product.price || 0).toFixed(2)}</p>
            <p className="product-price sale-price">₪{parseFloat(product.sale_price || 0).toFixed(2)}</p>
          </div>
        ) : (
          <p className="product-price">₪{parseFloat(product.price || 0).toFixed(2)}</p>
        )}
        {product.stock !== undefined && (
          <p style={{ 
            fontSize: '12px', 
            color: product.stock > 0 ? '#10b981' : '#991b1b',
            marginBottom: '8px'
          }}>
            {product.stock > 0 ? `במלאי (${product.stock})` : 'אין במלאי'}
          </p>
        )}
        <button 
          onClick={addToCart} 
          className="btn btn-primary" 
          style={{ width: '100%' }}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? 'אין במלאי' : 'הוסף לעגלה'}
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
  const [variants, setVariants] = useState([])
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  useEffect(() => {
    axios.get(`${API_URL}/products/${id}`).then(res => {
      setProduct(res.data)
      setSelectedImage(0)
      setLoading(false)
    })
    
    // Load variants
    axios.get(`${API_URL}/products/${id}/variants`).then(res => {
      setVariants(res.data || [])
    }).catch(() => {
      // If variants endpoint doesn't exist, set empty array
      setVariants([])
    })
  }, [id])

  // Get current product/variant data
  const currentProduct = selectedVariant || product
  
  const productImages = currentProduct ? [
    currentProduct.image_url || product?.image_url,
    ...(Array.isArray(currentProduct.images || product?.images) ? (currentProduct.images || product?.images) : [])
  ].filter(Boolean) : []
  
  // Update image when variant changes
  useEffect(() => {
    if (selectedVariant && selectedVariant.image_url) {
      setSelectedImage(0)
    }
  }, [selectedVariant])

  // Debug: log images
  useEffect(() => {
    if (product) {
      console.log('Product images:', productImages)
      console.log('Selected image index:', selectedImage)
    }
  }, [product, productImages, selectedImage])

  // Keyboard navigation
  useEffect(() => {
    if (productImages.length <= 1) return
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setSelectedImage((prev) => (prev + 1) % productImages.length)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [productImages.length])

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % productImages.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length)
  }

  // Touch handlers for swipe
  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    if (isLeftSwipe && productImages.length > 1) {
      nextImage()
    }
    if (isRightSwipe && productImages.length > 1) {
      prevImage()
    }
  }

  const addToCart = () => {
    if (!user) {
      navigate('/login')
      return
    }
    
    const productToAdd = selectedVariant || product
    const isOutOfStock = (productToAdd.stock || 0) === 0
    
    if (isOutOfStock) {
      alert('המוצר לא במלאי')
      return
    }
    
    axios.post(`${API_URL}/cart`, {
      user_id: user.id,
      product_id: product.id,
      variant_id: selectedVariant ? selectedVariant.id : null,
      quantity: 1
    }).then(() => {
      alert('המוצר נוסף לעגלה!')
    }).catch(error => {
      console.error('Error adding to cart:', error)
      alert('שגיאה בהוספת המוצר לעגלה')
    })
  }
  
  const handleVariantChange = (variantId) => {
    if (variantId === '') {
      setSelectedVariant(null)
      return
    }
    const variant = variants.find(v => v.id === parseInt(variantId))
    setSelectedVariant(variant || null)
  }

  if (loading) return <div className="loading">טוען...</div>
  if (!product) return <div className="error">מוצר לא נמצא</div>

  return (
    <div className="section">
      <div className="container">
        <div className="product-detail">
          <div className="product-detail-image">
            {productImages.length > 0 ? (
              <>
                <div 
                  className="image-gallery-container"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  {productImages.length > 1 && (
                    <>
                      <button 
                        className="image-nav-btn image-nav-prev"
                        onClick={prevImage}
                        aria-label="תמונה קודמת"
                      >
                        <FiChevronRight />
                      </button>
                      <button 
                        className="image-nav-btn image-nav-next"
                        onClick={nextImage}
                        aria-label="תמונה הבאה"
                      >
                        <FiChevronLeft />
                      </button>
                      <div className="image-counter">
                        {selectedImage + 1} / {productImages.length}
                      </div>
                    </>
                  )}
                  <img 
                    key={selectedImage}
                    src={productImages[selectedImage]} 
                    alt={`${product.name_he} - תמונה ${selectedImage + 1}`} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
                    onError={(e) => {
                      console.error('Image failed to load:', productImages[selectedImage])
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
                {productImages.length > 1 && (
                  <div className="image-thumbnails">
                    {productImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${product.name_he} ${idx + 1}`}
                        onClick={() => setSelectedImage(idx)}
                        className={selectedImage === idx ? 'thumbnail active' : 'thumbnail'}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="placeholder-image large">📦</div>
            )}
          </div>
          <div className="product-detail-info">
            <h1>{currentProduct?.name_he || product.name_he}</h1>
            <p className="product-sku">מק"ט: {currentProduct?.sku || product.sku}</p>
            
            {/* Variant Selection Dropdown */}
            {variants.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="variant-select" style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  fontSize: '16px',
                  color: '#374151'
                }}>
                  בחר דגם:
                </label>
                <select
                  id="variant-select"
                  value={selectedVariant ? selectedVariant.id : ''}
                  onChange={(e) => handleVariantChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ea580c'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                >
                  <option value="">דגם בסיסי</option>
                  {variants.map(variant => (
                    <option key={variant.id} value={variant.id}>
                      {variant.name_he} {variant.price ? `- ₪${parseFloat(variant.price).toFixed(2)}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {currentProduct?.sale_price && parseFloat(currentProduct.sale_price) < parseFloat(currentProduct.price || currentProduct.sale_price) ? (
              <div className="product-price-container">
                <p className="product-price large original-price">₪{parseFloat(currentProduct.price || 0).toFixed(2)}</p>
                <p className="product-price large sale-price">₪{parseFloat(currentProduct.sale_price || 0).toFixed(2)}</p>
              </div>
            ) : (
              <p className="product-price large">₪{parseFloat(currentProduct?.price || product.price || 0).toFixed(2)}</p>
            )}
            {currentProduct?.stock !== undefined && (
              <p style={{ 
                fontSize: '16px', 
                color: (currentProduct.stock || 0) > 0 ? '#10b981' : '#991b1b',
                marginBottom: '16px',
                fontWeight: '600'
              }}>
                {(currentProduct.stock || 0) > 0 ? `✓ במלאי (${currentProduct.stock} יחידות)` : '✗ אין במלאי'}
              </p>
            )}
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
              <button 
                onClick={addToCart} 
                className="btn btn-primary" 
                style={{ fontSize: '18px', padding: '16px 32px' }}
                disabled={(currentProduct?.stock || product.stock || 0) === 0}
              >
                {(currentProduct?.stock || product.stock || 0) === 0 ? 'אין במלאי' : 'הוסף לעגלה'}
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
      const total = cartItems.reduce((sum, item) => {
        const itemPrice = item.sale_price && parseFloat(item.sale_price) < parseFloat(item.price) 
          ? parseFloat(item.sale_price) 
          : parseFloat(item.price || 0);
        return sum + (itemPrice * item.quantity);
      }, 0)
      
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

  const total = cartItems.reduce((sum, item) => {
    const itemPrice = item.sale_price && parseFloat(item.sale_price) < parseFloat(item.price) 
      ? parseFloat(item.sale_price) 
      : parseFloat(item.price || 0);
    return sum + (itemPrice * item.quantity);
  }, 0)

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
                    {item.sale_price && parseFloat(item.sale_price) < parseFloat(item.price) ? (
                      <div>
                        <p style={{ textDecoration: 'line-through', color: '#6b7280', marginBottom: '4px' }}>
                          ₪{parseFloat(item.price || 0).toFixed(2)} × {item.quantity} = ₪{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                        </p>
                        <p style={{ color: '#dc2626', fontWeight: 'bold' }}>
                          ₪{parseFloat(item.sale_price || 0).toFixed(2)} × {item.quantity} = ₪{(parseFloat(item.sale_price || 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p>₪{parseFloat(item.price || 0).toFixed(2)} × {item.quantity} = ₪{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}</p>
                    )}
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
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '', vehicle_brand: '', vehicle_model: '' })
  const [errors, setErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, text: '' })
  const [emailExists, setEmailExists] = useState(false)
  const [vehicles, setVehicles] = useState([])
  const [vehicleModels, setVehicleModels] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(`${API_URL}/vehicles`).then(res => setVehicles(res.data)).catch(() => setVehicles([]))
  }, [])

  useEffect(() => {
    if (formData.vehicle_brand) {
      axios.get(`${API_URL}/vehicles/models?brand=${formData.vehicle_brand}`).then(res => setVehicleModels(res.data)).catch(() => setVehicleModels([]))
    } else {
      setVehicleModels([])
    }
  }, [formData.vehicle_brand])

  useEffect(() => {
    // Ensure the login form is visible
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

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
        setFormData({ email: '', password: '', name: '', phone: '', vehicle_brand: '', vehicle_model: '' })
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
    <div className="login-wrapper" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      zIndex: '999999', 
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'auto',
      padding: '20px',
      width: '100vw',
      height: '100vh',
      margin: 0,
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        position: 'relative', 
        zIndex: '1000000', 
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        maxWidth: '500px',
        width: '100%',
        border: '1px solid rgba(107, 114, 128, 0.3)',
        boxSizing: 'border-box'
      }}>
        <h2 style={{ marginBottom: '24px', color: '#111827', fontSize: '28px', fontWeight: 'bold', display: 'block' }}>{isLogin ? 'התחברות' : 'הרשמה'}</h2>
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
                            ? level <= 2 ? '#991b1b' : level <= 3 ? '#f59e0b' : '#10b981'
                            : '#e5e7eb',
                          borderRadius: '2px'
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: '12px', color: passwordStrength.strength <= 2 ? '#991b1b' : passwordStrength.strength <= 3 ? '#f59e0b' : '#10b981' }}>
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
  )
}

const About = () => {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_URL}/about`)
      .then(res => {
        setContent(res.data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="loading">טוען...</div>
  }

  if (!content) {
    // Fallback to default content if no content in database
    return (
      <div className="section">
        <div className="container">
          <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 className="section-title" style={{ marginBottom: '40px', color: '#1f2937' }}>אודות DohelMoto</h1>
            <p>תוכן עמוד אודות יופיע כאן לאחר עדכון בפאנל הניהול.</p>
          </div>
        </div>
      </div>
    )
  }

  const whyChooseUsItems = Array.isArray(content.why_choose_us_items) 
    ? content.why_choose_us_items 
    : (typeof content.why_choose_us_items === 'string' 
        ? JSON.parse(content.why_choose_us_items || '[]') 
        : [])

  return (
    <div className="section">
      <div className="container">
        <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 className="section-title" style={{ marginBottom: '40px', color: '#1f2937' }}>
            {content.title || 'אודות DohelMoto'}
          </h1>
          
          <div style={{ lineHeight: '1.8', fontSize: '18px' }}>
            <h2 style={{ color: '#991b1b', marginTop: '32px', marginBottom: '16px' }}>
              {content.who_we_are_title || 'מי אנחנו?'}
            </h2>
            <p style={{ marginBottom: '24px' }}>
              {content.who_we_are_text || ''}
            </p>

            <h2 style={{ color: '#991b1b', marginTop: '32px', marginBottom: '16px' }}>
              {content.vision_title || 'החזון שלנו'}
            </h2>
            <p style={{ marginBottom: '24px' }}>
              {content.vision_text || ''}
            </p>

            <h2 style={{ color: '#991b1b', marginTop: '32px', marginBottom: '16px' }}>
              {content.what_we_offer_title || 'מה אנחנו מציעים?'}
            </h2>
            <ul style={{ marginBottom: '24px', paddingRight: '24px' }}>
              {(content.what_we_offer_items || []).map((item, index) => (
                <li key={index} style={{ marginBottom: '12px' }}>{item}</li>
              ))}
            </ul>

            <h2 style={{ color: '#991b1b', marginTop: '32px', marginBottom: '16px' }}>
              {content.why_choose_us_title || 'למה לבחור בנו?'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginTop: '24px' }}>
              {whyChooseUsItems.map((item, index) => (
                <div key={index} className="card" style={{ textAlign: 'center', padding: '20px' }}>
                  <h3 style={{ color: '#991b1b', marginBottom: '12px' }}>{item.title || ''}</h3>
                  <p>{item.text || ''}</p>
                </div>
              ))}
            </div>

            {/* Social Media Links */}
            {(content.whatsapp_url || content.instagram_url || content.tiktok_url) && (
              <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '2px solid #e5e7eb', textAlign: 'center' }}>
                <h3 style={{ color: '#991b1b', marginBottom: '24px' }}>עקבו אחרינו</h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  {content.whatsapp_url && (
                    <a
                      href={content.whatsapp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        backgroundColor: '#25D366',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        transition: 'all 0.3s',
                        boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = '0 2px 8px rgba(37, 211, 102, 0.3)'
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      וואטסאפ
                    </a>
                  )}
                  {content.instagram_url && (
                    <a
                      href={content.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        transition: 'all 0.3s',
                        boxShadow: '0 2px 8px rgba(188, 24, 136, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 4px 12px rgba(188, 24, 136, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = '0 2px 8px rgba(188, 24, 136, 0.3)'
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      אינסטגרם
                    </a>
                  )}
                  {content.tiktok_url && (
                    <a
                      href={content.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        backgroundColor: '#000000',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        transition: 'all 0.3s',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)'
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)'
                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                      טיקטוק
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const CustomerService = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // כאן תוכל להוסיף שליחה לשרת
    console.log('Contact form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    }, 3000)
  }

  return (
    <div className="section">
      <div className="container">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 className="section-title" style={{ marginBottom: '40px', color: '#1f2937' }}>שירות לקוחות</h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '40px' }}>
            <div className="card">
              <h2 style={{ color: '#991b1b', marginBottom: '20px' }}>פרטי יצירת קשר</h2>
              <div style={{ lineHeight: '2' }}>
                <p><strong>טלפון:</strong> 1-800-DOHEL-MOTO</p>
                <p><strong>אימייל:</strong> info@dohelmoto.co.il</p>
                <p><strong>כתובת:</strong> ישראל</p>
                <p><strong>שעות פעילות:</strong></p>
                <ul style={{ paddingRight: '20px', marginTop: '8px' }}>
                  <li>ראשון - חמישי: 09:00 - 18:00</li>
                  <li>שישי: 09:00 - 14:00</li>
                  <li>שבת: סגור</li>
                </ul>
              </div>
            </div>

            <div className="card">
              <h2 style={{ color: '#991b1b', marginBottom: '20px' }}>שאלות נפוצות</h2>
              <div style={{ lineHeight: '1.8' }}>
                <h3 style={{ color: '#991b1b', fontSize: '18px', marginTop: '16px', marginBottom: '8px' }}>מה זמן המשלוח?</h3>
                <p style={{ marginBottom: '16px' }}>משלוחים ברחבי הארץ תוך 2-5 ימי עסקים.</p>
                
                <h3 style={{ color: '#991b1b', fontSize: '18px', marginTop: '16px', marginBottom: '8px' }}>מה מדיניות ההחזרות?</h3>
                <p style={{ marginBottom: '16px' }}>ניתן להחזיר מוצרים תוך 14 ימים ממועד הרכישה.</p>
                
                <h3 style={{ color: '#991b1b', fontSize: '18px', marginTop: '16px', marginBottom: '8px' }}>האם יש אחריות?</h3>
                <p style={{ marginBottom: '16px' }}>כל המוצרים מגיעים עם אחריות מלאה מהיצרן.</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ color: '#991b1b', marginBottom: '24px' }}>צור קשר</h2>
            {submitted ? (
              <div style={{ padding: '20px', background: '#d1fae5', borderRadius: '8px', textAlign: 'center', color: '#065f46' }}>
                <p style={{ fontSize: '18px', fontWeight: '600' }}>תודה! פניתך התקבלה ונחזור אליך בהקדם.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>שם מלא *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>אימייל *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>טלפון</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>נושא *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">בחר נושא</option>
                    <option value="order">שאלה על הזמנה</option>
                    <option value="product">שאלה על מוצר</option>
                    <option value="shipping">שאלה על משלוח</option>
                    <option value="return">החזרת מוצר</option>
                    <option value="other">אחר</option>
                  </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>הודעה *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="input"
                    rows="5"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  שלח פנייה
                </button>
              </form>
            )}
          </div>
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
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    if (user) {
      loadCartCount(user.id)
    }
  }, [user])

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
            <Route path="/categories" element={<Categories />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/about" element={<About />} />
            <Route path="/customer-service" element={<CustomerService />} />
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

