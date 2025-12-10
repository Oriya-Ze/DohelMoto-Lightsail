import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import './PaymentCallback.css'

const API_URL = '/api'

const PaymentCallback = ({ type }) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const orderId = searchParams.get('order_id')

  useEffect(() => {
    if (orderId && type === 'success') {
      // Update order status
      const token = localStorage.getItem('token')
      axios.post(
        `${API_URL}/payment/verifone/callback`,
        { transaction_id: searchParams.get('transaction_id'), status: 'success', order_id: orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      ).finally(() => {
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [orderId, type, searchParams])

  if (loading) {
    return <div className="payment-callback loading">מעבד...</div>
  }

  if (type === 'success') {
    return (
      <div className="payment-callback success">
        <div className="payment-message">
          <h1>✅ התשלום בוצע בהצלחה!</h1>
          <p>תודה על הקנייה שלך. ההזמנה שלך התקבלה ותטופל בהקדם.</p>
          <p>מספר הזמנה: #{orderId}</p>
          <div className="payment-actions">
            <button onClick={() => navigate('/orders')} className="btn btn-primary">
              צפה בהזמנות שלי
            </button>
            <button onClick={() => navigate('/')} className="btn btn-outline">
              חזור לעמוד הבית
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'cancel') {
    return (
      <div className="payment-callback cancel">
        <div className="payment-message">
          <h1>⚠️ התשלום בוטל</h1>
          <p>התשלום בוטל על ידך. ההזמנה נשמרה ותוכל להשלים את התשלום מאוחר יותר.</p>
          <div className="payment-actions">
            <button onClick={() => navigate('/cart')} className="btn btn-primary">
              חזור לעגלה
            </button>
            <button onClick={() => navigate('/')} className="btn btn-outline">
              חזור לעמוד הבית
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="payment-callback error">
      <div className="payment-message">
        <h1>❌ שגיאה בתשלום</h1>
        <p>אירעה שגיאה בעת עיבוד התשלום. אנא נסה שוב או פנה לתמיכה.</p>
        <div className="payment-actions">
          <button onClick={() => navigate('/cart')} className="btn btn-primary">
            חזור לעגלה
          </button>
          <button onClick={() => navigate('/')} className="btn btn-outline">
            חזור לעמוד הבית
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentCallback

