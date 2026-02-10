"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type TruckScannerProps = {
  truckId: string;
};

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
};

type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

function getBarcodeDetectorCtor() {
  if (typeof window === "undefined") return null;
  return (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector ?? null;
}

export function TruckScanner({ truckId }: TruckScannerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
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

  const scanFrame = async () => {
    const video = videoRef.current;
    const detector = detectorRef.current;

    if (!video || !detector) return;

    try {
      const codes = await detector.detect(video);
      const rawValue = codes.find((entry) => typeof entry.rawValue === "string" && entry.rawValue.length > 0)?.rawValue;

      if (rawValue) {
        const destination = routeFromRawValue(rawValue);
        if (!destination) {
          setMessage("Wrong truck QR.");
          return;
        }

        stopScanner();
        router.push(destination);
        return;
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

    const DetectorCtor = getBarcodeDetectorCtor();
    if (!DetectorCtor) {
      setMessage(isAutoStart ? "Tap to enable camera scan." : "Use Chrome on mobile for in-app scan.");
      setIsStarting(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage("Camera access is not available in this browser.");
      setIsStarting(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" }
        },
        audio: false
      });

      streamRef.current = stream;
      const video = videoRef.current;

      if (!video) {
        stopScanner();
        return;
      }

      detectorRef.current = new DetectorCtor({ formats: ["qr_code"] });
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      await video.play();

      setIsScanning(true);
      setIsStarting(false);
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
        <video ref={videoRef} className={`h-full w-full object-cover ${isScanning ? "block" : "hidden"}`} muted />
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
