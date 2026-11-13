"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BusFront,
  CalendarDays,
  CarFront,
  ChevronRight,
  CircleUserRound,
  Clock3,
  ExternalLink,
  MapPin,
  Navigation,
  Search,
  ShieldCheck,
  Smartphone,
  Users,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type Rider = {
  id: number;
  name: string;
  initials: string;
  pickup: string;
  destination: string;
  detour: number;
  contribution: number;
  note: string;
  color: string;
};

const riders: Rider[] = [
  {
    id: 1,
    name: "Maya R.",
    initials: "MR",
    pickup: "Livernois & 7 Mile",
    destination: "DTW North Terminal",
    detour: 4,
    contribution: 12,
    note: "One carry-on",
    color: "bg-[#ffcfb5] text-[#9f3e18]",
  },
  {
    id: 2,
    name: "Derrick T.",
    initials: "DT",
    pickup: "Grand River & Greenfield",
    destination: "DTW McNamara Terminal",
    detour: 7,
    contribution: 14,
    note: "Fictional commuter example",
    color: "bg-[#c9e0ff] text-[#1453a6]",
  },
  {
    id: 3,
    name: "Keisha B.",
    initials: "KB",
    pickup: "Michigan & Central",
    destination: "DTW McNamara Terminal",
    detour: 9,
    contribution: 11,
    note: "Small suitcase",
    color: "bg-[#e2d8ff] text-[#5635a7]",
  },
];

export default function Home() {
  const [selected, setSelected] = useState<number[]>([1, 2]);
  const [status, setStatus] = useState("3 fictional riders available for this demo");
  const [departure, setDeparture] = useState("");

  const total = useMemo(
    () => riders.filter((rider) => selected.includes(rider.id)).reduce((sum, rider) => sum + rider.contribution, 0),
    [selected],
  );

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(7, 0, 0, 0);
    const timezoneOffset = tomorrow.getTimezoneOffset() * 60_000;
    setDeparture(new Date(tomorrow.getTime() - timezoneOffset).toISOString().slice(0, 16));
  }, []);

  useEffect(() => {
    const modelContext = (document as Document & {
      modelContext?: {
        registerTool: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void>;
      };
    }).modelContext;
    if (!modelContext?.registerTool) return;

    const lifecycle = new AbortController();
    const registration = modelContext.registerTool(
      {
        name: "stage_rider_selection",
        title: "Stage riders for a carpool",
        description: "Select fixed fictional rider examples for a synthetic trip draft. No live matching, route validation, verification, booking or payment occurs.",
        inputSchema: {
          type: "object",
          properties: {
            riderIds: {
              type: "array",
              items: { type: "integer", enum: riders.map((rider) => rider.id) },
              uniqueItems: true,
              maxItems: 3,
            },
          },
          required: ["riderIds"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        async execute(input: unknown) {
          const riderIds = (input as { riderIds?: unknown })?.riderIds;
          if (!Array.isArray(riderIds) || !riderIds.every((id) => Number.isInteger(id) && riders.some((rider) => rider.id === id))) {
            throw new Error("riderIds must contain only displayed rider IDs");
          }
          const uniqueIds = [...new Set(riderIds as number[])];
          setSelected(uniqueIds);
          setStatus("Trip draft updated by your assistant");
          await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          return {
            selectedRiderIds: uniqueIds,
            selectedRiders: uniqueIds.length,
            estimatedContribution: riders
              .filter((rider) => uniqueIds.includes(rider.id))
              .reduce((sum, rider) => sum + rider.contribution, 0),
            bookingCreated: false,
          };
        },
      },
      { signal: lifecycle.signal },
    );
    void Promise.resolve(registration).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  function toggleRider(id: number, checked: boolean) {
    setSelected((current) => (checked ? [...current, id] : current.filter((item) => item !== id)));
    setStatus("Trip draft updated");
  }

  function goToSearch() {
    document.getElementById("route-search")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <aside className="bg-[#e9f1ff] px-5 py-3 text-center text-sm font-semibold text-[#07183d]" aria-label="Demo notice">
        Synthetic demo data. Fixed fictional riders and sample amounts. No live routing, profile verification, booking or payment.
      </aside>
      <header className="border-b border-[#e2e8f4] bg-white">
        <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
          <button onClick={goToSearch} className="flex items-center gap-2.5" aria-label="Carpool home">
            <span className="relative grid size-10 place-items-center rounded-[14px] bg-primary text-white shadow-[0_8px_24px_rgba(42,105,240,.22)]">
              <Navigation className="size-5 -rotate-12" aria-hidden="true" />
            </span>
            <span className="text-xl font-black tracking-[-0.04em] text-[#07183d]">Carpool</span>
          </button>

          <nav className="hidden items-center gap-8 text-sm font-bold text-[#2a69f0] md:flex" aria-label="Main navigation">
            <button onClick={goToSearch}>Find a ride</button>
            <button onClick={goToSearch}>Offer a ride</button>
            <a href="#transit-connections">Transit connections</a>
            <a href="#how-it-works">How it works</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="grid size-10 place-items-center rounded-full text-[#2a69f0] hover:bg-[#eef4ff]" aria-label="Search">
              <Search className="size-5" />
            </button>
            <Button onClick={goToSearch} variant="outline" className="hidden h-10 rounded-full border-2 border-primary px-5 font-bold text-primary shadow-none hover:bg-[#eef4ff] sm:inline-flex">
              Offer your ride
            </Button>
            <button className="grid size-10 place-items-center rounded-full bg-[#e9f1ff] text-[#2a69f0]" aria-label="Open profile">
              <CircleUserRound className="size-6" />
            </button>
          </div>
        </div>
      </header>

      <section className="relative bg-[#f3f6fb] pb-12 pt-8 sm:pb-14 lg:pt-10">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-12">
          <div className="py-3 lg:py-8">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#2a69f0] shadow-sm">
              <CarFront className="size-4" /> Michigan carpooling
            </p>
            <h1 className="max-w-[650px] text-[clamp(2.7rem,5vw,5.3rem)] font-black leading-[0.95] tracking-[-0.055em] text-[#07183d]">
              Share the route. Split the cost.
            </h1>
            <p className="mt-6 max-w-[560px] text-lg leading-relaxed text-[#53627a] sm:text-xl">
              Explore a shared trip for Michigan commuters. Review fictional riders, sample detours and suggested contributions.
            </p>
          </div>

          <figure className="relative overflow-hidden rounded-[28px] bg-[#c9d9ee] shadow-[0_22px_60px_rgba(17,37,72,.12)]">
            <img
              src="/lion-paws-carpool-hero.png"
              alt="Illustration of a lion driving a blue pickup with a tiger passenger in Detroit"
              className="aspect-[16/9] h-full w-full object-cover"
            />
            <figcaption className="absolute bottom-3 right-3 rounded-full bg-[#07183d]/80 px-3 py-1 text-xs text-white/85 backdrop-blur">
              Carpool illustration
            </figcaption>
          </figure>
        </div>

        <div className="mx-auto mt-8 max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <form
            id="route-search"
            className="grid w-full overflow-hidden rounded-[20px] border border-[#d9e1ee] bg-white shadow-[0_14px_38px_rgba(28,61,112,.16)] lg:grid-cols-[1.15fr_1.15fr_.8fr_.7fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              setStatus("Showing 3 fixed demo candidates; no live search");
              document.getElementById("matches")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
          <label className="flex min-w-0 items-center gap-3 border-b border-[#e3e8f1] px-5 py-4 lg:border-b-0 lg:border-r">
            <span className="size-3 shrink-0 rounded-full border-[3px] border-primary" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-[#53627a]">From</span>
              <input className="w-full truncate bg-transparent text-base font-semibold text-[#07183d] outline-none" defaultValue="Hollywood Casino Hotel, Greektown, Detroit" aria-label="From" />
            </span>
          </label>
          <label className="flex min-w-0 items-center gap-3 border-b border-[#e3e8f1] px-5 py-4 lg:border-b-0 lg:border-r">
            <MapPin className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-[#53627a]">To</span>
              <input className="w-full truncate bg-transparent text-base font-semibold text-[#07183d] outline-none" defaultValue="Detroit Metro Airport" aria-label="To" />
            </span>
          </label>
          <label className="flex items-center gap-3 border-b border-[#e3e8f1] px-5 py-4 lg:border-b-0 lg:border-r">
            <CalendarDays className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-[#53627a]">Departure</span>
              <input
                type="datetime-local"
                value={departure}
                onChange={(event) => setDeparture(event.target.value)}
                onClick={(event) => event.currentTarget.showPicker?.()}
                className="w-full cursor-pointer bg-transparent text-base font-semibold text-[#07183d] outline-none"
                aria-label="Departure date and time"
              />
            </span>
          </label>
          <label className="flex items-center gap-3 border-b border-[#e3e8f1] px-5 py-4 lg:border-b-0 lg:border-r">
            <Users className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-[#53627a]">Open seats</span>
              <select className="w-full appearance-none bg-transparent text-base font-semibold text-[#07183d] outline-none" defaultValue="2" aria-label="Open seats">
                {Array.from({ length: 10 }, (_, index) => index + 1).map((seatCount) => (
                  <option key={seatCount} value={seatCount}>
                    {seatCount} {seatCount === 1 ? "seat" : "seats"}
                  </option>
                ))}
              </select>
            </span>
          </label>
            <button type="submit" className="flex min-h-16 items-center justify-center gap-2 bg-primary px-8 text-base font-black text-white transition hover:bg-[#1458df]">
              Find riders <ArrowRight className="size-4" />
            </button>
          </form>
        </div>
      </section>

      <section id="matches" className="scroll-mt-24 px-5 pb-14 pt-14 sm:px-8 sm:pt-16 lg:px-12 lg:pb-20 lg:pt-20">
        <div className="mx-auto max-w-[1340px]">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.13em] text-primary">Synthetic demo candidates</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] text-[#07183d] sm:text-4xl">Review a sample carpool</h2>
            </div>
            <p className="text-base text-[#687791]" aria-live="polite">{status}</p>
          </div>

          <p className="mb-5 text-sm leading-relaxed text-[#53627a]">Changing the trip inputs does not change these examples. Pickup points and sample detours have not been checked for the selected route. The separate evaluation tool checks supplied seat and sample-minute limits.</p>
          <div className="grid gap-5 lg:grid-cols-3">
            {riders.map((rider) => {
              const isSelected = selected.includes(rider.id);
              return (
                <article key={rider.id} className={`rounded-[24px] border bg-white p-5 shadow-[0_12px_35px_rgba(27,55,100,.07)] transition ${isSelected ? "border-primary ring-2 ring-primary/10" : "border-[#dfe6f1] hover:-translate-y-1 hover:border-[#aac6ff]"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`grid size-12 place-items-center rounded-full text-sm font-black ${rider.color}`}>{rider.initials}</div>
                      <div>
                        <h3 className="text-lg font-black text-[#07183d]">{rider.name}</h3>
                        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[#687791]"><Clock3 className="size-3.5" /> +{rider.detour} sample min</p>
                      </div>
                    </div>
                    <Checkbox
                      id={`rider-${rider.id}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => toggleRider(rider.id, checked === true)}
                      className="mt-1 size-5 border-[#aab7ca] data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                      aria-label={`Select ${rider.name}`}
                    />
                  </div>

                  <label htmlFor={`rider-${rider.id}`} className="mt-6 block cursor-pointer">
                    <div className="grid grid-cols-[16px_1fr] gap-x-3 gap-y-1">
                      <div className="flex flex-col items-center pt-1">
                        <span className="size-2.5 rounded-full border-[3px] border-primary" />
                        <span className="my-1 h-8 w-px border-l border-dashed border-[#aebbd0]" />
                        <MapPin className="size-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-[#07183d]">{rider.pickup}</p>
                        <p className="mt-5 font-bold text-[#07183d]">{rider.destination}</p>
                      </div>
                    </div>
                  </label>

                  <div className="mt-6 flex items-end justify-between gap-4 border-t border-[#edf0f5] pt-4">
                    <div>
                      <p className="text-sm text-[#687791]">{rider.note}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#2a69f0]"><ShieldCheck className="size-3.5" /> Fictional profile, not verified</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#687791]">Sample trip share</p>
                      <p className="text-3xl font-black tracking-[-0.04em] text-[#07183d]">${rider.contribution}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <section className="mt-8 grid gap-6 overflow-hidden rounded-[28px] bg-[#07183d] px-6 py-7 text-white sm:px-9 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12 lg:py-10">
            <div>
              <p className="text-sm font-bold text-[#91b6ff]">Your draft carpool</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">{selected.length} rider{selected.length === 1 ? "" : "s"} can share ${total} of this trip</h2>
              <p className="mt-2 max-w-2xl text-base leading-relaxed text-white/70">Review the pickup order and confirm details together. No booking or charge happens in this demo.</p>
            </div>
            <Button
              size="lg"
              disabled={selected.length === 0}
              onClick={() => setStatus("Draft ready to review — no booking was made")}
              className="h-12 rounded-full bg-white px-6 font-black text-primary hover:bg-[#eef4ff]"
            >
              Review your draft <ChevronRight className="size-4" />
            </Button>
          </section>
        </div>
      </section>

      <section id="transit-connections" className="scroll-mt-20 border-y border-[#dfe6f1] bg-white px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[1100px]">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.13em] text-primary">Connected mobility</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] text-[#07183d] sm:text-4xl">Keep moving beyond the carpool</h2>
            <p className="mt-4 text-lg leading-relaxed text-[#687791]">
              Compare your shared ride with official Michigan transit information, live bus tools, and mobile trip planning.
            </p>
          </div>

          <div className="mt-9 grid gap-6 md:grid-cols-2">
            <article className="rounded-[26px] border border-[#dfe6f1] bg-[#f7f9fd] p-6 shadow-[0_12px_35px_rgba(27,55,100,.06)] sm:p-8">
              <div className="flex items-center gap-4">
                <div className="grid size-14 place-items-center rounded-2xl bg-[#0b5b44] text-white">
                  <Navigation className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#687791]">Statewide information</p>
                  <h3 className="text-2xl font-black tracking-[-0.035em] text-[#07183d]">Michigan MDOT</h3>
                </div>
              </div>
              <p className="mt-5 leading-relaxed text-[#53627a]">
                Find public transit providers across Michigan or check Mi Drive for traffic, construction, incidents, cameras, and carpool lots.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a
                  href="https://www.michigan.gov/mdot/travel/mobility/pub-transit"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#07183d] px-5 text-sm font-black text-white transition hover:bg-[#10285a]"
                >
                  <ExternalLink className="size-4" /> Transit website
                </a>
                <a
                  href="https://www.michigan.gov/drive"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-primary bg-white px-5 text-sm font-black text-primary transition hover:bg-[#eef4ff]"
                >
                  <Smartphone className="size-4" /> Open Mi Drive
                </a>
              </div>
            </article>

            <article className="rounded-[26px] border border-[#dfe6f1] bg-[#f7f9fd] p-6 shadow-[0_12px_35px_rgba(27,55,100,.06)] sm:p-8">
              <div className="flex items-center gap-4">
                <div className="grid size-14 place-items-center rounded-2xl bg-primary text-white">
                  <BusFront className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#687791]">Metro Detroit transit</p>
                  <h3 className="text-2xl font-black tracking-[-0.035em] text-[#07183d]">SMART</h3>
                </div>
              </div>
              <p className="mt-5 leading-relaxed text-[#53627a]">
                Review routes, schedules, fares, and live bus information, or use the Transit app for planning, tracking, and mobile payment.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a
                  href="https://www.smartbus.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#07183d] px-5 text-sm font-black text-white transition hover:bg-[#10285a]"
                >
                  <ExternalLink className="size-4" /> SMART website
                </a>
                <a
                  href="https://transitapp.com/download.html?utm_campaign=partners_smart&utm_medium=referral&utm_source=smart-mi-website"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-primary bg-white px-5 text-sm font-black text-primary transition hover:bg-[#eef4ff]"
                >
                  <Smartphone className="size-4" /> Get Transit app
                </a>
              </div>
            </article>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-[#7a879d]">
            These links open official provider tools. Carpool is not affiliated with MDOT, SMART, or Transit.
          </p>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#f3f6fb] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[1100px] text-center">
          <h2 className="text-3xl font-black tracking-[-0.045em] text-[#07183d] sm:text-4xl">A better ride starts with the route</h2>
          <div className="mt-10 grid gap-8 text-left md:grid-cols-3">
            {[
              { icon: Navigation, title: "Post the trip", body: "Set a sample origin, destination, departure and seat count. These inputs do not run a live route search." },
              { icon: Users, title: "Choose your riders", body: "Compare fictional pickup points, sample added time, notes and contributions. Candidates stay fixed when the trip changes." },
              { icon: WalletCards, title: "Share the cost", body: "Review the draft and sample total. This demo does not contact riders, confirm a trip or take payment." },
            ].map((step) => (
              <article key={step.title} className="rounded-[22px] bg-white p-6 shadow-[0_10px_32px_rgba(27,55,100,.06)]">
                <div className="grid size-12 place-items-center rounded-full bg-[#e9f1ff] text-primary"><step.icon className="size-5" /></div>
                <h3 className="mt-5 text-xl font-black text-[#07183d]">{step.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-[#687791]">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
