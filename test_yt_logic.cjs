const url1 = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const url2 = "https://www.youtube.com/playlist?list=PLxyz";
const url3 = "https://youtu.be/dQw4w9WgXcQ?list=PLxyz";

function parse(url) {
      let videoId = '';
      let listId = '';
      if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
      else if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
      
      if (url.includes('list=')) {
         listId = url.split('list=')[1].split('&')[0];
      }
      
      let finalSrc = '';
      if (videoId && listId) {
          finalSrc = \`https://www.youtube.com/embed/\${videoId}?list=\${listId}&autoplay=1&enablejsapi=1\`;
      } else if (videoId) {
          finalSrc = \`https://www.youtube.com/embed/\${videoId}?autoplay=1&enablejsapi=1\`;
      } else if (listId) {
          finalSrc = \`https://www.youtube.com/embed/videoseries?list=\${listId}&autoplay=1&enablejsapi=1\`;
      }
      console.log(url, "=>", finalSrc);
}

parse(url1);
parse(url2);
parse(url3);
