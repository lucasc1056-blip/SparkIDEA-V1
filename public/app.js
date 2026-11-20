const examples = [
  { label: "Plants", value: "I like plants, but I don’t know what to build." },
  { label: "Sports", value: "I like basketball and want to explore something new." },
  { label: "Space", value: "I’m curious about space and how things move." }
];
const ideaForm = document.querySelector("#idea-form");
const ideaInput = document.querySelector("#idea");
const secondIdeaInput = document.querySelector("#second-idea");
const materialsInput = document.querySelector("#materials");
const projectType = document.querySelector("#project-type");
const projectTime = document.querySelector("#project-time");
const difficulty = document.querySelector("#difficulty");
const generateButton = document.querySelector("#generate");
const resultCard = document.querySelector("#result-card");
const result = document.querySelector("#result");
const riskWarning = document.querySelector("#risk-warning");
const suppliesPanel = document.querySelector("#supplies-panel");
const suppliesList = document.querySelector("#supplies-list");
const printPlanButton = document.querySelector("#print-plan");
const printPlanContent = document.querySelector("#print-plan-content");
const saveButton = document.querySelector("#save");
const savedMessage = document.querySelector("#saved");
const favoritesEmpty = document.querySelector("#favorites-empty");
const favoritesList = document.querySelector("#favorites-list");
const storageKey = "sparkidea-saved-ideas";

function getSupplyItems(text) {
  const section = getSection(text, "BUILDING BLOCKS", "STEPS");
  return section
    .split("\n")
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
    .filter((line) => line && !/^building blocks:?$/i.test(line));
}

function getSection(text, heading, nextHeading) {
  return text.match(new RegExp(`${heading}:\\s*([\\s\\S]*?)(?=\\n\\s*${nextHeading}:|$)`, "i"))?.[1] || "";
}

function getIdeaText(text) {
  return getSection(text, "IDEA", "BUILDING BLOCKS").trim();
}

function getStepItems(text) {
  return getSection(text, "STEPS", "END")
    .split("\n")
    .map((line) => line.replace(/^\s*\d+[.)]\s*/, "").trim())
    .filter(Boolean);
}

function hasRiskySteps(text) {
  const riskyWords = /dangerous|explos|weapon|fire|flame|burn|chemical|poison|pressure|high voltage|mains electricity|self-harm|injur|illegal|damage property/i;
  return getStepItems(text).some((step) => riskyWords.test(step));
}

function renderRiskWarning(text) {
  riskWarning.hidden = !hasRiskySteps(text);
}

function renderSupplyChecklist(text) {
  const supplies = getSupplyItems(text);
  suppliesList.replaceChildren(...supplies.map((supply, index) => {
    const item = document.createElement("li");
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `supply-${index}`;
    const text = document.createElement("span");
    text.textContent = supply;
    label.append(checkbox, text);
    item.append(label);
    return item;
  }));
  suppliesPanel.hidden = supplies.length === 0;
}

function renderPrintPlan(text) {
  const supplies = getSupplyItems(text);
  const steps = getStepItems(text);
  document.querySelector("#print-plan-details").textContent = `${projectType.value} project · ${projectTime.value}`;
  document.querySelector("#print-plan-idea").textContent = getIdeaText(text) || text;
  document.querySelector("#print-plan-supplies").replaceChildren(...supplies.map((supply) => {
    const item = document.createElement("li");
    item.textContent = supply;
    return item;
  }));
  document.querySelector("#print-plan-steps").replaceChildren(...steps.map((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    return item;
  }));
  printPlanContent.dataset.ready = "true";
  printPlanButton.disabled = false;
}

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function renderFavorites() {
  const favorites = getFavorites();
  favoritesEmpty.hidden = favorites.length > 0;
  favoritesList.replaceChildren(...favorites.map((favorite, index) => {
    const article = document.createElement("article");
    article.className = "favorite";
    const heading = document.createElement("h3");
    heading.textContent = favorite.startingIdea || "Material-based idea";
    const details = document.createElement("p");
    const time = favorite.projectTime ? `Time: ${favorite.projectTime}` : "Time not recorded";
    const materials = favorite.materials ? `Materials: ${favorite.materials}` : "No materials listed";
    const secondIdea = favorite.secondIdea ? `Second idea: ${favorite.secondIdea}` : "";
    details.textContent = [time, materials, secondIdea].filter(Boolean).join(" · ");
    const idea = document.createElement("p");
    idea.textContent = favorite.result;
    const remove = document.createElement("button");
    remove.className = "remove-favorite";
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      const updated = getFavorites();
      updated.splice(index, 1);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      renderFavorites();
    });
    article.append(heading, details, idea, remove);
    return article;
  }));
}

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
  suppliesPanel.hidden = true;
  riskWarning.hidden = true;
  suppliesList.replaceChildren();
  printPlanContent.dataset.ready = "false";
  printPlanButton.disabled = true;
  result.textContent = "SparkIDEA is thinking of something creative…";
  savedMessage.hidden = true;
  try {
    const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idea: ideaInput.value, secondIdea: secondIdeaInput.value, materials: materialsInput.value, projectType: projectType.value, projectTime: projectTime.value, difficulty: difficulty.value }) });
    const data = await response.json();
    if (!response.ok) {
      if (data.error?.fix) console.error(data.error.fix);
      throw new Error(data.error?.message || data.error || "I couldn’t make an idea right now.");
    }
    result.textContent = data.result;
    renderRiskWarning(data.result);
    renderSupplyChecklist(data.result);
    renderPrintPlan(data.result);
  } catch (error) {
    result.textContent = error.message || "I couldn’t make an idea right now. Please check the OpenAI key and your internet connection.";
  } finally {
    generateButton.disabled = false;
    generateButton.innerHTML = "Generate Idea <span aria-hidden=\"true\">→</span>";
  }
});

printPlanButton.addEventListener("click", () => {
  if (printPlanContent.dataset.ready === "true") window.print();
});

saveButton.addEventListener("click", () => {
  const saved = getFavorites();
  saved.push({ startingIdea: ideaInput.value, secondIdea: secondIdeaInput.value, materials: materialsInput.value, projectTime: projectTime.value, result: result.textContent, savedAt: new Date().toISOString() });
  localStorage.setItem(storageKey, JSON.stringify(saved));
  savedMessage.hidden = false;
  renderFavorites();
});

renderFavorites();
