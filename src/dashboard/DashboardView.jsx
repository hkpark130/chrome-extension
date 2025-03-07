import React, { useEffect, useState } from 'react';
import RGL, { WidthProvider } from "react-grid-layout";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import Widget from '../components/Widget';
import Bookmark from '../components/Bookmark';
import Calendar from '../components/Calendar';
import { useNavigate } from "react-router-dom";

const ReactGridLayout = WidthProvider(RGL);
const STORAGE_KEY = "dashboard_layout"; 

const widgets = [
  { component: 'Widget', content: <Widget /> },
  { component: 'Bookmark', content: <Bookmark /> },
  { component: 'Calendar', content: <Calendar /> },
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
    <div style={{ height: '100vh', padding: '10px' }}>
      <button onClick={() => navigate("/edit")} 
        style={{ 
          position: 'absolute', 
          top: 5, right: 5, 
          padding: '8px', 
          fontSize: '15px', 
          background: 'orange', 
          color: 'white', 
          border: 'none', 
          cursor: 'pointer',
          borderRadius: "15px",
        }}>
        <b>⚙️ 편집</b>
      </button>

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
        {layout.map(item => {
          const widgetData = widgets.find(widget => widget.component === item.component);
          return (
            <div key={item.i} data-grid={item} style={{ border: '1px solid #ccc', background: '#eee' }}>
              {widgetData ? widgetData.content : "Unknown Widget"}
            </div>
          );
        })}
      </ReactGridLayout>
    </div>
  );
};

export default DashboardView;