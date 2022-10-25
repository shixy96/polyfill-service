/* eslint-env mocha */

"use strict";

import assert from "proclaim";
import axios from "./helpers.js";

describe("GET /__gtg", function() {
	it("responds with a 200 status", async() => {
		const response = await axios.get(`/__gtg?use-compute-at-edge-backend=yes`);
		assert.equal(response.status, 200);
		assert.match(response.headers["content-type"], /text\/plain; charset=(UTF|utf)-8/);
		assert.equal(response.headers["cache-control"], "max-age=0, must-revalidate, no-cache, no-store, private");
		assert.equal(response.data, "OK");
	});
});
