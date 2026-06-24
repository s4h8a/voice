import argparse
import json
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Download selected legal speech datasets for local STT experiments.")
    parser.add_argument("--manifest", default="scripts/voice_datasets.json")
    parser.add_argument("--output", default=None)
    parser.add_argument("--dataset", default=None, help="Only download one dataset id")
    parser.add_argument("--subset", default=None, help="Only download one subset/language")
    parser.add_argument("--split", default="train")
    parser.add_argument("--max-rows", type=int, default=1000, help="Small smoke-test cap. Set 0 for full split.")
    args = parser.parse_args()

    try:
        from datasets import load_dataset
    except ImportError as exc:
        raise SystemExit("Install first: pip install datasets soundfile huggingface_hub") from exc

    manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    output_root = Path(args.output or manifest["default_output_dir"])
    output_root.mkdir(parents=True, exist_ok=True)

    for item in manifest["datasets"]:
      dataset_id = item["id"]
      if args.dataset and args.dataset != dataset_id:
          continue
      subsets = [args.subset] if args.subset else item["subsets"]
      for subset in subsets:
          split = args.split
          print(f"Downloading {dataset_id} / {subset} / {split}")
          name = None if subset == "all" else subset
          ds = load_dataset(dataset_id, name, split=split, trust_remote_code=True)
          if args.max_rows and len(ds) > args.max_rows:
              ds = ds.select(range(args.max_rows))
          target = output_root / dataset_id.replace("/", "__") / subset / split
          ds.save_to_disk(str(target))
          print(f"Saved {len(ds)} rows to {target}")


if __name__ == "__main__":
    main()
