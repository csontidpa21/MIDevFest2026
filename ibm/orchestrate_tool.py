"""Import with the IBM Orchestrate ADK. Requires the IBM SDK at import time."""
from ibm_watsonx_orchestrate.agent_builder.tools import tool
from evaluate_trip import evaluate_trip_logic


@tool()
def evaluate_carpool_draft(request_json: str) -> str:
    """Compare supplied synthetic riders under seat and sample-detour limits.

    Args:
        request_json: JSON object with open_seats (integer 0-10),
            max_added_minutes (0-120), and candidates (up to ten objects with
            id, sample_detour_minutes, and sample_contribution).

    Returns:
        JSON with feasible draft options, sample totals, limits and human review.
    """
    return evaluate_trip_logic(request_json)
