import util from "util";
import child_process from "child_process";
import path from "path";

const exec = util.promisify(child_process.exec);

export async function extractWithTabula(filePath: string): Promise<any[] | { raw: string }> {
  const base = path.basename(filePath);
  const container = process.env.TABULA_CONTAINER || "tabula_container";

  // Correct path to tabula.jar inside the container
  const cmd = `docker exec ${container} java -jar /tabula/tabula.jar -p all -f JSON /work/${base}`;

  try {
    const { stdout, stderr } = await exec(cmd, { maxBuffer: 1024 * 1024 * 10 });
    if (stderr && stderr.trim()) console.warn("Tabula stderr:", stderr);
    console.log("Tabula stdout:", stdout);
    return JSON.parse(stdout);
  } catch (e: any) {
    console.error(`Failed to execute or parse Tabula output for ${filePath}:`, e.message);
    return { raw: e.stdout || "Failed to retrieve output from Tabula." };
  }
}
