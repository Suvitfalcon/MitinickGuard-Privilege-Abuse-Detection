import os
from flask import Flask, jsonify
from flask_cors import CORS

from data_loader import get_users, get_events
from risk_engine import calculate_risk

app = Flask(__name__)
CORS(app)

users_df = get_users()
events_df = get_events()


def parse_bool(value):
    return str(value).strip().lower() in ("true", "1", "yes")


def build_user_profile(user_row):
    user_id = user_row["user_id"]
    user_events = events_df[events_df["user_id"] == user_id]
    risk_score = calculate_risk(user_row, user_events)

    return {
        "user_id": user_id,
        "username": user_row["username"],
        "email": user_row["email"],
        "department": user_row["department"],
        "job_title": user_row["job_title"],
        "privilege_level": user_row["privilege_level"],
        "systems_access": user_row["systems_access"],
        "last_login": user_row["last_login"],
        "days_inactive": int(user_row["days_inactive"]),
        "is_active": parse_bool(user_row["is_active"]),
        "hire_date": user_row["hire_date"],
        "risk_score": int(risk_score),
        "risk_category": "high" if risk_score >= 80 else "medium" if risk_score >= 50 else "low",
    }


def get_profiles():
    profiles = [build_user_profile(row) for _, row in users_df.iterrows()]
    return sorted(profiles, key=lambda u: u["risk_score"], reverse=True)


@app.route("/users")
def users():
    return jsonify(get_profiles())


@app.route("/dashboard")
def dashboard():
    profiles = get_profiles()
    critical_users = sum(1 for u in profiles if u["risk_category"] == "high")
    dormant_accounts = sum(1 for u in profiles if u["days_inactive"] > 90)
    privilege_violations = sum(
        1
        for u in profiles
        if str(u["privilege_level"]).lower() in {"admin", "service-account", "power-user"}
    )

    return jsonify(
        {
            "critical_users": critical_users,
            "dormant_accounts": dormant_accounts,
            "privilege_violations": privilege_violations,
            "compliance_score": 76,
        }
    )


@app.route("/top-risks")
def top_risks():
    top_users = get_profiles()[:5]
    return jsonify(
        [
            {"username": u["username"], "score": u["risk_score"], "job_title": u["job_title"]}
            for u in top_users
        ]
    )


@app.route("/alerts")
def alerts():
    profiles = get_profiles()
    alert_items = []

    for u in profiles[:8]:
        if u["risk_score"] >= 80:
            alert_items.append(
                {
                    "username": u["username"],
                    "alert": "High-risk account activity detected",
                    "resource": "Privileged access / sensitive system",
                }
            )
        elif u["days_inactive"] > 90:
            alert_items.append(
                {
                    "username": u["username"],
                    "alert": "Dormant account still has access",
                    "resource": "Identity lifecycle",
                }
            )
        elif str(u["privilege_level"]).lower() in {"admin", "service-account", "power-user"}:
            alert_items.append(
                {
                    "username": u["username"],
                    "alert": "Privileged role assigned",
                    "resource": "Access entitlement",
                }
            )

    return jsonify(alert_items)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
