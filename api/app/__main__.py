import os

import uvicorn

if __name__ == "__main__":
    # Render memberi $PORT; default 7860 (lokal/HF).
    uvicorn.run("app.main:app", host="0.0.0.0", port=int(os.getenv("PORT", "7860")))
