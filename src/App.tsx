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
  const [prayerStats, setPrayerStats] = useState({
    الفجر: 0, الظهر: 0, العصر: 0, المغرب: 0, العشاء: 0
  })
  const [showDashboard, setShowDashboard] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [showChatGPT, setShowChatGPT] = useState(false)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [khatmaProgress, setKhatmaProgress] = useState(0)
  const [userQuestion, setUserQuestion] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [donationAmount, setDonationAmount] = useState(0)
  const [heatmapData, setHeatmapData] = useState<number[]>(Array(9).fill(0))

  const totalPrayers = Object.values(prayerStats).reduce((a, b) => a + b, 0)
  const completionRate = Math.min(100, (totalPrayers / 5) * 100)

  // خريطة حرارية
  useEffect(() => {
    const hour = new Date().getHours()
    const index = Math.floor(hour / 3)
    if (index < 9) {
      setHeatmapData(prev => {
        const newData = [...prev]
        newData[index] = newData[index] + 1
        return newData
      })
    }
  }, [currentTime])

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

  const askChatGPT = () => {
    if (!userQuestion.trim()) return
    setAiResponse("رد على سؤالك: " + userQuestion)
    setUserQuestion("")
  }

  const startVoiceCommands = () => {
    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.lang = 'ar-SA'
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript
      if (command.includes("الفجر")) recordPrayer("الفجر")
      if (command.includes("الظهر")) recordPrayer("الظهر")
      if (command.includes("العصر")) recordPrayer("العصر")
      if (command.includes("المغرب")) recordPrayer("المغرب")
      if (command.includes("العشاء")) recordPrayer("العشاء")
      alert(`🎤 تم التعرف على: ${command}`)
    }
    recognition.start()
  }

  const donate = () => {
    if (donationAmount > 0) {
      alert(`💰 شكراً لتبرعك بـ ${donationAmount} دينار`)
      setDonationAmount(0)
    }
  }

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

  const heatmapLabels = ['الفجر', 'الضحى', 'الظهر', 'العصر', 'المغرب', 'العشاء', 'الليل', 'التهجد', 'السحر']

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      {/* زر القائمة الجانبية */}
      <button className="menu-btn" onClick={() => setShowSidebar(!showSidebar)}>☰</button>

      {/* القائمة الجانبية */}
      <div className={`sidebar ${showSidebar ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>📋 القائمة</h3>
          <button className="sidebar-close" onClick={() => setShowSidebar(false)}>✖</button>
        </div>
        <ul>
          <li onClick={() => window.open('https://quran.com/', '_blank')}>📖 المصحف</li>
          <li onClick={() => window.open('https://www.islamweb.net/', '_blank')}>📚 مكتبة إسلامية</li>
          <li onClick={() => setDarkMode(!darkMode)}>{darkMode ? '☀️ وضع نهاري' : '🌙 وضع ليلي'}</li>
          <li onClick={() => setPrayerStats({ الفجر: 0, الظهر: 0, العصر: 0, المغرب: 0, العشاء: 0 })}>🔄 إعادة تعيين</li>
          <li onClick={() => setShowDashboard(!showDashboard)}>📊 {showDashboard ? 'إخفاء' : 'إظهار'} لوحة التحكم</li>
          <li onClick={() => setShowReport(!showReport)}>📄 {showReport ? 'إخفاء' : 'إظهار'} التقرير</li>
          <li onClick={() => setShowChatGPT(!showChatGPT)}>🤖 {showChatGPT ? 'إغلاق' : 'فتح'} المساعد</li>
          <li onClick={() => setShowHeatmap(!showHeatmap)}>🌡️ {showHeatmap ? 'إخفاء' : 'إظهار'} الخريطة الحرارية</li>
          <li onClick={startVoiceCommands} className={isListening ? 'voice-active' : ''}>🎤 {isListening ? 'جاري الاستماع...' : 'أوامر صوتية'}</li>
          <li onClick={() => setKhatmaProgress(Math.min(100, khatmaProgress + 10))}>📖 ختمة القرآن ({khatmaProgress}%)</li>
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

        {/* خريطة حرارية */}
        {showHeatmap && (
          <div className="heatmap">
            <h3>🌡️ خريطة أوقات الصلاة</h3>
            <div className="heatmap-grid">
              {heatmapLabels.map((label, i) => (
                <div key={i} className="heatmap-cell" style={{ 
                  backgroundColor: `rgba(102,126,234, ${Math.min(1, heatmapData[i] / 10)})`,
                  height: `${40 + heatmapData[i]}px`
                }}>
                  <span>{label}</span>
                  <strong>{heatmapData[i]}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* نافذة ChatGPT */}
        {showChatGPT && (
          <div className="modal-overlay" onClick={() => setShowChatGPT(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🤖 المساعد الذكي</h3>
                <button className="modal-close" onClick={() => setShowChatGPT(false)}>✖</button>
              </div>
              <textarea value={userQuestion} onChange={(e) => setUserQuestion(e.target.value)} placeholder="اسأل أي سؤال..." rows={3} />
              <button onClick={askChatGPT}>💬 أرسل</button>
              {aiResponse && <p className="ai-response">{aiResponse}</p>}
            </div>
          </div>
        )}

        {/* نافذة لوحة التحكم */}
        {showDashboard && (
          <div className="modal-overlay" onClick={() => setShowDashboard(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>📊 لوحة التحكم</h3>
                <button className="modal-close" onClick={() => setShowDashboard(false)}>✖</button>
              </div>
              <div className="dashboard-stats">
                <div className="dash-card"><span>📈 إجمالي الصلوات</span><strong>{totalPrayers}</strong></div>
                <div className="dash-card"><span>🎯 نسبة الإنجاز</span><strong>{Math.round(completionRate)}%</strong></div>
                <div className="dash-card"><span>⭐ مستوى الالتزام</span><strong>{completionRate > 80 ? 'ممتاز' : completionRate > 50 ? 'جيد' : 'يحتاج تحسين'}</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* نافذة التقرير */}
        {showReport && (
          <div className="modal-overlay" onClick={() => setShowReport(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>📄 تقرير العبادات</h3>
                <button className="modal-close" onClick={() => setShowReport(false)}>✖</button>
              </div>
              <p>📅 {new Date().toLocaleDateString('ar')}</p>
              <p>🕌 الفجر: {prayerStats.الفجر}</p>
              <p>🌙 الظهر: {prayerStats.الظهر}</p>
              <p>📖 العصر: {prayerStats.العصر}</p>
              <p>🌅 المغرب: {prayerStats.المغرب}</p>
              <p>⭐ العشاء: {prayerStats.العشاء}</p>
              <p>📊 الإجمالي: {totalPrayers}</p>
            </div>
          </div>
        )}

        {/* ختمة القرآن */}
        <div className="khatma-section">
          <h3>📖 ختمة القرآن</h3>
          <div className="khatma-progress"><div className="khatma-fill" style={{ width: `${khatmaProgress}%` }}></div></div>
          <p>{khatmaProgress}% مكتمل</p>
          <button onClick={() => setKhatmaProgress(Math.min(100, khatmaProgress + 10))}>➕ تقدم</button>
        </div>

        {/* تبرعات */}
        <div className="donation-section">
          <h3>💰 التبرعات</h3>
          <input type="number" value={donationAmount} onChange={(e) => setDonationAmount(Number(e.target.value))} placeholder="المبلغ" />
          <button onClick={donate}>تبرع الآن</button>
        </div>

        <div className="quote-card">
          <p className="quote-text">"إن مع العسر يسراً"</p>
          <p className="quote-ref">سورة الشرح</p>
        </div>
      </div>
    </div>
  )
}

export default App
