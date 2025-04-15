import React, { useState, useEffect, useRef } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Plus, Trash2, Pencil } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./item.css"; // 공통 스타일
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { saveTodolist, loadTodolist } from "@/api/api.js";
import { useUser } from "@/context/UserProvider";

const ResponsiveGridLayout = WidthProvider(Responsive);

const TodoGridList = ({ isEditing, isBordered }) => {
  const { user, setUser } = useUser();
  const userId = user?.profile?.sub;
  const [items, setItems] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTodolist, setNewTodolist] = useState({ id: "", subject: "" });
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);

  function useDebounce(value, delay = 800) {
    const [debounced, setDebounced] = useState(value);
  
    useEffect(() => {
      const timeout = setTimeout(() => {
        setDebounced(value);
      }, delay);
      return () => clearTimeout(timeout); // 타이머 초기화
    }, [value, delay]);
  
    return debounced;
  }
  const debouncedItems = useDebounce(items, 10);

  useEffect(() => {
    if (!user) return;
    loadTodolist(userId).then((data) => {
      setItems(data);
      setIsInitialLoadDone(true);
    });
  }, [user]);

  useEffect(() => {
    if (!isInitialLoadDone) return;
    if (debouncedItems.length < 1) return;
    saveTodolist(userId, debouncedItems);
  }, [debouncedItems]);
  
  // priority 순으로 정렬
  const sortedItems = [...items].sort((a, b) => a.priority - b.priority);

  const layout = sortedItems.map((item, index) => ({
    i: item.id,
    x: 0,
    y: index,
    w: 1,
    h: 1,
    static: false,
  }));

  const handleEditClick = (id) => {
    const itemToEdit = items.find((item) => item.id === id);
    if (itemToEdit) {
      setNewTodolist(itemToEdit);
      setShowEditForm(true);
    }
  };

  const handleAddClick = () => {
    setNewTodolist({ id: uuidv4(), subject: "" });
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
  
      if (updated.length === 0) {
        saveTodolist(userId, []);
      }
  
      return updated;
    });
  };

  const onLayoutChange = (newLayout) => {

    const newOrder = [...items].sort(
      (a, b) =>
        newLayout.find((l) => l.i === a.id)?.y -
        newLayout.find((l) => l.i === b.id)?.y
    );

    const updated = newOrder.map((item, index) => ({
      ...item,
      priority: index + 1,
    }));

    setItems(updated);
  };

  const handleNewTodolistChange = (e) => {
    const { name, value } = e.target;
    setNewTodolist((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditTodolist = () => {
    const updatedItems = items.map((item) =>
      item.id === newTodolist.id
        ? { ...item, subject: newTodolist.subject }
        : item
    );
    setItems(updatedItems);
    setShowEditForm(false);
    setNewTodolist({ id: "", subject: "" });
  };

  const handleAddTodolist = () => {
    const maxPriority = Math.max(0, ...items.map((item) => item.priority));

    const newItem = {
      ...newTodolist,
      id: uuidv4(),
      subject: newTodolist.subject.trim(),
      checked: false,
      priority: maxPriority + 1,
    };

    setItems((prev) => [...prev, newItem]);
    setShowAddForm(false);
    setNewTodolist({ id: "", subject: "" });
  };

  const handleToggleCheckbox = (id) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(updatedItems);
  };

  return (
    <div className="item-style">
      <div style={{ pointerEvents: isEditing ? "none" : "auto" }}>
        {isBordered && (
          <div className="item-header text-center">✅ TODO 리스트</div>
        )}
        <div className="pb-[55px]">
          <ResponsiveGridLayout
            className="layout overflow-x-hidden"
            draggableCancel=".cancelSelectorName"
            layout={layout}
            cols={{ lg: 1, md: 1, sm: 1, xs: 1, xxs: 1 }}
            rowHeight={50}
            onLayoutChange={onLayoutChange}
            isResizable={false}
            useCSSTransforms={true}
          >
            {sortedItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border p-2 shadow-sm rounded-lg flex items-center justify-between overflow-hidden transition cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleToggleCheckbox(item.id)}
                    className="cancelSelectorName form-checkbox accent-indigo-500 w-5 h-5"
                  />
                  <label className="select-none cursor-pointer">
                    <span
                      className={`flex-1 text-base ${
                        item.checked
                          ? "line-through text-gray-400"
                          : "text-gray-800"
                      }`}
                    >
                      {item.subject}
                    </span>
                  </label>
                </div>
                {item.checked ? (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 rounded hover:bg-red-100 transition shrink-0"
                  >
                    <Trash2
                      size={18}
                      className="cancelSelectorName text-red-400"
                    />
                  </button>
                ) : (
                  <button
                    onClick={() => handleEditClick(item.id)}
                    className="p-1 rounded hover:bg-gray-200 transition shrink-0"
                  >
                    <Pencil
                      size={18}
                      className="cancelSelectorName text-black"
                    />
                  </button>
                )}
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>

        {/* 추가 버튼 */}
        <div className="fixed bottom-4 right-6 z-50">
          <button
            onClick={handleAddClick}
            className="icon-button flex items-center justify-center w-10 h-10 rounded-full shadow-md bg-indigo-500 hover:bg-indigo-600 transition"
          >
            <Plus size={26} className="text-white" />
          </button>
        </div>

        {/* 추가 모달 */}
        <Modal isOpen={showAddForm} onClose={() => setShowAddForm(false)}>
          <h3 className="text-xl font-semibold mb-4">새 할 일 추가</h3>
          <input
            type="text"
            name="subject"
            required
            placeholder="제목"
            value={newTodolist.subject}
            onChange={handleNewTodolistChange}
            className="border border-gray-300 p-2 rounded w-full mb-4"
          />
          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded-full"
            >
              취소
            </Button>
            <Button
              onClick={handleAddTodolist}
              disabled={!newTodolist.subject.trim()}
              className="border-[2px] hover:bg-cyan-200 bg-white text-black py-2 px-4 rounded-full"
            >
              추가
            </Button>
          </div>
        </Modal>

        {/* 수정 모달 */}
        <Modal isOpen={showEditForm} onClose={() => setShowEditForm(false)}>
          <h3 className="text-xl font-semibold mb-4">투두리스트 수정</h3>
          <input
            type="text"
            name="subject"
            required
            placeholder="제목"
            value={newTodolist.subject}
            onChange={handleNewTodolistChange}
            className="border border-gray-300 p-2 rounded w-full mb-4"
          />
          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => setShowEditForm(false)}
              className="bg-gray-500 text-white py-2 px-4 rounded-full"
            >
              취소
            </Button>
            <Button
              onClick={handleEditTodolist}
              disabled={!newTodolist.subject.trim()}
              className="border-[2px] hover:bg-cyan-200 bg-white text-black py-2 px-4 rounded-full"
            >
              저장
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default TodoGridList;