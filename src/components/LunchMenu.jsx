import React, { useState, useEffect } from 'react';
import './item.css';
import { Dice5 } from "lucide-react";
import diceGif from "@/assets/dice.gif";
import { getRandomMenu } from "@/api/api.js";

const LunchMenu = ({ isEditing, isBordered }) => {
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  const handleDiceClick = async () => {
    setIsRolling(true);
    setSelectedMenu(null);
  
    try {
      const result = await getRandomMenu();
      setTimeout(() => {
        setSelectedMenu(result); // 서버에서 받은 메뉴
        setIsRolling(false);
      }, 1800); // 주사위 도는 시간
    } catch (error) {
      console.error("점심 메뉴 가져오기 실패:", error);
      setSelectedMenu("불러오기 실패...");
      setIsRolling(false);
    }
  };

  return (
    <div
      className="item-style"
    >
      <div 
      style={{
        pointerEvents: isEditing ? "none" : "auto", // 편집 모드일 때 위젯 이동 금지(이거 스크롤도 안 됨)
      }}>
        {isBordered && 
          <div className="item-header">🍱 점심추천</div>
        }

        <div className="menu-container">
          <button className="dice-button" onClick={handleDiceClick} disabled={isRolling}>
            {isRolling ? <img src={diceGif} alt="Rolling" className="dice-gif w-[50px] h-[50px]" /> : <Dice5 size={32} />}
          </button>

          <div className="menu-display">
            {isRolling ? <p>랜덤 선택 중...</p> : selectedMenu ? <p>{selectedMenu}</p> : <p>점심 메뉴를 골라보세요!</p>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LunchMenu;