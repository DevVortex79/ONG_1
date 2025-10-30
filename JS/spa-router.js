export function navigateTo(path) {
  window.history.pushState({}, "", path);
  router();
}

const routes = { "/": "home", "/projetos": "projetos", "/cadastro": "cadastro" };

export function router() {
  const path = window.location.pathname;
  const pageKey = routes[path] || "home";
  window.dispatchEvent(new CustomEvent("routechange", { detail: pageKey }));
  updateActiveLinks(path);
}

function updateActiveLinks(path) {
  const menuItems = document.querySelectorAll(".menu__item, .navdropdown a");
  menuItems.forEach(link => link.classList.toggle("active", link.getAttribute("href") === path));
}
