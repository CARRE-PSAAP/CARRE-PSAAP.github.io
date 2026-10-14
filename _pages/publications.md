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

{% assign pubs_by_year = site.data.publist | group_by: "year" %}
{% for year in pubs_by_year %}

## {{ year.name }}

{% for publi in year.items %}

  {{ publi.title }} <br />
  <em>{{ publi.authors }} </em><br />{% if publi.link.url %}<a href="{{ publi.link.url }}">{{ publi.link.display }}</a>{% else %}{{ publi.link.display }}{% endif %}

{% endfor %}
{% endfor %}
