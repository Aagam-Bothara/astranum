"""API routes."""

from fastapi import APIRouter

from app.api.routes import auth, users, guidance, charts, subscriptions, person_profiles, admin

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(users.router, prefix="/users", tags=["Users"])
router.include_router(person_profiles.router, prefix="/person-profiles", tags=["Person Profiles"])
router.include_router(guidance.router, prefix="/guidance", tags=["Guidance"])
router.include_router(charts.router, prefix="/charts", tags=["Charts"])
router.include_router(subscriptions.router, prefix="/subscriptions", tags=["Subscriptions"])
router.include_router(admin.router, prefix="/admin", tags=["Admin"])
