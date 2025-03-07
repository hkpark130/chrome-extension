import React, { useState } from 'react';
import './item.css';
import Modal from './Modal';

const Bookmark = ({ isEditing }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);  // 수정 폼 표시 여부
  const [editedBookmark, setEditedBookmark] = useState({ name: '', url: '' }); // 수정될 북마크 정보

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
      const updatedBookmarks = bookmarks.map(bookmark =>
        bookmark.id === editedBookmark.id ? editedBookmark : bookmark
      );
      saveBookmarks(updatedBookmarks);
      setShowEditForm(false);
      setEditedBookmark({ name: '', url: '' });
    }
  };

  const handleCancelEdit = () => {
    // 수정 취소
    setShowEditForm(false);
    setEditedBookmark({ name: '', url: '' });
  };

  return (
    <div
      className='item-style'
      style={{
        pointerEvents: isEditing ? "none" : "auto",
      }}
    >
      <p>Book</p>
      <button onClick={() => {handleEditClick(1);}} className="cancelSelectorName">zz</button>
      <Modal isOpen={showEditForm} onClose={() => setShowEditForm(false)}>
        <h3>책갈피 수정</h3>
        <p>이름을 입력하세요</p>
        <button onClick={() => setShowEditForm(false)}>취소</button>
      </Modal>
    </div>
  );
};

export default Bookmark;