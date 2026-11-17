// Renders the project grid and the status filter on the home page.

const grid = document.getElementById("project-grid");
const filterBar = document.getElementById("filters");

const FILTERS = [
  { value: "all", label: "All" },
  { value: "complete", label: STATUS_LABELS.complete },
  { value: "in-progress", label: STATUS_LABELS["in-progress"] },
  { value: "early", label: STATUS_LABELS.early },
];

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function renderCard(project) {
  const card = createElement("article", "card");

  card.append(createElement("span", `badge ${project.status}`, STATUS_LABELS[project.status]));

  const heading = createElement("h3");
  const link = createElement("a", "", project.title);
  link.href = `project.html?slug=${project.slug}`;
  heading.append(link);
  card.append(heading);

  card.append(createElement("p", "", project.tagline));

  const tags = createElement("ul", "tags");
  project.tags.forEach((tag) => tags.append(createElement("li", "", tag)));
  card.append(tags);

  const footer = createElement("div", "card-footer");
  const caseStudy = createElement("a", "", "Case study");
  caseStudy.href = link.href;
  const source = createElement("a", "", "Source");
  source.href = repoUrl(project.slug);
  footer.append(caseStudy, source);
  if (project.demo) {
    const demo = createElement("a", "", "Demo");
    demo.href = project.demo.href;
    footer.append(demo);
  }
  card.append(footer);

  return card;
}

function showProjects(status) {
  grid.replaceChildren();
  PROJECTS.filter((project) => status === "all" || project.status === status)
    .forEach((project) => grid.append(renderCard(project)));

  filterBar.querySelectorAll("button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.value === status));
  });
}

FILTERS.forEach((filter) => {
  const button = createElement("button", "", filter.label);
  button.type = "button";
  button.dataset.value = filter.value;
  button.addEventListener("click", () => showProjects(filter.value));
  filterBar.append(button);
});

showProjects("all");
