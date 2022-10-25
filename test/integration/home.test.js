/* eslint-env mocha */

"use strict";

const request = require("supertest");
const host = require("./helpers").host;

describe("GET /", function() {
	context('compute-at-edge service', function() {
		it("responds with a 301 status", () => {
			return request(host)
				.get("/?use-compute-at-edge-backend=yes")
				.expect(301)
				.expect("Location", "/v3/");
		});
	});

	context('vcl service', function() {
		it("responds with a 301 status", () => {
			return request(host)
				.get("/?use-compute-at-edge-backend=no")
				.expect(301)
				.expect("Location", "/v3/");
		});
	});
});
