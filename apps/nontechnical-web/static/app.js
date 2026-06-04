const form = document.querySelector("#upload-form");
const input = document.querySelector("#file-input");
const output = document.querySelector("#output");
const statusText = document.querySelector("#status");
const fileName = document.querySelector("#file-name");
const copyButton = document.querySelector("#copy-button");
const downloadButton = document.querySelector("#download-button");

let markdown = "";
let sourceName = "converted.md";

function setStatus(message) {
  statusText.textContent = message;
}

function setResult(text, name) {
  markdown = text;
  sourceName = name.replace(/\.[^.]+$/, "") || "converted";
  output.value = markdown;
  copyButton.disabled = markdown.length === 0;
  downloadButton.disabled = markdown.length === 0;
}

async function convertFile(file) {
  fileName.textContent = file.name;
  setStatus("Converting...");
  setResult("", file.name);

  const data = new FormData();
  data.append("file", file);

  try {
    const response = await fetch("/api/convert", {
      method: "POST",
      body: data,
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.detail || "Conversion failed.");
    }

    setResult(payload.markdown || "", payload.filename || file.name);
    setStatus("Done");
  } catch (error) {
    setStatus(error.message);
  }
}

form.addEventListener("click", () => input.click());

input.addEventListener("change", () => {
  const file = input.files[0];
  if (file) {
    convertFile(file);
  }
});

form.addEventListener("dragover", (event) => {
  event.preventDefault();
  form.classList.add("is-dragging");
});

form.addEventListener("dragleave", () => {
  form.classList.remove("is-dragging");
});

form.addEventListener("drop", (event) => {
  event.preventDefault();
  form.classList.remove("is-dragging");
  const file = event.dataTransfer.files[0];
  if (file) {
    convertFile(file);
  }
});

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(markdown);
  setStatus("Copied");
});

downloadButton.addEventListener("click", () => {
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sourceName}.md`;
  link.click();
  URL.revokeObjectURL(url);
});
