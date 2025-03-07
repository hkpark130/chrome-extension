import React from "react";
import { HashRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import DashboardEditor from "./dashboard/DashboardEditor";
import DashboardView from "./dashboard/DashboardView";
import TitleBar from "./TitleBar"; 
import './gridstack.css';

function App() {
  return (
    <Router>
      <div>
        <TitleBar />
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/edit" element={<DashboardEditor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;