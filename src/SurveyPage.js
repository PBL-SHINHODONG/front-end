import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SurveyPage.css";

const SurveyPage = () => {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sex, setSex] = useState("");
  const [age_group, setAge_group] = useState("");
  const [food, setFood] = useState("");
  const [place, setPlace] = useState("");
  const [budget, setButget] = useState("");
  const [atmosphere, setAtmosphere] = useState("");
  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
    sex: true,
    age_group: 0,
    preferred_food: "",
    preferred_activity: "",
    budget_range: "",
    preferred_atmosphere: "",
  });

  const navigate = useNavigate();
  const handleSuccess = async () => {
    const updatedInfo = {
      email: email || null,
      password: password || null,
      sex: sex === "여자" ? true : false,
      age_group:
        age_group === "10대"
          ? 1
          : age_group === "20대"
          ? 2
          : age_group === "30대"
          ? 3
          : age_group === "40대"
          ? 4
          : age_group === "50대"
          ? 5
          : age_group === "60대"
          ? 6
          : age_group === "70대 이상"
          ? 7
          : null,
      preferred_food: food || null,
      preferred_activity: place || null,
      budget_range: budget || null,
      preferred_atmosphere: atmosphere || null,
    };
    setUserInfo(updatedInfo);
    console.log("Updated userInfo:", updatedInfo);
    try {
      const response = await axios.post(
        `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/users/register`,
        updatedInfo,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("User registered:", response.data);
    } catch (error) {
      console.error("Error registering user:", error);
    }
    navigate("/");
  };
  const nextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div>
            <h2>이메일과 닉네임을 작성하세요:</h2>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="styled-input"
            />
            <input
              type="text"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="styled-input"
            />
            <button onClick={nextStep}>다음</button>
          </div>
        );
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
                    setAge_group(ageGroup);
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
            <h2>선호하는 음식을 선택하세요:</h2>
            {["양식", "일식", "한식", "중식", "디저트", "상관 없음"].map(
              (food) => (
                <button
                  key={food}
                  onClick={() => {
                    setFood(food);
                    nextStep();
                  }}
                >
                  {food}
                </button>
              )
            )}
          </div>
        );
      case 4:
        return (
          <div>
            <h2>선호하는 장소를 선택하세요:</h2>
            {[
              "음식점",
              "카페",
              "영화관",
              "미술관",
              "박물관",
              "기타",
              "상관 없음",
            ].map((place) => (
              <button
                key={place}
                onClick={() => {
                  setPlace(place);
                  nextStep();
                }}
              >
                {place}
              </button>
            ))}
          </div>
        );
      case 5:
        return (
          <div>
            <h2>예산 범위를 선택하세요:</h2>
            {["1만원", "2만원", "3만원", "5만원", "상관 없음"].map((budget) => (
              <button
                key={budget}
                onClick={() => {
                  setButget(budget);
                  nextStep();
                }}
              >
                {budget}
              </button>
            ))}
          </div>
        );
      case 6:
        return (
          <div>
            <h2>선호하는 분위기를 선택하세요:</h2>
            {["조용한", "활기찬", "분위기 좋은", "상관 없음"].map(
              (atmosphere) => (
                <button
                  key={atmosphere}
                  onClick={() => {
                    setAtmosphere(atmosphere);
                    nextStep();
                  }}
                >
                  {atmosphere}
                </button>
              )
            )}
          </div>
        );
      case 7:
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
