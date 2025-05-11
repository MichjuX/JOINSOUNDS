import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PostForm from "../forms/PostForm";
import PostService from "../service/PostService";
import "./HomePage.css";
import "../common/Buttons.css";
import UserService from "../service/UserService";
import PostList from "../posts/PostList";

function HomePage() {
  const token = localStorage.getItem('token');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false); // Zmienione na false początkowo
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Pobierz ID użytkownika tylko raz przy montowaniu
  useEffect(() => {
    fetchCurrentUserId();
  }, [token]);

  // Obsługa paginacji z użyciem abort controller
  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await PostService.getAllPosts(
          page, 
          size, 
          sortBy, 
          sortDirection,
          { signal: abortController.signal }
        );
        setPosts(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError(err.message);
          console.error("Error fetching posts:", err);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => abortController.abort();
  }, [page, size, sortBy, sortDirection]);

  const fetchCurrentUserId = async () => {
    try {
      const userId = await UserService.getCurrentUserId(token);
      setCurrentUserId(userId);
    } catch (err) {
      console.error("Failed to fetch user ID:", err);
    }
  };

  const getAudioType = (filename) => {
    const ext = filename?.split('.').pop().toLowerCase();
    const types = {
      mp3: 'audio/mpeg',
      aac: 'audio/aac',
      m4a: 'audio/mp4',
      ogg: 'audio/ogg',
      wav: 'audio/wav'
    };
    return types[ext] || 'audio/mpeg';
  };

  const handleShowMore = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await PostService.deletePost(postId, token);
        // Optymalizacja: nie przeładowujemy całej listy, tylko aktualizujemy stan
        setPosts(prev => prev.filter(post => post.id !== postId));
        // Aktualizacja licznika
        setTotalElements(prev => prev - 1);
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const handleSortChange = (field, direction) => {
    setSortBy(field);
    setSortDirection(direction);
    setPage(0); // Resetuj do pierwszej strony przy zmianie sortowania
  };

  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="home-page-container">
      {UserService.isAuthenticated() && (
        <div className="post-form-section">
          <h2>Create new post</h2>
          <PostForm 
            token={token} 
            onPostCreated={() => {
              setPage(0);
              // Nie trzeba wywoływać fetchPosts, useEffect sam się zajmie
            }} 
          />
        </div>
      )}

      <div className="posts-container">
        <h2>Recent Posts</h2>

        <div className="sorting-controls">
          <span>Sort by: </span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value, sortDirection)}
            className="sort-select"
          >
            <option value="createdAt">Date</option>
            <option value="title">Title</option>
            <option value="user.name">Author</option>
          </select>
          
          <select
            value={sortDirection}
            onChange={(e) => handleSortChange(sortBy, e.target.value)}
            className="sort-direction-select"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
        
        <div className="pagination-controls">
          <select 
            value={size} 
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(0);
            }}
            className="page-size-select"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
          
          <div className="page-navigation">
            <button 
              onClick={() => setPage(p => Math.max(p - 1, 0))} 
              disabled={page === 0 || loading}
              className="page-btn"
            >
              Previous
            </button>
            
            <span className="page-info">
              Page {page + 1} of {totalPages} ({totalElements} total posts)
            </span>
            
            <button 
              onClick={() => setPage(p => p + 1)} 
              disabled={page >= totalPages - 1 || loading}
              className="page-btn"
            >
              Next
            </button>
          </div>
        </div>

        <PostList 
          posts={posts}
          loading={loading}
          currentUserId={currentUserId}
          onShowMore={handleShowMore}
          onDelete={handleDelete}
          getAudioType={getAudioType}
          token={token}
        />

        {posts.length > size && (
          <div className="pagination-controls bottom">
            <div className="page-navigation">
              <button 
                onClick={() => setPage(p => Math.max(p - 1, 0))} 
                disabled={page === 0 || loading}
                className="page-btn"
              >
                Previous
              </button>
              
              <span className="page-info">
                Page {page + 1} of {totalPages}
              </span>
              
              <button 
                onClick={() => setPage(p => p + 1)} 
                disabled={page >= totalPages - 1 || loading}
                className="page-btn"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;