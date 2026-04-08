module.exports = function (eleventyConfig) {
  // Pass through static assets
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });

  // Pass through carte & delices (standalone HTML + images at repo root)
  eleventyConfig.addPassthroughCopy({ "carte": "carte" });
  eleventyConfig.addPassthroughCopy({ "delices": "delices" });

  // Watch CSS and JS for changes during dev
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("src/assets/js/");

  // Filter: format price as CHF
  eleventyConfig.addFilter("chf", (value) => {
    if (!value && value !== 0) return "";
    return `CHF ${Number(value).toFixed(2)}`;
  });

  // Filter: join array with separator
  eleventyConfig.addFilter("join", (arr, sep = ", ") =>
    Array.isArray(arr) ? arr.join(sep) : arr
  );

  // Filter: allergen label map FR
  eleventyConfig.addFilter("allergenLabel", (key) => {
    const labels = {
      gluten: "Gluten",
      lactose: "Lactose",
      oeufs: "Œufs",
      fruits_a_coque: "Fruits à coque",
      sesame: "Sésame",
      soja: "Soja",
      arachides: "Arachides",
      celeri: "Céleri",
      moutarde: "Moutarde",
      poisson: "Poisson",
      crustaces: "Crustacés",
      mollusques: "Mollusques",
      lupin: "Lupin",
    };
    return labels[key] || key;
  });

  // Filter: dump (JSON.stringify for inline <script> usage)
  eleventyConfig.addFilter("dump", (obj) => JSON.stringify(obj, null, 0));

  // Filter: slugify (used for product URLs)
  eleventyConfig.addFilter("slugify", (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")   // strip accents
      .replace(/[^a-z0-9\s-]/g, "")      // keep alphanum, space, dash
      .trim()
      .replace(/\s+/g, "-")               // spaces → dashes
      .replace(/-+/g, "-");               // collapse multiple dashes
  });

  // Filter: find object in array by key/value
  eleventyConfig.addFilter("findByAttr", (arr, attr, val) => {
    if (!Array.isArray(arr)) return null;
    return arr.find((item) => item[attr] === val) || null;
  });

  // Filter: selectattr — supports both 2-arg (attr, val) and 3-arg (attr, "equalto", val) call styles
  eleventyConfig.addFilter("selectattr", (arr, attr, operatorOrVal, value) => {
    if (!Array.isArray(arr)) return [];
    // 3-arg style: selectattr("id", "equalto", "marine")
    if (value !== undefined) {
      if (operatorOrVal === "equalto") return arr.filter((item) => item[attr] === value);
      if (operatorOrVal === "ne") return arr.filter((item) => item[attr] !== value);
      return arr.filter((item) => item[attr] === value);
    }
    // 2-arg style: selectattr("id", "marine")
    return arr.filter((item) => item[attr] === operatorOrVal);
  });

  // Filter: first element of array
  eleventyConfig.addFilter("first", (arr) => (Array.isArray(arr) ? arr[0] : arr));

  // Shortcode: current year
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
