import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function App() {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
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
          if (error.name !== "NotFoundException") {
            console.warn("QR Scan error:", error);
          }
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
    if (!productId || !quantity || !sellingPrice) {
      alert("⚠️ Please enter all required fields.");
      return;
    }

    try {
      console.log(API_BASE_URL);
      const res = await axios.post(`${API_BASE_URL}/transactions/billingTranction`, {
        productId,
        quantity: parseInt(quantity),
        sellingPrice: parseFloat(sellingPrice),
      });

      if (res.data.sucess) {
        alert("✅ Purchase recorded successfully.");
        setProductId("");
        setQuantity("");
        setSellingPrice("");
        startScanner();
      } else {
        alert("❌ Failed to submit purchase.");
      }
    } catch (err) {
      alert("❌ Error submitting purchase: " + err.message);
    }
  };

  const styles = {
    container: {
      maxWidth: "500px",
      margin: "40px auto",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      backgroundColor: "#fff",
      fontFamily: "Arial, sans-serif",
    },
    title: {
      textAlign: "center",
      marginBottom: "20px",
      color: "#333",
    },
    reader: {
      width: "100%",
      margin: "0 auto 20px",
    },
    label: {
      fontWeight: "bold",
      marginBottom: "6px",
      display: "block",
    },
    input: {
      width: "100%",
      padding: "10px",
      marginBottom: "15px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      fontSize: "16px",
    },
    button: {
      width: "100%",
      padding: "12px",
      fontSize: "16px",
      fontWeight: "bold",
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "background 0.3s",
    },
    scannedText: {
      backgroundColor: "#e6f7ff",
      padding: "10px",
      borderRadius: "6px",
      color: "#007bff",
      marginBottom: "20px",
      textAlign: "center",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📦 QR Code Purchase Entry</h2>
      <div id="reader" style={styles.reader}></div>

      {productId && (
        <div>
          <div style={styles.scannedText}>
            ✅ Product Scanned: <strong>{productId}</strong>
          </div>

          <label style={styles.label}>Quantity:</label>
          <input
            type="number"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min={1}
            style={styles.input}
          />

          <label style={styles.label}>Selling Price (per unit):</label>
          <input
            type="number"
            placeholder="Enter selling price"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            step="0.01"
            min={0}
            style={styles.input}
          />

          <button style={styles.button} onClick={handleSubmit}>
            Submit Purchase
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
