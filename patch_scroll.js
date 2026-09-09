  const mediaControls = document.querySelector('.media-controls');
  if (mediaControls) {
    mediaControls.addEventListener('wheel', (evt) => {
      if (evt.deltaY !== 0) {
        evt.preventDefault();
        mediaControls.scrollLeft += evt.deltaY;
      }
    });
  }
