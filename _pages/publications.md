---
title: "CARRE - Publications"
layout: gridlay
excerpt: "CARRE -- Publications."
sitemap: false
permalink: /publications/
---


# Publications

<!-- ## Group highlights -->

<!-- **At the end of this page, you can find the [full list of publications and patents](#full-list-of-publications). All papers are also available on [arXiv](https://arxiv.org/search/?searchtype=author&query=Allan%2C+M+P).** -->

{% assign number_printed = 0 %}
{% for publi in site.data.publist %}

{% assign even_odd = number_printed | modulo: 2 %}
{% if publi.highlight == 1 %}

{% if even_odd == 0 %}
<div class="row">
{% endif %}

<div class="col-sm-6 clearfix">
 <div class="well">
  <pubtit>{{ publi.title }}</pubtit>
  <img src="{{ site.url }}{{ site.baseurl }}/images/pubpic/{{ publi.image }}" class="img-responsive" width="33%" style="float: left" />
  <p>{{ publi.description }}</p>
  <p><em>{{ publi.authors }}</em></p>
  <p><strong><a href="{{ publi.link.url }}">{{ publi.link.display }}</a></strong></p>
  <p class="text-danger"><strong> {{ publi.news1 }}</strong></p>
  <p> {{ publi.news2 }}</p>
 </div>
</div>

{% assign number_printed = number_printed | plus: 1 %}

{% if even_odd == 1 %}
</div>
{% endif %}

{% endif %}
{% endfor %}

{% assign even_odd = number_printed | modulo: 2 %}
{% if even_odd == 1 %}
</div>
{% endif %}

<p> &nbsp; </p>

{% assign books = site.data.publist | where: "type", "book" %}
{% if books.size > 0 %}

## Books

{% for publi in books %}
{% include pub-entry.html publi=publi %}
{% endfor %}
{% endif %}

{% assign journals = site.data.publist | where: "type", "journal" %}
{% if journals.size > 0 %}

## Journal Articles

{% assign journals_by_year = journals | group_by: "year" %}
{% for year in journals_by_year %}

### {{ year.name }}

{% for publi in year.items %}
{% include pub-entry.html publi=publi %}
{% endfor %}
{% endfor %}
{% endif %}

{% assign others = site.data.publist | where_exp: "p", "p.type != 'book'" | where_exp: "p", "p.type != 'journal'" %}
{% if others.size > 0 %}

## Other Publications

{% assign others_by_year = others | group_by: "year" %}
{% for year in others_by_year %}

### {{ year.name }}

{% for publi in year.items %}
{% include pub-entry.html publi=publi %}
{% endfor %}
{% endfor %}
{% endif %}
