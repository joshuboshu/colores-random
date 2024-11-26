// main.js

// Historial de colores generados
let colorHistory = [];
let currentIndex = -1;  // Índice del color actual
let colorList = [];  // Lista para almacenar los colores guardados

// Función para convertir un código hexadecimal a RGB
const hexToRgb = (hex) => {
    // Verificar si el color es una cadena válida
    if (typeof hex !== 'string' || !/^#[0-9A-Fa-f]{6}$/i.test(hex)) {
        console.error(`Invalid hex code: ${hex}`); // Mostrar mensaje si es inválido
        return null;  // Retornar null si el código no es válido
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    console.log(`hexToRgb(${hex}) => rgb(${r}, ${g}, ${b})`);  // Debug log
    return `rgb(${r}, ${g}, ${b})`;
};

// Función para obtener colores guardados desde el backend
const loadSavedColors = async () => {
    try {
        console.log("Fetching saved colors from backend..."); // Debug log
        const response = await fetch('http://127.0.0.1:9000/get_colors');
        const data = await response.json();
        console.log("Backend colors response:", data);  // Debug log

        const savedColors = data.colors;
        savedColors.forEach(color => {
            console.log(`Color Guardado: ${color.hex_code} - ${color.rgb_value}`);  // Debug log
        });

        // Guardar los colores en localStorage (si no existen ya)
        localStorage.setItem('savedColors', JSON.stringify(savedColors));
        updateColorList(savedColors); // Mostrar los colores en la lista
    } catch (error) {
        console.error('Error al cargar los colores guardados:', error);
    }
};

// Función para actualizar dinámicamente la lista en el dialog
const updateColorList = (colors = colorList) => {
    console.log("Updating color list:", colors);  // Debug log
    const dialog = document.querySelector("dialog");

    // Asegurarnos de que cada color sea un código hexadecimal válido
    const validColors = colors.filter(color => {
        if (typeof color === 'string' && /^#[0-9A-Fa-f]{6}$/i.test(color)) {
            return true;
        } else if (color.hex_code && color.rgb_value) {
            // Si es un objeto con hex_code y rgb_value, lo consideramos válido también
            return /^#[0-9A-Fa-f]{6}$/i.test(color.hex_code);
        }
        return false;
    });

    console.log("Valid colors:", validColors); // Debug log

    dialog.innerHTML = `
    <div style="text-align: center; margin-bottom: 1rem;">
        <h3 style="font-size: 1.8rem; font-weight: 600; margin: 0; color: #333;">Lista de Colores Favoritos</h3>
    </div>
    <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.9rem;">
            <thead style="background-color: #f7f7f7;">
                <tr>
                    <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: left;">Color</th>
                    <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: left;">Código Hex</th>
                    <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: left;">Valor RGB</th>
                    <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: left;">Acción</th>
                </tr>
            </thead>
            <tbody>
                ${validColors
            .map((color, index) => {
                const hex = color.hex_code || color;
                const rgbColor = hexToRgb(hex);
                return `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 10px; text-align: center;">
                                    <span style="display: inline-block; width: 30px; height: 30px; background-color: ${hex}; border: 1px solid #ddd; border-radius: 50%;"></span>
                                </td>
                                <td style="padding: 10px; text-align: center; color: #555;">${hex}</td>
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

    // Añadir evento para cerrar el diálogo
    document.getElementById("close-dialog").addEventListener("click", () => dialog.close());

};

const deleteColor = async (index) => {
    try {
        // Recuperar los colores guardados
        const savedColors = JSON.parse(localStorage.getItem('savedColors')) || [];

        // Verificar si el índice es válido
        if (index < 0 || index >= savedColors.length) {
            console.error(`Índice fuera de rango: ${index}`);
            return;
        }

        const colorToDelete = savedColors[index];

        // Verificar si el color tiene un ID válido
        if (!colorToDelete?.id) {
            console.error("El color a eliminar no tiene un ID válido:", colorToDelete);
            return;
        }

        // Enviar solicitud DELETE al backend
        const response = await fetch(`http://127.0.0.1:9000/delete_color/${colorToDelete.id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error(`Error al eliminar el color: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        console.log(result.message); // Mensaje de éxito del backend

        // Actualizar la lista local y la vista
        removeColorFromLocalStorage(index);
    } catch (error) {
        console.error("Error al eliminar el color:", error.message || error);
    }
};

// Función para actualizar el localStorage y la vista
const removeColorFromLocalStorage = (index) => {
    const savedColors = JSON.parse(localStorage.getItem('savedColors')) || [];
    savedColors.splice(index, 1); // Eliminar el color del array

    // Actualizar el almacenamiento local
    localStorage.setItem('savedColors', JSON.stringify(savedColors));

    // Actualizar la vista del modal o cualquier interfaz
    updateColorList(savedColors);
};


// Función para guardar un nuevo color
const saveColorToBackend = async (hexCode, rgbValue) => {
    try {
        const response = await fetch("http://127.0.0.1:9000/save_color", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                hex_code: hexCode,
                rgb_value: rgbValue,
            }),
        });

        const data = await response.json();
        if (data.id) {
            console.log("ID del color guardado:", data.id); // Depuración

            // Guardar el color con ID en localStorage
            let savedColors = JSON.parse(localStorage.getItem('savedColors')) || [];
            savedColors.push({ id: data.id, hex_code: hexCode, rgb_value: rgbValue });
            localStorage.setItem('savedColors', JSON.stringify(savedColors));
        }
    } catch (error) {
        console.error("Error al guardar el color:", error);
    }
};



// Función para generar un color aleatorio y aplicar los cambios
const getcolor = () => {
    const randomNumber = Math.floor(Math.random() * 16777215);
    const randomCode = "#" + randomNumber.toString(16);
    console.log("Generated random color:", randomCode); // Debug log

    // Guardar el color en el historial
    if (currentIndex === -1 || colorHistory[currentIndex] !== randomCode) {
        colorHistory.push(randomCode);
        currentIndex++;
    }

    applyColor(randomCode);
};

// Aplicar el color generado a la página
const applyColor = (color) => {
    // Cambiar el color de fondo del cuerpo
    document.body.style.backgroundColor = color;

    // Actualizar el texto con el código de color
    document.getElementById("color-code").innerText = color;

    // Calcular y actualizar el texto con el valor RGB
    const rgbColor = hexToRgb(color);
    document.getElementById("color-rgb").innerText = rgbColor;

    // Cambiar el color de los botones
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach(button => {
        button.style.backgroundColor = color;
        button.style.color = getContrastColor(color); // Asegura contraste para texto
    });

    // Guardar el color al backend
    saveColorToBackend(color, rgbColor);

    // Guardar el color en localStorage (temporal)
    let savedColors = JSON.parse(localStorage.getItem('savedColors')) || [];
    console.log("Current saved colors in localStorage before update:", savedColors); // Debug log
    if (!savedColors.includes(color)) {
        savedColors.push(color);
        localStorage.setItem('savedColors', JSON.stringify(savedColors));
    }
};

// Función para calcular el color de contraste (blanco o negro)
const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    console.log(`Contrast color for ${hexColor} => luminance: ${luminance}`); // Debug log
    return luminance > 0.5 ? "#000" : "#fff"; // Si la luminosidad es alta, usa negro, si no usa blanco
};

// Función para regresar al color anterior
const previousColor = () => {
    if (currentIndex > 0) {
        currentIndex--;
        const previousColor = colorHistory[currentIndex];
        applyColor(previousColor);
    } else {
        console.log("No hay color anterior.");
    }
};

// Función para agregar el color actual a la lista de colores guardados
const addColor = () => {
    const currentColor = document.getElementById("color-code").innerText;
    const rgbColor = hexToRgb(currentColor);

    if (!colorList.includes(currentColor)) {
        colorList.push(currentColor);
        saveColorToBackend(currentColor, rgbColor);  // Guardar en el backend
        updateColorList();  // Actualizar el dialog con los colores guardados
    }
};

// Función para mostrar la lista de colores cuando se haga clic en el botón "Lista"
const showColorList = () => {
    const dialog = document.querySelector("dialog");

    // Log para ver lo que está pasando al hacer clic en "Lista"
    console.log("Opening color list modal...");

    // Recuperar los colores guardados en localStorage
    let savedColors = JSON.parse(localStorage.getItem('savedColors')) || [];
    console.log("Saved colors from localStorage:", savedColors); // Debug log

    // Si hay colores guardados, los mostramos
    if (savedColors.length > 0) {
        updateColorList(savedColors);
    } else {
        console.log("No saved colors in localStorage."); // Debug log
        // Si no hay colores en localStorage, cargamos desde el backend
        loadSavedColors();
    }

    if (!dialog.open) {
        dialog.showModal();
    }
};

// Llamadas a eventos de los botones
document.getElementById("btn").addEventListener("click", getcolor);
document.querySelector(".anterior").addEventListener("click", previousColor);
document.querySelector(".agregar").addEventListener("click", addColor);
document.querySelector(".agregar").addEventListener("click", showColorList);
document.querySelector(".btn-lista").addEventListener("click", showColorList);

// Cargar los colores guardados al iniciar
window.onload = () => {
    loadSavedColors();  // Cargar colores del backend y localStorage
};
