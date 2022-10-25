"use strict";

const glob = require('fast-glob');
const path = require('path');

/**
 * The @11ty/eleventy configuration.
 *
 * For a full list of options, see: https://www.11ty.io/docs/config/
 */
module.exports = (eleventyConfig) => {
	const directories = {
		input: "./src/assets/",
		data: `../data/`,
		includes: `../includes/`,
		output: "./dist/"
	}
	const files = glob.sync(path.join(process.cwd(), directories.input, "**/*"), { ignore: ['**/node_modules/**'] });
	const extensions = files.map(file => path.extname(file).replace('.', ''));

	// Make all files pass through to output folder
	eleventyConfig.setTemplateFormats(extensions);

	return {
		pathPrefix: "/v3",

		// Set the src and output directories
		dir: directories,

		// Set the default template engine from `liquid` to `njk`
		htmlTemplateEngine: "njk",
		markdownTemplateEngine: "njk",
		dataTemplateEngine: "njk",

		// Set up eleventy to pass-through files
		passthroughFileCopy: true
	};
};
