import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [name, setName] = useState("سفيان")
  const [glowColor, setGlowColor] = useState("#667eea")
  const [darkMode, setDarkMode] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [showCountdown, setShowCountdown] = useState(false)
  const [quote, setQuote] = useState("💪 لا تؤجل عمل اليوم إلى الغد")
  
  // ========== أوقات الصلاة ==========
  const [prayerTimes, setPrayerTimes] = useState<any>(null)
  const [city, setCity] = useState("الدار البيضاء")
  const [country, setCountry] = useState("المغرب")
  const [loading, setLoading] = useState(true)
  const [nextPrayer, setNextPrayer] = useState("")
  const [nextPrayerTime, setNextPrayerTime] = useState("")

  const quotes = [
    "💪 لا تؤجل عمل اليوم إلى الغد",
    "✨ النجاح يبدأ بخطوة صغيرة",
    "📚 المعرفة كنز لا ينفد",
    "❤️ الحياة جميلة بأشخاصها",
    "🌟 احلم ثم حقق أحلامك"
  ]

  // جلب أوقات الصلاة من API
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

  // تحديث الوقت الحالي والصلاة القادمة كل ثانية
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // حساب الصلاة القادمة
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

  // جلب الصلاة عند تغيير المدينة
  useEffect(() => {
    fetchPrayerTimes()
  }, [city, country])

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

  const changeQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length)
    setQuote(quotes[randomIndex])
  }

  const startCountdown = () => {
    setCountdown(60)
    setShowCountdown(true)
  }

  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [showCountdown, countdown])

  const hours = currentTime.getHours()
  const minutes = currentTime.getMinutes()
  const seconds = currentTime.getSeconds()
  const day = currentTime.getDate()
  const month = currentTime.getMonth() + 1
  const year = currentTime.getFullYear()
  const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const dayName = weekDays[currentTime.getDay()]

  return (
    <div className={`container ${darkMode ? 'dark' : ''}`}>
      <h1>✨ {getGreeting()} ✨</h1>
      <h2 className="name">{name}</h2>
      
      <div className="controls">
        <button onClick={() => setDarkMode(!darkMode)} className="btn">
          {darkMode ? '☀️ وضع نهاري' : '🌙 وضع ليلي'}
        </button>
        <button onClick={changeGlowColor} className="btn">
          🎨 تغيير لون التوهج
        </button>
        <button onClick={changeBackground} className="btn">
          🖼️ تغيير الخلفية
        </button>
      </div>

      {/* ========== قسم أوقات الصلاة ========== */}
      <div className="prayer-section">
        <div className="prayer-header">
          <h3>🕌 أوقات الصلاة في {city}</h3>
          <div className="city-controls">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="المدينة"
              className="city-input"
            />
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="الدولة"
              className="city-input"
            />
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
          </div>
        )}
      </div>

      <div className="time" style={{ textShadow: `0 0 20px ${glowColor}, 0 0 30px ${glowColor}` }}>
        {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>
      
      <p className="date">📅 {dayName} - {day}/{month}/{year}</p>
      <p className="weather">🌡️ {getWeather()}</p>
      
      <div className="quote-section">
        <p className="quote">📖 {quote}</p>
        <button onClick={changeQuote} className="small-btn">
          🔄 تغيير الاقتباس
        </button>
      </div>

      <div className="countdown-section">
        {!showCountdown ? (
          <button onClick={startCountdown} className="btn">
            ⏱️ بدء عداد تنازلي (60 ثانية)
          </button>
        ) : (
          <div className="countdown">
            <p>⏰ الوقت المتبقي: <strong>{countdown}</strong> ثانية</p>
            {countdown === 0 && <p>🎉 انتهى الوقت! 🎉</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
