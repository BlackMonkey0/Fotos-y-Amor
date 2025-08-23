// =========================
// ESCÁNER QR
// =========================
const startScanBtn = document.getElementById('startScanBtn');
const qrResult = document.getElementById('scanned-result');
const qrReaderContainer = document.getElementById('qr-reader');

let html5QrCode = null;
let isScanning = false;

// Función para obtener la cámara trasera (si existe)
async function getBackCamera() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const backCamera = devices.find(device =>
            device.kind === 'videoinput' &&
            device.label.toLowerCase().includes('back')
        );
        return backCamera ? { deviceId: backCamera.deviceId } : null;
    } catch (error) {
        console.warn("No se pudieron listar las cámaras:", error);
        return null;
    }
}

// Iniciar o detener escaneo
startScanBtn.addEventListener('click', async () => {
    if (isScanning && html5QrCode) {
        stopScanning();
        return;
    }

    if (!html5QrCode) html5QrCode = new Html5Qrcode("qr-reader");

    const backCamera = await getBackCamera();
    const constraints = backCamera ? { deviceId: backCamera.deviceId } : { facingMode: "environment" };

    html5QrCode.start(
        constraints,
        { fps: 10, qrbox: 250 },
        decodedText => {
            qrResult.textContent = `Resultado: ${decodedText}`;
            stopScanning();
        },
        errorMessage => console.warn(`Escaneo: ${errorMessage}`)
    ).then(() => {
        qrResult.textContent = "Escaneando...";
        isScanning = true;
    }).catch(err => console.error("Error al iniciar el escáner:", err));
});

async function stopScanning() {
    if (html5QrCode && isScanning) {
        try {
            await html5QrCode.stop();
            isScanning = false;
            qrResult.textContent = "Escáner detenido. Haz clic en 'Iniciar' para escanear nuevamente.";
        } catch (err) {
            console.error("Error al detener el escáner:", err);
        }
    }
}

// =========================
// GALERÍA DE FOTOS
// =========================

// Obtener fotos guardadas o inicializar
let photos = JSON.parse(localStorage.getItem("photos")) || [];

// Función para guardar foto con timestamp
function savePhoto(photoData) {
    const timestamp = new Date().toISOString();
    photos.push({ photo: photoData, timestamp });
    localStorage.setItem("photos", JSON.stringify(photos));
}

// Organizar fotos por año y mes
function organizePhotos() {
    const organized = {};
    photos.forEach(photo => {
        const date = new Date(photo.timestamp);
        const year = date.getFullYear();
        const month = date.toLocaleString('es', { month: 'long' });

        if (!organized[year]) organized[year] = {};
        if (!organized[year][month]) organized[year][month] = [];
        organized[year][month].push(photo);
    });
    return organized;
}

// Renderizar galería en el DOM
function renderGallery() {
    const container = document.getElementById("photoContainer");
    container.innerHTML = "";
    const organized = organizePhotos();

    // Ordenar años descendente
    Object.keys(organized).sort((a,b)=>b-a).forEach(year => {
        const yearDiv = document.createElement("div");
        yearDiv.innerHTML = `<h2>${year}</h2>`;

        // Ordenar meses cronológicamente
        Object.keys(organized[year]).forEach(month => {
            const monthDiv = document.createElement("div");
            monthDiv.innerHTML = `<h3>${month}</h3>`;

            organized[year][month].forEach((photo, index) => {
                const img = document.createElement("img");
                img.src = photo.photo;
                img.classList.add("gallery-photo");
                img.dataset.index = index;
                img.addEventListener("click", () => img.classList.toggle("selected"));
                monthDiv.appendChild(img);
            });

            yearDiv.appendChild(monthDiv);
        });

        container.appendChild(yearDiv);
    });
}

// =========================
// DESCARGA DE FOTOS
// =========================
function downloadSelected() {
    const selected = document.querySelectorAll(".gallery-photo.selected");
    if (selected.length === 0) return alert("Selecciona al menos una foto");

    const zip = new JSZip();
    selected.forEach((img, i) => {
        const base64 = img.src.split(",")[1];
        zip.file(`foto_${i+1}.png`, base64, { base64: true });
    });

    zip.generateAsync({ type: "blob" }).then(content => {
        saveAs(content, "fotos_seleccionadas.zip");
    });
}

// =========================
// BOTONES DE CONTROL
// =========================
document.getElementById("selectAllButton").addEventListener("click", () => {
    document.querySelectorAll(".gallery-photo").forEach(img => img.classList.add("selected"));
});

document.getElementById("downloadButton").addEventListener("click", downloadSelected);

// =========================
// INICIALIZACIÓN
// =========================
document.addEventListener("DOMContentLoaded", renderGallery);

