def calculate_risk(user, user_events):

    risk = 0

    privilege = str(user["privilege_level"]).lower()

    if privilege == "admin":
        risk += 40

    elif privilege == "service-account":
        risk += 50

    elif privilege == "power-user":
        risk += 20

    systems = str(user["systems_access"]).split("|")

    if len(systems) >= 5:
        risk += 30

    days = int(user["days_inactive"])

    if days > 60:
        risk += 40

    elif days > 30:
        risk += 25

    for _, event in user_events.iterrows():

        action = str(event["action"]).lower()

        if action == "admin_operation":
            risk += 10

        elif action == "export_data":
            risk += 10

        elif action == "sql_query":
            risk += 5

        sensitivity = str(
            event["resource_sensitivity"]
        ).lower()

        if sensitivity == "high":
            risk += 10

        time_type = str(
            event["time_classification"]
        ).lower()

        if time_type == "night":
            risk += 10

        elif time_type == "unusual_hours":
            risk += 10

    return min(risk, 100)