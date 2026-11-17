"""Turn the nl-analytics-agent benchmark reports into one small JSON file for the SQL replay demo.

Run from the Portfolio folder:  python portfolio-site/tools/build_replay_data.py
"""
import json
from pathlib import Path

REPORTS = Path("nl-analytics-agent/reports")
OUTPUT = Path("portfolio-site/data/sql-replay.json")

# (label shown on the page, report file, what the database holds)
RUNS = [
    ("Formula 1 (56 questions, Claude Sonnet)", REPORTS / "sonnet" / "graph.json", "f1db: 31 tables, 699 columns"),
    ("NYC taxi gold tables (18 questions, Claude Sonnet)", REPORTS / "taxi_graph.json", "lakehouse gold layer in Postgres"),
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
    runs = [load_run(*run) for run in RUNS]
    OUTPUT.write_text(json.dumps(runs, indent=1), encoding="utf-8")
    print(f"wrote {OUTPUT} with {sum(len(r['questions']) for r in runs)} questions")
