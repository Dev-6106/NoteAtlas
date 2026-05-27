const http = require("http");

http.get("http://localhost:8000/api/v1/notes?page=1", (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => console.log(data));
}).on("error", (err) => console.log("Error: " + err.message));
