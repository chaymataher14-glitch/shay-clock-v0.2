  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll(".media-controls, #playlist-container").forEach(container => {
      if(container) {
        container.addEventListener("wheel", (evt) => {
          if (evt.deltaY !== 0) {
            evt.preventDefault();
            container.scrollLeft += (evt.deltaY > 0 ? 40 : -40);
          }
        }, { passive: false });
      }
    });
  });
