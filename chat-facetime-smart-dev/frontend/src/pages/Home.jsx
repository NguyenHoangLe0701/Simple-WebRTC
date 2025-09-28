import React from "react";

import Hero from "../components/Hero";
import Features from "../components/Features";
import SectionLight from "../components/SectionLight";
import SectionInfo from "../components/SectionInfo";
import SectionRequirements from "../components/SectionRequirements";
import SectionPricing from "../components/SectionPricing";
import SectionCallToAction from "../components/SectionCallToAction";
import SectionNewsletter from "../components/SectionNewsletter";


function Home() {
  return (
    <>
     
      <Hero />
      <Features />
      <SectionLight />
      <SectionInfo/>
      <SectionRequirements />
      <SectionPricing />
      <SectionCallToAction />
      <SectionNewsletter />
    </>
  );
}

export default Home;
