// Obtener los elementos del DOM
const startScanBtn = document.getElementById('startScanBtn');
const qrResult = document.getElementById('scanned-result');
const qrReaderContainer = document.getElementById('qr-reader');

// Inicializa el escáner QR
let html5QrCode;
let isScanning = false; // Control para saber si estamos escaneando

// Función para obtener la cámara trasera (si está disponible)
async function getBackCamera() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevice = devices.find(device => device.kind === 'videoinput' && device.facing == 'environment');
    return videoDevice ? { deviceId: videoDevice.deviceId } : null;
}

startScanBtn.addEventListener('click', async () => {
    if (isScanning) {
        // Detener el escáner si ya está en funcionamiento
        html5QrCode.stop().then(() => {
            console.log("Escáner detenido");
            isScanning = false; // Cambiar el estado de escaneo
            qrResult.textContent = "Escáner detenido. Haz clic en 'Iniciar' para empezar de nuevo.";
        }).catch((err) => {
            console.error("Error al detener el escáner:", err);
        });
    } else {
        // Si no está escaneando, iniciar el escáner
        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("qr-reader");
        }

        const backCamera = await getBackCamera();
        const constraints = backCamera ? { deviceId: backCamera.deviceId } : { facingMode: "environment" };

        html5QrCode
            .start(
                constraints, // Usar la cámara trasera si está disponible
                {
                    fps: 10, // Cuadros por segundo
                    qrbox: 250 // Tamaño del cuadro de escaneo
                },
                (decodedText) => {
                    // Muestra el texto del QR en el resultado
                    qrResult.textContent = `Resultado: ${decodedText}`;
                    // Detener el escaneo después de leer el QR
                    html5QrCode.stop().then(() => {
                        isScanning = false; // Cambiar el estado de escaneo
                    }).catch((err) => {
                        console.error("Error al detener el escáner:", err);
                    });
                },
                (errorMessage) => {
                    // Mostrar errores en la consola
                    console.warn(`Error durante el escaneo: ${errorMessage}`);
                }
            )
            .then(() => {
                isScanning = true; // Cambiar el estado de escaneo
                qrResult.textContent = "Escaneando...";
            })
            .catch((err) => {
                console.error("Error al iniciar el escáner:", err);
            });
    }
});
