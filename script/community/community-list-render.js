import { communityArr } from "../text/community-text.js";
import "../components/community-card.js";

// view type
let currentViewType = "list"; // 기본값 : 리스트형
const cardBtn = document.getElementById("card-btn");
const listBtn = document.getElementById("list-btn");
// filter
const filterBtns = document.querySelectorAll(".filter-wrap a");
const searchConditions = document.querySelector(".search-conditions");
// 필터 초기화
const filterReset = document.querySelector(".filter-reset");
console.log(filterReset);

// 검색 버튼
const searchBtn = document.querySelector(".search-btn");
// 입력한 검색어
const searchText = document.querySelector(".search-wrap input");



// 리스트 화면 전환
listBtn.addEventListener("click", () => {
  currentViewType = "list";
  renderCommunityList(1);
  renderPagination(1);
});
cardBtn.addEventListener("click", () => {
  currentViewType = "card";
  renderCommunityList(1);
});

// 검색 버튼
searchBtn.addEventListener("click", ()=>{
  // 필터 적용된 배열 가져오기
  const filterArray = getFilteredCommunityList();
  
  // input 에서 text 가져오기

  if(searchText.value === "" || searchText.value === null){
    alert("검색어를 입력해주세요");
    return;
  }

  let searchArray = filterArray.filter((item)=>item.title && item.title.toLowerCase().includes(searchText.value));

  // 해당 되는 값 찾아서 화면에 뿌리기
  // 정렬 조건 가져오기 
  const sortedFilter = getCurrentSortType();
  // 필터 & 정렬 적용
  const sortedArr = filterAndSort(searchArray, sortedFilter);
  // 리스트 렌더링
  renderCommunityList(1, sortedArr);
  // 페이징 렌더링
  renderPagination(1);
  
});

//--------------- 필터 관련 함수 ----------------//
// 1. 필터 초기화
filterReset.addEventListener("click", () => {
  while (searchConditions.children.length > 2) {
    searchConditions.removeChild(searchConditions.lastElementChild);
  }

  filterBtns.forEach(btn => {
    if (btn.classList.contains("btn-active")) {
      btn.classList.remove("btn-active");
    }
  });

  // 정렬 조건
  const sortedArr = filterAndSort(communityArr, null);
  // 리스트 렌더링
  renderCommunityList(1, sortedArr);
  // 페이징 렌더링
  renderPagination(1);
});

// 2. 필터 적용된 배열 반환
function getFilteredCommunityList() {
  // 사용자가 선택한 필터들을 가져오기
  const filters = getSelectedFilters();

  // 필터가 하나도 선택되지 않았다면, 원본 전체 배열 communityArr 반환
  if (Object.keys(filters).length === 0) return communityArr;
  // 필터조건에 맞는 배열들을 반환
  return communityArr.filter(item => {
    for (const key in filters) {
      if (!filters[key].includes(item[key])) return false;
    }
    return true;
  });
}

// 3. 선택한 필터 정보 수집
function getSelectedFilters() {
  const selected = document.querySelectorAll(".search-conditions .search-filter-active");
  const filters = {};

  selected.forEach(el => {
    const text = el.textContent.trim();
    const btn = Array.from(filterBtns).find(b => b.textContent.trim() === text);

    if (btn) {
      const type = btn.dataset.filterType;
      if (!filters[type]) filters[type] = [];
      filters[type].push(text);
    }
  });
  return filters;
}

// 4. 정렬 필터 정보 반환
function getCurrentSortType() {
  // 정렬 필터 정보 반환, 없으면 null 반환
  const activeSort = document.querySelector('ul.array a[data-filter-type="sort"].btn-active');
  return activeSort != null ? activeSort.textContent.trim() : null;
}

// 5. 정렬 조건 처리
function filterAndSort(array, filterType) {
  if (filterType === null) {
    return array.slice().sort((a, b) => b.id - a.id);
  }

  switch (filterType) {
    case "최신순": // writeDate가 빠른 순 (즉, 최신이 먼저면 내림차순)
      array.sort((a, b) => new Date(b.writeDate) - new Date(a.writeDate));
      break;
    case "인기순": // comment 많은 순 (내림차순)
      array.sort((a, b) => b.comment - a.comment);
      break;
    case "스크랩순": // scrap 많은 순 (내림차순)
      array.sort((a, b) => b.scrap - a.scrap);
      console.log("스크랩순", array);
      break;
    case "종료임박순": // recruitmentEndDate가 가까운 순 (오름차순)
      array.sort((a, b) => new Date(a.recruitmentEndDate) - new Date(b.recruitmentEndDate));
      break;
    default:
      // 정렬하지 않을 경우
      break;
  }
  return array;
}

// 필터 요소별 style
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const filterName = btn.textContent.trim();
    const isSortFilter = btn.closest(".array");

    // 정렬 필터는 다중 선택 불가능
    if (isSortFilter) {
      // TODO : 이부분 
      const sortFilters = isSortFilter.querySelectorAll("a");
      const isAlreadyActive = btn.classList.contains("btn-active");

      // 모든 정렬 버튼 비활성화
      sortFilters.forEach(f => f.classList.remove("btn-active"));

      // searchConditions에서 기존 정렬 조건 제거
      Array.from(searchConditions.children).forEach(child => {
        sortFilters.forEach(filter => {
          if (child.textContent.trim() === filter.textContent.trim()) {
            child.remove();
          }
        });
      });

      // 이미 선택된 정렬 필터를 다시 클릭한 경우 -> 해제만 하고 끝
      if (isAlreadyActive) {
        return;
      }

      // 새 정렬 필터 활성화
      btn.classList.add("btn-active");

      // 새로운 조건 추가
      const liTag = document.createElement("li");
      const aTag = document.createElement("a");

      aTag.textContent = filterName;
      aTag.classList.add("search-filter-active");
      aTag.href = "#";

      liTag.appendChild(aTag);
      searchConditions.appendChild(liTag);

      // X 버튼 클릭시 정렬 버튼 비활성화 + 제거
      liTag.addEventListener("click", () => {
        sortFilters.forEach(filter => {
          if (filter.textContent.trim() === filterName) {
            filter.classList.remove("btn-active");
          }
        });
        liTag.remove();
      });
    } else {
      // 다중 선택 필터 처리
      const matchedFilter = Array.from(searchConditions.children).find(
        child => child.textContent.trim() === filterName
      );

      if (btn.classList.contains("btn-active")) {
        btn.classList.remove("btn-active");

        if (matchedFilter) {
          matchedFilter.remove();
        }
      } else {
        btn.classList.add("btn-active");

        if (!matchedFilter) {
          const liTag = document.createElement("li");
          const aTag = document.createElement("a");

          aTag.textContent = filterName;
          aTag.classList.add("search-filter-active");
          aTag.href = "#";

          liTag.appendChild(aTag);
          searchConditions.appendChild(liTag);

          liTag.addEventListener("click", () => {
            filterBtns.forEach(filter => {
              if (filter.textContent.trim() === filterName) {
                filter.classList.remove("btn-active");
              }
            });
            liTag.remove();
          });
        }
      }
    }
    // 필터 적용 후 리스트 렌더링으로 변경
    const filterArray = getFilteredCommunityList();
    // 정렬 조건 가져오기 
    const sortedFilter = getCurrentSortType();

    // 검색 내용이 있다면 적용 없다면 그대로 다시 반환
    if(searchText.value === "" || searchText.value === null){
      console.log("searchText.value", searchText.value);
      const sortedArr = filterAndSort(filterArray, sortedFilter);
      renderCommunityList(1, sortedArr);
    }else{
      let searchArray = filterArray.filter((item)=>item.title && item.title.toLowerCase().includes(searchText.value));
      // 필터 & 정렬 적용
      const sortedArr = filterAndSort(searchArray, sortedFilter);
      renderCommunityList(1, sortedArr);
    }
  });
});

// 화면 렌더링 
// 리스트 화면 렌더링
function renderCommunityList(page = 1, filteredArr) {
  const container = document.getElementById("contnet-view");
  const pagination = document.querySelector(".pagination");
  if (!container) return;

  container.innerHTML = "";
  pagination.innerHTML = "";

  // 필터 결과가 있으면 그걸 쓰고, 없으면 원본 communityArr 사용
  const useArr = filteredArr && filteredArr.length > 0 ? filteredArr : communityArr;
  const filters = getSelectedFilters();
  const isFilterActive = Object.keys(filters).length > 0;

  // 정렬 필터 정보 조회
  const sortedFilter = getCurrentSortType();
  const sortedArr = filterAndSort(useArr, sortedFilter);
  console.log(sortedArr);

  const itemsPerPage = 10;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = sortedArr.slice(startIndex, endIndex);

  // 필터와 맞는 조건의 내용이 없다면 화면을 지운다
  if (isFilterActive && filteredArr && filteredArr.length === 0 && sortedFilter === null) {
    container.innerHTML = "";
    pagination.innerHTML = "";
    return;
  }

  if (currentViewType === "list") {
    // 리스트형 그리기
    // TODO : 컴포넌트로 전환
    pageItems.forEach(item => {
      const aTag = document.createElement("a");
      aTag.classList.add("content-link");
      aTag.innerHTML = `
        <div class="content-wrap">
          <div class="content-header">
            <div class="left-group">
              <div class="title">${item.title}</div>
              <div class="field">${item.field || ""}</div>
            </div>
            <div class="right-group">
              <div class="type">${item.type}</div>
              <div class="d-day">D-${item.dDay}</div>
            </div>
          </div>
          <div class="content-summary">
            <p>${item.content}</p>
          </div>
          <div class="content-footer">
            <div class="left-group">
              <div class="writer">${item.writer}</div>
            </div>
            <div class="right-group">
              <div class="comment"><i></i><span>${item.comment}</span></div>
              <div class="scrap"><i></i><span>${item.scrap}</span></div>
            </div>
          </div>
        </div>
      `;
      titlePoint(aTag);
      scrap(aTag);
      moveContent(aTag, item);
      container.appendChild(aTag);
    });
    chanageViewCss(container);
  } else {
    console.log(currentViewType);
    // 카드형 그리기
    sortedArr.forEach(item => {
      const communityCard = document.createElement("community-card");
      communityCard.setAttribute("communityfield", item.field);
      communityCard.setAttribute("communitytype", item.type);
      communityCard.setAttribute("day", item.dDay);

      communityCard.setAttribute("communitytitle", item.title);
      communityCard.setAttribute("communitysummary", item.content);
      communityCard.setAttribute("communitywriter", item.writer);
      communityCard.setAttribute("communitycomments", item.comment);
      communityCard.setAttribute("communityscraps", item.scrap);
      container.appendChild(communityCard);

      const observer = new MutationObserver(() => {
        const aTag = communityCard.shadowRoot?.querySelector(".card-content-link");
        if (aTag) {
          scrap(aTag);
          titlePoint(aTag);
          moveContent(aTag, item);
          observer.disconnect();
        }
      });
      observer.observe(communityCard.shadowRoot, { childList: true, subtree: true });
    });
    chanageViewCss(container);
  }
}

// view별 css 처리
function chanageViewCss(container) {
  if (currentViewType === "list") {
    container.classList.remove("card-view");
    container.classList.add("content-list");
  } else {
    container.classList.remove("content-list");
    container.classList.add("card-view");
  }
}

// 스크랩 이벤트
function scrap(aTag) {
  const scrap = aTag.querySelector(".scrap i");
  scrap.addEventListener("click", () => {
    scrap.classList.toggle("scrap-active");
  });
}

// 마우스 오버시 style 변경
function titlePoint(aTag) {
  const title = aTag.querySelector(".title");
  aTag.addEventListener("mouseover", () => {
    title.classList.add("point");
  });
  aTag.addEventListener("mouseout", () => {
    title.classList.remove("point");
  });
}

// 리스트 컴포넌트 클릭시 상세 화면 이동
function moveContent(aTag, item) {
  aTag.addEventListener("click", e => {
    console.log(`${item.id}`);
    e.preventDefault();
    window.location.href = `./community-content.html?id=${item.id}`;
  });
}

// 페이징 렌더링
function renderPagination(currentPage = 1) {
  const isMobile = window.innerWidth <= 768;
  const maxVisiblePages = isMobile ? 5 : 10;
  const itemsPerPage = 10;
  const totalItems = communityArr.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const pagination = document.querySelector(".pagination");
  if (!pagination) return;

  pagination.innerHTML = "";

  // 왼쪽 화살표
  const leftLi = document.createElement("li");
  const leftI = document.createElement("i");
  leftI.classList.add("left-arrow");
  leftLi.appendChild(leftI);
  if (currentPage > 1) {
    leftLi.addEventListener("click", () => {
      renderCommunityList(currentPage - 1);
      renderPagination(currentPage - 1);
    });
  }
  pagination.append(leftLi);

  // 시작 페이지 계산
  const startPage = Math.floor((currentPage - 1) / maxVisiblePages) * maxVisiblePages + 1;
  const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

  for (let i = startPage; i <= endPage; i++) {
    const li = document.createElement("li");
    li.textContent = i;
    if (i === currentPage) li.classList.add("active");
    li.addEventListener("click", () => {
      renderCommunityList(i);
      renderPagination(i);
    });
    pagination.appendChild(li);
  }

  // 오른쪽 화살표
  const rightLi = document.createElement("li");
  const rightI = document.createElement("i");
  rightI.classList.add("right-arrow");
  rightLi.appendChild(rightI);
  if (currentPage < totalPages) {
    rightLi.addEventListener("click", () => {
      renderCommunityList(currentPage + 1);
      renderPagination(currentPage + 1);
    });
  }
  pagination.append(rightLi);
}

function handleResize() {
  const mobileBreakpoint = 768;
  if(window.innerWidth <= mobileBreakpoint && currentViewType !== 'list'){
    currentViewType = 'list';
    renderCommunityList(1);
    renderPagination(1);
  } else if(window.innerWidth > mobileBreakpoint && currentViewType !== 'card'){
    currentViewType = 'card';
    renderCommunityList(1);
  }
}

handleResize();

window.addEventListener('resize', handleResize);

// 윈도우 최초 로드
window.addEventListener("DOMContentLoaded", () => {
  currentViewType = "list";
  renderCommunityList(1);
  renderPagination(1);
});
