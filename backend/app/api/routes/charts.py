"""Chart routes - for viewing/regenerating chart data."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.chart import ChartSnapshotResponse
from app.models.user import GuidanceMode
from app.api.deps import get_db, get_current_user

router = APIRouter()


@router.get("/current", response_model=ChartSnapshotResponse)
async def get_current_chart(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Get the user's current chart snapshot.

    This is the computed data that LLM uses for guidance.
    """
    # TODO: Implement chart retrieval
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Chart retrieval not yet implemented",
    )


@router.post("/recompute", response_model=ChartSnapshotResponse)
async def recompute_chart(
    mode: GuidanceMode = GuidanceMode.BOTH,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Recompute the user's chart.

    This should be called when:
    - User updates birth details
    - User wants fresh transit data
    - Initial profile creation
    """
    # TODO: Implement chart recomputation
    # 1. Get user profile (birth details)
    # 2. Run numerology engine (if mode includes numerology)
    # 3. Run astrology engine (if mode includes astrology)
    # 4. Compute current transits
    # 5. Store new chart snapshot
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Chart recomputation not yet implemented",
    )


@router.get("/explain/{data_point}")
async def explain_data_point(
    data_point: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Get explanation for a specific chart data point.

    e.g., /explain/sun_sign or /explain/life_path

    This is the "Explain-why dropdown" feature.
    """
    # TODO: Implement data point explanation
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Explanation not yet implemented",
    )
