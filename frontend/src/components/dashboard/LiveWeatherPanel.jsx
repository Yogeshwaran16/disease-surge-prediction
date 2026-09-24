import React, { useEffect, useState } from "react";


// ============================================================
// TAMIL NADU WEATHER LOCATION
// ============================================================

const TAMIL_NADU_LOCATION = {
  latitude: 11.1271,
  longitude: 78.6569,
};


// ============================================================
// WEATHER CODE
// ============================================================

const getWeatherDescription = (code) => {
  const weatherCode = Number(code);

  const descriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",

    45: "Fog",
    48: "Depositing rime fog",

    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",

    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",

    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",

    66: "Light freezing rain",
    67: "Heavy freezing rain",

    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",

    77: "Snow grains",

    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",

    85: "Slight snow showers",
    86: "Heavy snow showers",

    95: "Thunderstorm",

    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };

  return (
    descriptions[weatherCode] ||
    "Weather information unavailable"
  );
};


// ============================================================
// WEATHER ICON
// ============================================================

const getWeatherIcon = (code) => {
  const weatherCode = Number(code);

  if (weatherCode === 0) {
    return "☀️";
  }

  if (
    weatherCode === 1 ||
    weatherCode === 2
  ) {
    return "🌤️";
  }

  if (weatherCode === 3) {
    return "☁️";
  }

  if (
    weatherCode === 45 ||
    weatherCode === 48
  ) {
    return "🌫️";
  }

  if (
    weatherCode >= 51 &&
    weatherCode <= 67
  ) {
    return "🌧️";
  }

  if (
    weatherCode >= 71 &&
    weatherCode <= 77
  ) {
    return "❄️";
  }

  if (
    weatherCode >= 80 &&
    weatherCode <= 82
  ) {
    return "🌦️";
  }

  if (
    weatherCode >= 95
  ) {
    return "⛈️";
  }

  return "🌤️";
};


// ============================================================
// FORMAT NUMBER
// ============================================================

const formatNumber = (
  value,
  decimals = 0
) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toFixed(decimals);
};


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function LiveWeatherPanel({
  district = "Tamil Nadu",
}) {

  const [weather, setWeather] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [lastUpdated, setLastUpdated] =
    useState(null);


  // ==========================================================
  // LOAD WEATHER
  // ==========================================================

  const loadWeather = async () => {

    try {

      setLoading(true);
      setError(null);

      const {
        latitude,
        longitude,
      } = TAMIL_NADU_LOCATION;


      const url =
        "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        "&current=" +
        [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "precipitation",
          "rain",
          "weather_code",
          "wind_speed_10m",
        ].join(",") +
        "&timezone=Asia%2FKolkata";


      const response =
        await fetch(url);


      if (!response.ok) {
        throw new Error(
          `Weather API returned ${response.status}`
        );
      }


      const data =
        await response.json();


      if (!data?.current) {
        throw new Error(
          "Weather data unavailable"
        );
      }


      setWeather(
        data.current
      );


      setLastUpdated(
        new Date()
      );

    } catch (err) {

      console.error(
        "Live weather error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load weather"
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // INITIAL LOAD + 10 MINUTE REFRESH
  // ==========================================================

  useEffect(() => {

    loadWeather();

    const interval =
      setInterval(
        loadWeather,
        10 * 60 * 1000
      );

    return () => {
      clearInterval(interval);
    };

  }, []);


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading && !weather) {

    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="mb-5">

          <p className="text-xs uppercase tracking-wide text-slate-500">
            Live Weather
          </p>

          <h2 className="mt-1 text-lg font-semibold text-white">
            {district}
          </h2>

        </div>

        <div className="flex min-h-[260px] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />

            <p className="text-sm text-slate-400">
              Loading live weather...
            </p>

          </div>

        </div>

      </div>
    );

  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error && !weather) {

    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="mb-5">

          <p className="text-xs uppercase tracking-wide text-slate-500">
            Live Weather
          </p>

          <h2 className="mt-1 text-lg font-semibold text-white">
            {district}
          </h2>

        </div>

        <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-5">

          <p className="text-sm font-semibold text-red-400">
            Weather unavailable
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={loadWeather}
            className="mt-4 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
          >
            Retry
          </button>

        </div>

      </div>
    );

  }


  // ==========================================================
  // WEATHER VALUES
  // ==========================================================

  const temperature =
    weather?.temperature_2m;

  const humidity =
    weather?.relative_humidity_2m;

  const apparentTemperature =
    weather?.apparent_temperature;

  const precipitation =
    weather?.precipitation;

  const rain =
    weather?.rain;

  const windSpeed =
    weather?.wind_speed_10m;

  const weatherCode =
    weather?.weather_code;


  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="mb-5 flex items-start justify-between gap-4">

        <div>

          <p className="text-xs uppercase tracking-wide text-slate-500">
            Live Weather
          </p>

          <h2 className="mt-1 text-lg font-semibold text-white">
            {district}
          </h2>

        </div>


        <div className="flex items-center gap-2">

          <span className="h-2 w-2 rounded-full bg-green-400" />

          <span className="text-xs text-green-400">
            Live
          </span>

        </div>

      </div>


      {/* ====================================================
          CURRENT WEATHER
      ==================================================== */}

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">

        <div className="flex items-center justify-between gap-4">

          <div>

            <div className="flex items-center gap-3">

              <span className="text-4xl">
                {getWeatherIcon(
                  weatherCode
                )}
              </span>

              <div>

                <p className="text-4xl font-bold text-white">

                  {formatNumber(
                    temperature,
                    1
                  )}

                  °C

                </p>

                <p className="mt-1 text-sm text-slate-400">

                  {getWeatherDescription(
                    weatherCode
                  )}

                </p>

              </div>

            </div>

          </div>


          <div className="text-right">

            <p className="text-xs text-slate-500">
              Feels like
            </p>

            <p className="mt-1 text-lg font-semibold text-slate-200">

              {formatNumber(
                apparentTemperature,
                1
              )}

              °C

            </p>

          </div>

        </div>

      </div>


      {/* ====================================================
          WEATHER METRICS
      ==================================================== */}

      <div className="mt-4 grid grid-cols-2 gap-3">

        {/* HUMIDITY */}

        <WeatherMetric
          label="Humidity"
          value={
            Number.isFinite(
              Number(humidity)
            )
              ? `${formatNumber(
                  humidity
                )}%`
              : "—"
          }
          icon="💧"
        />


        {/* RAIN */}

        <WeatherMetric
          label="Rain"
          value={
            Number.isFinite(
              Number(rain)
            )
              ? `${formatNumber(
                  rain,
                  1
                )} mm`
              : "—"
          }
          icon="🌧️"
        />


        {/* PRECIPITATION */}

        <WeatherMetric
          label="Precipitation"
          value={
            Number.isFinite(
              Number(precipitation)
            )
              ? `${formatNumber(
                  precipitation,
                  1
                )} mm`
              : "—"
          }
          icon="☔"
        />


        {/* WIND */}

        <WeatherMetric
          label="Wind"
          value={
            Number.isFinite(
              Number(windSpeed)
            )
              ? `${formatNumber(
                  windSpeed,
                  1
                )} km/h`
              : "—"
          }
          icon="💨"
        />

      </div>


      {/* ====================================================
          FOOTER
      ==================================================== */}

      <div className="mt-5 flex flex-col gap-2 border-t border-slate-800 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

        <span>
          Source: Open-Meteo
        </span>

        <span>

          Updated:{" "}

          {lastUpdated
            ? lastUpdated.toLocaleTimeString(
                "en-IN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )
            : "—"}

        </span>

      </div>


      {/* ====================================================
          REFRESH
      ==================================================== */}

      <div className="mt-3 flex justify-end">

        <button
          type="button"
          onClick={loadWeather}
          disabled={loading}
          className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >

          {loading
            ? "Refreshing..."
            : "Refresh Weather"}

        </button>

      </div>

    </div>
  );
}


// ============================================================
// WEATHER METRIC
// ============================================================

function WeatherMetric({
  label,
  value,
  icon,
}) {

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

      <div className="flex items-center gap-2">

        <span className="text-lg">
          {icon}
        </span>

        <span className="text-xs text-slate-500">
          {label}
        </span>

      </div>

      <p className="mt-2 text-base font-semibold text-white">
        {value}
      </p>

    </div>
  );
}