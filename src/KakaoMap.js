import React, { useEffect } from "react";

const KakaoMap = ({ latitude, longitude }) => {
  useEffect(() => {
    const { kakao } = window;

    const initializeMap = () => {
      const container = document.getElementById("map");
      const options = {
        center: new kakao.maps.LatLng(latitude, longitude),
        level: 3,
      };

      // 지도 생성
      const map = new kakao.maps.Map(container, options);

      // 마커 생성 및 지도에 표시
      const markerPosition = new kakao.maps.LatLng(latitude, longitude);
      const marker = new kakao.maps.Marker({
        position: markerPosition,
      });
      marker.setMap(map);
    };

    // 지도 초기화 함수 호출
    if (kakao && kakao.maps) {
      initializeMap();
    }
  }, [latitude, longitude]); // 위도와 경도가 변경될 때마다 실행

  return <div id="map" style={{ width: "100%", height: "100%" }}></div>;
};

export default KakaoMap;
