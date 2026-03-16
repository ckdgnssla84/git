import React, { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const ChatInterface = ({ sajuData }) => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: '안녕하세요. 무엇이 궁금하신가요? 사주에 대해 물어보세요.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('Sending message to backend...', input);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, saju_data: sajuData })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received response from backend:', data);
      
      const botMsg = { role: 'bot', text: data.response };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Frontend Fetch Error:', error);
      setMessages(prev => [...prev, { role: 'bot', text: `죄송합니다. 오류가 발생했습니다: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chat-interface">
      <div className="messages-area">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <span className="bubble">{msg.text}</span>
          </div>
        ))}
        {isLoading && <div className="message bot"><span className="bubble">생각 중...</span></div>}
      </div>
      <div className="input-area">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="궁금한 점을 물어보세요..."
        />
        <button onClick={sendMessage} disabled={isLoading}>전송</button>
      </div>
    </div>
  );
};

export default ChatInterface;
