import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [name, setName] = useState("أم السعد سفيان")
  const [wifeName, setWifeName] = useState("مونيا")
  const [sonName, setSonName] = useState("ياسين")
  const [glowColor, setGlowColor] = useState("#667eea")
  const [darkMode, setDarkMode] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [showCountdown, setShowCountdown] = useState(false)
  const [quote, setQuote] = useState("💪 لا تؤجل عمل اليوم إلى الغد")
  const [showSidebar, setShowSidebar] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [lastNotified, setLastNotified] = useState("")
  const [showSplash, setShowSplash] = useState(true)
  const [currentTheme, setCurrentTheme] = useState(0)
  const [adhanPlayed, setAdhanPlayed] = useState(false)
  const [showTafsir, setShowTafsir] = useState(false)
  const [tafsirText, setTafsirText] = useState("")
  const [sleepTime, setSleepTime] = useState("22:00")
  const [wakeTime, setWakeTime] = useState("04:30")
  
  const [achievements, setAchievements] = useState({
    perfectDay: false,
    weekStreak: 0,
    totalPrayers: 0
  })
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  
  const [showAI, setShowAI] = useState(false)
  const [aiQuestion, setAiQuestion] = useState("")
  const [aiAnswer, setAiAnswer] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  
  const [prayerStats, setPrayerStats] = useState({
    الفجر: 0, الشروق: 0, الظهر: 0, العصر: 0, المغرب: 0, العشاء: 0
  })
  
  const [prayerTimes, setPrayerTimes] = useState<any>(null)
  const [city, setCity] = useState("الجزائر")
  const [country, setCountry] = useState("الجزائر")
  const [loading, setLoading] = useState(true)
  const [nextPrayer, setNextPrayer] = useState("")
  const [nextPrayerTime, setNextPrayerTime] = useState("")
  const [timeRemaining, setTimeRemaining] = useState("")
  const [hijriDate, setHijriDate] = useState("")

  const tafsirData: { [key: string]: string } = {
    "الفاتحة": "فاتحة الكتاب هي أعظم سورة في القرآن، وهي سبع آيات مثاني، وهي ركن في كل صلاة، وتسمى أم القرآن والسبع المثاني.",
    "الإخلاص": "سورة الإخلاص تعدل ثلث القرآن، وهي توحد الله وتنفي عنه النقص، قال النبي ﷺ: 'قل هو الله أحد تعدل ثلث القرآن'.",
    "الرحمن": "سورة الرحمن تعرض نعم الله الظاهرة والباطنة، وتكرر سؤال 'فبأي آلاء ربكما تكذبان' 31 مرة، وتسمى عروس القرآن.",
    "يس": "سورة يس قلب القرآن، من قرأها في ليلة أصبح مغفوراً له، وهي تشمل قصصاً وعبراً.",
    "الملك": "سورة الملك هي المانعة من عذاب القبر، من قرأها كل ليلة حفظه الله من عذاب القبر.",
    "النبأ": "سورة النبأ تتحدث عن يوم القيامة والبعث والنشور، وهي من قصار المفصل."
  }

  const themes = [
    { name: "بنفسجي", colors: ["#667eea", "#764ba2"] },
    { name: "وردي", colors: ["#f093fb", "#f5576c"] },
    { name: "أزرق", colors: ["#4facfe", "#00f2fe"] },
    { name: "أخضر", colors: ["#43e97b", "#38f9d7"] },
    { name: "ذهبي", colors: ["#fa709a", "#fee140"] },
    { name: "أحمر", colors: ["#ff6b6b", "#ee5a24"] },
    { name: "نيلي", colors: ["#2c3e66", "#1a252f"] },
    { name: "فيروزي", colors: ["#00b894", "#00cec9"] },
    { name: "برتقالي", colors: ["#f39c12", "#e67e22"] },
    { name: "كحلي", colors: ["#2c3e50", "#34495e"] }
  ]

  const quotes = [
    "💪 لا تؤجل عمل اليوم إلى الغد",
    "✨ النجاح يبدأ بخطوة صغيرة",
    "📚 المعرفة كنز لا ينفد",
    "❤️ الحياة جميلة بأشخاصها",
    "🌟 احلم ثم حقق أحلامك"
  ]

  // تشغيل الأذان
  const playAdhan = () => {
    const audio = new Audio('https://www.islamcan.com/audio/adhan/adhan.mp3')
    audio.play().catch(e => console.log("تعذر تشغيل الأذان"))
  }

  // النطق الصوتي
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ar'
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  // تحديد الموقع
  const getLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ar`)
          const data = await response.json()
          if (data.city) {
            setCity(data.city)
            setCountry(data.countryName)
            alert(`✅ تم تحديد موقعك: ${data.city}, ${data.countryName}`)
          }
        } catch (error) {
          console.error("خطأ في جلب المدينة:", error)
        }
      })
    } else {
      alert("⚠️ متصفحك لا يدعم تحديد الموقع")
    }
  }

  // منبه النوم
  const checkBedtime = () => {
    const now = `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`
    if (now === sleepTime) {
      sendNotification("🌙 وقت النوم", "تصبح على خير، قم لصلاة الفجر")
    }
    if (now === wakeTime) {
      sendNotification("🌅 وقت الاستيقاظ", "قيام الليل وتهجد")
      playAdhan()
    }
  }

  // تصدير إلى PDF
  const exportToPDF = () => {
    const total = Object.values(prayerStats).reduce((a, b) => a + b, 0)
    const rate = Math.min(100, (total / 6) * 100)
    const report = `
      تقرير العبادات
      ===============
      التاريخ: ${new Date().toLocaleDateString('ar')}
      الاسم: ${name}
      المدينة: ${city}
      إجمالي الصلوات: ${total}
      نسبة الإنجاز: ${Math.round(rate)}%
      
      تفاصيل الصلوات:
      الفجر: ${prayerStats.الفجر}
      الظهر: ${prayerStats.الظهر}
      العصر: ${prayerStats.العصر}
      المغرب: ${prayerStats.المغرب}
      العشاء: ${prayerStats.العشاء}
    `
    alert(report)
    sendNotification("📄 تقرير العبادات", "تم إنشاء التقرير")
  }

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    const savedTheme = localStorage.getItem('theme')
    const savedStats = localStorage.getItem('prayerStats')
    
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode))
    if (savedTheme) setCurrentTheme(JSON.parse(savedTheme))
    if (savedStats) setPrayerStats(JSON.parse(savedStats))
    
    setTimeout(() => setShowSplash(false), 2000)
  }, [])

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    localStorage.setItem('theme', JSON.stringify(currentTheme))
    localStorage.setItem('prayerStats', JSON.stringify(prayerStats))
  }, [darkMode, currentTheme, prayerStats])

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

  useEffect(() => {
    const total = Object.values(prayerStats).reduce((a, b) => a + b, 0)
    setAchievements(prev => ({ ...prev, totalPrayers: total }))
    
    const allPrayersDone = Object.values(prayerStats).every(count => count >= 1)
    if (allPrayersDone && !achievements.perfectDay) {
      setAchievements(prev => ({ ...prev, perfectDay: true }))
      alert("🏆 إنجاز جديد! أكملت جميع الصلوات!")
      speakText("ماشاء الله، أكملت جميع الصلوات")
    }
  }, [prayerStats])

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

  const shareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'تطبيق أوقات الصلاة',
        text: 'تطبيق إسلامي شامل لأوقات الصلاة والأذكار',
        url: window.location.href
      })
    } else {
      alert('يمكنك مشاركة الرابط: ' + window.location.href)
    }
  }

  const askAI = async () => {
    if (!aiQuestion.trim()) return
    setAiLoading(true)
    setAiAnswer("")
    
    const answers = [
      "🌙 أنصحك بالصبر والدعاء. قال تعالى: 'إن الله مع الصابرين'",
      "📖 ذكر الله يطمئن القلوب",
      "🕌 الوقت المناسب بعد صلاة الفجر",
      "💚 اقرأ سورة الكهف يوم الجمعة",
      "🤲 'لا ضرر ولا ضرار'",
      "✨ الدعاء هو مفتاح كل خير",
      "💝 الصدقة تطفيء الخطيئة",
      "🌟 الاستغفار يجلب الرزق والبركة"
    ]
    
    setTimeout(() => {
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)]
      setAiAnswer(randomAnswer)
      setAiLoading(false)
    }, 1000)
  }

  const recordPrayer = (prayerName: string) => {
    setPrayerStats({...prayerStats, [prayerName]: prayerStats[prayerName as keyof typeof prayerStats] + 1})
    alert(`✅ تم تسجيل صلاة ${prayerName}`)
    speakText(`تم تسجيل صلاة ${prayerName}`)
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
      checkBedtime()
    }, 1000)
    return () => clearInterval(timer)
  }, [sleepTime, wakeTime])

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
      sendNotification(`🕌 موعد صلاة ${nextPrayer}`, `بعد 5 دقائق`)
      setLastNotified(nextPrayer)
    }
    
    if (hours === 0 && minutes === 0 && seconds === 0 && !adhanPlayed) {
      sendNotification(`🕌 حان وقت صلاة ${nextPrayer}`, `أقم الصلاة يرحمك الله`)
      playAdhan()
      setAdhanPlayed(true)
    }
    
    if (nextPrayer !== lastNotified) {
      setAdhanPlayed(false)
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

  const changeTheme = () => {
    const nextTheme = (currentTheme + 1) % themes.length
    setCurrentTheme(nextTheme)
    document.body.style.background = `linear-gradient(135deg, ${themes[nextTheme].colors[0]}, ${themes[nextTheme].colors[1]})`
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

  if (showSplash) {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <div className="splash-logo">🕌</div>
          <h1>تطبيق أوقات الصلاة</h1>
          <p>بسم الله الرحمن الرحيم</p>
          <div className="splash-spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setShowSidebar(!showSidebar)}>☰</button>

      <div className={`sidebar ${showSidebar ? 'open' : ''}`}>
        <h3>📋 القائمة</h3>
        <ul>
          <li onClick={() => window.open('https://quran.com/', '_blank')}>📖 المصحف</li>
          <li onClick={() => window.open('https://www.islamweb.net/', '_blank')}>📚 مكتبة إسلامية</li>
          <li onClick={requestNotificationPermission}>🔔 تفعيل الإشعارات</li>
          <li onClick={changeTheme}>🎨 ثيم {themes[(currentTheme + 1) % themes.length].name}</li>
          <li onClick={shareApp}>📤 مشاركة التطبيق</li>
          <li onClick={getLocation}>📍 تحديد موقعي</li>
          <li onClick={exportToPDF}>📄 تصدير التقرير</li>
          {showInstallButton && <li onClick={installApp}>📱 تثبيت التطبيق</li>}
          <li onClick={() => setShowSidebar(false)}>❌ إغلاق</li>
        </ul>
        {notificationsEnabled && <p className="notif-status">✅ الإشعارات مفعلة</p>}
        {achievements.perfectDay && <p className="achievement-badge">🏆 يوم كامل</p>}
      </div>

      <div className={`container ${darkMode ? 'dark' : ''}`}>
        <h1>✨ {getGreeting()} ✨</h1>
        <h2 className="name">{name}</h2>
        
        <div className="family-section">
          <h3>👨‍👩‍👧‍👦 أفراد العائلة</h3>
          <div className="family-grid">
            <div className="family-card"><span>👩 الزوجة</span><strong>{wifeName}</strong></div>
            <div className="family-card"><span>👦 الابن</span><strong>{sonName}</strong></div>
          </div>
        </div>
        
        <div className="date-badge">
          <span>📅 {dayName} {day}/{month}/{year}</span>
          <span>🕌 {hijriDate}</span>
        </div>
        
        <div className="controls">
          <button onClick={() => setDarkMode(!darkMode)} className="btn">
            {darkMode ? '☀️ وضع نهاري' : '🌙 وضع ليلي'}
          </button>
          <button onClick={changeGlowColor} className="btn">🎨 توهج</button>
          <button onClick={changeBackground} className="btn">🖼️ خلفية</button>
          <button onClick={() => setShowAI(!showAI)} className="btn">
            {showAI ? '🤖 إغلاق' : '🤖 مساعد'}
          </button>
        </div>

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
              <div className="prayer-card" onClick={() => { setShowTafsir(true); setTafsirText(tafsirData["الفاتحة"] || "لا يوجد تفسير") }}><span>🇫🇯 الفجر</span><strong>{prayerTimes.Fajr?.substring(0, 5)}</strong></div>
              <div className="prayer-card"><span>☀️ الشروق</span><strong>{prayerTimes.Sunrise?.substring(0, 5)}</strong></div>
              <div className="prayer-card" onClick={() => { setShowTafsir(true); setTafsirText(tafsirData["الفاتحة"] || "لا يوجد تفسير") }}><span>🌙 الظهر</span><strong>{prayerTimes.Dhuhr?.substring(0, 5)}</strong></div>
              <div className="prayer-card" onClick={() => { setShowTafsir(true); setTafsirText(tafsirData["الفاتحة"] || "لا يوجد تفسير") }}><span>📖 العصر</span><strong>{prayerTimes.Asr?.substring(0, 5)}</strong></div>
              <div className="prayer-card" onClick={() => { setShowTafsir(true); setTafsirText(tafsirData["الفاتحة"] || "لا يوجد تفسير") }}><span>🌅 المغرب</span><strong>{prayerTimes.Maghrib?.substring(0, 5)}</strong></div>
              <div className="prayer-card" onClick={() => { setShowTafsir(true); setTafsirText(tafsirData["الفاتحة"] || "لا يوجد تفسير") }}><span>⭐ العشاء</span><strong>{prayerTimes.Isha?.substring(0, 5)}</strong></div>
            </div>
          ) : null}

          {showTafsir && (
            <div className="tafsir-popup">
              <div className="tafsir-content">
                <h4>📖 تفسير السورة</h4>
                <p>{tafsirText}</p>
                <button onClick={() => setShowTafsir(false)} className="close-tafsir">✖ إغلاق</button>
              </div>
            </div>
          )}

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
        
        <p className="weather">🌡️ {getWeather()}</p>
        
        <div className="quote-section">
          <p className="quote">📖 {quote}</p>
          <button onClick={changeQuote} className="small-btn">🔄 تغيير</button>
        </div>

        <div className="countdown-section">
          {!showCountdown ? (
            <button onClick={startCountdown} className="btn">⏱️ عداد تنازلي (60 ث)</button>
          ) : (
            <div className="countdown">
              <p>⏰ الوقت المتبقي: <strong>{countdown}</strong> ث</p>
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
            <p className="ai-welcome">السلام عليكم! اسألني أي شيء.</p>
            {aiAnswer && (
              <div className="ai-answer">
                <strong>🤖 المساعد:</strong>
                <p>{aiAnswer}</p>
              </div>
            )}
            {aiLoading && <p className="ai-loading">🤔 جاري التفكير...</p>}
            <div className="ai-input-area">
              <input type="text" value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)} placeholder="اكتب سؤالك..." className="ai-input" onKeyPress={(e) => e.key === 'Enter' && askAI()} />
              <button onClick={askAI} className="ai-send-btn">💬 أرسل</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App
