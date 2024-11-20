import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import KakaoMap from "./KakaoMap";
import axios from "axios";
import "./MainPage.css";
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
  const [selectedOption, setSelectedOption] = useState("option1");
  const { kakao } = window;

  useEffect(() => {
    if (loggedInUser) {
      setIsLogin(true);
      setUserId(loggedInUser.id);
    } else {
      navigate("/");
    }
  }, [loggedInUser]);

  const fetchData = async (selectedOption) => {
    if (isFetching) return;
    setIsFetching(true);
    setShowSelect(true);
    const url =
      selectedOption === "option1"
        ? `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/places/?order=desc&page_size=100&page=1&size=50`
        : selectedOption === "option2"
        ? `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/places/?sort_by=name&order=asc&page_size=100&page=1&size=50`
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
      console.error("Error fetching data:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchFilteredData = () => {
    const filteredPlaces = [
      { name: "Place 1", latitude: 33.451, longitude: 126.57 },
      { name: "Place 2", latitude: 33.452, longitude: 126.581 },
      { name: "Place 3", latitude: 33.463, longitude: 126.522 },
      { name: "Place 4", latitude: 33.494, longitude: 126.5 },
    ];
    setPlaces(filteredPlaces);

    setMarkers(
      filteredPlaces.map((place) => ({
        position: new kakao.maps.LatLng(place.latitude, place.longitude),
      }))
    );
    setPolylinePath(
      filteredPlaces.map(
        (place) => new kakao.maps.LatLng(place.latitude, place.longitude)
      )
    );
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

      const updatedCount = response.data.visit_count; // 서버에서 반환된 방문 횟수
      setVisitCounts((prevCounts) => ({
        ...prevCounts,
        [placeId]: updatedCount, // 방문 횟수 업데이트
      }));
    } catch (error) {
      console.error("Error posting visit:", error);
    }
  };

  const handleRecommend = async () => {
    try {
      setPlaces([]);
      setShowSelect(false);
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
  return (
    <div className="main-container">
      <div className="main-header">
        {loggedInUser ? ( // loggedInUser가 있을 때만 렌더링
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
          <div className="main-content-filter">
            <button onClick={fetchData}>명소</button>
            <button onClick={handleVisit}>방문 장소</button>
            <button onClick={fetchFilteredData}>경로</button>
            <button onClick={handleRecommend}>추천 장소</button>
            {showSelect && (
              <select value={selectedOption} onChange={handleChange}>
                <option value="option1">기본 정렬</option>
                <option value="option2">이름순 정렬</option>
                <option value="option3">기능 없는 정렬</option>
              </select>
            )}
          </div>
          {NotVisit ? (
            <p>기록되어 있는 방문 장소가 없습니다.</p>
          ) : (
            <div className="main-content-place">
              {places.map((place, index) => (
                <button
                  key={index}
                  className="place-item-button"
                  onClick={() => handleClick(place.latitude, place.longitude)}
                >
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => handleVisitClick(place.id)}
                      className="visit-button"
                    >
                      방문여부
                    </button>

                    <div>
                      <h3>{place.name}</h3>
                      <p>{place.address}</p>
                      {place.score && <p>평점 : {place.score}</p>}
                      {place.review_count !== 0 && (
                        <p>리뷰수 : {place.review_count}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="main-footer">
        <h1>푸터</h1>
      </div>
      {isFetching && <p>로딩 중입니다</p>}
    </div>
  );
}

export default MainPage;
