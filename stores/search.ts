// stores/search.js
import { defineStore } from "pinia";

export const useSearchStore = defineStore("search", {
	state: () => ({
		searchData: {
			city: "",
			name: "",
		},
	}),
});
