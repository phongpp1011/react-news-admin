import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ setRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    console.log("Gửi lên server:", { email, password });

    try {
      const res = await axios.post(
        'http://localhost:8081/login',
        { email: email.trim(), password: password.trim() },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log("Phản hồi từ server:", res.data);

      if (res.data && res.data.success) {
        alert("Đăng nhập thành công!");

        // Lưu role riêng để App.js đọc
        localStorage.setItem('role', res.data.role);
        localStorage.setItem('user', JSON.stringify(res.data));
        setRole(res.data.role);

        if (res.data.role === 'admin') navigate('/admin');
        else navigate('/');
      } else {
        setMessage(res.data?.message || "Sai tài khoản hoặc mật khẩu.");
      }
    } catch (err) {
      console.error("Lỗi khi gọi API hoặc parse JSON:", err);
      setMessage("Không thể kết nối tới server hoặc response không hợp lệ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <div style={{ width: '350px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              required
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Mật khẩu:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              required
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>

             {/* 🔹 Nút Thoát */}
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              marginTop: '10px',
              cursor: 'pointer'
            }}
          >
            Thoát
          </button>

        </form>
        {message && <p style={{ color: 'red', marginTop: '15px', textAlign: 'center' }}>{message}</p>}
      </div>
    </div>
  );
}

export default Login;
