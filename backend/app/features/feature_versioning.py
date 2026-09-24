from datetime import datetime

import pandas as pd


# ============================================
# FEATURE VERSION MANAGER
# ============================================

class FeatureVersionManager:


    # ========================================
    # INITIALIZE
    # ========================================

    def __init__(

        self,

        default_version="v1.0",

    ):

        self.default_version = (
            default_version
        )


    # ========================================
    # ADD VERSION
    # ========================================

    def add_version(

        self,

        dataframe: pd.DataFrame,

        version=None,

    ) -> pd.DataFrame:


        if dataframe is None:

            raise ValueError(

                "Dataframe cannot be None."

            )


        df = dataframe.copy()


        feature_version = (

            version

            or

            self.default_version

        )


        # ADD FEATURE VERSION

        df[
            "feature_version"
        ] = feature_version


        # ADD CREATED TIME

        df[
            "feature_created_at"
        ] = datetime.now()


        return df


    # ========================================
    # GET LATEST VERSION
    # ========================================

    def get_latest_version(

        self,

        dataframe: pd.DataFrame,

    ) -> str:


        if dataframe is None:

            return self.default_version


        if dataframe.empty:

            return self.default_version


        if (

            "feature_version"

            not in dataframe.columns

        ):

            return self.default_version


        versions = (

            dataframe[
                "feature_version"
            ]

            .dropna()

            .astype(str)

            .unique()

            .tolist()

        )


        if not versions:

            return self.default_version


        return sorted(
            versions
        )[-1]


    # ========================================
    # FILTER DATA BY VERSION
    # ========================================

    def get_version_data(

        self,

        dataframe: pd.DataFrame,

        version: str,

    ) -> pd.DataFrame:


        if dataframe is None:

            return pd.DataFrame()


        if dataframe.empty:

            return dataframe.copy()


        if (

            "feature_version"

            not in dataframe.columns

        ):

            return pd.DataFrame()


        result = (

            dataframe[

                dataframe[
                    "feature_version"
                ].astype(str)

                ==

                str(version)

            ]

            .copy()

            .reset_index(
                drop=True
            )

        )


        return result


    # ========================================
    # GET VERSION SUMMARY
    # ========================================

    def get_version_summary(

        self,

        dataframe: pd.DataFrame,

    ) -> dict:


        # EMPTY DATA

        if dataframe is None:

            return {

                "total_records": 0,

                "versions": [],

                "version_counts": {},

                "latest_version":

                    self.default_version,

            }


        if dataframe.empty:

            return {

                "total_records": 0,

                "versions": [],

                "version_counts": {},

                "latest_version":

                    self.default_version,

            }


        # VERSION COLUMN MISSING

        if (

            "feature_version"

            not in dataframe.columns

        ):

            return {

                "total_records":

                    len(dataframe),

                "versions": [],

                "version_counts": {},

                "latest_version":

                    self.default_version,

            }


        # COUNT VERSIONS

        version_counts = (

            dataframe[
                "feature_version"
            ]

            .value_counts()

            .to_dict()

        )


        versions = sorted(

            [

                str(version)

                for version

                in version_counts.keys()

            ]

        )


        return {

            "total_records":

                len(dataframe),


            "versions":

                versions,


            "version_counts":

                {

                    str(key): int(value)

                    for key, value

                    in version_counts.items()

                },


            "latest_version":

                self.get_latest_version(
                    dataframe
                ),

        }


# ============================================
# CONVENIENCE FUNCTION
# ============================================

def add_feature_version(

    dataframe: pd.DataFrame,

    version="v1.0",

) -> pd.DataFrame:


    manager = FeatureVersionManager(

        default_version=version

    )


    return manager.add_version(

        dataframe=dataframe,

        version=version,

    )