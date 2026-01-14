<img width="500" height="100" alt="JOINSOUNDS" src="https://github.com/user-attachments/assets/47978eae-732a-4898-ae88-f3758b5e108f" />

### JoinSounds is a modern web application designed for music creators and music enthusiasts. The platform serves as a comprehensive space for sharing audio tracks, discussing specific segments through precise time-stamped comments, and exchanging music production experiences.

## ⚠️ Status & Development Notes
Learning Project: This is my first major project built using the Spring framework. It was created as a primary way to learn and master the ecosystem.

Work in Progress: This project is currently in the active development phase.


Clean Code: The codebase is undergoing continuous refactoring to better align with Clean Code and SOLID principles.

AI Assistance: The frontend layer of this application was developed with the significant assistance of Artificial Intelligence tools.

## 🚀 Key Features

### Time-Stamped Comments: Users can add precise comments assigned to specific time intervals of an audio track, visualized using interactive waveforms.
<img width="1292" height="1059" alt="image" src="https://github.com/user-attachments/assets/06ea8a88-2788-4a06-99ae-83fa01559e80" />

### Daily Post System: A daily recommendation mechanism that randomly selects and promotes one finished project every 24 hours to all users.
<img width="1303" height="861" alt="image" src="https://github.com/user-attachments/assets/988cf1af-f386-43c1-b1f4-826d16c54460" />

### Discovery Tools: A tagging system allowing users to search and filter projects by genre, software used, or specific instruments.
<img width="1302" height="161" alt="image" src="https://github.com/user-attachments/assets/40fc72b4-6b41-46ad-99fa-84e5ea82a5db" />

### User Profiles: Users can personalize their public profiles by adding a profile picture, a biography, a list of used tools and software, and their favorite music genres.
<img width="878" height="924" alt="image" src="https://github.com/user-attachments/assets/4d6ea8c6-0e1d-4048-b600-3524ba85f3d5" />

<img width="543" height="716" alt="image" src="https://github.com/user-attachments/assets/44603d0f-4754-40b3-b1d7-9e153b2f9bd6" />

### Personalized Recommendations: An algorithm that analyzes user activity (likes and comments) to suggest posts tailored to individual tastes.
### Real-Time Communication: A built-in chat module and notification system powered by WebSockets for instant interaction between creators.
<img width="355" height="503" alt="image" src="https://github.com/user-attachments/assets/b3a2e5ae-b03e-48fb-b78e-565827d2a57f" />

### Project Analytics: Tools for users to track the popularity and community engagement of their projects over time.



## 🛠️ Technology Stack

**Backend**
- Java & Spring Boot: Core server-side framework.
- Spring Security & JWT: Handles authentication and authorization.
- Hibernate & Spring Data JPA: Object-relational mapping for MySQL database communication.
- MySQL: Relational database storage.
- FFmpeg: Server-side processing and compression of audio files.
- Maven: Dependency management.
**Frontend**
- React: Component-based library for the user interface.
- Vite: Fast build tool for the development environment.
- WaveSurfer.js: Audio waveform visualization and time-stamped area selection.
- SockJS & StompJS: Real-time communication via WebSockets.
- Axios: HTTP client for API requests.
- PrimeReact & React Icons: UI components and aesthetic icons.
