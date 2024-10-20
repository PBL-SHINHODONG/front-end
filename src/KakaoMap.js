import React, { useEffect } from "react";

const KakaoMap = ({ pos_x, pos_y }) => {
  useEffect(() => {
    const kakao = window.kakao;
  }, [pos_x, pos_y]);

  return <div id="map" style={{ width: "100%", height: "100%" }}></div>;
};

export default KakaoMap;
