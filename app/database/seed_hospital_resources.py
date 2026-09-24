from app.database.connection import SessionLocal
from app.models.hospital_resource import HospitalResource

districts = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore",
    "Cuddalore", "Dharmapuri", "Dindigul", "Erode",
    "Kallakurichi", "Kancheepuram", "Karur", "Krishnagiri",
    "Madurai", "Mayiladuthurai", "Nagapattinam", "Kanniyakumari",
    "Namakkal", "Perambalur", "Pudukottai", "Ramanathapuram",
    "Ranipet", "Salem", "Sivaganga", "Tenkasi",
    "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli",
    "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur",
    "Tiruvannamalai", "The Nilgiris", "Vellore", "Viluppuram",
    "Virudhunagar", "Kallakurichi"
]

districts = list(dict.fromkeys(districts))

db = SessionLocal()

for i, district in enumerate(districts):
    db.add(HospitalResource(
        district=district,
        hospital_beds=250 + (i * 15),
        ambulances=30 + (i % 10) * 5,
        medical_staff=300 + (i * 12),
        dengue_test_kits=1500 + (i * 100),
    ))

db.commit()
db.close()

print("Hospital resource seed completed:", len(districts), "districts")
