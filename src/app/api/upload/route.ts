import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { isAuthenticated } from "@/lib/auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    let canWriteFs = true;
    try {
      if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
      }
    } catch {
      canWriteFs = false;
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (files.length > 4) {
      return NextResponse.json({ error: "Máximo de 4 imagens por produto" }, { status: 400 });
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: `Arquivo "${file.name}" não é uma imagem` }, { status: 400 });
      }

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: `Arquivo "${file.name}" excede 5 MB` }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      if (canWriteFs) {
        const ext = file.name.split(".").pop() || "png";
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const filePath = path.join(UPLOAD_DIR, safeName);
        await writeFile(filePath, buffer);
        urls.push(`/uploads/${safeName}`);
      } else {
        const base64 = buffer.toString("base64");
        urls.push(`data:${file.type};base64,${base64}`);
      }
    }

    return NextResponse.json({ urls }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao fazer upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
