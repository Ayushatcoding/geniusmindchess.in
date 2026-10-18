import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, Images, MapPin, Quote, Star, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  buildMapEmbedUrl,
  driveImageUrl,
  listDriveImages,
  loadGoogleReviews,
  loadPublishedSheet,
  readSheetValue,
} from "@/lib/external-data";
import { isConfigured, type RuntimeConfig } from "@/lib/runtime-config";

const SETUP_LABEL = "Live content setup required";

function SetupState({ message, testId }: { message: string; testId: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-6 text-center" data-testid={testId}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#014DFF]" data-testid={`${testId}-label`}>{SETUP_LABEL}</p>
      <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600" data-testid={`${testId}-message`}>{message}</p>
    </div>
  );
}

function LoadingState({ testId }: { testId: string }) {
  return <div className="min-h-40 animate-pulse rounded-2xl bg-slate-100" aria-label="Loading live content" data-testid={testId} />;
}

function useDriveImages(config?: RuntimeConfig) {
  const ready = Boolean(config && isConfigured(config.googleDrive.apiKey) && isConfigured(config.googleDrive.folderId));
  return {
    ready,
    query: useQuery({
      queryKey: ["google-drive-images", config?.googleDrive.folderId],
      queryFn: () => listDriveImages(config!.googleDrive.apiKey, config!.googleDrive.folderId),
      enabled: ready,
      retry: false,
      staleTime: 5 * 60 * 1000,
    }),
  };
}

export function PhotoCarousel({ config }: { config?: RuntimeConfig }) {
  const { ready, query } = useDriveImages(config);
  const [activeIndex, setActiveIndex] = useState(0);
  const images = query.data ?? [];

  useEffect(() => {
    if (images.length < 2) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % images.length), 5000);
    return () => window.clearInterval(timer);
  }, [images.length]);

  useEffect(() => setActiveIndex(0), [images.length]);

  if (!ready) {
    return (
      <div className="relative flex h-full min-h-[23rem] flex-col items-center justify-center rounded-[1.4rem] border border-white bg-white/85 px-6 py-10 shadow-[0_24px_70px_rgba(15,23,42,0.1)] backdrop-blur-sm" data-testid="home-slideshow-setup">
        <img src="/gmca-emblem.webp" alt="Genius Mind Chess Academy emblem" className="h-44 w-44 object-contain sm:h-52 sm:w-52" data-testid="home-slideshow-fallback-logo" />
        <p className="gmca-heading mt-6 text-center text-2xl font-bold text-slate-900" data-testid="home-slideshow-fallback-title">Academy moments, coming here</p>
        <p className="mt-2 text-center text-sm leading-6 text-slate-500" data-testid="home-slideshow-fallback-copy">Add the public Drive folder ID and browser key in config.json to activate the live slideshow.</p>
      </div>
    );
  }
  if (query.isPending) return <LoadingState testId="home-slideshow-loading" />;
  if (query.isError || images.length === 0) return <SetupState testId="home-slideshow-unavailable" message="The public Google Drive folder is empty or unavailable. Check its sharing permissions and config.json values." />;

  const image = images[activeIndex];
  return (
    <div className="group relative h-full min-h-[25rem] overflow-hidden rounded-[1.4rem] bg-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.16)]" data-testid="home-photo-carousel">
      <img src={driveImageUrl(image.id)} alt={image.name} className="absolute inset-0 h-full w-full object-cover" data-testid="home-carousel-active-image" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white sm:p-7">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100" data-testid="home-carousel-label">From our academy gallery</p><p className="mt-1 text-sm font-bold" data-testid="home-carousel-caption">{image.name}</p></div>
        {images.length > 1 && <div className="flex gap-2"><button type="button" onClick={() => setActiveIndex((activeIndex - 1 + images.length) % images.length)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-900" aria-label="Previous academy photo" data-testid="home-carousel-previous-button"><ChevronLeft size={17} /></button><button type="button" onClick={() => setActiveIndex((activeIndex + 1) % images.length)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-900" aria-label="Next academy photo" data-testid="home-carousel-next-button"><ChevronRight size={17} /></button></div>}
      </div>
    </div>
  );
}

export function DriveGallery({ config }: { config?: RuntimeConfig }) {
  const { ready, query } = useDriveImages(config);
  if (!ready) return <SetupState testId="gallery-drive-setup" message="Add GOOGLE_DRIVE_BROWSER_API_KEY and PUBLIC_GOOGLE_DRIVE_FOLDER_ID values in config.json. Images in that public folder will appear here automatically." />;
  if (query.isPending) return <LoadingState testId="gallery-drive-loading" />;
  if (query.isError || !query.data?.length) return <SetupState testId="gallery-drive-unavailable" message="No public gallery images could be loaded. Confirm the Drive folder and every image are shared publicly." />;
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="drive-gallery-grid">{query.data.map((image, index) => <figure key={image.id} className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white ${index === 0 ? "sm:row-span-2" : ""}`} data-testid={`drive-gallery-card-${index + 1}`}><img src={driveImageUrl(image.id)} alt={image.name} loading="lazy" className={`h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105 ${index === 0 ? "sm:h-full sm:min-h-[33rem]" : ""}`} data-testid={`drive-gallery-image-${index + 1}`} /><figcaption className="absolute inset-x-3 bottom-3 rounded-xl bg-white/92 px-4 py-3 backdrop-blur-sm"><p className="truncate text-xs font-bold text-slate-900" data-testid={`drive-gallery-caption-${index + 1}`}>{image.name}</p></figcaption></figure>)}</div>;
}

function useSheet(url: string | undefined, key: string) {
  const ready = isConfigured(url);
  return { ready, query: useQuery({ queryKey: [key, url], queryFn: () => loadPublishedSheet(url!), enabled: ready, retry: false, staleTime: 2 * 60 * 1000 }) };
}

export function LiveSchedule({ config }: { config?: RuntimeConfig }) {
  const { ready, query } = useSheet(config?.googleSheets.scheduleCsvUrl, "class-schedule");
  if (!ready) return <SetupState testId="schedule-sheet-setup" message="Publish the Class Schedule sheet as CSV, then add its URL to googleSheets.scheduleCsvUrl in config.json. Expected columns: Date, Time, Program, Mode, Fees, Zoom Link, Notes." />;
  if (query.isPending) return <LoadingState testId="schedule-sheet-loading" />;
  if (query.isError || !query.data?.length) return <SetupState testId="schedule-sheet-unavailable" message="The published Class Schedule sheet is unavailable or has no rows." />;
  return <Card className="overflow-hidden border-slate-200 bg-white" data-testid="live-schedule-table-card"><CardContent className="p-0"><Table data-testid="live-schedule-table"><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Program</TableHead><TableHead>Mode</TableHead><TableHead>Fees</TableHead><TableHead>Session link</TableHead></TableRow></TableHeader><TableBody>{query.data.map((row, index) => <TableRow key={`${readSheetValue(row, "date")}-${index}`} data-testid={`schedule-row-${index + 1}`}><TableCell>{readSheetValue(row, "date")}</TableCell><TableCell>{readSheetValue(row, "time")}</TableCell><TableCell className="font-bold text-slate-900">{readSheetValue(row, "program", "class", "batch")}</TableCell><TableCell>{readSheetValue(row, "mode")}</TableCell><TableCell>{readSheetValue(row, "fees", "fee")}</TableCell><TableCell>{renderExternalLink(readSheetValue(row, "zoom link", "zoom_url", "session link"), `schedule-zoom-link-${index + 1}`)}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>;
}

function renderExternalLink(value: string, testId: string) {
  if (value === "—" || !/^https?:\/\//i.test(value)) return <span className="text-slate-400" data-testid={testId}>—</span>;
  return <a href={value} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-[#014DFF] hover:underline" data-testid={testId}>Open <ExternalLink size={13} /></a>;
}

export function LiveTournaments({ config }: { config?: RuntimeConfig }) {
  const { ready, query } = useSheet(config?.googleSheets.tournamentsCsvUrl, "live-tournaments");
  if (!ready) return <SetupState testId="tournaments-sheet-setup" message="Publish the Tournaments sheet as CSV, then add its URL to googleSheets.tournamentsCsvUrl in config.json. Expected columns: Tournament, Date, Time, Format, Platform, Fees, Prize, Registration Link." />;
  if (query.isPending) return <LoadingState testId="tournaments-sheet-loading" />;
  if (query.isError || !query.data?.length) return <SetupState testId="tournaments-sheet-unavailable" message="The published Tournaments sheet is unavailable or has no current events." />;
  return <div className="grid gap-5 md:grid-cols-2" data-testid="live-tournaments-grid">{query.data.map((row, index) => <Card key={`${readSheetValue(row, "tournament", "title")}-${index}`} className="overflow-hidden border-blue-100 bg-white shadow-sm" data-testid={`live-tournament-card-${index + 1}`}><CardContent className="p-0"><div className="bg-[#014DFF] p-6 text-white"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-100"><Trophy size={15} /> {readSheetValue(row, "date")}</div><h3 className="gmca-heading mt-3 text-2xl font-bold" data-testid={`live-tournament-title-${index + 1}`}>{readSheetValue(row, "tournament", "title", "event")}</h3></div><div className="grid grid-cols-2 gap-5 p-6 text-sm"><TournamentFact label="Time" value={readSheetValue(row, "time")} /><TournamentFact label="Format" value={readSheetValue(row, "format")} /><TournamentFact label="Venue/Platform" value={readSheetValue(row, "venue_platform", "venue", "platform")} /><TournamentFact label="Fees" value={readSheetValue(row, "fees", "entry fee")} /><TournamentFact label="Prize" value={readSheetValue(row, "prize")} /><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Register</p><div className="mt-1">{renderExternalLink(readSheetValue(row, "registration link", "registration_url", "zoom link"), `tournament-registration-link-${index + 1}`)}</div></div></div></CardContent></Card>)}</div>;
}

function TournamentFact({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 font-bold text-slate-900">{value}</p></div>;
}

export function SheetTestimonials({ config }: { config?: RuntimeConfig }) {
  const { ready, query } = useSheet(config?.googleSheets.testimonialsCsvUrl, "sheet-testimonials");
  if (!ready) return <SetupState testId="testimonials-sheet-setup" message="Publish the Testimonials sheet as CSV, then add its URL to googleSheets.testimonialsCsvUrl in config.json. Expected columns: Name, Review, Rating." />;
  if (query.isPending) return <LoadingState testId="testimonials-sheet-loading" />;
  if (query.isError || !query.data?.length) return <SetupState testId="testimonials-sheet-unavailable" message="The published Testimonials sheet is unavailable or has no rows." />;
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="sheet-testimonials-grid">{query.data.map((row, index) => <Card key={`${readSheetValue(row, "name", "author")}-${index}`} className="border-slate-200 bg-white" data-testid={`sheet-testimonial-card-${index + 1}`}><CardContent className="flex h-full flex-col p-6"><div className="flex gap-1 text-[#014DFF]" aria-label={`${readSheetValue(row, "rating")} star rating`}>{Array.from({ length: Math.max(1, Math.min(5, Number.parseInt(readSheetValue(row, "rating"), 10) || 5)) }).map((_, starIndex) => <Star key={starIndex} size={14} className="fill-current" />)}</div><Quote className="mt-6 text-blue-100" size={27} /><p className="mt-3 flex-1 text-sm leading-7 text-slate-600" data-testid={`sheet-testimonial-text-${index + 1}`}>“{readSheetValue(row, "review", "text", "testimonial")}”</p><p className="mt-6 text-sm font-bold text-slate-900" data-testid={`sheet-testimonial-author-${index + 1}`}>— {readSheetValue(row, "name", "author")}</p></CardContent></Card>)}</div>;
}

export function SheetTestimonialPreview({ config }: { config?: RuntimeConfig }) {
  const { ready, query } = useSheet(config?.googleSheets.testimonialsCsvUrl, "sheet-testimonials");
  if (!ready) return <SetupState testId="home-testimonials-preview-setup" message="Connect the published Testimonials sheet in config.json to show parent quotes here." />;
  if (query.isPending) return <LoadingState testId="home-testimonials-preview-loading" />;
  if (query.isError || !query.data?.length) return <SetupState testId="home-testimonials-preview-unavailable" message="Parent testimonials are temporarily unavailable." />;
  return <Card className="border-slate-200 bg-white shadow-sm" data-testid="home-testimonial-preview-card"><CardContent className="p-6 sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#014DFF]" data-testid="home-testimonial-preview-label">Parents say</p><div className="mt-5 grid gap-5 sm:grid-cols-2">{query.data.slice(0, 2).map((row, index) => <div key={`${readSheetValue(row, "name", "author")}-${index}`} className="relative border-l-2 border-[#014DFF] pl-4" data-testid={`home-live-quote-${index + 1}`}><Quote className="absolute -left-1 top-[-9px] bg-white text-[#014DFF]" size={17} /><p className="line-clamp-3 text-sm leading-6 text-slate-700">“{readSheetValue(row, "review", "text", "testimonial")}”</p><p className="mt-2 text-xs font-bold text-slate-500">— {readSheetValue(row, "name", "author")}</p></div>)}</div></CardContent></Card>;
}

export function LiveTournamentPreview({ config }: { config?: RuntimeConfig }) {
  const { ready, query } = useSheet(config?.googleSheets.tournamentsCsvUrl, "live-tournaments");
  if (!ready) return <SetupState testId="home-tournament-preview-setup" message="Connect the published Tournaments sheet in config.json to show the next event here." />;
  if (query.isPending) return <LoadingState testId="home-tournament-preview-loading" />;
  const event = query.data?.[0];
  if (query.isError || !event) return <SetupState testId="home-tournament-preview-unavailable" message="No upcoming tournament is currently published." />;
  return <Card className="gmca-shimmer border-[#014DFF]/20 bg-[#014DFF] text-white shadow-[0_14px_30px_rgba(1,77,255,0.18)]" data-testid="home-tournament-preview-card"><CardContent className="p-6 sm:p-7"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-100" data-testid="home-tournament-preview-date"><Trophy size={15} /> {readSheetValue(event, "date")} · {readSheetValue(event, "time")}</div><h2 className="gmca-heading mt-3 text-2xl font-bold" data-testid="home-tournament-preview-title">{readSheetValue(event, "tournament", "title", "event")}</h2><p className="mt-2 text-sm leading-6 text-blue-100" data-testid="home-tournament-preview-copy">{readSheetValue(event, "format")} · {readSheetValue(event, "venue_platform", "venue", "platform")}</p><a href="#tournaments" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white hover:text-blue-100" data-testid="home-tournament-preview-link">View tournament details <ChevronRight size={16} /></a></CardContent></Card>;
}

export function LiveGoogleReviews({ config }: { config?: RuntimeConfig }) {
  const ready = Boolean(config && isConfigured(config.googlePlaces.apiKey) && isConfigured(config.googlePlaces.placeId));
  const query = useQuery({ queryKey: ["google-place-reviews", config?.googlePlaces.placeId], queryFn: () => loadGoogleReviews(config!.googlePlaces.apiKey, config!.googlePlaces.placeId), enabled: ready, retry: false, staleTime: 10 * 60 * 1000 });
  if (!ready) return <SetupState testId="google-reviews-setup" message="Add a referrer-restricted Google Places browser API key and Place ID to config.json to show live reviews." />;
  if (query.isPending) return <LoadingState testId="google-reviews-loading" />;
  if (query.isError || !query.data) return <SetupState testId="google-reviews-unavailable" message="Live Google reviews are temporarily unavailable. Check the Places API, billing, key restrictions, and Place ID." />;
  return <div data-testid="live-google-reviews"><div className="mb-6 flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-[#014DFF]" data-testid="live-google-rating"><Star size={14} className="fill-current" /> {query.data.rating ?? "—"} on Google · {query.data.totalRatings ?? 0} reviews</span>{query.data.url && <a href={query.data.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#014DFF] hover:underline" data-testid="google-reviews-source-link">View on Google <ExternalLink className="inline" size={13} /></a>}</div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{query.data.reviews.map((review, index) => <Card key={`${review.authorName}-${index}`} className="border-slate-200 bg-white" data-testid={`google-review-card-${index + 1}`}><CardContent className="p-6"><div className="flex gap-1 text-[#014DFF]">{Array.from({ length: Math.round(review.rating) }).map((_, starIndex) => <Star key={starIndex} size={14} className="fill-current" />)}</div><p className="mt-4 text-sm leading-7 text-slate-600" data-testid={`google-review-text-${index + 1}`}>{review.text}</p><div className="mt-5 flex items-center justify-between gap-3"><a href={review.authorUrl ?? query.data.url ?? "#"} target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-900 hover:text-[#014DFF]" data-testid={`google-review-author-${index + 1}`}>{review.authorName}</a><span className="text-xs text-slate-400">{review.relativeTime}</span></div><p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Google review</p></CardContent></Card>)}</div></div>;
}

export function LiveMap({ config }: { config?: RuntimeConfig }) {
  const ready = Boolean(config && isConfigured(config.googleMaps.embedApiKey) && (isConfigured(config.googleMaps.placeId) || isConfigured(config.googleMaps.query)));
  if (!ready) return <SetupState testId="google-map-setup" message="Add the Maps Embed API key and either a Place ID or address query to config.json to activate the map." />;
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white" data-testid="google-map-embed"><iframe src={buildMapEmbedUrl(config!.googleMaps)} title="Genius Mind Chess Academy location map" loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="h-72 w-full border-0" data-testid="google-map-iframe" /><div className="flex items-center gap-2 px-4 py-3 text-xs font-bold text-slate-500"><MapPin size={14} className="text-[#014DFF]" /> BL-8, Sector 116, Noida, UP 201301</div></div>;
}

export function LiveSectionLabel({ children, testId }: { children: string; testId: string }) {
  return <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold text-[#014DFF]" data-testid={testId}><CalendarDays size={15} /> {children}</span>;
}

export function GallerySetupHeading() {
  return <span className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold text-[#014DFF]" data-testid="gallery-live-source-badge"><Images size={14} /> Live from Google Drive</span>;
}