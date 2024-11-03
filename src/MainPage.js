import React, { useEffect, useState } from "react";
import KakaoMap from "./KakaoMap"; // Import the KakaoMap component
import axios from "axios";
import "./MainPage.css";
import useGeolocation from "./hooks/useGeolocation";

function MainPage({ loggedInUser, handleLogout }) {
  const [places, setPlaces] = useState([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState({
    latitude: 33.450701,
    longitude: 126.570667,
  });
  const location = useGeolocation();

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/places/?order=desc&page_size=100&page=${page}&size=50`
      );
      const data = await response.data.items;
      const result = await Promise.all(
        data.map(async (item) => {
          const naverScore = item.naver_info?.score;
          const kakaoScore = item.kakao_info?.score;

          const averageScore =
            naverScore && kakaoScore
              ? (naverScore + kakaoScore) / 2
              : naverScore || kakaoScore || null;

          return {
            name: item.basic_info.name,
            address: item.basic_info.address,
            latitude: item.basic_info.LatLng.latitude,
            longitude: item.basic_info.LatLng.longitude,
            score: averageScore,
            review_count: item.kakao_info?.review_count || 0,
          };
        })
      );
      setPlaces((prevPlaces) => [...prevPlaces, ...result]); // 이전 데이터에 새로운 데이터들을 계속해서 추가해나감(무한 스크롤 방식)
      setIsFetching(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const handleScroll = () => {
    if (
      //현재 스크롤 위치가 페이지 전체 높이와 일치하는지를 확인함, 데이터를 이미 불러오는 중에는 추가로 불러오지 않음
      window.innerHeight + document.documentElement.scrollTop !==
        document.documentElement.offsetHeight ||
      isFetching
    ) {
      return;
    }
    setPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll); // 스크롤을 멈추면 이벤트리스너를 제거
    };
  }, [isFetching]);

  const handleClick = (x, y) => {
    setSelectedPosition({ latitude: x, longitude: y });
  };

  return (
    <div className="main-container">
      <div className="main-header">
        {loggedInUser ? ( // loggedInUser가 있을 때만 렌더링
          <>
            <h2>안녕하세요, {loggedInUser.email}님!</h2>
            {location.loaded ? (
              location.error ? (
                <div>Error: {location.error.message}</div>
              ) : (
                <div>
                  사용자의 위도 : {location.coordinates.lat} <br />
                  사용자의 경도 : {location.coordinates.lng}
                </div>
              )
            ) : (
              <div>사용자 위도경도 정보 없음.</div>
            )}
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
          />
        </div>
        <div className="main-content">
          <div className="main-content-filter">
            <button>필터1</button>
            <button>필터2</button>
            <button>필터3</button>
            <button>필터4</button>
          </div>
          <div className="main-content-place">
            {places.map((place, index) => (
              <button
                key={index}
                className="place-item-button"
                onClick={() => handleClick(place.latitude, place.longitude)}
              >
                <div>
                  <h3>{place.name}</h3>
                  <p>{place.address}</p>
                  {place.score && <p>평점 : {place.score}</p>}
                  {place.review_count !== 0 && (
                    <p>리뷰수 : {place.review_count}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="main-footer">
        <h1>푸터</h1>
      </div>
      {isFetching && <p>Loading more places...</p>}
    </div>
  );
}

export default MainPage;
