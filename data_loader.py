import os
import pandas as pd

BASE_DIR = os.path.dirname(__file__)
users = pd.read_csv(os.path.join(BASE_DIR, "identity_users.csv"))

events = pd.read_csv(os.path.join(BASE_DIR, "identity_events.csv"))


def get_users():
    return users


def get_events():
    return events