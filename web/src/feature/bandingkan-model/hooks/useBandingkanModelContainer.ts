"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { pilihFileTunggal } from "@/feature/deteksi/util/validate-file";
import { useCompare } from "@/repository/prediksi/query";
import {
  bacaFotoBandingkan,
  hapusFotoBandingkan,
  simpanFotoBandingkan,
} from "@/shared/util/foto-bandingkan";
import {
  dataUrlToFile,
  fileToDataUrl,
  siapkanUnggahan,
} from "@/shared/util/image";
import { FOTO } from "../data";

const namaBerkas = (dataUrl: string) => {
  const jenis = /^data:image\/([a-z0-9.+-]+)/i.exec(dataUrl)?.[1] ?? "png";
  return `meja.${jenis === "jpeg" ? "jpg" : jenis}`;
};

/** Logika halaman Bandingkan: ambil foto tersimpan lalu panggil /compare. */
export const useBandingkanModelContainer = () => {
  const { mutate, reset, data, error, isPending } = useCompare();
  const [siap, setSiap] = useState(false);
  const [foto, setFoto] = useState<string | null>(null);
  /** Foto yang sudah dikirim, supaya efek tidak mengirim dua kali. */
  const terkirim = useRef<string | null>(null);

  // Baca foto dari sessionStorage/memori hanya di klien setelah mount.
  useEffect(() => {
    setFoto(bacaFotoBandingkan());
    setSiap(true);
  }, []);

  useEffect(() => {
    if (!foto || terkirim.current === foto) return;
    terkirim.current = foto;
    mutate({ file: dataUrlToFile(foto, namaBerkas(foto)) });
  }, [foto, mutate]);

  const terimaFile = useCallback(async (file: File) => {
    try {
      // Perkecil dulu bila > 4 MB (batas body Vercel) sebelum dikirim/disimpan.
      const url = await fileToDataUrl(await siapkanUnggahan(file));
      simpanFotoBandingkan(url);
      setFoto(url);
    } catch (e) {
      toast.error(
        e instanceof Error && e.message
          ? e.message
          : "Foto gagal dibaca. Coba foto lain.",
      );
    }
  }, []);

  const pilihDaftar = useCallback(
    (daftar: ArrayLike<File>) => {
      const hasil = pilihFileTunggal(daftar);
      if ("galat" in hasil) {
        toast.error(hasil.galat);
        return;
      }
      void terimaFile(hasil.file);
    },
    [terimaFile],
  );

  const galatContoh = useCallback((pesan: string) => toast.error(pesan), []);

  const gantiFoto = useCallback(() => {
    hapusFotoBandingkan();
    terkirim.current = null;
    reset();
    setFoto(null);
  }, [reset]);

  const cobaLagi = useCallback(() => {
    if (foto) mutate({ file: dataUrlToFile(foto, namaBerkas(foto)) });
  }, [foto, mutate]);

  return {
    siap,
    foto,
    hasil: data ?? null,
    memuat: isPending,
    galat: error ? error.message || FOTO.galatUmum : null,
    pilihDaftar,
    pilihContoh: terimaFile,
    galatContoh,
    gantiFoto,
    cobaLagi,
  };
};
