import { useState } from 'react'
import SajuChart from './components/SajuChart'
import ChatInterface from './components/ChatInterface'
import './App.css'

const API_BASE_URL = ''; // Relative path for Vercel

function App() {
  // ... rest of the code
  const handleCalculate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setSajuData(data);
    } catch (error) {
      console.error(error);
      alert('연결 실패. 백엔드 서버를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>AI Destiny Analysis</h1>
        <p>당신의 고유한 에너지를 데이터와 AI로 정밀 분석합니다.</p>
      </header>

      <div className="main-content">
        <section className="input-section card">
          <div className="form-group">
            <label>Year</label>
            <input type="number" name="year" value={formData.year} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Month</label>
            <input type="number" name="month" value={formData.month} onChange={handleChange} min="1" max="12" />
          </div>
          <div className="form-group">
            <label>Day</label>
            <input type="number" name="day" value={formData.day} onChange={handleChange} min="1" max="31" />
          </div>
          <div className="form-group">
            <label>Hour</label>
            <input type="number" name="hour" value={formData.hour} onChange={handleChange} min="0" max="23" />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
          </div>
          <button className="calc-btn" onClick={handleCalculate} disabled={loading}>
            {loading ? 'Analyzing...' : '분석 시작'}
          </button>
        </section>

        {sajuData && (
          <div className="result-section">
            <div className="chart-card card">
              <SajuChart data={sajuData} />
            </div>
            <div className="chat-card card">
              <ChatInterface sajuData={sajuData} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
