"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type TruckScannerProps = {
  truckId: string;
};

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
};

type JsQrDecoder = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options?: { inversionAttempts?: "dontInvert" | "onlyInvert" | "attemptBoth" | "invertFirst" }
) => { data: string } | null;

type BarcodeDetectorCtor = {
  new (options?: { formats?: string[] }): BarcodeDetectorLike;
  getSupportedFormats?: () => Promise<string[]>;
};

const JSQR_SCRIPT_ID = "jsqr-cdn-loader";
const JSQR_CDN_URL = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js";

function getBarcodeDetectorCtor() {
  if (typeof window === "undefined") return null;
  return (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector ?? null;
}

function getJsQrDecoder() {
  if (typeof window === "undefined") return null;
  const decoder = (window as unknown as { jsQR?: JsQrDecoder }).jsQR;
  return typeof decoder === "function" ? decoder : null;
}

export function TruckScanner({ truckId }: TruckScannerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
  const jsQrRef = useRef<JsQrDecoder | null>(null);
  const jsQrLoaderRef = useRef<Promise<JsQrDecoder | null> | null>(null);
  const scanEngineRef = useRef<"barcode-detector" | "jsqr" | null>(null);
  const autoStartAttemptedRef = useRef(false);

  const [isScanning, setIsScanning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const stopScanner = () => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    const video = videoRef.current;
    if (video) {
      video.pause();
      video.srcObject = null;
    }

    detectorRef.current = null;
    scanEngineRef.current = null;
    setIsScanning(false);
    setIsStarting(false);
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  const routeFromRawValue = (rawValue: string) => {
    try {
      const parsed = new URL(rawValue, window.location.origin);
      if (parsed.origin !== window.location.origin) return null;
      const requiredSegment = `/truck/${truckId}/item/`;
      const segmentIndex = parsed.pathname.indexOf(requiredSegment);
      if (segmentIndex < 0) return null;

      const routePath = parsed.pathname.slice(segmentIndex);
      return `${routePath}${parsed.search}${parsed.hash}`;
    } catch {
      return null;
    }
  };

  const ensureScanCanvas = (video: HTMLVideoElement) => {
    if (!scanCanvasRef.current) {
      scanCanvasRef.current = document.createElement("canvas");
    }

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const canvas = scanCanvasRef.current;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    return canvas;
  };

  const loadJsQrDecoder = async () => {
    if (jsQrRef.current) return jsQrRef.current;

    const existingDecoder = getJsQrDecoder();
    if (existingDecoder) {
      jsQrRef.current = existingDecoder;
      return existingDecoder;
    }

    if (jsQrLoaderRef.current) return jsQrLoaderRef.current;

    jsQrLoaderRef.current = new Promise<JsQrDecoder | null>((resolve) => {
      const resolveDecoder = () => {
        const decoder = getJsQrDecoder();
        jsQrRef.current = decoder;
        resolve(decoder);
      };

      const existingScript = document.getElementById(JSQR_SCRIPT_ID) as HTMLScriptElement | null;
      if (existingScript) {
        if (existingScript.dataset.loaded === "true") {
          resolveDecoder();
          return;
        }
        if (existingScript.dataset.failed === "true") {
          resolve(null);
          return;
        }

        existingScript.addEventListener("load", resolveDecoder, { once: true });
        existingScript.addEventListener("error", () => resolve(null), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = JSQR_SCRIPT_ID;
      script.src = JSQR_CDN_URL;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.addEventListener(
        "load",
        () => {
          script.dataset.loaded = "true";
          resolveDecoder();
        },
        { once: true }
      );
      script.addEventListener(
        "error",
        () => {
          script.dataset.failed = "true";
          resolve(null);
        },
        { once: true }
      );
      document.head.appendChild(script);
    }).finally(() => {
      jsQrLoaderRef.current = null;
    });

    return jsQrLoaderRef.current;
  };

  const scanFrame = async () => {
    const video = videoRef.current;
    if (!video || !scanEngineRef.current) return;

    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      frameRef.current = window.requestAnimationFrame(() => {
        void scanFrame();
      });
      return;
    }

    try {
      const canvas = ensureScanCanvas(video);
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        throw new Error("Canvas 2D context unavailable");
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      let rawValue: string | undefined;

      if (scanEngineRef.current === "barcode-detector" && detectorRef.current) {
        const codes = await detectorRef.current.detect(canvas);
        rawValue = codes.find((entry) => typeof entry.rawValue === "string" && entry.rawValue.length > 0)?.rawValue;
      } else if (scanEngineRef.current === "jsqr" && jsQrRef.current) {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const result = jsQrRef.current(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth"
        });
        rawValue = result?.data;
      }

      if (rawValue) {
        const destination = routeFromRawValue(rawValue);
        if (!destination) {
          setMessage("Wrong truck QR.");
        } else {
          stopScanner();
          router.push(destination);
          return;
        }
      }
    } catch {
      setMessage((current) => current ?? "Unable to read that QR code yet. Keep it centered and try again.");
    }

    frameRef.current = window.requestAnimationFrame(() => {
      void scanFrame();
    });
  };

  const startScanner = async (isAutoStart = false) => {
    if (isScanning || isStarting) return;

    setMessage(null);
    setIsStarting(true);

    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage("Camera access is not available in this browser.");
      setIsStarting(false);
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" }
          },
          audio: false
        });
      } catch {
        // iOS Safari can reject advanced constraints; retry with minimal constraints.
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;
      const video = videoRef.current;

      if (!video) {
        stopScanner();
        return;
      }

      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.setAttribute("playsinline", "true");
      video.setAttribute("autoplay", "true");
      video.setAttribute("muted", "true");
      await video.play();

      detectorRef.current = null;
      scanEngineRef.current = null;
      const DetectorCtor = getBarcodeDetectorCtor();
      if (DetectorCtor) {
        try {
          const supportedFormats = (await DetectorCtor.getSupportedFormats?.()) ?? [];
          const detectorOptions =
            supportedFormats.length > 0 && supportedFormats.includes("qr_code")
              ? { formats: ["qr_code"] }
              : undefined;
          detectorRef.current = new DetectorCtor(detectorOptions);
          scanEngineRef.current = "barcode-detector";
        } catch {
          detectorRef.current = null;
        }
      }

      if (!scanEngineRef.current) {
        const jsQrDecoder = await loadJsQrDecoder();
        if (jsQrDecoder) {
          jsQrRef.current = jsQrDecoder;
          scanEngineRef.current = "jsqr";
        }
      }

      setIsScanning(true);
      setIsStarting(false);

      if (!scanEngineRef.current) {
        setMessage(
          "Camera is on, but QR decoding failed to load. Check network access and try again."
        );
        return;
      }

      frameRef.current = window.requestAnimationFrame(() => {
        void scanFrame();
      });
    } catch {
      setMessage(isAutoStart ? "Tap to allow camera." : "Camera access is required.");
      stopScanner();
    }
  };

  useEffect(() => {
    if (autoStartAttemptedRef.current) return;
    autoStartAttemptedRef.current = true;
    void startScanner(true);
  }, []);

  return (
    <section className="flex h-full flex-col rounded-2xl border border-brand.blue/15 bg-brand.white p-4 shadow-card">
      <p className="text-sm font-semibold text-brand.blue/80">Scan QR</p>

      <div className="mt-2 min-h-0 flex-1 overflow-hidden rounded-xl border border-brand.blue/15 bg-slate-100">
        <video
          ref={videoRef}
          className={`h-full w-full object-cover ${isScanning ? "block" : "hidden"}`}
          muted
          playsInline
          autoPlay
        />
        {!isScanning ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-brand.blue/55">
            {isStarting ? "Starting camera..." : "Camera preview"}
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex gap-3">
        {!isScanning ? (
          <button
            type="button"
            onClick={() => void startScanner(false)}
            className="flex-1 rounded-xl bg-brand.blue px-4 py-3 text-base font-semibold text-brand.white disabled:opacity-60"
            disabled={isStarting}
          >
            {isStarting ? "Starting..." : "Enable Camera"}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopScanner}
            className="flex-1 rounded-xl bg-brand.red px-4 py-3 text-base font-semibold text-brand.white"
          >
            Stop Scan
          </button>
        )}
      </div>

      {message ? <p className="mt-2 text-sm text-brand.red">{message}</p> : null}
    </section>
  );
}
