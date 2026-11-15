const examples = [
  { label: "Plants", value: "I like plants, but I don’t know what to build." },
  { label: "Sports", value: "I like basketball and want to explore something new." },
  { label: "Space", value: "I’m curious about space and how things move." }
];
const ideaForm = document.querySelector("#idea-form");
const ideaInput = document.querySelector("#idea");
const materialsInput = document.querySelector("#materials");
const projectType = document.querySelector("#project-type");
const generateButton = document.querySelector("#generate");
const resultCard = document.querySelector("#result-card");
const result = document.querySelector("#result");
const saveButton = document.querySelector("#save");
const savedMessage = document.querySelector("#saved");
const storageKey = "sparkidea-saved-ideas";

document.querySelector("#examples-list").replaceChildren(...examples.map((example) => {
  const button = document.createElement("button");
  button.className = "example";
  button.type = "button";
  button.textContent = example.label;
  button.addEventListener("click", () => { ideaInput.value = example.value; ideaInput.focus(); });
  return button;
}));

ideaForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  generateButton.disabled = true;
  generateButton.textContent = "Thinking…";
  resultCard.hidden = false;
  result.textContent = "SparkIDEA is thinking of something creative…";
  savedMessage.hidden = true;
  try {
    const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idea: ideaInput.value, materials: materialsInput.value, projectType: projectType.value }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    result.textContent = data.result;
  } catch (error) {
    result.textContent = error.message || "I couldn’t make an idea right now. Please check the OpenAI key and your internet connection.";
  } finally {
    generateButton.disabled = false;
    generateButton.innerHTML = "Generate Idea <span aria-hidden=\"true\">→</span>";
  }
});

saveButton.addEventListener("click", () => {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
  saved.push({ startingIdea: ideaInput.value, materials: materialsInput.value, result: result.textContent, savedAt: new Date().toISOString() });
  localStorage.setItem(storageKey, JSON.stringify(saved));
  savedMessage.hidden = false;
});
