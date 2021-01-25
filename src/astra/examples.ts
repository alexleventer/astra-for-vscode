export const javascriptExample = `
const { Client } = require("cassandra-driver");

async function run() {
  const client = new Client({
    cloud: {
      secureConnectBundle: "<<PATH/TO/>>secure-connect-test.zip",
    },
    credentials: { username: "<<USERNAME>>", password: "<<PASSWORD>>" },
  });

  await client.connect();

  // Execute a query
  const rs = await client.execute("SELECT * FROM system.local");
  console.log(\`Your cluster returned \${rs.rowLength} row(s)\`);

  await client.shutdown();
}

// Run the async function
run();

`;
export const pythonExample = `
from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider

cloud_config= {
        'secure_connect_bundle': '<</PATH/TO/>>secure-connect-test.zip'
}
auth_provider = PlainTextAuthProvider('<<USERNAME>>', '<<PASSWORD>>')
cluster = Cluster(cloud=cloud_config, auth_provider=auth_provider)
session = cluster.connect()

row = session.execute("select release_version from system.local").one()
if row:
    print(row[0])
else:
    print("An error occurred.")`;
