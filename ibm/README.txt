CARPOOL / WATSONX ORCHESTRATE PREPARATION

Status: local deterministic tool tested separately; IBM SDK import, tenant model,
agent deployment and live Orchestrate conversation still require verification.
This folder does not establish actual IBM Bob or Orchestrate usage.

1. Run the pure tool and tests without credentials:
   python3 ibm/evaluate_trip.py < ibm/demo_request.json
   python3 -m unittest discover -s ibm -p 'test_*.py' -v

2. In a separate Python environment, install IBM's official ADK and authenticate
   to the event-provisioned Orchestrate instance following IBM's documentation.
   Never put credentials in this repository or in a client-side application.

3. Select an LLM actually enabled in your event tenant. Copy agent.template.yaml
   to a local agent.yaml and replace its llm value with the exact enabled ID.
   Import the tool directory so evaluate_trip.py accompanies the wrapper:
   orchestrate tools import -k python -p ibm -f ibm/orchestrate_tool.py
   orchestrate agents import -f ibm/agent.yaml
   These commands follow current IBM ADK docs but have not been executed here.
   Validate with your installed ADK version and tenant before claiming success.

4. In Orchestrate chat, provide demo_request.json and ask for a draft comparison.
   Expected tool result: Maya + Derrick, 2 seats, sample detour sum 11, sample
   contribution 26. Change the limit to 10: no pair fits. At 3: no rider fits.
   Confirm the agent calls the tool and preserves its labels and human review.
   Capture the real trace and output for the video. No live routing is implied.

5. Use IBM Bob IDE for a substantive task in BOB_TASK.txt and add real per-member
   usage screenshots in bob_usage/. Verify both IBM stages before recording.

6. Back up agents, tools and project assets before November 24, 2026 at 11 a.m.
   Eastern, as shown by the signed-in competition portal on November 13.

Design: Orchestrate collects constraints and explains results. The deterministic
tool handles feasibility within supplied sample limits and arithmetic. People
review and consent. There is no booking, payment, live data or UI-to-cloud bridge.

Official documentation:
https://developer.watson-orchestrate.ibm.com/tools/create_tool
https://developer.watson-orchestrate.ibm.com/agents/build_agent
https://developer.watson-orchestrate.ibm.com/agents/manage_agent
