import React from "react";
import ReactDOM from "react-dom";
import "@/Modal.css"; // ✅ 모달 스타일 파일 불러오기

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal( // ✅ body 요소에 포털 생성
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body // ✅ 모달을 body에 직접 추가
  );
};

export default Modal;