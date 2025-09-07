import React, { Component } from 'react';
// import './ProfileEditModal.css';
import '../common/Buttons.css';

class ProfileEditModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: {
                bio: props.profile.bio || '',
                tools: props.profile.tools || [],
                genres: props.profile.genres || []
            },
            currentTool: '',
            currentGenre: '',
            saving: false
        };
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        this.setState({ saving: true });
        
        try {
            await this.props.onSave(this.state.formData);
            this.props.onClose();
        } catch (error) {
            alert('Błąd podczas zapisywania: ' + error.message);
        } finally {
            this.setState({ saving: false });
        }
    };

    addTool = () => {
        const { currentTool, formData } = this.state;
        if (currentTool.trim() && !formData.tools.includes(currentTool.trim())) {
            this.setState(prevState => ({
                formData: {
                    ...prevState.formData,
                    tools: [...prevState.formData.tools, currentTool.trim()]
                },
                currentTool: ''
            }));
        }
    };

    removeTool = (toolToRemove) => {
        this.setState(prevState => ({
            formData: {
                ...prevState.formData,
                tools: prevState.formData.tools.filter(tool => tool !== toolToRemove)
            }
        }));
    };

    addGenre = () => {
        const { currentGenre, formData } = this.state;
        if (currentGenre.trim() && !formData.genres.includes(currentGenre.trim())) {
            this.setState(prevState => ({
                formData: {
                    ...prevState.formData,
                    genres: [...prevState.formData.genres, currentGenre.trim()]
                },
                currentGenre: ''
            }));
        }
    };

    removeGenre = (genreToRemove) => {
        this.setState(prevState => ({
            formData: {
                ...prevState.formData,
                genres: prevState.formData.genres.filter(genre => genre !== genreToRemove)
            }
        }));
    };

    handleToolKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.addTool();
        }
    };

    handleGenreKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.addGenre();
        }
    };

    render() {
        const { formData, currentTool, currentGenre, saving } = this.state;
        const { onClose } = this.props;

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Edit Profile</h2>
                        <button className="modal-close" onClick={onClose}>×</button>
                    </div>

                    <form onSubmit={this.handleSubmit} className="profile-form">
                        <div className="form-group">
                            <label>About Me</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => this.setState(prevState => ({
                                    formData: { ...prevState.formData, bio: e.target.value }
                                }))}
                                placeholder="Tell us about yourself and your music..."
                                rows={4}
                            />
                        </div>

                        <div className="form-group">
                            <label>Tools and software</label>
                            <div className="tag-input-group">
                                <input
                                    type="text"
                                    value={currentTool}
                                    onChange={(e) => this.setState({ currentTool: e.target.value })}
                                    onKeyDown={this.handleToolKeyPress}
                                    placeholder="Add tool (eg. FL Studio) and press Enter"
                                />
                                {/* <button type="button" className='tag-submit-btn' onClick={this.addTool}>+</button> */}
                            </div>
                            <div className="tags-list">
                                {formData.tools.map((tool, index) => (
                                    <span key={index} className="tag">
                                        {tool}
                                        <button type="button" className='tag-list-btn' onClick={() => this.removeTool(tool)}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Fevorite Music Genres</label>
                            <div className="tag-input-group">
                                <input
                                    type="text"
                                    value={currentGenre}
                                    onChange={(e) => this.setState({ currentGenre: e.target.value })}
                                    onKeyDown={this.handleGenreKeyPress}
                                    placeholder="Add genre (eg. Electronic) and press Enter"
                                />
                                {/* <button type="button" class     Name='tag-submit-btn' onClick={this.addGenre}>+</button> */}
                            </div>
                            <div className="tags-list">
                                {formData.genres.map((genre, index) => (
                                    <span key={index} className="tag">
                                        {genre}
                                        <button type="button" className='tag-list-btn' onClick={() => this.removeGenre(genre)}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button type="button" className='delete-btn' onClick={onClose} disabled={saving}>
                                Cancel
                            </button>
                            <button type="submit" className='submit-btn' disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default ProfileEditModal;