// stores/search.js
import { defineStore } from "pinia";

export const useSearchStore = defineStore("search", {
	state: () => ({
		searchData: {
			city: "",
			name: "",
		},
		lastSearchData: {
			city: "",
			name: "",
		},
	}),
	actions: {
		setLastSearchData(data: { city: string; name: string }) {
			this.lastSearchData = data;
		},
	},
});
