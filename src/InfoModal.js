import React from "react";
import "./InfoModal.css";

const InfoModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="info-modal-overlay" onClick={onClose}>
      <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="info-modal-header">
          <h2>대구갈래 웹사이트 사용설명서</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="info-modal-body">{children}</div>
      </div>
    </div>
  );
};

export default InfoModal;
