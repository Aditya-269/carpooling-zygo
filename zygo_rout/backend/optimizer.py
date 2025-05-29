import googlemaps
from config import API_KEY
from itertools import permutations
import math

gmaps = googlemaps.Client(key=API_KEY)

def get_route_info(start, end):
    try:
        result = gmaps.distance_matrix(
            origins=[(start["lat"], start["lng"])],
            destinations=[(end["lat"], end["lng"])],
            mode="driving",
            departure_time="now"
        )
        element = result["rows"][0]["elements"][0]
        distance_km = element["distance"]["value"] / 1000
        duration_min = element["duration_in_traffic"]["value"] / 60 
        return distance_km, duration_min
    except Exception as e:
        print("Google API error:", e)
        return float('inf'), float('inf')


def total_distance(route):
    dist = 0
    for i in range(len(route) - 1):
        dist += get_route_info(route[i], route[i + 1])
    return dist

def is_valid_sequence(route, pairs):
    name_sequence = [point['name'] for point in route]
    for pair in pairs:
        if name_sequence.index(pair['pickup']) > name_sequence.index(pair['drop']):
            return False
    return True

def optimize_route(start, locations, pairs=None):
    best_route = None
    min_distance = float('inf')
    
    for perm in permutations(locations):
        current_route = [start] + list(perm)
        if pairs and not is_valid_sequence(current_route, pairs):
            continue
        dist = total_distance(current_route)
        if dist < min_distance:
            min_distance = dist
            best_route = current_route
    return best_route

def get_route_with_etas(start, locations, pairs=None):
    from itertools import permutations

    best_route = None
    best_etas = []
    min_total_distance = float('inf')

    for perm in permutations(locations):
        route = [start] + list(perm)
        if pairs and not is_valid_sequence(route, pairs):
            continue

        total_dist = 0
        total_time = 0
        etas = []
        for i in range(len(route) - 1):
            dist, eta = get_route_info(route[i], route[i + 1])
            total_dist += dist
            total_time += eta
            etas.append({
                "from": route[i]["name"],
                "to": route[i + 1]["name"],
                "distance_km": round(dist, 2),
                "eta_min": round(eta, 2)
            })

        if total_dist < min_total_distance:
            min_total_distance = total_dist
            best_route = route
            best_etas = etas

    return best_route, best_etas
