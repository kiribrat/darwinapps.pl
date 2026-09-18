/* ==========================================================================
   DarwinApps — site behaviour
   Vanilla JS, no dependencies. Everything degrades gracefully: with
   JavaScript off the page is still fully readable.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.DARWIN_CONFIG || {};

  /* ------------------------------------------------------------------ helpers */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ------------------------------------------------------------------- theme */
  var themeBtn = $(".theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var root = document.documentElement;
      var current = root.getAttribute("data-theme");
      if (!current) {
        current = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("darwin-theme", next); } catch (e) { /* private browsing */ }
      themeBtn.setAttribute("aria-label", next === "dark" ? "Switch to light mode" : "Switch to dark mode");
    });
  }

  /* -------------------------------------------------------------- navigation */
  var navToggle = $(".nav-toggle");
  var navLinks = $(".nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  var header = $(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* --------------------------------------------------------------- config fill
     Elements marked data-cfg="email" / "phone" take their value from
     config.js, so contact details are changed in exactly one place. */
  function fill(key, value, href) {
    $$('[data-cfg="' + key + '"]').forEach(function (el) {
      if (!value) {
        el.textContent = "—";
        el.removeAttribute("href");
        return;
      }
      el.textContent = value;
      if (href) el.setAttribute("href", href);
    });
  }

  fill("email", CFG.email, CFG.email ? "mailto:" + CFG.email : null);
  fill("phone", CFG.phone, CFG.phone ? "tel:" + CFG.phone.replace(/[^\d+]/g, "") : null);

  /* ------------------------------------------------------------- contact form */
  $$("form[data-contact-form]").forEach(function (form) {
    var status = $(".form-status", form);
    var submit = $('button[type="submit"]', form);
    var submitLabel = submit ? submit.textContent : "";

    function say(kind, message) {
      if (!status) return;
      status.className = "form-status form-status--" + kind + " is-visible";
      status.textContent = message;
      status.setAttribute("role", kind === "ok" ? "status" : "alert");
    }

    function clearErrors() {
      $$(".field-error", form).forEach(function (el) { el.classList.remove("is-visible"); });
      $$("[aria-invalid]", form).forEach(function (el) { el.removeAttribute("aria-invalid"); });
    }

    function flagField(name, message) {
      var input = form.elements[name];
      if (!input) return;
      input.setAttribute("aria-invalid", "true");
      var err = $("#err-" + input.id, form) || input.parentNode.querySelector(".field-error");
      if (err) {
        err.textContent = message;
        err.classList.add("is-visible");
      }
    }

    function validate(data) {
      var ok = true;
      clearErrors();
      if (!data.name.trim()) { flagField("name", "Please tell us your name."); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email.trim())) {
        flagField("email", "Please enter a valid email address.");
        ok = false;
      }
      if (data.message.trim().length < 10) {
        flagField("message", "A little more detail helps — at least 10 characters.");
        ok = false;
      }
      return ok;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var data = {
        name: form.elements.name ? form.elements.name.value : "",
        email: form.elements.email ? form.elements.email.value : "",
        message: form.elements.message ? form.elements.message.value : ""
      };

      // honeypot: a filled hidden field means a bot
      if (form.elements.company && form.elements.company.value) {
        say("ok", "Thanks — your message has been sent.");
        form.reset();
        return;
      }

      if (!validate(data)) {
        say("error", "Please check the highlighted fields.");
        return;
      }

      // No key means delivery is not set up. Say so plainly rather than
      // faking success and dropping the message.
      if (!CFG.accessKey) {
        say(
          "info",
          "The contact form isn’t connected yet. " +
          (CFG.email
            ? "In the meantime, please email us directly at " + CFG.email + "."
            : "Please reach us by phone for now — see the details on this page.")
        );
        return;
      }

      var payload = new FormData();
      payload.append("access_key", CFG.accessKey);
      payload.append("subject", "New enquiry from darwinapps.pl");
      payload.append("from_name", "darwinapps.pl");
      payload.append("name", data.name);
      payload.append("email", data.email);
      payload.append("message", data.message);

      if (submit) {
        submit.setAttribute("aria-busy", "true");
        submit.textContent = "Sending…";
      }
      say("info", "Sending your message…");

      fetch(CFG.formEndpoint, { method: "POST", body: payload })
        .then(function (res) { return res.json().catch(function () { return { success: res.ok }; }); })
        .then(function (res) {
          if (res && res.success) {
            form.reset();
            clearErrors();
            say("ok", "Thanks — your message is on its way. We’ll get back to you shortly.");
          } else {
            throw new Error((res && res.message) || "Request failed");
          }
        })
        .catch(function () {
          say(
            "error",
            "Something went wrong sending the form." +
            (CFG.email ? " Please email us directly at " + CFG.email + "." : " Please try again in a moment.")
          );
        })
        .then(function () {
          if (submit) {
            submit.removeAttribute("aria-busy");
            submit.textContent = submitLabel;
          }
        });
    });
  });

  /* ------------------------------------------------------------ scroll reveal */
  var reveals = $$(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ------------------------------------------------------------ reduced motion
     SVG animations (<animateTransform>) are not covered by the CSS
     prefers-reduced-motion rule, so they are stopped by hand. */
  try {
    var mq = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq) {
      var applyMotion = function () {
        $$(".hero-art svg").forEach(function (svg) {
          if (!svg.pauseAnimations) return;
          if (mq.matches) svg.pauseAnimations();
          else svg.unpauseAnimations();
        });
      };
      applyMotion();
      if (mq.addEventListener) mq.addEventListener("change", applyMotion);
    }
  } catch (e) { /* older browser: the animation simply keeps running */ }

  /* ------------------------------------------------------------- footer year */
  $$("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
