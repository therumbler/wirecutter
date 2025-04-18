function wirecutterSearchApp() {
  return {
    searchTerm: "",
    result: null,
    loading: false,
    init: function () {
      this.loading = false;
      this.searchTerm = this.getSearchTermFromUrl();
      if (this.searchTerm) {
        this.search();
      }
    },
    getSearchTermFromUrl: function () {
      const urlParams = new URLSearchParams(window.location.search);
      console.log("URL Params:", urlParams);
      return urlParams.get("term") || "";
    },
    async search() {
      this.loading = true;
      this.results = [];
      this.error = null;
      if (this.searchTerm.trim() === "") {
        this.loading = false;
        this.result = null;
        return;
      }
      this.result = null;
      try {
        const response = await fetch(`/api/search/${this.searchTerm}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        this.result = data;
      } catch (error) {
        console.error("Error fetching search results:", error);
        this.error = "Failed to fetch search results.";
      } finally {
        this.loading = false;
      }
    },
  };
}
