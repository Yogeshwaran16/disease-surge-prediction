from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Float,
    Integer,
    String,
)
from sqlalchemy.sql import func

from app.database import Base


class FeatureStoreModel(Base):

    __tablename__ = "feature_store"

    # ========================================
    # PRIMARY KEY
    # ========================================

    id = Column(Integer, primary_key=True, index=True)

    # ========================================
    # IDENTIFIERS
    # ========================================

    district = Column(String(100), nullable=False, index=True)
    disease = Column(String(100), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)

    # ========================================
    # FEATURE VERSION
    # ========================================

    feature_version = Column(
        String(50),
        nullable=False,
        default="v1.0",
        index=True,
    )

    # ========================================
    # RAW INPUT FEATURES
    # ========================================

    cases = Column(Float, nullable=True)
    rainfall = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    standing_water_index = Column(Float, nullable=True)

    # ========================================
    # MOSQUITO BREEDING INDEX
    # ========================================

    mosquito_breeding_index = Column(Float, nullable=True)
    mbi_risk_level = Column(String(30), nullable=True)

    # ========================================
    # CASE LAG FEATURES
    # ========================================

    cases_lag_7 = Column(Float, nullable=True)
    cases_lag_14 = Column(Float, nullable=True)
    cases_lag_21 = Column(Float, nullable=True)

    # ========================================
    # RAINFALL LAG FEATURES
    # ========================================

    rainfall_lag_7 = Column(Float, nullable=True)
    rainfall_lag_14 = Column(Float, nullable=True)
    rainfall_lag_21 = Column(Float, nullable=True)

    # ========================================
    # HUMIDITY LAG FEATURES
    # ========================================

    humidity_lag_7 = Column(Float, nullable=True)
    humidity_lag_14 = Column(Float, nullable=True)
    humidity_lag_21 = Column(Float, nullable=True)

    # ========================================
    # TEMPERATURE LAG FEATURES
    # ========================================

    temperature_lag_7 = Column(Float, nullable=True)
    temperature_lag_14 = Column(Float, nullable=True)
    temperature_lag_21 = Column(Float, nullable=True)

    # ========================================
    # ROLLING FEATURES
    # ========================================

    cases_rolling_mean_7 = Column(Float, nullable=True)
    cases_rolling_mean_14 = Column(Float, nullable=True)
    cases_rolling_mean_21 = Column(Float, nullable=True)

    rainfall_rolling_mean_7 = Column(Float, nullable=True)
    rainfall_rolling_mean_14 = Column(Float, nullable=True)
    rainfall_rolling_mean_21 = Column(Float, nullable=True)

    humidity_rolling_mean_7 = Column(Float, nullable=True)
    humidity_rolling_mean_14 = Column(Float, nullable=True)
    humidity_rolling_mean_21 = Column(Float, nullable=True)

    temperature_rolling_mean_7 = Column(Float, nullable=True)
    temperature_rolling_mean_14 = Column(Float, nullable=True)
    temperature_rolling_mean_21 = Column(Float, nullable=True)

    # ========================================
    # TREND FEATURES
    # ========================================

    cases_trend_slope = Column(Float, nullable=True)
    rainfall_trend_slope = Column(Float, nullable=True)
    humidity_trend_slope = Column(Float, nullable=True)
    temperature_trend_slope = Column(Float, nullable=True)
    cases_ma_crossover = Column(Float, nullable=True)
    cases_trend_signal = Column(String(30), nullable=True)

    rainfall_trend_signal = Column(String(30), nullable=True)
    humidity_trend_signal = Column(String(30), nullable=True)
    temperature_trend_signal = Column(String(30), nullable=True)

    
    # ========================================
    # SEASONAL FEATURES
    # ========================================

    year = Column(Integer, nullable=True)
    month = Column(Integer, nullable=True)
    week_of_year = Column(Integer, nullable=True)
    day_of_year = Column(Integer, nullable=True)

    month_sin = Column(Float, nullable=True)
    month_cos = Column(Float, nullable=True)

    week_sin = Column(Float, nullable=True)
    week_cos = Column(Float, nullable=True)

    day_of_year_sin = Column(Float, nullable=True)
    day_of_year_cos = Column(Float, nullable=True)

    season = Column(String(50), nullable=True)
    is_monsoon = Column(Integer, nullable=True)

    # ========================================
    # TIMESTAMPS
    # ========================================

    feature_created_at = Column(
        DateTime,
        server_default=func.now(),
    )

    feature_stored_at = Column(
        DateTime,
        server_default=func.now(),
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
    )

    # ========================================
    # TO DICTIONARY
    # ========================================

    def to_dict(self):

        return {

            "id": self.id,

            "district": self.district,
            "disease": self.disease,
            "date": self.date.isoformat() if self.date else None,

            "feature_version": self.feature_version,

            # RAW
            "cases": self.cases,
            "rainfall": self.rainfall,
            "humidity": self.humidity,
            "temperature": self.temperature,
            "standing_water_index": self.standing_water_index,

            # MOSQUITO
            "mosquito_breeding_index": self.mosquito_breeding_index,
            "mbi_risk_level": self.mbi_risk_level,

            # CASE LAGS
            "cases_lag_7": self.cases_lag_7,
            "cases_lag_14": self.cases_lag_14,
            "cases_lag_21": self.cases_lag_21,

            # RAINFALL LAGS
            "rainfall_lag_7": self.rainfall_lag_7,
            "rainfall_lag_14": self.rainfall_lag_14,
            "rainfall_lag_21": self.rainfall_lag_21,

            # HUMIDITY LAGS
            "humidity_lag_7": self.humidity_lag_7,
            "humidity_lag_14": self.humidity_lag_14,
            "humidity_lag_21": self.humidity_lag_21,

            # TEMPERATURE LAGS
            "temperature_lag_7": self.temperature_lag_7,
            "temperature_lag_14": self.temperature_lag_14,
            "temperature_lag_21": self.temperature_lag_21,

            # ROLLING
            "cases_rolling_mean_7": self.cases_rolling_mean_7,
            "cases_rolling_mean_14": self.cases_rolling_mean_14,
            "cases_rolling_mean_21": self.cases_rolling_mean_21,

            "rainfall_rolling_mean_7": self.rainfall_rolling_mean_7,
            "rainfall_rolling_mean_14": self.rainfall_rolling_mean_14,
            "rainfall_rolling_mean_21": self.rainfall_rolling_mean_21,

            "humidity_rolling_mean_7": self.humidity_rolling_mean_7,
            "humidity_rolling_mean_14": self.humidity_rolling_mean_14,
            "humidity_rolling_mean_21": self.humidity_rolling_mean_21,

            "temperature_rolling_mean_7": self.temperature_rolling_mean_7,
            "temperature_rolling_mean_14": self.temperature_rolling_mean_14,
            "temperature_rolling_mean_21": self.temperature_rolling_mean_21,

            # TREND
            "cases_trend_slope": self.cases_trend_slope,
            "rainfall_trend_slope": self.rainfall_trend_slope,
            "humidity_trend_slope": self.humidity_trend_slope,
            "temperature_trend_slope": self.temperature_trend_slope,

            "cases_ma_crossover": self.cases_ma_crossover,
            "cases_trend_signal": self.cases_trend_signal,

            "rainfall_trend_signal": self.rainfall_trend_signal,
            "humidity_trend_signal": self.humidity_trend_signal,
            "temperature_trend_signal": self.temperature_trend_signal,

            # SEASONAL
            "year": self.year,
            "month": self.month,
            "week_of_year": self.week_of_year,
            "day_of_year": self.day_of_year,

            "month_sin": self.month_sin,
            "month_cos": self.month_cos,

            "week_sin": self.week_sin,
            "week_cos": self.week_cos,

            "day_of_year_sin": self.day_of_year_sin,
            "day_of_year_cos": self.day_of_year_cos,

            "season": self.season,
            "is_monsoon": self.is_monsoon,

            # TIMESTAMPS
            "feature_created_at": (
                self.feature_created_at.isoformat()
                if self.feature_created_at
                else None
            ),

            "feature_stored_at": (
                self.feature_stored_at.isoformat()
                if self.feature_stored_at
                else None
            ),

            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
        }