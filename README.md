# Carpool — Michigan DevFest 2026

A Next-Gen Mobility proof of concept for anyone who needs to commute and carpool without dependable transportation. Built around shared seats on trips drivers already plan to make. Team: Chayanon “Mac” Sontidpanya and Carl Scozzari.

## Demo and pitch

- [PowerPoint pitch](pitch/Carpool_IBM_DevFest_Pitch.pptx)
- [Narrated video pitch (2:55)](pitch/Carpool_IBM_DevFest_Video_Pitch.mp4)
- [Current video narration](video-pitch/ibm-devfest/narration.txt)
- [Problem and solution](submission/problem_solution.txt)
- [Technology statement](submission/technology_statement.txt)

## Run the web prototype

Requires Node.js 22.13 or later.

```sh
cd frontend
npm ci
npm run dev
```

Open the local URL printed by the server (normally http://localhost:5173). The example starts at Hollywood Casino Hotel, Greektown, Detroit and travels to Detroit Metro Airport.

The React interface uses fixed fictional candidates and sample contribution totals. There is no live routing, profile verification, booking or payment. Changing the trip inputs does not change the sample candidates.

## IBM project files

`ibm/` contains a deterministic Python draft-evaluation tool, ten local tests, a watsonx Orchestrate tool wrapper and a prepared agent template. The intended agent gathers constraints, calls the tool and explains its results. Actual IBM deployment and execution are not verified.

```sh
python3 -m unittest discover -s ibm -p 'test_*.py' -v
python3 ibm/evaluate_trip.py < ibm/demo_request.json
```

IBM Bob IDE work and each member’s authentic usage screenshot remain outstanding. `bob_usage/` is reserved for that evidence. Prepared files and local tests do not establish IBM integration or submission eligibility. See [guide review](submission/guide_alignment.txt).

`src/` contains the separate earlier Flue/OpenAI agent; it is not proof of IBM usage. Its optional API credentials must be configured locally.

## Submission status and data

This repository contains the current project snapshot, not earlier Git history. No MCP configuration, IBM MCP keys, environment files, local databases or credential files are included. All demo people and amounts are synthetic. Team names are retained as intended presentation credits.

The video is a narrated screenshot walkthrough, not genuine Bob/Orchestrate workflow footage. Final IBM evidence, a compliant product demonstration, asset permission checks and the portal submission remain outstanding. The mascot illustration is retained at the project owner’s request; its rights/provenance have not been verified. See [data and asset register](submission/data_and_asset_sources.txt).

## Official requirements

- [Submission portal](https://compete.112601.watsonx-challenge.ibm.com/competitions/midevfest/complete-the-hackathon)
- [Hackathon guide](https://private-hackathons-2026.s3.us-east.cloud-object-storage.appdomain.cloud/112601_HackathonGuide.pdf)

## Supplied IBM Bob workspace screenshots

Three supplied screenshots are in [bob_usage](bob_usage/). Two appear in the updated eight-slide presentation and 2:55 video. They show the frontend project open in Bob; the required Budget badge and completed project-task evidence are still outstanding.
