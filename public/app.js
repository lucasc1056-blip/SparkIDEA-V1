const examples = [
  { label: "Plants", value: "I like plants, but I don’t know what to build." },
  { label: "Sports", value: "I like basketball and want to explore something new." },
  { label: "Space", value: "I’m curious about space and how things move." }
];
const ideaForm = document.querySelector("#idea-form");
const ideaInput = document.querySelector("#idea");
const materialsInput = document.querySelector("#materials");
const projectType = document.querySelector("#project-type");
const projectTime = document.querySelector("#project-time");
const generateButton = document.querySelector("#generate");
const resultCard = document.querySelector("#result-card");
const result = document.querySelector("#result");
const suppliesPanel = document.querySelector("#supplies-panel");
const suppliesList = document.querySelector("#supplies-list");
const saveButton = document.querySelector("#save");
const savedMessage = document.querySelector("#saved");
const favoritesEmpty = document.querySelector("#favorites-empty");
const favoritesList = document.querySelector("#favorites-list");
const storageKey = "sparkidea-saved-ideas";

function getSupplyItems(text) {
  const section = text.match(/BUILDING BLOCKS:\s*([\s\S]*?)(?=\n\s*STEPS:|$)/i)?.[1] || "";
  return section
    .split("\n")
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
    .filter((line) => line && !/^building blocks:?$/i.test(line));
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
    details.textContent = `${time} · ${materials}`;
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
  suppliesList.replaceChildren();
  result.textContent = "SparkIDEA is thinking of something creative…";
  savedMessage.hidden = true;
  try {
    const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idea: ideaInput.value, materials: materialsInput.value, projectType: projectType.value, projectTime: projectTime.value }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    result.textContent = data.result;
    renderSupplyChecklist(data.result);
  } catch (error) {
    result.textContent = error.message || "I couldn’t make an idea right now. Please check the OpenAI key and your internet connection.";
  } finally {
    generateButton.disabled = false;
    generateButton.innerHTML = "Generate Idea <span aria-hidden=\"true\">→</span>";
  }
});

saveButton.addEventListener("click", () => {
  const saved = getFavorites();
  saved.push({ startingIdea: ideaInput.value, materials: materialsInput.value, projectTime: projectTime.value, result: result.textContent, savedAt: new Date().toISOString() });
  localStorage.setItem(storageKey, JSON.stringify(saved));
  savedMessage.hidden = false;
  renderFavorites();
});

renderFavorites();
