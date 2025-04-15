import React, { useEffect, useState } from 'react';
import { useUser } from "@/context/UserProvider";
import Modal from "@/components/Modal";
import { fetchRedmineIssues } from '@/api/api.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import redmineLogo from "@/assets/redmine.png";

const Redmine = ({ isEditing, isBordered }) => {
  const { user, setUser } = useUser();
  const [issues, setIssues] = useState([]);       // 현재 페이지 이슈
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);

  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const perPage = 6;                                 // 페이지 당 몇개
  const [totalCount, setTotalCount] = useState(0);   // 전체 이슈 수
  const totalPages = Math.ceil(totalCount / perPage);

  const email = user?.profile?.email;
  const redmineBaseUrl = "https://issue.direa.synology.me";
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetchRedmineIssues(email, currentPage, perPage);
        setIssues(res.issues);
        setTotalCount(res.totalCount || res.total_count);
      } catch (err) {
        console.error(err);
        setError("데이터 로드 실패");
      } finally {
        setLoading(false);
      }
    };
  
    if (email) fetchData();
  }, [email, currentPage]);

  const sortedIssues = () => {
    if (!sortKey) return issues;
  
    return [...issues].sort((a, b) => {
      // 날짜 정렬
      if (sortKey === 'created_on' || sortKey === 'updated_on') {
        const dateA = a[sortKey] ? new Date(a[sortKey]) : new Date(0);
        const dateB = b[sortKey] ? new Date(b[sortKey]) : new Date(0);
        return dateB - dateA; // 최신순 정렬 (내림차순)
      }
  
      // 텍스트 필드 (status, priority, project 등)
      const aValue = a[sortKey]?.name || '';
      const bValue = b[sortKey]?.name || '';
      return aValue.localeCompare(bValue, 'ko');
    });
  };

  const getCreatedAgoLabel = (createdDate) => {
    if (!createdDate) return null;
  
    const daysPassed = Math.floor((Date.now() - new Date(createdDate)) / (1000 * 60 * 60 * 24));
  
    if (daysPassed >= 100) {
      return { icon: '🚨', label: `${daysPassed}일 지남`, className: 'text-red-600 font-bold' };
    }
  
    if (daysPassed >= 30) {
      return { icon: '⚠️', label: `${daysPassed}일 지남`, className: 'text-yellow-600 font-medium' };
    }
  
    if (daysPassed >= 7) {
      return { icon: '⏱️', label: `${daysPassed}일 지남`, className: 'text-gray-500' };
    }
  
    return null; // 7일 이하
  };

  const isPastDue = (dateStr, statusName) => {
    if (!dateStr || !statusName) return false;
    const completedStates = ["완료", "종료", "Closed", "Done"];
    if (completedStates.includes(statusName)) return false;
    const today = new Date().setHours(0, 0, 0, 0);
    const due = new Date(dateStr).setHours(0, 0, 0, 0);
    return due < today;
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case '완료': return 'bg-green-100 text-green-800';
      case '진행중': return 'bg-blue-100 text-blue-800';
      case '대기': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-200 text-gray-600';
    }
  };

  const handleClickIssue = (issue) => setSelectedIssue(issue);
  const closeModal = () => setSelectedIssue(null);

  if (loading) return <div>이슈 정보를 불러오는 중...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (issues.length === 0) return <div className="text-gray-500">📭 할당된 Redmine 이슈가 없습니다.</div>;

  return (
    <div className="item-style">
      <div style={{ pointerEvents: isEditing ? 'none' : 'auto' }}>
        {isBordered && <div className="item-header">
          <span className="flex justify-center items-center gap-2">
            <img src={redmineLogo} alt="Redmine" className="w-5 h-5" />
            <span>Redmine</span>
          </span>
        </div>}

        {/* 🔽 정렬 */}
        <div className="mb-1 text-sm flex items-center justify-end gap-2">
          <label className="text-gray-600">정렬:</label>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}
            className="border px-2 py-1 rounded text-sm">
            <option value="">기본</option>
            <option value="status">상태</option>
            <option value="priority">우선순위</option>
            <option value="project">프로젝트</option>
            <option value="created_on">생성일</option>
            <option value="updated_on">변경일</option>
          </select>
        </div>

        {/* 🔽 이슈 목록 */}
        <div className="space-y-1 overflow-auto max-h-[400px] pr-1">
          {sortedIssues().map((issue) => {
            const createdAgoLabel = getCreatedAgoLabel(issue.created_on);

            return (
              <div key={issue.id} onClick={() => handleClickIssue(issue)} 
                className={`p-3 border rounded-md shadow-sm cursor-pointer ${
                  isPastDue(issue.due_date, issue.status?.name)
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white'
                }`}>
                
                <div className="flex justify-between items-center text-sm text-gray-800 font-semibold">
                  <div className="flex gap-2 items-center overflow-hidden">
                    <span className="text-xs text-gray-500">#{issue.id}</span>
                    <span className="text-xs text-gray-700">[{issue.project?.name || ""}]</span>
                    <div className="truncate max-w-[200px]">{issue.subject}</div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {createdAgoLabel && (
                      <span className={`text-xs ${createdAgoLabel.className}`}>
                        {createdAgoLabel.icon} {createdAgoLabel.label}
                      </span>
                    )}
                    📅 {issue.created_on?.split("T")[0]}
                  </span>
                </div>            
              </div>
            );
          })}
        </div>

        {/* 🔽 페이지네이션 */}
        <div className="flex justify-end mt-2 space-x-1 pr-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-3 py-1 border rounded-full text-sm hover:bg-gray-50 ${
                currentPage === p ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 🔽 모달 */}
      <Modal isOpen={!!selectedIssue} onClose={closeModal}>
        {selectedIssue && (
          <>
            <h3 className="text-xl font-semibold mb-4">📝 이슈 상세 정보</h3>
            <div className="text-sm space-y-2 mb-4">
              <p><b>제목:</b> {selectedIssue.subject}</p>
              <div className="mb-3">
                  <b>설명: </b>
                  {selectedIssue.description ? (
                      <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                          >
                          {selectedIssue.description}
                      </ReactMarkdown>
                  ) : (
                      <p className="text-sm text-gray-500">없음</p>
                  )}
              </div>
              <p><b>상태:</b> {selectedIssue.status?.name}</p>
              <p><b>우선순위: </b> {selectedIssue.priority?.name}</p>
              <p><b>프로젝트: </b> {selectedIssue.project?.name}</p>
              <p><b>생성일: </b> {selectedIssue.created_on?.split("T")[0]}</p>
              <p><b>변경일: </b> {selectedIssue.updated_on?.split("T")[0]}</p>
              <p><b>시작일: </b> {selectedIssue.start_date || "없음"}</p>
              <p><b>마감일: </b> {selectedIssue.due_date || "없음"}</p>
            </div>
            <div className="flex justify-end space-x-2">
              <a href={`${redmineBaseUrl}/issues/${selectedIssue.id}`} target="_blank" rel="noopener noreferrer"
                 className="bg-blue-600 text-white py-2 px-4 rounded-full shadow-md hover:bg-blue-700 transition text-sm">
                🔗 Redmine에서 열기
              </a>
              <button onClick={closeModal}
                      className="border-[2px] border-gray-400 text-gray-700 py-2 px-4 rounded-full shadow-md bg-white hover:bg-gray-50 text-sm">
                닫기
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Redmine;