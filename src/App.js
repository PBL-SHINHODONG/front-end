import React, { useState } from "react";
import LoginPage from "./LoginPage";
import MainPage from "./MainPage";
import SurveyPage from "./SurveyPage";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";

const database = [
  {
    id: "user1",
    sex: "남자",
    age: "20대",
    region: "중구",
    food: "한식",
    hobby: "걷기",
  },
  {
    id: "user2",
    sex: "여자",
    age: "30대",
    region: "서구",
    food: "중식",
    hobby: "운동",
  },
];

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [inputId, setInputId] = useState("");
  const [warning, setWarning] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const user = database.find((user) => user.id === inputId);
    if (user) {
      setLoggedInUser(user);
      setInputId("");
      navigate("/main");
    } else {
      setWarning("아이디를 찾을 수 없습니다.");
    }
  };

  const handleSurvey = () => {
    navigate("/survey");
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    navigate("/");
  };

  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <LoginPage
              inputId={inputId}
              warning={warning}
              setInputId={setInputId}
              handleSurvey={handleSurvey}
              handleLogin={handleLogin}
            />
          }
        />
        <Route
          path="/main"
          element={
            <MainPage loggedInUser={loggedInUser} handleLogout={handleLogout} />
          }
        />
        <Route path="/survey" element={<SurveyPage />} />
      </Routes>
    </div>
  );
}

export default App;
