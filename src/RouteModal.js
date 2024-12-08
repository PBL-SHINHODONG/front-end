import React from "react";
import "./RouteModal.css";

const RouteModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="route-modal-overlay" onClick={onClose}>
      <div className="route-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="route-modal-header">
          <h2>장소 추가</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="route-modal-body">{children}</div>
      </div>
    </div>
  );
};

export default RouteModal;
