---
layout: default
title: Home
---

<section class="latest-posts">
  <h3>Latest Posts</h3>
  <ul class="post-list">
    {% for post in site.posts limit:3 %}
    <li class="post-card">
      <a href="{{ post.url | relative_url }}">
        <h4>{{ post.title }}</h4>
        <p>{{ post.excerpt | strip_html | truncate: 120 }}</p>
      </a>
    </li>
    {% endfor %}
  </ul>
</section>
