import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [name, setName] = useState("أم السعد سفيان")
  const [city, setCity] = useState("الجزائر")
  const [prayerTimes, setPrayerTimes] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showAdvancedStats, setShowAdvancedStats] = useState(false)
  const [notifications, setNotifications] = useState<string[]>([])
  const [counter, setCounter] = useState(0)
  const [animation, setAnimation] = useState(false)
  
  const [prayerStats, setPrayerStats] = useState({
    الفجر: 0, الظهر: 0, العصر: 0, المغرب: 0, العشاء: 0
  })

  // ========== دوال JavaScript المتقدمة ==========
  
  // 1. تأثير الكتابة التلقائية (Typing Effect)
  const [typedText, setTypedText] = useState("")
  const fullText = "مرحباً بك في تطبيق أوقات الصلاة المتقدم"
  
  useEffect(() => {
    let i = 0
    const typing = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.substring(0, i + 1))
        i++
      } else {
        clearInterval(typing)
      }
    }, 50)
    return () => clearInterval(typing)
  }, [])

  // 2. مؤقت زمني (Countdown Timer)
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  
  const startTimer = (seconds: number) => {
    setTimer(seconds)
    setIsTimerRunning(true)
  }
  
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1)
      }, 1000)
    } else if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false)
      alert("⏰ انتهى المؤقت!")
      addNotification("⏰ انتهى المؤقت الزمني")
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timer])

  // 3. إشعارات تفاعلية (Toast Notifications)
  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
    setTimeout(() => {
      setNotifications(prev => prev.slice(1))
    }, 3000)
  }

  // 4. تأثير اهتزاز (Shake Effect)
  const shakeElement = (elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.classList.add('shake')
      setTimeout(() => element.classList.remove('shake'), 500)
    }
  }

  // 5. نسخ النص إلى الحافظة (Copy to Clipboard)
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      addNotification("📋 تم نسخ النص إلى الحافظة")
    } catch (err) {
      console.error("خطأ في النسخ:", err)
    }
  }

  // 6. تحديد الموقع الجغرافي (Geolocation)
  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords
        addNotification(`📍 موقعك: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`)
        // يمكن استخدام هذه الإحداثيات لجلب المدينة تلقائياً
      }, () => {
        addNotification("❌ تعذر تحديد الموقع")
      })
    } else {
      addNotification("❌ متصفحك لا يدعم تحديد الموقع")
    }
  }

  // 7. تأثير العد التنازلي المتحرك (Animated Counter)
  const animateCounter = useCallback((target: number) => {
    let start = 0
    const duration = 1000
    const step = (timestamp: number) => {
      start = timestamp
      const increment = (target / duration) * 16
      const updateCounter = () => {
        setCounter(prev => {
          const next = prev + increment
          return next >= target ? target : next
        })
      }
      requestAnimationFrame(updateCounter)
    }
    requestAnimationFrame(step)
  }, [])

  // 8. تأثير تموج عند النقر (Ripple Effect)
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget
    const ripple = document.createElement('span')
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    
    ripple.style.width = ripple.style.height = `${size}px`
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    ripple.classList.add('ripple')
    
    button.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
  }

  // 9. تحميل البيانات مع مؤشر تقدم (Loading with Progress)
  const [loadingProgress, setLoadingProgress] = useState(0)
  
  const fetchWithProgress = async () => {
    setLoading(true)
    setLoadingProgress(0)
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev
        return prev + 10
      })
    }, 100)
    
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=الجزائر&method=8`
      )
      const data = await response.json()
      if (data.code === 200) {
        setPrayerTimes(data.data.timings)
        setLoadingProgress(100)
        addNotification("✅ تم تحميل أوقات الصلاة بنجاح")
      }
    } catch (error) {
      console.error("خطأ:", error)
      addNotification("❌ خطأ في تحميل البيانات")
    } finally {
      setTimeout(() => {
        setLoading(false)
        setLoadingProgress(0)
      }, 500)
      clearInterval(interval)
    }
  }

  // 10. تأثير الكتابة على الزر (Button Hover Effect)
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  // دوال اللوغاريتمات
  const totalPrayers = Object.values(prayerStats).reduce((a, b) => a + b, 0)
  const completionRate = Math.min(100, (totalPrayers / 5) * 100)
  const logTotalPrayers = Math.log2(totalPrayers + 1)
  const spiritualPower = Math.pow(completionRate / 10, 1.5)

  // تسجيل صلاة مع تأثيرات
  const recordPrayer = (prayer: string) => {
    setPrayerStats({...prayerStats, [prayer]: prayerStats[prayer as keyof typeof prayerStats] + 1})
    addNotification(`✅ تم تسجيل صلاة ${prayer}`)
    setAnimation(true)
    setTimeout(() => setAnimation(false), 500)
    shakeElement('stats-section')
  }

  // جلب أوقات الصلاة
  const fetchPrayerTimes = async () => {
    fetchWithProgress()
  }

  // حفظ البيانات
  useEffect(() => {
    localStorage.setItem('prayerStats', JSON.stringify(prayerStats))
    localStorage.setItem('city', city)
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [prayerStats, city, darkMode])

  useEffect(() => {
    const savedStats = localStorage.getItem('prayerStats')
    if (savedStats) setPrayerStats(JSON.parse(savedStats))
    const savedCity = localStorage.getItem('city')
    if (savedCity) setCity(savedCity)
    const savedDark = localStorage.getItem('darkMode')
    if (savedDark) setDarkMode(JSON.parse(savedDark))
  }, [])

  useEffect(() => {
    fetchPrayerTimes()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [city])

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
      {/* إشعارات Toast */}
      <div className="toast-container">
        {notifications.map((notif, index) => (
          <div key={index} className="toast">{notif}</div>
        ))}
      </div>

      <button className="menu-btn" onClick={() => setShowSidebar(!showSidebar)}>☰</button>

      <div className={`sidebar ${showSidebar ? 'open' : ''}`}>
        <h3>📋 القائمة</h3>
        <ul>
          <li onClick={() => window.open('https://quran.com/', '_blank')}>📖 المصحف</li>
          <li onClick={() => window.open('https://www.islamweb.net/', '_blank')}>📚 مكتبة إسلامية</li>
          <li onClick={() => setDarkMode(!darkMode)}>{darkMode ? '☀️ وضع نهاري' : '🌙 وضع ليلي'}</li>
          <li onClick={() => setPrayerStats({ الفجر: 0, الظهر: 0, العصر: 0, المغرب: 0, العشاء: 0 })}>🔄 إعادة تعيين</li>
          <li onClick={() => setShowAdvancedStats(!showAdvancedStats)}>📊 {showAdvancedStats ? 'إخفاء' : 'إظهار'} التحليلات</li>
          <li onClick={getCurrentLocation}>📍 تحديد موقعي</li>
          <li onClick={() => copyToClipboard(window.location.href)}>🔗 مشاركة التطبيق</li>
          <li onClick={() => startTimer(60)}>⏱️ مؤقت 60 ثانية</li>
          <li onClick={() => setShowSidebar(false)}>❌ إغلاق</li>
        </ul>
      </div>

      <div className="container">
        <div className="header">
          <h1 className="greeting">{getGreeting()}</h1>
          <h2 className="name">{name}</h2>
          <div className="typing-text">{typedText}</div>
          <div className="datetime">
            <span className="date">📅 {dayName} {day}/{month}/{year}</span>
            <span className="time">{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
          </div>
        </div>

        {isTimerRunning && timer > 0 && (
          <div className="timer-display">
            ⏰ الوقت المتبقي: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
          </div>
        )}

        {loading && loadingProgress > 0 && (
          <div className="progress-loader">
            <div className="progress-bar-loader" style={{ width: `${loadingProgress}%` }}></div>
            <span>{loadingProgress}%</span>
          </div>
        )}

        <div className="search-section">
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="البحث عن مدينة..." className="city-input" />
          <button onClick={fetchPrayerTimes} className="search-btn" onMouseEnter={() => setHoveredButton('search')} onMouseLeave={() => setHoveredButton(null)}>
            🔍 بحث
          </button>
        </div>

        <div className="progress-section">
          <h3>📊 نسبة إنجاز الصلوات</h3>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${completionRate}%` }}></div></div>
          <p className="progress-text">{Math.round(completionRate)}%</p>
        </div>

        <div id="prayer-section" className="prayer-section">
          <h3>🕌 أوقات الصلاة في {city}</h3>
          {loading ? <div className="loader"></div> : prayerTimes ? (
            <div className="prayer-grid">
              <div className="prayer-card" onClick={() => copyToClipboard(prayerTimes.Fajr?.substring(0, 5))}><span>🇫🇯 الفجر</span><strong>{prayerTimes.Fajr?.substring(0, 5)}</strong></div>
              <div className="prayer-card" onClick={() => copyToClipboard(prayerTimes.Dhuhr?.substring(0, 5))}><span>🌙 الظهر</span><strong>{prayerTimes.Dhuhr?.substring(0, 5)}</strong></div>
              <div className="prayer-card" onClick={() => copyToClipboard(prayerTimes.Asr?.substring(0, 5))}><span>📖 العصر</span><strong>{prayerTimes.Asr?.substring(0, 5)}</strong></div>
              <div className="prayer-card" onClick={() => copyToClipboard(prayerTimes.Maghrib?.substring(0, 5))}><span>🌅 المغرب</span><strong>{prayerTimes.Maghrib?.substring(0, 5)}</strong></div>
              <div className="prayer-card" onClick={() => copyToClipboard(prayerTimes.Isha?.substring(0, 5))}><span>⭐ العشاء</span><strong>{prayerTimes.Isha?.substring(0, 5)}</strong></div>
            </div>
          ) : null}
          <p className="drag-hint">💡 اضغط على أي وقت لنسخه</p>
        </div>

        <div id="stats-section" className={`stats-section ${animation ? 'bounce' : ''}`}>
          <h3>📈 إحصائيات الصلوات اليومية</h3>
          <div className="stats-grid">
            {Object.entries(prayerStats).map(([prayer, count]) => (
              <div key={prayer} className="stat-card">
                <span>🕌 {prayer}</span>
                <strong>{count}</strong>
                <button onClick={(e) => { createRipple(e); recordPrayer(prayer); }} className="stat-btn">➕</button>
              </div>
            ))}
          </div>
          <div className="stats-total"><span>📊 إجمالي الصلوات: {totalPrayers}</span></div>
        </div>

        {showAdvancedStats && (
          <div className="advanced-stats">
            <h3>📈 التحليلات المتقدمة</h3>
            <div className="stats-grid-advanced">
              <div className="stat-card-advanced"><span>📊 log₂(الصلوات)</span><strong>{logTotalPrayers.toFixed(2)}</strong><small>اللوغاريتم الثنائي</small></div>
              <div className="stat-card-advanced"><span>⚡ الطاقة الروحية</span><strong>{Math.round(spiritualPower)}</strong><small>{spiritualPower < 50 ? "يحتاج تحفيز" : spiritualPower < 100 ? "في طريق النور" : "نور متزايد"}</small></div>
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
