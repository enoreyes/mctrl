import { Command } from "commander";
import { execFileSync, execSync, spawnSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureMac, jsonOut, swift } from "../util/run.js";

export const screen = new Command("screen")
  .description(
    `OCR (read text from screen) and screen recording.

Examples:
  mctrl screen ocr
  mctrl screen ocr --region 0,0,800,600
  mctrl screen ocr --file /tmp/shot.png
  mctrl screen record -o /tmp/demo.mov --duration 10`
  );

screen
  .command("ocr")
  .description(
    "Extract text from the screen using the macOS Vision framework."
  )
  .option("--region <x,y,w,h>", "OCR a specific screen region")
  .option("--file <path>", "OCR an image file instead of the screen")
  .option("--json", "output as JSON with bounding boxes and confidence")
  .action((opts: { region?: string; file?: string; json?: boolean }) => {
    ensureMac();
    let imagePath = opts.file;
    if (!imagePath) {
      imagePath = join(tmpdir(), `mctrl_ocr_${Date.now()}.png`);
      const args = ["-x"];
      if (opts.region) args.push("-R", opts.region);
      args.push(imagePath);
      execFileSync("screencapture", args);
    }

    const output = swift(`
import Foundation
import Vision
import AppKit

let url = URL(fileURLWithPath: "${imagePath}")
guard let image = NSImage(contentsOf: url),
      let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    fputs("Error: cannot load image\\n", stderr)
    exit(1)
}

let req = VNRecognizeTextRequest()
req.recognitionLevel = .accurate
req.usesLanguageCorrection = true

try VNImageRequestHandler(cgImage: cgImage, options: [:]).perform([req])

guard let observations = req.results else { exit(0) }
var items: [[String: Any]] = []
for obs in observations {
    guard let candidate = obs.topCandidates(1).first else { continue }
    let bb = obs.boundingBox
    items.append([
        "text": candidate.string,
        "confidence": obs.confidence,
        "x": bb.origin.x,
        "y": bb.origin.y,
        "width": bb.width,
        "height": bb.height
    ])
}
if let data = try? JSONSerialization.data(withJSONObject: items, options: .prettyPrinted),
   let str = String(data: data, encoding: .utf8) {
    print(str)
}
`);

    if (opts.json) {
      console.log(output);
    } else {
      try {
        const items = JSON.parse(output) as Array<{ text: string }>;
        for (const item of items) console.log(item.text);
      } catch {
        console.log(output);
      }
    }
  });

screen
  .command("record")
  .description("Record the screen for a given duration (macOS only).")
  .requiredOption("-o, --output <path>", "output file path (.mov)")
  .option("--duration <seconds>", "recording duration", parseInt, 10)
  .action((opts: { output: string; duration: number }) => {
    ensureMac();
    console.log(`Recording for ${opts.duration}s to ${opts.output}...`);
    spawnSync("screencapture", ["-v", "-V", String(opts.duration), opts.output], {
      stdio: "inherit",
    });
    console.log(`Saved: ${opts.output}`);
  });
