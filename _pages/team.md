---
title: "CARRE - Team"
layout: gridlay
excerpt: "CARRE: Team members"
sitemap: false
permalink: /team/
---

<!-- Jump to [leadership](#leadership), [graduate students](#graduate-students), [alumni](#alumni), [administrative support](#administrative-support), [center visitors](#center-visitors). -->

<div markdown="0">
  {% include team-grid.html
     title="Principal Investigators"
     people=site.data.team
     img_path="/assets/images/team/"
     cols="row-cols-2 row-cols-md-3 row-cols-lg-4" %}

  {% include team-grid.html
     title="Postdoctoral Scholars"
     people=site.data.postdocs
     img_path="/assets/images/team/"
     advisor_label="Mentor"
     cols="row-cols-2 row-cols-md-3 row-cols-lg-4" %}

  {% include team-grid.html
     title="Graduate Students"
     people=site.data.students
     img_path="/assets/images/team/"
     cols="row-cols-2 row-cols-md-3 row-cols-lg-4" %}

  {% include team-grid.html
     title="Undergraduate Students"
     people=site.data.undergrads
     img_path="/assets/images/team/"
     cols="row-cols-2 row-cols-md-3 row-cols-lg-4" %}
</div>

**We are looking for new PhD students and Postdocs to join the center!** [(see openings)]({{ site.url }}{{ site.baseurl }}/vacancies)
