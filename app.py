from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from fastapi.responses import JSONResponse
import uuid

app = FastAPI()

# Permitir CORS desde cualquier origen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lista para almacenar los colores
color_list = []

# Pydantic model para los colores
class Color(BaseModel):
    id: Optional[str] = None
    hex_code: str
    rgb_value: str

# Ruta para guardar colores usando POST
@app.post("/save_color")
def save_color(color: Color):
    color.id = str(uuid.uuid4())  # Generar un ID único
    color_list.append(color.dict())
    return {"message": "Color guardado correctamente!", "id": color.id}

# Ruta para obtener colores
@app.get("/get_colors")
def get_colors():
    return {"colors": color_list}

# Ruta para borrar colores por ID
@app.delete("/delete_color/{color_id}")
def delete_color(color_id: str):
    global color_list
    color_index = next((index for (index, color) in enumerate(color_list) if color["id"] == color_id), None)
    if color_index is None:
        raise HTTPException(status_code=404, detail="Color no encontrado")
    color_list.pop(color_index)
    return {"message": f"Color con ID {color_id} eliminado correctamente!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=9000)
