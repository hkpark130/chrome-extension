import React, { useState, useEffect } from 'react';
import './item.css';
import { isChromeExtension } from "@/api/utils";
import Modal from './Modal';
import { Button } from "@/components/ui/button";
import { MoreVertical, Plus, ChevronLeft, ChevronRight, Search } from "lucide-react";

const STORAGE_KEY = "bookmarks";
const itemsPerPage = 6;

const Bookmark = ({ isEditing, isBordered }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);  // 수정 폼 표시 여부
  const [showAddForm, setShowAddForm] = useState(false);
  const [editedBookmark, setEditedBookmark] = useState({ id: null, name: '', url: '' }); // 수정될 북마크 정보
  const [newBookmark, setNewBookmark] = useState({ name: '', url: '' });

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const normalizeURL = (url) => {
    if (!/^https?:\/\//i.test(url)) { // URL이 http:// 또는 https:// 로 시작하지 않으면
      alert("입력한 URL에 프로토콜(http:// 또는 https://)이 없어서 http:// 가 자동으로 추가되었습니다.");
      return "http://" + url; // 기본적으로 http 추가
    }
    return url;
  };
  
  // 📌 북마크 데이터 불러오기 (localStorage 사용)
  const fetchBookmarks = () => {
    const storedBookmarks = localStorage.getItem(STORAGE_KEY);
    if (storedBookmarks) {
      setBookmarks(JSON.parse(storedBookmarks));
    } else {
      const defaultBookmarks = [
        { id: 1, name: 'Google', url: 'https://www.google.com' },
        { id: 2, name: 'Naver', url: 'https://www.naver.com' },
      ];
      saveBookmarks(defaultBookmarks);
    }
  };

  // 📌 북마크 데이터 저장 (localStorage 사용)
  const saveBookmarks = (updatedBookmarks) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBookmarks));
    setBookmarks(updatedBookmarks);
  };

  const filteredBookmarks = bookmarks.filter(bookmark =>
    bookmark.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedBookmarks = filteredBookmarks.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (direction) => {
    setCurrentPage((prev) => Math.max(0, Math.min(prev + direction, Math.ceil(filteredBookmarks.length / itemsPerPage) - 1)));
  };

  const handleEditClick = (id) => {
    const bookmarkToEdit = bookmarks.find(bookmark => bookmark.id === id);
    setEditedBookmark({ ...bookmarkToEdit });
    setShowEditForm(true);
  };

  const handleEditInputChange = (e) => {
    setEditedBookmark({ ...editedBookmark, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = () => {
    if (editedBookmark.name && editedBookmark.url) {
      const normalizedUrl = normalizeURL(editedBookmark.url);
      const updatedBookmarks = bookmarks.map(bookmark =>
        bookmark.id === editedBookmark.id ? { ...editedBookmark, url: normalizedUrl } : bookmark
      );
      saveBookmarks(updatedBookmarks);
      setShowEditForm(false);
      setEditedBookmark({ id: null, name: '', url: '' });
    }
  };

  const handleDeleteBookmark = () => {
    const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== editedBookmark.id);
    saveBookmarks(updatedBookmarks);
    setShowEditForm(false);
  };

  const handleAddClick = () => {
    setShowAddForm(true);
  };

  const handleNewBookmarkChange = (e) => {
    setNewBookmark({ ...newBookmark, [e.target.name]: e.target.value });
  };

  const handleAddBookmark = () => {
    if (newBookmark.name && newBookmark.url) {
      const normalizedUrl = normalizeURL(newBookmark.url);
      const newId = Math.max(0, ...bookmarks.map(b => b.id)) + 1;
      const updatedBookmarks = [...bookmarks, { ...newBookmark, id: newId, url: normalizedUrl }];
      saveBookmarks(updatedBookmarks);
      setShowAddForm(false);
      setNewBookmark({ name: '', url: '' });
    }
  };

  const faviconURL = (u) => {
    try {
      if (isChromeExtension()) {
        // 확장 프로그램 환경에서는 chrome.runtime.getURL 사용
        const url = new URL(chrome.runtime.getURL("/_favicon/"));
        url.searchParams.set("pageUrl", u);
        url.searchParams.set("size", "32");
        return url.toString();
      } else {
        // 일반 웹 환경에서는 Google Favicon API 사용
        const urlObj = new URL(u);
        return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
      }
    } catch (error) {
      console.error("Invalid URL:", error); // 잘못된 URL 로그 출력
      return ""; // 유효하지 않은 경우 빈 문자열 반환 or 기본 아이콘
    }
  };

  return (
    <div
      className="item-style"
    >
      <div 
      style={{
        pointerEvents: isEditing ? "none" : "auto", // 편집 모드일 때 위젯 이동 금지(이거 스크롤도 안 됨)
      }}>
        {isBordered && 
          <div className="item-header">즐겨찾기</div>
        }
        <div className="flex justify-center mb-1">
          <div className="relative w-96">
            {/* 🔍 검색 아이콘 (왼쪽) */}
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"/>
            
            <input
              type="text"
              placeholder="북마크 명을 입력하세요."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                w-full pl-10 pr-4 py-2
                bg-gray-100 border border-gray-300
                focus:ring-2 focus:ring-gray-300
                rounded-full text-gray-700 outline-none transition-all
                shadow-sm focus:bg-white"
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          {displayedBookmarks.map((bookmark, index) => (
            <div key={index} 
              className="relative flex flex-col items-center w-20 p-2 rounded-lg transition hover:bg-gray-200 group">
              <a href={bookmark.url} target="_blank" 
                 rel="noopener noreferrer" className="flex flex-col items-center w-full">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                  <img src={faviconURL(bookmark.url)} className="w-8 h-8 object-contain" alt={bookmark.name} />
                </div>
                <span className="mt-2 text-sm text-center truncate w-full">{bookmark.name}</span>
              </a>
              <MoreVertical size={20} 
                onClick={() => handleEditClick(bookmark.id)}
                className="
                    absolute top-1 right-0 text-gray-500 hidden group-hover:flex 
                    items-center justify-center rounded-full cursor-pointer
                    bg-transparent hover:bg-gray-400/50 transition-colors
                  " 
                />
            </div>
          ))}
          {/* 추가 버튼 */}
          <button onClick={handleAddClick} className="flex flex-col items-center w-20 p-2 rounded-lg transition hover:bg-gray-200">
            <div className="w-14 h-14 bg-[#9EEFFF] rounded-full flex items-center justify-center text-2xl">
              <Plus size={24} className="text-gray-700" />
            </div>
            <span className="mt-2 text-sm text-center">추가</span>
          </button>
        </div>

        <div className="flex items-center justify-center mt-3 space-x-3">
          {currentPage > 0 && (
            <Button onClick={() => handlePageChange(-1)} 
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 flex items-center px-3 py-2 rounded-full transition">
              <ChevronLeft size={20} />
            </Button>
          )}
          <span className="text-lg font-semibold text-gray-600 px-4">
            {currentPage + 1} / {Math.max(1, Math.ceil(filteredBookmarks.length / itemsPerPage))}
          </span>
          {(currentPage + 1) * itemsPerPage < filteredBookmarks.length && (
            <Button onClick={() => handlePageChange(1)} 
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 flex items-center px-3 py-2 rounded-full transition">
              <ChevronRight size={20} />
            </Button>
          )}
        </div>
      </div>

      {/* 북마크 추가 모달 */}
      <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)}>
        <h3 className="text-xl font-semibold mb-4">새로운 북마크 추가</h3>
        <input
          type="text"
          name="name"
          required
          placeholder="이름"
          value={newBookmark.name}
          onChange={handleNewBookmarkChange}
          className="border border-gray-300 p-2 rounded w-full mb-4"
        />
        <input
          type="text"
          name="url"
          required
          placeholder="URL"
          value={newBookmark.url}
          onChange={handleNewBookmarkChange}
          className="border border-gray-300 p-2 rounded w-full mb-4"
        />
        <div className="flex justify-end space-x-2">
          <Button onClick={() => setShowAddForm(false)} className="bg-gray-500 text-white py-2 px-4 rounded-full">취소</Button>
          <Button onClick={handleAddBookmark} className="bg-blue-500 text-white py-2 px-4 rounded-full">추가</Button>
        </div>
      </Modal>

      {/* 북마크 수정 모달 */}
      <Modal isOpen={showEditForm} onClose={() => setShowEditForm(false)}>
        <h3 className="text-xl font-semibold mb-4">북마크 수정</h3>
        <input
          type="text"
          name="name"
          required
          value={editedBookmark.name}
          onChange={handleEditInputChange}
          className="border border-gray-300 p-2 rounded w-full mb-4"
        />
        <input
          type="text"
          name="url"
          required
          value={editedBookmark.url}
          onChange={handleEditInputChange}
          className="border border-gray-300 p-2 rounded w-full mb-4"
        />
        <div className="flex justify-end space-x-2">
          <Button onClick={handleDeleteBookmark} 
            className="bg-red-500 text-white py-2 px-4 rounded-full shadow-md hover:bg-red-600 transition">삭제</Button>
          <Button onClick={() => setShowEditForm(false)} 
            className="border-[2px] border-cyan-500 text-cyan-600 py-2 px-4 rounded-full shadow-md 
              bg-white hover:bg-cyan-50 transition">취소</Button>
          <Button onClick={handleSaveEdit} 
            className="bg-cyan-600 text-white py-2 px-4 rounded-full shadow-md hover:bg-cyan-700 transition">저장</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Bookmark;