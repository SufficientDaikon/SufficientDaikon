const fs = require("fs");
const path = require("path");
const https = require("https");

const authPath = path.join(
  process.env.APPDATA,
  "com.vercel.cli",
  "Data",
  "auth.json"
);
const { token } = JSON.parse(fs.readFileSync(authPath, "utf8"));
const projectDir = "H:\\mee\\SufficientDaikon";

function api(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: "api.vercel.com",
        path: endpoint,
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let buf = "";
        res.on("data", (c) => (buf += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(buf) });
          } catch {
            resolve({ status: res.statusCode, data: buf });
          }
        });
      }
    );
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

function readFileBase64(filePath) {
  return fs.readFileSync(filePath).toString("base64");
}

async function main() {
  // Step 1: Get user info
  console.log("Getting user info...");
  const user = await api("GET", "/v2/user");
  console.log("User:", user.data.user?.username || "unknown");

  const name = "sufficientdaikon";

  // Step 2: Check if project exists
  console.log("Checking project...");
  const projCheck = await api("GET", `/v9/projects/${name}`);

  if (projCheck.status === 404) {
    console.log("Creating project...");
    const create = await api("POST", "/v10/projects", {
      name,
      framework: null,
    });
    console.log("Project created:", create.status, create.data?.id || "");
  } else {
    console.log("Project exists:", projCheck.data?.id);
  }

  // Step 3: Deploy files
  const files = [
    { file: "api/productive-time.js", path: path.join(projectDir, "api", "productive-time.js") },
    { file: "vercel.json", path: path.join(projectDir, "vercel.json") },
    { file: "index.html", path: path.join(projectDir, "index.html") },
  ];

  const deployFiles = files.map((f) => ({
    file: f.file,
    data: readFileBase64(f.path),
    encoding: "base64",
  }));

  console.log("Deploying", deployFiles.length, "files...");
  const deploy = await api("POST", "/v13/deployments", {
    name,
    files: deployFiles,
    projectSettings: {
      framework: null,
    },
    target: "production",
  });

  if (deploy.status >= 200 && deploy.status < 300) {
    console.log("DEPLOYED!");
    console.log("URL:", deploy.data.url);
    console.log("Production URL:", `https://${name}.vercel.app`);
    console.log("State:", deploy.data.readyState || deploy.data.status);
  } else {
    console.log("Deploy failed:", deploy.status);
    console.log(JSON.stringify(deploy.data, null, 2));
  }
}

main().catch(console.error);
