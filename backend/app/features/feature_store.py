from datetime import datetime

import pandas as pd


# ============================================
# TIME SERIES FEATURE STORE
# ============================================

class FeatureStore:


    # ========================================
    # INITIALIZE
    # ========================================

    def __init__(self):

        self.data = pd.DataFrame()


    # ========================================
    # VALIDATE FEATURE DATA
    # ========================================

    def validate_data(

        self,

        dataframe: pd.DataFrame,

    ):


        if dataframe is None:

            raise ValueError(
                "Feature dataframe cannot be None."
            )


        if dataframe.empty:

            raise ValueError(
                "Feature dataframe is empty."
            )


        required_columns = [

            "district",

            "disease",

            "date",

        ]


        missing_columns = [

            column

            for column in required_columns

            if column not in dataframe.columns

        ]


        if missing_columns:

            raise ValueError(

                "Missing required columns: "

                +

                ", ".join(
                    missing_columns
                )

            )


        return True


    # ========================================
    # STORE FEATURES
    # ========================================

    def store_features(

        self,

        dataframe: pd.DataFrame,

    ) -> dict:


        # VALIDATE

        self.validate_data(
            dataframe
        )


        df = dataframe.copy()


        # ====================================
        # CONVERT DATE
        # ====================================

        df["date"] = pd.to_datetime(

            df["date"],

            errors="coerce",

        )


        # REMOVE INVALID DATES

        df = df.dropna(

            subset=[
                "date"
            ]

        )


        # ====================================
        # ADD STORED TIMESTAMP
        # ====================================

        df[
            "feature_stored_at"
        ] = datetime.now()


        # ====================================
        # MERGE WITH EXISTING STORE
        # ====================================

        if self.data.empty:

            self.data = df.copy()


        else:

            self.data = pd.concat(

                [

                    self.data,

                    df,

                ],

                ignore_index=True,

            )


        # ====================================
        # REMOVE DUPLICATES
        # ====================================

        key_columns = [

            "district",

            "disease",

            "date",

        ]


        # INCLUDE VERSION IF AVAILABLE

        if (

            "feature_version"

            in self.data.columns

        ):

            key_columns.append(
                "feature_version"
            )


        self.data = (

            self.data

            .drop_duplicates(

                subset=key_columns,

                keep="last",

            )

            .sort_values(

                by=[

                    "district",

                    "disease",

                    "date",

                ]

            )

            .reset_index(
                drop=True
            )

        )


        return {

            "success": True,

            "stored_records":

                len(df),


            "total_records":

                len(self.data),


            "stored_at":

                str(
                    datetime.now()
                ),

        }


    # ========================================
    # GET ALL FEATURES
    # ========================================

    def get_all_features(

        self,

    ) -> pd.DataFrame:


        return self.data.copy()


    # ========================================
    # GET DISTRICT FEATURES
    # ========================================

    def get_district_features(

        self,

        district: str,

    ) -> pd.DataFrame:


        if self.data.empty:

            return pd.DataFrame()


        return (

            self.data[

                self.data[
                    "district"
                ].astype(str)

                .str.lower()

                ==

                str(district).lower()

            ]

            .copy()

            .reset_index(
                drop=True
            )

        )


    # ========================================
    # GET DISEASE FEATURES
    # ========================================

    def get_disease_features(

        self,

        disease: str,

    ) -> pd.DataFrame:


        if self.data.empty:

            return pd.DataFrame()


        return (

            self.data[

                self.data[
                    "disease"
                ].astype(str)

                .str.lower()

                ==

                str(disease).lower()

            ]

            .copy()

            .reset_index(
                drop=True
            )

        )


    # ========================================
    # GET DISTRICT + DISEASE FEATURES
    # ========================================

    def get_features(

        self,

        district: str,

        disease: str,

    ) -> pd.DataFrame:


        if self.data.empty:

            return pd.DataFrame()


        result = self.data[

            (

                self.data[
                    "district"
                ].astype(str)

                .str.lower()

                ==

                str(district).lower()

            )

            &

            (

                self.data[
                    "disease"
                ].astype(str)

                .str.lower()

                ==

                str(disease).lower()

            )

        ]


        return (

            result

            .sort_values(
                by="date"
            )

            .reset_index(
                drop=True
            )

        )


    # ========================================
    # GET LATEST FEATURES
    # ========================================

    def get_latest_features(

        self,

        district=None,

        disease=None,

    ) -> pd.DataFrame:


        if self.data.empty:

            return pd.DataFrame()


        df = self.data.copy()


        # FILTER DISTRICT

        if district:

            df = df[

                df[
                    "district"
                ].astype(str)

                .str.lower()

                ==

                str(district).lower()

            ]


        # FILTER DISEASE

        if disease:

            df = df[

                df[
                    "disease"
                ].astype(str)

                .str.lower()

                ==

                str(disease).lower()

            ]


        if df.empty:

            return pd.DataFrame()


        group_columns = [

            "district",

            "disease",

        ]


        latest_indexes = (

            df.groupby(
                group_columns
            )["date"]

            .idxmax()

        )


        return (

            df.loc[
                latest_indexes
            ]

            .reset_index(
                drop=True
            )

        )


    # ========================================
    # FEATURE STORE SUMMARY
    # ========================================

    def get_summary(

        self,

    ) -> dict:


        if self.data.empty:

            return {

                "total_records": 0,

                "total_features": 0,

                "districts": 0,

                "diseases": 0,

            }


        return {

            "total_records":

                len(self.data),


            "total_features":

                len(
                    self.data.columns
                ),


            "districts":

                int(

                    self.data[
                        "district"
                    ].nunique()

                ),


            "diseases":

                int(

                    self.data[
                        "disease"
                    ].nunique()

                ),


            "latest_date":

                str(

                    self.data[
                        "date"
                    ].max()

                    .date()

                ),

        }


# ============================================
# GLOBAL FEATURE STORE INSTANCE
# ============================================

feature_store = FeatureStore()