"use strict";

module.exports = app => {
	app.get("/__gtg", (request, response) => {
		response.status(200);
		response.set({
			"Cache-Control": "max-age=0, must-revalidate, no-cache, no-store, private",
			"Content-Type": "text/plain; charset=UTF-8"
		});
		response.send("OK");
	});
};
