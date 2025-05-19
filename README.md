# verita

## Features

- **FastAPI** with Python 3.8
- **React 16** with Typescript, Redux, react-router and Tailwind CSS
- Postgres
- SqlAlchemy with Alembic for migrations
- Pytest for backend tests
- Jest for frontend tests
- Perttier/Eslint (with Airbnb style guide)
- Docker compose for easier development
- Nginx as a reverse proxy to allow backend and frontend on the same port

## Development

The only dependencies for this project should be docker and docker-compose.

### Quick Start

Starting the project with hot-reloading enabled
(the first time it will take a while):

```bash
docker-compose up -d
```

The backend runs with `uvicorn --reload` and the frontend
uses `CHOKIDAR_USEPOLLING=true` for reliable hot reloading inside Docker.

To run the alembic migrations (for the users table):

```bash
docker-compose run --rm backend alembic upgrade head
```

And navigate to http://localhost:8000

_Note: If you see an Nginx error at first with a `502: Bad Gateway` page, you may have to wait for webpack to build the development server (the nginx container builds much more quickly)._

Auto-generated docs will be at
http://localhost:8000/api/docs

### Rebuilding containers:

```
docker-compose build
```

### Restarting containers:

```
docker-compose restart
```

### Bringing containers down:

```
docker-compose down
```

### Frontend Development

Alternatively to running inside docker, it can sometimes be easier
to use npm directly for quicker reloading. To run using npm:

```
cd frontend
npm install
npm start
```

This should redirect you to http://localhost:3000

### Frontend Tests

```
cd frontend
npm install
npm test
```

## Migrations

Migrations are run using alembic. To run all migrations:

```
docker-compose run --rm backend alembic upgrade head
```

To create a new migration:

```
alembic revision -m "create users table"
```

And fill in `upgrade` and `downgrade` methods. For more information see
[Alembic's official documentation](https://alembic.sqlalchemy.org/en/latest/tutorial.html#create-a-migration-script).

## Testing

There is a helper script for both frontend and backend tests:

```
./scripts/test.sh
```

### Backend Tests

```
docker-compose run backend pytest
```

any arguments to pytest can also be passed after this command

### Frontend Tests

```
docker-compose run frontend test
```

This is the same as running npm test from within the frontend directory

## Logging

```
docker-compose logs
```

Or for a specific service:

```
docker-compose logs -f name_of_service # frontend|backend|db
```

## Project Layout

```
backend
└── app
    ├── alembic
    │   └── versions # where migrations are located
    ├── api
    │   └── api_v1
    │       └── endpoints
    ├── core    # config
    ├── db      # db models
    ├── tests   # pytest
    └── main.py # entrypoint to backend

frontend
└── public
└── src
    ├── components
    │   └── Home.tsx
    ├── config
    │   └── index.tsx   # constants
    ├── __tests__
    │   ├── home.test.tsx
    │   └── login.test.tsx
    ├── index.tsx   # entrypoint
    └── App.tsx     # handles routing
```

### Vector Database for Integrations

Embeddings for integration actions can be stored in Postgres using the
`pgvector` extension. Run the Alembic migrations to create the table and
extension:

```bash
docker-compose run --rm backend alembic upgrade head
```

Use `index_integrations.py` to load all YAML files from `./integrations`,
generate OpenAI embeddings and populate the database:

```bash
python index_integrations.py
```

Query the database semantically with `search_integrations.py`:

```bash
python search_integrations.py
```

## Clerk Authentication

The project integrates [Clerk](https://clerk.com/) for user management. Configure the following environment variables in your backend to enable authentication:

```
CLERK_SECRET_KEY=<your_clerk_secret_key>
```
The frontend expects the `REACT_APP_CLERK_PUBLISHABLE_KEY` value to be available and wraps the app with `ClerkProvider`.

Environment variables are automatically loaded from a `.env` file when the
backend starts. Place your Clerk credentials and other settings in this file so
they are available without extra configuration.


## Client Generation

The repository includes a helper script to create a Python client from an OpenAPI
specification. The generated client uses `httpx` and also understands optional
`x-streaming` and `x-websocket` extensions for streaming or WebSocket routes.

1. Export your API spec to `openapi.json` using FastAPI's `app.openapi()`.
2. Run the generator:

```bash
python scripts/generate_client.py openapi.json client.py
```

This produces `client.py` with an `APIClient` class for interacting with the
backend asynchronously.