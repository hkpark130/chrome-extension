import React, { useState, useEffect } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useNavigate } from "react-router-dom";
import Widget from "@/components/Widget";
import Bookmark from "@/components/Bookmark";
import TopSite from "@/components/TopSite";
import ChatGPT from "@/components/ChatGPTSearch";
import LunchMenu from "@/components/LunchMenu";
import MeetingRoomCalendar from "@/components/MeetingRoomCalendar";
import { XCircle, Save, PencilRuler, CheckSquare, Square } from 'lucide-react';

const ReactGridLayout = WidthProvider(RGL);
const STORAGE_KEY = "dashboard_layout";

const widgets = [
  { component: "Widget", label: "📊 Widget", w: 2, h: 3, isBordered: true,
    content: (props) => <Widget isEditing={true} isBordered={props.isBordered} /> },
  { component: "TopSite", label: "🔖 자주 방문하는 사이트", w: 7, h: 4, isBordered: true,
    content: (props) => <TopSite isEditing={true} isBordered={props.isBordered} /> },
  { component: "Bookmark", label: "🔖 북마크", w: 7, h: 4, isBordered: true,
    content: (props) => <Bookmark isEditing={true} isBordered={props.isBordered} /> },
  { component: "ChatGPT", label: "🤖 ChatGPT", w: 6, h: 3, isBordered: true,
    content: (props) => <ChatGPT isEditing={true} isBordered={props.isBordered} /> },
  { component: "MeetingRoomCalendar", label: "📅 회의실 예약", w: 7, h: 9, isBordered: true,
    content: (props) => <MeetingRoomCalendar isEditing={true} isBordered={props.isBordered} /> },
  { component: "LunchMenu", label: "🍱 점심추천", w: 2, h: 3, isBordered: true,
    content: (props) => <LunchMenu isEditing={true} isBordered={props.isBordered} /> },
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
            existingLayoutItem.isBordered = item.isBordered;
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

  const borderedItem = (id) => {
    const updatedItems = items.map(item => 
      item.i === id ? { ...item, isBordered: !item.isBordered } : item
    );
    const updatedLayout = layout.map(item => 
      item.i === id ? { ...item, isBordered: !item.isBordered } : item
    );

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
        isBordered: parsedWidget.isBordered,
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
      {/* 툴박스 영역 */}
      <div className="w-64 bg-white shadow-lg border-r p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-lg font-semibold" style={{ fontFamily: "'Gamja Flower', sans-serif", fontSize: "1.7rem"}}>
            <PencilRuler className="w-5 h-5" /> 
            툴박스
          </div>
          <button
            onClick={() => {saveToLocalStorage(items, layout)}}
            className="px-3 py-2 bg-green-500 text-white border-[2px] border-cyan-500 shadow-md hover:bg-green-600 transition flex items-center gap-2 rounded-full"
          >
            <Save className="w-5 h-5" />
            <span className="text-sm font-medium" style={{ fontFamily: "'Gamja Flower', sans-serif", fontSize: "1.1rem"}}>저장</span>
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
                style={item.isBordered ? {
                  border: '1px solid #ccc',
                  background: '#eee',
                }: {}}
              >
                <XCircle
                  onClick={() => {
                    removeItem(item.i);
                  }}
                  className="cancelSelectorName absolute flex items-center justify-center top-1 left-1 
                  text-red-500  rounded-full w-5 h-5 
                  cursor-pointer leading-5 z-10"
                >
                </XCircle>

                <div 
                  onClick={() => {
                    borderedItem(item.i);
                  }}
                  className="cancelSelectorName absolute top-1 left-6 flex items-center justify-center cursor-pointer z-10"
                >
                  {item.isBordered ? (
                    <CheckSquare className="text-green-500 w-5 h-5" />
                  ) : (
                    <Square className="text-gray-500 w-5 h-5" />
                  )}
                </div>

                {widgetData ? widgetData.content({ isBordered: item.isBordered }) : "Unknown Widget"}
              </div>
            );
          })}
        </ReactGridLayout>
      </div>
    </div>
  );
};

export default DashboardEditor;
