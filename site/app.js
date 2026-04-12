const FUNCTION_BASE_URL = "https://converter765-b3d2cgaeghc8gkev.francecentral-01.azurewebsites.net"; 

const fileInput = document.getElementById("fileInput");
const btnFormat = document.getElementById("btnFormat");
const btnDownload = document.getElementById("btnDownload");
const formatStatusEl = document.getElementById("formatStatus");
const outputEl = document.getElementById("output");

let selectedFile = null;
let downloadedFilename = "formatted.txt";

if (fileInput && btnFormat && btnDownload && formatStatusEl && outputEl) {
  fileInput.addEventListener("change", () => {
    selectedFile = fileInput.files?.[0] ?? null;
    outputEl.value = "";
    btnDownload.disabled = true;

    if (!selectedFile) {
      btnFormat.disabled = true;
      formatStatusEl.textContent = "";
      return;
    }

    const nameOk = selectedFile.name.toLowerCase();
    const typeOk = nameOk.endsWith(".txt") || nameOk.endsWith(".xml");
    const maxBytes = 200 * 1024;

    if (!typeOk) {
      btnFormat.disabled = true;
      formatStatusEl.textContent = "Please select a plain text or .xml file.";
      selectedFile = null;
      return;
    }

    if (selectedFile.size > maxBytes) {
      btnFormat.disabled = true;
      formatStatusEl.textContent = "File is too large for this demo (max 200KB).";
      selectedFile = null;
      return;
    }

    btnFormat.disabled = false;
    formatStatusEl.textContent = `Selected: ${selectedFile.name} (${selectedFile.size} bytes)`;
  });

  btnFormat.addEventListener("click", async () => {
    if (!selectedFile) return;

    btnFormat.disabled = true;
    btnDownload.disabled = true;
    formatStatusEl.textContent = "Sending text to the API...";

    try {
      const text = await selectedFile.text();

      const res = await fetch(`${FUNCTION_BASE_URL}/api/format`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedFile.name,
          text
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
      type: "text/plain;charset=utf-8"
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
