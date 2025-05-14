import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import "./LoginPage.css";
import UserServce from '../service/UserService';

function AccountVerificationPage() {
  const { userId } = useParams();
  const [verificationCode, setVerificationCode] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  // const userId = searchParams.get('userId');

  // Automatyczne wypełnienie pola, jeśli token istnieje w URL
  useEffect(() => {
    if (token) {
      setVerificationCode(token);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await UserServce.verifyAccount(userId, verificationCode);

      console.log(`Weryfikacja użytkownika ${userId} z kodem: ${verificationCode}`);
      navigate('/login');
    } catch (error) {
      console.error('Błąd weryfikacji:', error);
    }
  };

  return (
    <div className="login-page-container">
      <div className="verification-container">
        <h2>Account verification</h2>
        <p>Please enter the verification code sent to your email.</p>
        {token && <p className="auto-fill-notice">Verification code has been auto-filled from the link</p>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Verification code:</label>
            <input 
              type="text" 
              name="verificationCode" 
              value={verificationCode} 
              onChange={(e) => setVerificationCode(e.target.value)} 
              className="form-input"
              required 
            />
          </div>
          
          <button type="submit" className="submit-button">Verify your account</button>
        </form>
      </div>
    </div>
  );
}

export default AccountVerificationPage;