import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ko';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from './Modal';
import { Button } from "@/components/ui/button";
import { loadMeeting, deleteMeeting } from "@/api/api.js";

// moment를 사용하여 localizer 설정
moment.locale('ko');
const localizer = momentLocalizer(moment);

const messages = {
  allDay: '종일',
  previous: '이전',
  next: '다음',
  today: '오늘',
  month: '월',
  week: '주',
  day: '일',
  agenda: '일정',
  date: '날짜',
  time: '시간',
  event: '이벤트',
  showMore: (total) => `+ 외 ${total}건`,
};

function MeetingRoomCalendar({ isEditing, isBordered }) {
  const [counter, setCounter] = useState(0);
  const [view, setView] = useState("month");
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    startTime: '',
    endTime: '',
    isRecurring: false,
    repeatWeeks: 4,
    baseDate: null,
  });
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timeType, setTimeType] = useState('start');
  const [selectedTime, setSelectedTime] = useState('09:00');

  const slotPropGetter = (date) => {
    const hour = moment(date).hour();
    const minute = moment(date).minute();
  
    const isLunchTime =
      (hour === 12 && minute >= 30) ||
      (hour === 13 && minute < 30);
  
    const isLunchTimeLabel = hour === 12 && minute === 30;
  
    const isOffTime = hour < 9 || hour >= 18;
  
    if (isLunchTimeLabel) {
      return {
        className: 'slot-lunch-label',
      };
    }
  
    if (isLunchTime || isOffTime) {
      return {
        className: 'slot-lunch-bg',
      };
    }
  
    return {};
  };

  useEffect(() => {
    loadMeeting();
  }, []);

  const handleAlertClose = () => {
    setSelectedEvent(null);
    setShowAlert(false);
  };

  const handleDeleteEvent = async (deleteAll = false) => {
    if (!selectedEvent) return;

    const isConfirmed = window.confirm("정말 삭제하시겠습니까?");
    if (!isConfirmed) return;
  
    try {
      if (deleteAll && selectedEvent.groupId) {
        await deleteMeeting(`group/${selectedEvent.groupId}`);
      } else {
        await deleteMeeting(`${selectedEvent.id}`);
      }
      loadMeeting();
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  
    setShowAlert(false);
    setSelectedEvent(null);
  };

  // 달력 빈 구역을 드래그 또는 클릭하여 예약 생성
  const handleSelectSlot = ({ start }) => {
    setNewMeeting({
      title: '',
      startTime: '',
      endTime: '',
      isRecurring: false,
      repeatWeeks: 4,
      baseDate: start,
    });
    setShowModal(true);
  };

   // 시간 모달 열기 (Start or End 선택)
  const openTimeModal = (type) => {
    setTimeType(type);
    setShowTimeModal(true);
  };

  // 시간 선택 후 저장
  const handleTimeSave = () => {
    if (timeType === 'start') {
      setNewMeeting((prev) => ({ ...prev, startTime: selectedTime }));
    } else {
      setNewMeeting((prev) => ({ ...prev, endTime: selectedTime }));
    }
    setShowTimeModal(false); // 시간 선택 모달 닫기
  };

  const handleInputChange = (e) => {
    let { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      value = checked;
    }
    setNewMeeting((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveMeeting = async () => {
    if (!newMeeting.title || !newMeeting.startTime || !newMeeting.endTime) {
      setAlertMessage('모든 필드를 입력해주세요.');
      setShowAlert(true);
      return;
    }
  
    const baseDate = moment(newMeeting.baseDate);
    const startDateTime = moment(`${baseDate.format('YYYY-MM-DD')} ${newMeeting.startTime}`, "YYYY-MM-DD HH:mm").toDate();
    const endDateTime = moment(`${baseDate.format('YYYY-MM-DD')} ${newMeeting.endTime}`, "YYYY-MM-DD HH:mm").toDate();
  
    if (isNaN(startDateTime) || isNaN(endDateTime) || endDateTime <= startDateTime) {
      setAlertMessage("올바른 날짜 및 시간을 입력해주세요.");
      setShowAlert(true);
      return;
    }
  
    const meetingRequest = {
      title: newMeeting.title,
      start: startDateTime,
      end: endDateTime,
      recurring: newMeeting.isRecurring,
      repeatWeeks: newMeeting.repeatWeeks,
    };
  
    try {
      await axios.post(API_BASE_URL, meetingRequest);
      loadMeeting();
      setShowModal(false);
    } catch (error) {
      console.error("Failed to save meeting:", error);
    }
  };

  // 이미 등록된 이벤트(예약)를 클릭했을 때
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setAlertMessage(`예약 상세 정보:
제목: ${event.title}
시작: ${moment(event.start).format('HH:mm')}
종료: ${moment(event.end).format('HH:mm')}`);
    setShowAlert(true);
  };

  return (
    <div className="item-style">
      {isBordered && 
        <div className="item-header">회의실 예약</div>
      }
      {/* 달력 영역 */}
      <div style={{ height: '500px', marginBottom: '30px', pointerEvents: isEditing ? "none" : "auto" }}>
        <Calendar
          localizer={localizer}
          events={events}
          min={new Date(1970, 1, 1, 8, 0)}
          startAccessor="start"
          endAccessor="end"
          selectable={view === "month"}
          onView={(newView) => setView(newView)}
          slotPropGetter={slotPropGetter}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          messages={messages}
          defaultView="month"
          views={['month', 'week']}
          style={{ height: '100%' }}
          formats={{
            monthHeaderFormat: (date, culture, localizer) =>
              moment(date).format('M월'),
          }}
        />
        {view === "week" && (
          <div className="absolute inset-0 pointer-events-none" />
        )}
      </div>

      {/* 예약 입력 모달 */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h3 className="text-xl font-semibold mb-4">회의 예약</h3>
        <p className="mb-2">회의 제목</p>
        <input
          type="text"
          name="title"
          value={newMeeting.title}
          onChange={handleInputChange}
          className="border border-gray-300 p-2 rounded w-full mb-3"
        />

        <div className="flex items-center justify-center space-x-2 pb-3 bg-gray-100 p-4 rounded-md shadow-md w-full max-w-md mx-auto">
          {/* 시작 시간 버튼 */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 text-sm">시작</span>
            <Button 
              onClick={() => openTimeModal('start')} 
              className="bg-gray-200 text-black py-2 px-4 rounded-l-md hover:bg-gray-300 transition-colors border border-gray-300"
            >
              {newMeeting.startTime || "시간 선택"}
            </Button>
          </div>

          <span className="text-gray-400 p-1"> → </span>

          {/* 종료 시간 버튼 */}
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => openTimeModal('end')} 
              className="bg-gray-200 text-black py-2 px-4 rounded-r-md hover:bg-gray-300 transition-colors border border-gray-300"
            >
              {newMeeting.endTime || "시간 선택"}
            </Button>
            <span className="text-gray-500 text-sm">종료</span>
          </div>
        </div>

        {/* 반복 예약 설정 */}
        <label className="flex items-center mb-3 pt-3">
          <input type="checkbox" name="isRecurring" checked={newMeeting.isRecurring} onChange={handleInputChange} className="mr-2" />
          매주 반복 (최대 1년)
        </label>

        {newMeeting.isRecurring && (
          <div className="mb-3">
            <label className="text-sm text-gray-700">반복 횟수 (최대 52주)</label>
            <select name="repeatWeeks" value={newMeeting.repeatWeeks} onChange={handleInputChange} className="border p-2 rounded w-full">
              {[...Array(52)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}주</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button onClick={() => setShowModal(false)} className="bg-gray-500 text-white py-2 px-4 rounded">
            취소
          </Button>
          <Button onClick={handleSaveMeeting} className="bg-blue-500 text-white py-2 px-4 rounded">
            저장
          </Button>
        </div>
      </Modal>

      {/* 시간 선택 모달 */}
      <Modal isOpen={showTimeModal} onClose={() => setShowTimeModal(false)}>
        <h3 className="text-xl font-semibold mb-4">시간 선택</h3>

        <input type="time" value={selectedTime} 
          onChange={(e) => setSelectedTime(e.target.value)}
          onFocus={(e) => e.target.showPicker && e.target.showPicker()}
          className="border p-2 rounded w-full mb-4"/>

        <div className="flex space-x-2 items-center">
          <Button onClick={handleTimeSave} className="bg-blue-500 text-white py-2 px-4 rounded">
            확인 
          </Button>
          <p className='text-sm'>
            자정(밤 12시)를 넘어갈 수 없습니다.
          </p>
        </div>
      </Modal>

      {/* 알림 모달 */}
      <Modal isOpen={showAlert} onClose={handleAlertClose}>
        <h3 className="text-xl font-semibold mb-4">상세</h3>
        <p style={{ whiteSpace: 'pre-line' }}>
          {alertMessage}
        </p>
        <div className="flex space-x-1 justify-end mt-4">
          {selectedEvent && (
            <>
              {selectedEvent?.groupId && (
                <Button onClick={() => handleDeleteEvent(true)} className="bg-red-600 text-white py-2 px-4 rounded">
                  전체 삭제
                </Button>
              )}
              <Button onClick={() => handleDeleteEvent(false)} className="bg-red-500 text-white py-2 px-4 rounded">
                삭제
              </Button>
            </>
          )}
          <Button onClick={handleAlertClose} className="bg-gray-500 text-white py-2 px-4 rounded">
            닫기
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default MeetingRoomCalendar;