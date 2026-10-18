import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  Brain,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Crown,
  Heart,
  Lightbulb,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Palette,
  Phone,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DriveGallery,
  GallerySetupHeading,
  LiveGoogleReviews,
  LiveMap,
  LiveSchedule,
  LiveSectionLabel,
  LiveTournamentPreview,
  LiveTournaments,
  PhotoCarousel,
  SheetTestimonialPreview,
  SheetTestimonials,
} from "@/components/home/LiveSections";
import { sendEnquiryViaCallMeBot } from "@/lib/external-data";
import { isConfigured, loadRuntimeConfig } from "@/lib/runtime-config";

const WHATSAPP_URL = "https://wa.me/919953048933";

const navItems = [
  ["home", "Home"],
  ["about", "About"],
  ["coaches", "Coaches"],
  ["programs", "Programs"],
  ["fees", "Fees"],
  ["schedule", "Schedule"],
  ["tournaments", "Tournaments"],
  ["testimonials", "Testimonials"],
  ["gallery", "Gallery"],
  ["support", "Support"],
  ["contact", "Contact"],
] as const;

const benefits: Array<{ title: string; description: string; Icon: LucideIcon }> = [
  { title: "Concentration", description: "Builds deep focus and a calmer attention span.", Icon: Target },
  { title: "Memory Power", description: "Strengthens pattern recognition and recall.", Icon: Brain },
  { title: "Calculation", description: "Practises thinking several moves ahead.", Icon: Calculator },
  { title: "Imagination", description: "Makes future positions visible before they happen.", Icon: Lightbulb },
  { title: "Confidence", description: "Encourages brave decisions and resilient learning.", Icon: Award },
  { title: "Planning", description: "Turns big goals into thoughtful next steps.", Icon: CalendarDays },
  { title: "Creativity", description: "Leaves room for fresh ideas and surprising tactics.", Icon: Palette },
  { title: "Judgement", description: "Develops balanced choices under pressure.", Icon: Scale },
  { title: "Time Management", description: "Teaches children to use every moment wisely.", Icon: Clock3 },
  { title: "Responsibility", description: "Makes ownership and reflection part of every game.", Icon: ShieldCheck },
];

const programs: Array<{ title: string; description: string; Icon: LucideIcon }> = [
  { title: "Beginner Classes", description: "Learn piece movement, essential rules, early tactics, and the joy of a first complete game.", Icon: BookOpen },
  { title: "Group Classes", description: "Interactive sessions that make room for friendly competition, discussion, and game analysis.", Icon: Users },
  { title: "Kids Classes", description: "A welcoming, age-aware introduction to chess that keeps curiosity and confidence growing.", Icon: Sparkles },
  { title: "Professional / Advanced Chess", description: "For players ready to deepen their strategic thinking, preparation, and competitive habits.", Icon: Trophy },
  { title: "Weekend Classes", description: "A practical option for families balancing school, activities, and consistent chess practice.", Icon: CalendarDays },
];

interface EnquiryForm {
  name: string;
  phone: string;
  program: string;
  message: string;
}

// Placeholder curriculum: replace this owner-review copy when the final syllabus is approved.
const curriculumLevels = [
  { level: "Level 1", title: "Foundations", description: "Board awareness, piece movement, rules, safe play, and confident completion of a full game." },
  { level: "Level 2", title: "Tactical Thinking", description: "Pattern recognition, checks, captures, threats, combinations, and practical calculation habits." },
  { level: "Level 3", title: "Strategic Growth", description: "Planning, positional understanding, opening principles, endgames, and structured game analysis." },
  { level: "Level 4", title: "Competitive Preparation", description: "Advanced preparation, tournament routines, time management, and reflective improvement." },
];

const initialForm: EnquiryForm = { name: "", phone: "", program: "", message: "" };

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function Logo({ header = false, testId }: { header?: boolean; testId: string }) {
  return (
    <img
      src="/gmca-logo.webp"
      alt="Genius Mind Chess Academy official logo"
      className={header ? "h-full w-full object-contain object-center" : "h-16 w-auto max-w-full object-contain"}
      data-testid={testId}
    />
  );
}

function SectionIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  const slug = slugify(eyebrow);
  return (
    <div className="max-w-2xl" data-testid={`section-intro-${slug}`}>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#014DFF]" data-testid={`section-eyebrow-${slug}`}>{eyebrow}</p>
      <h2 className="gmca-heading text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl" data-testid={`section-heading-${slug}`}>{title}</h2>
      <p className="mt-4 text-base leading-8 text-slate-600" data-testid={`section-description-${slug}`}>{description}</p>
    </div>
  );
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState<EnquiryForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const configQuery = useQuery({
    queryKey: ["runtime-config"],
    queryFn: loadRuntimeConfig,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });

  const enquiryMutation = useMutation({
    mutationFn: async (payload: EnquiryForm) => {
      const callMeBot = configQuery.data?.callMeBot;
      if (!callMeBot?.enabled || !isConfigured(callMeBot.phone) || !isConfigured(callMeBot.apiKey)) {
        throw new Error("CallMeBot is not configured in config.json");
      }
      await sendEnquiryViaCallMeBot(callMeBot, payload);
    },
    onSuccess: () => {
      setSubmitted(true);
      setForm(initialForm);
      toast.success("Your enquiry was sent to the GMCA team on WhatsApp.");
    },
  });

  useEffect(() => {
    const sections = navItems.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActiveSection(entry.target.id)),
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const goTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(false);
    enquiryMutation.mutate(form);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8FAFC] text-slate-950" data-testid="academy-site">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl" data-testid="site-header">
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#home" onClick={() => goTo("home")} className="flex items-center gap-3" data-testid="brand-home-link">
            <span className="flex h-20 w-[4.6rem] shrink-0 items-center justify-center overflow-visible" data-testid="header-logo-frame"><Logo header testId="header-full-logo-image" /></span>
            <span className="flex flex-col justify-center border-l border-slate-200 pl-3" data-testid="brand-short-name"><span className="gmca-heading text-base font-extrabold leading-tight text-[#014DFF] sm:text-xl lg:text-2xl">Genius Mind Chess Academy</span><span className="hidden text-xs font-bold text-slate-500 sm:block">Noida · Est. 2011</span></span>
          </a>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation" data-testid="desktop-navigation">
            {navItems.map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={() => goTo(id)} className={`rounded-full px-3 py-2 text-xs font-bold transition-colors duration-200 ${activeSection === id ? "bg-blue-50 text-[#014DFF]" : "text-slate-600 hover:bg-slate-50 hover:text-[#014DFF]"}`} data-testid={`nav-link-${id}`}>
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href="#contact" onClick={() => goTo("contact")} className="hidden rounded-full bg-[#014DFF] px-4 py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(1,77,255,0.2)] transition-transform duration-200 hover:-translate-y-0.5 min-[480px]:inline-flex" data-testid="header-book-trial-button">Book Trial</a>
            <button type="button" onClick={() => setMenuOpen((open) => !open)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors hover:border-[#014DFF] hover:text-[#014DFF] lg:hidden" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} data-testid="mobile-menu-toggle">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-5 pb-5 pt-2 shadow-xl lg:hidden" data-testid="mobile-navigation">
            {navItems.map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={() => goTo(id)} className={`block border-b border-slate-100 py-3 text-sm font-bold ${activeSection === id ? "text-[#014DFF]" : "text-slate-700"}`} data-testid={`mobile-nav-link-${id}`}>{label}</a>
            ))}
            <a href="#contact" onClick={() => goTo("contact")} className="mt-4 flex justify-center rounded-full bg-[#014DFF] px-4 py-3 text-sm font-bold text-white" data-testid="mobile-book-trial-button">Book a Trial Class</a>
          </div>
        )}
      </header>

      <main>
        <section id="home" className="gmca-section relative overflow-hidden bg-white pt-32" data-testid="home-section">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[#F8FAFC] lg:block" aria-hidden="true" />
          <div className="gmca-board-pattern absolute right-[-8rem] top-28 hidden h-96 w-96 rounded-full opacity-10 lg:block" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-12 sm:px-8 lg:grid-cols-[1.03fr_.97fr] lg:gap-16 lg:pb-16">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-[#014DFF]" data-testid="home-establishment-badge"><Crown size={14} /> Promoting chess since 2011</div>
              <h1 className="gmca-heading max-w-3xl text-4xl font-bold leading-[1.07] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl" data-testid="home-headline">Genius Mind Chess Academy</h1>
              <p className="mt-3 max-w-2xl text-xl font-bold text-[#014DFF] sm:text-2xl" data-testid="home-tagline">Cultivating Genius, One Move at a Time</p>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg" data-testid="home-subheadline">Genius Mind Chess Academy helps students grow through thoughtful coaching, meaningful practice, and the confidence to make their next move.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row" data-testid="home-cta-group">
                <a href="#contact" onClick={() => goTo("contact")} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#014DFF] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(1,77,255,0.22)] transition-transform duration-200 hover:-translate-y-1" data-testid="hero-book-trial-button">Book a Trial Class <ChevronRight size={17} /></a>
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition-colors duration-200 hover:border-[#014DFF] hover:text-[#014DFF]" data-testid="hero-whatsapp-button"><MessageCircle size={17} /> Enquire on WhatsApp</a>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 pt-5 text-xs font-bold text-slate-500" data-testid="home-trust-bar">
                <span className="inline-flex items-center gap-1.5 text-slate-700" data-testid="trust-google-rating"><Star size={14} className="fill-[#014DFF] text-[#014DFF]" /> 4.8★ Google Rating (43 reviews)</span>
                <span data-testid="trust-established">Est. 2011</span>
                <span data-testid="trust-community">1.9K+ Facebook Community</span>
              </div>
            </div>
            <div className="relative min-h-[25rem] rounded-[2rem] border border-blue-100 bg-[#F8FAFC] p-5 sm:p-8" data-testid="home-logo-feature">
              <div className="gmca-board-pattern absolute inset-0 rounded-[2rem] opacity-10" aria-hidden="true" />
              <div className="relative h-full"><PhotoCarousel config={configQuery.data} /></div>
            </div>
          </div>
          <div className="relative mx-auto grid max-w-7xl gap-5 px-5 pb-20 sm:px-8 lg:grid-cols-[1.2fr_.8fr]" data-testid="home-preview-strip">
            <SheetTestimonialPreview config={configQuery.data} />
            <LiveTournamentPreview config={configQuery.data} />
          </div>
        </section>

        <section id="about" className="gmca-section border-t border-slate-200 bg-[#F8FAFC] py-20 sm:py-28" data-testid="about-section">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionIntro eyebrow="About GMCA" title="A thoughtful start. A stronger next move." description="GMCA (Genius Mind Chess Academy) was formed in 2011 for the promotion of chess. We provide chess training in group or individual settings at all levels — Beginner, Intermediate, and Advanced. We also organize chess tournaments to provide a competitive environment for our students." />
            <div className="mt-16 grid gap-6 lg:grid-cols-[.82fr_1.18fr] lg:items-start">
              <div className="rounded-3xl bg-[#014DFF] p-7 text-white sm:p-9" data-testid="about-why-chess-intro"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><Crown size={25} /></div><h3 className="gmca-heading mt-8 text-3xl font-bold" data-testid="why-chess-heading">Why chess?</h3><p className="mt-4 text-sm leading-7 text-blue-100" data-testid="why-chess-copy">A chessboard gives young minds a safe place to think, decide, adapt, and try again. Those habits travel far beyond the game.</p><div className="mt-10 grid grid-cols-2 gap-3 text-xs font-bold text-white sm:grid-cols-3 lg:grid-cols-2"><span className="rounded-xl border border-white/20 bg-white/10 px-3 py-3" data-testid="why-chess-tag-thinking">Think clearly</span><span className="rounded-xl border border-white/20 bg-white/10 px-3 py-3" data-testid="why-chess-tag-decide">Decide bravely</span><span className="rounded-xl border border-white/20 bg-white/10 px-3 py-3" data-testid="why-chess-tag-grow">Grow steadily</span><span className="rounded-xl border border-white/20 bg-white/10 px-3 py-3" data-testid="why-chess-tag-focus">Focus</span></div></div>
              <div className="grid gap-3 sm:grid-cols-2" data-testid="benefits-grid">{benefits.map(({ title, description, Icon }) => <Card key={title} className="border-slate-200 bg-white transition-transform duration-200 hover:-translate-y-1 hover:border-blue-200" data-testid={`benefit-card-${title.toLowerCase().replaceAll(" ", "-")}`}><CardContent className="flex gap-4 p-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#014DFF]"><Icon size={19} /></div><div><h3 className="text-sm font-bold text-slate-900" data-testid={`benefit-title-${title.toLowerCase().replaceAll(" ", "-")}`}>{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500" data-testid={`benefit-description-${title.toLowerCase().replaceAll(" ", "-")}`}>{description}</p></div></CardContent></Card>)}</div>
            </div>
          </div>
        </section>

        <section id="vision" className="gmca-section bg-white py-20 sm:py-28" data-testid="vision-mission-section">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionIntro eyebrow="Vision & Mission" title="Growing capable thinkers, one move at a time" description="Our direction is rooted in thoughtful learning, personal attention, and the lasting habits chess can build." />
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              <Card className="border-blue-100 bg-blue-50/60" data-testid="vision-card"><CardContent className="p-7 sm:p-9"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#014DFF]"><Target size={21} /></div><p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#014DFF]">Our Vision</p>{/* Placeholder: replace with owner-approved final vision statement. */}<h3 className="gmca-heading mt-3 text-2xl font-bold text-slate-950" data-testid="vision-heading">To help young minds become focused, confident, and thoughtful decision-makers through chess.</h3><p className="mt-4 text-xs font-bold text-slate-400" data-testid="vision-placeholder-label">awaiting owner approval</p></CardContent></Card>
              <Card className="border-slate-200 bg-white" data-testid="mission-card"><CardContent className="p-7 sm:p-9"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#014DFF]"><ShieldCheck size={21} /></div><p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#014DFF]">Our Mission</p>{/* Placeholder: replace with owner-approved final mission statement. */}<h3 className="gmca-heading mt-3 text-2xl font-bold text-slate-950" data-testid="mission-heading">To offer encouraging, structured chess learning that supports every student’s ability and ambition.</h3><p className="mt-4 text-xs font-bold text-slate-400" data-testid="mission-placeholder-label">awaiting owner approval</p></CardContent></Card>
            </div>
          </div>
        </section>

        <section id="coaches" className="gmca-section bg-white py-20 sm:py-28" data-testid="coaches-section">
                    <div className="mx-auto max-w-7xl px-5 sm:px-8"><SectionIntro eyebrow="Meet the coaches" title="Guidance with a personal touch" description="Learn from experienced chess instructors through classes designed for every level." /><div className="mt-12 grid gap-5 md:grid-cols-2">{[{ name: "Amrendra Kumar", role: "Founder and AICF Certified Chess Instructor", mode: "Offline", slug: "amrendra", photo: "/coach-amrendra.jpeg" }, { name: "Suchitra Pandit", role: "Director and AICF Certified Chess Instructor", mode: "Offline", slug: "suchitra", photo: "/coach-suchitra.jpeg" }, { name: "Mintu Gayen", role: "National Chess Instructor by FIDE", mode: "Offline", slug: "mintu", photo: "/coach-mintu.jpeg" }, { name: "Shrikant Tyagi", role: "Chess Instructor", mode: "Online", slug: "shrikant", photo: "/coach-shrikant.jpeg" }, { name: "Jaikishan Jaiswal", role: "Arena International Master", mode: "Online", slug: "jaikishan", photo: "/coach-jaikishan.jpeg" }].map((coach) => <Card key={coach.slug} className="overflow-hidden border-slate-200 bg-white shadow-sm" data-testid={`coach-card-${coach.slug}`}><CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">{coach.photo ? <div className="h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-blue-50 sm:h-36 sm:w-36" data-testid={`coach-headshot-${coach.slug}`}><img src={coach.photo} alt={coach.name} className="h-full w-full object-cover" /></div> : <div className="flex h-32 w-full shrink-0 items-center justify-center rounded-2xl bg-blue-50 sm:h-36 sm:w-36" data-testid={`coach-headshot-placeholder-${coach.slug}`}><div className="text-center"><Crown className="mx-auto text-[#014DFF]" size={35} /><p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#014DFF]" data-testid={`coach-headshot-label-${coach.slug}`}>Headshot<br />placeholder</p></div></div>}<div><p className="text-xs font-bold uppercase tracking-[0.17em] text-[#014DFF]" data-testid={`coach-role-${coach.slug}`}>{coach.role}</p><h3 className="gmca-heading mt-2 text-2xl font-bold text-slate-900" data-testid={`coach-name-${coach.slug}`}>{coach.name}</h3>{coach.mode === "Online" && (
  <span
    className="mt-5 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#014DFF]"
    data-testid={`coach-mode-badge-${coach.slug}`}
  >
    Online classes
  </span>
)}</div></CardContent></Card>)}</div></div>

        </section>

        <section id="programs" className="gmca-section border-y border-slate-200 bg-[#F8FAFC] py-20 sm:py-28" data-testid="programs-section">
          <div className="mx-auto max-w-7xl px-5 sm:px-8"><SectionIntro eyebrow="Programs" title="Find the right way to learn" description="Choose a format that fits your student and your family. Online and offline chess training are both available." /><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{programs.map(({ title, description, Icon }) => <Card key={title} className="border-slate-200 bg-white transition-transform duration-200 hover:-translate-y-1 hover:border-blue-200" data-testid={`program-card-${slugify(title)}`}><CardContent className="flex h-full flex-col p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#014DFF]"><Icon size={20} /></div><h3 className="mt-5 text-base font-bold text-slate-900" data-testid={`program-title-${slugify(title)}`}>{title}</h3><p className="mt-2 flex-1 text-sm leading-6 text-slate-500" data-testid={`program-description-${slugify(title)}`}>{description}</p><span className="mt-5 inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500" data-testid={`program-format-${slugify(title)}`}>Online + Offline</span></CardContent></Card>)}</div><div className="mt-7 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 text-sm leading-6 text-slate-700" data-testid="programs-timing-note"><CalendarDays className="mt-0.5 shrink-0 text-[#014DFF]" size={19} /><p><strong>Current schedule:</strong> Batch timings and detailed curriculum available on request — contact us for the current schedule.</p></div></div>
        </section>

        <section id="curriculum" className="gmca-section bg-white py-20 sm:py-28" data-testid="curriculum-section">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionIntro eyebrow="Learning Pathway" title="A syllabus that grows with the player" description="Students move from confident fundamentals toward deeper strategy and competitive readiness through a clear learning pathway." />
            {/* Placeholder: replace level names and descriptions with the final owner-approved GMCA syllabus. */}
            <div className="relative mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="curriculum-levels-grid">{curriculumLevels.map((item, index) => <Card key={item.level} className="relative overflow-hidden border-slate-200 bg-white" data-testid={`curriculum-level-${index + 1}`}><CardContent className="p-6"><span className="text-5xl font-bold text-blue-50" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[#014DFF]" data-testid={`curriculum-level-label-${index + 1}`}>{item.level}</p><h3 className="gmca-heading mt-2 text-xl font-bold text-slate-950" data-testid={`curriculum-level-title-${index + 1}`}>{item.title}</h3><p className="mt-3 text-sm leading-6 text-slate-500" data-testid={`curriculum-level-description-${index + 1}`}>{item.description}</p></CardContent></Card>)}</div>
            <p className="mt-6 text-xs font-bold text-slate-400" data-testid="curriculum-placeholder-note">Draft pathway</p>
          </div>
        </section>

        <section id="fees" className="gmca-section bg-white py-20 sm:py-24" data-testid="fees-section">
          <div className="mx-auto max-w-5xl px-5 sm:px-8"><div className="relative overflow-hidden rounded-3xl bg-[#014DFF] px-6 py-10 text-white sm:px-12 sm:py-14" data-testid="fees-card"><div className="gmca-board-pattern absolute inset-0 opacity-10" aria-hidden="true" /><div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between"><div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100" data-testid="fees-eyebrow">Fees & availability</p><h2 className="gmca-heading mt-3 text-3xl font-bold" data-testid="fees-heading">A plan that fits your learning goals</h2><p className="mt-4 text-sm leading-7 text-blue-100" data-testid="fees-message">Fees vary by program and batch. Contact us on WhatsApp for current pricing and available discounts.</p></div><a href={`${WHATSAPP_URL}?text=Hi%20GMCA%2C%20I%20would%20like%20to%20know%20the%20current%20fees.`} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-bold text-[#014DFF] transition-transform duration-200 hover:-translate-y-1" data-testid="fees-whatsapp-button"><MessageCircle size={17} /> Ask on WhatsApp</a></div></div></div>
        </section>

        <section id="schedule" className="gmca-section border-y border-slate-200 bg-[#F8FAFC] py-20 sm:py-28" data-testid="schedule-section">
          <div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><SectionIntro eyebrow="Class Schedule" title="Live batches and session details" description="Current dates, times, formats, fees, and online session links update directly from the academy's published schedule." /><LiveSectionLabel testId="schedule-live-source-label">Live from Google Sheets</LiveSectionLabel></div><div className="mt-12"><LiveSchedule config={configQuery.data} /></div></div>
        </section>

        <section id="tournaments" className="gmca-section bg-[#F8FAFC] py-20 sm:py-28" data-testid="tournaments-section">
          <div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><SectionIntro eyebrow="Play & compete" title="A live calendar for growing players" description="Tournament dates, formats, fees, prizes, platforms, and registration links update directly from the academy's published sheet." /><LiveSectionLabel testId="tournaments-live-source-label">Live from Google Sheets</LiveSectionLabel></div><div className="mt-12"><LiveTournaments config={configQuery.data} /></div></div>
        </section>

        <section id="testimonials" className="gmca-section bg-white py-20 sm:py-28" data-testid="testimonials-section">
          <div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><SectionIntro eyebrow="Parent voices" title="Trusted by families in Noida" description="Academy testimonials update directly from the published parent-feedback sheet." /><LiveSectionLabel testId="testimonials-live-source-label">Live from Google Sheets</LiveSectionLabel></div><div className="mt-12"><SheetTestimonials config={configQuery.data} /></div></div>
        </section>

        <section id="google-reviews" className="gmca-section border-y border-slate-200 bg-[#F8FAFC] py-20 sm:py-28" data-testid="google-reviews-section">
          <div className="mx-auto max-w-7xl px-5 sm:px-8"><SectionIntro eyebrow="Live Google Reviews" title="The latest feedback from Google" description="A separate live view of recent Google feedback, with reviewer attribution and ratings supplied by Google Places." /><div className="mt-12"><LiveGoogleReviews config={configQuery.data} /></div></div>
        </section>

        <section id="gallery" className="gmca-section border-y border-slate-200 bg-[#F8FAFC] py-20 sm:py-28" data-testid="gallery-section">
          <div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><SectionIntro eyebrow="Gallery" title="The game, in every kind of moment" description="Academy photos are loaded from the public Google Drive gallery and update without rebuilding the website." /><GallerySetupHeading /></div><div className="mt-12"><DriveGallery config={configQuery.data} /></div></div>
        </section>

        <section id="support" className="gmca-section border-y border-slate-200 bg-[#F8FAFC] py-20 sm:py-28" data-testid="support-section">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionIntro eyebrow="Support Us" title="Help us grow chess amongst underprivileged children" description="Your contribution supports free and subsidized coaching, boards, and tournament opportunities for children who could not otherwise access chess education." />
            <Card className="mt-12 overflow-hidden border-slate-200 bg-white shadow-sm" data-testid="donation-card">
              <CardContent className="flex flex-col items-center gap-8 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
                <div className="max-w-md">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#014DFF]" data-testid="donation-heart-icon"><Heart size={21} /></div>
                  <h3 className="gmca-heading mt-5 text-2xl font-bold text-slate-950" data-testid="donation-heading">Every contribution makes a move</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600" data-testid="donation-description">Genius Mind Chess Academy is committed to promoting chess amongst underprivileged children and improving the quality of coaching for every student. If you would like to support this mission, you can contribute directly using the UPI details below.</p>
                  <div className="mt-6 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4" data-testid="donation-upi-details">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">UPI ID</p>
                    <p className="text-sm font-bold text-slate-900" data-testid="donation-upi-id">9953048933@upi</p>
                    <p className="text-xs text-slate-500">Scan the QR code or use this UPI ID with BHIM, Google Pay, PhonePe, or any other UPI app.</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3" data-testid="donation-qr-wrapper">
                  <img src="/gmca-donation-qr.png" alt="UPI QR code to donate to Genius Mind Chess Academy" className="h-56 w-56 rounded-2xl border border-slate-200 object-contain p-3 sm:h-64 sm:w-64" data-testid="donation-qr-image" />
                  <p className="text-xs font-bold text-slate-400" data-testid="donation-qr-caption">Scan to donate via UPI</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="contact" className="gmca-section bg-white py-20 sm:py-28" data-testid="contact-section">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-20"><div><SectionIntro eyebrow="Start a conversation" title="Make the next move with GMCA" description="Tell us a little about what you are looking for. The team will help you find the right program or batch." /><div className="mt-10 space-y-5" data-testid="contact-details"><a href="tel:+919953048933" className="flex items-start gap-4 text-slate-700 hover:text-[#014DFF]" data-testid="contact-phone-link"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#014DFF]"><Phone size={18} /></span><span><strong className="block text-sm text-slate-900">Phone / WhatsApp</strong><span className="mt-1 block text-sm">+91 99530 48933</span></span></a><a href="mailto:geniusmindchess@gmail.com" className="flex items-start gap-4 text-slate-700 hover:text-[#014DFF]" data-testid="contact-email-link"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#014DFF]"><Mail size={18} /></span><span><strong className="block text-sm text-slate-900">Email</strong><span className="mt-1 block text-sm">geniusmindchess@gmail.com</span></span></a><div className="flex items-start gap-4" data-testid="contact-hours"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#014DFF]"><Clock3 size={18} /></span><span className="text-sm leading-6 text-slate-600"><strong className="block text-slate-900">Hours</strong>Mon–Thu 3:30 PM – 7:30 PM (Tue/Thu until 5:30 PM)<br />Sat–Sun 10:00 AM – 1:00 PM<br /><span className="font-bold text-slate-900">Friday Closed</span></span></div><div className="flex items-start gap-4" data-testid="contact-location"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#014DFF]"><MapPin size={18} /></span><span className="text-sm leading-6 text-slate-600"><strong className="block text-slate-900">Location</strong>BL-8, Sector 116, Noida, UP 201301</span></div></div><p className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-500" data-testid="hours-confirmation-note">Note: hours conflict between sources — using Google Maps version as default, flagged for owner confirmation.</p><div className="mt-5"><LiveMap config={configQuery.data} /></div></div>
            <Card className="border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]" data-testid="contact-form-card"><CardContent className="p-6 sm:p-8"><div className="mb-7 flex items-start justify-between gap-5"><div><h2 className="gmca-heading text-2xl font-bold text-slate-950" data-testid="contact-form-heading">Enquire about classes</h2><p className="mt-2 text-sm text-slate-500" data-testid="contact-form-helper">Share your details and we’ll send them directly to the GMCA WhatsApp account.</p></div><div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#014DFF] sm:flex"><MessageCircle size={20} /></div></div>{submitted && <div className="mb-6 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4" role="status" data-testid="contact-success-message"><CheckCircle2 className="mt-0.5 shrink-0 text-[#014DFF]" size={19} /><div><p className="text-sm font-bold text-slate-900">Thank you — your enquiry was sent.</p><p className="mt-1 text-xs leading-5 text-slate-600">The request was sent directly to GMCA through CallMeBot. The team will be in touch.</p></div></div>}{enquiryMutation.isError && <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800" role="alert" data-testid="contact-error-message">CallMeBot is not configured or could not be reached. Update callMeBot in config.json, or use the WhatsApp link below.</p>}<form onSubmit={handleSubmit} className="space-y-5" data-testid="contact-form"><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="contact-name">Name</Label><Input id="contact-name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" data-testid="contact-name-input" /></div><div className="space-y-2"><Label htmlFor="contact-phone">Phone</Label><Input id="contact-phone" required type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+91 ..." data-testid="contact-phone-input" /></div></div><div className="space-y-2"><Label htmlFor="contact-program">Program Interested In</Label><select id="contact-program" required value={form.program} onChange={(event) => setForm({ ...form, program: event.target.value })} className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-[#014DFF] focus:ring-2 focus:ring-[#014DFF]/20" data-testid="contact-program-select"><option value="" disabled>Select a program</option>{programs.map((program) => <option key={program.title} value={program.title}>{program.title}</option>)}<option value="Not sure yet">Not sure yet</option></select></div><div className="space-y-2"><Label htmlFor="contact-message">Message</Label><Textarea id="contact-message" required value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Tell us how we can help..." rows={4} data-testid="contact-message-input" /></div><Button type="submit" disabled={enquiryMutation.isPending} className="h-12 w-full rounded-full bg-[#014DFF] text-sm font-bold text-white hover:bg-[#013FCC]" data-testid="contact-submit-button">{enquiryMutation.isPending ? "Sending to WhatsApp..." : "Send enquiry"}</Button><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-sm font-bold text-[#014DFF] hover:underline" data-testid="contact-whatsapp-link"><MessageCircle size={16} /> Prefer WhatsApp? Chat with us</a></form></CardContent></Card>
          </div>
        </section>
      </main>

            <footer className="border-t border-slate-200 bg-white" data-testid="site-footer"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.2fr_1fr_1fr]"><div><Logo testId="footer-full-logo-image" /><p className="mt-5 max-w-xs text-sm leading-6 text-slate-600" data-testid="footer-tagline">Cultivating Genius, One Move at a Time.</p></div><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400" data-testid="footer-links-heading">Explore</p><div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3">{navItems.slice(1).map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => goTo(id)} className="text-sm font-bold text-slate-600 hover:text-[#014DFF]" data-testid={`footer-link-${id}`}>{label}</a>)}</div></div><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400" data-testid="footer-connect-heading">Connect</p><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#014DFF]" data-testid="footer-whatsapp-link"><MessageCircle size={16} /> WhatsApp</a><a href="https://www.facebook.com/geniusmindchessacademy/" target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#014DFF]" data-testid="footer-facebook-link"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1877F2] text-[10px] font-bold text-white">f</span> Facebook</a></div></div><div className="border-t border-slate-100"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8"><p data-testid="footer-copyright">© 2026 Genius Mind Chess Academy. Est. 2011.</p><p data-testid="footer-designer-credit">Designed and Created with ❤️ by <a href="https://wa.me/919528321292" target="_blank" rel="noreferrer" className="font-bold text-slate-500 hover:text-[#014DFF] hover:underline" data-testid="footer-designer-credit-kriti">Kriti Sharma</a> and <a href="https://wa.me/918789755900" target="_blank" rel="noreferrer" className="font-bold text-slate-500 hover:text-[#014DFF] hover:underline" data-testid="footer-designer-credit-ayush">Ayush Chaturvedi</a></p></div></div></footer>
      <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_24px_rgba(37,211,102,0.35)] transition-transform duration-200 hover:scale-105" aria-label="Chat with Genius Mind Chess Academy on WhatsApp" data-testid="floating-whatsapp-button"><MessageCircle size={25} /></a>
    </div>
  );
}
