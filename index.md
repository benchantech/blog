---
layout: default
title: Home
---

<div class="hero">
  <img src="/assets/images/logo.jpg" alt="Ben Chan Tech LLC Logo" class="hero-logo">
  <h2 class="tagline">Building in Plain Sight</h2>
</div>

<section class="latest-posts">
  <h3>Latest Blog Posts</h3>
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
