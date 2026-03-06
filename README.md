# Health-Care
Health Care Application Where users can book appointments

## Docker Setup

This repository includes production-style Docker setup for:
- React frontend (`client`) served by Nginx on `http://localhost:5173`
- Express backend (`server`) on `http://localhost:8000`
- MongoDB on `mongodb://localhost:27017`

### Run with Docker Compose

From the project root (`HealthCareManagement`):

```bash
docker compose up --build
```

To seed realistic mock data after containers are up:

```bash
docker compose exec server npm run seed
```

To use a custom seeded account password:

```bash
docker compose exec -e SEED_DEFAULT_PASSWORD=YourStrongPassword server npm run seed
```

Use npm run seed to populate the database with realistic clinical data.
By default, seeding runs only when the database is empty.

To force reseeding (clears only prior seed-generated records and regenerates them):

```bash
docker compose exec -e FORCE_SEED=true server npm run seed
```

### Stop Containers

```bash
docker compose down
```

To also remove persisted MongoDB and uploads volumes:

```bash
docker compose down -v
```

## Notes

- The compose file sets backend `MONGO_URL` to the MongoDB container (`mongodb://mongo:27017/HealthCare`).
- Update secrets (`JWT_SECRET`, `SESSION_SECRET`, admin passwords) in `docker-compose.yml` before using in production.
