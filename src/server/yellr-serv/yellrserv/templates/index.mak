<%inherit file="base.mak"/>

<div class="wrapper">
  <h2 class="t3">Latest Stories</h2>
  <ul id="stories-list" class="list-style-none">
  % if latest_stories:
    % for story in latest_stories:
    <li>
      <h3 class="t1"><a href="article.html">${title}</a></h3>
      <p>${top_text}</p>
      % if banner_media_file_name:
      <figure>
        <img src="/media/${banner_media_file_name}">
      </figure>
      % endif
    </li>
    % endfor
  % else:
    <li class="faded">No stories yet!</li>
  % endif
  </ul>
</div>
