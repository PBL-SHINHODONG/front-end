import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import KakaoMap from "./KakaoMap";
import axios from "axios";
import "./MainPage.css";
import Modal from "./Modal.js";
import useGeolocation from "./hooks/useGeolocation";

function MainPage({ loggedInUser, handleLogout }) {
  const [places, setPlaces] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [visitCounts, setVisitCounts] = useState({});
  const location = useGeolocation();
  const [selectedPosition, setSelectedPosition] = useState({
    latitude: 35.8714354,
    longitude: 128.601445,
  });
  const navigate = useNavigate();
  const [markers, setMarkers] = useState([]);
  const [polylinePath, setPolylinePath] = useState([]);
  const [isLogin, setIsLogin] = useState(false);
  const [userId, setUserId] = useState(0);
  const [showSelect, setShowSelect] = useState(false);
  const [NotVisit, setNotVisit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("option1");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [routeResult, setRouteResult] = useState({});
  const [menus, setMenus] = useState([]);
  const [isFetchRoute, setIsFetchRoute] = useState(false);
  const { kakao } = window;
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    place: null,
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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

  const max = (a, b) => {
    return Math.max(a, b);
  };
  const fetchData = async (selectedOption) => {
    if (isFetching) return;
    setPolylinePath();
    setIsFetching(true);
    setShowSelect(true);
    setIsFetchRoute(false);
    const url =
      selectedOption === "option3"
        ? `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/places/?sort_by=review_count&order=desc&page_size=100&page=1&size=50`
        : selectedOption === "option2"
        ? `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/places/?sort_by=score&order=asc&page_size=100&page=1&size=50`
        : `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/places/?sort_by=name&order=asc&page_size=100&page=1&size=50`;
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

  const openModal = (place) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
    handleReview(place.id);
    handleMenu(place.id);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlace(null);
  };

  const fetchRoute = async () => {
    setIsFetchRoute(true);
    const API_KEY = process.env.REACT_APP_API_KEY;
    const url = "https://apis-navi.kakaomobility.com/v1/waypoints/directions";

    const start = { x: 128.73240044388956, y: 35.879280894119255 };
    const end = { x: 128.55836290943844, y: 35.87081315633119 };

    const waypoints = [
      { x: 128.652345, y: 35.879234 },
      { x: 128.612345, y: 35.859234 },
      { x: 128.612365, y: 35.859232 },
      { x: 128.612366, y: 35.859233 },
    ];

    const headers = {
      Authorization: `KakaoAK ${API_KEY}`,
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

      setPolylinePath(routePath);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);
    fetchData(value);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClick = (x, y) => {
    setSelectedPosition({ latitude: x, longitude: y });
  };

  const handleVisit = async () => {
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

  const handleVisitClick = async (placeId) => {
    try {
      setShowSelect(false);
      const info = {
        place_id: placeId,
        user_id: userId,
      };
      console.log(info);
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

  const handleRecommend = async () => {
    try {
      setPlaces([]);
      setShowSelect(false);
      setIsFetchRoute(false);
      const response = await axios.get(
        `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/places/${userId}/recommend?page=1&size=50`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
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

  return (
    <div className="main-container">
      <div className="main-header">
        {loggedInUser ? (
          <>
            <h2>안녕하세요, {loggedInUser.email}님!</h2>
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
          <button onClick={fetchData}>명소</button>
          <button onClick={handleVisit}>방문 장소</button>
          <button onClick={fetchRoute}>경로</button>
          <button onClick={handleRecommend}>추천 장소</button>
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
              <button onClick={fetchData}>명소</button>
              <button onClick={handleVisit}>방문 장소</button>
              <button onClick={fetchRoute}>경로</button>
              <button onClick={handleRecommend}>추천 장소</button>
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
            <p>기록되어 있는 방문 장소가 없습니다.</p>
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
                        onClick={() => handleVisitClick(place.id)}
                        className="visit-button"
                      >
                        방문 여부
                      </button>
                      <button
                        onClick={() => openModal(place)}
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
                    onClick={() => handleVisitClick(contextMenu.place.id)}
                    className="visit-button"
                  >
                    방문 여부
                  </button>
                  <button
                    onClick={() => openModal(contextMenu.place)}
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
          <div>
            <p>택시비 : 약 {routeResult.tax}원</p>{" "}
            {routeResult.toll > 0 && (
              <p>톨게이트비 : 약 {routeResult.toll}원</p>
            )}
            <p>거리 : 약 {routeResult.distance}m</p>
            <p>
              시간 : 약 {routeResult.duration_min}분 {routeResult.duration_sec}
              초
            </p>
          </div>
        ) : (
          <h1>푸터</h1>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
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
    </div>
  );
}

export default MainPage;
