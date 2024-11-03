import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";

import LoginPage from "./LoginPage";
import MainPage from "./MainPage";
import SurveyPage from "./SurveyPage";
import "./App.css";

// 위와 같이 모든 import가 파일의 최상단에 있어야 합니다

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [warning, setWarning] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const updatedInfo = {
      email: inputEmail,
      password: inputPassword,
    };
    try {
      const response = await axios.post(
        `http://ec2-13-125-211-97.ap-northeast-2.compute.amazonaws.com:5000/users/login`,
        updatedInfo,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setLoggedInUser(response.data);
      setWarning("");
      navigate("/main");
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setWarning("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        setWarning("서버 오류가 발생했습니다.");
      }
      console.error("Error during login:", error);
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
              inputEmail={inputEmail}
              inputPassword={inputPassword}
              warning={warning}
              setInputEmail={setInputEmail}
              setInputPassword={setInputPassword}
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
