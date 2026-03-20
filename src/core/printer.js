const net = require("net");

function sendToPrinter(zpl, host, port, { timeoutMs = 8000 } = {}) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let done = false;

    const cleanup = (err) => {
      if (done) return;
      done = true;
      try {
        client.destroy();
      } catch (_) {}
      err ? reject(err) : resolve();
    };

    const timer = setTimeout(
      () => cleanup(new Error("PRINT_TIMEOUT")),
      timeoutMs
    );

    client.once("error", (err) => {
      clearTimeout(timer);
      cleanup(err);
    });

    client.connect(Number(port), host, () => {
      client.write(zpl, "utf8", () => {
        clearTimeout(timer);
        client.end();
        cleanup();
      });
    });
  });
}

module.exports = { sendToPrinter };
