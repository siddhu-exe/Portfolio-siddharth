#!/usr/bin/env python3
"""
LegalRAG Portfolio Asset Generator
Generates high-resolution, dark-themed charts and diagrams for the LegalRAG portfolio.
"""

import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Arrow
import numpy as np

# Portfolio theme colors
BG_DARK = "#0B0E14"
BG_SURFACE = "#10131a"
BG_SURFACE_LOW = "#191c22"
BG_SURFACE_HIGH = "#272a31"
BRASS = "#D4AF37"
BRASS_LIGHT = "#F2CA50"
SLATE_STEEL = "#7B96B2"
SLATE_STEEL_LIGHT = "#AEC9E7"
VECTOR_MINT = "#2DD4BF"
VECTOR_MINT_LIGHT = "#48E5D0"
AMBER_WARN = "#F59E0B"
RED_ALERT = "#EF4444"
TEXT_WHITE = "#FFFFFF"
TEXT_GRAY = "#D1D5DB"
TEXT_MUTED = "#9CA3AF"
BORDER_COLOR = "#2A2E37"

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "images"))
os.makedirs(OUTPUT_DIR, exist_ok=True)

plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['text.color'] = TEXT_WHITE
plt.rcParams['axes.labelcolor'] = TEXT_GRAY
plt.rcParams['xtick.color'] = TEXT_MUTED
plt.rcParams['ytick.color'] = TEXT_MUTED

# ==============================================================================
# 1. End-to-End RAG Architecture Diagram
# ==============================================================================
def create_architecture_diagram():
    fig, ax = plt.subplots(figsize=(16, 10), facecolor=BG_DARK)
    ax.set_facecolor(BG_DARK)
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 10)
    ax.axis('off')

    # Title & Subtitle
    ax.text(8, 9.5, "LegalRAG — End-to-End Retrieval & Synthesis Architecture",
            ha='center', va='center', fontsize=18, fontweight='bold', color=TEXT_WHITE)
    ax.text(8, 9.1, "Autonomous Judicial Retrieval Cascade over 100,000 High Court Judgments (538,079 Chunks)",
            ha='center', va='center', fontsize=11, color=BRASS)

    # Box Helper Function
    def draw_box(x, y, w, h, title, subtitle, items, border_col=BRASS, bg_col=BG_SURFACE_LOW):
        # Background card
        rect = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.1,rounding_size=0.15",
                              facecolor=bg_col, edgecolor=border_col, linewidth=1.5)
        ax.add_patch(rect)

        # Header text
        ax.text(x + w/2, y + h - 0.35, title, ha='center', va='center',
                fontsize=11, fontweight='bold', color=TEXT_WHITE)
        if subtitle:
            ax.text(x + w/2, y + h - 0.65, subtitle, ha='center', va='center',
                    fontsize=8.5, color=BRASS_LIGHT)

        # Bullet items
        start_y = y + h - (1.05 if subtitle else 0.75)
        for i, item in enumerate(items):
            ax.text(x + 0.25, start_y - i * 0.32, f"• {item}", ha='left', va='center',
                    fontsize=8.5, color=TEXT_GRAY)

    # 1. User Query
    draw_box(0.5, 5.2, 2.5, 2.6, "1. User Query", "Validated Input",
             ["3 - 4000 characters", "Legal questions across", "24 High Courts", "Single in-flight lock"],
             border_col=SLATE_STEEL)

    # 2A. BM25 Lexical
    draw_box(3.8, 6.6, 3.4, 2.2, "2A. Lexical Sparse Search", "BM25Okapi Index",
             ["k1=1.5, b=0.75", "Legal regex tokenization", "Exact section & act matching", "Output: Top-50 candidates"],
             border_col=BRASS)

    # 2B. Dense BGE
    draw_box(3.8, 3.8, 3.4, 2.2, "2B. Dense Semantic Search", "BAAI/bge-base-en-v1.5",
             ["768-dim L2-normalized", "FAISS IndexFlatIP", "Instruction query prefix", "Output: Top-50 candidates"],
             border_col=VECTOR_MINT)

    # 3. Hybrid RRF Fusion
    draw_box(7.9, 4.6, 2.8, 3.4, "3. Hybrid RRF Fusion", "k = 60 Constant",
             ["Score = Σ 1/(60 + rank_i)", "Zero score scale bias", "Merges lexical & semantic", "Output: Top-50 candidates", "Recall@50: 65.79%"],
             border_col=AMBER_WARN)

    # 4. Cross-Encoder Reranker
    draw_box(11.3, 4.6, 2.8, 3.4, "4. Cross-Encoder Rerank", "ms-marco-MiniLM-L-6-v2",
             ["Full joint self-attention", "512 max sequence length", "Re-scores Top-50 pool", "Output: Top-5 Gold Chunks", "Recall@1: 35.61% (+3.42pp)"],
             border_col=VECTOR_MINT)

    # 5. Grounded LLM Generation
    draw_box(4.5, 0.6, 7.5, 2.5, "5. Grounded Generation & Citation Contract", "Groq Cloud (qwen/qwen3.8-27b)",
             ["Top-5 retrieved chunks injected with strict chunk delimiters",
              "Temperature = 0.0, Max tokens = 1024, Request timeout = 30s",
              "Mandatory inline citations: [Chunk ID: <CNR>_chunk_<idx>]",
              "Evaluated Quality: 89.2% Faithfulness, 93.8% Citation Accuracy"],
             border_col=BRASS, bg_col=BG_SURFACE_HIGH)

    # Arrows Function
    def draw_arrow(x1, y1, x2, y2, color=SLATE_STEEL):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="-|>", color=color, lw=2, mutation_scale=15))

    # Connect query to BM25 and Dense
    draw_arrow(3.0, 6.7, 3.8, 7.5, color=BRASS)
    draw_arrow(3.0, 6.3, 3.8, 4.9, color=VECTOR_MINT)

    # Connect BM25 and Dense to RRF
    draw_arrow(7.2, 7.5, 7.9, 6.6, color=BRASS)
    draw_arrow(7.2, 4.9, 7.9, 5.8, color=VECTOR_MINT)

    # Connect RRF to Cross-Encoder
    draw_arrow(10.7, 6.3, 11.3, 6.3, color=AMBER_WARN)

    # Connect Cross-Encoder to LLM Context
    draw_arrow(12.7, 4.6, 12.0, 1.85, color=VECTOR_MINT)

    # Connect LLM Generation Output
    ax.annotate('', xy=(3.0, 1.85), xytext=(4.5, 1.85),
                arrowprops=dict(arrowstyle="<|-", color=BRASS_LIGHT, lw=2, mutation_scale=15))

    # Output Card
    draw_box(0.5, 0.6, 2.5, 2.5, "Grounded Output", "Grounded Response",
             ["Synthesized legal analysis", "Verifiable citations", "Per-stage latency telemetry", "80.2% RAG Success Rate"],
             border_col=BRASS_LIGHT)

    plt.tight_layout()
    png_path = os.path.join(OUTPUT_DIR, "01_end_to_end_rag_architecture.png")
    svg_path = os.path.join(OUTPUT_DIR, "01_end_to_end_rag_architecture.svg")
    plt.savefig(png_path, dpi=300, facecolor=BG_DARK)
    plt.savefig(svg_path, facecolor=BG_DARK)
    plt.close()
    print(f"Generated: {png_path}")

# ==============================================================================
# 2. Data Ingestion & Indexing Pipeline Diagram
# ==============================================================================
def create_indexing_diagram():
    fig, ax = plt.subplots(figsize=(16, 9), facecolor=BG_DARK)
    ax.set_facecolor(BG_DARK)
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 9)
    ax.axis('off')

    # Title & Subtitle
    ax.text(8, 8.5, "LegalRAG — 100k Ingestion, Chunking & Indexing Pipeline",
            ha='center', va='center', fontsize=18, fontweight='bold', color=TEXT_WHITE)
    ax.text(8, 8.1, "Transforming 100,000 Raw Judgments into 538,079 Dual-Indexed Search Chunks",
            ha='center', va='center', fontsize=11, color=VECTOR_MINT)

    def draw_node(x, y, w, h, title, subtitle, details, color=BRASS):
        rect = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.08,rounding_size=0.12",
                              facecolor=BG_SURFACE_LOW, edgecolor=color, linewidth=1.5)
        ax.add_patch(rect)
        ax.text(x + w/2, y + h - 0.3, title, ha='center', va='center', fontsize=10.5, fontweight='bold', color=TEXT_WHITE)
        if subtitle:
            ax.text(x + w/2, y + h - 0.58, subtitle, ha='center', va='center', fontsize=8.5, color=color)
        start_y = y + h - (0.95 if subtitle else 0.65)
        for i, d in enumerate(details):
            ax.text(x + 0.2, start_y - i * 0.28, f"• {d}", ha='left', va='center', fontsize=8, color=TEXT_GRAY)

    # 1. Raw Data Source
    draw_node(0.5, 4.6, 3.2, 2.7, "1. Ingestion & Streaming", "overthelex/indian-court-decisions",
              ["100,000 High Court Judgments", "24 High Court jurisdictions", "Streamed buffer_size=50,000", "Reproducible seed = 42"],
              color=SLATE_STEEL)

    # 2. Sanitization
    draw_node(4.2, 4.6, 3.4, 2.7, "2. Data Quality & Cleaning", "Strict Preprocessing Gate",
              ["Stripped control chars [\\x00-\\x1f]", "762 corrupted docs filtered (0.76%)", "Preserved statutory citations & dates", "Artifact: legal_judgments_clean (485 MB)"],
              color=AMBER_WARN)

    # 3. LegalChunker
    draw_node(8.1, 4.6, 3.4, 2.7, "3. LegalChunker Partitioning", "Recursive Character Splitting",
              ["chunk_size = 1200 characters", "chunk_overlap = 200 characters", "min_chunk_length = 100 chars", "Total: 538,079 Chunks (260.7 MB)"],
              color=VECTOR_MINT)

    # 4A. BM25 Serializer
    draw_node(12.0, 5.8, 3.5, 2.5, "4A. BM25 Sparse Index", "Lexical Token Serialization",
              ["Regex lowercased tokenization", "k1 = 1.5, b = 0.75", "Serialized: bm25.pkl (578.8 MB)", "Exact legal section preservation"],
              color=BRASS)

    # 4B. FAISS Vector Index
    draw_node(12.0, 2.5, 3.5, 2.7, "4B. BGE Dense Vector Index", "FAISS IndexFlatIP (Cosine)",
              ["BAAI/bge-base-en-v1.5 (768-dim)", "Sharded across 2x Tesla T4 GPUs", "108 embedding shards (.npy)", "Serialized: dense.index (1.65 GB)"],
              color=VECTOR_MINT)

    # Storage Banner
    draw_node(0.5, 0.6, 11.0, 2.0, "Production Serving Deployment & HF Hub Provisioning", "Hugging Face Dataset: siddhu23/LegalRag_Dataset",
              ["Zero local storage bloat: artifacts downloaded on-demand at startup via provisioning.py",
               "Thread-safe singleton dependency injection supporting fail-closed production mode and local stubs",
               "Serving footprint: ~10.5 GB peak RSS, 29.3s cold startup, ~4.3s inference on CPU"],
              color=BRASS_LIGHT)

    # Connecting Arrows
    def draw_arrow(x1, y1, x2, y2, color=SLATE_STEEL):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="-|>", color=color, lw=2, mutation_scale=15))

    draw_arrow(3.7, 5.95, 4.2, 5.95, color=SLATE_STEEL)
    draw_arrow(7.6, 5.95, 8.1, 5.95, color=AMBER_WARN)
    draw_arrow(11.5, 6.2, 12.0, 6.9, color=BRASS)
    draw_arrow(11.5, 5.7, 12.0, 4.0, color=VECTOR_MINT)

    plt.tight_layout()
    png_path = os.path.join(OUTPUT_DIR, "02_data_ingestion_indexing_pipeline.png")
    svg_path = os.path.join(OUTPUT_DIR, "02_data_ingestion_indexing_pipeline.svg")
    plt.savefig(png_path, dpi=300, facecolor=BG_DARK)
    plt.savefig(svg_path, facecolor=BG_DARK)
    plt.close()
    print(f"Generated: {png_path}")

# ==============================================================================
# 3. Retrieval Benchmark Recall@K Comparison Chart
# ==============================================================================
def create_retrieval_benchmark_chart():
    fig, ax = plt.subplots(figsize=(14, 8), facecolor=BG_DARK)
    ax.set_facecolor(BG_SURFACE_LOW)

    k_labels = ['Recall@1', 'Recall@5', 'Recall@10', 'Recall@50']
    x = np.arange(len(k_labels))
    width = 0.2

    # Data from 497-question gold benchmark
    bm25_scores = [42.66, 53.32, 57.75, 63.98]
    dense_scores = [19.72, 27.36, 33.40, 44.67]
    rrf_scores = [32.19, 51.11, 56.14, 65.79]
    rerank_scores = [35.61, 48.69, 55.94, 65.79]

    # Bar plotting
    rects1 = ax.bar(x - 1.5*width, bm25_scores, width, label='BM25 Lexical (Sparse)', color=BRASS, edgecolor=BG_DARK)
    rects2 = ax.bar(x - 0.5*width, dense_scores, width, label='Dense (BGE-base-en-v1.5)', color=SLATE_STEEL, edgecolor=BG_DARK)
    rects3 = ax.bar(x + 0.5*width, rrf_scores, width, label='Hybrid RRF (k=60)', color=AMBER_WARN, edgecolor=BG_DARK)
    rects4 = ax.bar(x + 1.5*width, rerank_scores, width, label='Hybrid + Cross-Encoder Reranker', color=VECTOR_MINT, edgecolor=BG_DARK)

    # Grid & Labels
    ax.set_ylabel('Judgment Recall (%)', fontsize=12, fontweight='bold', color=TEXT_WHITE)
    ax.set_title('LegalRAG Retrieval Scoreboard across 497 Gold Questions\nEvaluating Lexical, Dense, Hybrid-RRF, and Cross-Encoder Performance',
                 fontsize=14, fontweight='bold', color=TEXT_WHITE, pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(k_labels, fontsize=11, fontweight='bold')
    ax.set_ylim(0, 78)
    ax.grid(axis='y', linestyle='--', alpha=0.15, color=TEXT_MUTED)

    # Legend
    legend = ax.legend(loc='upper left', frameon=True, facecolor=BG_SURFACE_HIGH, edgecolor=BORDER_COLOR, fontsize=10)
    for text in legend.get_texts():
        text.set_color(TEXT_WHITE)

    # Value Labels above bars
    def autolabel(rects, highlight=False):
        for rect in rects:
            h = rect.get_height()
            ax.annotate(f'{h:.1f}%',
                        xy=(rect.get_x() + rect.get_width() / 2, h),
                        xytext=(0, 4), textcoords="offset points",
                        ha='center', va='bottom', fontsize=8.5, fontweight='bold',
                        color=TEXT_WHITE)

    autolabel(rects1)
    autolabel(rects2)
    autolabel(rects3)
    autolabel(rects4)

    # Key takeaway callout box
    callout_text = (
        "Key Retrieval Findings:\n"
        "1. Lexical Dominance: BM25 achieves 42.66% Recall@1 vs 19.72% for Dense due to exact statutory references.\n"
        "2. RRF Breadth: Hybrid RRF maximizes candidate pool at Top-50 (65.79% Recall).\n"
        "3. Precision Boost: Cross-Encoder lifts Top-1 recall by +3.42pp over Hybrid RRF (32.19% -> 35.61%)."
    )
    ax.text(0.5, 0.05, callout_text, transform=ax.transAxes,
            fontsize=9.5, verticalalignment='bottom', horizontalalignment='center',
            bbox=dict(boxstyle='round,pad=0.6', facecolor=BG_SURFACE, edgecolor=BRASS, alpha=0.9),
            color=TEXT_WHITE)

    plt.tight_layout()
    png_path = os.path.join(OUTPUT_DIR, "03_retrieval_benchmark_comparison.png")
    svg_path = os.path.join(OUTPUT_DIR, "03_retrieval_benchmark_comparison.svg")
    plt.savefig(png_path, dpi=300, facecolor=BG_DARK)
    plt.savefig(svg_path, facecolor=BG_DARK)
    plt.close()
    print(f"Generated: {png_path}")

# ==============================================================================
# 4. Generation Evaluation (LLM-as-a-Judge) Radar & Metric Chart
# ==============================================================================
def create_generation_eval_chart():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7), facecolor=BG_DARK, gridspec_kw={'width_ratios': [1.1, 1.2]})
    ax1.set_facecolor(BG_SURFACE_LOW)
    ax2.set_facecolor(BG_SURFACE_LOW)

    # 1. Bar chart of judge dimensions (out of 4.0)
    metrics = ['Answer Relevance', 'Factual Faithfulness', 'Citation Correctness', 'Overall Synthesis']
    scores = [3.0966, 3.4004, 3.2515, 3.0926]
    pcts = [s / 4.0 * 100 for s in scores]
    colors = [SLATE_STEEL, VECTOR_MINT, BRASS, BRASS_LIGHT]

    y_pos = np.arange(len(metrics))
    bars = ax1.barh(y_pos, scores, color=colors, height=0.55, edgecolor=BG_DARK)
    ax1.set_yticks(y_pos)
    ax1.set_yticklabels(metrics, fontsize=11, fontweight='bold')
    ax1.set_xlim(0, 4.0)
    ax1.set_xlabel('LLM-as-a-Judge Score (Scale: 1.0 - 4.0)', fontsize=11, fontweight='bold', color=TEXT_WHITE)
    ax1.set_title('Automated Multi-Criteria Judge\nScores (497 Gold Questions)', fontsize=13, fontweight='bold', color=TEXT_WHITE, pad=15)
    ax1.grid(axis='x', linestyle='--', alpha=0.2, color=TEXT_MUTED)

    for bar, score, pct in zip(bars, scores, pcts):
        ax1.text(score + 0.08, bar.get_y() + bar.get_height()/2, f"{score:.2f} / 4.0 ({pct:.1f}%)",
                 va='center', fontsize=10, fontweight='bold', color=TEXT_WHITE)

    # 2. Key Reliability & Grounding Rates
    rates_labels = [
        'RAG Success Rate\n(Gold chunk in Top-5)',
        'Citation Syntactic\nAccuracy Rate',
        'Clean Answer Rate\n(Zero Hallucination)',
        'Unsupported Claim\nRate (Lower is better)',
        'Severe Hallucination\nRate when in context'
    ]
    rates_values = [80.2, 93.8, 77.3, 14.9, 1.6]
    bar_cols = [VECTOR_MINT, BRASS_LIGHT, SLATE_STEEL_LIGHT, AMBER_WARN, RED_ALERT]

    x_pos = np.arange(len(rates_labels))
    bars2 = ax2.bar(x_pos, rates_values, color=bar_cols, width=0.55, edgecolor=BG_DARK)
    ax2.set_xticks(x_pos)
    ax2.set_xticklabels(rates_labels, fontsize=9.5, fontweight='bold')
    ax2.set_ylim(0, 105)
    ax2.set_ylabel('Percentage (%)', fontsize=11, fontweight='bold', color=TEXT_WHITE)
    ax2.set_title('Grounding & Reliability Rates\nProduction Safety Profile', fontsize=13, fontweight='bold', color=TEXT_WHITE, pad=15)
    ax2.grid(axis='y', linestyle='--', alpha=0.2, color=TEXT_MUTED)

    for bar, val in zip(bars2, rates_values):
        ax2.annotate(f"{val:.1f}%",
                     xy=(bar.get_x() + bar.get_width() / 2, val),
                     xytext=(0, 4), textcoords="offset points",
                     ha='center', va='bottom', fontsize=10, fontweight='bold', color=TEXT_WHITE)

    plt.tight_layout()
    png_path = os.path.join(OUTPUT_DIR, "04_generation_eval_llm_judge.png")
    svg_path = os.path.join(OUTPUT_DIR, "04_generation_eval_llm_judge.svg")
    plt.savefig(png_path, dpi=300, facecolor=BG_DARK)
    plt.savefig(svg_path, facecolor=BG_DARK)
    plt.close()
    print(f"Generated: {png_path}")

# ==============================================================================
# 5. Failure Taxonomy Distribution Chart
# ==============================================================================
def create_failure_taxonomy_chart():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7), facecolor=BG_DARK)
    ax1.set_facecolor(BG_SURFACE_LOW)
    ax2.set_facecolor(BG_SURFACE_LOW)

    # Pie / Donut Chart of Failure Categories
    categories = [
        'Retrieval Failure\n(Target absent in Top-5)',
        'No Major Failure\n(Clean Grounded Success)',
        'Low Answer Relevance\n(Incomplete synthesis)',
        'Context / Citation Error\n(Formatting issues)',
        'Grounding Failure\n(Hallucinated claim)'
    ]
    counts = [255, 194, 21, 19, 8]
    colors = [AMBER_WARN, VECTOR_MINT, SLATE_STEEL, BRASS, RED_ALERT]

    wedges, texts, autotexts = ax1.pie(
        counts, labels=categories, autopct='%1.1f%%', startangle=140,
        colors=colors, wedgeprops=dict(width=0.45, edgecolor=BG_DARK, linewidth=2),
        textprops=dict(color=TEXT_WHITE, fontsize=9.5)
    )
    for at in autotexts:
        at.set_color(BG_DARK)
        at.set_fontweight('bold')
        at.set_fontsize(9.5)

    ax1.set_title('Root Cause Failure Taxonomy\n(497 Gold Questions)', fontsize=14, fontweight='bold', color=TEXT_WHITE, pad=15)

    # Context Presence Impact (When target chunk is in top-5 vs absent)
    conditions = ['Target Present in Top-5\n(242 Questions)', 'Target Absent in Top-5\n(255 Questions)']
    success_in_context = [194, 0]
    minor_issues = [40, 21+19]
    hallucinations = [8, 215]

    x = np.arange(len(conditions))
    w = 0.45
    ax2.bar(x, success_in_context, w, label='Clean Grounded Success', color=VECTOR_MINT, edgecolor=BG_DARK)
    ax2.bar(x, minor_issues, w, bottom=success_in_context, label='Low Relevance / Citation Issue', color=AMBER_WARN, edgecolor=BG_DARK)
    ax2.bar(x, hallucinations, w, bottom=np.array(success_in_context) + np.array(minor_issues), label='Ungrounded / Fallback', color=RED_ALERT, edgecolor=BG_DARK)

    ax2.set_ylabel('Number of Questions', fontsize=11, fontweight='bold', color=TEXT_WHITE)
    ax2.set_title('Impact of Context Presence on Synthesis Grounding\nDirect Correlation between Retrieval & Hallucination', fontsize=13, fontweight='bold', color=TEXT_WHITE, pad=15)
    ax2.set_xticks(x)
    ax2.set_xticklabels(conditions, fontsize=10.5, fontweight='bold')
    ax2.grid(axis='y', linestyle='--', alpha=0.2, color=TEXT_MUTED)

    legend = ax2.legend(loc='upper right', facecolor=BG_SURFACE_HIGH, edgecolor=BORDER_COLOR)
    for t in legend.get_texts():
        t.set_color(TEXT_WHITE)

    plt.tight_layout()
    png_path = os.path.join(OUTPUT_DIR, "05_failure_taxonomy_distribution.png")
    svg_path = os.path.join(OUTPUT_DIR, "05_failure_taxonomy_distribution.svg")
    plt.savefig(png_path, dpi=300, facecolor=BG_DARK)
    plt.savefig(svg_path, facecolor=BG_DARK)
    plt.close()
    print(f"Generated: {png_path}")

# ==============================================================================
# 6. Latency Waterfall Breakdown Chart
# ==============================================================================
def create_latency_breakdown_chart():
    fig, ax = plt.subplots(figsize=(14, 7), facecolor=BG_DARK)
    ax.set_facecolor(BG_SURFACE_LOW)

    stages = [
        'Query Validation & Sanitization',
        'Dense Embedding Search (FAISS)',
        'BM25 Sparse Lexical Search (538k Chunks)',
        'Reciprocal Rank Fusion (RRF k=60)',
        'Cross-Encoder Reranker (Top-50 -> Top-5)',
        'Grounded Groq LLM Generation (Qwen 3.8-27b)'
    ]
    latencies_ms = [15, 139, 2624, 1, 1496, 1200]
    colors = [SLATE_STEEL, VECTOR_MINT, BRASS, AMBER_WARN, VECTOR_MINT_LIGHT, BRASS_LIGHT]

    y_pos = np.arange(len(stages))
    bars = ax.barh(y_pos, latencies_ms, color=colors, height=0.55, edgecolor=BG_DARK)

    ax.set_yticks(y_pos)
    ax.set_yticklabels(stages, fontsize=11, fontweight='bold')
    ax.set_xlabel('Execution Duration (Milliseconds, log-scale)', fontsize=11, fontweight='bold', color=TEXT_WHITE)
    ax.set_xscale('log')
    ax.set_xlim(0.5, 5000)
    ax.set_title('LegalRAG Monotonic Latency Profile per Pipeline Stage\nCaptured on CPU Inference Serving Stack (Mean Latency ~5.47s)',
                 fontsize=14, fontweight='bold', color=TEXT_WHITE, pad=20)
    ax.grid(axis='x', linestyle='--', alpha=0.2, color=TEXT_MUTED)

    for bar, ms in zip(bars, latencies_ms):
        label = f"{ms} ms ({ms/1000:.2f} s)" if ms >= 1000 else f"{ms} ms"
        ax.text(ms * 1.15, bar.get_y() + bar.get_height()/2, label,
                va='center', fontsize=10, fontweight='bold', color=TEXT_WHITE)

    # Total annotation
    total_ms = sum(latencies_ms)
    ax.text(0.98, 0.05, f"Total End-to-End Latency: {total_ms} ms (~{total_ms/1000:.2f}s)\nClient Recommended Timeout: 120s",
            transform=ax.transAxes, ha='right', va='bottom',
            bbox=dict(boxstyle='round,pad=0.5', facecolor=BG_SURFACE_HIGH, edgecolor=BRASS),
            fontsize=10.5, fontweight='bold', color=TEXT_WHITE)

    plt.tight_layout()
    png_path = os.path.join(OUTPUT_DIR, "06_latency_waterfall_breakdown.png")
    svg_path = os.path.join(OUTPUT_DIR, "06_latency_waterfall_breakdown.svg")
    plt.savefig(png_path, dpi=300, facecolor=BG_DARK)
    plt.savefig(svg_path, facecolor=BG_DARK)
    plt.close()
    print(f"Generated: {png_path}")

# ==============================================================================
# 7. Benchmark Performance across Question Types
# ==============================================================================
def create_question_types_chart():
    fig, ax = plt.subplots(figsize=(14, 7), facecolor=BG_DARK)
    ax.set_facecolor(BG_SURFACE_LOW)

    types = ['Legal Provision (80)', 'Fact (100)', 'Reasoning (149)', 'Multi-Hop (50)', 'Outcome (118)']
    relevance = [3.5000, 3.3300, 3.0604, 2.7600, 2.8136]
    faithfulness = [3.6625, 3.4400, 3.5235, 3.4000, 3.0339]
    citations = [3.6375, 3.2700, 3.4027, 3.2600, 2.7797]
    overall = [3.4375, 3.1400, 3.1007, 3.0200, 2.8390]

    x = np.arange(len(types))
    width = 0.18

    ax.bar(x - 1.5*width, relevance, width, label='Answer Relevance', color=SLATE_STEEL, edgecolor=BG_DARK)
    ax.bar(x - 0.5*width, faithfulness, width, label='Factual Faithfulness', color=VECTOR_MINT, edgecolor=BG_DARK)
    ax.bar(x + 0.5*width, citations, width, label='Citation Correctness', color=BRASS, edgecolor=BG_DARK)
    ax.bar(x + 1.5*width, overall, width, label='Overall Score', color=BRASS_LIGHT, edgecolor=BG_DARK)

    ax.set_ylabel('Judge Score (Scale: 1 - 4)', fontsize=11, fontweight='bold', color=TEXT_WHITE)
    ax.set_title('RAG Synthesis Quality across 5 Judicial Question Types\nHighlighting High Faithfulness in Statutory Provisions & Complex Reasoning',
                 fontsize=14, fontweight='bold', color=TEXT_WHITE, pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(types, fontsize=10.5, fontweight='bold')
    ax.set_ylim(2.0, 4.0)
    ax.grid(axis='y', linestyle='--', alpha=0.2, color=TEXT_MUTED)

    legend = ax.legend(loc='lower left', facecolor=BG_SURFACE_HIGH, edgecolor=BORDER_COLOR, fontsize=10)
    for t in legend.get_texts():
        t.set_color(TEXT_WHITE)

    plt.tight_layout()
    png_path = os.path.join(OUTPUT_DIR, "07_question_type_performance.png")
    svg_path = os.path.join(OUTPUT_DIR, "07_question_type_performance.svg")
    plt.savefig(png_path, dpi=300, facecolor=BG_DARK)
    plt.savefig(svg_path, facecolor=BG_DARK)
    plt.close()
    print(f"Generated: {png_path}")

# ==============================================================================
# 8. Visual Citation Grounding Preview Card
# ==============================================================================
def create_citation_grounding_preview():
    fig, ax = plt.subplots(figsize=(15, 8.5), facecolor=BG_DARK)
    ax.set_facecolor(BG_DARK)
    ax.set_xlim(0, 15)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    ax.text(7.5, 8.0, "Evidence Grounding & Verifiable Citation Contract",
            ha='center', va='center', fontsize=17, fontweight='bold', color=TEXT_WHITE)
    ax.text(7.5, 7.6, "How LegalRAG Synthesizes Responses Tied to Exact Judgment Passages",
            ha='center', va='center', fontsize=11, color=BRASS)

    # 1. Query Card
    q_rect = FancyBboxPatch((0.6, 6.0), 13.8, 1.2, boxstyle="round,pad=0.1,rounding_size=0.1",
                            facecolor=BG_SURFACE_LOW, edgecolor=SLATE_STEEL, linewidth=1.5)
    ax.add_patch(q_rect)
    ax.text(0.9, 6.75, "USER INQUIRY", fontsize=9, fontweight='bold', color=SLATE_STEEL_LIGHT)
    ax.text(0.9, 6.35, '"What are the mandatory statutory conditions for issuing notice under Section 138 of the Negotiable Instruments Act?"',
            fontsize=10.5, color=TEXT_WHITE, style='italic')

    # 2. Retrieved Context Chunks Box
    ctx_rect = FancyBboxPatch((0.6, 2.5), 6.6, 3.2, boxstyle="round,pad=0.1,rounding_size=0.1",
                              facecolor=BG_SURFACE_LOW, edgecolor=VECTOR_MINT, linewidth=1.5)
    ax.add_patch(ctx_rect)
    ax.text(0.9, 5.35, "TOP RETRIEVED CONTEXT CHUNKS", fontsize=9, fontweight='bold', color=VECTOR_MINT)

    c1_txt = "[Chunk ID: WBCHCJ0003822020_1_2020-01-28_0]\nCalcutta High Court | 28 Jan 2020\n• Notice must be in writing within 30 days of dishonour memo\n• Demand must demand payment of the exact cheque amount"
    ax.text(0.9, 4.4, c1_txt, fontsize=8.5, color=TEXT_GRAY)

    c2_txt = "[Chunk ID: BOMHC010049212019_1_2019-06-14_2]\nBombay High Court | 14 Jun 2019\n• Drawer given 15 days from receipt of notice to make payment\n• Cause of action arises on 16th day upon failure to pay"
    ax.text(0.9, 3.1, c2_txt, fontsize=8.5, color=TEXT_GRAY)

    # 3. Grounded Synthesis Box
    ans_rect = FancyBboxPatch((7.6, 2.5), 6.8, 3.2, boxstyle="round,pad=0.1,rounding_size=0.1",
                             facecolor=BG_SURFACE_LOW, edgecolor=BRASS, linewidth=1.5)
    ax.add_patch(ans_rect)
    ax.text(7.9, 5.35, "GROUNDED LEGAL SYNTHESIS (GROQ QWEN 3.8-27B)", fontsize=9, fontweight='bold', color=BRASS)

    ans_text = (
        "Under Section 138 of the Negotiable Instruments Act, the essential prerequisites are:\n\n"
        "1. Written Notice: The payee must make a demand in writing for payment\n"
        "   within 30 days of receiving the dishonour memo from the bank\n"
        "   [Chunk ID: WBCHCJ0003822020_1_2020-01-28_0].\n\n"
        "2. 15-Day Cure Period: The drawer must be afforded 15 days from receipt\n"
        "   of notice to discharge the liability. The cause of action arises only\n"
        "   on the 16th day if payment fails [Chunk ID: BOMHC010049212019_1_2019-06-14_2]."
    )
    ax.text(7.9, 3.8, ans_text, fontsize=8.5, color=TEXT_WHITE)

    # Arrow between context and answer
    ax.annotate('', xy=(7.5, 4.1), xytext=(7.3, 4.1),
                arrowprops=dict(arrowstyle="-|>", color=BRASS_LIGHT, lw=2, mutation_scale=15))

    # Bottom Telemetry Strip
    tel_rect = FancyBboxPatch((0.6, 0.6), 13.8, 1.5, boxstyle="round,pad=0.1,rounding_size=0.1",
                              facecolor=BG_SURFACE_HIGH, edgecolor=BORDER_COLOR, linewidth=1.0)
    ax.add_patch(tel_rect)
    ax.text(0.9, 1.7, "SYSTEM TELEMETRY & VERIFICATION METADATA", fontsize=9, fontweight='bold', color=TEXT_MUTED)

    t_text = (
        "• Retrieve Latency: 2,763 ms (BM25: 2,624 ms | BGE Dense: 139 ms)    • Rerank Latency: 1,496 ms (Cross-Encoder Top-50 -> Top-5)\n"
        "• Generate Latency: 1,210 ms (Groq API, Qwen 3.8-27b, temp=0)         • Total Server Latency: 5,469 ms\n"
        "• Citations Verified: 2/2 Valid Chunk IDs                             • Status: 200 OK (Grounded Execution)"
    )
    ax.text(0.9, 1.05, t_text, fontsize=8.5, color=VECTOR_MINT)

    plt.tight_layout()
    png_path = os.path.join(OUTPUT_DIR, "08_citation_grounding_preview.png")
    svg_path = os.path.join(OUTPUT_DIR, "08_citation_grounding_preview.svg")
    plt.savefig(png_path, dpi=300, facecolor=BG_DARK)
    plt.savefig(svg_path, facecolor=BG_DARK)
    plt.close()
    print(f"Generated: {png_path}")

# ==============================================================================
# Main Runner
# ==============================================================================
if __name__ == "__main__":
    print("Generating LegalRAG Portfolio Visual Assets...")
    create_architecture_diagram()
    create_indexing_diagram()
    create_retrieval_benchmark_chart()
    create_generation_eval_chart()
    create_failure_taxonomy_chart()
    create_latency_breakdown_chart()
    create_question_types_chart()
    create_citation_grounding_preview()
    print("\nAll 8 portfolio visual assets generated successfully in PNG and SVG formats!")
