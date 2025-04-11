import React, { useState, useEffect } from 'react';
import { Pencil, Save } from 'lucide-react';
import './item.css';
import { getMemo, saveMemo } from "@/api/api.js";
import { useAuth } from "react-oidc-context";

const Memo = ({ isEditing, isBordered }) => {
  const auth = useAuth();
  const userId = auth.user?.profile?.sub;
  const [isWriting, setIsWriting] = useState(false);
  const [memoText, setMemoText] = useState("");
  const [editedText, setEditedText] = useState(memoText);

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchMemo();
    }
  }, [auth.isAuthenticated]);

  const fetchMemo = async () => {
    try {
      const response = await getMemo(userId);
      setMemoText(response.data.data.content || "");
      setEditedText(response.data.data.content || "");
    } catch (error) {
      console.error("메모 불러오기 실패:", error);
    }
  };

  const handleEditClick = () => {
    setIsWriting(true);
  };

  const handleSaveClick = async () => {
    try {
      await saveMemo({
        userId: userId,
        content: editedText,
      });
      setMemoText(editedText);
      setIsWriting(false);
    } catch (error) {
      console.error("메모 저장 실패:", error);
    }
  };

  return (
    <div className="item-style">
        <div 
            style={{
                pointerEvents: isEditing ? "none" : "auto", // 편집 모드일 때 위젯 이동 금지(이거 스크롤도 안 됨)
            }}>
        {isBordered && <div className="item-header">📝 메모장</div>}
        <div className="pb-[60px]">
            {isWriting ? (
            <textarea
                className="w-full border p-2 text-sm text-gray-700 resize-y focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows="5"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
            />
            ) : (
            <div className="whitespace-pre-wrap text-sm text-gray-800 text-left">
                {memoText || "메모가 없습니다."}
            </div>
            )}
        </div>
        <div className="fixed bottom-4 right-4 z-50">
          {isWriting ? (
            <button onClick={handleSaveClick} className="icon-button save-button flex 
            border-[2px] border-black-500 text-black-600 py-2 px-4 rounded-full shadow-md 
                  bg-white hover:bg-gray-100 transition space-x-2
            ">
              <Save size={20} className="flex-col h-full"/> 
              <span className="flex-col">저장</span>
            </button>
          ) : (
            <button onClick={handleEditClick} className="icon-button edit-button flex
            border-[2px] border-black-500 text-black-600 py-2 px-4 rounded-full shadow-md 
                  bg-white hover:bg-gray-100 transition space-x-2
            ">
              <Pencil size={20} className="flex-col h-full"/> 
              <span className="flex-col ">편집</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Memo;