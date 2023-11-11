// stores/search.js
import { defineStore } from "pinia";

export const useSearchStore = defineStore("search", {
	state: () => ({
		inputSearchData: {
			city: "",
			name: "",
		},
		lastSearchData: {
			city: "",
			name: "",
		},
		page: 1,
	}),
	actions: {
		setLastSearchData(data: { city: string; name: string }) {
			this.lastSearchData = data;
		},
	},
});
