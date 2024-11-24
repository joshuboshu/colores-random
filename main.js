let colorHistory = []; // Almacenará los colores generados
let currentIndex = -1; // Índice del color actual en el historial
let colorList = []; // Almacenará los colores que quieres guardar

// Función para convertir un código hexadecimal a RGB
const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
};

const getcolor = () => {
    // Generar código hexadecimal aleatorio
    const randomNumber = Math.floor(Math.random() * 16777215);
    const randomCode = "#" + randomNumber.toString(16);

    // Agregar el color actual al historial
    if (currentIndex === -1 || colorHistory[currentIndex] !== randomCode) {
        colorHistory.push(randomCode);
        currentIndex++;
    }

    // Aplicar el color
    applyColor(randomCode);
};

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

    // Copiar el código al portapapeles
    navigator.clipboard.writeText(color);
};

// Función para calcular el color de contraste (blanco o negro)
const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Luminosidad relativa
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Si la luminosidad es alta, usa texto negro; si es baja, usa blanco
    return luminance > 0.5 ? "#000" : "#fff";
};

// Función para regresar al color anterior
const previousColor = () => {
    if (currentIndex > 0) {
        currentIndex--;
        const previousColor = colorHistory[currentIndex];
        applyColor(previousColor);
    }
};

// Función para agregar el color actual a colorList
const addColor = () => {
    const currentColor = document.getElementById("color-code").innerText;
    if (!colorList.includes(currentColor)) {
        colorList.push(currentColor);
        console.log("Colores guardados:", colorList); // Mostrar en consola el historial de colores guardados
        updateColorList(); // Actualizar el dialog con los colores guardados
    }
};

// Función para actualizar dinámicamente la lista en el dialog
const updateColorList = () => {
    const dialog = document.querySelector("dialog");
    dialog.innerHTML = `
        <h3>Lista de Colores Favoritos</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr>
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Color</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Código Hex</th>
                    <th style="border: 1px solid #000; padding: 8px; text-align: left;">Valor RGB</th>
                </tr>
            </thead>
            <tbody>
                ${colorList
                    .map((color) => {
                        const rgbColor = hexToRgb(color); // Calculamos el valor RGB
                        return `
                            <tr>
                                <td style="border: 1px solid #000; padding: 8px;">
                                    <span style="display: inline-block; width: 20px; height: 20px; background-color: ${color}; border: 1px solid #000;"></span>
                                </td>
                                <td style="border: 1px solid #000; padding: 8px;">${color}</td>
                                <td style="border: 1px solid #000; padding: 8px;">${rgbColor}</td>
                            </tr>`;
                    })
                    .join("")}
            </tbody>
        </table>
        <button id="close-dialog" style="margin-top: 10px; padding: 8px 12px; cursor: pointer;">Cerrar</button>
    `;


    // Agregar funcionalidad para cerrar el diálogo
    document.getElementById("close-dialog").addEventListener("click", () => {
        dialog.close();
    });
};


// Mostrar el dialog al hacer clic en "Agregar"
const showColorList = () => {
    const dialog = document.querySelector("dialog");
    if (!dialog.open) {
        dialog.showModal();
    }
};

// Llamada al evento
document.getElementById("btn").addEventListener("click", getcolor);
document.querySelector(".anterior").addEventListener("click", previousColor);
document.querySelector(".agregar").addEventListener("click", addColor);
document.querySelector(".agregar").addEventListener("click", showColorList);
document.querySelector(".btn-lista").addEventListener("click", showColorList);

// Llamada inicial
getcolor();
