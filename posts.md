---
layout: default
title: Posts
permalink: /posts/
---

<div class="narrow page-body">
  <p class="posts-note">Full versions live on <a href="https://benchanviolin.substack.com">Substack</a>.</p>

  <ul class="post-list">
    {% for post in site.posts %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      <p>{{ post.excerpt | strip_html | truncate: 140 }}</p>
    </li>
    {% endfor %}
  </ul>
</div>
