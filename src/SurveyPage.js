import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SurveyPage.css";

const SurveyPage = () => {
  const [step, setStep] = useState(1);
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [region, setRegion] = useState("");
  const [food, setFood] = useState("");
  const [hobby, setHobby] = useState("");
  const [userInfo, setUserInfo] = useState({
    sex: "",
    age: "",
    region: "",
    food: "",
    hobby: "",
  });

  const navigate = useNavigate();
  const handleSuccess = () => {
    const updatedInfo = {
      sex: sex,
      age: age,
      region: region,
      food: food,
      hobby: hobby,
    };
    setUserInfo(updatedInfo);
    console.log("Updated userInfo:", updatedInfo);
    navigate("/main");
  };
  const nextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2>성별을 선택하세요:</h2>
            <button
              onClick={() => {
                setSex("남자");
                nextStep();
              }}
            >
              남자
            </button>
            <button
              onClick={() => {
                setSex("여자");
                nextStep();
              }}
            >
              여자
            </button>
          </div>
        );
      case 2:
        return (
          <div>
            <h2>연령대를 선택하세요:</h2>
            {["10대", "20대", "30대", "40대", "50대", "60대", "70대 이상"].map(
              (ageGroup) => (
                <button
                  key={ageGroup}
                  onClick={() => {
                    setAge(ageGroup);
                    nextStep();
                  }}
                >
                  {ageGroup}
                </button>
              )
            )}
          </div>
        );
      case 3:
        return (
          <div>
            <h2>지역을 선택하세요:</h2>
            {[
              "남구",
              "서구",
              "중구",
              "북구",
              "동구",
              "달성군",
              "달서구",
              "수성구",
            ].map((region) => (
              <button
                key={region}
                onClick={() => {
                  setRegion(region);
                  nextStep();
                }}
              >
                {region}
              </button>
            ))}
          </div>
        );
      case 4:
        return (
          <div>
            <h2>좋아하는 음식을 선택하세요:</h2>
            {["한식", "중식", "일식", "양식"].map((food) => (
              <button
                key={food}
                onClick={() => {
                  setFood(food);
                  nextStep();
                }}
              >
                {food}
              </button>
            ))}
          </div>
        );
      case 5:
        return (
          <div>
            <h2>좋아하는 것을 선택하세요:</h2>
            {["걷기", "영화", "운동", "게임"].map((hobby) => (
              <button
                key={hobby}
                onClick={() => {
                  setHobby(hobby);
                  nextStep();
                }}
              >
                {hobby}
              </button>
            ))}
          </div>
        );
      case 6:
        return (
          <div>
            <h2>모든 수집이 끝났습니다. 버튼을 클릭하세요.</h2>
            <button onClick={handleSuccess}>메인화면으로 가기</button>
          </div>
        );
      default:
        return <div>잘못된 단계입니다.</div>;
    }
  };

  return <div className="survey-container">{renderStep()}</div>;
};

export default SurveyPage;
