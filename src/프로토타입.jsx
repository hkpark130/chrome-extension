import React, { useEffect, useRef, useState } from 'react';
import { GridStack } from 'gridstack'; // gridstack 라이브러리 가져오기
import 'gridstack/dist/gridstack.min.css'; // gridstack 스타일 가져오기
import './gridstack.css';
import Widget from './components/Widget';

const Dashboard = () => {
  const gridRef = useRef(null); // gridstack 컨테이너를 참조하기 위한 ref 생성 | className="grid-stack" 태그와 1대1 매칭
  const gridInstance = useRef(null); // gridstack 인스턴스를 저장하기 위한 ref 생성
  const minRow = Math.floor(window.innerHeight / 80); // 초기 minRow 설정
  const widget = "test"

  // 툴박스에서 사용할 드래그 가능한 아이템 목록(위젯)
  const toolboxItems = [
    { id: 1, label: "Widget A", w: 2, h: 2, content: "Widget A</br>Content</br>More Content</br>Even More Content\\nScrollable\nScrollable" }, // 2x2 크기의 위젯
    { id: 2, label: "Widget B", w: 3, h: 1, content: <Widget widget={widget} /> }, // 3x1 크기의 위젯
    { id: 3, label: "Widget C", w: 1, h: 1, 
        content: JSON.stringify({
            name: "Text",
            props: { content: "<h1>Item 1</h1>" },
          }),
     }, // 1x1 크기의 위젯
  ];

  // 툴박스 아이템 드래그 시작 시 데이터 저장하는 핸들러
  const handleDragStart = (e, item) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(item)); // 드래그 시작 시 아이템의 정보를 JSON 문자열로 저장
    // e.dataTransfer.setData("text/html", item.content); // 🔥 HTML 그대로 저장
  };

  useEffect(() => {
    // GridStack 초기화 (옵션을 필요에 따라 조정 가능)
    gridInstance.current = GridStack.init({ // gridRef(div태그) 초기화 시켜주기 | 1대1 매칭
      cellHeight: 80, // 각 셀의 높이 (px 단위)
      disableOneColumnMode: true, // 한 열 모드 비활성화
      float: true, // 요소가 겹치지 않도록 float 설정
      minRow: minRow // 최소 행 유지 -> 컨테이너 최소 크기 유지
    }, gridRef.current); // 위에서 만든 gridRef를 gridstack 컨테이너로 설정

    const gridEl = gridRef.current; // gridstack 컨테이너 요소 

    // gridstack 컨테이너에서 drop 이벤트 처리하는 핸들러
    const handleDrop = (event) => {
      event.preventDefault(); // 기본 동작 방지

      // 전달된 데이터 가져와서 JSON 객체로 변환
      const itemData = JSON.parse(event.dataTransfer.getData("text/html")); 

      // gridstack 컨테이너의 위치 정보 가져오기
      const rect = gridEl.getBoundingClientRect();
      
      // 드롭된 위치의 x, y 좌표를 계산
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // gridstack의 셀 크기(여기서는 80px) 기준으로 컬럼과 행(row) 계산
      const col = Math.floor(x / 80);
      const row = Math.floor(y / 80);

      // GridStack에 새로운 아이템 추가
      gridInstance.current.addWidget({
        acceptWidgets: true,
        x: col, // 계산된 컬럼 위치
        y: row, // 계산된 행 위치
        w: itemData.w || 2, // 위젯의 너비 (기본값 2)
        h: itemData.h || 2, // 위젯의 높이 (기본값 2)
        // content: ReactDOMServer.renderToString(<Comp {...itemData.props} />),
        content: itemData // 내부 콘텐츠 추가
      });
    };

    // 드래그 중 '드롭 가능'한 상태를 유지하도록 하는 핸들러
    const handleDragOver = (event) => {
      event.preventDefault(); // 기본 동작 방지 (drop이 정상 작동하도록)
    };

    // gridstack 컨테이너에 이벤트 리스너 추가 (drop, dragover)
    gridEl.addEventListener('drop', handleDrop);
    gridEl.addEventListener('dragover', handleDragOver);

    // 컴포넌트가 제거될 때 이벤트 리스너 해제 및 GridStack 인스턴스 해제
    return () => {
      gridEl.removeEventListener('drop', handleDrop);
      gridEl.removeEventListener('dragover', handleDragOver);
      gridInstance.current.destroy(); // GridStack 인스턴스 제거
    };
  }, []); // 빈 배열을 넣어 한 번만 실행되도록 설정

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      
      {/* 왼쪽 툴박스 영역 */}
      <div style={{ width: '200px', borderRight: '1px solid #ccc', padding: '10px' }}>
        <h3>Toolbox</h3>
        
        {/* 툴박스 아이템을 순회하며 드래그 가능하게 설정 */}
        {toolboxItems.map(item => (
          <div
            key={item.id}
            draggable // 드래그를 허용
            onDragStart={(e) => handleDragStart(e, item)} // 드래그 시작 이벤트 핸들러
            style={{ // 스타일 설정
              padding: '8px',
              margin: '4px 0',
              border: '1px solid #888', 
              cursor: 'grab', // 마우스 커서를 '잡기' 모양으로 변경
              userSelect: 'none' // 텍스트 선택 방지
            }}
          >
            {item.label} {/* 아이템의 이름 표시 */}
          </div>
        ))}
      </div>

      {/* 오른쪽 gridstack 컨테이너 (위젯들을 배치할 공간) */}
      <div
        style={{
          flex: 1,
          background: '#f0f0f0',
          position: 'relative',
          overflowX: 'auto', // 가로 스크롤 활성화
          overflowY: 'auto', // 세로 스크롤 유지
          whiteSpace: 'nowrap', // 줄바꿈 방지
        }}
      >
        <div
          ref={gridRef} // gridstack 컨테이너 참조 연결
          className="grid-stack" // gridstack 관련 스타일 적용
          style={{ flex: 1, background: '#f0f0f0', position: 'relative'}} // 전체 화면 비율 설정, 배경 적용
        >
          {/* gridstack이 내부에 위젯을 동적으로 추가 */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;