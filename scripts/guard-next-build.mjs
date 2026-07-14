import net from "node:net";

const host = "127.0.0.1";
const port = Number.parseInt(process.env.PORT || "3000", 10);

function isPortOpen() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });

    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.once("error", () => {
      resolve(false);
    });

    socket.setTimeout(500, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

if (await isPortOpen()) {
  console.error(
    `Refusing to run next build while localhost:${port} is active. Stop the dev server first so .next is not shared.`,
  );
  process.exit(1);
}
