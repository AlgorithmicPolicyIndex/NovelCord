import {PythonShell, Options} from "python-shell";

const options: Options = {
	mode: "text",
	// TODO: Make the options depended on the command passed from discord.
	args: [process.argv[2]],

};

// ! There's probably a MUCH better way to do this, but whatever. ! //
// TODO: Handle commands to be sure of correct options before passing to Python.
PythonShell.run("python/handler.py", options).then(results => {
	// results is an array consisting of messages collected during execution
	// TODO: Handle error, if any, returns
	// * Print() is how I communicate back to here,
	// * 	Will use split on : to determine what the data is.
	// *	["error", "..."] | ["story", "..."] | ["settings": "..."]
	// * Will look into more options than this when everything is working.
	console.log("results: %j", results);
});