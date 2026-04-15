import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [name, setName] = useState("السعد سفيان")
  const [darkMode, setDarkMode] = useState(false)
  const [city, setCity] = useState("الجزائر")
  const [prayerTimes, setPrayerTimes] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hijriDate, setHijriDate] = useState("")
  const [showStats, setShowStats] = useState(false)
  const [showQuote, setShowQuote] = useState(true)
  const [currentTheme, setCurrentTheme] = useState(0)
  const [bgAnimation, setBgAnimation] = useState(true)
  
  // إحصائيات الصلوات
  const [prayerStats, setPrayerStats] = useState({
    الفجر: 0, الظهر: 0, العصر: 0, المغرب: 0, العشاء: 0
  })

  // اقتباسات ملهمة
  const quotes = [
    "🌟 لا تؤجل عمل اليوم إلى الغد",
    "💪 مع الصبر يأتي النجاح",
    "📚 العلم نور والجهل ظلام",
    "❤️ الحياة جميلة بأشخاصها",
    "🕌 الصلاة نور المؤمن",
    "✨ تفاءلوا بالخير تجدوه",
    "💖 الدعاء مفتاح الرحمة",
    "🌙 استغفر الله فإنه غفور رحيم"
  ]
  const [currentQuote, setCurrentQuote] = useState(quotes[0])

  // ألوان الخلفية المتعددة
  const themes = [
    "linear-gradient(135deg, #667eea, #764ba2)",
    "linear-gradient(135deg, #f093fb, #f5576c)",
    "linear-gradient(135deg, #4facfe, #00f2fe)",
    "linear-gradient(135deg, #43e97b, #38f9d7)",
    "linear-gradient(135deg, #fa709a, #fee140)",
    "linear-gradient(135deg, #a8edea, #fed6e3)",
    "linear-gradient(135deg, #ff9a9e, #fecfef)",
    "linear-gradient(135deg, #ffecd2, #fcb69f)"
  ]

  // جلب التاريخ الهجري
  useEffect(() => {
    fetch('https://api.aladhan.com/v1/gToH?date=' + new Date().toISOString().split('T')[0])
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setHijriDate(`${data.data.hijri.day} ${data.data.hijri.month.ar} ${data.data.hijri.year}`)
        }
      })
      .catch(err => console.log("خطأ"))
  }, [])

  // تغيير الاقتباس كل 10 ثواني
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * quotes.length)
      setCurrentQuote(quotes[randomIndex])
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // تغيير الخلفية تلقائياً
  useEffect(() => {
    if (!bgAnimation) return
    const interval = setInterval(() => {
      setCurrentTheme((prev) => (prev + 1) % themes.length)
      document.body.style.background = themes[currentTheme]
    }, 15000)
    return () => clearInterval(interval)
  }, [bgAnimation, currentTheme])

  // جلب أوقات الصلاة
  const fetchPrayerTimes = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=الجزائر&method=8`
      )
      const data = await response.json()
      if (data.code === 200) {
        setPrayerTimes(data.data.timings)
      }
    } catch (error) {
      console.error("خطأ:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrayerTimes()
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [city])

  // تسجيل الصلاة
  const recordPrayer = (prayer: string) => {
    setPrayerStats({...prayerStats, [prayer]: prayerStats[prayer as keyof typeof prayerStats] + 1})
    // تأثير اهتزاز خفيف
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50)
    }
    alert(`✅ تم تسجيل صلاة ${prayer}`)
  }

  // تغيير الخلفية يدوياً
  const changeTheme = () => {
    const next = (currentTheme + 1) % themes.length
    setCurrentTheme(next)
    document.body.style.background = themes[next]
  }

  const hours = currentTime.getHours()
  const minutes = currentTime.getMinutes()
  const seconds = currentTime.getSeconds()
  const day = currentTime.getDate()
  const month = currentTime.getMonth() + 1
  const year = currentTime.getFullYear()
  const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const dayName = weekDays[currentTime.getDay()]

  const getGreeting = () => {
    if (hours < 12) return "🌅 صباح الخير"
    if (hours < 18) return "🌤️ مساء الخير"
    return "🌙 مساء النور"
  }

  const totalPrayers = Object.values(prayerStats).reduce((a, b) => a + b, 0)
  const completionRate = Math.min(100, (totalPrayers / 5) * 100)

  return (
    <div className={`container ${darkMode ? 'dark' : ''}`}>
      {/* أزرار التحكم */}
      <div className="floating-buttons">
        <button className="float-btn" onClick={() => setDarkMode(!darkMode)} title="وضع ليلي">
          {darkMode ? '☀️' : '🌙'}
        </button>
        <button className="float-btn" onClick={changeTheme} title="تغيير الخلفية">
          🎨
        </button>
        <button className="float-btn" onClick={() => setShowStats(!showStats)} title="إحصائيات">
          📊
        </button>
        <button className="float-btn" onClick={() => setBgAnimation(!bgAnimation)} title={bgAnimation ? "إيقاف الحركة" : "تشغيل الحركة"}>
          {bgAnimation ? '⏸️' : '▶️'}
        </button>
      </div>

      {/* البطاقة الرئيسية */}
      <div className="main-card">
        <div className="greeting-badge">{getGreeting()}</div>
        <h1 className="name-title">{name}</h1>
        
        {/* الساعة */}
        <div className="clock">
          <span className="clock-hours">{hours.toString().padStart(2, '0')}</span>
          <span className="clock-sep">:</span>
          <span className="clock-minutes">{minutes.toString().padStart(2, '0')}</span>
          <span className="clock-sep">:</span>
          <span className="clock-seconds">{seconds.toString().padStart(2, '0')}</span>
        </div>

        {/* التاريخ */}
        <div className="date-container">
          <span className="gregorian">📅 {dayName} {day}/{month}/{year}</span>
          <span className="hijri">🕌 {hijriDate}</span>
        </div>
      </div>

      {/* الاقتباس اليومي */}
      {showQuote && (
        <div className="quote-card">
          <p className="quote-text">💬 {currentQuote}</p>
          <div className="quote-animation"></div>
        </div>
      )}

      {/* إحصائيات الصلوات */}
      {showStats && (
        <div className="stats-card">
          <h3>📊 إنجازاتي اليومية</h3>
          <div className="progress-ring">
            <div className="progress-circle" style={{ transform: `rotate(${completionRate * 3.6}deg)` }}></div>
            <span className="progress-percent">{Math.round(completionRate)}%</span>
          </div>
          <div className="stats-buttons">
            {Object.entries(prayerStats).map(([prayer, count]) => (
              <button key={prayer} className="stat-btn" onClick={() => recordPrayer(prayer)}>
                🕌 {prayer} <span className="stat-count">{count}</span> +
              </button>
            ))}
          </div>
          <button className="reset-btn" onClick={() => setPrayerStats({الفجر:0, الظهر:0, العصر:0, المغرب:0, العشاء:0})}>
            🔄 إعادة تعيين
          </button>
        </div>
      )}

      {/* أوقات الصلاة */}
      <div className="prayer-card-large">
        <h3>🕌 أوقات الصلاة في {city}</h3>
        <div className="search-box">
          <input 
            type="text" 
            value={city} 
            onChange={(e) => setCity(e.target.value)} 
            placeholder="اكتب اسم المدينة"
          />
          <button onClick={fetchPrayerTimes}>🔍 بحث</button>
        </div>
        
        {loading ? (
          <div className="loader"></div>
        ) : prayerTimes ? (
          <div className="prayer-grid">
            <div className="prayer-item"><span>🇫🇯 الفجر</span><strong>{prayerTimes.Fajr?.substring(0, 5)}</strong><div className="prayer-glow"></div></div>
            <div className="prayer-item"><span>☀️ الشروق</span><strong>{prayerTimes.Sunrise?.substring(0, 5)}</strong><div className="prayer-glow"></div></div>
            <div className="prayer-item"><span>🌙 الظهر</span><strong>{prayerTimes.Dhuhr?.substring(0, 5)}</strong><div className="prayer-glow"></div></div>
            <div className="prayer-item"><span>📖 العصر</span><strong>{prayerTimes.Asr?.substring(0, 5)}</strong><div className="prayer-glow"></div></div>
            <div className="prayer-item"><span>🌅 المغرب</span><strong>{prayerTimes.Maghrib?.substring(0, 5)}</strong><div className="prayer-glow"></div></div>
            <div className="prayer-item"><span>⭐ العشاء</span><strong>{prayerTimes.Isha?.substring(0, 5)}</strong><div className="prayer-glow"></div></div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default App
