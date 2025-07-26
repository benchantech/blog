---
layout: home
title: 
---

![BenchanTech Logo](/assets/images/logo.jpg)

<a id="storyTeller" href="shortcuts://run-shortcut?name=Storyteller&input=What%20was%20your%20first%20job%3F">Start Recording</a>

<script>
  async function setRandomQuestion() {
    try {
      const res = await fetch('/assets/json/questions.json');
      const data = await res.json();
      const questions = data.questions;
      const randomQ = questions[Math.floor(Math.random() * questions.length)];
      const encodedQ = encodeURIComponent(randomQ);

      const link = `shortcuts://run-shortcut?name=Storyteller&input=${encodedQ}`;
      document.getElementById('storyTeller').setAttribute('href', link);
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  }

  setRandomQuestion();
</script>
