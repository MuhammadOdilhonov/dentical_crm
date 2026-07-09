import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <h1>404</h1>
                <h2>Sahifa topilmadi</h2>
                <p>Siz qidirayotgan sahifa mavjud emas yoki o'chirilgan.</p>
                <button onClick={() => navigate("/")} className="home-button">
                    <FaHome className="home-icon" />
                    Bosh sahifaga qaytish
                </button>
            </div>
        </div>
    );
}
