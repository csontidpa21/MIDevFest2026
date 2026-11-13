"""Deterministic trip checks for Orchestrate. No network or booking actions."""
import itertools
import json
import math


def evaluate_trip_logic(request_json: str) -> str:
    """Evaluate only supplied fictional candidates and explicit driver constraints."""
    if not isinstance(request_json, str) or len(request_json) > 20000:
        raise ValueError("Provide at most 20,000 characters of JSON.")
    request = json.loads(request_json)
    if not isinstance(request, dict):
        raise ValueError("Request must be an object.")

    def number(value, name, maximum):
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError(f"{name} must be numeric.")
        if not math.isfinite(value) or value < 0 or value > maximum:
            raise ValueError(f"{name} is out of range.")
        return value

    seats = number(request.get("open_seats"), "open_seats", 10)
    if seats != int(seats):
        raise ValueError("open_seats must be a whole number.")
    limit = number(request.get("max_added_minutes"), "max_added_minutes", 120)
    candidates = request.get("candidates")
    if not isinstance(candidates, list) or len(candidates) > 10:
        raise ValueError("Provide at most 10 supplied candidates.")
    seen = set()
    normalized = []
    for candidate in candidates:
        if not isinstance(candidate, dict):
            raise ValueError("Each candidate must be an object.")
        cid = candidate.get("id")
        if not isinstance(cid, str) or not cid or len(cid) > 40 or cid in seen:
            raise ValueError("Candidate IDs must be unique short strings.")
        seen.add(cid)
        detour = number(candidate.get("sample_detour_minutes"), "sample_detour_minutes", 120)
        contribution = number(candidate.get("sample_contribution"), "sample_contribution", 1000)
        if round(contribution, 2) != contribution:
            raise ValueError("Contributions must have at most two decimal places.")
        normalized.append({"id": cid, "sample_detour_minutes": detour,
                           "sample_contribution": contribution})
    feasible = []
    for size in range(1, min(int(seats), len(normalized)) + 1):
        for group in itertools.combinations(normalized, size):
            added = sum(c["sample_detour_minutes"] for c in group)
            if added <= limit:
                feasible.append({"candidate_ids": [c["id"] for c in group],
                                 "riders": size, "sample_added_minutes_sum": added,
                                 "sample_contribution_total": round(sum(c["sample_contribution"] for c in group), 2)})
    feasible.sort(key=lambda g: (-g["riders"], g["sample_added_minutes_sum"], g["candidate_ids"]))
    return json.dumps({"data_mode": "synthetic_demo", "open_seats": int(seats),
                       "max_added_minutes": limit, "options": feasible,
                       "recommended_draft": feasible[0] if feasible else None,
                       "method": "Maximum rider count, then lowest sum of supplied sample detours. Contributions do not affect ranking.",
                       "limits": "Sample detours are added for illustration. No map, time-window, availability or real route feasibility is validated.",
                       "human_confirmation_required": True, "booking_created": False,
                       "payment_created": False})


if __name__ == "__main__":
    import sys
    print(evaluate_trip_logic(sys.stdin.read()))
