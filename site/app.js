const FUNCTION_BASE_URL = "https://converter765-b3d2cgaeghc8gkev.francecentral-01.azurewebsites.net";

const fileInput = document.getElementById("fileInput");
const targetSelect = document.getElementById("targetSelect");
const btnFormat = document.getElementById("btnFormat");
const btnDownload = document.getElementById("btnDownload");
const formatStatusEl = document.getElementById("formatStatus");
const outputEl = document.getElementById("output");

const TARGETS_BY_SOURCE = {
  xml: ["json", "csv"],
  json: ["xml", "csv"],
  csv: ["json", "xml"]
};

let selectedFile = null;
let downloadedFilename = "out.txt";

function detectSource(filename) {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".xml")) return "xml";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".csv")) return "csv";
  return null;
}

function fillTargetOptions(source) {
  if (!targetSelect) return;
  targetSelect.innerHTML = "";
  const targets = TARGETS_BY_SOURCE[source];
  if (!targets) return;
  for (const t of targets) {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t.toUpperCase();
    targetSelect.appendChild(opt);
  }
  targetSelect.disabled = false;
}

function mimeForFilename(name) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".json")) return "application/json;charset=utf-8";
  if (lower.endsWith(".xml")) return "application/xml;charset=utf-8";
  if (lower.endsWith(".csv")) return "text/csv;charset=utf-8";
  return "text/plain;charset=utf-8";
}

if (fileInput && targetSelect && btnFormat && btnDownload && formatStatusEl && outputEl) {
  fileInput.addEventListener("change", () => {
    selectedFile = fileInput.files?.[0] ?? null;
    outputEl.value = "";
    btnDownload.disabled = true;

    if (!selectedFile) {
      btnFormat.disabled = true;
      targetSelect.innerHTML = "";
      targetSelect.disabled = true;
      formatStatusEl.textContent = "";
      return;
    }

    const source = detectSource(selectedFile.name);
    const maxBytes = 200 * 1024;

    if (!source) {
      btnFormat.disabled = true;
      targetSelect.innerHTML = "";
      targetSelect.disabled = true;
      formatStatusEl.textContent = "Please select a .xml, .json, or .csv file.";
      selectedFile = null;
      return;
    }

    if (selectedFile.size > maxBytes) {
      btnFormat.disabled = true;
      targetSelect.innerHTML = "";
      targetSelect.disabled = true;
      formatStatusEl.textContent = "File is too large for this demo (max 200KB).";
      selectedFile = null;
      return;
    }

    fillTargetOptions(source);
    btnFormat.disabled = false;
    formatStatusEl.textContent = `Selected: ${selectedFile.name} (${selectedFile.size} bytes)`;
  });

  btnFormat.addEventListener("click", async () => {
    if (!selectedFile || targetSelect.disabled) return;

    btnFormat.disabled = true;
    btnDownload.disabled = true;
    formatStatusEl.textContent = "Sending to the API...";

    try {
      const text = await selectedFile.text();
      const target = targetSelect.value;

      const res = await fetch(`${FUNCTION_BASE_URL}/api/format`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedFile.name,
          text,
          target
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API error (${res.status}): ${errText}`);
      }

      const data = await res.json();

      outputEl.value = data.result || "";
      downloadedFilename = data.outputFilename || "formatted.txt";
      btnDownload.disabled = !outputEl.value;

      formatStatusEl.textContent = `Done. Route used: ${data.action}. Stored as ${data.originalBlobName} and ${data.formattedBlobName}. You can now download the formatted file.`;
    } catch (err) {
      outputEl.value = "";
      btnDownload.disabled = true;
      formatStatusEl.textContent = `Failed: ${err.message}`;
    } finally {
      btnFormat.disabled = !selectedFile;
    }
  });

  btnDownload.addEventListener("click", () => {
    const blob = new Blob([outputEl.value], {
      type: mimeForFilename(downloadedFilename)
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = downloadedFilename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  });
}
