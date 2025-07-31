---
layout: home
title: Home
---

<div class="hero">
  <img src="/assets/images/logo.jpg" alt="Ben Chan Tech LLC Logo" class="hero-logo">
  <h2 class="tagline">Building in Plain Sight</h2>
  <div class="hero-links">
    <a href="/blog/" class="hero-button">Blog</a>
    <a href="https://yyand.me" target="_blank" class="hero-button">YY and Me</a>
    <a href="https://oco.Ben Chan Tech.com" target="_blank" class="hero-button">Open Code Orchestra</a>
    <a href="https://youtube.com/benchanviolin" target="_blank" class="hero-button">BenChanViolin</a>
    <a href="/about/" class="hero-button">About</a>
    <a href="/contact/" class="hero-button">Contact</a>
  </div>
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
