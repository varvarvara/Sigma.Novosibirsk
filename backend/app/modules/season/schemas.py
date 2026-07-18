from datetime import date

from pydantic import BaseModel, model_validator


class SeasonCreate(BaseModel):
    season_year: int
    season_description: str | None = None
    start_date: date
    end_date: date

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("end_date must be greater than or equal to start_date")
        return self


class SeasonOutput(SeasonCreate):
    id: int

    model_config = {"from_attributes": True}
