import React, { useState, useEffect } from 'react';
import './item.css';
import { isChromeExtension } from "@/api/utils";
import Modal from './Modal';
import { Search } from "lucide-react";

const API_ENDPOINT = "https://api.example.com/search";
const STORAGE_KEY = "chat_gpt";

const ChatGPTSearch = ({ isEditing }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_ENDPOINT}?query=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('검색 실패');
      
      const data = await response.json();
      setResults(data.results || []); // API 응답 형식에 맞게 조절
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="item-style">
      <div style={{ pointerEvents: isEditing ? "none" : "auto" }}>
        <div className="item-header">Chat GPT 검색</div>
        <div className="flex justify-center mb-1">
          <div className="relative w-96">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"/>
            <input
              type="text"
              placeholder="무엇이든 물어보세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="
                w-full pl-10 pr-4 py-2
                bg-gray-100 border border-gray-300
                focus:ring-2 focus:ring-gray-300
                rounded-full text-gray-700 outline-none transition-all
                shadow-sm focus:bg-white"
            />
          </div>
        </div>

        {loading && <p className="text-center text-gray-500">🔄 검색 중...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        
        <ul className="search-results">
          {results.map((result, index) => (
            <li key={index} className="result-item">
              <strong>{result.title}</strong> - {result.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatGPTSearch;
