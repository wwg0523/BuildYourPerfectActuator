#!/bin/bash
# Environment switching script for Linux/Mac

ENVIRONMENT=${1:-local}

if [[ "$ENVIRONMENT" != "local" && "$ENVIRONMENT" != "nas" ]]; then
    echo "Usage: ./switch-env.sh [local|nas]"
    echo "Default: local"
    exit 1
fi

FRONTEND_ENV="./actuator-front/.env.$ENVIRONMENT"
BACKEND_ENV="./actuator-back/.env.$ENVIRONMENT"
FRONTEND_TARGET="./actuator-front/.env"
BACKEND_TARGET="./actuator-back/.env"

if [ ! -f "$FRONTEND_ENV" ]; then
    echo "File not found: $FRONTEND_ENV"
    exit 1
fi

if [ ! -f "$BACKEND_ENV" ]; then
    echo "File not found: $BACKEND_ENV"
    exit 1
fi

cp "$FRONTEND_ENV" "$FRONTEND_TARGET"
cp "$BACKEND_ENV" "$BACKEND_TARGET"

echo "✓ Environment switched to: $ENVIRONMENT"
echo ""
echo "Current configuration:"
echo "================================"

if [ "$ENVIRONMENT" = "local" ]; then
    echo "Frontend: http://localhost:5005"
    echo "Backend: http://localhost:4004"
    echo "Database: localhost:5433"
    echo ""
    echo "Start with:"
    echo "  docker-compose up -d --build"
else
    echo "Frontend: https://pillar01.synology.me:5005"
    echo "Backend: http://pillar01.synology.me:4004"
    echo "Database: sacrp-postgres-local (NAS internal)"
    echo ""
    echo "Ready for NAS deployment!"
fi
