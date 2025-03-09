import React from "react";
import './item.css';

const Widget = ({ isEditing }) => {
  return (
    <div
      className='item-style'
    >
      <div 
      style={{
        pointerEvents: isEditing ? "none" : "auto", // 편집 모드일 때 위젯 이동 금지(이거 스크롤도 안 됨)
      }}>
        {/* 위젯 컨텐츠 */}
        <h3>Chill~</h3>
        <img 
          src="https://i.namu.wiki/i/HSzMSqimQxoUbxjzHnwyEjSWmh0O3VXrEvR-la0oxvYAWBZdPXqmsnLoqj7TOrBJBfB8PGZrMia8orEOJDq7yk8E_Wbf9uJq1smmnZpT2jsfKl8elSHsidmAEs7S5VMn5Ss5qwKkRJ6eGVyTlBLeOA.webp" 
          alt="Placeholder"
          style={{ width: "100%" }} // 이미지 크기 조정
        />
      </div>
    </div>
  );
};

export default Widget;