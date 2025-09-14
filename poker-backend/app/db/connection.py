import os
import asyncpg
from typing import Optional

_pool: Optional[asyncpg.pool.Pool] = None

async def init_db_pool(dsn: str) -> asyncpg.pool.Pool:
    """Initialize the global database pool."""
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(dsn, min_size=1, max_size=10)
        print("✅ DB pool initialized")
    return _pool

async def close_db_pool() -> None:
    """Close the global database pool."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
        print("✅ DB pool closed")

def get_db_pool() -> asyncpg.pool.Pool:
    """Return the initialized pool. Raises error if not initialized."""
    if _pool is None:
        raise RuntimeError("DB pool not initialized. Call init_db_pool first.")
    return _pool
