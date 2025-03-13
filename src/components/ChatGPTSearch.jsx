import React, { useState, useEffect } from 'react';
import './item.css';
import { Search } from "lucide-react";
import { fetchOpenAIResponse } from "@/api/api.js";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

const STORAGE_KEY = "chat_gpt";

const ChatGPTSearch = ({ isEditing, isBordered }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStorage();
  }, []);

  const fetchStorage = () => {
    const storedResponse = localStorage.getItem(STORAGE_KEY);
    if (storedResponse) {
      setResponse(JSON.parse(storedResponse));
    }
  };

  const saveStorage = (updatedResponse) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResponse));
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError(null);

    const currentSearchTerm = searchTerm; // 현재 입력값을 변수에 저장
    setSearchTerm('');

    try {
      const { answer, error } = await fetchOpenAIResponse(currentSearchTerm);
      if (error) throw new Error(error);
      setResponse(answer);
      saveStorage(answer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    e.target.style.height = "auto"; // 초기화 후
    e.target.style.height = `${e.target.scrollHeight}px`; // 내용 크기에 맞게 조절
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="item-style">
      <div style={{ pointerEvents: isEditing ? "none" : "auto" }}>
        {isBordered && <div className="item-header">ChatGPT 검색</div>}
        <div className="flex justify-center mb-1">
          <div className="relative w-[90%]">
            <Search size={18} className="absolute left-3 top-4 transform -translate-y-1/2 text-gray-500"/>
            <textarea
              rows="2"
              placeholder="무엇이든 물어보세요"
              onChange={handleInputChange}
              value={searchTerm}
              onKeyDown={handleKeyDown}
              className="gpt-textarea w-full pl-10 pr-4 py-2 bg-gray-100 border resize-none
                border-gray-300 focus:ring-2 focus:ring-gray-300 
                rounded-xl text-gray-700 outline-none transition-all
                shadow-sm focus:bg-white"
            />
          </div>
        </div>

        {loading && <p className="text-center text-gray-500">🔄 답변 중...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        
        {response && (
          <div className="mt-4 p-4 bg-white rounded-md shadow text-left">
            <p className="font-bold text-gray-800">🤖 ChatGPT의 답변:</p>
            <ReactMarkdown
              rehypePlugins={[rehypeHighlight]}
              components={{
                p: ({ children }) => (
                  <p className="mb-2 text-gray-800 whitespace-pre-wrap">{children}</p>
                ), // 일반 텍스트 스타일
                pre: ({ children }) => (
                  <pre className="p-4 bg-gray-100 text-black rounded-md overflow-x-auto">
                    {children}
                  </pre>
                ), // 코드 블록 스타일 (밝은 배경 적용)
                code: ({ children }) => (
                  <code className="p-1 bg-gray-200 text-red-500 rounded">{children}</code>
                ) // 인라인 코드 스타일
              }}
            >
              {response}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};
export default ChatGPTSearch;