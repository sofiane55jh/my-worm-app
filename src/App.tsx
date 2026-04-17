import { useState, useEffect, useRef } from 'react'
import './App.css'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import axios from 'axios'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [name, setName] = useState("أم السعد سفيان")
  const [city, setCity] = useState("الجزائر")
  const [prayerTimes, setPrayerTimes] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [weather, setWeather] = useState<any>(null)
  const [voiceSearch, setVoiceSearch] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  
  // إحصائيات الصلوات
  const [prayerStats, setPrayerStats] = useState({
    الفجر: 0, الظهر: 0, العصر: 0, المغرب: 0, العشاء: 0
  })

  // بيانات الرسم البياني
  const chartData = {
    labels: ['الفجر', 'الظهر', 'العصر', 'المغرب', 'العشاء'],
    datasets: [{
      label: 'عدد الصلوات',
      data: Object.values(prayerStats),
      backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'],
      borderRadius: 10,
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const },
      tooltip: { backgroundColor: '#764ba2' }
    }
  }

  // جلب أوقات الصلاة
  const fetchPrayerTimes = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=الجزائر&method=8`
      )
      if (response.data.code === 200) {
        setPrayerTimes(response.data.data.timings)
      }
    } catch (error) {
      console.error("خطأ:", error)
    } finally {
      setLoading(false)
    }
  }

  // جلب حالة الطقس
  const fetchWeather = async () => {
    try {
      const response = await axios.get(
        `https://goweather.herokuapp.com/weather/${city}`
      )
      setWeather(response.data)
    } catch (error) {
      console.error("خطأ في جلب الطقس:", error)
    }
  }

  // التعرف على الصوت
  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.lang = 'ar-SA'
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setCity(transcript)
        setVoiceSearch(false)
      }
      recognition.start()
      setVoiceSearch(true)
    } else {
      alert("متصفحك لا يدعم التعرف على الصوت")
    }
  }

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, item: string) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (e: React.DragEvent, target: string) => {
    e.preventDefault()
    if (draggedItem) {
      const newStats = { ...prayerStats }
      const draggedValue = newStats[draggedItem as keyof typeof prayerStats]
      const targetValue = newStats[target as keyof typeof prayerStats]
      newStats[draggedItem as keyof typeof prayerStats] = targetValue
      newStats[target as keyof typeof prayerStats] = draggedValue
      setPrayerStats(newStats)
      setDraggedItem(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // تسجيل صلاة
  const recordPrayer = (prayer: string) => {
    setPrayerStats({...prayerStats, [prayer]: prayerStats[prayer as keyof typeof prayerStats] + 1})
  }

  useEffect(() => {
    fetchPrayerTimes()
    fetchWeather()
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

  const getWeatherEmoji = () => {
    if (!weather) return "🌡️"
    const temp = weather.temperature
    if (temp && parseInt(temp) > 25) return "☀️🔥"
    if (temp && parseInt(temp) > 15) return "🌤️"
    return "🌙❄️"
  }

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      {/* زر القائمة الجانبية */}
      <button className="menu-btn" onClick={() => setShowSidebar(!showSidebar)}>☰</button>

      {/* القائمة الجانبية */}
      <div className={`sidebar ${showSidebar ? 'open' : ''}`}>
        <h3>📋 القائمة</h3>
        <ul>
          <li onClick={() => window.open('https://quran.com/', '_blank')}>📖 المصحف</li>
          <li onClick={() => window.open('https://www.islamweb.net/', '_blank')}>📚 مكتبة إسلامية</li>
          <li onClick={() => setDarkMode(!darkMode)}>{darkMode ? '☀️ وضع نهاري' : '🌙 وضع ليلي'}</li>
          <li onClick={() => setShowSidebar(false)}>❌ إغلاق</li>
        </ul>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="container">
        <div className="header">
          <h1 className="greeting">{getGreeting()}</h1>
          <h2 className="name">{name}</h2>
          <div className="datetime">
            <span className="date">📅 {dayName} {day}/{month}/{year}</span>
            <span className="time">{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* الطقس */}
        {weather && (
          <div className="weather-card">
            <span className="weather-icon">{getWeatherEmoji()}</span>
            <div className="weather-info">
              <span>🌡️ {weather.temperature || '--'}°C</span>
              <span>💨 {weather.wind || '--'} km/h</span>
            </div>
          </div>
        )}

        {/* البحث بالصوت */}
        <div className="search-section">
          <div className="city-search">
            <input 
              type="text" 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              placeholder="البحث عن مدينة..."
              className="city-input"
            />
            <button onClick={startVoiceSearch} className="voice-btn">
              🎤 {voiceSearch ? 'جاري الاستماع...' : 'بحث صوتي'}
            </button>
          </div>
          <button onClick={fetchPrayerTimes} className="search-btn">🔍 بحث</button>
        </div>

        {/* أوقات الصلاة */}
        <div className="prayer-section">
          <h3>🕌 أوقات الصلاة في {city}</h3>
          {loading ? (
            <div className="loader"></div>
          ) : prayerTimes ? (
            <div className="prayer-grid">
              <div className="prayer-card" draggable onDragStart={(e) => handleDragStart(e, 'الفجر')}>
                <span>🇫🇯 الفجر</span>
                <strong>{prayerTimes.Fajr?.substring(0, 5)}</strong>
              </div>
              <div className="prayer-card" draggable onDragStart={(e) => handleDragStart(e, 'الظهر')}>
                <span>🌙 الظهر</span>
                <strong>{prayerTimes.Dhuhr?.substring(0, 5)}</strong>
              </div>
              <div className="prayer-card" draggable onDragStart={(e) => handleDragStart(e, 'العصر')}>
                <span>📖 العصر</span>
                <strong>{prayerTimes.Asr?.substring(0, 5)}</strong>
              </div>
              <div className="prayer-card" draggable onDragStart={(e) => handleDragStart(e, 'المغرب')}>
                <span>🌅 المغرب</span>
                <strong>{prayerTimes.Maghrib?.substring(0, 5)}</strong>
              </div>
              <div className="prayer-card" draggable onDragStart={(e) => handleDragStart(e, 'العشاء')}>
                <span>⭐ العشاء</span>
                <strong>{prayerTimes.Isha?.substring(0, 5)}</strong>
              </div>
            </div>
          ) : null}
          <p className="drag-hint">💡 يمكنك سحب وإفلات البطاقات لترتيبها</p>
        </div>

        {/* الرسم البياني */}
        <div className="chart-section">
          <h3>📊 إحصائيات الصلوات الشهرية</h3>
          <div className="chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* أزرار تسجيل الصلوات */}
        <div className="stats-buttons">
          {Object.entries(prayerStats).map(([prayer, count]) => (
            <div 
              key={prayer} 
              className="stat-btn"
              draggable
              onDragStart={(e) => handleDragStart(e, prayer)}
              onDrop={(e) => handleDrop(e, prayer)}
              onDragOver={handleDragOver}
            >
              <span>🕌 {prayer}</span>
              <strong>{count}</strong>
              <button onClick={() => recordPrayer(prayer)}>➕</button>
            </div>
          ))}
        </div>

        {/* الاقتباس اليومي */}
        <div className="quote-card">
          <p className="quote-text">"إن مع العسر يسراً"</p>
          <p className="quote-ref">سورة الشرح</p>
        </div>
      </div>
    </div>
  )
}

export default App
