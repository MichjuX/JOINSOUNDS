import React, { useEffect, useState } from 'react';
import '../common/Buttons.css';
import ProfilePageService from '../service/ProfilePageService';

function ProfileAnalyticsModal({ token, onClose }) {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await ProfilePageService.getUserAnalytics(token);
                setAnalytics(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchAnalytics();
    }, [token]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>User Analytics</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {loading && <p>Loading analytics...</p>}
                {error && <p className="error">{error}</p>}

                {analytics && (
                    <div className="analytics-list">
                        <p>Total Likes: <b>{analytics.userTotalLikes}</b></p>
                        <p>Total Comments: <b>{analytics.userTotalComments}</b></p>
                        <p>Likes Last Week: <b>{analytics.userLastWeekLikes}</b></p>
                        <p>Comments Last Week: <b>{analytics.userLastWeekComments}</b></p>
                    </div>
                )}

                <div className="modal-actions">
                    <button className="submit-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}

export default ProfileAnalyticsModal;
