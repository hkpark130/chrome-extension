import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// moment를 사용하여 localizer 설정
const localizer = momentLocalizer(moment);

function MeetingRoomCalendar({ isEditing }) {
  // 초기 예약 데이터 (샘플)
  const [events, setEvents] = useState([
    {
      id: 1,
      title: '팀 미팅',
      start: new Date(2023, 3, 12, 10, 0),  // 2023년 4월 12일 10:00
      end: new Date(2023, 3, 12, 11, 0),    // 2023년 4월 12일 11:00
    },
    {
      id: 2,
      title: '프로젝트 논의',
      start: new Date(2023, 3, 13, 14, 0),  // 2023년 4월 13일 14:00
      end: new Date(2023, 3, 13, 15, 30),   // 2023년 4월 13일 15:30
    },
  ]);

  // 달력 빈 구역을 드래그 또는 클릭하여 예약 생성
  const handleSelectSlot = ({ start, end }) => {
    const title = prompt('회의 제목을 입력해주세요:');
    if (title) {
      const newEvent = {
        id: events.length + 1,  // 간단한 id 생성 (실 서비스에서는 고유 id 사용 권장)
        title,
        start,
        end,
      };
      setEvents([...events, newEvent]);
    }
  };

  // 이미 등록된 이벤트(예약)를 클릭했을 때
  const handleSelectEvent = (event) => {
    alert(`예약 상세 정보:
제목: ${event.title}
시작: ${event.start.toLocaleString()}
종료: ${event.end.toLocaleString()}`);
  };

  return (
    <div className='item-style' >
      <h2>회의실 예약 시스템</h2>

      {/* 달력 영역 */}
      <div style={{ height: '500px', marginBottom: '30px', pointerEvents: isEditing ? "none" : "auto", }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          defaultView="month"
          views={['month', 'week', 'day', 'agenda']}
          style={{ height: '100%' }}
        />
      </div>

      {/* 예약 현황 영역 */}
      <div>
        <h3>현재 예약 현황</h3>
        {events.length === 0 ? (
          <p>예약된 회의가 없습니다.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {events.map((event) => (
              <li key={event.id} style={{ marginBottom: '10px' }}>
                <strong>{event.title}</strong> <br />
                {event.start.toLocaleString()} ~ {event.end.toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default MeetingRoomCalendar;
