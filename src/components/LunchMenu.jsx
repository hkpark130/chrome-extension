import React, { useState, useEffect } from 'react';
import './item.css';
import { Dice5 } from "lucide-react";
import diceGif from "@/assets/dice.gif";

const lunchOptions = [
  { name: "김치찌개", weight: 3 },
  { name: "된장찌개", weight: 2 },
  { name: "삼겹살", weight: 5 },
  { name: "비빔밥", weight: 2 },
  { name: "돈까스", weight: 4 },
  { name: "바지락 칼국수", weight: 3 },
  { name: "짬뽕", weight: 3 },
];

const LunchMenu = ({ isEditing, isBordered }) => {
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  const handleDiceClick = () => {
    setIsRolling(true);
    setSelectedMenu(null);

    setTimeout(() => {
      setSelectedMenu(getRandomMenu());
      setIsRolling(false);
    }, 1800); // 2초 후 메뉴 표시
  };

  const getRandomMenu = () => {
    const weightedList = lunchOptions.flatMap(item => Array(item.weight).fill(item.name));
    const randomIndex = Math.floor(Math.random() * weightedList.length);
    return weightedList[randomIndex];
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
          <div className="item-header">점심추천</div>
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