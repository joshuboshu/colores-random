from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from fastapi.responses import JSONResponse

app = FastAPI()

# Permitir CORS desde cualquier origen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes restringir los orígenes específicos si es necesario
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos HTTP
    allow_headers=["*"],  # Permitir todos los headers
)

# Lista para almacenar los colores
color_list = []

# Pydantic model para los colores
class Color(BaseModel):
    hex_code: str
    rgb_value: str

# Ruta para guardar colores usando POST
@app.post("/save_color")
def save_color(color: Color):
    color_list.append({'hex_code': color.hex_code, 'rgb_value': color.rgb_value})
    return {"message": "Color guardado correctamente!"}

# Ruta para obtener colores
@app.get("/get_colors")
def get_colors():
    return {"colors": color_list}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=9000)
