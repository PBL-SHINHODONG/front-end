import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import KakaoMap from "./KakaoMap";
import axios from "axios";
import "./MainPage.css";
import Modal from "./Modal.js";
import RouteModal from "./RouteModal.js";
import useGeolocation from "./hooks/useGeolocation";

function MainPage({ loggedInUser, handleLogout }) {
  const [places, setPlaces] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [visitCounts, setVisitCounts] = useState({});
  const [markers, setMarkers] = useState([]);
  const location = useGeolocation();
  const [selectedPosition, setSelectedPosition] = useState({
    latitude: 35.8714354,
    longitude: 128.601445,
  });
  const navigate = useNavigate();
  const [polylinePath, setPolylinePath] = useState([]);
  const [isLogin, setIsLogin] = useState(false);
  const [userId, setUserId] = useState(0);
  const [showSelect, setShowSelect] = useState(false);
  const [NotVisit, setNotVisit] = useState(false);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("option1");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [routeResult, setRouteResult] = useState({});
  const [menus, setMenus] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [keywordResult, setKeywordResult] = useState([]);
  const [placeId, setPlaceId] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { kakao } = window;
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    place: null,
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isFetchRoute, setIsFetchRoute] = useState(false);
  const [routeCourse, setRouteCourse] = useState([]);
  const [routeKeyword, setRouteKeyword] = useState("");
  const [routeKeywordResult, setRouteKeywordResult] = useState([]);
  const [courseCoordinates, setCourseCoordinates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(false);
  const searchTimeout = useRef();

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const subCategories = {
    food: [
      { value: "한식", label: "한식" },
      { value: "일식", label: "일식" },
      { value: "중식", label: "중식" },
      { value: "양식", label: "양식" },
      { value: "아시아식", label: "아시아식" },
      { value: "주점", label: "주점" },
      { value: "미분류", label: "기타" },
    ],
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleContextMenu = useCallback((event, place) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      place,
    });
  }, []);

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, place: null });
  };

  useEffect(() => {
    const handleClickOutside = () => closeContextMenu();
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      setIsLogin(true);
      setUserId(loggedInUser.id);
    } else {
      navigate("/");
    }
  }, [loggedInUser]);

  const handleSearch = (e) => {
    const value = e.target.value;

    setKeyword(value);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchValue(value);
    }, 1000);
  };

  const isKeyWordNow = (type) =>
    type === keyword ? keyword.trim() !== "" : routeKeyword.trim() !== "";

  const searchValue = async (keyword) => {
    try {
      const response = await axios.get(
        `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/search/${keyword}?page=1&size=20`
      );
      if (response.data.detail === "Search not found") return;
      const data = await response.data.items;
      const result = data.map((item) => ({
        id: item.place_id,
        name: item.place_name.includes(keyword)
          ? item.place_name
          : `${item.menu_name} / ${item.place_name}`,
      }));
      setPlaceId(result.place_id);
      const res = [];
      result.forEach((item) => {
        if (!res.some((r) => r.id === item.id)) {
          res.push(item);
        }
      });
      setKeywordResult(res);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRouteSearch = async (keyword) => {
    try {
      const response = await axios.get(
        `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/search/${keyword}?page=1&size=20`
      );
      if (response.data.detail === "Search not found") return;
      const data = await response.data.items;
      const result = data.map((item) => ({
        id: item.place_id,
        name: item.place_name.includes(keyword)
          ? item.place_name
          : `${item.menu_name} / ${item.place_name}`,
      }));
      setPlaceId(result.place_id);
      const res = [];
      result.forEach((item) => {
        if (!res.some((r) => r.id === item.id)) {
          res.push(item);
        }
      });
      setRouteKeywordResult(res);
    } catch (error) {
      console.error(error);
    }
  };

  const RelatedSearchItem = React.memo(({ item, onClick }) => {
    return (
      <div
        className={
          isMobile ? "mobile-related-search-item" : "related-search-item"
        }
        tabIndex="0"
        onMouseDown={(e) => {
          e.preventDefault();
          onClick(item.id);
        }}
      >
        {item.name}
      </div>
    );
  });
  const handleRouteCourse = (course) => {
    setRouteCourse((prev) => [
      ...prev,
      { courseId: course.id, courseName: course.name },
    ]);
    closeModal();
  };
  const max = (a, b) => {
    return Math.max(a, b);
  };
  const handleFetchData = async (selectedOption) => {
    if (isFetching) return;
    setPolylinePath();
    setIsFetching(true);
    setShowSelect(true);
    setIsFetchRoute(false);
    const url =
      selectedOption === "option3"
        ? `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/places/?sort_by=review_count&order=desc&page_size=10&page=1&size=50`
        : selectedOption === "option2"
        ? `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/places/?sort_by=score&order=asc&page_size=10&page=1&size=50`
        : `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/places/?sort_by=name&order=asc&page_size=10&page=1&size=50`;
    try {
      const response = await axios.get(url);
      const data = await response.data.items.slice(0, 50);
      const result = data.map((item) => {
        const naverScore = item.naver_info?.score;
        const kakaoScore = item.kakao_info?.score;
        const averageScore =
          naverScore && kakaoScore
            ? parseFloat(((naverScore + kakaoScore) / 2).toFixed(2))
            : naverScore || kakaoScore || null;
        const naverReview = item.naver_info?.review_count;
        const kakaoReview = item.kakao_info?.review_count;
        const MaxReview =
          naverReview && kakaoReview
            ? max(naverReview, kakaoReview)
            : naverReview || kakaoReview || null;
        return {
          id: item.basic_info.id,
          name: item.basic_info.name,
          address: item.basic_info.address,
          latitude: item.basic_info.LatLng.latitude,
          longitude: item.basic_info.LatLng.longitude,
          score: averageScore,
          review_count: MaxReview,
        };
      });
      setPlaces(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const openPlaceModal = (place) => {
    setSelectedPlace(place);
    setIsPlaceModalOpen(true);
    handleReview(place.id);
    handleMenu(place.id);
  };
  const closePlaceModal = () => {
    setIsPlaceModalOpen(false);
    setSelectedPlace(null);
  };

  const openModal = () => {
    setIsRouteModalOpen(true);
  };
  const closeModal = () => {
    setIsRouteModalOpen(false);
  };

  const handleCourse = () => {
    setIsFetchRoute(true);
  };

  const fetchRoute = async () => {
    const coordinatePromises = routeCourse.map(async (course) => {
      const course_id = course.courseId;
      const response = await axios.get(
        `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/places/${course_id}`
      );
      const name = response.data.basic_info.name;
      const course_lat = response.data.basic_info.LatLng.latitude;
      const course_lng = response.data.basic_info.LatLng.longitude;

      return { name, lat: course_lat, lng: course_lng };
    });

    const coordinates = await Promise.all(coordinatePromises);
    setCourseCoordinates(coordinates);
    const API_KEY = process.env.REACT_APP_API_KEY;
    const url = "https://apis-navi.kakaomobility.com/v1/waypoints/directions";

    const start = {
      x: coordinates[0].lng,
      y: coordinates[0].lat,
      label: coordinates[0].name,
    };

    const end = {
      x: coordinates[coordinates.length - 1].lng,
      y: coordinates[coordinates.length - 1].lat,
      label: coordinates[coordinates.length - 1].name,
    };

    if (start.x && start.y) {
      setSelectedPosition({
        latitude: start.y,
        longitude: start.x,
      });
    }

    const waypoints = coordinates.slice(1, -1).map((course, index) => ({
      x: course.lng,
      y: course.lat,
      label: course.name || `경유지 ${index + 1}`,
    }));
    const markers = [
      { latitude: start.y, longitude: start.x, label: start.label },
      { latitude: end.y, longitude: end.x, label: end.label },
      ...waypoints.map((waypoint) => ({
        latitude: waypoint.y,
        longitude: waypoint.x,
        label: waypoint.label,
      })),
    ];
    const headers = {
      Authorization: `KakaoAK ea3716f48547bc77366bfe1ebf20cbc8`,
      "Content-Type": "application/json",
    };

    const body = {
      origin: { x: start.x, y: start.y },
      destination: { x: end.x, y: end.y },
      waypoints: waypoints.map((point) => ({ x: point.x, y: point.y })),
      priority: "RECOMMEND",
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const tax = data.routes[0].summary.fare.taxi;
      const toll = data.routes[0].summary.fare.toll;
      const distance = data.routes[0].summary.distance;
      const duration_min = Math.ceil(data.routes[0].summary.duration / 60);
      const duration_sec = data.routes[0].summary.duration % 60;
      const result = { tax, toll, distance, duration_min, duration_sec };
      setRouteResult(result);

      if (!data.routes || data.routes.length === 0) {
        console.error("No routes available in the response");
        return;
      }

      const routePath = [];
      data.routes[0].sections.forEach((section) => {
        section.roads.forEach((road) => {
          const { vertexes } = road;
          for (let i = 0; i < vertexes.length; i += 2) {
            routePath.push(new kakao.maps.LatLng(vertexes[i + 1], vertexes[i]));
          }
        });
      });
      setMarkers(markers);
      setPolylinePath(routePath);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);
    handleFetchData(value);
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  const handleClick = (x, y) => {
    setSelectedPosition({ latitude: x, longitude: y });
  };

  const handleKeywordClick = async (placeId) => {
    try {
      const response = await axios.get(
        `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/places/${placeId}`
      );
      const data = response.data.basic_info;
      const place = {
        id: data.id,
        name: data.name,
        latitude: data.LatLng.latitude,
        longitude: data.LatLng.longitude,
      };
      handleClick(place.latitude, place.longitude);
      setKeyword(place.name);
      openPlaceModal(place);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFavorite = async () => {
    try {
      setPlaces([]);
      setShowSelect(false);
      setPolylinePath();
      setIsFetchRoute(false);
      const response = await axios.get(
        `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/visited_places/${userId}?page=1&size=50`
      );
      const data = response.data.items;
      const result = data.map((item) => {
        const naverScore = item.naver_info?.score;
        const kakaoScore = item.kakao_info?.score;
        const averageScore =
          naverScore && kakaoScore
            ? parseFloat(((naverScore + kakaoScore) / 2).toFixed(2))
            : naverScore || kakaoScore || null;

        return {
          id: item.basic_info.id,
          name: item.basic_info.name,
          address: item.basic_info.address,
          latitude: item.basic_info.LatLng.latitude,
          longitude: item.basic_info.LatLng.longitude,
          score: averageScore,
          review_count: item.kakao_info?.review_count || 0,
        };
      });
      setPlaces(result);
      const initialVisitCounts = {};
      result.forEach((place) => {
        initialVisitCounts[place.id] = place.visit_count || 0;
      });
      setVisitCounts(initialVisitCounts);
    } catch (error) {
      if (error.response) {
        const errorMessage = JSON.parse(error.response.request.response);
        if (errorMessage.detail === "No visited places found for this user") {
          setPlaces([]);
          setNotVisit(true);
        } else {
          console.error("Error:", errorMessage.detail);
        }
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handleFavoriteClick = async (placeId) => {
    try {
      setShowSelect(false);
      const info = {
        place_id: placeId,
        user_id: userId,
      };
      const response = await axios.post(
        `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/visited_places/visit`,
        info,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const updatedCount = response.data.visit_count;
      setVisitCounts((prevCounts) => ({
        ...prevCounts,
        [placeId]: updatedCount,
      }));
    } catch (error) {
      console.error("Error posting visit:", error);
    }
  };

  const handleReview = async (place_id) => {
    try {
      const url = `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/reviews/${place_id}?page=1&size=50`;
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.detail === "review not found") {
        setReviews([]);
      } else {
        const data = response.data.items;
        setReviews(data);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setReviews([]);
      } else {
        console.error("Error getting reviews:", error);
      }
    }
  };
  const handleMenu = async (place_id) => {
    try {
      const url = `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/menus/${place_id}?page=1&size=50`;
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.detail === "menus not found") {
        setMenus([]);
      } else {
        const data = response.data.items;
        setMenus(data);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setMenus([]);
      } else {
        console.error("Error getting menus:", error);
      }
    }
  };

  const removeRouteCourse = (index) => {
    setRouteCourse((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRecommendSimilarPlace = async (selectedCategory) => {
    try {
      const response = await axios.post(
        `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/places/recommend/content/${selectedCategory}?page=1&size=50`,
        {
          user_id: userId,
          latitude: location.coordinates.lat,
          longitude: location.coordinates.lng,
          top_n: 10,
        }
      );
      const data = response.data.items;
      const result = data.map((item) => {
        const name = item.basic_info.name;
        const id = item.basic_info.id;
        return { name, id };
      });
      setRouteKeywordResult(result);
    } catch (error) {
      console.error("Error getting places by category:", error);
    }
  };

  const handleRecommendCollaborativePlace = async (selectedCategory) => {
    try {
      const response = await axios.post(
        `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/places/recommend/collaborative/${selectedCategory}?page=1&size=50`,
        {
          user_id: userId,
          latitude: location.coordinates.lat,
          longitude: location.coordinates.lng,
          top_n: 10,
        }
      );
      const data = response.data.items;
      const result = data.map((item) => {
        const name = item.basic_info.name;
        const id = item.basic_info.id;
        return { name, id };
      });
      setRouteKeywordResult(result);
    } catch (error) {
      if (error.response.data.detail === "places not found") {
        alert("추천된 장소가 없습니다. 다른 카테고리로 지정해주세요.");
      }
      console.error("Error getting places by category:", error);
    }
  };

  const handleRecommendClusterPlace = async () => {
    try {
      const user_id = userId;
      const response = await axios.get(
        `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/places/recommend/cluster/${user_id}?page=1&size=50`
      );
      const data = response.data.items;
      const result = data.map((item) => {
        const name = item.basic_info.name;
        const id = item.basic_info.id;
        return { name, id };
      });
      setRouteKeywordResult(result);
    } catch (error) {
      console.error("Error getting places by category:", error);
    }
  };

  return (
    <div className="main-container">
      <div className="main-header">
        {loggedInUser ? (
          <>
            <img
              src="images/logo.png"
              alt="Logo"
              style={{ width: "100px", height: "100px", cursor: "pointer" }}
            />
            <div className={isMobile ? "mobile-search-bar" : "search-bar"}>
              <input
                type="text"
                value={keyword}
                onChange={handleSearch}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setIsSearchFocused(false);
                  }
                }}
                placeholder="검색어 입력"
              />

              <br />
              {isSearchFocused &&
                keywordResult.length > 0 &&
                isKeyWordNow(keyword) && (
                  <div
                    className={
                      isMobile ? "mobile-related-searches" : "related-searches"
                    }
                    tabIndex="-1"
                  >
                    {keywordResult.map((item) => (
                      <RelatedSearchItem
                        key={item.id}
                        item={item}
                        onClick={handleKeywordClick}
                      />
                    ))}
                  </div>
                )}
            </div>
            <button className="logout-button" onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <h2>로그인 해주세요.</h2>
        )}
      </div>
      {isMobile && (
        <div className="main-content-filter">
          <button onClick={handleFetchData}>명소</button>
          <button onClick={handleFavorite}>즐겨찾기</button>
          <button onClick={handleCourse}>경로</button>
          {showSelect && (
            <select value={selectedOption} onChange={handleChange}>
              <option value="option1">이름순 정렬</option>
              <option value="option2">평점순 정렬</option>
              <option value="option3">리뷰순 정렬</option>
            </select>
          )}
        </div>
      )}
      <div className="main-body">
        <div className="main-map">
          <KakaoMap
            latitude={selectedPosition.latitude}
            longitude={selectedPosition.longitude}
            markers={markers}
            polylinePath={polylinePath}
          />
        </div>

        <div className="main-content">
          {!isMobile && (
            <div className="main-content-filter">
              <button onClick={handleFetchData}>명소 </button>
              <button onClick={handleFavorite}>즐겨찾기</button>
              <button onClick={handleCourse}>코스</button>
              {showSelect && (
                <select value={selectedOption} onChange={handleChange}>
                  <option value="option1">이름순 정렬</option>
                  <option value="option2">평점순 정렬</option>
                  <option value="option3">리뷰순 정렬</option>
                </select>
              )}
            </div>
          )}

          {isFetching ? (
            <div className="loading-message">
              <p>로딩 중입니다...</p>
            </div>
          ) : NotVisit ? (
            <p>기록되어 있는 즐겨찾기가 없습니다.</p>
          ) : isFetchRoute ? (
            <div className="main-content-place">
              {routeCourse.map((course, index) => (
                <div key={index} className="route-place-item-button">
                  <div className="route-course-item">
                    <p>{course.courseName}</p>
                  </div>
                  <button
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRouteCourse(index);
                    }}
                  >
                    <img
                      src="images/trash.png"
                      alt="trash"
                      className="delete-img"
                    />
                  </button>
                </div>
              ))}

              {routeCourse.length < 5 && (
                <div onClick={() => openModal()} className="add-button">
                  <img src="images/add.png" alt="add" className="add-img" />
                </div>
              )}
              <div className="centered-container">
                {routeCourse.length > 1 && (
                  <div onClick={fetchRoute} className="course-button">
                    <p>경로 탐색</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="main-content-place">
              {places.map((place, index) => (
                <div
                  key={index}
                  onContextMenu={(event) => handleContextMenu(event, place)}
                  className="place-item-button"
                  onClick={() => handleClick(place.latitude, place.longitude)}
                >
                  <h3>{place.name}</h3>
                  <p>{place.address}</p>
                  {place.score && <p>평점 : {place.score}</p>}
                  {place.review_count !== null && (
                    <p>리뷰수 : {place.review_count}</p>
                  )}
                  {isMobile && (
                    <>
                      <button
                        onClick={() => handleFavoriteClick(place.id)}
                        className="visit-button"
                      >
                        즐겨찾기
                      </button>
                      <button
                        onClick={() => openPlaceModal(place)}
                        className="info-button"
                      >
                        정보 보기
                      </button>{" "}
                    </>
                  )}
                </div>
              ))}

              {contextMenu.visible && (
                <p
                  style={{
                    top: `${contextMenu.y}px`,
                    left: `${contextMenu.x}px`,
                  }}
                  className="context-menu"
                  onClick={closeContextMenu}
                >
                  <button
                    onClick={() => handleFavoriteClick(contextMenu.place.id)}
                    className="visit-button"
                  >
                    즐겨찾기
                  </button>
                  <button
                    onClick={() => openPlaceModal(contextMenu.place)}
                    className="info-button"
                  >
                    정보 보기
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="main-footer">
        {isFetchRoute ? (
          <div className="detail-info">
            <p>
              택시비: <span>약 {routeResult.tax}원</span>
            </p>
            {routeResult.toll > 0 && (
              <p>
                톨게이트비: <span>약 {routeResult.toll}원</span>
              </p>
            )}
            <p>
              거리: <span>약 {routeResult.distance}m</span>
            </p>
            <p>
              시간:{" "}
              <span>
                약 {routeResult.duration_min}분 {routeResult.duration_sec}초
              </span>
            </p>
          </div>
        ) : (
          <h3>Copyrights 2024 All rights reserved. 11 Dec 2024.</h3>
        )}
      </div>

      <Modal
        isOpen={isPlaceModalOpen}
        onClose={closePlaceModal}
        title={selectedPlace ? selectedPlace.name : "장소 정보"}
      >
        {reviews.length > 0 && (
          <>
            <p className="modal-span">리뷰</p>
            <ul>
              {reviews.map((review, index) => (
                <li key={index}>{review.comment}</li>
              ))}
            </ul>
          </>
        )}

        {menus.length > 0 && (
          <>
            <p className="modal-span">메뉴</p>
            <ul>
              {menus.map((menu, index) => (
                <li key={index}>
                  {menu.menu} : {menu.price}원
                </li>
              ))}
            </ul>
          </>
        )}

        {reviews.length === 0 && menus.length === 0 && <p>정보가 없습니다.</p>}
      </Modal>

      <RouteModal isOpen={isRouteModalOpen} onClose={closeModal}>
        <div className="search-container">
          <input
            type="text"
            placeholder="검색어"
            value={routeKeyword}
            onChange={(e) => setRouteKeyword(e.target.value)}
            className="search-modal-input"
          />
          <button
            onClick={() => handleRouteSearch(routeKeyword)}
            className="search-button"
          >
            검색
          </button>
        </div>
        <div>
          {routeKeywordResult.length === 0 && (
            <>
              <select onChange={handleCategoryChange} value={selectedCategory}>
                <option value="상위">상위 카테고리 선택</option>
                <option value="food">음식점</option>
                <option value="카페">카페</option>
                <option value="명소">명소</option>
              </select>
              {selectedCategory === "food" && (
                <select
                  onChange={handleCategoryChange}
                  value={selectedCategory}
                >
                  <option value="세부">세부 카테고리 선택</option>
                  {subCategories.food.map((sub) => (
                    <option key={sub.value} value={sub.value}>
                      {sub.label}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}
          <button
            className="search-button"
            onClick={() => {
              setRouteKeywordResult([]);
            }}
          >
            결과 없애기
          </button>
        </div>
        {routeKeywordResult.length == 0 &&
          (selectedCategory === "카페" ||
            selectedCategory === "명소" ||
            selectedCategory === "한식" ||
            selectedCategory === "일식" ||
            selectedCategory === "중식" ||
            selectedCategory === "양식" ||
            selectedCategory === "아시아식" ||
            selectedCategory === "주점" ||
            selectedCategory === "기타") && (
            <div className="recommend-container">
              <p style={{ textAlign: "center" }}>
                어떤 방식으로 장소를 추천받으시겠어요?
              </p>
              <button
                className="recommend-button"
                onClick={() => handleRecommendSimilarPlace(selectedCategory)}
              >
                선택한 카테고리와 현 위치를 중심으로 추천받기
              </button>
              <button
                className="recommend-button"
                onClick={() =>
                  handleRecommendCollaborativePlace(selectedCategory)
                }
              >
                나와 취향이 비슷한 사람이 갔던 장소를 중심으로 추천받기
              </button>
              <button
                className="recommend-button"
                onClick={handleRecommendClusterPlace}
              >
                내가 즐겨 찾는 장소 중심으로 추천받기
              </button>
            </div>
          )}
        {routeKeywordResult.map((routeKeyword, index) => {
          return (
            <div
              key={index}
              onClick={() => handleRouteCourse(routeKeyword)}
              className="route-keyword-item"
            >
              <h3>{routeKeyword.name}</h3>
            </div>
          );
        })}
      </RouteModal>
    </div>
  );
}

export default MainPage;
