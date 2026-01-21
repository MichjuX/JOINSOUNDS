import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { Toast } from 'primereact/toast';
import PostForm from "../forms/PostForm";
import PostService from "../service/PostService";
import "./HomePage.css";
import "../common/Buttons.css";
import UserService from "../service/UserService";
import PostList from "../posts/PostList";
import "../common/ConfirmPopup.css";
import UserProfileService from "../service/ProfilePageService";

function HomePage() {
  const token = localStorage.getItem('token');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [reloadFlag, setReloadFlag] = useState(0);
  
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // PrimeReact references
  const toast = useRef(null);
  const deleteButtonRef = useRef({});

  // Pobierz ID użytkownika tylko raz przy montowaniu
  useEffect(() => {
    fetchCurrentUserId();
    fetchCurrentUserProfilePicture();
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
          { signal: abortController.signal },
          token
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
  }, [page, size, sortBy, sortDirection, reloadFlag]);

  const fetchCurrentUserId = async () => {
    try {
      const userId = await UserService.getCurrentUserId(token);
      setCurrentUserId(userId);
      localStorage.setItem('userId', userId);
    } catch (err) {
      console.error("Failed to fetch user ID:", err);
    }
  };

  const fetchCurrentUserProfilePicture = async () => {
    try {
      const profilePicturePath = await UserProfileService.getUserProfilePicturePath(token);
      if(profilePicturePath){
        const authorizedProfilePicturePath = PostService.getAuthorizedFileUrl(profilePicturePath);
        localStorage.setItem('profilePicturePath', authorizedProfilePicturePath);
      }
    } catch (err) {
      console.error("Failed to fetch profile picture path:", err);
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

  const handlePostCreated = (newPost) => {
        // Optymistycznie dodaj nowy post na początek listy
        newPost.userProfilePicturePath = localStorage.getItem('profilePicturePath');
        console.log(newPost);
        setPosts(prevPosts => [newPost, ...prevPosts]);
        setTotalElements(prev => prev + 1);
        
        // Jeśli lista jest pełna, usuń ostatni element
        if (posts.length >= size) {
            setPosts(prevPosts => prevPosts.slice(0, size));
        }
        
        // Możesz też zresetować paginację do pierwszej strony
        setPage(0);
        
        toast.current.show({ 
            severity: 'success', 
            summary: 'Success', 
            detail: 'Post created successfully', 
            life: 3000 
        });
    };

    const handleDelete = async (event, postId) => {
        confirmPopup({
            target: event.currentTarget,
            message: 'Are you sure you want to delete this post?',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    // Optymistyczne usunięcie - najpierw aktualizujemy UI
                    const deletedPost = posts.find(post => post.id === postId);
                    setPosts(prev => prev.filter(post => post.id !== postId));
                    setTotalElements(prev => prev - 1);
                    
                    // Następnie wysyłamy request do serwera
                    await PostService.deletePost(postId, token);
                    
                    toast.current.show({ 
                        severity: 'success', 
                        summary: 'Deleted', 
                        detail: 'Post has been deleted successfully', 
                        life: 3000 
                    });
                } catch (error) {
                    // Jeśli wystąpi błąd, przywróć post
                    setPosts(prev => [...prev, deletedPost]);
                    setTotalElements(prev => prev + 1);
                    
                    console.error("Error deleting post:", error);
                    toast.current.show({ 
                        severity: 'error', 
                        summary: 'Error', 
                        detail: 'Failed to delete post', 
                        life: 3000 
                    });
                }
            }
        });
    };

    // HomePage.js

// ... (istniejący kod)

// HomePage.js

// ... (istniejący kod)

    const handleAdminDelete = async (event, postId) => {
        confirmPopup({
            target: event.currentTarget,
            message: 'Are you sure you want to delete this post as a moderator?', // Zmiana treści wiadomości
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                // Zapisz oryginalny post na potrzeby rollbacku
                const originalPost = posts.find(post => post.id === postId); 

                try {
                    // 1. Optymistyczna AKTUALIZACJA: Zmień treść posta w UI
                    setPosts(prev => 
                        prev.map(post => 
                            post.id === postId
                                ? { 
                                    ...post, 
                                    // Ustawienie żądanej wiadomości
                                    title: "Post deleted by moderator",
                                    content: "",
                                    // Opcjonalnie: upewnienie się, że inne elementy zostaną ukryte
                                    audioFilePath: null,
                                    // Dodanie flagi (jeśli backend ją obsługuje)
                                    isDeletedByModerator: true 
                                }
                                : post
                        )
                    );
                    
                    // 2. Wysłanie requestu do serwera, który powinien oznaczyć post
                    // W Service powinien być endpoint, który aktualizuje post, a nie go fizycznie usuwa.
                    await PostService.adminDeletePost(postId, token); 
                    
                    toast.current.show({ 
                        severity: 'success', 
                        summary: 'Deleted', 
                        detail: 'Post has been marked as deleted by moderator', // Zmiana wiadomości
                        life: 3000 
                    });
                } catch (error) {
                    // 3. Przywróć oryginalny post w przypadku błędu
                    setPosts(prev => prev.map(post => post.id === postId ? originalPost : post)); 

                    console.error("Error marking post as deleted:", error);
                    toast.current.show({ 
                        severity: 'error', 
                        summary: 'Error', 
                        detail: 'Failed to mark post as deleted', 
                        life: 3000 
                    });
                }
            }
        });
    };

  const handleSortChange = (field, direction) => {
    setSortBy(field);
    setSortDirection(direction);
    setPage(0);
  };

  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="home-page-container">
      {/* Toast component for notifications */}
      <Toast ref={toast} />
      <ConfirmPopup />
      
      {UserService.isAuthenticated() && (
        <div className="post-form-section">
            <h2>Create new post</h2>
            <PostForm 
                token={token} 
                onPostCreated={handlePostCreated} 
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
          onEdit={(postId) => navigate(`/post/edit/${postId}`)}
          onDelete={handleDelete}
          onAdminDelete={handleAdminDelete}
          getAudioType={getAudioType}
          token={token}
          onUpdatePosts={setPosts}
        />

        {posts.length > 0 && (
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