import React, { useEffect, useState } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Bookmark from "@/components/Bookmark";
import MeetingRoomCalendar from "@/components/MeetingRoomCalendar";
import TopSite from "@/components/TopSite";
import ChatGPT from "@/components/ChatGPTSearch";
import Memo from "@/components/Memo";
import LunchMenu from "@/components/LunchMenu";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { loadDashboard } from "@/api/api.js";
import { useAuth } from "react-oidc-context";

const ReactGridLayout = WidthProvider(RGL);
const STORAGE_KEY = "dashboard_layout";

const widgets = [
  { component: "Bookmark", content: (props) => <Bookmark {...props} /> },
  { component: "MeetingRoomCalendar", content: (props) => <MeetingRoomCalendar {...props} /> },
  { component: "TopSite", content: (props) => <TopSite {...props} /> },
  { component: "ChatGPT", content: (props) => <ChatGPT {...props} /> },
  { component: "LunchMenu", content: (props) => <LunchMenu {...props} /> },
  { component: "Memo", content: (props) => <Memo {...props} /> },
];

const DashboardView = () => {
  const [layout, setLayout] = useState([]);
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    const fetchLayout = async () => {
      if (auth.isAuthenticated) {
        const layoutFromDB = await loadDashboard(auth.user?.profile?.sub);
        setLayout(layoutFromDB);
      }
    };
    fetchLayout();
  }, [auth.isAuthenticated]);

  useEffect(() => {
    const savedLayout = localStorage.getItem(STORAGE_KEY);
    if (savedLayout) {
      setLayout(JSON.parse(savedLayout).layout || []);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 대시보드 컨텐츠 */}
      <main className="flex-1 p-1">
        {layout.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-500 text-xl font-semibold mb-4">
              🎨 툴박스에서 위젯을 드래그 앤 드랍으로 가져와 주세요!
            </p>
            <Button  
              onClick={() => navigate("/edit")} 
              className="bg-cyan-600 text-white py-2 px-4 rounded-full shadow-md hover:bg-cyan-700 transition"
            >
              위젯 추가하기
            </Button>
          </div>
        ) : (
          <ReactGridLayout
            className="layout"
            layout={layout}
            verticalCompact={false}
            cols={21}
            rowHeight={38}
            width={800}
            isDraggable={false}
            isResizable={false}
          >
            {layout.map((item) => {
              const widgetData = widgets.find(widget => widget.component === item.component);
              return (
                <div
                  key={item.i}
                  data-grid={item}
                  className={item.isBordered ? "border border-gray-300 bg-white shadow-md rounded-lg" : ""}
                >
                  {widgetData ? widgetData.content({ isBordered: item.isBordered }) : "Unknown Widget"}
                </div>
              );
            })}
          </ReactGridLayout>
        )}
      </main>
    </div>
  );
};

export default DashboardView;
