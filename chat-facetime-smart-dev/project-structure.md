# Project Structure: chat-facetime-smart-dev

```
chat-facetime-smart-dev/
├── CORS_FIX_GUIDE.md
├── REALTIME_FEATURES.md
├── docker/
│   ├── docker-compose.yml
│   └── .env
│
├── backend/
│   ├── .gitattributes
│   ├── .gitignore
│   ├── .env.cloud
│   ├── Dockerfile
│   ├── HELP.md
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   │
│   ├── .mvn/
│   │   └── wrapper/
│   │       └── maven-wrapper.properties
│   │
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/
│   │   │   │       └── smartchat/
│   │   │   │           └── chatfacetimesmartdev/
│   │   │   │               ├── ChatfacetimesmartdevApplication.java
│   │   │   │               │
│   │   │   │               ├── config/
│   │   │   │               │   ├── DataInitializer.java
│   │   │   │               │   ├── JwtAuthenticationFilter.java
│   │   │   │               │   ├── SecurityConfig.java
│   │   │   │               │   └── WebSocketConfig.java
│   │   │   │               │
│   │   │   │               ├── controller/
│   │   │   │               │   ├── AdminController.java
│   │   │   │               │   ├── AuthController.java
│   │   │   │               │   ├── ChatController.java
│   │   │   │               │   ├── RoomController.java
│   │   │   │               │   └── RoomWebSocketController.java
│   │   │   │               │
│   │   │   │               ├── dto/
│   │   │   │               │   ├── AuthResponseDto.java
│   │   │   │               │   ├── LoginDto.java
│   │   │   │               │   ├── RegisterDto.java
│   │   │   │               │   ├── RoomApprovalDto.java
│   │   │   │               │   ├── RoomCreateDto.java
│   │   │   │               │   ├── RoomDto.java
│   │   │   │               │   ├── RoomJoinDto.java
│   │   │   │               │   └── UserPresence.java
│   │   │   │               │
│   │   │   │               ├── entity/
│   │   │   │               │   ├── Room.java
│   │   │   │               │   └── User.java
│   │   │   │               │
│   │   │   │               ├── model/
│   │   │   │               │   ├── ChatMessage.java
│   │   │   │               │   ├── CodeSnippet.java
│   │   │   │               │   ├── Message.java
│   │   │   │               │   └── User.java
│   │   │   │               │
│   │   │   │               ├── repository/
│   │   │   │               │   ├── CodeSnippetRepository.java
│   │   │   │               │   ├── MessageRepository.java
│   │   │   │               │   ├── RoomRepository.java
│   │   │   │               │   └── UserRepository.java
│   │   │   │               │
│   │   │   │               ├── service/
│   │   │   │               │   ├── AIService.java
│   │   │   │               │   ├── AuthService.java
│   │   │   │               │   ├── ChatService.java
│   │   │   │               │   ├── CustomUserDetailsService.java
│   │   │   │               │   ├── InMemoryPresenceService.java
│   │   │   │               │   ├── PresenceService.java
│   │   │   │               │   ├── RoomPresenceService.java
│   │   │   │               │   ├── RoomService.java
│   │   │   │               │   └── UserService.java
│   │   │   │               │
│   │   │   │               └── util/
│   │   │   │                   └── JwtUtil.java
│   │   │   │
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── .env
│   │   │
│   │   └── test/
│   │       └── java/
│   │           └── com/
│   │               └── smartchat/
│   │                   └── chatfacetimesmartdev/
│   │                       └── ChatfacetimesmartdevApplicationTests.java
│   │
│   └── target/
│       ├── classes/
│       │   ├── application.properties
│       │   └── com/
│       │       └── smartchat/
│       │           └── chatfacetimesmartdev/
│       │               ├── config/
│       │               ├── controller/
│       │               ├── dto/
│       │               ├── entity/
│       │               ├── model/
│       │               ├── repository/
│       │               ├── service/
│       │               └── util/
│       ├── generated-sources/
│       │   └── annotations/
│       ├── generated-test-sources/
│       │   └── test-annotations/
│       └── test-classes/
│           └── com/
│               └── smartchat/
│                   └── chatfacetimesmartdev/
│
└── frontend/
    ├── .env
    ├── .gitignore
    ├── Dockerfile
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vercel.json
    ├── vite.config.js
    │
    ├── public/
    │   └── images/
    │       └── icons/
    │
    └── src/
        ├── App.css
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        │
        ├── assets/
        │   └── images/
        │       ├── github/
        │       └── icons/
        │
        ├── components/
        │   ├── AIAssistant.jsx
        │   ├── ChatBox.jsx
        │   ├── CodeEditor.jsx
        │   ├── ContentDocs.jsx
        │   ├── DocContent.jsx
        │   ├── EnhancedVideoCall.jsx
        │   ├── Features.jsx
        │   ├── Footer.jsx
        │   ├── Header.jsx
        │   ├── HeaderDocs.jsx
        │   ├── Hero.jsx
        │   ├── ProfessionalRoomManager.jsx
        │   ├── ProfessionalVideoCall.jsx
        │   ├── ProfessionalWaitingRoom.jsx
        │   ├── RoomApprovalOverlay.jsx
        │   ├── RoomManager.jsx
        │   ├── SectionCallToAction.jsx
        │   ├── SectionInfo.jsx
        │   ├── SectionLight.jsx
        │   ├── SectionNewsletter.jsx
        │   ├── SectionPricing.jsx
        │   ├── SectionRequirements.jsx
        │   ├── Sidebar.jsx
        │   ├── SidebarDocs.jsx
        │   ├── VideoCall.jsx
        │   ├── WaitingRoom.jsx
        │   │
        │   └── admin/
        │       ├── AdminHeader.jsx
        │       ├── AdminSidebar.jsx
        │       ├── SidebarLink.jsx
        │       ├── StatCard.jsx
        │       ├── StatsCards.jsx
        │       └── UsersTable.jsx
        │
        ├── css/
        │   └── main.css
        │
        ├── layouts/
        │   ├── AdminLayout.jsx
        │   └── MainLayout.jsx
        │
        ├── pages/
        │   ├── AdminDashboard.jsx
        │   ├── ChatRoom.jsx
        │   ├── Consulting.jsx
        │   ├── Contact.jsx
        │   ├── DocsPage.jsx
        │   ├── FAQ.jsx
        │   ├── ForgotPassword.jsx
        │   ├── Home.jsx
        │   ├── HomePage.jsx
        │   ├── Login.jsx
        │   ├── Pricing.jsx
        │   ├── ProfessionalChatRoom.jsx
        │   ├── ProfessionalRoomsPage.jsx
        │   ├── Register.jsx
        │   │
        │   └── admin/
        │       ├── Chat.jsx
        │       ├── Code.jsx
        │       ├── Overview.jsx
        │       ├── Settings.jsx
        │       ├── Users.jsx
        │       └── Video.jsx
        │
        ├── routes/
        │   └── AppRoutes.jsx
        │
        └── services/
            ├── api.js
            └── socket.js
```