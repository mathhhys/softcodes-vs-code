import fs from "fs";
import path from "path";

export default async function () {
  process.env.SOFTCODES_GLOBAL_DIR = path.join(__dirname, ".softcodes-test");
  if (fs.existsSync(process.env.SOFTCODES_GLOBAL_DIR)) {
    fs.rmSync(process.env.SOFTCODES_GLOBAL_DIR, { recursive: true });
  }
}
