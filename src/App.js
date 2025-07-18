import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

function App() {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [scannerRunning, setScannerRunning] = useState(false);
  const scannerRef = useRef(null);

  const startScanner = async () => {
    const qrCodeScanner = new Html5Qrcode("reader");

    try {
      await qrCodeScanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          try {
            const parsed = JSON.parse(decodedText);
            setProductId(parsed.productId);
            stopScanner();
          } catch {
            alert("❌ Invalid QR Code format.");
          }
        },
        (error) => {
          console.warn("QR Scan error:", error);
        }
      );
      scannerRef.current = qrCodeScanner;
      setScannerRunning(true);
    } catch (err) {
      console.error("❌ Scanner start failed:", err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRunning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        setScannerRunning(false);
      } catch (err) {
        console.warn("⚠️ Cannot stop scanner:", err.message);
      }
    }
  };

  useEffect(() => {
    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const handleSubmit = async () => {
    if (!productId || !quantity) {
      alert("⚠️ Please enter both product ID and quantity.");
      return;
    }

    try {
      const res = await fetch("https://your-backend.com/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: parseInt(quantity) }),
      });

      if (res.ok) {
        alert("✅ Purchase recorded successfully.");
        setProductId("");
        setQuantity("");
        startScanner(); // Restart scanner after successful submission
      } else {
        alert("❌ Failed to submit purchase.");
      }
    } catch (err) {
      alert("🚫 Network or server error.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 QR Code Purchase Entry</h2>
      <div id="reader" style={{ width: "300px", marginBottom: "20px" }}></div>

      {productId && (
        <div>
          <p>✅ Product Scanned: <strong>{productId}</strong></p>
          <input
            type="number"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <br /><br />
          <button onClick={handleSubmit}>Submit Purchase</button>
        </div>
      )}
    </div>
  );
}

export default App;
