#!/usr/bin/env python3
"""
Main FastAPI application for Goblin Assistant
Combines all the routers into a single application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Initialize Sentry for error monitoring
try:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.starlette import StarletteIntegration

    sentry_sdk.init(
        dsn="https://5c879ce5d51bef64d0790a645415d5cc@o4510481074683904.ingest.us.sentry.io/4510481074946048",
        # Enable performance monitoring
        traces_sample_rate=1.0,
        # Enable profiling
        profiles_sample_rate=1.0,
        # Enable request body capture
        send_default_pii=True,
        # Integrations
        integrations=[
            StarletteIntegration(transaction_style="endpoint"),
            FastApiIntegration(transaction_style="endpoint"),
        ],
        # Environment
        environment=os.getenv("ENVIRONMENT", "development"),
        # Release tracking
        release=os.getenv("RELEASE_VERSION", "goblin-assistant@1.0.0"),
    )
    print("✅ Sentry SDK initialized for error monitoring")
except ImportError:
    print("⚠️  Sentry SDK not available - install with: pip install sentry-sdk")
except Exception as e:
    print(f"⚠️  Failed to initialize Sentry SDK: {e}")

# Import all routers (use package-qualified imports so tests can import api.main)
from api.api_router import router as api_router
from api.auth.router import router as auth_router
from api.routing_router import router as routing_router
from api.execute_router import router as execute_router
from api.parse_router import router as parse_router
from api.raptor_router import router as raptor_router
from api.api_keys_router import router as api_keys_router
from api.settings_router import router as settings_router
from api.search_router import router as search_router
from api.stream_router import router as stream_router
from api.chat_router import router as chat_router
from api.health import router as health_router
from api.ops_router import router as ops_router
from api.secrets_router import (
    router as secrets_router,
    init_secrets_adapter,
    cleanup_secrets_adapter,
)
from api.storage.cache import cache
from api.storage.database import init_db

# from api.middleware import ErrorHandlingMiddleware, AuthenticationMiddleware
from api.monitoring import monitor
from api.security_config import SecurityConfig

# Create FastAPI app
app = FastAPI(
    title="Goblin Assistant API",
    description="AI-powered development assistant with multi-provider routing",
    version="1.0.0",
)


@app.on_event("startup")
async def startup_event():
    """Initialize resources on startup"""
    try:
        print("🚀 Starting Goblin Assistant API...")

        # Initialize Redis cache
        print("📦 Initializing Redis cache...")
        try:
            await cache.init_redis()
            print("✅ Redis cache initialized")
        except Exception as e:
            print(f"⚠️  Redis initialization failed: {e}")
            print("   Continuing without Redis cache - performance may be reduced")

        # Initialize database tables (optional for now)
        print("🗄️  Checking database availability...")
        try:
            db_initialized = await init_db()
            if db_initialized:
                print("✅ Database initialized")
            else:
                print("⚠️  Database initialization skipped - running in limited mode")
        except Exception as e:
            print(f"⚠️  Database initialization failed: {e}")
            print("   Continuing without database - some features may be limited")

        # Start provider monitoring
        print("📊 Starting provider monitoring...")
        try:
            await monitor.start()
            print("✅ Provider monitoring started")
        except Exception as e:
            print(f"⚠️  Provider monitoring failed to start: {e}")
            print("   Continuing without provider monitoring...")

        # Initialize secrets adapter
        print("🔐 Initializing secrets adapter...")
        try:
            await init_secrets_adapter()
            print("✅ Secrets adapter initialized")
        except Exception as e:
            print(f"⚠️  Warning: Failed to initialize secrets adapter: {e}")
            print("   Continuing startup without secrets management...")

        print("🎉 Goblin Assistant API startup complete!")

    except Exception as e:
        print(f"❌ Critical startup error: {e}")
        print("💥 Application will restart due to startup failure")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown"""
    try:
        print("🛑 Shutting down Goblin Assistant API...")

        print("📊 Stopping provider monitoring...")
        await monitor.stop()
        print("✅ Provider monitoring stopped")

        print("📦 Closing Redis cache...")
        await cache.close()
        print("✅ Redis cache closed")

        print("🔐 Cleaning up secrets adapter...")
        try:
            await cleanup_secrets_adapter()
            print("✅ Secrets adapter cleaned up")
        except Exception as e:
            print(f"⚠️  Warning: Failed to cleanup secrets adapter: {e}")

        print("🎉 Goblin Assistant API shutdown complete!")

    except Exception as e:
        print(f"❌ Error during shutdown: {e}")
        # Don't raise here as we're shutting down


# Add Error Handling middleware
# Temporarily disabled for testing
# app.add_middleware(ErrorHandlingMiddleware)

# Add Authentication middleware
# Temporarily disabled for testing
# app.add_middleware(
#     AuthenticationMiddleware,
#     exclude_paths=[
#         "/health",
#         "/docs",
#         "/openapi.json",
#         "/redoc",
#         "/auth/register",
#         "/auth/login",
#         "/auth/oauth/google",
#         "/auth/oauth/google/callback",
#         "/auth/passkey/register",
#         "/auth/passkey/authenticate",
#     ],
# )

# Add CORS middleware
# Environment-aware CORS configuration
environment = os.getenv("ENVIRONMENT", "development").lower()
if environment == "production":
    # Production: Only allow specific origins, no wildcards
    allowed_origins = (
        os.getenv("ALLOWED_ORIGINS", "").split(",")
        if os.getenv("ALLOWED_ORIGINS")
        else []
    )
    if not allowed_origins:
        print("⚠️  SECURITY WARNING: No ALLOWED_ORIGINS configured for production!")
        print("   Set ALLOWED_ORIGINS environment variable with comma-separated URLs")
        allowed_origins = []  # Block all CORS in production if not configured
else:
    # Development: Allow localhost
    allowed_origins = (
        os.getenv("ALLOWED_ORIGINS", "").split(",")
        if os.getenv("ALLOWED_ORIGINS")
        else ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"]
    )

if "*" in allowed_origins:
    print("🚨 SECURITY RISK: CORS is configured to allow all origins (*)!")
    print(
        "   This is acceptable only for development. Set specific origins for production."
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"]
    if environment != "production"
    else [
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-API-Key",
        "X-CSRF-Token",
    ],
)

# Include all routers
app.include_router(api_router)
app.include_router(auth_router)
app.include_router(routing_router)
app.include_router(execute_router)
app.include_router(parse_router)
app.include_router(raptor_router)
app.include_router(api_keys_router)
app.include_router(settings_router)
app.include_router(search_router)
app.include_router(stream_router)
app.include_router(chat_router)
app.include_router(health_router)
app.include_router(ops_router)
app.include_router(secrets_router)


@app.get("/test")
async def test_endpoint():
    """Simple test endpoint without database"""
    return {"message": "Server is working", "status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8003)
