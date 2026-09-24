import pandas as pd
import json
import os

# =====================================================
# CREATE OUTPUT DIRECTORY
# =====================================================

os.makedirs(
    "../backend/data",
    exist_ok=True
)

# =====================================================
# INPUT FILE
# =====================================================

INPUT_FILE = "../backend/data/district_risk_scores.csv"

if not os.path.exists(INPUT_FILE):
    raise FileNotFoundError(
        f"File not found: {INPUT_FILE}"
    )

# =====================================================
# LOAD RISK SCORES
# =====================================================

df = pd.read_csv(INPUT_FILE)

alerts = []

# =====================================================
# GENERATE ALERTS
# =====================================================

for _, row in df.iterrows():

    district = str(row["district"])

    risk = str(row["risk_level"]).upper()

    if risk == "HIGH":

        english = (
            "Disease outbreak risk is HIGH. "
            "Increase surveillance and preparedness."
        )

        tamil = (
            "நோய் பரவல் அபாயம் அதிகமாக உள்ளது. "
            "கண்காணிப்பையும் முன்னெச்சரிக்கை நடவடிக்கைகளையும் அதிகரிக்கவும்."
        )

    elif risk == "MEDIUM":

        english = (
            "Disease outbreak risk is MEDIUM. "
            "Monitor disease trends closely."
        )

        tamil = (
            "நோய் பரவல் அபாயம் நடுத்தரமாக உள்ளது. "
            "நோய் பரவலை தொடர்ந்து கண்காணிக்கவும்."
        )

    else:

        english = (
            "Disease outbreak risk is LOW. "
            "Routine monitoring is recommended."
        )

        tamil = (
            "நோய் பரவல் அபாயம் குறைவாக உள்ளது. "
            "வழக்கமான கண்காணிப்பை தொடரவும்."
        )

    alerts.append({

        "district": district,

        "risk_level": risk,

        "english_alert": english,

        "tamil_alert": tamil
    })

# =====================================================
# SAVE JSON
# =====================================================

OUTPUT_FILE = "../backend/data/alerts.json"

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        alerts,
        f,
        indent=4,
        ensure_ascii=False
    )

print(
    f"Alerts generated successfully: {OUTPUT_FILE}"
)

print(
    f"Total alerts generated: {len(alerts)}"
)