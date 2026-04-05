---
layout: default
title: Posts
permalink: /posts/
---

<p style="font-size:0.85rem; color:#6b7280; margin-bottom:1.5rem;">Full versions live on <a href="https://benchanviolin.substack.com">Substack</a>.</p>

<ul style="list-style:none; padding:0;">
  {% for post in site.posts %}
  <li style="margin-bottom:1.25rem; padding-bottom:1.25rem; border-bottom:1px solid #e5e7eb;">
    <a href="{{ post.url | relative_url }}" style="font-size:0.9rem; font-weight:600; color:#1a1a1a;">{{ post.title }}</a>
    <p style="font-size:0.8rem; color:#6b7280; margin-top:0.25rem;">{{ post.excerpt | strip_html | truncate: 140 }}</p>
  </li>
  {% endfor %}
</ul>
