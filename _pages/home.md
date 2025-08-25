---
title: "CARRE - Home"
layout: default
#excerpt: "
sitemap: false
permalink: /
hero:
  image: /assets/images/blue-Atom-Energy-Quantum.jpg
  alt: Electronics undergoing radiation testing inside a vacuum chamber
  #kicker: 
  title: CARRE
  subtitle: Center for Advancing the Radiation Resilience of Electronics
  #cta_text: Explore Our Research
  #cta_url: /research/
  height: "66vh"
  align: center
  position: "center 10%"
  overlay_gradient: "linear-gradient(180deg, rgba(45,67,88,0.77) 1%, rgba(4,19,30,0.97) 100%)"
features:
  id: "research-focus"
  mt: "mt-4 mt-lg-5"   # small gap on mobile, a bit larger on lg+
  # mb: "mb-4"         # optional bottom spacing too
  title: "Our Research Focus"
  # EITHER keep a solid bg…
  bg: "#0b1b2b"
  # …OR use an image + overlay by uncommenting the next two lines:
  # bg_image: /assets/img/bg/network.jpg
  # overlay: "linear-gradient(180deg, rgba(11,27,43,.65) 0%, rgba(11,27,43,.95) 100%)"
  accent: "#e8552b"
  # Make ALL icons bigger in this section:
  icon_size: "3.75rem"        # single icons
  icon_size_top: "3.75rem"     # vertical stack top
  icon_size_bottom: "3.75rem"  # vertical stack bottom
  icon_gap: ".3rem"
  items:
    - title: "Predictive Multiphysics Simulation"
      icon_stack: ["bi bi-arrow-right", "bi bi-layers"]  # back, front
      stack: "horizontal"
      # optional fine-tuning:
      gap_x: ".5rem"        # bring closer/farther
      size_left: "3.4rem"    # GPU a bit larger
      size_right: "3.4rem"
      right_ty: "0.05rem"    # tiny vertical nudge if neededward
      #text: "Validated models of coupled physics under extreme conditions."
      #url: /research/predictive/
    - icon: "bi bi-radioactive"
      title: "Radiation Transport Modeling"
      #text: "First-principles radiation transport"
      #url: /research/radiation/
    - icon: "bi bi-diagram-3"
      title: "AI/ML for Accelerated Research"
      #text: "Surrogates and UQ to speed discovery and design."
      #url: /research/ai-ml/
    - title: "Exascale Computing Strategies"
      icon_stack: ["bi bi-hdd-network", "bi bi-gpu-card"]
      stack: "horizontal"   # tells the include to use the vertical style
      gap_x: "1.5rem"        # bring closer/farther
      size_left: "3.4rem"    # GPU a bit larger
      size_right: "3.4rem"
      right_ty: "0.05rem"    # tiny vertical nudge if neededward
      #text: "HPC methods for multiscale, multiparticle physics."
      #url: /research/exascale/
quote:
  id: "palmer-quote"
  text: "Reducing reliance on testing through high-fidelity simulation."
  attribution: "Todd Palmer"
  meta: "University Distinguished Professor, Oregon State University"
  # Background: start with solid color…
  bg: "#0b1b2b"
  # …or use an image + overlay instead:
  # bg_image: /assets/images/lab-background.jpg
  # overlay: "linear-gradient(180deg, rgba(11,27,43,.55) 0%, rgba(11,27,43,.9) 100%)"
  color: "#ffffff"
  accent: "#e8552b"
  align: center            # center | start | end
  max_width: "52ch"
  py: "4.5rem"             # vertical padding
  mt: "mt-5"               # spacing vs previous section
  mb: "mb-4"
  # Arc controls
  curve_depth: "14%"   # try 10–18%. Larger = deeper dip
logos:
  title: "Collaborating Institutions"
  mt: "mt-5"    # optional spacing above
  ratio: "75%" # taller tiles (bigger logos). Try 85%–100%
---

<div markdown="0">
{% include hero.html hero=page.hero %}
</div>

<div class="row g-4 align-items-stretch" markdown="0">
  <div class="col-lg-6">
    <div class="p-4 bg-body-tertiary h-100">
      <h2>Pioneering the Future of Radiation-Hardened Electronics</h2>
      <p>CARRE is a multidisciplinary research center dedicated to advancing predictive simulation of radiation damage in electronic systems. By integrating multiscale, multiparticle physics with cutting-edge AI and exascale computing, we aim to reduce reliance on physical testing and accelerate innovation in electronics resilience.</p>
      <p>From CubeSats to autonomous vehicles, CARRE’s work supports critical applications in national security, space exploration, and high-performance computing.</p>
    </div>
  </div>

  <div class="col-lg-6">
    <figure class="m-0 ratio ratio-4x3">  <!-- try ratio-21x9, ratio-4x3, etc. -->
      <img
        src="/assets/images/CubeSat.jpg"
        alt="Depiction of cube satellite in space"
        class="w-100 h-100 of-cover"
        loading="lazy"
      />
    </figure>
  </div>
</div>

<div markdown="0">
{% include feature-tiles.html section=page.features %}

{% include quote-callout.html section=page.quote %}

{% include logos-grid.html section=page.logos %}
</div>
