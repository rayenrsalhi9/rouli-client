import React from "react";
import { VehicleCarousel } from "./VehicleCarousel";
import { SolutionFeatures } from "./ui/features-4";

export const SolutionSection: React.FC = () => {
  return (
    <section id="section-solution-bike" className="w-full bg-surface">
      <SolutionFeatures />
      <div className="mx-auto w-full max-w-page px-4 pb-20 sm:pb-24 md:px-6">
        <VehicleCarousel />
      </div>
    </section>
  );
};
