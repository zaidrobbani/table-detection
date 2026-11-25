"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Area } from "react-easy-crop";
import { toast } from "sonner";
import type { ModelId, PredictResult } from "@/repository/prediksi/dto";
import { usePredict } from "@/repository/prediksi/query";
import {
  hapusFotoBandingkan,
  simpanFotoBandingkan,
} from "@/shared/util/foto-bandingkan";
import { fileToDataUrl, siapkanUnggahan } from "@/shared/util/image";
import {
  CROP,
  HASIL,
  type LangkahDeteksi,
  MODEL_DEFAULT,
  OPASITAS_AWAL,
} from "../data";
import { cropKeBlob } from "../util/crop-to-blob";
import {
  bisaDitampilkan,
  isHeic,
  pilihFileTunggal,
} from "../util/validate-file";

type PerModel<T> = Partial<Record<ModelId, T>>;

/** Logika halaman Demo: pilih -> crop -> hasil, dengan cache hasil per model. */
export const useDeteksiContainer = () => {
  const prediksi = usePredict();
  const { mutateAsync } = prediksi;

  const [langkah, setLangkah] = useState<LangkahDeteksi>("pilih");
  const [fileAsli, setFileAsli] = useState<File | null>(null);
  const [sumberCrop, setSumberCrop] = useState<string | null>(null);
  const [sibukCrop, setSibukCrop] = useState(false);

  const [blob, setBlob] = useState<Blob | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [model, setModel] = useState<ModelId>(MODEL_DEFAULT);
  const [hasil, setHasil] = useState<PerModel<PredictResult>>({});
  const [galat, setGalat] = useState<PerModel<string>>({});
  const [memuat, setMemuat] = useState<PerModel<boolean>>({});
  const [opasitas, setOpasitas] = useState(OPASITAS_AWAL);

  /** Penanda sesi: respons dari foto lama diabaikan setelah reset. */
  const sesi = useRef(0);

  // URL objek untuk cropper; dilepas saat berganti atau unmount.
  useEffect(() => {
    if (!fileAsli) {
      setSumberCrop(null);
      return;
    }
    const url = URL.createObjectURL(fileAsli);
    setSumberCrop(url);
    return () => URL.revokeObjectURL(url);
  }, [fileAsli]);

  const reset = useCallback(() => {
    sesi.current += 1;
    setLangkah("pilih");
    setFileAsli(null);
    setBlob(null);
    setFotoUrl(null);
    setModel(MODEL_DEFAULT);
    setHasil({});
    setGalat({});
    setMemuat({});
    setOpasitas(OPASITAS_AWAL);
    setSibukCrop(false);
    hapusFotoBandingkan();
  }, []);

  const minta = useCallback(
    async (target: ModelId, berkas: Blob, id: number) => {
      setMemuat((m) => ({ ...m, [target]: true }));
      setGalat((g) => ({ ...g, [target]: undefined }));
      try {
        const res = await mutateAsync({ file: berkas, model: target });
        if (id !== sesi.current) return;
        setHasil((h) => ({ ...h, [target]: res }));
      } catch (e) {
        if (id !== sesi.current) return;
        const pesan =
          e instanceof Error && e.message ? e.message : HASIL.galatUmum;
        setGalat((g) => ({ ...g, [target]: pesan }));
      } finally {
        if (id === sesi.current) setMemuat((m) => ({ ...m, [target]: false }));
      }
    },
    [mutateAsync],
  );

  const mulaiAnalisis = useCallback(
    (berkas: Blob) => {
      sesi.current += 1;
      const id = sesi.current;
      setBlob(berkas);
      setFotoUrl(null);
      setHasil({});
      setGalat({});
      setMemuat({});
      setModel(MODEL_DEFAULT);
      setLangkah("hasil");
      fileToDataUrl(berkas)
        .then((url) => {
          if (id === sesi.current) setFotoUrl(url);
        })
        .catch(() => toast.error("Foto asli gagal ditampilkan."));
      void minta(MODEL_DEFAULT, berkas, id);
    },
    [minta],
  );

  /**
   * Masuk ke langkah crop. HEIC/HEIF yang tidak bisa ditampilkan browser
   * (Chrome/Firefox) langsung dikirim utuh tanpa crop; API mendukung HEIC.
   */
  const terimaFile = useCallback(
    async (file: File) => {
      if (isHeic(file) && !(await bisaDitampilkan(file))) {
        try {
          // HEIC > 4 MB yang tak bisa didekode browser ditolak dengan pesan ramah.
          const siap = await siapkanUnggahan(file);
          toast.info(CROP.heicLewati);
          mulaiAnalisis(siap);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : CROP.gagalProses);
        }
        return;
      }
      setFileAsli(file);
      setLangkah("crop");
    },
    [mulaiAnalisis],
  );

  const pilihDaftar = useCallback(
    (daftar: ArrayLike<File>) => {
      const hasilPilih = pilihFileTunggal(daftar);
      if ("galat" in hasilPilih) {
        toast.error(hasilPilih.galat);
        return;
      }
      void terimaFile(hasilPilih.file);
    },
    [terimaFile],
  );

  const pilihContoh = useCallback(
    (file: File) => pilihDaftar([file]),
    [pilihDaftar],
  );

  const galatContoh = useCallback((pesan: string) => toast.error(pesan), []);

  const batalCrop = useCallback(() => {
    setFileAsli(null);
    setLangkah("pilih");
  }, []);

  const analisisCrop = useCallback(
    async (area: Area) => {
      if (!fileAsli) return;
      setSibukCrop(true);
      try {
        mulaiAnalisis(await cropKeBlob(fileAsli, area));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : CROP.gagalProses);
      } finally {
        setSibukCrop(false);
      }
    },
    [fileAsli, mulaiAnalisis],
  );

  /** Kirim foto asli apa adanya, kecuali melebihi 4 MB (lalu diperkecil). */
  const lewatiCrop = useCallback(async () => {
    if (!fileAsli) return;
    setSibukCrop(true);
    try {
      mulaiAnalisis(await siapkanUnggahan(fileAsli));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : CROP.gagalProses);
    } finally {
      setSibukCrop(false);
    }
  }, [fileAsli, mulaiAnalisis]);

  const ubahModel = useCallback(
    (target: ModelId) => {
      setModel(target);
      if (!blob || hasil[target] || memuat[target]) return;
      void minta(target, blob, sesi.current);
    },
    [blob, hasil, memuat, minta],
  );

  const cobaLagi = useCallback(() => {
    if (blob) void minta(model, blob, sesi.current);
  }, [blob, model, minta]);

  const simpanUntukBandingkan = useCallback(() => {
    if (fotoUrl) simpanFotoBandingkan(fotoUrl);
  }, [fotoUrl]);

  return {
    langkah,
    sumberCrop,
    sibukCrop,
    fotoUrl,
    model,
    hasilAktif: hasil[model] ?? null,
    galatAktif: galat[model] ?? null,
    memuatAktif: memuat[model] === true,
    opasitas,
    sedangMemproses: prediksi.isPending,
    setOpasitas,
    pilihDaftar,
    pilihContoh,
    galatContoh,
    batalCrop,
    analisisCrop,
    lewatiCrop,
    ubahModel,
    cobaLagi,
    simpanUntukBandingkan,
    reset,
  };
};
