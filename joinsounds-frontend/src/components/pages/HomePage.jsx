import React from "react";
import PostForm from "../forms/PostForm";

function HomePage() {
    const token = localStorage.getItem('token');
    return (
        <>
            <div className="home-page-container">
                <h1>Welcome to Gibon Agent</h1>
                <p>Your one-stop solution for all your needs.</p>
                <p>Explore our features and services.</p>
            </div>

            <div>
                <h2>Dodaj nowy post</h2>
                <PostForm token={token} />
            </div>
        </>
    );
}
export default HomePage;