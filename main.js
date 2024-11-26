// Historial de colores generados
let colorHistory = [];
let currentIndex = -1; // Índice del color actual
let colorList = []; // Lista para almacenar los colores guardados

// Función para convertir un código hexadecimal a RGB
const hexToRgb = (hex) => {
    if (!/^#[0-9A-Fa-f]{6}$/i.test(hex)) {
        console.error(`Código hexadecimal inválido: ${hex}`);
        return null;
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
};

// Función para mostrar un toast de mensaje
const showToast = (message, color = "#4caf50") => {
    const toast = document.createElement("div");
    toast.innerText = message;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.padding = "15px 20px";
    toast.style.backgroundColor = color;
    toast.style.color = "#fff";
    toast.style.fontSize = "1rem";
    toast.style.borderRadius = "5px";
    toast.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    toast.style.transform = "translateY(20px)";
    document.body.appendChild(toast);

    // Mostrar el toast
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    }, 100);

    // Ocultar el toast después de 3 segundos
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Función para cargar colores guardados desde el backend
const loadSavedColors = async () => {
    try {
        const response = await fetch("http://127.0.0.1:9000/get_colors");
        const data = await response.json();
        colorList = data.colors; // Actualizamos la lista local con los datos del backend
        updateColorList(); // Actualizamos la interfaz
    } catch (error) {
        console.error("Error al cargar los colores guardados:", error);
    }
};

// Función para actualizar dinámicamente la lista en el diálogo
const updateColorList = () => {
    const dialog = document.querySelector("dialog");
    dialog.innerHTML = `
        <div style="text-align: center; margin-bottom: 1rem;">
            <h3 style="font-size: 1.8rem; font-weight: 600; margin: 0; color: #333;">Lista de Colores Favoritos</h3>
        </div>
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.9rem;">
                <thead style="background-color: #f7f7f7;">
                    <tr>
                        <th>Color</th>
                        <th>Código Hex</th>
                        <th>Valor RGB</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    ${colorList
                        .map((color, index) => {
                            const rgbColor = hexToRgb(color.hex_code);
                            return `
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 10px; text-align: center;">
                                        <span style="display: inline-block; width: 30px; height: 30px; background-color: ${color.hex_code}; border: 1px solid #ddd; border-radius: 50%;"></span>
                                    </td>
                                    <td style="padding: 10px; text-align: center; color: #555;">${color.hex_code}</td>
                                    <td style="padding: 10px; text-align: center; color: #555;">${rgbColor}</td>
                                    <td style="padding: 10px; text-align: center;">
                                        <button 
                                            style="
                                                padding: 5px 10px; 
                                                font-size: 0.8rem; 
                                                color: #fff; 
                                                background-color: #ff4d4d; 
                                                border: none; 
                                                border-radius: 4px; 
                                                cursor: pointer;
                                                transition: background-color 0.3s ease;"
                                            onclick="deleteColor(${index})">
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>`;
                        })
                        .join("")}
                </tbody>
            </table>
        </div>
        <div style="text-align: center; margin-top: 1.5rem;">
            <button id="close-dialog" style="
                padding: 10px 20px; 
                font-size: 1rem; 
                color: #fff; 
                background-color: #007bff; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer; 
                transition: background-color 0.3s ease;">
                Cerrar
            </button>
        </div>
    `;
    document.getElementById("close-dialog").addEventListener("click", () => dialog.close());
};

// Función para eliminar un color del backend
const deleteColor = async (index) => {
    try {
        const colorToDelete = colorList[index];
        if (!colorToDelete?.id) {
            console.error("ID inválido para el color:", colorToDelete);
            return;
        }

        const response = await fetch(`http://127.0.0.1:9000/delete_color/${colorToDelete.id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error(`Error al eliminar el color: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        console.log(result.message);

        // Actualizamos la lista local y la interfaz
        colorList.splice(index, 1);
        updateColorList();

        // Mostrar toast de éxito al eliminar
        showToast("Color eliminado exitosamente.", "#ff4d4d");
    } catch (error) {
        console.error("Error al eliminar el color:", error);
    }
};

// Función para guardar un nuevo color en el backend
const saveColorToBackend = async (hexCode, rgbValue) => {
    try {
        const response = await fetch("http://127.0.0.1:9000/save_color", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hex_code: hexCode, rgb_value: rgbValue }),
        });

        const data = await response.json();
        if (data.id) {
            console.log("Color guardado con ID:", data.id);
            colorList.push({ id: data.id, hex_code: hexCode, rgb_value: rgbValue });
            updateColorList();

            // Mostrar toast de éxito al guardar
            showToast("Color guardado exitosamente en favoritos.");
        }
    } catch (error) {
        console.error("Error al guardar el color:", error);
    }
};

// Función para generar un color aleatorio
const getcolor = () => {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
    if (!colorHistory.includes(randomColor)) {
        colorHistory.push(randomColor);
        currentIndex++;
    }
    applyColor(randomColor);
};

// Aplicar el color generado
const applyColor = (color) => {
    const rgbColor = hexToRgb(color);
    document.body.style.backgroundColor = color;
    document.getElementById("color-code").innerText = color;
    document.getElementById("color-rgb").innerText = rgbColor;

    const buttons = document.querySelectorAll(".btn");
    buttons.forEach((button) => {
        button.style.backgroundColor = color;
        button.style.color = getContrastColor(color);
    });
};

// Calcular el color de contraste
const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000" : "#fff";
};

// Función para regresar al color anterior
const previousColor = () => {
    if (currentIndex > 0) {
        currentIndex--;
        applyColor(colorHistory[currentIndex]);
    } else {
        console.log("No hay color anterior.");
    }
};

// Función para agregar el color actual a la lista de colores guardados
const addColor = () => {
    const currentColor = document.getElementById("color-code").innerText;
    const rgbColor = hexToRgb(currentColor);

    if (!colorList.some((color) => color.hex_code === currentColor)) {
        saveColorToBackend(currentColor, rgbColor);
    }
};

// Función para mostrar la lista de colores guardados
const showColorList = () => {
    const dialog = document.querySelector("dialog");
    updateColorList();
    if (!dialog.open) {
        dialog.showModal();
    }
};

// Eventos de botones
document.getElementById("btn").addEventListener("click", getcolor);
document.querySelector(".anterior").addEventListener("click", previousColor);
document.querySelector(".agregar").addEventListener("click", addColor);
document.querySelector(".btn-lista").addEventListener("click", showColorList);

// Cargar colores al iniciar
window.onload = () => {
    loadSavedColors();
};
