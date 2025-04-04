import React, { useState, useEffect } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useNavigate } from "react-router-dom";
import Bookmark from "@/components/Bookmark";
import TopSite from "@/components/TopSite";
import ChatGPT from "@/components/ChatGPTSearch";
import LunchMenu from "@/components/LunchMenu";
import Memo from "@/components/Memo";
import MeetingRoomCalendar from "@/components/MeetingRoomCalendar";
import { XCircle, Save, PencilRuler, CheckSquare, Square } from 'lucide-react';
import { v4 as uuidv4 } from "uuid";
import { saveDashboard, loadDashboard } from "@/api/api.js";
import { useAuth } from "react-oidc-context";

const ReactGridLayout = WidthProvider(RGL);
const STORAGE_KEY = "dashboard_layout";

const widgets = [
  { component: "TopSite", label: "🔖 자주 방문하는 사이트", w: 7, h: 4, isBordered: true, content: (props) => <TopSite isEditing={true} isBordered={props.isBordered} /> },
  { component: "Bookmark", label: "🔖 북마크", w: 7, h: 4, isBordered: true, content: (props) => <Bookmark isEditing={true} isBordered={props.isBordered} /> },
  { component: "ChatGPT", label: "🤖 ChatGPT", w: 6, h: 3, isBordered: true, content: (props) => <ChatGPT isEditing={true} isBordered={props.isBordered} /> },
  { component: "MeetingRoomCalendar", label: "🗓️ 회의실 예약", w: 7, h: 9, isBordered: true, content: (props) => <MeetingRoomCalendar isEditing={true} isBordered={props.isBordered} /> },
  { component: "LunchMenu", label: "🍱 점심추천", w: 2, h: 3, isBordered: true, content: (props) => <LunchMenu isEditing={true} isBordered={props.isBordered} /> },
  { component: "Memo", label: "📝 메모장", w: 2, h: 3, isBordered: true, content: (props) => <Memo isEditing={true} isBordered={props.isBordered} /> },
];

const DashboardEditor = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [layout, setLayout] = useState([]);
  const [draggingWidget, setDraggingWidget] = useState(null);
  const userId = auth.user?.profile?.sub;

  useEffect(() => {
    const savedLayout = localStorage.getItem(STORAGE_KEY);
    if (savedLayout) {
      const parsed = JSON.parse(savedLayout);
      setLayout(parsed.layout || []);
    }
  }, []);

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      auth.signinRedirect(); // 로그인 페이지로 이동
    }

    const fetchLayout = async () => {
      if (!auth.isLoading && auth.isAuthenticated) {
        const layoutFromDB = await loadDashboard(userId);
        setLayout(layoutFromDB);
      }
    };
  
    fetchLayout();
  }, [auth.isLoading, auth.isAuthenticated]);

  if (auth.isLoading) {
    return <div>🔒 로그인 상태 확인 중...</div>;
  }

  if (!auth.isAuthenticated) {
    return null;
  }

  const handleSave = async (layout) => {
    try {
      await saveDashboard(userId, layout);
      alert("✅ 저장 완료!");
      navigate("/");
    } catch (e) {
      console.error("❌ 저장 실패: ", e);
      alert("❌ 저장 실패");
    }
  };

  const removeItem = (id) => {
    setLayout(prev => prev.filter(item => item.i !== id));
  };

  const toggleBorder = (id) => {
    setLayout(prev => prev.map(item => item.i === id ? { ...item, isBordered: !item.isBordered } : item));
  };

  const onDrop = (layout, layoutItem, event) => {
    event.preventDefault();
    const widgetData = event.dataTransfer.getData("application/json");
    if (!widgetData) return;

    try {
      const parsedWidget = JSON.parse(widgetData);

      const newItem = {
        i: uuidv4(),
        x: layoutItem.x,
        y: layoutItem.y,
        w: parsedWidget.w,
        h: parsedWidget.h,
        minW: 1,
        minH: 2,
        resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
        component: parsedWidget.component,
        isBordered: parsedWidget.isBordered,
      };

      setLayout(prev => [...prev, newItem]);
      setDraggingWidget(null);
    } catch (error) {
      console.error("Failed to parse widget data:", error);
    }
  };

  const onDragOver = (e) => e.preventDefault();

  const onLayoutChange = (newLayout) => { // 커스텀 값 추가를 위해
    setLayout(prev =>
      newLayout.map(nl => {
        const existing = prev.find(p => p.i === nl.i);
        return existing ? { ...existing, ...nl } : nl;
      })
    );
  };

  const onDragStart = (widget) => (e) => {
    setDraggingWidget(widget);
    e.dataTransfer.setData("application/json", JSON.stringify(widget));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-lg border-r p-4">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center font-semibold" style={{ fontFamily: "'Gamja Flower', sans-serif", fontSize: "1.3rem" }}>
            <PencilRuler /> 툴박스
          </div>
          <button
            onClick={() => handleSave(layout)}
            className="px-3 py-2 bg-green-500 text-white border-[2px] border-green-500 shadow-md hover:bg-green-600 transition flex items-center gap-2 rounded-full"
          >
            <Save className="w-5 h-5" />
            <span className="text-sm font-medium" style={{ fontFamily: "'Gamja Flower', sans-serif", fontSize: "1.1rem" }}>저장</span>
          </button>
        </div>
        <p className="text-sm text-gray-500 text-center mb-1">
          위젯을 드래그&드랍 해주세요.
        </p>
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
          {layout.map((item) => {
            if (item.i === "__dropping-elem__") return null;
            const widgetData = widgets.find(widget => widget.component === item.component);
            return (
              <div
                key={item.i}
                data-grid={item}
                style={item.isBordered ? { border: '1px solid #ccc', background: '#eee' } : {}}
              >
                <XCircle
                  onClick={() => removeItem(item.i)}
                  className="cancelSelectorName absolute top-1 left-1 text-red-500 w-5 h-5 cursor-pointer z-10"
                />
                <div
                  onClick={() => toggleBorder(item.i)}
                  className="cancelSelectorName absolute top-1 left-6 cursor-pointer z-10"
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
