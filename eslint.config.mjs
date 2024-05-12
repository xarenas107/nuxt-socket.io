import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
export default createConfigForNuxt({
	features: {
		tooling:true
	},
}).override('nuxt/typescript/rules', {
	rules:{
		'@typescript-eslint/no-explicit-any': 'off',
	},
})
