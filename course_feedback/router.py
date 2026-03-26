from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.modules.auth.router import get_current_user

from app.modules.course_feedback.service import ReviewService
from app.modules.course_feedback.schemas import (
    ReviewCreate, ReviewUpdate, ReviewOutput, ReviewModerationOutput
)

router = APIRouter(prefix="/course-feedback", tags=["course-feedback"])


def get_review_service(db: Session = Depends(get_db)) -> ReviewService:
    return ReviewService(db=db)


@router.post("/", response_model=ReviewOutput, status_code=201)
async def create_review(
    data: ReviewCreate,
    current_user: dict = Depends(get_current_user),
    service: ReviewService = Depends(get_review_service)
):
    try:
        return service.create_review(data=data, current_user=current_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/course/{course_id}", response_model=List[ReviewOutput])
async def get_course_reviews(
    course_id: int,
    service: ReviewService = Depends(get_review_service)
):
    return service.get_course_reviews(course_id=course_id)


@router.get("/review/{review_id}", response_model=ReviewOutput)
async def get_review(
    review_id: int,
    service: ReviewService = Depends(get_review_service)
):
    return service.get_review_by_id(review_id=review_id)


@router.patch("/review/{review_id}", response_model=ReviewOutput)
async def update_review(
    review_id: int,
    data: ReviewUpdate,
    current_user: dict = Depends(get_current_user),
    service: ReviewService = Depends(get_review_service)
):
    try:
        return service.update_review(review_id=review_id, data=data, current_user=current_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/review/{review_id}", status_code=200)
async def delete_review(
    review_id: int,
    current_user: dict = Depends(get_current_user),
    service: ReviewService = Depends(get_review_service)
):
    return service.delete_review(review_id=review_id, current_user=current_user)


@router.get("/admin/all", response_model=List[ReviewModerationOutput])
async def get_all_reviews_for_admin(
    course_id: Optional[int] = Query(None, description="Filter by course ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    service: ReviewService = Depends(get_review_service)
):
    return service.get_all_reviews_for_moderation(
        current_user=current_user,
        course_id=course_id,
        skip=skip,
        limit=limit
    )