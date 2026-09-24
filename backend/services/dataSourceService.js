class DataSourceService {

    getSources() {

        return [

            {
                source: "IMD",
                description:
                    "Rainfall, Temperature and Weather Data",
                url:
                    "https://mausam.imd.gov.in"
            },

            {
                source: "ERA5",
                description:
                    "Climate Reanalysis Dataset",
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
    }
}

module.exports =
new DataSourceService();    