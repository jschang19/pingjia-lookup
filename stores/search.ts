// stores/search.js
import { defineStore } from "pinia";
import { type ShopInfo } from "~/types/shop";

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
		total: 0,
		previousResults: {
			sortMethod: "",
			name: "",
			city: "",
		},
		shops: [] as ShopInfo[],
		sortOptions: [
			{
				label: "評價最高",
				value: "rating",
			},
			{
				label: "價格最低",
				value: "price_asc",
			},
			{
				label: "價格最高",
				value: "price_desc",
			},
		],
		sortMethod: "rating",
	}),
	actions: {
		updateShops(shops: ShopInfo[]) {
			this.shops = shops;
		},
		setLastSearchData(data: { city: string; name: string }) {
			this.lastSearchData = data;
		},
		resetSearchData() {
			this.inputSearchData.city = "";
			this.inputSearchData.name = "";
		},
	},
});
