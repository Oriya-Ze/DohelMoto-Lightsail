import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FiPlus, FiEdit, FiTrash2, FiPackage, FiShoppingBag, FiTag, FiInfo } from 'react-icons/fi'
import './AdminPanel.css'

const API_URL = '/api'

const AdminPanel = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [aboutContent, setAboutContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return { headers: { Authorization: `Bearer ${token}` } }
  }

  useEffect(() => {
    console.log('AdminPanel mounted')
    loadData()
  }, [activeTab])

  useEffect(() => {
    // Hide background when admin panel is mounted
    console.log('Adding admin-panel-active class to body')
    document.body.classList.add('admin-panel-active')
    document.body.style.background = '#f5f5f5'
    document.body.style.backgroundImage = 'none'
    
    return () => {
      // Restore background when admin panel is unmounted
      console.log('Removing admin-panel-active class from body')
      document.body.classList.remove('admin-panel-active')
      document.body.style.background = ''
      document.body.style.backgroundImage = ''
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token && (activeTab === 'products' || activeTab === 'orders' || activeTab === 'about')) {
        alert('נא להתחבר מחדש')
        window.location.href = '/login'
        return
      }
      if (activeTab === 'products') {
        const res = await axios.get(`${API_URL}/admin/products`, getAuthHeaders())
        setProducts(res.data)
      } else if (activeTab === 'categories') {
        const res = await axios.get(`${API_URL}/categories?_=${Date.now()}`)
        setCategories(res.data)
      } else if (activeTab === 'orders') {
        const res = await axios.get(`${API_URL}/admin/orders`, getAuthHeaders())
        setOrders(res.data)
      } else if (activeTab === 'about') {
        const res = await axios.get(`${API_URL}/admin/about`, getAuthHeaders())
        setAboutContent(res.data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      const status = error.response?.status
      const msg = error.response?.data?.error || error.message
      if (status === 401 || status === 403) {
        alert('ההתחברות פגה. נא להתחבר מחדש.')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else {
        alert(`שגיאה בטעינת הנתונים: ${msg || 'לא ניתן להתחבר לשרת'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) return
    try {
      await axios.delete(`${API_URL}/admin/products/${id}`, getAuthHeaders())
      loadData()
      alert('המוצר נמחק בהצלחה')
    } catch (error) {
      alert('שגיאה במחיקת המוצר')
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק קטגוריה זו?')) return
    try {
      await axios.delete(`${API_URL}/admin/categories/${id}`, getAuthHeaders())
      loadData()
      alert('הקטגוריה נמחקה בהצלחה')
    } catch (error) {
      alert('שגיאה במחיקת הקטגוריה')
    }
  }

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API_URL}/admin/orders/${orderId}/status`, { status }, getAuthHeaders())
      loadData()
      alert('סטטוס ההזמנה עודכן בהצלחה')
    } catch (error) {
      alert('שגיאה בעדכון סטטוס ההזמנה')
    }
  }

  return (
    <div 
      className="admin-panel"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        zIndex: 99999,
        background: '#f5f5f5'
      }}
    >
      <div className="admin-header">
        <h1>פאנל ניהול - DohelMoto</h1>
        <button onClick={onLogout} className="btn btn-outline">התנתק</button>
      </div>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'products' ? 'active' : ''} 
          onClick={() => setActiveTab('products')}
        >
          <FiPackage /> מוצרים
        </button>
        <button 
          className={activeTab === 'categories' ? 'active' : ''} 
          onClick={() => setActiveTab('categories')}
        >
          <FiTag /> קטגוריות
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''} 
          onClick={() => setActiveTab('orders')}
        >
          <FiShoppingBag /> הזמנות
        </button>
        <button 
          className={activeTab === 'about' ? 'active' : ''} 
          onClick={() => setActiveTab('about')}
        >
          <FiInfo /> אודות
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'products' && (
          <ProductsTab 
            products={products}
            loading={loading}
            onAdd={() => { setEditingProduct(null); setShowProductModal(true) }}
            onEdit={(product) => { setEditingProduct(product); setShowProductModal(true) }}
            onDelete={handleDeleteProduct}
            onClose={() => { setShowProductModal(false); setEditingProduct(null); loadData() }}
            showModal={showProductModal}
            editingProduct={editingProduct}
            getAuthHeaders={getAuthHeaders}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesTab 
            categories={categories}
            loading={loading}
            onAdd={() => { setEditingCategory(null); setShowCategoryModal(true) }}
            onEdit={(category) => { setEditingCategory(category); setShowCategoryModal(true) }}
            onDelete={handleDeleteCategory}
            onClose={() => { setShowCategoryModal(false); setEditingCategory(null); loadData() }}
            showModal={showCategoryModal}
            editingCategory={editingCategory}
            getAuthHeaders={getAuthHeaders}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab 
            orders={orders}
            loading={loading}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        )}

        {activeTab === 'about' && (
          <AboutTab 
            aboutContent={aboutContent}
            loading={loading}
            getAuthHeaders={getAuthHeaders}
            onUpdate={() => loadData()}
          />
        )}
      </div>
    </div>
  )
}

const ProductsTab = ({ products, loading, onAdd, onEdit, onDelete, showModal, editingProduct, onClose, getAuthHeaders }) => {
  const [formData, setFormData] = useState({
    name: '',
    name_he: '',
    description: '',
    description_he: '',
    price: '',
    sale_price: '',
    category_ids: [],
    image_url: '',
    images: [],
    sku: '',
    brand: '',
    compatible_models: '',
    is_active: true
  })

  useEffect(() => {
    if (editingProduct) {
      const catIds = editingProduct.category_ids || (editingProduct.category_id ? [editingProduct.category_id] : [])
      setFormData({
        ...editingProduct,
        category_ids: catIds.map(Number),
        images: Array.isArray(editingProduct.images) ? editingProduct.images : [],
        compatible_models: Array.isArray(editingProduct.compatible_models) 
          ? editingProduct.compatible_models.join(', ') 
          : editingProduct.compatible_models || ''
      })
    } else {
      setFormData({
        name: '',
        name_he: '',
        description: '',
        description_he: '',
        price: '',
        sale_price: '',
        category_ids: [],
        image_url: '',
        images: [],
        sku: '',
        brand: '',
        compatible_models: '',
        is_active: true
      })
    }
  }, [editingProduct, showModal])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const category_ids = Array.isArray(formData.category_ids) 
        ? formData.category_ids.filter(Boolean).map(Number) 
        : []
      if (category_ids.length === 0) {
        alert('נא לבחור לפחות קטגוריה אחת')
        return
      }
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        stock: 0,
        category_ids,
        images: Array.isArray(formData.images) ? formData.images.filter(img => img.trim()) : [],
        compatible_models: formData.compatible_models.split(',').map(m => m.trim()).filter(m => m)
      }

      if (editingProduct) {
        await axios.put(`${API_URL}/admin/products/${editingProduct.id}`, data, getAuthHeaders())
        alert('המוצר עודכן בהצלחה')
      } else {
        await axios.post(`${API_URL}/admin/products`, data, getAuthHeaders())
        alert('המוצר נוצר בהצלחה')
      }
      onClose()
    } catch (error) {
      alert('שגיאה בשמירת המוצר')
    }
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h2>ניהול מוצרים</h2>
        <button onClick={onAdd} className="btn btn-primary">
          <FiPlus /> הוסף מוצר חדש
        </button>
      </div>

      {showModal && (
        <ProductModal 
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={onClose}
          editing={!!editingProduct}
        />
      )}

      {loading ? (
        <div className="loading">טוען מוצרים...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>אין מוצרים</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="admin-table-container admin-table-desktop">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>מק"ט</th>
                  <th>שם</th>
                  <th>מחיר</th>
                  <th>סטטוס</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>{product.sku}</td>
                    <td>{product.name_he}</td>
                    <td>₪{product.price}</td>
                    <td>{product.is_active ? 'פעיל' : 'לא פעיל'}</td>
                    <td>
                      <button onClick={() => onEdit(product)} className="btn-icon">
                        <FiEdit />
                      </button>
                      <button onClick={() => onDelete(product.id)} className="btn-icon btn-danger">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="admin-products-cards admin-products-mobile">
            {products.map(product => (
              <div key={product.id} className="admin-product-card">
                <div className="product-card-header">
                  <h3>{product.name_he}</h3>
                  <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                    {product.is_active ? 'פעיל' : 'לא פעיל'}
                  </span>
                </div>
                <div className="product-card-body">
                  <div className="product-info-row">
                    <span className="label">מק"ט:</span>
                    <span className="value">{product.sku}</span>
                  </div>
                  <div className="product-info-row">
                    <span className="label">מחיר:</span>
                    <span className="value">₪{product.price}</span>
                  </div>
                </div>
                <div className="product-card-actions">
                  <button onClick={() => onEdit(product)} className="btn-icon" title="ערוך">
                    <FiEdit />
                  </button>
                  <button onClick={() => onDelete(product.id)} className="btn-icon btn-danger" title="מחק">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const CategoriesTab = ({ categories, loading, onAdd, onEdit, onDelete, showModal, editingCategory, onClose, getAuthHeaders }) => {
  const [formData, setFormData] = useState({
    name: '',
    name_he: '',
    description: '',
    image_url: ''
  })

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || '',
        name_he: editingCategory.name_he || '',
        description: editingCategory.description || '',
        image_url: editingCategory.image_url || ''
      })
    } else {
      setFormData({
        name: '',
        name_he: '',
        description: '',
        image_url: ''
      })
    }
  }, [editingCategory, showModal])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        name: formData.name,
        name_he: formData.name_he,
        description: formData.description || '',
        image_url: formData.image_url || null
      }
      
      console.log('Submitting category data:', data)
      
      if (editingCategory) {
        const response = await axios.put(`${API_URL}/admin/categories/${editingCategory.id}`, data, getAuthHeaders())
        console.log('Category updated response:', response.data)
        alert('הקטגוריה עודכנה בהצלחה')
      } else {
        const response = await axios.post(`${API_URL}/admin/categories`, data, getAuthHeaders())
        console.log('Category created response:', response.data)
        alert('הקטגוריה נוצרה בהצלחה')
      }
      onClose()
    } catch (error) {
      console.error('Error saving category:', error)
      console.error('Error response:', error.response?.data)
      alert(`שגיאה בשמירת הקטגוריה: ${error.response?.data?.error || error.message}`)
    }
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h2>ניהול קטגוריות</h2>
        <button onClick={onAdd} className="btn btn-primary">
          <FiPlus /> הוסף קטגוריה חדשה
        </button>
      </div>

      {showModal && (
        <CategoryModal 
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={onClose}
          editing={!!editingCategory}
        />
      )}

      {loading ? (
        <div className="loading">טוען קטגוריות...</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>שם</th>
                <th>תיאור</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id}>
                  <td>{category.name_he}</td>
                  <td>{category.description}</td>
                  <td>
                    <button onClick={() => onEdit(category)} className="btn-icon">
                      <FiEdit />
                    </button>
                    <button onClick={() => onDelete(category.id)} className="btn-icon btn-danger">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const OrdersTab = ({ orders, loading, onUpdateStatus }) => {
  return (
    <div>
      <h2>ניהול הזמנות</h2>
      {loading ? (
        <div className="loading">טוען הזמנות...</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>מספר הזמנה</th>
                <th>לקוח</th>
                <th>סכום</th>
                <th>סטטוס</th>
                <th>תאריך</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.user_name} ({order.user_email})</td>
                  <td>₪{order.total_amount}</td>
                  <td>{order.status}</td>
                  <td>{new Date(order.created_at).toLocaleDateString('he-IL')}</td>
                  <td>
                    <select 
                      value={order.status} 
                      onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">ממתין</option>
                      <option value="processing">מעבד</option>
                      <option value="shipped">נשלח</option>
                      <option value="delivered">נמסר</option>
                      <option value="cancelled">בוטל</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const AboutTab = ({ aboutContent, loading, getAuthHeaders, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: '',
    who_we_are_title: '',
    who_we_are_text: '',
    vision_title: '',
    vision_text: '',
    what_we_offer_title: '',
    what_we_offer_items: [],
    why_choose_us_title: '',
    why_choose_us_items: [],
    whatsapp_url: '',
    instagram_url: '',
    tiktok_url: '',
    phone: ''
  })
  const [newOfferItem, setNewOfferItem] = useState('')
  const [newWhyChooseItem, setNewWhyChooseItem] = useState({ title: '', text: '' })

  useEffect(() => {
    if (aboutContent) {
      setFormData({
        title: aboutContent.title || '',
        who_we_are_title: aboutContent.who_we_are_title || '',
        who_we_are_text: aboutContent.who_we_are_text || '',
        vision_title: aboutContent.vision_title || '',
        vision_text: aboutContent.vision_text || '',
        what_we_offer_title: aboutContent.what_we_offer_title || '',
        what_we_offer_items: aboutContent.what_we_offer_items || [],
        why_choose_us_title: aboutContent.why_choose_us_title || '',
        why_choose_us_items: Array.isArray(aboutContent.why_choose_us_items) 
          ? aboutContent.why_choose_us_items 
          : (typeof aboutContent.why_choose_us_items === 'string' 
              ? JSON.parse(aboutContent.why_choose_us_items || '[]') 
              : []),
        whatsapp_url: aboutContent.whatsapp_url || '',
        instagram_url: aboutContent.instagram_url || '',
        tiktok_url: aboutContent.tiktok_url || '',
        phone: aboutContent.phone || ''
      })
    }
  }, [aboutContent])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`${API_URL}/admin/about`, formData, getAuthHeaders())
      alert('תוכן עמוד אודות עודכן בהצלחה')
      onUpdate()
    } catch (error) {
      console.error('Error updating about page:', error)
      alert('שגיאה בעדכון תוכן עמוד אודות')
    }
  }

  const addOfferItem = () => {
    if (newOfferItem.trim()) {
      setFormData({
        ...formData,
        what_we_offer_items: [...formData.what_we_offer_items, newOfferItem.trim()]
      })
      setNewOfferItem('')
    }
  }

  const removeOfferItem = (index) => {
    setFormData({
      ...formData,
      what_we_offer_items: formData.what_we_offer_items.filter((_, i) => i !== index)
    })
  }

  const addWhyChooseItem = () => {
    if (newWhyChooseItem.title.trim() && newWhyChooseItem.text.trim()) {
      setFormData({
        ...formData,
        why_choose_us_items: [...formData.why_choose_us_items, { ...newWhyChooseItem }]
      })
      setNewWhyChooseItem({ title: '', text: '' })
    }
  }

  const removeWhyChooseItem = (index) => {
    setFormData({
      ...formData,
      why_choose_us_items: formData.why_choose_us_items.filter((_, i) => i !== index)
    })
  }

  if (loading) {
    return <div className="loading">טוען תוכן אודות...</div>
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h2>עריכת עמוד אודות</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '24px', borderRadius: '8px' }}>
        <div className="form-group">
          <label>כותרת עמוד</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

        <h3 style={{ marginTop: '32px', marginBottom: '16px', color: '#991b1b' }}>מי אנחנו?</h3>
        <div className="form-group">
          <label>כותרת</label>
          <input
            type="text"
            value={formData.who_we_are_title}
            onChange={(e) => setFormData({...formData, who_we_are_title: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>תוכן</label>
          <textarea
            value={formData.who_we_are_text}
            onChange={(e) => setFormData({...formData, who_we_are_text: e.target.value})}
            rows="4"
            required
          />
        </div>

        <h3 style={{ marginTop: '32px', marginBottom: '16px', color: '#991b1b' }}>החזון שלנו</h3>
        <div className="form-group">
          <label>כותרת</label>
          <input
            type="text"
            value={formData.vision_title}
            onChange={(e) => setFormData({...formData, vision_title: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>תוכן</label>
          <textarea
            value={formData.vision_text}
            onChange={(e) => setFormData({...formData, vision_text: e.target.value})}
            rows="4"
            required
          />
        </div>

        <h3 style={{ marginTop: '32px', marginBottom: '16px', color: '#991b1b' }}>מה אנחנו מציעים?</h3>
        <div className="form-group">
          <label>כותרת</label>
          <input
            type="text"
            value={formData.what_we_offer_title}
            onChange={(e) => setFormData({...formData, what_we_offer_title: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>פריטים</label>
          {formData.what_we_offer_items.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const newItems = [...formData.what_we_offer_items]
                  newItems[index] = e.target.value
                  setFormData({...formData, what_we_offer_items: newItems})
                }}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => removeOfferItem(index)}
                className="btn-icon btn-danger"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <input
              type="text"
              value={newOfferItem}
              onChange={(e) => setNewOfferItem(e.target.value)}
              placeholder="הוסף פריט חדש"
              style={{ flex: 1 }}
            />
            <button type="button" onClick={addOfferItem} className="btn btn-outline">
              <FiPlus /> הוסף
            </button>
          </div>
        </div>

        <h3 style={{ marginTop: '32px', marginBottom: '16px', color: '#991b1b' }}>למה לבחור בנו?</h3>
        <div className="form-group">
          <label>כותרת</label>
          <input
            type="text"
            value={formData.why_choose_us_title}
            onChange={(e) => setFormData({...formData, why_choose_us_title: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>פריטים</label>
          {formData.why_choose_us_items.map((item, index) => (
            <div key={index} style={{ marginBottom: '16px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => {
                    const newItems = [...formData.why_choose_us_items]
                    newItems[index].title = e.target.value
                    setFormData({...formData, why_choose_us_items: newItems})
                  }}
                  placeholder="כותרת"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => removeWhyChooseItem(index)}
                  className="btn-icon btn-danger"
                >
                  <FiTrash2 />
                </button>
              </div>
              <textarea
                value={item.text}
                onChange={(e) => {
                  const newItems = [...formData.why_choose_us_items]
                  newItems[index].text = e.target.value
                  setFormData({...formData, why_choose_us_items: newItems})
                }}
                placeholder="תוכן"
                rows="2"
                style={{ width: '100%' }}
              />
            </div>
          ))}
          <div style={{ marginTop: '16px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
            <input
              type="text"
              value={newWhyChooseItem.title}
              onChange={(e) => setNewWhyChooseItem({...newWhyChooseItem, title: e.target.value})}
              placeholder="כותרת פריט חדש"
              style={{ width: '100%', marginBottom: '8px' }}
            />
            <textarea
              value={newWhyChooseItem.text}
              onChange={(e) => setNewWhyChooseItem({...newWhyChooseItem, text: e.target.value})}
              placeholder="תוכן פריט חדש"
              rows="2"
              style={{ width: '100%', marginBottom: '8px' }}
            />
            <button type="button" onClick={addWhyChooseItem} className="btn btn-outline">
              <FiPlus /> הוסף פריט
            </button>
          </div>
        </div>

        <h3 style={{ marginTop: '32px', marginBottom: '16px', color: '#991b1b' }}>קישורי רשתות חברתיות</h3>
        <div className="form-group">
          <label>קישור וואטסאפ</label>
          <input
            type="url"
            value={formData.whatsapp_url}
            onChange={(e) => setFormData({...formData, whatsapp_url: e.target.value})}
            placeholder="https://wa.me/972XXXXXXXXX"
          />
        </div>
        <div className="form-group">
          <label>קישור אינסטגרם</label>
          <input
            type="url"
            value={formData.instagram_url}
            onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
            placeholder="https://instagram.com/your_account"
          />
        </div>
        <div className="form-group">
          <label>קישור טיקטוק</label>
          <input
            type="url"
            value={formData.tiktok_url}
            onChange={(e) => setFormData({...formData, tiktok_url: e.target.value})}
            placeholder="https://tiktok.com/@your_account"
          />
        </div>
        <div className="form-group">
          <label>טלפון לחיוג (לכפתור הצף)</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="050-1234567"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">שמור שינויים</button>
        </div>
      </form>
    </div>
  )
}

const ProductModal = ({ formData, setFormData, onSubmit, onClose, editing }) => {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    axios.get(`${API_URL}/categories`).then(res => setCategories(res.data))
  }, [])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{editing ? 'ערוך מוצר' : 'הוסף מוצר חדש'}</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>שם (אנגלית)</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>שם (עברית)</label>
            <input 
              type="text" 
              value={formData.name_he} 
              onChange={(e) => setFormData({...formData, name_he: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>תיאור</label>
            <textarea 
              value={formData.description_he} 
              onChange={(e) => setFormData({...formData, description_he: e.target.value})}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>מחיר (₪)</label>
              <input 
                type="number" 
                step="0.01"
                value={formData.price} 
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>מחיר מבצע (₪) - אופציונלי</label>
              <input 
                type="number" 
                step="0.01"
                value={formData.sale_price} 
                onChange={(e) => setFormData({...formData, sale_price: e.target.value})}
                placeholder="השאר ריק אם אין מבצע"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>מק"ט</label>
              <input 
                type="text" 
                value={formData.sku} 
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>מותג</label>
              <input 
                type="text" 
                value={formData.brand} 
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
              />
            </div>
          </div>
          <div className="form-group">
            <label>קטגוריות (ניתן לבחור כמה)</label>
            <div className="category-checkboxes" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', marginTop: '8px' }}>
              {categories.map(cat => {
                const checked = (formData.category_ids || []).includes(Number(cat.id))
                return (
                  <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const ids = [...(formData.category_ids || [])]
                        const numId = Number(cat.id)
                        const newIds = e.target.checked
                          ? (ids.includes(numId) ? ids : [...ids, numId])
                          : ids.filter(i => i !== numId)
                        setFormData({...formData, category_ids: newIds})
                      }}
                    />
                    <span>{cat.name_he}</span>
                  </label>
                )
              })}
            </div>
          </div>
          <div className="form-group">
            <label>קישור תמונה ראשית</label>
            <input 
              type="url" 
              value={formData.image_url} 
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="form-group">
            <label>תמונות נוספות</label>
            <div className="images-list">
              {formData.images && formData.images.map((img, idx) => (
                <div key={idx} className="image-input-row">
                  <input 
                    type="url" 
                    value={img} 
                    onChange={(e) => {
                      const newImages = [...formData.images]
                      newImages[idx] = e.target.value
                      setFormData({...formData, images: newImages})
                    }}
                    placeholder="https://example.com/image2.jpg"
                    className="image-url-input"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      const newImages = formData.images.filter((_, i) => i !== idx)
                      setFormData({...formData, images: newImages})
                    }}
                    className="btn-icon btn-danger"
                    style={{ marginLeft: '8px' }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
              <button 
                type="button"
                onClick={() => setFormData({...formData, images: [...(formData.images || []), '']})}
                className="btn btn-outline"
                style={{ marginTop: '8px' }}
              >
                <FiPlus /> הוסף תמונה נוספת
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>מודלים תואמים (מופרדים בפסיק)</label>
            <input 
              type="text" 
              value={formData.compatible_models} 
              onChange={(e) => setFormData({...formData, compatible_models: e.target.value})}
              placeholder="Yamaha YFZ450, Honda TRX450"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">שמור</button>
            <button type="button" onClick={onClose} className="btn btn-secondary">ביטול</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const CategoryModal = ({ formData, setFormData, onSubmit, onClose, editing }) => {
  const imageUrl = (formData.image_url || '').trim()
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{editing ? 'ערוך קטגוריה' : 'הוסף קטגוריה חדשה'}</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>שם (אנגלית)</label>
            <input 
              type="text" 
              value={formData.name || ''} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>שם (עברית)</label>
            <input 
              type="text" 
              value={formData.name_he || ''} 
              onChange={(e) => setFormData({...formData, name_he: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>תיאור</label>
            <textarea 
              value={formData.description || ''} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>קישור תמונה (יש להזין כתובת מלאה, למשל https://example.com/image.jpg)</label>
            <input 
              type="text" 
              placeholder="https://..."
              value={formData.image_url || ''} 
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
            />
            {imageUrl && (
              <div className="category-image-preview" style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>תצוגה מקדימה:</p>
                <img 
                  src={imageUrl} 
                  alt="תצוגה מקדימה" 
                  style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    const err = e.target.parentElement?.querySelector('.image-load-error')
                    if (err) err.style.display = 'block'
                  }}
                />
                <p className="image-load-error" style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px', display: 'none' }}>
                  התמונה לא נטענה - ייתכן שהקישור לא תקין או שהשרת חוסם (נסה קישור HTTPS)
                </p>
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">שמור</button>
            <button type="button" onClick={onClose} className="btn btn-secondary">ביטול</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminPanel



