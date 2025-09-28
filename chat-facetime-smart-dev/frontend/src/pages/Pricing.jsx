import React, { useState, useEffect } from "react";

function Pricing() {
  const [groupSize, setGroupSize] = useState(30);
  const [callMinutes, setCallMinutes] = useState(75);
  const [monthlyCalls, setMonthlyCalls] = useState(3000);

  // Tính toán băng thông và chi phí mỗi khi state thay đổi
  const calculateBandwidth = () => {
    const usageGB = (groupSize * callMinutes * monthlyCalls * 0.0001); // Ước tính sử dụng GB
    let plan = "Startup";
    let baseRate = 299.00;
    let includedGB = 200;
    let additionalRate = 1.00;

    if (usageGB > 200 && usageGB <= 1000) {
      plan = "Pro";
      baseRate = 649.00;
      includedGB = 1000;
      additionalRate = 0.50;
    } else if (usageGB > 1000) {
      plan = "Premium";
      baseRate = 1099.00;
      includedGB = 4000;
      additionalRate = 0.20;
    }

    const additionalGB = Math.max(0, usageGB - includedGB);
    const totalCost = baseRate + (additionalGB * additionalRate);
    return { plan, baseRate, includedGB, additionalRate, additionalGB, totalCost: totalCost.toFixed(2) };
  };

  // Sử dụng useEffect để cập nhật khi state thay đổi
  const [pricing, setPricing] = useState(calculateBandwidth());

  useEffect(() => {
    setPricing(calculateBandwidth());
  }, [groupSize, callMinutes, monthlyCalls]);

  return (
    <section id="pricing" className="min-h-screen py-10 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Which plan is best for me?</h2>
        <p className="text-center text-gray-600 mb-6">We'll recommend the most affordable plan for you based on estimated usage.</p>
        <p className="text-center text-blue-600 mb-6">
          You can always <a href="http://accounts.simplewebrtc.com" className="underline">get started for free</a> anytime.
        </p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <p className="font-semibold mb-2">Select the features you need:</p>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="hipaa" className="form-checkbox h-5 w-5 text-blue-600" />
                <span className="text-gray-700">HIPAA Compliance</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="e2ee" className="form-checkbox h-5 w-5 text-blue-600" />
                <span className="text-gray-700">End-to-End Encryption</span>
              </label>
            </div>
            <div className="flex space-x-4 mt-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="small" className="form-checkbox h-5 w-5 text-blue-600" />
                <span className="text-gray-700">Small Groups (up to 6 people)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="large" defaultChecked className="form-checkbox h-5 w-5 text-blue-600" />
                <span className="text-gray-700">Large Groups (7-30 people)</span>
              </label>
            </div>
          </div>
          <div className="mb-6">
            <div className="flex flex-col space-y-6 md:flex-row md:space-y-0 md:space-x-4">
              <div className="w-full">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Average Group Size</span>
                  <span>{groupSize}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={groupSize}
                  onChange={(e) => setGroupSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="w-full">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Average Call Minutes</span>
                  <span>{callMinutes}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={callMinutes}
                  onChange={(e) => setCallMinutes(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="w-full">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Average Monthly Calls</span>
                  <span>{monthlyCalls}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="3000"
                  step="50"
                  value={monthlyCalls}
                  onChange={(e) => setMonthlyCalls(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800">
              We recommend the <span className="text-blue-600">{pricing.plan}</span> plan for Large Groups
            </p>
            <p className="text-lg font-semibold text-gray-800 mt-2">
              Your estimated total monthly cost is $<span className="text-purple-600">{pricing.totalCost}</span>
            </p>
            <p className="text-center text-gray-600 mt-2">
              Base Rate: $<span className="font-semibold">{pricing.baseRate.toFixed(2)}</span> per month<br />
              Includes <span className="font-semibold">{pricing.includedGB}</span> GB<br />
              Additional bandwidth billed at $<span className="font-semibold">{pricing.additionalRate}</span> per GB
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Pricing;