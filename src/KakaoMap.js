import React, { useEffect } from "react";

const KakaoMap = ({ latitude, longitude, markers = [], polylinePath = [] }) => {
  useEffect(() => {
    const { kakao } = window;

    const initializeMap = () => {
      const container = document.getElementById("map");
      const options = {
        center: new kakao.maps.LatLng(latitude, longitude),
        level: 3,
      };

      // 지도 생성 및 mapRef에 저장
      const map = new kakao.maps.Map(container, options);

      const markerPosition = new kakao.maps.LatLng(latitude, longitude);
      const marker = new kakao.maps.Marker({
        position: markerPosition,
      });
      marker.setMap(map);
      markers.forEach((markerInfo) => {
        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(
            markerInfo.latitude,
            markerInfo.longitude
          ),
        });
        marker.setMap(map);
      });

      if (polylinePath.length > 1) {
        const polyline = new kakao.maps.Polyline({
          path: polylinePath,
          strokeWeight: 8,
          strokeColor: "#220cec",
          strokeOpacity: 0.9,
          strokeStyle: "solid",
        });

        const borderPolyline = new kakao.maps.Polyline({
          path: polylinePath,
          strokeWeight: 12,
          strokeColor: "#FFFFFF",
          strokeOpacity: 0.6,
          strokeStyle: "solid",
        });

        const dottedPolyline = new kakao.maps.Polyline({
          path: polylinePath,
          strokeWeight: 5,
          strokeColor: "#220cec",
          strokeOpacity: 0.8,
          strokeStyle: "shortdash",
        });

        // 지도에 폴리라인 추가
        polyline.setMap(map);
        borderPolyline.setMap(map);
        dottedPolyline.setMap(map);
      }
    };

    if (kakao && kakao.maps) {
      initializeMap();
    }
  }, [latitude, longitude, markers, polylinePath]);

  return <div id="map" style={{ width: "100%", height: "100%" }}></div>;
};

export default KakaoMap;
