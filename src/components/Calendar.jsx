import React, { useState } from 'react';
import './item.css';
import Modal from './Modal';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction";

const Calendar = ({ isEditing }) => {
  const [showModal, setShowModal] = useState(false); // ✅ 모달 표시 상태
  const [selectedDate, setSelectedDate] = useState(null); // ✅ 선택한 날짜 저장
  const [meetingInfo, setMeetingInfo] = useState({ room: "", title: "" }); // ✅ 회의실 예약 정보

  // 📌 날짜를 클릭하면 모달을 열고 선택한 날짜 저장
  const handleDateClick = (arg) => {
    alert("z");
    setSelectedDate(arg.dateStr); 
    setShowModal(true);
  };

  // 📌 입력 필드 변경 핸들러
  const handleInputChange = (e) => {
    setMeetingInfo({ ...meetingInfo, [e.target.name]: e.target.value });
  };

  // 📌 예약 버튼 (submit) 클릭 시 저장 후 모달 닫기
  const handleReserve = () => {
    console.log("예약 완료:", selectedDate, meetingInfo);
    alert(`회의 예약 완료!\n날짜: ${selectedDate}\n회의실: ${meetingInfo.room}\n제목: ${meetingInfo.title}`);
    setShowModal(false);
    setMeetingInfo({ room: "", title: "" }); // 입력 초기화
  };

  return (
    <div className='item-style' style={{ pointerEvents: isEditing ? "none" : "auto" }}>
      
      {/* 📌 FullCalendar 사용 */}
      <FullCalendar
        plugins={[ dayGridPlugin, interactionPlugin ]}
        dateClick={handleDateClick} // ✅ 날짜 클릭 시 모달 열기
      />

      {/* 📌 Modal: 회의실 예약 폼 */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2>회의실 예약</h2>
          <p>예약 날짜: <strong>{selectedDate}</strong></p>

          <label>회의실 선택:</label>
          <select name="room" onChange={handleInputChange} value={meetingInfo.room}>
            <option value="">회의실 선택</option>
            <option value="A">A 회의실</option>
            <option value="B">B 회의실</option>
            <option value="C">C 회의실</option>
          </select>

          <label>회의 제목:</label>
          <input type="text" name="title" placeholder="회의 제목 입력" onChange={handleInputChange} value={meetingInfo.title} />

          <div className="modal-buttons">
            <button onClick={handleReserve}>예약</button>
            <button onClick={() => setShowModal(false)}>닫기</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Calendar;