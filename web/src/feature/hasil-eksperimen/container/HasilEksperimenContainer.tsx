"use client";

import PageHero from "@/shared/component/PageHero";
import DaftarIsiNav from "../component/DaftarIsiNav";
import useHasilEksperimenContainer from "../hooks/useHasilEksperimenContainer";
import ConfusionSection from "../section/ConfusionSection";
import EfekClaheSection from "../section/EfekClaheSection";
import EksperimenASection from "../section/EksperimenASection";
import GaleriGradcamSection from "../section/GaleriGradcamSection";
import KurvaTrainingSection from "../section/KurvaTrainingSection";
import MetodeSection from "../section/MetodeSection";
import MetrikSection from "../section/MetrikSection";
import RingkasanSection from "../section/RingkasanSection";
import UjiStatistikSection from "../section/UjiStatistikSection";

const HasilEksperimenContainer = () => {
  const d = useHasilEksperimenContainer();

  return (
    <div className="page-container py-8 sm:py-12">
      <PageHero
        eyebrow="Hasil · Model B vs C"
        title="Hasil eksperimen: tanpa PCD melawan CLAHE"
        description="Perbandingan model B (tanpa pengolahan citra, P0) dan model C (CLAHE, P1) pada set Testing. Semua angka berasal dari berkas hasil notebook; data yang belum ada ditandai kosong."
      />
      <div className="mt-8 grid gap-8 lg:grid-cols-[11rem_minmax(0,1fr)]">
        <aside>
          <DaftarIsiNav />
        </aside>
        <div className="flex min-w-0 flex-col gap-8">
          <RingkasanSection metrics={d.metrics} />
          <MetrikSection metrics={d.metrics} />
          <ConfusionSection confusion={d.confusion} />
          <UjiStatistikSection stats={d.stats} />
          <KurvaTrainingSection history={d.history} />
          <EfekClaheSection clahe={d.clahe} />
          <GaleriGradcamSection figures={d.figures} />
          <EksperimenASection data={d.eksperimenA} />
          <MetodeSection />
        </div>
      </div>
    </div>
  );
};

export default HasilEksperimenContainer;
