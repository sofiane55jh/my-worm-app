import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [name, setName] = useState("السعد سفيان")
  const [glowColor, setGlowColor] = useState("#667eea")
  const [darkMode, setDarkMode] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [showCountdown, setShowCountdown] = useState(false)
  const [quote, setQuote] = useState("💪 لا تؤجل عمل اليوم إلى الغد")
  const [showSidebar, setShowSidebar] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [lastNotified, setLastNotified] = useState("")
  
  // ========== تثبيت التطبيق (PWA) ==========
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  
  // ========== الذكاء الاصطناعي ==========
  const [showAI, setShowAI] = useState(false)
  const [aiQuestion, setAiQuestion] = useState("")
  const [aiAnswer, setAiAnswer] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  
  // ========== إحصائيات الصلوات ==========
  const [prayerStats, setPrayerStats] = useState({
    الفجر: 0, الشروق: 0, الظهر: 0, العصر: 0, المغرب: 0, العشاء: 0
  })
  
  // ========== أوقات الصلاة ==========
  const [prayerTimes, setPrayerTimes] = useState<any>(null)
  const [city, setCity] = useState("الجزائر")
  const [country, setCountry] = useState("الجزائر")
  const [loading, setLoading] = useState(true)
  const [nextPrayer, setNextPrayer] = useState("")
  const [nextPrayerTime, setNextPrayerTime] = useState("")
  const [timeRemaining, setTimeRemaining] = useState("")

  const quotes = [
    "💪 لا تؤجل عمل اليوم إلى الغد",
    "✨ النجاح يبدأ بخطوة صغيرة",
    "📚 المعرفة كنز لا ينفد",
    "❤️ الحياة جميلة بأشخاصها",
    "🌟 احلم ثم حقق أحلامك"
  ]

  // طلب إذن الإشعارات
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setNotificationsEnabled(true)
        alert("✅ تم تفعيل الإشعارات! سيتم تنبيهك عند وقت الصلاة")
      } else {
        alert("⚠️ لم يتم تفعيل الإشعارات")
      }
    } else {
      alert("⚠️ المتصفح لا يدعم الإشعارات")
    }
  }

  // إرسال إشعار
  const sendNotification = (title: string, body: string) => {
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: 'https://cdn-icons-png.flaticon.com/512/2858/2858518.png' })
    }
  }

  // تثبيت التطبيق
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    })
  }, [])

  const installApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null)
        setShowInstallButton(false)
      })
    }
  }

  // المساعد الذكي
  const askAI = async () => {
    if (!aiQuestion.trim()) return
    
    setAiLoading(true)
    setAiAnswer("")
    
    const answers = [
      "🌙 بناءً على سؤالك، أنصحك بالصبر والدعاء. قال تعالى: 'إن الله مع الصابرين'",
      "📖 هذا سؤال مهم. تذكر أن ذكر الله يطمئن القلوب.",
      "🕌 الوقت المناسب لفعل ذلك هو بعد صلاة الفجر، فهي ساعة استجابة.",
      "💚 أنصحك بقراءة سورة الكهف يوم الجمعة، فيها نور بين الجمعتين.",
      "🤲 تذكر قول النبي ﷺ: 'لا ضرر ولا ضرار' في جميع أمورك.",
      "✨ الدعاء هو مفتاح كل خير، قال تعالى: 'ادعوني أستجب لكم'.",
      "💝 الصدقة تطفيء الخطيئة كما يطفيء الماء النار، فأكثر منها.",
      "🌟 الاستغفار يجلب الرزق والبركة، قال تعالى: 'استغفروا ربكم إنه كان غفاراً'."
    ]
    
    setTimeout(() => {
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)]
      setAiAnswer(randomAnswer)
      setAiLoading(false)
    }, 1000)
  }

  // تسجيل صلاة
  const recordPrayer = (prayerName: string) => {
    setPrayerStats({...prayerStats, [prayerName]: prayerStats[prayerName as keyof typeof prayerStats] + 1})
    alert(`✅ تم تسجيل صلاة ${prayerName}`)
    
    const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3')
    audio.play().catch(e => console.log("صوت غير متاح"))
  }

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

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
    
    if (hours === 0 && minutes === 5 && seconds === 0 && lastNotified !== nextPrayer) {
      sendNotification(`🕌 موعد صلاة ${nextPrayer}`, `سيبدأ وقت صلاة ${nextPrayer} بعد 5 دقائق`)
      setLastNotified(nextPrayer)
      
      const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3')
      audio.play().catch(e => console.log("صوت غير متاح"))
    }
    
    if (hours === 0 && minutes === 0 && seconds === 0 && lastNotified !== `now-${nextPrayer}`) {
      sendNotification(`🕌 حان وقت صلاة ${nextPrayer}`, `أقم الصلاة يرحمك الله`)
      setLastNotified(`now-${nextPrayer}`)
    }
  }, [nextPrayerTime, currentTime, lastNotified, nextPrayer])

  useEffect(() => {
    fetchPrayerTimes()
    fetchCityFromIP()
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
    } else if (countdown === 0) {
      sendNotification("⏰ انتهى الوقت!", "العداد التنازلي قد انتهى")
      alert("⏰ انتهى الوقت! 🎉")
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

  const totalPrayers = Object.values(prayerStats).reduce((a, b) => a + b, 0)
  const completionRate = Math.min(100, (totalPrayers / 6) * 100)

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setShowSidebar(!showSidebar)}>
        ☰
      </button>

      <div className={`sidebar ${showSidebar ? 'open' : ''}`}>
        <h3>📋 القائمة</h3>
        <ul>
          <li onClick={() => window.open('https://quran.com/', '_blank')}>📖 المصحف</li>
          <li onClick={() => window.open('https://www.islamweb.net/', '_blank')}>📚 مكتبة إسلامية</li>
          <li onClick={requestNotificationPermission}>🔔 تفعيل الإشعارات</li>
          {showInstallButton && <li onClick={installApp}>📱 تثبيت التطبيق</li>}
          <li onClick={() => setShowSidebar(false)}>❌ إغلاق</li>
        </ul>
        {notificationsEnabled && <p className="notif-status">✅ الإشعارات مفعلة</p>}
      </div>

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
          <button onClick={() => setShowAI(!showAI)} className="btn">
            {showAI ? '🤖 إغلاق المساعد' : '🤖 مساعد ذكي'}
          </button>
        </div>

        <div className="stats-chart">
          <h3>📊 إحصائيات الصلوات اليومية</h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completionRate}%` }}></div>
          </div>
          <p className="stats-text">نسبة الإنجاز: {Math.round(completionRate)}%</p>
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
              {timeRemaining && <p>⏳ الوقت المتبقي: <strong>{timeRemaining}</strong></p>}
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

      {showAI && (
        <div className="ai-assistant">
          <div className="ai-header">
            <h3>🤖 المساعد الذكي</h3>
            <button onClick={() => setShowAI(false)} className="close-ai">✖</button>
          </div>
          <div className="ai-body">
            <p className="ai-welcome">السلام عليكم! أنا مساعدك الذكي. اسألني أي شيء عن الإسلام، الصلاة، أو العبادات.</p>
            
            {aiAnswer && (
              <div className="ai-answer">
                <strong>🤖 المساعد:</strong>
                <p>{aiAnswer}</p>
              </div>
            )}
            
            {aiLoading && <p className="ai-loading">🤔 جاري التفكير...</p>}
            
            <div className="ai-input-area">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="اكتب سؤالك هنا..."
                className="ai-input"
                onKeyPress={(e) => e.key === 'Enter' && askAI()}
              />
              <button onClick={askAI} className="ai-send-btn">💬 أرسل</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App
