#!/usr/bin/env python3
"""
Seed script to populate sample data for Chit Fund BC Management System
"""
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8001/api"

# Sample groups
groups = [
    {
        "name": "ATL G1",
        "totalChitAmount": 500000,
        "maxMembers": 25,
        "description": "Premium chit fund group"
    },
    {
        "name": "ATL G2",
        "totalChitAmount": 250000,
        "maxMembers": 25,
        "description": "Medium-term savings group"
    },
    {
        "name": "ATL G3",
        "totalChitAmount": 100000,
        "maxMembers": 25,
        "description": "Short-term chit for daily income earners"
    }
]

# Sample member names
member_names = [
    "Raj Sharma", "Priya Patel", "Amit Kumar", "Sneha Singh", "Vikram Reddy",
    "Anjali Verma", "Karthik Joshi", "Divya Desai", "Rahul Mehta", "Pooja Choudhary",
    "Suresh Iyer", "Meera Nair", "Arun Menon", "Lakshmi Pillai", "Manoj Rao"
]

# BC Controllers
bc_controllers = [
    "KALYMAN_SADAMANO JAMARKAR (N08553)",
    "RAJESH PATEL (N08554)",
    "PRIYA SHARMA (N08555)",
    "AMIT KUMAR (N08556)"
]

def create_groups():
    """Create sample groups"""
    print("Creating groups...")
    group_ids = []
    for group in groups:
        try:
            response = requests.post(f"{BASE_URL}/groups", json=group)
            if response.status_code == 200:
                data = response.json()
                group_ids.append(data['id'])
                print(f"✓ Created group: {group['name']} (ID: {data['id']})")
            else:
                print(f"✗ Failed to create group: {group['name']}")
        except Exception as e:
            print(f"✗ Error creating group {group['name']}: {e}")
    return group_ids

def create_members(group_ids):
    """Create sample members for each group"""
    print("\nCreating members...")
    member_count = 0
    
    for i, group_id in enumerate(group_ids):
        # Create 5 members per group
        for j in range(5):
            name = member_names[(i * 5 + j) % len(member_names)]
            bc = bc_controllers[j % len(bc_controllers)]
            
            join_date = (datetime.now() - timedelta(days=30 * j)).isoformat()
            
            member = {
                "name": name,
                "phone": f"9{str(800000000 + i * 10000 + j).zfill(9)}",
                "email": f"{name.lower().replace(' ', '.')}@example.com",
                "address": f"{j+1} Street, Mumbai",
                "groupId": group_id,
                "bcHolder": bc,
                "joinDate": join_date,
                "status": "active"
            }
            
            try:
                response = requests.post(f"{BASE_URL}/members", json=member)
                if response.status_code == 200:
                    member_count += 1
                    print(f"✓ Created member: {name} in group {i+1} (BC: {bc.split('(')[0].strip()})")
                else:
                    print(f"✗ Failed to create member: {name}")
            except Exception as e:
                print(f"✗ Error creating member {name}: {e}")
    
    return member_count

def create_sample_auctions():
    """Create sample auction records"""
    print("\nCreating auction records...")
    auctions = [
        {
            "groupNo": "ATL G1",
            "ticketNo": "67661 2",
            "customerName": "PRITT C UNADECZOO",
            "mobileNo": "9430538549",
            "appuiDate": "06-12-2021",
            "instOngoing": 48,
            "status": "Prized",
            "previousArrear": 0,
            "currentAmount": 9998,
            "cumShare": 416859,
            "toBeCollected": 9998,
            "unclaimedAmt": 0,
            "agentCode": "N08553"
        },
        {
            "groupNo": "ATL G1",
            "ticketNo": "67661 3",
            "customerName": "SURG J W HENAE",
            "mobileNo": "9521513530",
            "appuiDate": "06-12-2021",
            "instOngoing": 48,
            "status": "Prized",
            "previousArrear": 50464,
            "currentAmount": 10000,
            "cumShare": 365284,
            "toBeCollected": 60464,
            "unclaimedAmt": 0,
            "agentCode": "N08553"
        }
    ]
    
    auction_count = 0
    for auction in auctions:
        try:
            response = requests.post(f"{BASE_URL}/auctions", json=auction)
            if response.status_code == 200:
                auction_count += 1
                print(f"✓ Created auction for: {auction['customerName']}")
            else:
                print(f"✗ Failed to create auction: {auction['customerName']}")
        except Exception as e:
            print(f"✗ Error creating auction: {e}")
    
    return auction_count

def main():
    print("=" * 60)
    print("Chit Fund BC Management System - Data Seeder")
    print("=" * 60)
    
    # Create groups
    group_ids = create_groups()
    
    if not group_ids:
        print("\n✗ No groups created. Exiting.")
        return
    
    # Create members
    member_count = create_members(group_ids)
    
    # Create auctions
    auction_count = create_sample_auctions()
    
    # Summary
    print("\n" + "=" * 60)
    print("Summary:")
    print(f"  Groups created: {len(group_ids)}")
    print(f"  Members created: {member_count}")
    print(f"  Auctions created: {auction_count}")
    print("=" * 60)
    print("\n✓ Sample data seeded successfully!")
    print(f"\nAccess the application at: {BASE_URL.replace(':8001/api', '')}")

if __name__ == "__main__":
    main()
