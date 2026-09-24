exports.getDataSources =
async (req, res) => {

    try {

        const sources = [
            {
                source: "IMD",
                description:
                    "Rainfall, Temperature, Humidity",
                url:
                    "https://mausam.imd.gov.in"
            },

            {
                source: "ERA5",
                description:
                    "Climate Reanalysis Data",
                url:
                    "https://cds.climate.copernicus.eu"
            },

            {
                source: "IDSP",
                description:
                    "Disease Surveillance Data",
                url:
                    "https://idsp.nic.in"
            },

            {
                source: "EMRI 108",
                description:
                    "Emergency Call Records",
                url:
                    "https://www.emri.in"
            },

            {
                source: "PHC",
                description:
                    "Primary Health Centre Records",
                url:
                    "https://tnhealth.tn.gov.in"
            }
        ];

        res.status(200).json({
            success: true,
            count: sources.length,
            data: sources
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};