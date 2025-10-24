import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function dockerExec(cmd, containerName, decode = true) {
  const safeCmd = cmd.replace(/"/g, '\"');
  const dockerCmd = `docker exec ${containerName} sh -c "${safeCmd}"`;
  const output = await execAsync(dockerCmd, {
    encoding: decode ? "utf8" : "buffer",
  });
  const result = output && output.stdout ? output.stdout : output;
  if (decode) {
    return result.toString("utf-8");
  }
  return result;
}

const vm = {
    display: ":99",
    containerName: "cua-image",
};
