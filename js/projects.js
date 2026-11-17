// One entry per project. Every number here is copied from that project's README or RESULTS.md.
// Where a project has not been measured yet, `status` says so and `results` stays empty.
//
// status: "complete" | "in-progress" | "early"
// demo:   optional link to an in-browser demo on this site

const GITHUB_USER = "polysius";

const PROJECTS = [
  {
    slug: "lstm-load-forecasting",
    title: "Load forecasting service",
    tagline: "Does an LSTM beat simple baselines for hourly electricity load? Under one fair protocol, no.",
    status: "complete",
    tags: ["Forecasting", "MLOps", "PyTorch", "ONNX", "FastAPI"],
    summary:
      "A leakage-audited study of hourly electricity-load forecasting, grown into a system: a reproducible training package, MLflow tracking, a champion/challenger promotion gate, an ONNX Runtime API with conformal prediction intervals, and drift monitoring that triggers retraining.",
    results: [
      { label: "Original study reproduced", value: "18 of 27", note: "published results match to 0.0000 on every fold; the other 9 cannot be produced by any committed code" },
      { label: "LSTM vs seasonal naive (MASE, h=24)", value: "1.190 vs 0.743", note: "under one protocol the LSTM is worse at every horizon; lower is better" },
      { label: "Drift replay", value: "2 days", note: "with a 25% planted load shift, the first retrain triggers two days later; no retrains without a shift" },
    ],
    caveats: [
      "The model is deliberately small (32-unit LSTM). The focus is the system around it.",
      "The LSTM is competitive only on folds with plenty of data and a stable regime.",
    ],
    images: [
      { src: "img/lstm-model-comparison.png", alt: "Bar chart of MASE by model on the aligned benchmark", caption: "Aligned benchmark: MASE by model, same five rolling-origin folds." },
      { src: "img/lstm-planted-shift.png", alt: "Replay of a planted load shift with retrain events", caption: "Planted-shift replay: rolling error rises, a retrain triggers, the gate accepts a recovered model." },
      { src: "img/lstm-grafana.png", alt: "Grafana dashboard after the planted-shift replay", caption: "Grafana dashboard after the replay." },
    ],
    demo: { href: "demos/forecast.html", label: "Baseline forecasting playground" },
  },
  {
    slug: "two-stage-recsys",
    title: "Two-stage recommender",
    tagline: "Retrieval, a learned ranker, and a simulated A/B test that reports its own weak evidence.",
    status: "complete",
    tags: ["Recommenders", "LightGBM", "FAISS", "FastAPI", "Redis"],
    summary:
      "A recommender built the way large catalogues are served: five candidate generators (popularity, recent popularity, item-item CF, ALS, two-tower with FAISS), a LightGBM LambdaMART ranker, a simulated online experiment with power analysis, and a FastAPI service with a Redis candidate cache. Data is Amazon Reviews 2023, Video Games, 5-core.",
    results: [
      { label: "Hit rate at 10, ranker vs recent popularity", value: "0.0933 vs 0.0814", note: "+14.6% relative, 95% CI 0.2% to 31%, p = 0.047" },
      { label: "Experiment size", value: "8,895 users", note: "4,447 control and 4,448 treatment; sample-ratio test p = 0.992" },
      { label: "Minimum detectable effect", value: "22% relative", note: "at 80% power; the observed lift is below what the test was sized to detect" },
    ],
    caveats: [
      "The write-up calls the evidence weak: the interval's lower end is almost zero.",
      "66% of validation and test rows were removed by the warm-user filter, so results say nothing about cold users.",
      "Splits are by time, never random, and a test fails if any split leaks.",
    ],
    images: [],
    demo: { href: "demos/ab-test.html", label: "A/B test power calculator" },
  },
  {
    slug: "nl-analytics-agent",
    title: "Text-to-SQL analytics agent",
    tagline: "A LangGraph agent with three layers keeping the database read-only, measured honestly.",
    status: "complete",
    tags: ["LLM agents", "LangGraph", "pgvector", "MCP", "Langfuse"],
    summary:
      "A text-to-SQL agent over Formula 1 data: a LangGraph state machine, hybrid schema retrieval in pgvector, three independent read-only layers, Langfuse tracing, a benchmark with an accuracy gate, and an adversarial test suite. It is exposed as an MCP server for Claude Code and Cursor.",
    results: [
      { label: "Execution accuracy, Claude Sonnet, graph", value: "89.3%", note: "56 questions, one run; a 95% interval is roughly plus or minus 8 to 9 points" },
      { label: "Few-shot examples, vector retrieval baseline", value: "60.7% to 91.1%", note: "Sonnet; Gemini moves from 76.8% to 87.5%. Hybrid search lifts column recall@25 from 0.409 to 0.536 but not end-to-end accuracy" },
      { label: "Attacks stopped", value: "17 of 17", note: "compromised-LLM attacks never reach the database; 5 of 5 injection phrases blocked" },
    ],
    caveats: [
      "The default graph misses the 'match the best baseline' bar by one question on Sonnet and two on Gemini; differences between variants are within noise at 56 questions.",
      "The accuracy gate runs locally through the Claude Code bridge, not in GitHub Actions.",
      "A second database built from the lakehouse project scored 17 of 18 on Sonnet; that work is in an open pull request.",
    ],
    images: [],
    demo: { href: "demos/sql-replay.html", label: "Recorded benchmark run browser" },
  },
  {
    slug: "lakehouse-pipeline",
    title: "Lakehouse pipeline",
    tagline: "NYC taxi trips through bronze, silver and gold layers, with data quality gates.",
    status: "complete",
    tags: ["Data engineering", "PySpark", "Delta", "dbt", "Airflow"],
    summary:
      "A batch data platform over a year of NYC TLC yellow taxi records: idempotent ingestion, a silver layer on Databricks with named reject reasons, dbt gold models with tests, a Great Expectations gate, and metric models for BI. A text-to-SQL agent over its gold tables is in progress.",
    results: [
      { label: "Rows ingested (2024)", value: "41,169,720", note: "12 months; a rerun skips all 12 in under a second" },
      { label: "Rejected by quality rules", value: "3.6%", note: "1,481,846 rows, each labelled with the first rule it broke" },
      { label: "dbt build", value: "36 steps pass", note: "24 tests over the star schema; the incremental merge does not duplicate trips" },
    ],
    caveats: [
      "The table-layout benchmark found no measurable speed difference at 750 MB. The write-up says so instead of claiming a win.",
      "The Tableau workbook has not been opened in Tableau and has no screenshot yet.",
    ],
    images: [{ src: "img/lakehouse-lineage.png", alt: "Lineage graph from the silver trips table to the fact and dimension tables", caption: "Lineage from the silver trips table to the gold fact and dimension tables." }],
  },
  {
    slug: "sensor-edge-ai",
    title: "Turbofan RUL and edge AI",
    tagline: "Remaining useful life, anomaly detection with uncertainty, and INT8 inference, streamed live.",
    status: "complete",
    tags: ["Time series", "ONNX", "Quantisation", "Redpanda", "Grafana"],
    summary:
      "Remaining-useful-life prediction on NASA C-MAPSS with classical baselines, an LSTM and a 1D-CNN, isolation-forest and autoencoder anomaly detectors, a Gaussian process health-indicator forecast for uncertainty, INT8 ONNX export, and a Redpanda, Prometheus and Grafana streaming demo.",
    results: [
      { label: "FD001 test RMSE", value: "14.53", note: "gradient boosting; LSTM 16.10 ± 0.58 over three seeds, so the deep models do not win" },
      { label: "LSTM size after dynamic INT8", value: "223.8 KB to 67.2 KB", note: "test RMSE moves from 16.80 to 16.78" },
      { label: "Streaming replay", value: "100 readings per second", note: "13,096 readings from 100 engines, scored as they arrive" },
    ],
    caveats: [
      "Edge numbers come from a laptop ARM64 CPU. A Raspberry Pi was not benchmarked.",
      "Test RMSE has a floor because training caps RUL at 125 cycles; the write-up quantifies it per subset.",
      "The autoencoder detects close-to-failure windows poorly (recall 0.23); the isolation forest does well (AUC 0.997 on FD001).",
    ],
    images: [
      { src: "img/sensor-uncertainty.png", alt: "Gaussian process forecast of the health indicator for four test engines", caption: "Gaussian process forecast of the health indicator, one engine per true RUL range." },
      { src: "img/sensor-grafana.png", alt: "Grafana dashboard for the streaming demo", caption: "Grafana during the streaming replay." },
    ],
  },
  {
    slug: "forecast-to-decision",
    title: "Forecast to decision",
    tagline: "What should a gas utility do when its forecast is wrong by a known amount?",
    status: "in-progress",
    tags: ["Statistics", "Regression", "Time series"],
    summary:
      "Massachusetts natural gas deliveries (EIA) against Boston heating degree days (NOAA), taken from an interpretable regression forecast toward a supply plan. Milestone 1 is done; the supply optimisation, variance analysis and reporting milestones are not started.",
    results: [
      { label: "Residential MAPE, last 36 months", value: "12.8% vs 10.2%", note: "regression with normal weather vs seasonal naive; the regression loses" },
      { label: "Residential MAPE with actual weather", value: "7.9%", note: "not a real forecast, but shows weather explains about half of the residential error" },
    ],
    caveats: [
      "Milestones 2 to 4 (linear-programming supply plan, variance analysis, Excel and Power BI) are not started.",
      "Residuals are autocorrelated with non-constant variance, so confidence intervals are approximate.",
    ],
    images: [],
  },
  {
    slug: "filings-rag",
    title: "SEC filings RAG",
    tagline: "Citation-grounded question answering over 10-K and 10-Q filings.",
    status: "in-progress",
    tags: ["RAG", "Document parsing", "XBRL", "pgvector", "ONNX"],
    summary:
      "A pipeline that downloads filings from EDGAR, parses text and tables with page numbers, extracts structured financial fields with an LLM and scores them against XBRL ground truth, then retrieves with BM25, dense search and a reranker. It is built and tested, but it has not been run on real filings yet.",
    results: [],
    caveats: [
      "No accuracy numbers are published because the pipeline has not been run on a real corpus. The results file says so.",
      "Dense search and reranking are in an open pull request; cited answers and the API are planned.",
    ],
    images: [],
  },
  {
    slug: "step-lock",
    title: "AppLocker",
    tagline: "An Android app that locks apps you choose until you earn access by walking.",
    status: "in-progress",
    tags: ["Android", "Kotlin", "Accessibility service", "On-device"],
    summary:
      "A personal Android app, sideloaded on one device. Everything runs on the phone: no account, backend, analytics or network access. Phase 1 blocks chosen apps on a schedule with a full-screen lock that cannot be weakened while a block is active. Earning access with steps comes in later phases.",
    results: [
      { label: "Phase 1", value: "Tested on a Pixel 11", note: "schedule blocking, bedtime lock, blocked-attempt history" },
    ],
    caveats: [
      "It is a personal build, so no APK is offered here.",
      "Steps, timed unlock windows and workouts are not built yet.",
      "The lock uses an Accessibility overlay. If Accessibility is turned off, the app shows 'Protection: DEGRADED' and does not block.",
    ],
    images: [],
  },
  {
    slug: "visual-search",
    title: "Visual search",
    tagline: "Product image retrieval with fine-tuned embeddings.",
    status: "early",
    tags: ["Computer vision", "FAISS", "CLIP", "LoRA"],
    summary:
      "Planned pipeline: query image, optional YOLO crop, a CLIP or DINOv2 encoder with LoRA fine-tuning, a FAISS index, ranked gallery. The baseline code, metrics and tests exist; it has not been run on real images.",
    results: [],
    caveats: [
      "No results yet. Training needs a PyTorch environment that this machine does not have.",
      "Uses Stanford Online Products, because the spec's default dataset needs a signed agreement.",
    ],
    images: [],
  },
  {
    slug: "agent-toolkit",
    title: "agent-toolkit",
    tagline: "One install that sets up four tools for coding agents, plus shared rules.",
    status: "complete",
    tags: ["Developer tooling", "PowerShell", "Shell"],
    summary:
      "An installer for gh-axi, chrome-devtools-axi, no-mistakes and gnhf, with global rules written into each agent's instruction file so every project uses them. Installs and uninstalls are idempotent and marked, so re-running updates in place.",
    results: [],
    caveats: [],
    images: [],
  },
];

const STATUS_LABELS = {
  complete: "Complete",
  "in-progress": "In progress",
  early: "Early stage",
};

function repoUrl(slug) {
  return `https://github.com/${GITHUB_USER}/${slug}`;
}
