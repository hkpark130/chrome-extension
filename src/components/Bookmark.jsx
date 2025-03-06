import React from "react";

const Bookmark = ({ id }) => {
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
      }}
    >
      <p>Book</p>
    </div>
  );
};

export default Bookmark;