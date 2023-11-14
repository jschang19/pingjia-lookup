module.exports = {
	root: true,
	env: {
		browser: true,
		node: true,
	},
	overrides: [
		{
			env: {
				node: true,
			},
			files: [".eslintrc.{js,cjs}"],
			parserOptions: {
				sourceType: "script",
			},
		},
	],
	parser: "vue-eslint-parser",
	parserOptions: {
		parser: "@typescript-eslint/parser",
	},
	ignorePatterns: ["node_modules", "*.config.*"],
	extends: ["@nuxtjs/eslint-config-typescript", "plugin:prettier/recommended"],
	plugins: [],
	rules: {
		"no-console": "off",
	},
};
