import React, { useEffect, useState } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Widget from "@/components/Widget";
import Bookmark from "@/components/Bookmark";
import MeetingRoomCalendar from "@/components/MeetingRoomCalendar";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const ReactGridLayout = WidthProvider(RGL);
const STORAGE_KEY = "dashboard_layout";

const widgets = [
  { component: "Widget", content: <Widget /> },
  { component: "Bookmark", content: <Bookmark /> },
  { component: "MeetingRoomCalendar", content: <MeetingRoomCalendar /> },
];

const DashboardView = () => {
  const [layout, setLayout] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedLayout = localStorage.getItem(STORAGE_KEY);
    if (savedLayout) {
      setLayout(JSON.parse(savedLayout).layout || []);
    }
  }, []);

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <Button onClick={() => navigate("/edit")} className="absolute top-2 right-2 bg-orange-500 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-orange-600">
        <Settings className="w-4 h-4" />
        편집
      </Button>
      {/* 대시보드 컨텐츠 */}
      <main className="flex-1 p-6">
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
            const widgetData = widgets.find(
              (widget) => widget.component === item.component
            );
            return (
              <div
                key={item.i}
                data-grid={item}
                className="border border-gray-300 bg-white shadow-md rounded-lg"
              >
                {widgetData ? widgetData.content : "Unknown Widget"}
              </div>
            );
          })}
        </ReactGridLayout>
      </main>
    </div>
  );
};

export default DashboardView;
