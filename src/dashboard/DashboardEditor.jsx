import React, { useState, useEffect } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useNavigate } from "react-router-dom";
import Widget from "@/components/Widget";
import Bookmark from "@/components/Bookmark";
import TopSite from "@/components/TopSite";
import ChatGPT from "@/components/ChatGPTSearch";
import MeetingRoomCalendar from "@/components/MeetingRoomCalendar";
import { XCircle, Save } from 'lucide-react';

const ReactGridLayout = WidthProvider(RGL);
const STORAGE_KEY = "dashboard_layout";

const widgets = [
  { component: "Widget", label: "📊 Widget", w: 2, h: 3, content: <Widget isEditing={true} /> },
  { component: "TopSite", label: "🔖 자주 방문하는 사이트", w: 2, h: 2, content: <TopSite isEditing={true} /> },
  { component: "Bookmark", label: "🔖 북마크", w: 2, h: 2, content: <Bookmark isEditing={true} /> },
  { component: "ChatGPT", label: "🔍 ChatGPT", w: 2, h: 2, content: <ChatGPT isEditing={true} /> },
  { component: "MeetingRoomCalendar", label: "📅 회의실 예약", w: 5, h: 5, content: <MeetingRoomCalendar isEditing={true} /> },
];

const DashboardEditor = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [layout, setLayout] = useState([]);
  const [counter, setCounter] = useState(0);
  const [draggingWidget, setDraggingWidget] = useState(null);

  useEffect(() => {
    const savedLayout = localStorage.getItem(STORAGE_KEY);
    if (savedLayout) {
      const parsedLayout = JSON.parse(savedLayout);
      setItems(parsedLayout.items);
      setLayout(parsedLayout.layout);
      setCounter(parsedLayout.counter || 0); // 카운터도 함께 복원
    }
  }, []);

  const saveToLocalStorage = (updatedItems, updatedLayout) => {
    const newLayout = JSON.parse(JSON.stringify(updatedLayout));
    updatedItems.forEach(item => {
        const existingLayoutItem = newLayout.find(layoutItem => layoutItem.i === item.i);
        if (existingLayoutItem) {
            existingLayoutItem.component = item.component;
        } 
    });
    const savedData = {
      items: updatedItems,
      layout: newLayout,
      counter: counter
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
    alert("✅ 저장 완료!");
    navigate("/");
  };

  const removeItem = (id) => {
    const updatedItems = items.filter(item => item.i !== id);
    const updatedLayout = layout.filter(item => item.i !== id);

    setItems(updatedItems);
    setLayout(updatedLayout);
  };

  const onDrop = (layout, layoutItem, event) => {
    event.preventDefault();
    const widgetData = event.dataTransfer.getData("application/json");
    if (!widgetData) return;
  
    try {
      const parsedWidget = JSON.parse(widgetData);

      const newItem = {
        i: counter.toString(),
        x: layoutItem.x,
        y: layoutItem.y,
        w: parsedWidget.w,
        h: parsedWidget.h,
        minW: 1,
        minH: 2,
        resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
        component: parsedWidget.component, // 🔹 위젯 정보 직접 추가
      };

      setItems(prev => [...prev, newItem]);
      setLayout(prev => [...prev, newItem]); // Layout도 함께 업데이트
      setCounter(prev => prev + 1);
      setDraggingWidget(null);
    } catch (error) {
      console.error("Failed to parse widget data:", error);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  const onDragStart = (widget) => (e) => {
    setDraggingWidget(widget);
    e.dataTransfer.setData("application/json", JSON.stringify(widget));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 🛠 툴박스 영역 */}
      <div className="w-64 bg-white shadow-lg border-r p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">📌 툴박스</h3>
          <button
            onClick={() => {saveToLocalStorage(items, layout)}}
            className="px-3 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            <span className="text-sm font-medium">저장</span>
          </button>
        </div>
        {widgets.map((widget) => (
          <div
            key={widget.component}
            draggable
            onDragStart={onDragStart(widget)}
            className="p-3 bg-gray-200 border rounded-md cursor-grab mb-3 hover:bg-gray-300 transition"
          >
            {widget.label}
          </div>
        ))}
      </div>

      {/* 📌 대시보드 영역 */}
      <div className="flex-grow p-1">
        <ReactGridLayout
          draggableCancel=".cancelSelectorName"
          autoSize={false}
          preventCollision={false} // 충돌 방지 (자동정렬)
          // verticalCompact={false}
          className="layout h-screen w-full"
          layout={layout}
          cols={21}
          rowHeight={30}
          width={800}
          isDroppable={true}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onLayoutChange={onLayoutChange}
          useCSSTransforms={true}
          droppingItem={draggingWidget ? { i: "__dropping-elem__", w: draggingWidget.w, h: draggingWidget.h } : { i: "__dropping-elem__", w: 2, h: 2 }}
        >
          {items.map((item) => {
            const widgetData = widgets.find((widget) => widget.component === item.component);
            return (
              <div key={item.i} data-grid={layout.find(l => l.i === item.i)}
                style={{
                  border: '1px solid #ccc',
                  background: '#eee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <XCircle
                  onClick={() => {
                    removeItem(item.i);
                  }}
                  className="cancelSelectorName absolute flex items-center justify-center top-1 left-1 
                  bg-gray-200 text-red-500 border border-red rounded-full w-5 h-5 
                  text-sm cursor-pointer text-center leading-5 z-10"
                >
                </XCircle>
                {widgetData ? widgetData.content : "Unknown Widget"}
              </div>
            );
          })}
        </ReactGridLayout>
      </div>
    </div>
  );
};

export default DashboardEditor;
