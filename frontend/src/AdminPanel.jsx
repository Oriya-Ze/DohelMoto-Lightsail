import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FiPlus, FiEdit, FiTrash2, FiPackage, FiShoppingBag, FiTag } from 'react-icons/fi'
import './AdminPanel.css'

const API_URL = '/api'

const AdminPanel = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
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
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'products') {
        const res = await axios.get(`${API_URL}/admin/products`, getAuthHeaders())
        setProducts(res.data)
      } else if (activeTab === 'categories') {
        const res = await axios.get(`${API_URL}/categories`)
        setCategories(res.data)
      } else if (activeTab === 'orders') {
        const res = await axios.get(`${API_URL}/admin/orders`, getAuthHeaders())
        setOrders(res.data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      alert('שגיאה בטעינת הנתונים')
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
    <div className="admin-panel">
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
    category_id: '',
    image_url: '',
    stock: '',
    sku: '',
    brand: '',
    compatible_models: '',
    is_active: true
  })

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        ...editingProduct,
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
        category_id: '',
        image_url: '',
        stock: '',
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
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category_id: parseInt(formData.category_id),
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
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>מק"ט</th>
                <th>שם</th>
                <th>מחיר</th>
                <th>מלאי</th>
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
                  <td>{product.stock}</td>
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
      setFormData(editingCategory)
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
      if (editingCategory) {
        await axios.put(`${API_URL}/admin/categories/${editingCategory.id}`, formData, getAuthHeaders())
        alert('הקטגוריה עודכנה בהצלחה')
      } else {
        await axios.post(`${API_URL}/admin/categories`, formData, getAuthHeaders())
        alert('הקטגוריה נוצרה בהצלחה')
      }
      onClose()
    } catch (error) {
      alert('שגיאה בשמירת הקטגוריה')
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
              <label>מלאי</label>
              <input 
                type="number" 
                value={formData.stock} 
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                required
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
            <label>קטגוריה</label>
            <select 
              value={formData.category_id} 
              onChange={(e) => setFormData({...formData, category_id: e.target.value})}
              required
            >
              <option value="">בחר קטגוריה</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name_he}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>קישור תמונה</label>
            <input 
              type="url" 
              value={formData.image_url} 
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
            />
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
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{editing ? 'ערוך קטגוריה' : 'הוסף קטגוריה חדשה'}</h2>
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
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>קישור תמונה</label>
            <input 
              type="url" 
              value={formData.image_url} 
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
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

export default AdminPanel


