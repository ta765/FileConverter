import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";
import { FORMATTERS, FormatterAction } from "../formatters";

type Body = {
  filename?: string;
  text?: string;
  target?: string;
};

type SourceKind = "xml" | "json" | "csv";

function detectSource(filename: string): SourceKind | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".xml")) return "xml";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".csv")) return "csv";
  return null;
}

function normalizeTarget(raw: string | undefined): SourceKind | null {
  if (!raw || typeof raw !== "string") return null;
  const t = raw.trim().toLowerCase();
  if (t === "json" || t === "xml" || t === "csv") return t;
  return null;
}

function resolveAction(source: SourceKind, target: SourceKind): FormatterAction | null {
  if (source === target) return null;
  const key = `${source}>${target}` as const;
  const map: Record<string, FormatterAction> = {
    "xml>json": "xml2json",
    "xml>csv": "xml2csv",
    "json>xml": "json2xml",
    "json>csv": "json2csv",
    "csv>json": "csv2json",
    "csv>xml": "csv2xml"
  };
  return map[key] ?? null;
}

function buildOutputFilename(filename: string, action: FormatterAction): string {
  const ext: Record<FormatterAction, string> = {
    xml2json: ".json",
    json2xml: ".xml",
    csv2json: ".json",
    json2csv: ".csv",
    csv2xml: ".xml",
    xml2csv: ".csv"
  };
  const base = filename.replace(/\.(xml|json|csv)$/i, "");
  return `${base}${ext[action]}`;
}

function sanitiseFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function uploadTextBlob(
  containerClient: ReturnType<BlobServiceClient["getContainerClient"]>,
  blobName: string,
  text: string
): Promise<void> {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.upload(
    Buffer.from(text, "utf8"),
    Buffer.byteLength(text, "utf8")
  );
}

export async function format(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as Body;

    const filename = body?.filename?.trim() ?? "";
    const text = body?.text ?? "";

    if (!filename || typeof filename !== "string") {
      return {
        status: 400,
        jsonBody: { error: "Missing 'filename' in JSON body." }
      };
    }

    if (!text || typeof text !== "string") {
      return {
        status: 400,
        jsonBody: { error: "Missing 'text' in JSON body." }
      };
    }

    if (text.length > 200_000) {
      return {
        status: 413,
        jsonBody: { error: "Text too large for this demo." }
      };
    }

    const source = detectSource(filename);
    if (!source) {
      return {
        status: 400,
        jsonBody: {
          error: "Unsupported file extension. Use .xml, .json, or .csv."
        }
      };
    }

    const target = normalizeTarget(body.target);
    if (!target) {
      return {
        status: 400,
        jsonBody: {
          error: "Missing or invalid 'target'.Must be 'json', 'xml', or 'csv'."
        }
      };
    }

    if (source === target) {
      return {
        status: 400,
        jsonBody: {
          error: "Pick a different target than the file you uploaded."
        }
      };
    }

    const action = resolveAction(source, target);

    if (!action) {
      return {
        status: 400,
        jsonBody: {
          error: `Conversion from ${source.toUpperCase()} to ${target.toUpperCase()} is not supported.`
        }
      };
    }

    const formatter = FORMATTERS[action];

    if (!formatter) {
      return {
        status: 400,
        jsonBody: { error: `No formatter registered for action '${action}'.` }
      };
    }

    const result = formatter(text);
    const outputFilename = buildOutputFilename(filename, action);

    const storageConnection = process.env.FILES_STORAGE;
    const containerName = process.env.FILES_CONTAINER || "files";

    if (!storageConnection) {
      return {
        status: 500,
        jsonBody: { error: "FILES_STORAGE is not configured in Function App settings." }
      };
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(storageConnection);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    await containerClient.createIfNotExists();

    const safeInputName = sanitiseFilename(filename);
    const safeOutputName = sanitiseFilename(outputFilename);

    const originalBlobName = `originals/${safeInputName}`;
    const formattedBlobName = `converted/${safeOutputName}`;

    await uploadTextBlob(containerClient, originalBlobName, text);
    await uploadTextBlob(containerClient, formattedBlobName, result);

    return {
      status: 200,
      jsonBody: {
        action,
        outputFilename,
        result,
        originalBlobName,
        formattedBlobName
      }
    };
  } catch (err) {
    context.error("Format function failed", err);

    return {
      status: 400,
      jsonBody: { error: "Invalid request body or storage operation failed." }
    };
  }
}

app.http("format", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "format",
  handler: format
});
