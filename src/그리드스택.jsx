import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import './gridstack.css';
import Widget from './components/Widget';

const toolboxItems = [
  { 
    id: 1, 
    label: "Widget A", 
    w: 2, 
    h: 2, 
    component: "Widget",
    props: { widget: "Widget A Content" }
  },
  { 
    id: 2, 
    label: "Widget B", 
    w: 3, 
    h: 1, 
    component: "Widget", 
    props: { widget: "<h2>test</h2>" } 
  },
  { 
    id: 3, 
    label: "Widget C", 
    w: 1, 
    h: 1, 
    component: "Widget", 
    props: { widget: "Widget C Content" }
  },
];

const componentMap = {
  Widget: Widget,
};

const Dashboard = () => {
  const gridRef = useRef(null);
  const gridInstance = useRef(null);
  const minRow = Math.floor(window.innerHeight / 80);
  const [widgetCounter, setWidgetCounter] = useState(0);

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  const handleWidgetRemove = (widgetId) => {
    if (!gridInstance.current) return;
    const widgetEl = document.getElementById(widgetId);
    if (widgetEl) {
      gridInstance.current.removeWidget(widgetEl);
    }
  };

  useEffect(() => {
    // GridStack 초기화
    gridInstance.current = GridStack.init({
      cellHeight: 80,
      disableOneColumnMode: true,
      float: true,
      minRow: minRow,
      acceptWidgets: true,
    }, gridRef.current);

    const gridEl = gridRef.current;

    const handleDrop = (event) => {
      event.preventDefault();
      const data = event.dataTransfer.getData("text/plain");
      if (!data) return;
      const itemData = JSON.parse(data);
      const Comp = componentMap[itemData.component];
      if (!Comp) return;

      const newWidgetId = `widget-${widgetCounter}`;
      setWidgetCounter((prev) => prev + 1);

      // 컨테이너 div의 고유 ID 생성 (위젯 내에 React 컴포넌트를 마운트할 곳)
      const containerId = `${newWidgetId}-container`;

      // gridstack에 위젯 추가 (content에 빈 컨테이너 div 삽입)
      const gridRect = gridEl.getBoundingClientRect();
      const dropX = event.clientX - gridRect.left;
      const dropY = event.clientY - gridRect.top;
      const cellPos = gridInstance.current.getCellFromPixel({ left: dropX, top: dropY });
      const defaultWidth = itemData.w || 1;
      const defaultHeight = itemData.h || 1;
      
      gridInstance.current.addWidget({
        id: newWidgetId,
        x: cellPos.x,
        y: cellPos.y,
        w: defaultWidth,
        h: defaultHeight,
        // 컨테이너 div에 최소한의 스타일을 지정 (전체 높이 사용)
        content: `<div id="${containerId}" style="height: 100%;"></div>`,
      });

      // 위젯이 DOM에 추가된 후, 클라이언트 사이드에서 React 컴포넌트를 마운트
      setTimeout(() => {
        const container = document.getElementById(containerId);
        if (container) {
          createRoot(container).render(
            <Comp {...itemData.props} id={newWidgetId} onRemove={handleWidgetRemove} />
          );
        }
      }, 0);
    };

    const handleDragOver = (event) => {
      event.preventDefault();
    };

    gridEl.addEventListener('drop', handleDrop);
    gridEl.addEventListener('dragover', handleDragOver);

    return () => {
      gridEl.removeEventListener('drop', handleDrop);
      gridEl.removeEventListener('dragover', handleDragOver);
      gridInstance.current.destroy();
    };
  }, [widgetCounter]);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '200px', borderRight: '1px solid #ccc', padding: '10px' }}>
        <h3>Toolbox</h3>
        {toolboxItems.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            style={{
              padding: '8px',
              margin: '4px 0',
              border: '1px solid #888',
              cursor: 'grab',
              userSelect: 'none',
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, background: '#f0f0f0', position: 'relative' }}>
        <div
          ref={gridRef}
          className="grid-stack"
          style={{ flex: 1, background: '#f0f0f0', position: 'relative' }}
        >
          {/* gridstack이 위젯을 동적으로 추가 */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;