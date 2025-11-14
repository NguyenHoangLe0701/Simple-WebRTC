import React, { useState, useMemo } from "react";

function Pricing() {
  const [groupSize, setGroupSize] = useState(30);
  const [callMinutes, setCallMinutes] = useState(75);
  const [monthlyCalls, setMonthlyCalls] = useState(3000);
  const [planGroup, setPlanGroup] = useState("large"); // 'large' or 'small'

  // derive pricing from inputs (calculation based on groupSize, callMinutes, monthlyCalls)
  const pricing = useMemo(() => {
    const usageGB = (groupSize * callMinutes * monthlyCalls * 0.0001); // estimated GB usage
    let plan = "Startup";
    let baseRate = 299.0;
    let includedGB = 200;
    let additionalRate = 1.0;

    if (usageGB > 200 && usageGB <= 1000) {
      plan = "Pro";
      baseRate = 649.0;
      includedGB = 1000;
      additionalRate = 0.5;
    } else if (usageGB > 1000) {
      plan = "Premium";
      baseRate = 1099.0;
      includedGB = 4000;
      additionalRate = 0.2;
    }

    const additionalGB = Math.max(0, usageGB - includedGB);
    const totalCost = baseRate + (additionalGB * additionalRate);
    return { plan, baseRate, includedGB, additionalRate, additionalGB, totalCost: totalCost.toFixed(2) };
  }, [groupSize, callMinutes, monthlyCalls]);

  const getRangeStyle = (value, min, max, fill = '#3b82f6', track = '#e6e6e6') => {
    const v = Number(value);
    const pct = Math.round(((v - min) / (max - min)) * 100);
    return { background: `linear-gradient(90deg, ${fill} ${pct}%, ${track} ${pct}%)` };
  };

  // plan data for rendering the cards (large and small groups)
  const largePlans = [
    {
      title: "LARGE GROUP BASIC",
      features: ["React modules", "Video, voice, and screen sharing", "Up to 30 participants", "Securely hosted", "1 GB per month"],
      price: "$3",
      note: "per month",
      extra: "plus $3 per GB",
      button: { label: "Sign up", color: "bg-blue-400" }
    },
    {
      title: "LARGE GROUP STARTUP",
      features: ["React modules", "Video, voice, and screen sharing", "Up to 30 participants", "Support Included", "200 GB per month"],
      price: "$299*",
      note: "per month",
      extra: "plus $1 per additional GB",
      button: { label: "Sign up", color: "bg-blue-400" }
    },
    {
      title: "LARGE GROUP PRO",
      features: ["React modules", "Video, voice, and screen sharing", "Up to 30 participants", "Support Included", "1000 GB per month"],
      price: "$649*",
      note: "per month",
      extra: "plus $0.50 per additional GB",
      button: { label: "Sign up", color: "bg-purple-600" }
    },
    {
      title: "LARGE GROUP PREMIUM",
      features: ["React modules", "Video, voice, and screen sharing", "Up to 30 participants", "Support Included", "4000 GB per month"],
      price: "$1099*",
      note: "per month",
      extra: "plus $0.20 per additional GB",
      button: { label: "Sign up", color: "bg-blue-400" }
    }
  ];

  const smallPlans = [
    {
      title: "SMALL GROUP BASIC",
      features: ["React modules", "Up to 6 participants", "End-to-end encryption for audio & video", "Video, voice, and screen sharing", "1 GB per month"],
      price: "$5",
      note: "per month",
      extra: "plus $5 per GB",
      button: { label: "Sign up", color: "bg-blue-400" }
    },
    {
      title: "SMALL GROUP STARTUP",
      features: ["React modules", "Video, voice, and screen sharing", "Up to 6 participants", "End-to-end encryption for audio & video", "100 GB per month"],
      price: "$199*",
      note: "per month",
      extra: "plus $3 per additional GB",
      button: { label: "Sign up", color: "bg-blue-400" }
    },
    {
      title: "SMALL GROUP PRO",
      features: ["React modules", "Video, voice, and screen sharing", "Up to 6 participants", "End-to-end encryption for audio & video", "350 GB per month"],
      price: "$599*",
      note: "per month",
      extra: "plus $1.80 per additional GB",
      button: { label: "Sign up", color: "bg-purple-600" }
    },
    {
      title: "SMALL GROUP PREMIUM",
      features: ["React modules", "Video, voice, and screen sharing", "Up to 6 participants", "End-to-end encryption for audio & video", "1000 GB per month"],
      price: "$949*",
      note: "per month",
      extra: "plus $0.50 per additional GB",
      button: { label: "Sign up", color: "bg-blue-400" }
    }
  ];

  return (
    <section id="pricing" className="min-h-screen py-16 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-4">Which plan is best for me?</h2>
        <p className="text-center text-gray-600 mb-3">We'll recommend the most affordable plan for you based on estimated usage.</p>
        <p className="text-center text-blue-600 mb-8">
          You can always <a href="http://accounts.simplewebrtc.com" className="underline">get started for free</a> anytime.
        </p>

        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
          <div className="mb-6">
            <p className="font-semibold mb-3">Select the features you need:</p>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="hipaa" className="h-5 w-5 accent-blue-500" />
                <span className="text-gray-700">HIPAA Compliance</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="e2ee" className="h-5 w-5 accent-blue-500" />
                <span className="text-gray-700">End-to-End Encryption</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="small" className="h-5 w-5 accent-blue-500" />
                <span className="text-gray-700">Small Groups (up to 6 people)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="large" defaultChecked className="h-5 w-5 accent-blue-500" />
                <span className="text-gray-700">Large Groups (7-30 people)</span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Average Group Size</span>
                  <span className="font-medium">{groupSize}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={groupSize}
                  onChange={(e) => setGroupSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer styled-range"
                  style={getRangeStyle(groupSize, 1, 30)}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Average Call Minutes</span>
                  <span className="font-medium">{callMinutes}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={callMinutes}
                  onChange={(e) => setCallMinutes(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer styled-range"
                  style={getRangeStyle(callMinutes, 5, 90)}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Average Monthly Calls</span>
                  <span className="font-medium">{monthlyCalls}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="3000"
                  step="50"
                  value={monthlyCalls}
                  onChange={(e) => setMonthlyCalls(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer styled-range"
                  style={getRangeStyle(monthlyCalls, 50, 3000)}
                />
              </div>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-xl md:text-2xl font-semibold text-gray-800">
              We recommend the <span className="text-purple-600">{pricing.plan}</span> plan for <span className="text-gray-700">Large Groups</span>
            </p>
            <p className="text-2xl md:text-3xl font-extrabold mt-3 text-gray-800">
              Your estimated total monthly cost is
              <span className="text-purple-600 ml-2">${pricing.totalCost}</span>
            </p>
            <p className="text-center text-gray-600 mt-3">
              Base Rate: <span className="font-semibold">${pricing.baseRate.toFixed(2)}</span> per month &nbsp;•&nbsp;
              Includes <span className="font-semibold">{pricing.includedGB}</span> GB &nbsp;•&nbsp;
              Additional bandwidth billed at <span className="font-semibold">${pricing.additionalRate}</span> per GB
            </p>
          </div>
        </div>
                {/* Plans cards section (static visual) */}
        <div className="mt-12">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">SimpleWebRTC plans and pricing</h3>
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-gray-200 rounded-full p-1">
              <button
                onClick={() => setPlanGroup('large')}
                className={`px-6 py-2 rounded-full font-medium ${planGroup === 'large' ? 'bg-purple-600 text-white' : 'text-gray-600'}`}>
                Large-Group
              </button>
              <button
                onClick={() => setPlanGroup('small')}
                className={`px-6 py-2 rounded-full font-medium ${planGroup === 'small' ? 'bg-purple-600 text-white' : 'text-gray-600'}`}>
                Small-Group
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {(planGroup === 'large' ? largePlans : smallPlans).map((p, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-sm text-center">
                <h4 className="text-lg font-semibold mb-4">{p.title}</h4>
                <ul className="text-sm text-gray-600 mb-6 space-y-2">
                  {p.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
                <div className="text-2xl font-bold mb-2">{p.price} <span className="text-sm font-normal">{p.note}</span></div>
                <div className="text-sm text-gray-500 mb-4">{p.extra}</div>
                <button className={`${p.button.color} text-white px-5 py-2 rounded-full`}>{p.button.label}</button>
              </div>
            ))}
          </div>
        </div>
        
        {/* small note (annual prices) + CTA + Detailed pricing copy (lower section) */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">* annual prices shown</p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xl md:text-2xl">Looking for a custom plan? Need help with development?</p>
          <p className="text-lg text-blue-600 mt-2"><a href="/contact" className="underline">Drop us a line</a> to discuss additional options.</p>
        </div>

        <div className="mt-10 border-t border-gray-200" />

        <div className="mt-10 max-w-3xl mx-auto text-gray-700 space-y-6">
          <h3 className="text-3xl font-semibold text-center text-gray-800">We believe our pricing is simple and fair. Why?</h3>
          <p>
            We don’t charge per minute or per stream like some competitors. <span className="bg-purple-100 rounded px-1">We just charge for the bandwidth you use because it’s a good indicator that you’re using and getting value out of the whole thing that we made.</span> In reality, we don’t even charge for all of your usage, because only ~40% of WebRTC calls need a server relay to connect people behind firewalls—the rest are peer-to-peer.
          </p>

          <p>
            When you’re successful, we want your success to increase. We don’t want you to build a long-term relationship with us and then feel beholden as we take a constant, sizable chunk out of your business forever. <span className="bg-purple-100 rounded px-1">So we charge enough to be able to give you our attention when you need it the most—at the beginning—and our rates get dramatically cheaper as you scale.</span>
          </p>

          <p>
            You’re smart enough to know that, relatively speaking, servers are cheap. You know bandwidth is cheap. <span className="bg-purple-100 rounded px-1">What isn’t cheap is people who know a lot and care a lot</span> and spend years investing in building the best software they can. We’re so proud of our team’s work.
          </p>

          <p>
            More than anything, <span className="bg-purple-100 rounded px-1">we’re invested in the success of each company using SimpleWebRTC.</span>
          </p>

          <p>
            We’re a small bootstrapped company. We don’t want a million faceless customers. We don’t care about having a huge slice of the market. We’re never going to dominate like our friends at Twilio or Tokbox. We’re just not that kind of company, and that’s okay.
          </p>

          <p>
            Our pricing is designed to encourage people who are making heavy use of SimpleWebRTC to move to higher base level plans that give you much more bandwidth at lower fees.
          </p>

          <p>
            Here’s <span className="underline">our pricing promise</span> to you:
          </p>
          <ul className="list-disc ml-6 text-gray-600">
            <li>You can upgrade or downgrade anytime based on the usage you need.</li>
          </ul>

          <p>
            We want to sell to the kind of people who want to know the folks who make the software they depend on. <span className="bg-purple-100 rounded px-1">We want to be part of your team.</span>
          </p>

          <h4 className="text-3xl md:text-4xl font-extrabold text-center mt-6">But it doesn’t matter what we think. It matters what you think.</h4>

          <p className="text-center text-gray-600">
            And we’d love to hear from you. If you have feedback or thoughts on our pricing, <a href="/contact" className="text-blue-600 underline">we’re all ears</a>.
          </p>
        </div>


      </div>
    </section>
  );
}

export default Pricing;