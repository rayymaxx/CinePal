# CinePal Backend - AI Movie Recommender API

A sophisticated FastAPI-based backend service for the CinePal AI movie recommendation system. Features JWT authentication, intelligent LLM-powered recommendation chains, TMDB integration, and persistent chat history.

## 🎯 Overview

CinePal Backend is a production-ready Python service that powers personalized movie and TV show recommendations through conversational AI. It combines LLMs with retrieval-augmented generation (RAG), user preference management, and real-time conversation handling.

## ✨ Key Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication**: Secure token generation and validation
- **User Registration**: Email verification with bcrypt password hashing
- **Session Management**: 24-hour token expiration
- **User Profiles**: Preference tracking and personalization
- **Secure Endpoints**: Role-based access control

### 💬 Intelligent Conversation System
- **LLM-Powered Chat**: Conversational responses using LangChain
- **Intent Recognition**: Automatic detection of user intent (recommendation, profile update, etc.)
- **Conversation Memory**: Persistent chat history per session
- **Context Enhancement**: Dynamic conversation context building
- **Multi-turn Dialogue**: Maintains conversation context across messages

### 🎬 Movie Recommendation Engine
- **RAG Integration**: Retrieval-Augmented Generation using vector embeddings
- **TMDB Integration**: Real-time movie data and metadata
- **Preference Matching**: Personalized recommendations based on user preferences
- **Show Retrieval**: Intelligent querying against movie database
- **Scoring System**: Weighted recommendations based on user profile

### 📊 User Management
- **Profile Creation**: User registration and authentication
- **Preference Management**: Store and update user preferences (genre, actors, moods)
- **Interaction History**: Track all conversations and recommendations
- **Session Management**: Multiple independent chat sessions per user

### 🔄 Data Integration
- **TMDB API**: Comprehensive movie/TV show database access
- **Serper API**: Web search for real-time information
- **ChromaDB**: Vector database for semantic search
- **SQLite Database**: Persistent data storage

### 🚀 Performance Features
- **Async Processing**: Non-blocking API operations
- **Connection Pooling**: Efficient database connection management
- **Caching**: LLM response caching and optimization
- **Batch Operations**: Efficient bulk data processing

## 🏗️ Architecture

### Project Structure

```
backend/
├── app/
│   ├── api/                     # API endpoints
│   │   └── endpoints/
│   │       ├── auth.py          # Authentication endpoints
│   │       ├── chat.py          # Chat/recommendation endpoint
│   │       └── images.py        # Image proxy endpoint
│   │
│   ├── chains/                  # LLM Chain orchestration
│   │   ├── main_chain.py        # Main orchestration pipeline
│   │   ├── intent_parser.py     # Intent recognition chain
│   │   ├── context_enhancer.py  # Context building chain
│   │   ├── memory_manager.py    # Conversation memory chain
│   │   ├── show_retriever.py    # RAG retrieval chain
│   │   └── response_generator.py# Response generation chain
│   │
│   ├── models/                  # Data models
│   │   ├── database_models.py   # SQLAlchemy ORM models
│   │   └── pydantic_models.py   # Pydantic request/response schemas
│   │
│   ├── services/                # Business logic
│   │   ├── database.py          # Database setup & session management
│   │   ├── user_manager.py      # User CRUD operations
│   │   ├── history_manager.py   # Chat history management
│   │   ├── show_manager.py      # Movie/show data management
│   │   ├── tmdb_client.py       # TMDB API integration
│   │   └── serper_client.py     # Web search integration
│   │
│   ├── core/                    # Core utilities
│   │   ├── auth.py              # JWT token generation
│   │   ├── security.py          # Security utilities & password hashing
│   │   └── config.py            # Configuration management
│   │
│   └── main.py                  # FastAPI application entry point
│
├── scripts/                     # Utility scripts
│   ├── initial_data.py         # Sample data generation
│   └── populate_database.py    # Database initialization
│
├── tests/                       # Test suite
│   ├── test_api/
│   └── conftest.py
│
├── data/                        # Data files
│   └── sqlite.db               # SQLite database
│
├── venv/                        # Python virtual environment
├── requirements.txt             # Python dependencies
├── .env                         # Environment variables
└── README.md                    # This file
```

### Core Components

#### 1. **API Endpoints** (`api/endpoints/`)

**Authentication Endpoints** (`auth.py`)
- `POST /auth/register` - User registration
- `POST /auth/token` - Login and get JWT token
- `GET /auth/profile` - Get current user profile

**Chat Endpoints** (`chat.py`)
- `POST /api/chat` - Send message and get AI recommendation
- `GET /api/chat/history` - Retrieve conversation history
- `GET /api/chat/sessions` - List all user sessions

**Image Endpoints** (`images.py`)
- `GET /api/images/proxy` - Proxy TMDB images (CORS handling)

#### 2. **LLM Chains** (`chains/`)

The chain architecture implements an advanced recommendation pipeline:

```
User Input
    ↓
Intent Parser → Identifies intent type
    ↓
Context Enhancer → Builds conversation context
    ↓
Memory Manager → Retrieves conversation history
    ↓
[Conditional Branch]
    ├→ If RECOMMENDATION: Show Retriever (RAG) → Query movie database
    └→ If Other: Skip retrieval
    ↓
Response Generator → Generate AI response
    ↓
Save Interaction → Store in database
    ↓
Response to Frontend
```

**Chain Components:**
- **Intent Parser**: Classifies user intent using LLM
- **Context Enhancer**: Creates concise context summary
- **Memory Manager**: Retrieves and formats chat history
- **Show Retriever**: Performs RAG against movie database
- **Response Generator**: Generates final conversational response

#### 3. **Data Models** (`models/`)

**Database Models** (`database_models.py`)
```python
User
├── id (Primary Key)
├── user_name (Unique)
├── user_email (Unique)
├── hashed_password
├── created_at
├── is_active
└── relationships:
    ├── preferences (UserPreference)
    └── interactions (InteractionHistoryInDB)

UserPreference
├── id
├── user_id (Foreign Key)
├── preference_type (genre, actor, mood, etc.)
├── preference_value
├── score
└── last_updated

InteractionHistoryInDB
├── id
├── user_id (Foreign Key)
├── session_id
├── user_message
├── ai_response
├── recommended_shows (JSON)
└── created_at

ChatSession
├── id
├── user_id (Foreign Key)
├── session_name
├── created_at
└── interactions (array)
```

**Pydantic Models** (`pydantic_models.py`)
- `UserRegistrationRequest` - Registration payload
- `UserLoginRequest` - Login credentials
- `Token` - JWT token response
- `UserProfileResponse` - User profile data
- `ChatMessage` - Individual message in conversation
- `ChatRequest` - Incoming chat request
- `ChatResponse` - Chat response with recommendations
- `Intent` - Parsed intent from user message

#### 4. **Services** (`services/`)

**User Manager** (`user_manager.py`)
- Create new users
- Retrieve user profiles
- Update user preferences
- Manage user activation status

**History Manager** (`history_manager.py`)
- Save chat interactions
- Retrieve chat history
- Manage sessions
- Format history for LLM context

**Show Manager** (`show_manager.py`)
- Manage movie/show database
- Handle show metadata
- Support RAG retrieval

**TMDB Client** (`tmdb_client.py`)
- Fetch movie/show data
- Get posters and metadata
- Search functionality
- Real-time data updates

**Serper Client** (`serper_client.py`)
- Web search integration
- Current information retrieval
- News and updates about movies

**Database** (`database.py`)
- SQLAlchemy engine setup
- Session management
- Table creation and initialization
- Connection pooling

#### 5. **Core Utilities** (`core/`)

**Authentication** (`auth.py`)
- JWT token generation
- Token expiration handling
- Token refresh logic

**Security** (`security.py`)
- Bcrypt password hashing
- Password verification
- Current user extraction from token
- Protected route dependencies

**Config** (`config.py`)
- Environment variable management
- API keys and credentials
- Database configuration

### Data Flow

```
Frontend Request
    ↓
FastAPI Router
    ↓
Dependency Injection (Auth, DB)
    ↓
Endpoint Handler
    ├→ Validation (Pydantic)
    ├→ Authentication Check
    └→ Business Logic
        ↓
        Service Layer
        ├→ User Manager
        ├→ History Manager
        ├→ TMDB Client
        └→ Show Manager
        ↓
        LLM Chain Pipeline
        ├→ Intent Recognition
        ├→ Context Building
        ├→ RAG Retrieval
        └→ Response Generation
        ↓
        Database Operations
        ↓
Response Object
    ↓
JSON Response
    ↓
Frontend
```

## 🛠️ Technology Stack

| Technology | Purpose | Use Case |
|-----------|---------|----------|
| FastAPI | Web Framework | REST API development |
| SQLAlchemy | ORM | Database operations |
| SQLite | Database | Data persistence |
| LangChain | LLM Orchestration | Chain and memory management |
| ChromaDB | Vector Database | Semantic search & RAG |
| Pydantic | Data Validation | Request/response schemas |
| PyJWT | Authentication | JWT token handling |
| Bcrypt | Password Security | Password hashing |
| Python-multipart | File Upload | Form data handling |
| Uvicorn | ASGI Server | Production server |
| TMDB API | Movie Data | Real-time show information |
| Serper API | Web Search | Current information |

## 📥 Installation & Setup

### Prerequisites
- Python 3.10 or higher
- pip package manager
- SQLite (usually pre-installed)
- TMDB API key
- Serper API key (optional for web search)

### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Create .env file with configuration
cp .env.example .env
# Edit .env with your API keys and settings

# 6. Initialize database
python scripts/populate_database.py

# 7. Run the server
uvicorn app.main:app --reload
```

### Environment Configuration (`.env`)

```env
# Database
DATABASE_URL=sqlite:///data/sqlite.db

# JWT Settings
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# API Keys
TMDB_API_KEY=your_tmdb_api_key
SERPER_API_KEY=your_serper_api_key

# LLM Configuration
OPENAI_API_KEY=your_openai_api_key
LLM_MODEL=gpt-4-turbo-preview

# Server
HOST=0.0.0.0
PORT=8000
```

## 🚀 Running the Application

### Development Server

```bash
# With hot reload
uvicorn app.main:app --reload

# With specific host/port
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Production Deployment

```bash
# Using Uvicorn with workers
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Using Gunicorn + Uvicorn
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker Deployment

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

## 📚 API Endpoints

### Authentication

**Register User**
```http
POST /auth/register
Content-Type: application/json

{
  "user_name": "john_doe",
  "user_email": "john@example.com",
  "password": "securepassword123",
  "password_confirmation": "securepassword123"
}

Response: 201 Created
{
  "message": "User registered successfully."
}
```

**Login**
```http
POST /auth/token
Content-Type: application/x-www-form-urlencoded

username=john_doe&password=securepassword123

Response: 200 OK
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

**Get Profile**
```http
GET /auth/profile
Authorization: Bearer <access_token>

Response: 200 OK
{
  "user_id": "1",
  "user_name": "john_doe",
  "user_email": "john@example.com",
  "preferences": ["sci-fi", "action", "thriller"],
  "created_at": "2025-12-25T10:00:00"
}
```

### Chat & Recommendations

**Send Message**
```http
POST /api/chat
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "message": "Recommend me a good sci-fi movie",
  "session_id": "session_123456"
}

Response: 200 OK
{
  "response": "Based on your preferences, I'd recommend...",
  "intent": "recommendation",
  "recommended_shows": [
    {
      "id": "550",
      "title": "Inception",
      "poster_path": "/path/to/poster.jpg",
      "rating": 8.8
    }
  ],
  "session_id": "session_123456"
}
```

**Get Chat History**
```http
GET /api/chat/history?session_id=session_123456
Authorization: Bearer <access_token>

Response: 200 OK
{
  "messages": [
    {
      "role": "user",
      "content": "Recommend a sci-fi movie",
      "timestamp": "2025-12-25T10:00:00"
    },
    {
      "role": "assistant",
      "content": "Based on your preferences...",
      "timestamp": "2025-12-25T10:00:05"
    }
  ]
}
```

## 🔐 Security Features

### Password Security
- Bcrypt hashing with salt
- Never store plaintext passwords
- Password strength validation

### JWT Authentication
- HS256 signing algorithm
- Token expiration (default 24 hours)
- Refresh token support
- Secure token storage in HTTP-only cookies (recommended)

### API Security
- CORS configuration
- Rate limiting (recommended for production)
- Input validation with Pydantic
- SQL injection prevention (SQLAlchemy ORM)

### Data Protection
- User preference encryption (recommended)
- Secure API key management
- Environment variable configuration
- Database access controls

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    user_name VARCHAR UNIQUE NOT NULL,
    user_email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

### User Preferences Table
```sql
CREATE TABLE user_preferences (
    id INTEGER PRIMARY KEY,
    user_id INTEGER FOREIGN KEY,
    preference_type VARCHAR,
    preference_value VARCHAR,
    score FLOAT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Interaction History Table
```sql
CREATE TABLE interaction_history (
    id INTEGER PRIMARY KEY,
    user_id INTEGER FOREIGN KEY,
    session_id VARCHAR,
    user_message TEXT,
    ai_response TEXT,
    recommended_shows JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Chat Sessions Table
```sql
CREATE TABLE chat_sessions (
    id VARCHAR PRIMARY KEY,
    user_id INTEGER FOREIGN KEY,
    session_name VARCHAR,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 LLM Configuration

The system uses OpenAI's GPT-4 Turbo by default but is flexible:

### Supported Models
- GPT-4 Turbo (Recommended)
- GPT-3.5 Turbo (Cost-effective)
- Other LangChain-compatible models

### Customization
Edit `app/chains/` to change:
- Model selection
- Temperature (creativity)
- Max tokens (response length)
- System prompts

## 🧪 Testing

### Run Tests
```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_api/test_auth.py

# Run with coverage
pytest --cov=app
```

### Test Structure
```
tests/
├── test_api/
│   ├── test_auth.py          # Auth endpoint tests
│   ├── test_chat.py          # Chat endpoint tests
│   └── test_images.py        # Image endpoint tests
├── test_chains/              # Chain logic tests
├── test_services/            # Service tests
└── conftest.py              # Pytest configuration
```

## 📈 Performance Optimization

### Database Optimization
- Connection pooling
- Index on frequently queried columns
- Query optimization

### LLM Optimization
- Response caching
- Prompt engineering for efficiency
- Batch processing where possible

### API Optimization
- Async/await for I/O operations
- Response compression (gzip)
- Request validation before processing

## 🐛 Debugging

### Logging Configuration
```python
import logging

logger = logging.getLogger(__name__)
logger.info("Application started")
logger.error("Error occurred", exc_info=True)
```

### Common Issues

**Database Connection Error**
- Check DATABASE_URL in .env
- Ensure data/ directory exists
- Verify SQLite installation

**API Key Issues**
- Verify TMDB_API_KEY in .env
- Check API rate limits
- Confirm key permissions

**LLM Errors**
- Validate OPENAI_API_KEY
- Check OpenAI account balance
- Review prompt formatting

## 📚 API Documentation

### Automatic Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## 🤝 Contributing

### Code Style
- PEP 8 compliance
- Type hints throughout
- Docstrings for all functions

### Commit Guidelines
- Clear, descriptive messages
- Feature branches for new features
- Pull requests with detailed descriptions

### Database Migrations
- Use Alembic for schema changes
- Version control all migrations
- Test migrations before deployment

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- FastAPI for the modern web framework
- LangChain for LLM orchestration
- TMDB for movie data
- OpenAI for language models
- SQLAlchemy for ORM excellence

---

**CinePal Backend** - Powering intelligent movie recommendations! 🎬✨
