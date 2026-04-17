import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [name, setName] = useState("أم السعد سفيان")
  const [city, setCity] = useState("الجزائر")
  const [prayerTimes, setPrayerTimes] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [douaas, setDouaas] = useState<any[]>([])
  const [newDouaa, setNewDouaa] = useState("")
  const [prayerStats, setPrayerStats] = useState({
    الفجر: 0, الظهر: 0, العصر: 0, المغرب: 0, العشاء: 0
  })
  const [showDashboard, setShowDashboard] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [qiblaDirection, setQiblaDirection] = useState(0)

  const totalPrayers = Object.values(prayerStats).reduce((a, b) => a + b, 0)
  const completionRate = Math.min(100, (totalPrayers / 5) * 100)

  const fetchPrayerTimes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=الجزائر&method=8`)
      const data = await response.json()
      if (data.code === 200) setPrayerTimes(data.data.timings)
    } catch (error) { console.error("خطأ:", error) }
    finally { setLoading(false) }
  }

  const recordPrayer = (prayer: string) => {
    setPrayerStats({...prayerStats, [prayer]: prayerStats[prayer as keyof typeof prayerStats] + 1})
  }

  const addDouaa = () => {
    if (!newDouaa.trim()) return
    setDouaas([...douaas, { text: newDouaa, date: new Date().toISOString() }])
    setNewDouaa("")
  }

  const shareToWhatsApp = () => {
    const message = `تقرير صلاتي اليوم\nالفجر: ${prayerStats.الفجر}\nالظهر: ${prayerStats.الظهر}\nالعصر: ${prayerStats.العصر}\nالمغرب: ${prayerStats.المغرب}\nالعشاء: ${prayerStats.العشاء}\nالإجمالي: ${totalPrayers} صلاة`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  useEffect(() => {
    fetchPrayerTimes()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [city])

  useEffect(() => {
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (event) => {
        if (event.alpha !== null) setQiblaDirection(event.alpha)
      })
    }
  }, [])

  const hours = currentTime.getHours()
  const minutes = currentTime.getMinutes()
  const seconds = currentTime.getSeconds()
  const day = currentTime.getDate()
  const month = currentTime.getMonth() + 1
  const year = currentTime.getFullYear()
  const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const dayName = weekDays[currentTime.getDay()]

  const getGreeting = () => {
    if (hours < 12) return "صباح الخير ☀️"
    if (hours < 18) return "مساء الخير 🌤️"
    return "مساء النور 🌙"
  }

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <button className="menu-btn" onClick={() => setShowSidebar(!showSidebar)}>☰</button>

      <div className={`sidebar ${showSidebar ? 'open' : ''}`}>
        <h3>📋 القائمة</h3>
        <ul>
          <li onClick={() => window.open('https://quran.com/', '_blank')}>📖 المصحف</li>
          <li onClick={() => window.open('https://www.islamweb.net/', '_blank')}>📚 مكتبة إسلامية</li>
          <li onClick={() => setDarkMode(!darkMode)}>{darkMode ? '☀️ وضع نهاري' : '🌙 وضع ليلي'}</li>
          <li onClick={() => setPrayerStats({ الفجر: 0, الظهر: 0, العصر: 0, المغرب: 0, العشاء: 0 })}>🔄 إعادة تعيين</li>
          <li onClick={shareToWhatsApp}>💬 مشاركة عبر واتساب</li>
          <li onClick={() => setShowDashboard(!showDashboard)}>📊 {showDashboard ? 'إخفاء' : 'إظهار'} لوحة التحكم</li>
          <li onClick={() => setShowReport(!showReport)}>📄 {showReport ? 'إخفاء' : 'إظهار'} التقرير</li>
          <li onClick={() => setShowQuiz(!showQuiz)}>🎮 {showQuiz ? 'إغلاق' : 'فتح'} الألعاب</li>
          <li onClick={() => setShowSidebar(false)}>❌ إغلاق</li>
        </ul>
      </div>

      <div className="container">
        <div className="header">
          <h1 className="greeting">{getGreeting()}</h1>
          <h2 className="name">{name}</h2>
          <div className="datetime">
            <span className="date">📅 {dayName} {day}/{month}/{year}</span>
            <span className="time">{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
          </div>
        </div>

        <div className="search-section">
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="البحث عن مدينة..." className="city-input" />
          <button onClick={fetchPrayerTimes} className="search-btn">🔍 بحث</button>
        </div>

        <div className="progress-section">
          <h3>📊 نسبة إنجاز الصلوات</h3>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${completionRate}%` }}></div></div>
          <p className="progress-text">{Math.round(completionRate)}%</p>
        </div>

        <div className="prayer-section">
          <h3>🕌 أوقات الصلاة في {city}</h3>
          {loading ? <div className="loader"></div> : prayerTimes ? (
            <div className="prayer-grid">
              <div className="prayer-card"><span>🇫🇯 الفجر</span><strong>{prayerTimes.Fajr?.substring(0, 5)}</strong></div>
              <div className="prayer-card"><span>🌙 الظهر</span><strong>{prayerTimes.Dhuhr?.substring(0, 5)}</strong></div>
              <div className="prayer-card"><span>📖 العصر</span><strong>{prayerTimes.Asr?.substring(0, 5)}</strong></div>
              <div className="prayer-card"><span>🌅 المغرب</span><strong>{prayerTimes.Maghrib?.substring(0, 5)}</strong></div>
              <div className="prayer-card"><span>⭐ العشاء</span><strong>{prayerTimes.Isha?.substring(0, 5)}</strong></div>
            </div>
          ) : null}
        </div>

        <div className="stats-section">
          <h3>📈 إحصائيات الصلوات اليومية</h3>
          <div className="stats-grid">
            {Object.entries(prayerStats).map(([prayer, count]) => (
              <div key={prayer} className="stat-card">
                <span>🕌 {prayer}</span>
                <strong>{count}</strong>
                <button onClick={() => recordPrayer(prayer)} className="stat-btn">➕</button>
              </div>
            ))}
          </div>
          <div className="stats-total"><span>📊 إجمالي الصلوات: {totalPrayers}</span></div>
        </div>

        {/* بوصلة القبلة */}
        <div className="qibla-compass">
          <h3>🕋 اتجاه القبلة</h3>
          <div className="compass">
            <div className="compass-needle" style={{ transform: `rotate(${qiblaDirection}deg)` }}>🧭</div>
          </div>
          <p>اتجه {Math.round(qiblaDirection)}° من الشمال</p>
        </div>

        {/* الأدعية */}
        <div className="douaa-section">
          <h3>📿 أدعية المستخدمين</h3>
          <div className="douaa-input">
            <input type="text" value={newDouaa} onChange={(e) => setNewDouaa(e.target.value)} placeholder="اكتب دعاء..." />
            <button onClick={addDouaa}>➕ إضافة</button>
          </div>
          <div className="douaas-list">
            {douaas.slice().reverse().map((douaa, index) => (
              <div key={index} className="douaa-card">
                <p>📖 {douaa.text}</p>
                <small>{new Date(douaa.date).toLocaleDateString('ar')}</small>
              </div>
            ))}
          </div>
        </div>

        {/* لوحة التحكم */}
        {showDashboard && (
          <div className="dashboard-modern">
            <h3>📊 لوحة التحكم</h3>
            <div className="dashboard-stats">
              <div className="dash-card"><span>📈 إجمالي الصلوات</span><strong>{totalPrayers}</strong></div>
              <div className="dash-card"><span>🎯 نسبة الإنجاز</span><strong>{Math.round(completionRate)}%</strong></div>
              <div className="dash-card"><span>⭐ مستوى الالتزام</span><strong>{completionRate > 80 ? 'ممتاز' : completionRate > 50 ? 'جيد' : 'يحتاج تحسين'}</strong></div>
            </div>
          </div>
        )}

        {/* التقرير */}
        {showReport && (
          <div className="report-modal">
            <div className="report-content">
              <h3>📄 تقرير العبادات</h3>
              <p>📅 {new Date().toLocaleDateString('ar')}</p>
              <p>🕌 الفجر: {prayerStats.الفجر}</p>
              <p>🌙 الظهر: {prayerStats.الظهر}</p>
              <p>📖 العصر: {prayerStats.العصر}</p>
              <p>🌅 المغرب: {prayerStats.المغرب}</p>
              <p>⭐ العشاء: {prayerStats.العشاء}</p>
              <p>📊 الإجمالي: {totalPrayers}</p>
              <button onClick={() => setShowReport(false)}>❌ إغلاق</button>
            </div>
          </div>
        )}

        {/* الألعاب */}
        {showQuiz && (
          <div className="quiz-modal">
            <div className="quiz-content">
              <h3>🎮 اختبار ديني</h3>
              <p>ما هي أول صلاة فرضت على النبي؟</p>
              <button onClick={() => alert("الظهر ✅")}>الظهر</button>
              <button onClick={() => alert("الفجر ❌")}>الفجر</button>
              <button onClick={() => setShowQuiz(false)}>❌ إغلاق</button>
            </div>
          </div>
        )}

        <div className="quote-card">
          <p className="quote-text">"إن مع العسر يسراً"</p>
          <p className="quote-ref">سورة الشرح</p>
        </div>
      </div>
    </div>
  )
}

export default App
