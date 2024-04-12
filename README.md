# youtube-sharing-app

# How to run the app

- Clone the repository
- Go to server folder by running command `cd server`
- Create a .env file in the server directory with variables

```~~
YOUTUBE_API_KEY=your_youtube_api_key
MONGO_URI=your_mongo_uri
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
REDIS_TTL=your_redis_ttl
```

- Run `docker-compose up -d`

- Go to frontend folder by running command `cd frontend`
- Create a .env file in the frontend directory with variables

```
VITE_API_URL=http://localhost:3000
```

- Run `npm install`
- Run `npm run dev`
- Go to http://localhost:5173/
