import React from "react";
import direaLogo from "./assets/logo-direa.png";
import userIcon from "./assets/user-icon.png"; 
import { useNavigate } from "react-router-dom";

const TitleBar = () => {
  const navigate = useNavigate();
  return (
    <div className="title-container" style={{ borderBottom: "1px solid lightgray" }}>
      <div className="title-space" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img 
          src={userIcon}
          style={{ width: '65px', height: 'auto' }}
        />
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          gap: '5px'
        }}>
          <span>유저 이름</span>
          <button 
            style={{
              padding: '5px 10px',
              background: 'red',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="title">
        <img 
          src={direaLogo} 
          className="logo"
          style={{ width: '150px', cursor: 'pointer', height: 'auto' }}
          onClick={() => { navigate("/"); }}
        />
      </div>

      <div className="title-space"></div>
    </div>
  );
};

export default TitleBar;