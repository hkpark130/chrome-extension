import React, { useState, useEffect } from 'react';
import './item.css';

const TopSite = ({ isEditing }) => {
  const [topSites, setTopSites] = useState([]);

  useEffect(() => {
    // Chrome의 topSites API에서 자주 방문한 사이트 가져오기
    if (chrome.topSites) {
      chrome.topSites.get((sites) => {
        setTopSites(sites.slice(0, 6)); // 최대 6개만 표시
      });
    }
  }, []);

  const faviconURL = (u) => {
    const url = new URL(chrome.runtime.getURL("/_favicon/"));
    url.searchParams.set("pageUrl", u);
    url.searchParams.set("size", "32");
    return url.toString();
  };

  return (
    <div
      className='item-style'
    >
      <div 
      style={{
        pointerEvents: isEditing ? "none" : "auto", // 편집 모드일 때 위젯 이동 금지(이거 스크롤도 안 됨)
      }}>
        <div className="item-header">자주 방문한 사이트</div>
        <div className="flex justify-center gap-4 flex-wrap">
          {topSites.map((site, index) => (
            <a 
              key={index} 
              href={site.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex flex-col items-center w-20 p-2 rounded-lg transition hover:bg-gray-200"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                <img src={faviconURL(site.url)} className="w-8 h-8 object-contain" alt={site.title} />
              </div>
              <span className="mt-2 text-sm text-center truncate w-full">{site.title}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopSite;