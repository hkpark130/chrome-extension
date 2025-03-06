import React from "react";

const Widget = ({ onRemove, id }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "auto", // 컨텐츠가 넘칠 경우 스크롤바 표시
        boxSizing: "border-box",
        padding: "8px",
        border: "1px solid #ccc",
        position: "relative",
        textAlign: "center",

        // alignContent: "center",
        // alignItems: 'center',
        // justifyContent: 'center',
      }}
    >
      {/* 위젯 컨텐츠 */}
      <h3>Chill~</h3>
      <img 
        src="https://i.namu.wiki/i/HSzMSqimQxoUbxjzHnwyEjSWmh0O3VXrEvR-la0oxvYAWBZdPXqmsnLoqj7TOrBJBfB8PGZrMia8orEOJDq7yk8E_Wbf9uJq1smmnZpT2jsfKl8elSHsidmAEs7S5VMn5Ss5qwKkRJ6eGVyTlBLeOA.webp" 
        alt="Placeholder"
        style={{ width: "100%" }} // 이미지 크기 조정
      />
    </div>
  );
};

export default Widget;