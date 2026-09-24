from sqlalchemy.orm import Session

from sqlalchemy import func

from app.models.feature_store import (
    FeatureStoreModel,
)


# ============================================
# FEATURE STORE REPOSITORY
# ============================================

class FeatureStoreRepository:


    # ========================================
    # INITIALIZE
    # ========================================

    def __init__(
        self,
        db: Session,
    ):

        self.db = db


    # ========================================
    # NORMALIZE TEXT
    # ========================================

    @staticmethod
    def normalize_text(
        value: str,
    ):

        if value is None:

            return ""

        return str(
            value
        ).strip()


    # ========================================
    # SAVE FEATURE
    # ========================================

    def create_feature(
        self,
        feature_data: dict,
    ):


        # ====================================
        # GET VALID DATABASE COLUMNS
        # ====================================

        valid_columns = {

            column.name

            for column in
            FeatureStoreModel.__table__.columns

        }


        # ====================================
        # REMOVE UNKNOWN COLUMNS
        # ====================================

        filtered_data = {

            key: value

            for key, value
            in feature_data.items()

            if key in valid_columns

        }


        # ====================================
        # NORMALIZE DISTRICT
        # ====================================

        if "district" in filtered_data:

            filtered_data[
                "district"
            ] = self.normalize_text(

                filtered_data[
                    "district"
                ]

            )


        # ====================================
        # NORMALIZE DISEASE
        # ====================================

        if "disease" in filtered_data:

            filtered_data[
                "disease"
            ] = self.normalize_text(

                filtered_data[
                    "disease"
                ]

            )


        try:


            # ====================================
            # CREATE MODEL
            # ====================================

            feature = FeatureStoreModel(

                **filtered_data

            )


            # ====================================
            # SAVE
            # ====================================

            self.db.add(
                feature
            )


            self.db.commit()


            self.db.refresh(
                feature
            )


            return feature


        except Exception:


            # ====================================
            # ROLLBACK
            # ====================================

            self.db.rollback()


            raise


    # ========================================
    # GET BY ID
    # ========================================

    def get_by_id(
        self,
        feature_id: int,
    ):


        return (

            self.db

            .query(
                FeatureStoreModel
            )

            .filter(

                FeatureStoreModel.id
                == feature_id

            )

            .first()

        )


    # ========================================
    # GET DISTRICT FEATURES
    # CASE INSENSITIVE
    # ========================================

    def get_by_district(
        self,
        district: str,
    ):


        clean_district = (
            self.normalize_text(
                district
            )
        )


        return (

            self.db

            .query(
                FeatureStoreModel
            )

            .filter(

                func.lower(
                    FeatureStoreModel.district
                )

                ==

                clean_district.lower()

            )

            .order_by(

                FeatureStoreModel.date
                .desc()

            )

            .all()

        )


    # ========================================
    # GET DISTRICT + DISEASE FEATURES
    # CASE INSENSITIVE
    # ========================================

    def get_features(
        self,
        district: str,
        disease: str,
    ):


        clean_district = (
            self.normalize_text(
                district
            )
        )


        clean_disease = (
            self.normalize_text(
                disease
            )
        )


        return (

            self.db

            .query(
                FeatureStoreModel
            )

            .filter(

                func.lower(
                    FeatureStoreModel.district
                )

                ==

                clean_district.lower(),

                func.lower(
                    FeatureStoreModel.disease
                )

                ==

                clean_disease.lower(),

            )

            .order_by(

                FeatureStoreModel.date
                .desc()

            )

            .all()

        )


    # ========================================
    # GET LATEST FEATURE
    # ========================================

    def get_latest(
        self,
        district: str,
        disease: str,
    ):


        clean_district = (
            self.normalize_text(
                district
            )
        )


        clean_disease = (
            self.normalize_text(
                disease
            )
        )


        return (

            self.db

            .query(
                FeatureStoreModel
            )

            .filter(

                func.lower(
                    FeatureStoreModel.district
                )

                ==

                clean_district.lower(),

                func.lower(
                    FeatureStoreModel.disease
                )

                ==

                clean_disease.lower(),

            )

            .order_by(

                FeatureStoreModel.date
                .desc()

            )

            .first()

        )


    # ========================================
    # GET ALL FEATURES
    # ========================================

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
    ):


        # ====================================
        # SAFETY
        # ====================================

        skip = max(
            0,
            int(skip)
        )


        limit = max(
            1,
            min(
                int(limit),
                10000
            )
        )


        return (

            self.db

            .query(
                FeatureStoreModel
            )

            .order_by(

                FeatureStoreModel.date
                .desc(),

                FeatureStoreModel.id
                .desc(),

            )

            .offset(
                skip
            )

            .limit(
                limit
            )

            .all()

        )


    # ========================================
    # DELETE FEATURE
    # ========================================

    def delete_feature(
        self,
        feature_id: int,
    ):


        feature = self.get_by_id(
            feature_id
        )


        if not feature:

            return False


        try:


            self.db.delete(
                feature
            )


            self.db.commit()


            return True


        except Exception:


            self.db.rollback()


            raise


    # ========================================
    # COUNT ALL FEATURES
    # ========================================

    def count_features(
        self,
    ):


        return (

            self.db

            .query(
                FeatureStoreModel
            )

            .count()

        )


    # ========================================
    # COUNT DISTRICT FEATURES
    # ========================================

    def count_by_district(
        self,
        district: str,
    ):


        clean_district = (
            self.normalize_text(
                district
            )
        )


        return (

            self.db

            .query(
                FeatureStoreModel
            )

            .filter(

                func.lower(
                    FeatureStoreModel.district
                )

                ==

                clean_district.lower()

            )

            .count()

        )


    # ========================================
    # COUNT DISTRICT + DISEASE FEATURES
    # ========================================

    def count_by_district_and_disease(
        self,
        district: str,
        disease: str,
    ):


        clean_district = (
            self.normalize_text(
                district
            )
        )


        clean_disease = (
            self.normalize_text(
                disease
            )
        )


        return (

            self.db

            .query(
                FeatureStoreModel
            )

            .filter(

                func.lower(
                    FeatureStoreModel.district
                )

                ==

                clean_district.lower(),

                func.lower(
                    FeatureStoreModel.disease
                )

                ==

                clean_disease.lower(),

            )

            .count()

        )


    # ========================================
    # GET UNIQUE DISTRICTS
    # ========================================

    def get_unique_districts(
        self,
    ):


        results = (

            self.db

            .query(
                FeatureStoreModel.district
            )

            .distinct()

            .order_by(
                FeatureStoreModel.district
            )

            .all()

        )


        return [

            item[0]

            for item in results

            if item[0]

        ]


    # ========================================
    # GET UNIQUE DISEASES
    # ========================================

    def get_unique_diseases(
        self,
    ):


        results = (

            self.db

            .query(
                FeatureStoreModel.disease
            )

            .distinct()

            .order_by(
                FeatureStoreModel.disease
            )

            .all()

        )


        return [

            item[0]

            for item in results

            if item[0]

        ]