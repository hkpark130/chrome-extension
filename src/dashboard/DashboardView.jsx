import React, { useEffect, useState } from 'react';
import RGL, { WidthProvider } from "react-grid-layout";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import Widget from '../components/Widget';
import Bookmark from '../components/Bookmark';

const ReactGridLayout = WidthProvider(RGL);
const STORAGE_KEY = "dashboard_layout"; 

const widgets = [
  { component: 'Widget', content: <Widget /> },
  { component: 'Bookmark', content: <Bookmark /> },
];

const DashboardView = ({ onEdit }) => {
  const [layout, setLayout] = useState([]);

  useEffect(() => {
    const savedLayout = localStorage.getItem(STORAGE_KEY);
    if (savedLayout) {
      setLayout(JSON.parse(savedLayout).layout || []);
    }
  }, []);

  return (
    <div style={{ height: '100vh', padding: '10px' }}>
      <button onClick={onEdit} style={{ padding: '10px', background: 'orange', color: 'white', border: 'none', cursor: 'pointer' }}>
        대시보드 편집
      </button>

      <ReactGridLayout
        className="layout"
        layout={layout}
        cols={21}
        rowHeight={38}
        width={800}
        isDraggable={false}
        isResizable={false}
      >
        {layout.map(item => {
          const widgetData = widgets.find(widget => widget.component === item.component);
          console.log(item);
          return (
            <div key={item.i} data-grid={item} style={{ border: '1px solid #ccc', background: '#eee', padding: '10px' }}>
              {widgetData ? widgetData.content : "Unknown Widget"}
            </div>
          );
        })}
      </ReactGridLayout>
    </div>
  );
};

export default DashboardView;