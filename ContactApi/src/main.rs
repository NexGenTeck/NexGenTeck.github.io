use axum::{
    Router,
    extract::{ConnectInfo, State},
    http::{HeaderMap, HeaderValue, Method, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json,
};
use chrono::NaiveDateTime;
use dotenvy::dotenv;
use serde::{Deserialize, Serialize};
use sqlx::mysql::MySqlPoolOptions;
use sqlx::MySqlPool;
use std::{net::SocketAddr, sync::Arc};
use tower_http::cors::{AllowOrigin, CorsLayer};
use tracing::info;

// ── State ────────────────────────────────────────────────────────────────────

#[derive(Clone)]
struct AppState {
    db: MySqlPool,
    allowed_origins: Vec<String>,
}

// ── Payload / Response types ─────────────────────────────────────────────────

#[derive(Deserialize)]
struct ContactPayload {
    name:    Option<String>,
    email:   Option<String>,
    phone:   Option<String>,
    subject: Option<String>,
    message: Option<String>,
}

#[derive(Serialize)]
struct ContactCreated {
    id:         u64,
    created_at: NaiveDateTime,
}

#[derive(Serialize)]
struct ApiError {
    error: &'static str,
}

#[derive(Serialize)]
struct HealthStatus {
    status: &'static str,
    db:     bool,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

fn trim_field(opt: Option<String>) -> String {
    opt.unwrap_or_default().trim().to_owned()
}

fn is_valid_email(email: &str) -> bool {
    let mut parts = email.splitn(2, '@');
    let _local = match parts.next() {
        Some(l) if !l.is_empty() => l,
        _ => return false,
    };
    let domain = match parts.next() {
        Some(d) => d,
        None => return false,
    };
    domain.contains('.')
}

// ── Handlers ──────────────────────────────────────────────────────────────────

async fn health(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    match sqlx::query("SELECT 1").execute(&state.db).await {
        Ok(_) => Json(HealthStatus { status: "ok", db: true }).into_response(),
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(HealthStatus { status: "error", db: false }),
        )
            .into_response(),
    }
}

async fn submit_contact(
    State(state): State<Arc<AppState>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Json(body): Json<ContactPayload>,
) -> impl IntoResponse {
    let name    = trim_field(body.name);
    let email   = trim_field(body.email);
    let phone   = trim_field(body.phone);
    let subject = trim_field(body.subject);
    let message = trim_field(body.message);

    // ── Validation ───────────────────────────────────────────────────────────

    if name.is_empty() || email.is_empty() || message.is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(ApiError { error: "name_email_message_required" }),
        )
            .into_response();
    }

    if !is_valid_email(&email) {
        return (
            StatusCode::BAD_REQUEST,
            Json(ApiError { error: "invalid_email" }),
        )
            .into_response();
    }

    if name.len() > 200
        || email.len() > 320
        || phone.len() > 50
        || subject.len() > 200
        || message.len() > 4000
    {
        return (
            StatusCode::BAD_REQUEST,
            Json(ApiError { error: "field_too_long" }),
        )
            .into_response();
    }

    // ── Optional fields → None when empty ───────────────────────────────────

    let phone_opt:   Option<String> = if phone.is_empty()   { None } else { Some(phone) };
    let subject_opt: Option<String> = if subject.is_empty() { None } else { Some(subject) };

    let ip         = peer.ip().to_string();
    let user_agent = headers
        .get("user-agent")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_owned());

    // ── DB insert ────────────────────────────────────────────────────────────
    // MySQL has no RETURNING, so we insert then fetch created_at by last_insert_id().

    let insert_result = sqlx::query(
        r#"
        INSERT INTO contact_submissions
            (name, email, phone, subject, message, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&name)
    .bind(&email)
    .bind(&phone_opt)
    .bind(&subject_opt)
    .bind(&message)
    .bind(&ip)
    .bind(&user_agent)
    .execute(&state.db)
    .await;

    let inserted_id = match insert_result {
        Ok(r)  => r.last_insert_id(),
        Err(e) => {
            tracing::error!("DB insert failed: {e}");
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiError { error: "db_insert_failed" }),
            )
                .into_response();
        }
    };

    // Fetch the auto-generated created_at for the response
    let row: (NaiveDateTime,) =
        match sqlx::query_as("SELECT created_at FROM contact_submissions WHERE id = ?")
            .bind(inserted_id)
            .fetch_one(&state.db)
            .await
        {
            Ok(r)  => r,
            Err(e) => {
                tracing::error!("DB fetch after insert failed: {e}");
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(ApiError { error: "db_fetch_failed" }),
                )
                    .into_response();
            }
        };

    (
        StatusCode::CREATED,
        Json(ContactCreated {
            id:         inserted_id,
            created_at: row.0,
        }),
    )
        .into_response()
}

// ── CORS helper ───────────────────────────────────────────────────────────────

fn build_cors(allowed_origins: &[String]) -> CorsLayer {
    if allowed_origins.is_empty() {
        return CorsLayer::new()
            .allow_origin(AllowOrigin::any())
            .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
            .allow_headers(tower_http::cors::Any);
    }

    let origins: Vec<HeaderValue> = allowed_origins
        .iter()
        .filter_map(|o| o.parse().ok())
        .collect();

    CorsLayer::new()
        .allow_origin(origins)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(tower_http::cors::Any)
}

// ── Entry point ───────────────────────────────────────────────────────────────

#[tokio::main]
async fn main() {
    dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "contact_api=info,tower_http=info".into()),
        )
        .init();

    // ── Config from env ──────────────────────────────────────────────────────

    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set (mysql://user:pass@host:3306/dbname)");

    let allowed_origins: Vec<String> = std::env::var("ALLOWED_ORIGINS")
        .unwrap_or_default()
        .split(',')
        .map(|s| s.trim().to_owned())
        .filter(|s| !s.is_empty())
        .collect();

    let port: u16 = std::env::var("PORT")
        .unwrap_or_else(|_| "3001".into())
        .parse()
        .expect("PORT must be a valid number");

    // ── DB pool ──────────────────────────────────────────────────────────────

    let db = MySqlPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to MySQL database");

    info!("Connected to MySQL database");

    // ── Router ───────────────────────────────────────────────────────────────

    let state = Arc::new(AppState {
        db,
        allowed_origins: allowed_origins.clone(),
    });

    let app = Router::new()
        .route("/health",      get(health))
        .route("/api/contact", post(submit_contact))
        .layer(build_cors(&allowed_origins))
        .with_state(state);

    // ── Serve ────────────────────────────────────────────────────────────────

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    info!("Contact API listening on {addr}");

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind address");

    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .unwrap();
}
