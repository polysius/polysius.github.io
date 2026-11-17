// Renders one project's case study. The project is chosen by ?slug=<name> in the URL.

const container = document.getElementById("project");
const slug = new URLSearchParams(window.location.search).get("slug");
const project = PROJECTS.find((candidate) => candidate.slug === slug);

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function renderNotFound() {
  document.title = "Project not found | Data and ML Portfolio";
  const message = createElement("section", "project-head");
  message.append(createElement("h1", "", "Project not found"));
  const back = createElement("a", "", "See all projects");
  back.href = "index.html#projects";
  message.append(back);
  container.append(message);
}

function renderHead(project) {
  const head = createElement("section", "project-head");
  head.append(createElement("span", `badge ${project.status}`, STATUS_LABELS[project.status]));
  head.append(createElement("h1", "", project.title));
  head.append(createElement("p", "tagline", project.tagline));

  const actions = createElement("p");
  const source = createElement("a", "button", "View source on GitHub");
  source.href = repoUrl(project.slug);
  actions.append(source);
  if (project.demo) {
    const demo = createElement("a", "button secondary", project.demo.label);
    demo.href = project.demo.href;
    actions.append(" ", demo);
  }
  head.append(actions);
  return head;
}

function renderSection(title, ...content) {
  const section = createElement("section");
  section.append(createElement("h2", "", title), ...content);
  return section;
}

function renderResults(results) {
  const list = createElement("div", "results");
  results.forEach(({ label, value, note }) => {
    const item = createElement("div", "result");
    item.append(createElement("div", "value", value), createElement("div", "label", label), createElement("p", "note", note));
    list.append(item);
  });
  return list;
}

function renderCaveats(caveats) {
  const list = createElement("ul", "caveats");
  caveats.forEach((text) => list.append(createElement("li", "", text)));
  return list;
}

function renderFigure({ src, alt, caption }) {
  const figure = createElement("figure");
  const image = createElement("img");
  image.src = src;
  image.alt = alt;
  image.loading = "lazy";
  figure.append(image, createElement("figcaption", "", caption));
  return figure;
}

function renderProject(project) {
  document.title = `${project.title} | Data and ML Portfolio`;
  container.append(renderHead(project));
  container.append(renderSection("Overview", createElement("p", "", project.summary)));

  if (project.results.length) {
    container.append(renderSection("Measured results", renderResults(project.results)));
  } else {
    container.append(renderSection("Measured results", createElement("p", "", "No results are published for this project yet.")));
  }

  if (project.caveats.length) {
    container.append(renderSection("Limits and open items", renderCaveats(project.caveats)));
  }

  if (project.images.length) {
    container.append(renderSection("Figures", ...project.images.map(renderFigure)));
  }

  const tags = createElement("ul", "tags");
  project.tags.forEach((tag) => tags.append(createElement("li", "", tag)));
  container.append(renderSection("Built with", tags));
}

if (project) {
  renderProject(project);
} else {
  renderNotFound();
}
