import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from "@/context/UserProvider";
import Modal from '@/components/Modal';
import { fetchGitlabMRs } from '@/api/api.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import gitlabLogo from "@/assets/gitlab.svg";

const GitLab = ({ isEditing, isBordered }) => {
  const { user, setUser } = useUser();
  const email = user?.profile?.email;

  const [allMrs, setAllMrs] = useState([]);
  const [mrs, setMrs] = useState([]);
  const [selectedMr, setSelectedMr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortKey, setSortKey] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / perPage);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetchGitlabMRs(email, currentPage, perPage);
        setAllMrs(res.mrs);
        setTotalCount(res.totalCount || res.total_count);
      } catch (err) {
        console.error(err);
        setError('데이터 로드 실패');
      } finally {
        setLoading(false);
      }
    };

    if (email) fetchData();
  }, [email, currentPage]);

  // 그룹/프로젝트 추출 함수
  const extractGroupFromPath = (full) => {
    if (!full) return '';
    const parts = full.split('/');
    return parts.slice(0, -1).join('/');
  };

  const extractProjectFromPath = (full) => {
    if (!full) return '';
    const parts = full.split('/');
    return parts.slice(-1)[0];
  };

  // 필터링
  const filteredMrs = useMemo(() => {
    return allMrs.filter((mr) => {
      const path = mr.displayProjectPath;
      const group = extractGroupFromPath(path);
      const project = extractProjectFromPath(path);

      const groupMatch = !selectedGroup || group === selectedGroup;
      const projectMatch = !selectedProject || project === selectedProject;

      return groupMatch && projectMatch;
    });
  }, [allMrs, selectedGroup, selectedProject]);

  // 페이지네이션
  useEffect(() => {
    const offset = (currentPage - 1) * perPage;
    const pageItems = filteredMrs.slice(offset, offset + perPage);
    setMrs(pageItems);
    setTotalCount(filteredMrs.length);
  }, [filteredMrs, currentPage]);

  // 정렬 수치
  const getSortValue = (mr, key) => {
    switch (key) {
      case 'title': return mr.title || '';
      case 'author': return mr.author?.username || '';
      case 'created_at': return mr.created_at || '';
      case 'project': return extractProjectFromPath(mr.displayProjectPath);
      case 'group': return extractGroupFromPath(mr.displayProjectPath);
      default: return '';
    }
  };

  // 정렬 적용
  const sortedMrs = useMemo(() => {
    if (!sortKey) return mrs;
    return [...mrs].sort((a, b) => {
      const valA = getSortValue(a, sortKey);
      const valB = getSortValue(b, sortKey);
      return String(valA).localeCompare(String(valB));
    });
  }, [mrs, sortKey]);

  const calcRelativeDate = (created_at) => {
    const created = new Date(created_at);
    const days = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
    return days === 0 ? 'today' : `${days} day${days > 1 ? 's' : ''} ago`;
  };

  if (loading) return <div>🔄 MR 불러오는 중...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (filteredMrs.length === 0)
    return <div className="text-gray-500">📭 해당 조건에 MR이 없습니다.</div>;

  return (
    <div className="item-style">
      <div style={{ pointerEvents: isEditing ? 'none' : 'auto' }}>
        {isBordered && <div className="item-header">
          <span className="flex justify-center items-center gap-2">
            <img src={gitlabLogo} alt="Gitlab" className="w-5 h-5" />
            <span>Gitlab</span>
          </span>
        </div>}

        {/* 필터 & 정렬 */}
        <div className="flex flex-wrap gap-4 items-center mb-3 text-sm">
          {/* 그룹 */}
          <div>
            <label className="mr-1">그룹:</label>
            <select
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                setSelectedProject('');
                setCurrentPage(1);
              }}
              className="border px-2 py-1 rounded"
            >
              <option value="">전체</option>
              {[
                ...new Set(
                  allMrs.map((mr) => extractGroupFromPath(mr.displayProjectPath))
                )
              ].filter(Boolean).map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {/* 프로젝트 */}
          <div>
            <label className="mr-1">프로젝트:</label>
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setCurrentPage(1);
              }}
              className="border px-2 py-1 rounded"
            >
              <option value="">전체</option>
              {[
                ...new Set(
                  allMrs
                    .filter((mr) =>
                      !selectedGroup || extractGroupFromPath(mr.displayProjectPath) === selectedGroup
                    )
                    .map(mr => extractProjectFromPath(mr.displayProjectPath))
                )
              ].filter(Boolean).map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>

          {/* 정렬 */}
          <div>
            <label className="mr-1">정렬:</label>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              <option value="">기본</option>
              <option value="created_at">생성일</option>
              <option value="title">제목</option>
              <option value="author">작성자</option>
              <option value="project">프로젝트</option>
              <option value="group">그룹</option>
            </select>
          </div>
        </div>

        {/* MR 목록 */}
        <div className="space-y-3">
          {sortedMrs.map((mr) => (
            <div
              key={mr.id}
              onClick={() => setSelectedMr(mr)}
              className="p-4 border bg-white rounded cursor-pointer hover:shadow-md transition"
            >
              <div className="flex justify-between">
                <div className="font-semibold text-sm text-gray-800 line-clamp-1">
                  [{extractProjectFromPath(mr.displayProjectPath)}] {mr.title}
                </div>
                <span className="text-yellow-700 text-xs px-2 py-0.5 bg-yellow-100 rounded">⏳ Opened</span>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img src={mr.author.avatar_url} className="w-5 h-5 rounded-full" alt="author" />
                  <span>
                    created {calcRelativeDate(mr.created_at)} by {mr.author.username}
                  </span>
                </div>
                <span className="text-gray-400">{mr.displayProjectPath}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        <div className="flex justify-end mt-3 gap-1 pr-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-3 py-1 text-sm rounded-full border ${
                p === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'
              } hover:bg-blue-50`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 상세보기 모달 */}
      <Modal isOpen={!!selectedMr} onClose={() => setSelectedMr(null)}>
        {selectedMr && (
          <>
            <h3 className="text-lg font-bold mb-4">🔍 Merge Request 상세</h3>
            <p><b>제목: </b> {selectedMr.title}</p>
            <div className="mb-3">
                <b>설명: </b>
                {selectedMr.description ? (
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        >
                        {selectedMr.description}
                    </ReactMarkdown>
                ) : (
                    <p className="text-sm text-gray-500">없음</p>
                )}
            </div>
            <p><b>작성자: </b> {selectedMr.author.username}</p>
            <p><b>프로젝트: </b> {selectedMr.displayProjectPath}</p>
            <p><b>생성일: </b> {selectedMr.created_at?.split('T')[0]}</p>
            <div className="mt-4 flex justify-end gap-2">
              <a
                href={selectedMr.web_url}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                🔗 GitLab에서 열기
              </a>
              <button
                onClick={() => setSelectedMr(null)}
                className="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded hover:bg-gray-100"
              >
                닫기
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default GitLab;