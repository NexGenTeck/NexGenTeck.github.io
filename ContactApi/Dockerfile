# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM rust:1.76-slim AS builder

RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cache dependencies layer (rebuild only when Cargo.toml/Cargo.lock changes)
COPY Cargo.toml Cargo.lock* ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo build --release && rm -rf src

# Build real source
COPY src ./src
RUN touch src/main.rs && cargo build --release

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y ca-certificates libssl3 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/contact-api /usr/local/bin/contact-api

EXPOSE 3001

CMD ["contact-api"]
