import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [name, setName] = useState("أم السعد سفيان")
  const [wifeName, setWifeName] = useState("مونيا")
  const [sonName, setSonName] = useState("ياسين")
  const [glowColor, setGlowColor] = useState("#667eea")
  const [darkMode, setDarkMode] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  
  // ========== أوقات الصلاة ==========
  const [prayerTimes, setPrayerTimes] = useState<any>(null)
  const [city, setCity] = useState("الجزائر")
  const [country, setCountry] = useState("الجزائر")
  const [loading, setLoading] = useState(true)
  const [nextPrayer, setNextPrayer] = useState("")
  const [nextPrayerTime, setNextPrayerTime] = useState("")
  const [timeRemaining, setTimeRemaining] = useState("")
  const [hijriDate, setHijriDate] = useState("")
  
  // ========== اتجاه القبلة ==========
  const [qiblaDirection, setQiblaDirection] = useState(0)
  const [deviceOrientation, setDeviceOrientation] = useState(0)
  
  // ========== أذكار الصباح والمساء ==========
  const [showAthkar, setShowAthkar] = useState(false)
  const [athkarCount, setAthkarCount] = useState(0)
  
  const morningAthkar = [
    { text: "اللهم بك أصبحنا وبك أمسينا", count: 1 },
    { text: "سبحان الله وبحمده", count: 100 },
    { text: "أستغفر الله وأتوب إليه", count: 100 },
    { text: "حسبي الله لا إله إلا هو", count: 10 },
    { text: "لا إله إلا الله وحده لا شريك له", count: 10 }
  ]

  // ========== إحصائيات الصلوات ==========
  const [prayerStats, setPrayerStats] = useState({
    الفجر: 0, الشروق: 0, الظهر: 0, العصر: 0, المغرب: 0, العشاء: 0
  })

  const quotes = [
    "💪 لا تؤجل عمل اليوم إلى الغد",
    "✨ النجاح يبدأ بخطوة صغيرة",
    "📚 المعرفة كنز لا ينفد",
    "❤️ الحياة جميلة بأشخاصها",
    "🌟 احلم ثم حقق أحلامك"
  ]
  const [quote, setQuote] = useState(quotes[0])

  // ========== اتجاه القبلة ==========
  useEffect(() => {
    const qiblaAngle = 118.5 // زاوية القبلة في الجزائر
    
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (event) => {
        if (event.alpha !== null) {
          setDeviceOrientation(event.alpha)
          const direction = (qiblaAngle - event.alpha + 360) % 360
          setQiblaDirection(direction)
        }
      })
    }
  }, [])

  // ========== التاريخ الهجري ==========
  useEffect(() => {
    fetch('https://api.aladhan.com/v1/gToH?date=' + new Date().toISOString().split('T')[0])
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setHijriDate(`${data.data.hijri.day} ${data.data.hijri.month.ar} ${data.data.hijri.year}`)
        }
      })
      .catch(err => console.log("خطأ في جلب التاريخ الهجري"))
  }, [])

  // ========== الإشعارات ==========
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setNotificationsEnabled(true)
        alert("✅ تم تفعيل الإشعارات!")
      } else {
        alert("⚠️ لم يتم تفعيل الإشعارات")
      }
    } else {
      alert("⚠️ المتصفح لا يدعم الإشعارات")
    }
  }

  const sendNotification = (title: string, body: string) => {
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body })
    }
  }

  // ========== الأذكار ==========
  const recordAthkar = (text: string) => {
    setAthkarCount(athkarCount + 1)
    alert(`✅ تم تسجيل ذكر: ${text}`)
  }

  // ========== جلب أوقات الصلاة ==========
  const fetchPrayerTimes = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=8`
      )
      const data = await response.json()
      if (data.code === 200) {
        setPrayerTimes(data.data.timings)
      }
    } catch (error) {
      console.error("خطأ في جلب أوقات الصلاة:", error)
    } finally {
      setLoading(false)
    }
  }

  // ========== تحديد المدينة عبر IP ==========
  const fetchCityFromIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      if (data.city && data.country_name) {
        setCity(data.city)
        setCountry(data.country_name)
      }
    } catch (error) {
      console.error("خطأ في جلب المدينة:", error)
    }
  }

  // ========== تحديث الوقت ==========
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // ========== تحديث الصلاة القادمة ==========
  useEffect(() => {
    if (!prayerTimes) return

    const now = currentTime
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    const prayers = [
      { name: "الفجر", time: prayerTimes.Fajr?.substring(0, 5) },
      { name: "الشروق", time: prayerTimes.Sunrise?.substring(0, 5) },
      { name: "الظهر", time: prayerTimes.Dhuhr?.substring(0, 5) },
      { name: "العصر", time: prayerTimes.Asr?.substring(0, 5) },
      { name: "المغرب", time: prayerTimes.Maghrib?.substring(0, 5) },
      { name: "العشاء", time: prayerTimes.Isha?.substring(0, 5) }
    ]

    let next = null
    for (const prayer of prayers) {
      if (prayer.time > currentTimeStr) {
        next = prayer
        break
      }
    }
    if (!next) {
      next = prayers[0]
    }

    setNextPrayer(next.name)
    setNextPrayerTime(next.time)
  }, [currentTime, prayerTimes])

  // ========== الوقت المتبقي ==========
  useEffect(() => {
    if (!nextPrayerTime) return
    
    const now = new Date()
    const [prayerHour, prayerMinute] = nextPrayerTime.split(':').map(Number)
    const prayerDate = new Date(now)
    prayerDate.setHours(prayerHour, prayerMinute, 0)
    
    if (prayerDate < now) {
      prayerDate.setDate(prayerDate.getDate() + 1)
    }
    
    const diff = prayerDate.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
  }, [nextPrayerTime, currentTime])

  useEffect(() => {
    fetchPrayerTimes()
    fetchCityFromIP()
  }, [city, country])

  // ========== دوال مساعدة ==========
  const getWeather = () => {
    const hours = currentTime.getHours()
    if (hours < 6) return "🌙 ليلة هادئة 18°C"
    if (hours < 12) return "☀️ مشمس وجميل 24°C"
    if (hours < 18) return "⛅ غائم جزئياً 22°C"
    return "🌙 أمسية جميلة 20°C"
  }

  const getGreeting = () => {
    const hours = currentTime.getHours()
    if (hours < 12) return "صباح الخير ☀️"
    if (hours < 18) return "مساء الخير 🌤️"
    return "مساء النور 🌙"
  }

  const recordPrayer = (prayerName: string) => {
    setPrayerStats({...prayerStats, [prayerName]: prayerStats[prayerName as keyof typeof prayerStats] + 1})
    alert(`✅ تم تسجيل صلاة ${prayerName}`)
  }

  const changeQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length)
    setQuote(quotes[randomIndex])
  }

  const changeGlowColor = () => {
    const colors = ["#667eea", "#ff6464", "#64ff64", "#ffd700", "#ff69b4"]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    setGlowColor(randomColor)
  }

  const changeBackground = () => {
    const backgrounds = [
      "linear-gradient(135deg, #667eea, #764ba2)",
      "linear-gradient(135deg, #f093fb, #f5576c)",
      "linear-gradient(135deg, #4facfe, #00f2fe)",
      "linear-gradient(135deg, #43e97b, #38f9d7)",
      "linear-gradient(135deg, #fa709a, #fee140)"
    ]
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)]
    document.body.style.background = randomBg
  }

  const hours = currentTime.getHours()
  const minutes = currentTime.getMinutes()
  const seconds = currentTime.getSeconds()
  const day = currentTime.getDate()
  const month = currentTime.getMonth() + 1
  const year = currentTime.getFullYear()
  const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const dayName = weekDays[currentTime.getDay()]

  const totalPrayers = Object.values(prayerStats).reduce((a, b) => a + b, 0)
  const completionRate = Math.min(100, (totalPrayers / 6) * 100)

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      <button className="menu-btn" onClick={() => setShowSidebar(!showSidebar)}>☰</button>

      <div className={`sidebar ${showSidebar ? 'open' : ''}`}>
        <h3>📋 القائمة</h3>
        <ul>
          <li onClick={() => window.open('https://quran.com/', '_blank')}>📖 المصحف</li>
          <li onClick={() => setShowAthkar(!showAthkar)}>📿 {showAthkar ? 'إغلاق الأذكار' : 'أذكار اليوم'}</li>
          <li onClick={requestNotificationPermission}>🔔 تفعيل الإشعارات</li>
          <li onClick={changeBackground}>🎨 تغيير الخلفية</li>
          <li onClick={fetchCityFromIP}>📍 تحديد موقعي</li>
          <li onClick={() => setShowSidebar(false)}>❌ إغلاق</li>
        </ul>
        {notificationsEnabled && <p className="notif-status">✅ الإشعارات مفعلة</p>}
      </div>

      <div className="main-content">
        <h1 className="greeting">✨ {getGreeting()} ✨</h1>
        <h2 className="name">{name}</h2>

        {/* التاريخ */}
        <div className="date-badge">
          <span>📅 {dayName} {day}/{month}/{year}</span>
          <span>🕌 {hijriDate}</span>
        </div>

        {/* أفراد العائلة */}
        <div className="family-section">
          <h3>👨‍👩‍👧‍👦 أفراد العائلة</h3>
          <div className="family-grid">
            <div className="family-card"><span>👩 الزوجة</span><strong>{wifeName}</strong></div>
            <div className="family-card"><span>👦 الابن</span><strong>{sonName}</strong></div>
          </div>
        </div>

        {/* أذكار اليوم */}
        {showAthkar && (
          <div className="athkar-section">
            <h3>📿 أذكار {currentTime.getHours() < 12 ? 'الصباح' : 'المساء'}</h3>
            <div className="athkar-list">
              {morningAthkar.map((zekr, i) => (
                <div key={i} className="zekr-card" onClick={() => recordAthkar(zekr.text)}>
                  <p>🔁 {zekr.text}</p>
                  <small>اضغط للتكرار</small>
                </div>
              ))}
            </div>
            <p className="athkar-count">📊 إجمالي الأذكار: {athkarCount}</p>
          </div>
        )}

        {/* اتجاه القبلة */}
        <div className="qibla-section">
          <h3>🕋 اتجاه القبلة</h3>
          <div className="compass">
            <div className="compass-needle" style={{ transform: `rotate(${qiblaDirection}deg)` }}>
              🧭
            </div>
          </div>
          <p>اتجه {Math.round(qiblaDirection)}° من الشمال</p>
        </div>

        {/* إحصائيات الصلوات */}
        <div className="stats-chart">
          <h3>📊 إحصائيات الصلوات</h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completionRate}%` }}></div>
          </div>
          <p className="stats-text">نسبة الإنجاز: {Math.round(completionRate)}%</p>
          <div className="stats-total">
            <span>📈 إجمالي الصلوات: {totalPrayers}</span>
          </div>
          <div className="prayer-stats-grid">
            {Object.entries(prayerStats).map(([prayer, count]) => (
              <div key={prayer} className="prayer-stat">
                <span>🕌 {prayer}</span>
                <strong>{count}</strong>
                <button onClick={() => recordPrayer(prayer)} className="small-btn">➕</button>
              </div>
            ))}
          </div>
        </div>

        {/* أوقات الصلاة */}
        <div className="prayer-section">
          <div className="prayer-header">
            <h3>🕌 أوقات الصلاة في {city}</h3>
            <div className="city-controls">
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="المدينة" className="city-input" />
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="الدولة" className="city-input" />
              <button onClick={fetchPrayerTimes} className="small-btn">🔍 بحث</button>
            </div>
          </div>

          {loading ? (
            <p className="loading-text">جاري تحميل أوقات الصلاة...</p>
          ) : prayerTimes ? (
            <div className="prayer-times-grid">
              <div className="prayer-card"><span>🇫🇯 الفجر</span><strong>{prayerTimes.Fajr?.substring(0, 5)}</strong></div>
              <div className="prayer-card"><span>☀️ الشروق</span><strong>{prayerTimes.Sunrise?.substring(0, 5)}</strong></div>
              <div className="prayer-card"><span>🌙 الظهر</span><strong>{prayerTimes.Dhuhr?.substring(0, 5)}</strong></div>
              <div className="prayer-card"><span>📖 العصر</span><strong>{prayerTimes.Asr?.substring(0, 5)}</strong></div>
              <div className="prayer-card"><span>🌅 المغرب</span><strong>{prayerTimes.Maghrib?.substring(0, 5)}</strong></div>
              <div className="prayer-card"><span>⭐ العشاء</span><strong>{prayerTimes.Isha?.substring(0, 5)}</strong></div>
            </div>
          ) : null}

          {nextPrayer && nextPrayerTime && (
            <div className="next-prayer">
              <p>🕋 الصلاة القادمة: <strong>{nextPrayer}</strong> الساعة <strong>{nextPrayerTime}</strong></p>
              {timeRemaining && <p>⏳ الوقت المتبقي: <strong>{timeRemaining}</strong></p>}
            </div>
          )}
        </div>

        {/* الساعة */}
        <div className="time" style={{ textShadow: `0 0 20px ${glowColor}, 0 0 30px ${glowColor}` }}>
          {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>

        <p className="weather">🌡️ {getWeather()}</p>

        <div className="controls">
          <button onClick={() => setDarkMode(!darkMode)} className="btn">
            {darkMode ? '☀️ وضع نهاري' : '🌙 وضع ليلي'}
          </button>
          <button onClick={changeGlowColor} className="btn">🎨 توهج</button>
          <button onClick={changeBackground} className="btn">🖼️ خلفية</button>
        </div>

        <div className="quote-section">
          <p className="quote">📖 {quote}</p>
          <button onClick={changeQuote} className="small-btn">🔄 تغيير</button>
        </div>
      </div>
    </div>
  )
}

export default App
EOF
