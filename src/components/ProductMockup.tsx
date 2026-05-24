"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

type ProductType = "tshirt" | "hoodie";
type ProductColor = "white" | "black";

interface ProductMockupProps {
  onImageChange?: (imageData: string | null) => void;
}

export default function ProductMockup({ onImageChange }: ProductMockupProps) {
  const [productType, setProductType] = useState<ProductType>("tshirt");
  const [productColor, setProductColor] = useState<ProductColor>("white");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const productImages: Record<ProductType, Record<ProductColor, string>> = {
    tshirt: {
      white: "/tshirt-white.png",
      black: "/tshirt-black.png",
    },
    hoodie: {
      white: "/hoodie-white.png",
      black: "/hoodie-black.png",
    },
  };

  // Usar imagens existentes como fallback
  const getCurrentProductImage = () => {
    if (productType === "hoodie") {
      return productColor === "white" ? "/moletom.png" : "/moletom.png";
    }
    return productColor === "white" ? "/oversized.png" : "/oversized.png";
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setUploadedImage(imageData);
        setImagePosition({ x: 0, y: 0 });
        setImageScale(1);
        onImageChange?.(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (!uploadedImage) return;
    setIsDragging(true);
    setDragStart({
      x: event.clientX - imagePosition.x,
      y: event.clientY - imagePosition.y,
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging || !uploadedImage) return;
    setImagePosition({
      x: event.clientX - dragStart.x,
      y: event.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleScaleChange = (delta: number) => {
    setImageScale((prev) => Math.max(0.1, Math.min(3, prev + delta)));
  };

  const resetImage = () => {
    setUploadedImage(null);
    setImagePosition({ x: 0, y: 0 });
    setImageScale(1);
    onImageChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2">
          <span className="text-sm font-black uppercase text-neutral-700">Produto:</span>
          <select
            value={productType}
            onChange={(e) => setProductType(e.target.value as ProductType)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-bold"
          >
            <option value="tshirt">Camiseta</option>
            <option value="hoodie">Moletom</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="text-sm font-black uppercase text-neutral-700">Cor:</span>
          <select
            value={productColor}
            onChange={(e) => setProductColor(e.target.value as ProductColor)}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-bold"
          >
            <option value="white">Branca</option>
            <option value="black">Preta</option>
          </select>
        </label>
      </div>

      <div
        ref={containerRef}
        className="relative aspect-square w-full max-w-md overflow-hidden rounded-lg border border-neutral-300 bg-neutral-100"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Image
          src={getCurrentProductImage()}
          alt={`${productType} ${productColor}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 400px"
        />

        {uploadedImage && (
          <div
            className="absolute cursor-move"
            style={{
              left: "50%",
              top: "50%",
              transform: `translate(calc(-50% + ${imagePosition.x}px), calc(-50% + ${imagePosition.y}px)) scale(${imageScale})`,
              width: "150px",
              height: "150px",
            }}
            onMouseDown={handleMouseDown}
          >
            <img
              src={uploadedImage}
              alt="Upload"
              className="h-full w-full object-contain"
              draggable={false}
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md bg-black px-4 py-2 text-sm font-black uppercase text-white transition-colors hover:bg-neutral-800"
          >
            Upload Imagem
          </button>
        </label>

        {uploadedImage && (
          <>
            <button
              type="button"
              onClick={() => handleScaleChange(0.1)}
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-black uppercase transition-colors hover:bg-neutral-100"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => handleScaleChange(-0.1)}
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-black uppercase transition-colors hover:bg-neutral-100"
            >
              -
            </button>
            <button
              type="button"
              onClick={resetImage}
              className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-black uppercase text-red-600 transition-colors hover:bg-red-50"
            >
              Remover
            </button>
          </>
        )}
      </div>

      {uploadedImage && (
        <p className="text-xs font-medium text-neutral-500">
          Arraste a imagem para posicionar • Use +/− para redimensionar
        </p>
      )}
    </div>
  );
}
