import React, { useState } from "react";
import "./LoginPage.css";

function LoginPage({
  inputId,
  setInputId,
  warning,
  handleLogin,
  handleSurvey,
}) {
  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-text">Login</h2>
        <div>
          <input
            type="text"
            placeholder="Enter your username"
            className="login-input"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
          />
        </div>
        {warning && <div className="warning-text">{warning}</div>}
        <div>
          <button className="login-button" onClick={handleLogin}>
            Login
          </button>
          <button
            className="login-button"
            onClick={handleSurvey}
            style={{ marginTop: "10px" }}
          >
            접속이 처음인가요?
          </button>
        </div>
      </div>
    </div>
  );
}
export default LoginPage;
