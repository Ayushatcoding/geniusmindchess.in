import type { RuntimeConfig } from "@/lib/runtime-config";

export interface DriveImage {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
}

export type SheetRow = Record<string, string>;

export interface GoogleReview {
  authorName: string;
  authorUrl?: string;
  rating: number;
  text: string;
  relativeTime: string;
}

export interface GooglePlaceReviews {
  name: string;
  rating?: number;
  totalRatings?: number;
  url?: string;
  reviews: GoogleReview[];
}

export async function listDriveImages(apiKey: string, folderId: string): Promise<DriveImage[]> {
  const query = `'${folderId.replaceAll("'", "\\'")}' in parents and trashed = false and mimeType contains 'image/'`;
  const params = new URLSearchParams({
    key: apiKey,
    q: query,
    spaces: "drive",
    pageSize: "100",
    orderBy: "name_natural",
    fields: "files(id,name,mimeType,modifiedTime)",
  });
  const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`);
  if (!response.ok) throw new Error(`Google Drive returned ${response.status}`);
  const body = (await response.json()) as { files?: DriveImage[] };
  return body.files ?? [];
}

export const driveImageUrl = (id: string) =>
  `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w2000`;

function parseCsv(input: string): string[][] {
  const source = input.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (quoted && character === '"' && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (!quoted && character === ",") {
      row.push(cell);
      cell = "";
    } else if (!quoted && (character === "\n" || character === "\r")) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    if (row.some((value) => value.trim())) rows.push(row);
  }
  return rows;
}

const normalizeHeading = (heading: string) =>
  heading.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

export async function loadPublishedSheet(csvUrl: string): Promise<SheetRow[]> {
  const response = await fetch(csvUrl, { cache: "no-store" });
  if (!response.ok) throw new Error(`Published Google Sheet returned ${response.status}`);
  const rows = parseCsv(await response.text());
  const headings = (rows.shift() ?? []).map(normalizeHeading);
  return rows.map((values) =>
    Object.fromEntries(headings.map((heading, index) => [heading, values[index]?.trim() ?? ""])),
  );
}

export const readSheetValue = (row: SheetRow, ...headings: string[]) => {
  for (const heading of headings) {
    const value = row[normalizeHeading(heading)];
    if (value) return value;
  }
  return "—";
};

// Places API (New) response shapes: https://developers.google.com/maps/documentation/places/web-service/place-details
type PlacesNewAuthorAttribution = {
  displayName?: string;
  uri?: string;
  photoUri?: string;
};

type PlacesNewLocalizedText = {
  text?: string;
  languageCode?: string;
};

type PlacesNewReviewResult = {
  rating?: number;
  text?: PlacesNewLocalizedText;
  originalText?: PlacesNewLocalizedText;
  authorAttribution?: PlacesNewAuthorAttribution;
  relativePublishTimeDescription?: string;
};

type PlaceDetailsResult = {
  displayName?: PlacesNewLocalizedText;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesNewReviewResult[];
};

const PLACE_DETAILS_FIELD_MASK = ["displayName", "rating", "userRatingCount", "googleMapsUri", "reviews"].join(",");

export async function loadGoogleReviews(apiKey: string, placeId: string): Promise<GooglePlaceReviews> {
  const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": PLACE_DETAILS_FIELD_MASK,
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Places API (New) returned ${response.status}`);
  const place = (await response.json()) as PlaceDetailsResult;
  return {
    name: place.displayName?.text ?? "Genius Mind Chess Academy",
    rating: place.rating,
    totalRatings: place.userRatingCount,
    url: place.googleMapsUri,
    reviews: (place.reviews ?? []).map((review) => ({
      authorName: review.authorAttribution?.displayName ?? "Google reviewer",
      authorUrl: review.authorAttribution?.uri,
      rating: review.rating ?? 0,
      text: review.text?.text ?? review.originalText?.text ?? "",
      relativeTime: review.relativePublishTimeDescription ?? "",
    })),
  };
}

export async function sendEnquiryViaCallMeBot(
  config: RuntimeConfig["callMeBot"],
  enquiry: { name: string; phone: string; program: string; message: string },
) {
  const text = [
    "New GMCA website enquiry",
    `Name: ${enquiry.name}`,
    `Phone: ${enquiry.phone}`,
    `Program: ${enquiry.program}`,
    `Message: ${enquiry.message}`,
  ].join("\n");
  const params = new URLSearchParams({ phone: config.phone, text, apikey: config.apiKey });
  await fetch(`https://api.callmebot.com/whatsapp.php?${params}`, {
    method: "GET",
    mode: "no-cors",
    cache: "no-store",
  });
}

export function buildMapEmbedUrl(config: RuntimeConfig["googleMaps"]) {
  const query = config.placeId ? `place_id:${config.placeId}` : config.query;
  return `https://www.google.com/maps/embed/v1/place?${new URLSearchParams({ key: config.embedApiKey, q: query })}`;
}