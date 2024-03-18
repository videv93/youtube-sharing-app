# youtube-sharing-app

# How to run the app

- Clone the repository
- cd server
- Run `docker-compose up -d`
- cd frontend
- Run `npm install`
- Run `npm run dev`

# Environment Variables

- Create a .env file in the server directory
- Add the following environment variables

```~~
YOUTUBE_API_KEY=your_youtube_api_key
MONGO_URI=your_mongo_uri
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
REDIS_TTL=your_redis_ttl
~~

```

- Create a .env file in the frontend directory
- Add the following environment variables

```
VITE_API_URL=http://localhost:3000
~~

```
