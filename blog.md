---
layout: page
title: Blog
permalink: /blog/
---

<h2>All Blog Posts</h2>
<ul class="post-list">
  {% for post in site.posts %}
  <li class="post-card">
    <a href="{{ post.url | relative_url }}">
      <h3>{{ post.title }}</h3>
      <p>{{ post.excerpt | strip_html | truncate: 140 }}</p>
    </a>
  </li>
  {% endfor %}
</ul>
