function wirecutterSearchApp() {
  return {
    searchTerm: "",
    recommendationResult: null,
    searchResults: [],
    slug: null,
    loading: false,
    init: function () {
      this.loading = false;
      this.slug = this.getReviewSlugFromUrl();
      console.log("Slug:", this.slug);
      if (this.slug) {
        this.fetchRecommentaions();
        return;
      }

      this.searchTerm = this.getSearchTermFromUrl();
      if (this.searchTerm) {
        this.fetchResponse();
      }
    },
    async fetchResponse() {
      await this.fetchRecommentaions();
      if (!this.recommendationResult) {
        await this.search();
      }
    },
    getReviewSlugFromUrl: function () {
      const url = new URL(window.location);
      const path = url.pathname.split("/");
      console.log("Path:", path);
      return path[path.length - 2];
    },
    getSearchTermFromUrl: function () {
      const urlParams = new URLSearchParams(window.location.search);
      console.log("URL Params:", urlParams);
      return urlParams.get("term") || "";
    },
    async search() {
      this.loading = true;
      if (this.searchTerm.trim() === "") {
        this.loading = false;
        this.searchResults = [];
        return;
      }
      this.searchResults = [];
      try {
        const response = await fetch(`/api/search/${this.searchTerm}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        this.searchResults = data.props.pageProps.searchResults;
        const url = new URL(window.location);
        url.searchParams.set("term", this.searchTerm);
        window.history.pushState({}, "", url);
      } catch (error) {
        console.error("Error fetching search results:", error);
        this.error = "Failed to fetch search results.";
      }
      this.loading = false;
    },
    async fetchRecommentaions() {
      this.loading = true;
      this.results = [];
      this.error = null;
      let term = this.slug.trim() || this.searchTerm.trim();
      if (term === "") {
        this.loading = false;
        this.recommendationResult = null;
        return;
      }
      this.recommendationResult = null;

      try {
        const response = await fetch(`/api/recommendations/${term}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        this.recommendationResult = data;
        const url = new URL(window.location);
        url.searchParams.set("term", this.searchTerm);
        window.history.pushState({}, "", url);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        this.error = "Failed to fetch recommendations.";
      } finally {
        this.loading = false;
      }
    },
  };
}
