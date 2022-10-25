/* eslint-env mocha */

"use strict";

const proclaim = require("proclaim");

// Proclaim appears to be unable to compare sets in a deepEqual
// (any two sets are considered the same), so convert sets to
// arrays.  Since sets do not have order, sort the resulting
// arrays to ensure they are comparable.
function setsToArrays(object) {
	if (typeof object !== "object") return object;
	if (object.constructor === Set) return [...object].sort();
	Object.keys(object).forEach(k => {
		object[k] = setsToArrays(object[k]);
	});
	return object;
}

describe("get-polyfill-parameters", function() {
	this.timeout(30000);
	let getPolyfillParameters;

	beforeEach(() => {
		getPolyfillParameters = require("../../../server/lib/get-polyfill-parameters");
	});

	it("exports a function", () => {
		proclaim.isFunction(getPolyfillParameters);
	});

	it("returns the default polyfill-service parameters if called with no arguments", () => {
		proclaim.deepStrictEqual(
			setsToArrays(getPolyfillParameters()),
			setsToArrays({
				callback: false,
				compression: undefined,
				excludes: [],
				features: {
					default: {
						flags: []
					}
				},
				minify: false,
				rum: false,
				stream: true,
				strict: false,
				uaString: "",
				unknown: "polyfill",
				version: require("polyfill-library/package.json").version
			})
		);
	});

	describe("returns the default polyfill-service parameters merged with any custom parameters given in the arguments", () => {
		it("overwrites `uaString` with the value from the `ua` query parameter if it exists", () => {
			proclaim.deepStrictEqual(
				getPolyfillParameters({
					query: {
						ua: "custom ua"
					}
				}).uaString,
				"custom ua"
			);
		});

		it("overwrites `uaString` with the value from the `User-Agent` header if it the `ua` query parameter does not exist", () => {
			proclaim.deepStrictEqual(
				getPolyfillParameters({
					query: {
						ua: undefined
					},
					headers: {
						"user-agent": "user-agent name"
					}
				}).uaString,
				"user-agent name"
			);
		});

		it("sets `rum` to `true` if the `rum` query parameter is set to `1`", () => {
			proclaim.deepStrictEqual(
				getPolyfillParameters({
					query: {
						rum: 1
					}
				}).rum,
				true
			);
		});

		it("sets `unknown` to `ignore` if the `unknown` query parameter is set to `ignore`", () => {
			proclaim.deepStrictEqual(
				getPolyfillParameters({
					query: {
						unknown: "ignore"
					}
				}).unknown,
				"ignore"
			);
		});

		it("Does not set add `gated` to `flags` when `unknown` is set to `ignore`", () => {
			proclaim.deepStrictEqual(
				setsToArrays(
					getPolyfillParameters({
						query: {
							unknown: "ignore"
						}
					})
				),
				setsToArrays({
					callback: false,
					compression: undefined,
					excludes: [],
					features: {
						default: {
							flags: new Set([])
						}
					},
					minify: false,
					rum: false,
					stream: true,
					strict: false,
					uaString: "",
					unknown: "ignore",
					version: require("polyfill-library/package.json").version
				})
			);
		});

		it("sets `excludes` to an array containing the values in the `excludes` query parameter separated by commas", () => {
			proclaim.deepStrictEqual(
				getPolyfillParameters({
					query: {
						excludes: "es5"
					}
				}).excludes,
				["es5"]
			);

			proclaim.deepStrictEqual(
				getPolyfillParameters({
					query: {
						excludes: "es5,es6,es7"
					}
				}).excludes,
				["es5", "es6", "es7"]
			);
		});

		it("sets `strict` to `true` if the `strict` query parameter exists", () => {
			proclaim.deepStrictEqual(
				getPolyfillParameters({
					query: {
						strict: undefined
					}
				}).strict,
				true
			);
		});

		it("sets `minify` to `true` if the path ends in `.min.js`", () => {
			proclaim.deepStrictEqual(
				getPolyfillParameters({
					path: "polyfill.min.js"
				}).minify,
				true
			);
		});

		it("sets `minify` to `false` if the path does not end in `.min.js`", () => {
			proclaim.deepStrictEqual(
				getPolyfillParameters({
					path: "polyfill.js"
				}).minify,
				false
			);
		});

		it("overwrites `version` with the value from the `version` query parameter if it exists", () => {
			proclaim.deepStrictEqual(
				getPolyfillParameters({
					query: {
						version: "custom version"
					}
				}).version,
				"custom version"
			);
		});

		it("sets `callback` to the value from the `callback` query parameter if it is a valid javascript function name", () => {
			proclaim.deepStrictEqual(
				getPolyfillParameters({
					query: {
						callback: "ready"
					}
				}).callback,
				"ready"
			);

			proclaim.deepStrictEqual(
				getPolyfillParameters({
					query: {
						callback: "not a valid function name"
					}
				}).callback,
				false
			);
		});

		it("overwrites `compression` with the value from the `compression` query parameter if it exists", () => {
			proclaim.deepStrictEqual(
				getPolyfillParameters({
					query: {
						compression: "custom compression"
					}
				}).compression,
				"custom compression"
			);
		});

		describe("when the `features` query parameter is set", () => {
			it("overwrites `features`", () => {
				proclaim.deepStrictEqual(
					setsToArrays(
						getPolyfillParameters({
							query: {
								features: "es5,es6|gated,es7|always,es8|gated|always"
							}
						}).features
					),
					{
						es5: { flags: [] },
						es6: { flags: ["gated"] },
						es7: { flags: ["always"] },
						es8: { flags: ["always", "gated"] }
					}
				);
			});
		});

		describe("when the `flags` query parameter is set", () => {
			it("adds the flags to each feature", () => {
				proclaim.deepStrictEqual(
					setsToArrays(
						getPolyfillParameters({
							query: {
								flags: "gated"
							}
						}).features
					),
					{ default: { flags: ["gated"] } }
				);

				proclaim.deepStrictEqual(
					setsToArrays(
						getPolyfillParameters({
							query: {
								flags: "always"
							}
						}).features
					),
					{ default: { flags: ["always"] } }
				);

				proclaim.deepStrictEqual(
					setsToArrays(
						getPolyfillParameters({
							query: {
								flags: "gated,always"
							}
						}).features
					),
					{ default: { flags: ["always", "gated"] } }
				);
			});
		});
	});
});
