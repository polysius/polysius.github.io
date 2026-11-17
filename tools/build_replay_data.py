"""Turn the nl-analytics-agent benchmark reports into one small JSON file for the SQL replay demo.

Usage:  python tools/build_replay_data.py <path to nl-analytics-agent/reports>
"""
import json
import sys
from pathlib import Path

OUTPUT = Path(__file__).resolve().parent.parent / "data" / "sql-replay.json"

# (label shown on the page, report file, what the database holds)
RUNS = [
    ("Formula 1 (56 questions, Claude Sonnet)", "sonnet/graph.json", "f1db: 31 tables, 699 columns"),
    ("NYC taxi gold tables (18 questions, Claude Sonnet)", "taxi_graph.json", "lakehouse gold layer in Postgres"),
]
KEPT_FIELDS = ["id", "difficulty", "question", "correct", "predicted_sql", "gold_sql", "failure_class", "retries", "latency_s", "cost_usd"]


def load_run(label, path, database):
    report = json.loads(path.read_text(encoding="utf-8"))
    summary = report["summary"]
    return {
        "label": label,
        "database": database,
        "model": report["model"],
        "recorded_at": report["timestamp"],
        "accuracy": summary["execution_accuracy"],
        "latency_p50_s": summary["latency_p50_s"],
        "cost_per_query_usd": summary["cost_per_query_usd"],
        "questions": [{key: item[key] for key in KEPT_FIELDS} for item in report["per_question"]],
    }


if __name__ == "__main__":
    reports_dir = Path(sys.argv[1])
    runs = [load_run(label, reports_dir / name, database) for label, name, database in RUNS]
    OUTPUT.write_text(json.dumps(runs, indent=1), encoding="utf-8")
    print(f"wrote {OUTPUT} with {sum(len(r['questions']) for r in runs)} questions")
